import type { OrderItemRecord, OrderRecord, PrinterRecord } from '../repositories/db/types';
import type { Ticket, TicketLine } from '../repositories/printer/ticket';

const dateTime = new Intl.DateTimeFormat('de-CH', {
	day: '2-digit',
	month: '2-digit',
	year: 'numeric',
	hour: '2-digit',
	minute: '2-digit'
});

/** Builds the tickets that go into the print queue. */
export class TicketService {
	/**
	 * Kitchen ticket for one printer: only the items that are prepared there, no hint about items on
	 * other printers (decision in F03).
	 */
	orderTicket(input: {
		eventName: string | null;
		order: OrderRecord;
		items: OrderItemRecord[];
		createdByName: string;
	}): Ticket {
		const { eventName, order, items, createdByName } = input;
		const lines: TicketLine[] = [];
		if (eventName) lines.push({ type: 'text', text: eventName, align: 'center' });
		lines.push(
			{ type: 'text', text: `Bestellung ${order.orderNumber}`, size: 'large', align: 'center' },
			{
				type: 'text',
				text: `Tisch ${order.tableLabel}`,
				size: 'large',
				align: 'center',
				bold: true
			},
			{ type: 'text', text: dateTime.format(order.createdAt), align: 'center' },
			{ type: 'rule' }
		);
		for (const item of items) {
			lines.push({ type: 'text', text: `${item.quantity} x ${item.articleName}`, bold: true });
		}
		if (order.note) {
			lines.push({ type: 'rule' }, { type: 'text', text: `Notiz: ${order.note}` });
		}
		lines.push(
			{ type: 'rule' },
			{ type: 'text', text: `Aufgenommen von: ${createdByName}` },
			{ type: 'feed' }
		);
		return { lines };
	}

	testTicket(input: { eventName: string | null; printer: PrinterRecord; at: Date }): Ticket {
		return {
			lines: [
				{ type: 'text', text: 'Testdruck', size: 'large', align: 'center' },
				...(input.eventName
					? [{ type: 'text' as const, text: input.eventName, align: 'center' as const }]
					: []),
				{ type: 'rule' },
				{ type: 'pair', left: 'Drucker', right: input.printer.name },
				{ type: 'pair', left: 'Adresse', right: `${input.printer.host}:${input.printer.port}` },
				{ type: 'pair', left: 'Modell', right: input.printer.model },
				{ type: 'pair', left: 'Zeit', right: dateTime.format(input.at) },
				{ type: 'rule' },
				{ type: 'text', text: 'Umlaute: ä ö ü Ä Ö Ü é è à', align: 'center' },
				{ type: 'feed' }
			]
		};
	}
}
