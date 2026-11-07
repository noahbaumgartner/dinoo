import type { OrderItemRecord, OrderRecord } from '../repositories/db/types';
import { TICKET_WIDTH, type Ticket, type TicketLine } from '../repositories/printer/ticket';
import { JOKES, wrapText } from './jokes';

const dateTime = new Intl.DateTimeFormat('de-CH', {
	day: '2-digit',
	month: '2-digit',
	year: 'numeric',
	hour: '2-digit',
	minute: '2-digit'
});

/** Builds the tickets that go into the print queue. */
export class TicketService {
	constructor(private readonly random: () => number = Math.random) {}

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
			if (item.note) lines.push({ type: 'text', text: `  > ${item.note}` });
		}
		lines.push(
			{ type: 'rule' },
			{ type: 'text', text: `Aufgenommen von: ${createdByName}` },
			{ type: 'feed' }
		);
		return { lines };
	}

	/** Printer test (F05): the title and a random joke, nothing else. */
	testTicket(): Ticket {
		const joke = JOKES[Math.floor(this.random() * JOKES.length)];
		return {
			lines: [
				{ type: 'text', text: 'Testdruck', size: 'large', align: 'center' },
				{ type: 'rule' },
				...wrapText(joke, TICKET_WIDTH).map((text) => ({ type: 'text' as const, text })),
				{ type: 'feed' }
			]
		};
	}
}
