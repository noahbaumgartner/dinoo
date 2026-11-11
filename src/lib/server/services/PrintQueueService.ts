import type { PrinterRepository } from '../repositories/db/PrinterRepository';
import type {
	PrintJobFilter,
	PrintJobListItem,
	PrintJobRepository
} from '../repositories/db/PrintJobRepository';
import type { SettingsRepository } from '../repositories/db/SettingsRepository';
import type { OrderItemRecord, OrderRecord, PrinterRecord } from '../repositories/db/types';
import { ticketToText, withRedirectHint, type Ticket } from '../repositories/printer/ticket';
import { parseStoredTemplate } from '$lib/print/template';
import { DomainError, notFound } from './errors';
import { checkedTemplate } from './SettingsService';
import type { PrintWorker } from './PrintWorker';
import type { TicketService } from './TicketService';

export type PrinterStatus = PrinterRecord & {
	pendingJobs: number;
	reachable: boolean | null;
	/** Name of the printer this one is redirected to, null without a redirect. */
	redirectTargetName: string | null;
};

export type PrintJobView = PrintJobListItem & {
	preview: string;
	/** Station the ticket was meant for, if it was redirected to `printerName`. */
	redirectedFrom: string | null;
};

/** Payload of a job moved away from `station`, with the «FÜR: …» hint on top. */
export function redirectPayload(payload: string, station: string): string {
	return JSON.stringify(withRedirectHint(JSON.parse(payload) as Ticket, station));
}

/** Everything that goes onto paper passes through here and into the persistent queue. */
export class PrintQueueService {
	constructor(
		private readonly printJobs: PrintJobRepository,
		private readonly printers: PrinterRepository,
		private readonly settings: SettingsRepository,
		private readonly tickets: TicketService,
		private readonly worker: Pick<PrintWorker, 'kick'>,
		private readonly now: () => Date = () => new Date()
	) {}

	/** One job per effective printer; items without a printer are not printed. */
	enqueueOrder(order: OrderRecord, items: OrderItemRecord[], createdByName: string) {
		const byPrinter = new Map<number, OrderItemRecord[]>();
		for (const item of items) {
			if (item.printerId === null) continue;
			byPrinter.set(item.printerId, [...(byPrinter.get(item.printerId) ?? []), item]);
		}
		const eventName = this.settings.get('eventName');
		const template = parseStoredTemplate(this.settings.get('ticketTemplate'));
		this.printJobs.enqueue(
			[...byPrinter].map(([printerId, printerItems]) => {
				const printer = this.printers.get(printerId);
				return {
					kind: 'order' as const,
					orderId: order.id,
					...this.route(
						printerId,
						this.tickets.orderTicket({
							template,
							eventName,
							order,
							items: printerItems,
							createdByName,
							printerName: printer?.name ?? ''
						})
					)
				};
			}),
			this.now()
		);
	}

	/** Call after the transaction that queued jobs has committed. */
	wake() {
		this.worker.kick();
	}

	enqueueTest(printerId: number) {
		const printer = this.printers.get(printerId) ?? notFound('Drucker');
		this.notRedirected(printer);
		const ticket = this.tickets.testTicket();
		this.printJobs.enqueue(
			[{ kind: 'test', orderId: null, printerId, payload: JSON.stringify(ticket) }],
			this.now()
		);
		this.worker.kick(printerId);
	}

	/** Template test print (F11): the template as it is in the editor, with the sample order. */
	enqueueTemplateTest(printerId: number, template: unknown, serviceName: string) {
		const printer = this.printers.get(printerId) ?? notFound('Drucker');
		if (!printer.active) throw new DomainError('Dieser Drucker ist deaktiviert.');
		this.notRedirected(printer);
		const ticket = this.tickets.templateTestTicket({
			template: checkedTemplate(template),
			eventName: this.settings.get('eventName'),
			serviceName,
			printerName: printer.name,
			at: this.now()
		});
		this.printJobs.enqueue(
			[{ kind: 'test', orderId: null, printerId, payload: JSON.stringify(ticket) }],
			this.now()
		);
		this.worker.kick(printerId);
	}

	printerStatuses(): PrinterStatus[] {
		const pending = this.printJobs.countPendingByPrinter();
		const printers = this.printers.list();
		const names = new Map(printers.map((printer) => [printer.id, printer.name]));
		return printers.map((printer) => ({
			...printer,
			pendingJobs: pending.get(printer.id) ?? 0,
			reachable: reachability(printer),
			redirectTargetName:
				printer.redirectToPrinterId === null
					? null
					: (names.get(printer.redirectToPrinterId) ?? null)
		}));
	}

