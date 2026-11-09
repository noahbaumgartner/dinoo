/**
 * Print template (F11, ADR-008): an ordered list of blocks that decides what goes onto an order
 * ticket, where and how big. Shared by the server (validation, rendering into the print queue)
 * and the browser (live preview in the editor), so both always agree.
 */
import {
	charsPerLine,
	MAX_SCALE,
	wrapText,
	type TextAlign,
	type Ticket,
	type TicketLine
} from './ticket';

export type LineStyle = {
	align: TextAlign;
	width: number;
	height: number;
	bold: boolean;
	underline: boolean;
	invert: boolean;
};

export type TemplateLine = { text: string; style: LineStyle };

export type TemplateBlock =
	| ({ type: 'text' } & TemplateLine)
	| { type: 'items'; line: TemplateLine; note: TemplateLine }
	| { type: 'rule'; char: '-' | '=' }
	| { type: 'feed'; lines: number };

export type TicketTemplate = { blocks: TemplateBlock[] };

/** What a ticket is filled with: one order on one printer. */
export type TicketData = {
	eventName: string | null;
	orderNumber: number;
	tableLabel: string;
	createdAt: Date;
	serviceName: string;
	printerName: string;
	/** `options` are the picked option texts, printed like notes before the note. */
	items: { quantity: number; articleName: string; options?: string[]; note: string | null }[];
};

export const MAX_BLOCKS = 30;
export const MAX_TEXT = 200;
export const MAX_FEED = 5;

export const ALIGNS: readonly TextAlign[] = ['left', 'center', 'right'];

/** Placeholders and where they may be used. */
export const PLACEHOLDERS = {
	anlass: { label: 'Anlass', scope: 'all' },
	bestellnummer: { label: 'Bestellnummer', scope: 'all' },
	tisch: { label: 'Tisch', scope: 'all' },
	datum: { label: 'Datum', scope: 'all' },
	zeit: { label: 'Zeit', scope: 'all' },
	service: { label: 'Service', scope: 'all' },
	drucker: { label: 'Drucker', scope: 'all' },
	anzahl: { label: 'Anzahl', scope: 'all' },
	menge: { label: 'Menge', scope: 'line' },
	artikel: { label: 'Artikel', scope: 'line' },
	notiz: { label: 'Notiz', scope: 'note' }
} as const;

export type Placeholder = keyof typeof PLACEHOLDERS;

/** Where a text is used: a text block, the item line or the note line of the items block. */
export type TextContext = 'text' | 'line' | 'note';

export function placeholdersFor(context: TextContext): Placeholder[] {
	return (Object.keys(PLACEHOLDERS) as Placeholder[]).filter((name) => {
		const scope = PLACEHOLDERS[name].scope;
		return scope === 'all' || scope === context;
	});
}

export function lineStyle(style: Partial<LineStyle> = {}): LineStyle {
	return {
		align: 'left',
		width: 1,
		height: 1,
		bold: false,
		underline: false,
		invert: false,
		...style
	};
}

/** The ticket as it was before templates existed. */
export function defaultTemplate(): TicketTemplate {
	return {
		blocks: [
			{ type: 'text', text: '{anlass}', style: lineStyle({ align: 'center' }) },
			{
				type: 'text',
				text: 'Bestellung {bestellnummer}',
				style: lineStyle({ align: 'center', width: 2, height: 2 })
			},
			{
				type: 'text',
				text: 'Tisch {tisch}',
				style: lineStyle({ align: 'center', width: 2, height: 2, bold: true })
			},
			{ type: 'text', text: '{datum} {zeit}', style: lineStyle({ align: 'center' }) },
			{ type: 'rule', char: '-' },
			{
				type: 'items',
				line: { text: '{menge} x {artikel}', style: lineStyle({ bold: true }) },
				note: { text: '  > {notiz}', style: lineStyle() }
			},
			{ type: 'rule', char: '-' },
			{ type: 'text', text: 'Aufgenommen von: {service}', style: lineStyle() },
			{ type: 'feed', lines: 1 }
		]
	};
}

// --- Validation -----------------------------------------------------------------------------

export type TemplateError = { block: number | null; message: string };

type Parsed<T> = { value: T; errors: string[] };

const PLACEHOLDER_PATTERN = /\{([^{}]*)\}/g;

