/**
 * The ten colors a category can have (F04). Stored by key so the palette can be retuned without
 * touching data. Lightness and chroma sit close to the accent so they read as one family.
 */
export const CATEGORY_COLORS = [
	{ key: 'blue', label: 'Blau', value: 'oklch(0.55 0.19 265)' },
	{ key: 'sky', label: 'Hellblau', value: 'oklch(0.66 0.13 235)' },
	{ key: 'teal', label: 'Petrol', value: 'oklch(0.6 0.1 190)' },
	{ key: 'green', label: 'Grün', value: 'oklch(0.62 0.15 150)' },
	{ key: 'yellow', label: 'Gelb', value: 'oklch(0.78 0.15 85)' },
	{ key: 'orange', label: 'Orange', value: 'oklch(0.7 0.16 55)' },
	{ key: 'red', label: 'Rot', value: 'oklch(0.6 0.19 24)' },
	{ key: 'pink', label: 'Pink', value: 'oklch(0.64 0.17 350)' },
	{ key: 'violet', label: 'Violett', value: 'oklch(0.56 0.18 300)' },
	{ key: 'gray', label: 'Grau', value: 'oklch(0.55 0.02 262)' }
] as const;

export type CategoryColor = (typeof CATEGORY_COLORS)[number]['key'];

export const DEFAULT_CATEGORY_COLOR: CategoryColor = 'blue';

export function isCategoryColor(value: string): value is CategoryColor {
	return CATEGORY_COLORS.some((color) => color.key === value);
}

/** The CSS color for a stored key; unknown keys fall back to the default. */
export function categoryColor(key: string): string {
	return (CATEGORY_COLORS.find((color) => color.key === key) ?? CATEGORY_COLORS[0]).value;
}

/** Neighbours contrast; the migration `0004_category_color` spreads existing rows the same way. */
const SPREAD: CategoryColor[] = [
	'blue',
	'orange',
	'green',
	'red',
	'violet',
	'sky',
	'yellow',
	'pink',
	'teal',
	'gray'
];

/** A color for the n-th category, so new categories do not all start out blue. */
export function nextCategoryColor(index: number): CategoryColor {
	return SPREAD[index % SPREAD.length];
}
