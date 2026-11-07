/** Numbering of the seating plan: «A01, A02, …» or «101, 102, …». */
export const TABLE_NUMBERINGS = ['letter', 'number'] as const;
export type TableNumbering = (typeof TABLE_NUMBERINGS)[number];

export const MAX_GRID_ROWS = 26;
export const MAX_GRID_COLUMNS = 30;

/** Default label of a seating plan cell; rows and columns start at 1. */
export function gridLabel(numbering: TableNumbering, row: number, column: number): string {
	if (numbering === 'letter')
		return String.fromCharCode(64 + row) + String(column).padStart(2, '0');
	return String(row * 100 + column);
}
