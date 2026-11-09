const pattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

/** Formats a date as the value of `<input type="datetime-local">` (local time, minutes). */
export function formatDatetimeLocal(date: Date): string {
	const pad = (n: number) => String(n).padStart(2, '0');
	return (
		`${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
		`T${pad(date.getHours())}:${pad(date.getMinutes())}`
	);
}

/** Parses a `datetime-local` value as local time; `null` for anything else. */
export function parseDatetimeLocal(value: string | null): Date | null {
	if (!value || !pattern.test(value)) return null;
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? null : date;
}
