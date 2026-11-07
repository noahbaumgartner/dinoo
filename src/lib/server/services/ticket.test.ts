import { describe, expect, it } from 'vite-plus/test';
import { TICKET_WIDTH } from '../repositories/printer/ticket';
import { JOKES, wrapText } from './jokes';
import { TicketService } from './TicketService';

describe('test ticket', () => {
	it('has 100 distinct jokes', () => {
		expect(new Set(JOKES).size).toBe(100);
	});

	it('prints the title and the joke picked by the random source', () => {
		const ticket = new TicketService(() => 0.999).testTicket();
		expect(ticket.lines[0]).toMatchObject({ type: 'text', text: 'Testdruck', size: 'large' });
		const text = ticket.lines
			.flatMap((line) => (line.type === 'text' ? [line.text] : []))
			.slice(1)
			.join(' ');
		expect(text).toBe(JOKES[JOKES.length - 1].replaceAll('\n', ' '));
	});

	it('wraps every joke to the ticket width at word boundaries', () => {
		for (const joke of JOKES) {
			const lines = wrapText(joke, TICKET_WIDTH);
			expect(lines.every((line) => line.length <= TICKET_WIDTH)).toBe(true);
			expect(lines.join(' ')).toBe(joke.replaceAll('\n', ' '));
		}
	});
});
