import { describe, expect, it } from 'vite-plus/test';
import {
	defaultTemplate,
	lineStyle,
	parseStoredTemplate,
	renderTemplate,
	sampleTicketData,
	validateTemplate,
	type TicketData,
	type TicketTemplate
} from './template';
import { ticketToText, wrapText } from './ticket';

const data: TicketData = {
	eventName: 'Sommerfest',
	orderNumber: 7,
	tableLabel: 'A03',
	createdAt: new Date(2026, 10, 7, 18, 5),
	serviceName: 'Anna',
	printerName: 'Küche',
	items: [
		{ quantity: 2, articleName: 'Pommes', note: null },
		{ quantity: 1, articleName: 'Bratwurst', note: 'ohne Senf' }
	]
};

function messages(input: unknown) {
	return validateTemplate(input).errors.map((e) => e.message);
}

function withBlocks(...blocks: unknown[]) {
	return {
		blocks: [
			...blocks,
			{
				type: 'items',
				line: { text: '{menge} x {artikel}', style: lineStyle() },
				note: { text: '{notiz}', style: lineStyle() }
			}
		]
	};
}

describe('template validation', () => {
	it('accepts the default template', () => {
		expect(validateTemplate(defaultTemplate()).errors).toEqual([]);
	});

	it('needs exactly one items block', () => {
		expect(messages({ blocks: [] })).toContain(
			'Die Vorlage braucht genau einen Block mit den Positionen.'
		);
		const twice = withBlocks(withBlocks().blocks[0]);
		expect(messages(twice)).toContain('Die Vorlage braucht genau einen Block mit den Positionen.');
	});

	it('rejects unknown placeholders and placeholders outside their line', () => {
		const result = validateTemplate(
			withBlocks(
				{ type: 'text', text: 'Hallo {gast}', style: lineStyle() },
				{ type: 'text', text: '{artikel}', style: lineStyle() }
			)
		);
		expect(result.errors).toEqual([
			{ block: 0, message: 'Unbekannter Platzhalter {gast}.' },
			{ block: 1, message: '{artikel} ist nur in der Positionszeile verfügbar.' }
		]);
	});

	it('checks sizes, feeds and text length', () => {
		expect(
			messages(
				withBlocks(
					{ type: 'text', text: 'x'.repeat(201), style: lineStyle({ width: 5 }) },
					{ type: 'feed', lines: 6 }
				)
			)
		).toEqual([
			'Der Text ist länger als 200 Zeichen.',
			'Die Breite muss zwischen 1 und 4 liegen.',
			'Der Abstand muss zwischen 1 und 5 Zeilen liegen.'
		]);
	});

	it('falls back to the default for missing or broken stored templates', () => {
		expect(parseStoredTemplate(null)).toEqual(defaultTemplate());
		expect(parseStoredTemplate('{nope')).toEqual(defaultTemplate());
		expect(parseStoredTemplate(JSON.stringify({ blocks: [] }))).toEqual(defaultTemplate());
	});
});

describe('template rendering', () => {
	it('renders the default template like the former fixed ticket', () => {
		const text = ticketToText(renderTemplate(defaultTemplate(), data).ticket);
		expect(text).toContain('Sommerfest');
		expect(text).toContain('BESTELLUNG 7');
		expect(text).toContain('TISCH A03');
		expect(text).toContain('07.11.2026 18:05');
		expect(text).toMatch(/2 x Pommes\n1 x Bratwurst\n {2}> ohne Senf\n/);
		expect(text).toContain('Aufgenommen von: Anna');
	});

	it('fills placeholders and drops lines that end up empty', () => {
		const template: TicketTemplate = withBlocks(
			{ type: 'text', text: '{anlass}', style: lineStyle() },
			{ type: 'text', text: '{drucker}: {anzahl} Stück', style: lineStyle({ align: 'right' }) }
		) as TicketTemplate;
		const { ticket } = renderTemplate(template, { ...data, eventName: null });
		expect(ticket.lines[0]).toMatchObject({ text: 'Küche: 3 Stück', align: 'right' });
		expect(ticket.lines.map((line) => line.type === 'text' && line.text)).toEqual([
			'Küche: 3 Stück',
			'2 x Pommes',
			'1 x Bratwurst',
			'ohne Senf'
		]);
	});

	it('wraps to the width left at the chosen size and reports the block', () => {
		const template = withBlocks({
			type: 'text',
			text: 'Tisch {tisch} bitte sofort servieren',
			style: lineStyle({ width: 3, invert: true })
		}) as TicketTemplate;
		const { ticket, wrapped } = renderTemplate(template, data);
		const lines = ticket.lines.filter((line) => line.type === 'text' && line.invert);
		expect(lines.map((line) => line.type === 'text' && line.text)).toEqual([
			'Tisch A03 bitte',
			'sofort servieren'
		]);
		expect([...wrapped]).toEqual([0]);
	});

	it('fills the sample order with a long article name', () => {
		const sample = sampleTicketData({
			eventName: null,
			serviceName: 'Admin',
			printerName: 'Grill',
			now: new Date()
		});
		expect(sample.eventName).toBe('Musterfest');
		expect(renderTemplate(defaultTemplate(), sample).wrapped.size).toBe(0);
	});
});

describe('wrapText', () => {
	it('keeps the indent on continuation lines and splits overlong words', () => {
		expect(wrapText('  > ohne Senf, extra Brot', 12)).toEqual([
			'  > ohne',
			'  Senf,',
			'  extra Brot'
		]);
		expect(wrapText('Cordonbleu', 4)).toEqual(['Cord', 'onbl', 'eu']);
	});
});
