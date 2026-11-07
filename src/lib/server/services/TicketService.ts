import {
	renderTemplate,
	sampleTicketData,
	type TicketData,
	type TicketTemplate
} from '$lib/print/template';
import type { OrderItemRecord, OrderRecord } from '../repositories/db/types';
import { TICKET_WIDTH, wrapText, type Ticket } from '../repositories/printer/ticket';
import { JOKES } from './jokes';

/** Builds the tickets that go into the print queue. */
export class TicketService {
	constructor(private readonly random: () => number = Math.random) {}

	/**
	 * Kitchen ticket for one printer, laid out by the print template (F11): only the items that are
	 * prepared there, no hint about items on other printers (decision in F03).
	 */
	orderTicket(input: {
		template: TicketTemplate;
		eventName: string | null;
		order: OrderRecord;
		items: OrderItemRecord[];
		createdByName: string;
		printerName: string;
	}): Ticket {
		const data: TicketData = {
			eventName: input.eventName,
			orderNumber: input.order.orderNumber,
			tableLabel: input.order.tableLabel,
			createdAt: input.order.createdAt,
			serviceName: input.createdByName,
			printerName: input.printerName,
			items: input.items.map((item) => ({
				quantity: item.quantity,
				articleName: item.articleName,
				note: item.note
			}))
		};
		return renderTemplate(input.template, data).ticket;
	}

	/** Template test print (F11): the given template filled with the sample order. */
	templateTestTicket(input: {
		template: TicketTemplate;
		eventName: string | null;
		serviceName: string;
		printerName: string;
		at: Date;
	}): Ticket {
		const data = sampleTicketData({ ...input, now: input.at });
		return renderTemplate(input.template, data).ticket;
	}

	/** Printer test (F05): the title and a random joke, nothing else. */
	testTicket(): Ticket {
		const joke = JOKES[Math.floor(this.random() * JOKES.length)];
		return {
			lines: [
				{ type: 'text', text: 'Testdruck', width: 2, height: 2, align: 'center' },
				{ type: 'rule' },
				...wrapText(joke, TICKET_WIDTH).map((text) => ({ type: 'text' as const, text })),
				{ type: 'feed' }
			]
		};
	}
}
