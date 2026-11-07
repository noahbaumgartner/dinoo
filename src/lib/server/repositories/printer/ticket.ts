/**
 * Device-independent description of a printed ticket. It is stored as JSON in the print queue,
 * so the queue can show a readable preview and the printer repository renders it to ESC/POS.
 */
export type TicketLine =
	| {
			type: 'text';
			text: string;
			size?: 'normal' | 'large';
			align?: 'left' | 'center';
			bold?: boolean;
	  }
	| { type: 'pair'; left: string; right: string; bold?: boolean }
	| { type: 'rule' }
	| { type: 'feed' };

export type Ticket = { lines: TicketLine[] };

/** Characters per line in the normal font (Epson TM-T20, 80 mm, as configured in the driver). */
export const TICKET_WIDTH = 42;
const PREVIEW_WIDTH = TICKET_WIDTH;

/** Plain-text rendering, used for the queue preview and by the fake printer. */
export function ticketToText(ticket: Ticket): string {
	return ticket.lines
		.map((line) => {
			switch (line.type) {
				case 'text': {
					const text = line.size === 'large' ? line.text.toUpperCase() : line.text;
					if (line.align !== 'center') return text;
					const padding = Math.max(0, Math.floor((PREVIEW_WIDTH - text.length) / 2));
					return ' '.repeat(padding) + text;
				}
				case 'pair': {
					const gap = Math.max(1, PREVIEW_WIDTH - line.left.length - line.right.length);
					return line.left + ' '.repeat(gap) + line.right;
				}
				case 'rule':
					return '-'.repeat(PREVIEW_WIDTH);
				case 'feed':
					return '';
			}
		})
		.join('\n');
}
