import type { PrinterRepository } from '../repositories/db/PrinterRepository';
import type {
	PrintJobFilter,
	PrintJobListItem,
	PrintJobRepository
} from '../repositories/db/PrintJobRepository';
import type { SettingsRepository } from '../repositories/db/SettingsRepository';
import type { OrderItemRecord, OrderRecord, PrinterRecord } from '../repositories/db/types';
import { ticketToText, type Ticket } from '../repositories/printer/ticket';
import { parseStoredTemplate } from '$lib/print/template';
import { DomainError, notFound } from './errors';
import { checkedTemplate } from './SettingsService';
import type { PrintWorker } from './PrintWorker';
import type { TicketService } from './TicketService';

export type PrinterStatus = PrinterRecord & {
	pendingJobs: number;
	reachable: boolean | null;
};

export type PrintJobView = PrintJobListItem & { preview: string };

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
			[...byPrinter].map(([printerId, printerItems]) => ({
				kind: 'order' as const,
				orderId: order.id,
				printerId,
				payload: JSON.stringify(
					this.tickets.orderTicket({
						template,
						eventName,
						order,
						items: printerItems,
						createdByName,
						printerName: this.printers.get(printerId)?.name ?? ''
					})
				)
			})),
			this.now()
		);
	}

	/** Call after the transaction that queued jobs has committed. */
	wake() {
		this.worker.kick();
	}

	enqueueTest(printerId: number) {
		if (!this.printers.get(printerId)) notFound('Drucker');
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
		return this.printers.list().map((printer) => ({
			...printer,
			pendingJobs: pending.get(printer.id) ?? 0,
			reachable: reachability(printer)
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
		this.printJobs.enqueue(
			[{ kind: job.kind, orderId: job.orderId, printerId: target, payload: job.payload }],
			this.now()
		);
		this.worker.kick(target);
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
	return { ...job, preview: ticketToText(JSON.parse(job.payload) as Ticket) };
}

function reachability(printer: PrinterRecord): boolean | null {
	if (!printer.lastSuccessAt && !printer.lastErrorAt) return null;
	// A successful print clears `lastError`, so it is only set while the printer is failing.
	return printer.lastError === null;
}