	list(filter: PrintJobFilter): PrintJobView[] {
		return this.printJobs.list(filter).map(withPreview);
	}

	listByOrder(orderId: number): PrintJobView[] {
		return this.printJobs.listByOrder(orderId).map(withPreview);
	}

	countPending(): number {
		return this.printJobs.countPending();
	}

	cancel(jobId: number) {
		if (!this.printJobs.cancel(jobId))
			throw new DomainError('Nur wartende Druckaufträge können abgebrochen werden.', 409);
	}

	/** Puts a copy of any job back into the queue, e.g. when a ticket got lost in the kitchen. */
	reprint(jobId: number, printerId?: number) {
		const job = this.printJobs.get(jobId) ?? notFound('Druckauftrag');
		const target = printerId ?? job.printerId;
		this.activePrinter(target);
		const routed = this.route(target, JSON.parse(job.payload) as Ticket);
		this.printJobs.enqueue([{ kind: job.kind, orderId: job.orderId, ...routed }], this.now());
		this.worker.kick(routed.printerId);
	}

	/**
	 * Redirects a printer (F05): its queued jobs move to `targetId` right away, in their order, and
	 * new jobs go there too until the redirect is lifted. Jobs that are printing right now finish on
	 * the source; if they fail, the print worker moves them as well, so nothing is printed twice.
	 */
	redirect(sourceId: number, targetId: number): number {
		const source = this.printers.get(sourceId) ?? notFound('Drucker');
		const target = this.printers.get(targetId) ?? notFound('Drucker');
		if (source.id === target.id)
			throw new DomainError('Ein Drucker kann nicht auf sich selbst umgeleitet werden.');
		if (!target.active) throw new DomainError(`Drucker «${target.name}» ist deaktiviert.`);
		if (target.redirectToPrinterId !== null)
			throw new DomainError(
				`Drucker «${target.name}» ist selbst umgeleitet und kann kein Ziel sein.`
			);
		const sources = this.printers.list().filter((p) => p.redirectToPrinterId === source.id);
		if (sources.length > 0)
			throw new DomainError(
				`Auf «${source.name}» ist ${sources.map((p) => `«${p.name}»`).join(', ')} umgeleitet. ` +
					'Bitte zuerst diese Umleitung aufheben.'
			);
		this.printers.setRedirect(source.id, target.id, this.now());
		const moved = this.printJobs.reassignQueued(source.id, target.id, (payload) =>
			redirectPayload(payload, source.name)
		);
		this.worker.kick(target.id);
		return moved;
	}

	/** Lifts a redirect; new jobs go to the printer itself again, moved jobs stay at the target. */
	clearRedirect(printerId: number) {
		const printer = this.printers.get(printerId) ?? notFound('Drucker');
		if (printer.redirectToPrinterId === null) return;
		this.printers.setRedirect(printer.id, null, null);
		this.worker.kick(printer.id);
	}

	/** Printer and payload for a new job, following an active redirect. */
	private route(printerId: number, ticket: Ticket) {
		const printer = this.printers.get(printerId);
		if (printer?.redirectToPrinterId != null)
			return {
				printerId: printer.redirectToPrinterId,
				payload: JSON.stringify(withRedirectHint(ticket, printer.name))
			};
		return { printerId, payload: JSON.stringify(ticket) };
	}

	/** Test prints check the printer itself, so they make no sense while it is redirected. */
	private notRedirected(printer: PrinterRecord) {
		if (printer.redirectToPrinterId !== null)
			throw new DomainError(
				`Drucker «${printer.name}» ist umgeleitet. Bitte zuerst die Umleitung aufheben.`,
				409
			);
	}

	/** Cancels everything still waiting (used before switching the database). */
	cancelAllPending(): number {
		let count = 0;
		for (const job of this.printJobs.list({ status: 'queued', limit: 100000 })) {
			if (this.printJobs.cancel(job.id)) count += 1;
		}
		return count;
	}

	private activePrinter(id: number): PrinterRecord {
		const printer = this.printers.get(id) ?? notFound('Drucker');
		if (!printer.active) throw new DomainError(`Drucker «${printer.name}» ist deaktiviert.`);
		return printer;
	}
}

function withPreview(job: PrintJobListItem): PrintJobView {
	const ticket = JSON.parse(job.payload) as Ticket;
	return { ...job, preview: ticketToText(ticket), redirectedFrom: ticket.redirectedFrom ?? null };
}

function reachability(printer: PrinterRecord): boolean | null {
	if (!printer.lastSuccessAt && !printer.lastErrorAt) return null;
	// A successful print clears `lastError`, so it is only set while the printer is failing.
	return printer.lastError === null;
}