function isObject(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function scale(value: unknown, what: string, errors: string[]): number {
	if (Number.isInteger(value) && (value as number) >= 1 && (value as number) <= MAX_SCALE) {
		return value as number;
	}
	errors.push(`${what} muss zwischen 1 und ${MAX_SCALE} liegen.`);
	return 1;
}

function parseStyle(input: unknown, errors: string[]): LineStyle {
	const raw = isObject(input) ? input : {};
	const align = ALIGNS.includes((raw.align ?? 'left') as TextAlign)
		? ((raw.align ?? 'left') as TextAlign)
		: null;
	if (!align) errors.push('Ungültige Ausrichtung.');
	return {
		align: align ?? 'left',
		width: scale(raw.width ?? 1, 'Die Breite', errors),
		height: scale(raw.height ?? 1, 'Die Höhe', errors),
		bold: raw.bold === true,
		underline: raw.underline === true,
		invert: raw.invert === true
	};
}

function placeholderErrors(text: string, context: TextContext): string[] {
	const allowed = new Set<string>(placeholdersFor(context));
	const errors: string[] = [];
	for (const [, name] of text.matchAll(PLACEHOLDER_PATTERN)) {
		if (allowed.has(name)) continue;
		if (name in PLACEHOLDERS) {
			const where =
				PLACEHOLDERS[name as Placeholder].scope === 'line' ? 'Positionszeile' : 'Notizzeile';
			errors.push(`{${name}} ist nur in der ${where} verfügbar.`);
		} else {
			errors.push(`Unbekannter Platzhalter {${name}}.`);
		}
	}
	return errors;
}

function parseLine(input: unknown, context: TextContext): Parsed<TemplateLine> {
	const raw = isObject(input) ? input : {};
	const errors: string[] = [];
	const text = typeof raw.text === 'string' ? raw.text : '';
	if (text.length > MAX_TEXT) errors.push(`Der Text ist länger als ${MAX_TEXT} Zeichen.`);
	errors.push(...placeholderErrors(text, context));
	const style = parseStyle(raw.style, errors);
	return { value: { text, style }, errors };
}

function parseBlock(input: unknown): Parsed<TemplateBlock> | null {
	if (!isObject(input)) return null;
	switch (input.type) {
		case 'text': {
			const { value, errors } = parseLine(input, 'text');
			return { value: { type: 'text', ...value }, errors };
		}
		case 'items': {
			const line = parseLine(input.line, 'line');
			const note = parseLine(input.note, 'note');
			return {
				value: { type: 'items', line: line.value, note: note.value },
				errors: [
					...line.errors.map((e) => `Positionszeile: ${e}`),
					...note.errors.map((e) => `Notizzeile: ${e}`)
				]
			};
		}
		case 'rule': {
			const char = input.char === '=' ? '=' : '-';
			const errors = input.char === '-' || input.char === '=' ? [] : ['Ungültiges Linienzeichen.'];
			return { value: { type: 'rule', char }, errors };
		}
		case 'feed': {
			const lines = input.lines;
			const valid =
				Number.isInteger(lines) && (lines as number) >= 1 && (lines as number) <= MAX_FEED;
			return {
				value: { type: 'feed', lines: valid ? (lines as number) : 1 },
				errors: valid ? [] : [`Der Abstand muss zwischen 1 und ${MAX_FEED} Zeilen liegen.`]
			};
		}
		default:
			return null;
	}
}

/**
 * Checks a template from untrusted input. Returns the cleaned template and every error, each
 * tied to its block (0-based) or to the template as a whole (`block: null`).
 */
export function validateTemplate(input: unknown): {
	template: TicketTemplate;
	errors: TemplateError[];
} {
	const errors: TemplateError[] = [];
	const rawBlocks = isObject(input) && Array.isArray(input.blocks) ? input.blocks : null;
	if (!rawBlocks) {
		return {
			template: { blocks: [] },
			errors: [{ block: null, message: 'Die Vorlage ist ungültig.' }]
		};
	}
	if (rawBlocks.length > MAX_BLOCKS) {
		errors.push({ block: null, message: `Höchstens ${MAX_BLOCKS} Blöcke sind möglich.` });
	}
	const blocks: TemplateBlock[] = [];
	rawBlocks.forEach((raw, index) => {
		const parsed = parseBlock(raw);
		if (!parsed) {
			errors.push({ block: index, message: 'Unbekannter Block.' });
			return;
		}
		blocks.push(parsed.value);
		for (const message of parsed.errors) errors.push({ block: index, message });
	});
	const itemBlocks = blocks.filter((block) => block.type === 'items').length;
	if (itemBlocks !== 1) {
		errors.push({
			block: null,
			message: 'Die Vorlage braucht genau einen Block mit den Positionen.'
		});
	}
	return { template: { blocks }, errors };
}

/** A stored template, or the default one if there is none or it became invalid. */
export function parseStoredTemplate(json: string | null): TicketTemplate {
	if (!json) return defaultTemplate();
	try {
		const { template, errors } = validateTemplate(JSON.parse(json));
		return errors.length ? defaultTemplate() : template;
	} catch {
		return defaultTemplate();
	}
}

// --- Rendering ------------------------------------------------------------------------------

const dateFormat = new Intl.DateTimeFormat('de-CH', {
	day: '2-digit',
	month: '2-digit',
	year: 'numeric'
});
const timeFormat = new Intl.DateTimeFormat('de-CH', { hour: '2-digit', minute: '2-digit' });

type Values = Partial<Record<Placeholder, string>>;

function fill(text: string, values: Values): string {
	return text.replace(PLACEHOLDER_PATTERN, (match, name: string) =>
		name in values ? (values[name as Placeholder] ?? '') : match
	);
}

/**
 * Turns a template and its data into ticket lines. Also reports which blocks had a line that did
 * not fit and was wrapped, so the editor can point that out.
 */
export function renderTemplate(
	template: TicketTemplate,
	data: TicketData
): { ticket: Ticket; wrapped: Set<number> } {
	const lines: TicketLine[] = [];
	const wrapped = new Set<number>();
	const common: Values = {
		anlass: data.eventName ?? '',
		bestellnummer: String(data.orderNumber),
		tisch: data.tableLabel,
		datum: dateFormat.format(data.createdAt),
		zeit: timeFormat.format(data.createdAt),
		service: data.serviceName,
		drucker: data.printerName,
		anzahl: String(data.items.reduce((sum, item) => sum + item.quantity, 0))
	};

	function addText(line: TemplateLine, values: Values, block: number) {
		const text = fill(line.text, values);
		if (!text.trim()) return;
		const { style } = line;
		const parts = wrapText(text, charsPerLine(style.width));
		if (parts.length > text.split('\n').length) wrapped.add(block);
		for (const part of parts) {
			lines.push({
				type: 'text',
				text: part,
				align: style.align,
				width: style.width,
				height: style.height,
				bold: style.bold,
				underline: style.underline,
				invert: style.invert
			});
		}
	}

	template.blocks.forEach((block, index) => {
		switch (block.type) {
			case 'text':
				addText(block, common, index);
				break;
			case 'items':
				for (const item of data.items) {
					addText(
						block.line,
						{ ...common, menge: String(item.quantity), artikel: item.articleName },
						index
					);
					for (const option of item.options ?? [])
						addText(block.note, { ...common, notiz: option }, index);
					if (item.note) addText(block.note, { ...common, notiz: item.note }, index);
				}
				break;
			case 'rule':
				lines.push({ type: 'rule', char: block.char });
				break;
			case 'feed':
				lines.push({ type: 'feed', lines: block.lines });
				break;
		}
	});
	return { ticket: { lines }, wrapped };
}

/** Fixed sample order for the editor preview and the template test print. */
export function sampleTicketData(input: {
	eventName: string | null;
	serviceName: string;
	printerName: string;
	now: Date;
}): TicketData {
	return {
		eventName: input.eventName || 'Musterfest',
		orderNumber: 42,
		tableLabel: 'B07',
		createdAt: input.now,
		serviceName: input.serviceName,
		printerName: input.printerName,
		items: [
			{ quantity: 2, articleName: 'Pommes', note: null },
			{ quantity: 1, articleName: 'Bratwurst', options: ['ohne Senf'], note: 'extra Brot' },
			{ quantity: 3, articleName: 'Rivella', note: null },
			{ quantity: 1, articleName: 'Cordon bleu mit Pommes und Salat', note: null }
		]
	};
}
