/**
 * Article options (F04) and what a guest picked for them (F02). Shared by the admin dialog, the
 * order page and `OrderService`, so price and labels are computed the same way everywhere.
 */

export const MIN_AGES = [0, 16, 18] as const;
export type MinAge = (typeof MIN_AGES)[number];

export const MAX_OPTIONS = 10;
export const MAX_CHOICES = 10;
export const MAX_COUNT = 20;

export type OptionChoice = { id: string; name: string; priceCents: number };

export type ArticleOption =
	/** A number in `min`–`max`, e.g. cups; `priceCents` per unit. */
	| { id: string; kind: 'count'; name: string; min: number; max: number; priceCents: number }
	/** On or off, e.g. «ohne Sauce». */
	| { id: string; kind: 'toggle'; name: string; priceCents: number }
	/** One of `choices`, e.g. the kind of cake; `required` forbids picking none. */
	| { id: string; kind: 'choice'; name: string; required: boolean; choices: OptionChoice[] };

export type OptionKind = ArticleOption['kind'];

/** Picked value per option id: a count, on/off, or the id of the chosen value (null = none). */
export type OptionValue = number | boolean | string | null;
export type OptionValues = Record<string, OptionValue>;

/** Starting values: counts at `min`, toggles off, nothing chosen. */
export function defaultValues(options: ArticleOption[]): OptionValues {
	return Object.fromEntries(
		options.map((option) => [
			option.id,
			option.kind === 'count' ? option.min : option.kind === 'toggle' ? false : null
		])
	);
}

export function hasRequiredChoice(options: ArticleOption[]): boolean {
	return options.some((option) => option.kind === 'choice' && option.required);
}

/** Required choices that have no value yet. */
export function missingRequired(options: ArticleOption[], values: OptionValues): ArticleOption[] {
	return options.filter(
		(option) => option.kind === 'choice' && option.required && !chosen(option, values[option.id])
	);
}

function chosen(option: Extract<ArticleOption, { kind: 'choice' }>, value: OptionValue) {
	return option.choices.find((choice) => choice.id === value);
}

/** Surcharge on top of the article price for one unit. */
export function surchargeCents(options: ArticleOption[], values: OptionValues): number {
	let sum = 0;
	for (const option of options) {
		const value = values[option.id];
		if (option.kind === 'count' && typeof value === 'number') sum += value * option.priceCents;
		else if (option.kind === 'toggle' && value === true) sum += option.priceCents;
		else if (option.kind === 'choice') sum += chosen(option, value)?.priceCents ?? 0;
	}
	return sum;
}

/** Texts for the kitchen and the order, e.g. `["Sorte: Schoggi", "2× Becher", "ohne Sauce"]`. */
export function optionLabels(options: ArticleOption[], values: OptionValues): string[] {
	const labels: string[] = [];
	for (const option of options) {
		const value = values[option.id];
		if (option.kind === 'count' && typeof value === 'number' && value > 0)
			labels.push(`${value}× ${option.name}`);
		else if (option.kind === 'toggle' && value === true) labels.push(option.name);
		else if (option.kind === 'choice') {
			const choice = chosen(option, value);
			if (choice) labels.push(`${option.name}: ${choice.name}`);
		}
	}
	return labels;
}

/**
 * Checks picked values against the article's options and returns them complete and in a fixed
 * form, or null if any value does not fit (unknown option, out of range, unknown choice, missing
 * required choice). Missing values take their start value.
 */
export function normalizeValues(options: ArticleOption[], values: unknown): OptionValues | null {
	const given: Record<string, unknown> =
		values && typeof values === 'object' && !Array.isArray(values)
			? (values as Record<string, unknown>)
			: {};
	if (Object.keys(given).some((id) => !options.some((option) => option.id === id))) return null;
	const result = defaultValues(options);
	for (const option of options) {
		if (!(option.id in given)) continue;
		const value = given[option.id];
		if (option.kind === 'count') {
			if (
				typeof value !== 'number' ||
				!Number.isInteger(value) ||
				value < option.min ||
				value > option.max
			)
				return null;
			result[option.id] = value;
		} else if (option.kind === 'toggle') {
			if (typeof value !== 'boolean') return null;
			result[option.id] = value;
		} else {
			if (value === null) continue;
			if (typeof value !== 'string' || !chosen(option, value)) return null;
			result[option.id] = value;
		}
	}
	return missingRequired(options, result).length > 0 ? null : result;
}

/** Stable text of a value set, to tell whether two positions are the same combination. */
export function valuesKey(options: ArticleOption[], values: OptionValues): string {
	return JSON.stringify(options.map((option) => values[option.id] ?? null));
}
