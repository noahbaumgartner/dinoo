/**
 * Device-independent description of a printed ticket. It is stored as JSON in the print queue,
 * shown as a preview in the browser and rendered to ESC/POS by the printer repository.
 */

export type TextAlign = 'left' | 'center' | 'right';

export type TextStyle = {
	align?: TextAlign;
	/** Character width multiplier, 1–4. */
	width?: number;
	/** Character height multiplier, 1–4. */
	height?: number;
	bold?: boolean;
	underline?: boolean;
	/** White on black. */
	invert?: boolean;
};

export type TicketLine =
	| ({
			type: 'text';
			text: string;
			/** Legacy payloads: `large` is printed as 2 × 2. */
			size?: 'normal' | 'large';
	  } & TextStyle)
	| { type: 'pair'; left: string; right: string; bold?: boolean }
	| { type: 'rule'; char?: '-' | '=' }
	| { type: 'feed'; lines?: number };

export type Ticket = {
	lines: TicketLine[];
	/**
	 * Name of the station (printer) the ticket was meant for, set once it is redirected to another
	 * printer. The hint lines are already part of `lines`; this field only prevents a second hint.
	 */
	redirectedFrom?: string;
};

/** Characters per line in font A on 80 mm paper (Epson TM-T20III / TM-T20IV default). */
export const TICKET_WIDTH = 48;

export const MAX_SCALE = 4;

/** Width and height multiplier of a text line, including legacy `size: 'large'`. */
export function textScale(line: { size?: 'normal' | 'large'; width?: number; height?: number }) {
	const fallback = line.size === 'large' ? 2 : 1;
	return { width: line.width ?? fallback, height: line.height ?? fallback };
}

/** Characters that fit on one line at the given width multiplier. */
export function charsPerLine(width: number) {
	return Math.floor(TICKET_WIDTH / Math.max(1, width));
}

/**
 * Word-wraps text to `width` characters; `\n` starts a new line. Leading spaces indent the whole
 * paragraph, including its continuation lines. Words longer than a line are split hard.
 */
export function wrapText(text: string, width: number): string[] {
	const lines: string[] = [];
	for (const paragraph of text.split('\n')) {
		const indent = /^ */.exec(paragraph)?.[0] ?? '';
		const room = Math.max(1, width - indent.length);
		const paragraphLines: string[] = [];
		let current = '';
		for (let word of paragraph.split(' ').filter(Boolean)) {
			if (current && current.length + 1 + word.length <= room) {
				current += ` ${word}`;
				continue;
			}
			if (current) paragraphLines.push(current);
			while (word.length > room) {
				paragraphLines.push(word.slice(0, room));
				word = word.slice(room);
			}
			current = word;
		}
		paragraphLines.push(current);
		lines.push(...paragraphLines.map((line) => (line ? indent + line : line)));
	}
	return lines;
}

/** Plain-text rendering, used for the queue preview and by the fake printer. */
export function ticketToText(ticket: Ticket): string {
	return ticket.lines
		.map((line) => {
			switch (line.type) {
				case 'text': {
					const scale = textScale(line);
					const enlarged = scale.width > 1 || scale.height > 1;
					// Enlarged text is only hinted at by capitals
					const shown = enlarged ? line.text.toUpperCase() : line.text;
					const free = Math.max(0, TICKET_WIDTH - shown.length);
					if (line.align === 'center') return ' '.repeat(Math.floor(free / 2)) + shown;
					if (line.align === 'right') return ' '.repeat(free) + shown;
					return shown;
				}
				case 'pair': {
					const gap = Math.max(1, TICKET_WIDTH - line.left.length - line.right.length);
					return line.left + ' '.repeat(gap) + line.right;
				}
				case 'rule':
					return (line.char ?? '-').repeat(TICKET_WIDTH);
				case 'feed':
					return Array.from({ length: line.lines ?? 1 }, () => '').join('\n');
			}
		})
		.join('\n');
}

/**
 * Adds a prominent «FÜR: <station>» block on top, so a ticket printed on a replacement printer can
 * be handed on to the right station. A ticket that was already redirected keeps its first hint.
 */
export function withRedirectHint(ticket: Ticket, station: string): Ticket {
	if (ticket.redirectedFrom) return ticket;
	const title = wrapText(`FÜR: ${station.toUpperCase()}`, charsPerLine(2));
	return {
		...ticket,
		redirectedFrom: station,
		lines: [
			...title.map((text) => ({
				type: 'text' as const,
				text,
				width: 2,
				height: 2,
				bold: true,
				invert: true,
				align: 'center' as const
			})),
			{ type: 'text', text: 'Umgeleitet, bitte weitergeben', align: 'center' },
			{ type: 'rule', char: '=' },
			...ticket.lines
		]
	};
}
