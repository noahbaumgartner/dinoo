/** Money is always handled as integer Rappen (CHF cents). */

const formatter = new Intl.NumberFormat('de-CH', {
	minimumFractionDigits: 2,
	maximumFractionDigits: 2
});

/** `1250` → `"12.50"` */
export function formatAmount(cents: number): string {
	return formatter.format(cents / 100);
}

/** `1250` → `"CHF 12.50"` */
export function formatChf(cents: number): string {
	return `CHF ${formatAmount(cents)}`;
}

/** Parses `"12.50"`, `"12,5"`, `"12"` or `"12.–"` into Rappen; `null` if not a valid amount. */
export function parseChf(input: string): number | null {
	const normalized = input
		.trim()
		.replace(/^chf\s*/i, '')
		.replace(/[’'\s]/g, '')
		.replace(/[.,][-–]$/, '')
		.replace(',', '.');
	if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
	const [francs, rappen = ''] = normalized.split('.');
	return Number(francs) * 100 + Number(rappen.padEnd(2, '0'));
}

/** Swiss cash rounding to the nearest 5 Rappen. */
export function roundTo5(cents: number): number {
	return Math.round(cents / 5) * 5;
}
