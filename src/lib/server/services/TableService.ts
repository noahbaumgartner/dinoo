import {
	gridLabel,
	MAX_GRID_COLUMNS,
	MAX_GRID_ROWS,
	TABLE_NUMBERINGS,
	type TableNumbering
} from '../../table-grid';
import type { SettingsRepository } from '../repositories/db/SettingsRepository';
import type { TableChanges, TableInput, TableRepository } from '../repositories/db/TableRepository';
import type { TableRecord } from '../repositories/db/types';
import { DomainError, ensure } from './errors';

export type SeatingPlan = {
	rows: number;
	columns: number;
	numbering: TableNumbering;
};

export type GridInput = SeatingPlan;

/**
 * Label and order; the position in the seating plan is set via `applyGrid`, the active flag via
 * `setActive` (new tables start active).
 */
export type TableEdit = Omit<TableInput, 'gridRow' | 'gridColumn' | 'active'>;

export class TableService {
	constructor(
		private readonly tables: TableRepository,
		private readonly settings: SettingsRepository
	) {}

	list(): TableRecord[] {
		return this.tables.list();
	}

	/** Size of the seating plan (derived from its tables) and its numbering. */
	plan(tables = this.tables.list()): SeatingPlan {
		const grid = tables.filter(isGridTable);
		return {
			rows: Math.max(0, ...grid.map((table) => table.gridRow)),
			columns: Math.max(0, ...grid.map((table) => table.gridColumn)),
			numbering: this.numbering()
		};
	}

	/**
	 * Resizes the seating plan: creates missing cells, removes cells outside (tables with orders
	 * become inactive free tables) and relabels cells that still carry the old default label.
	 */
	applyGrid(input: GridInput) {
		const { rows, columns, numbering } = input;
		if (!TABLE_NUMBERINGS.includes(numbering)) throw new DomainError('Ungültige Nummerierung.');
		if (!Number.isInteger(rows) || rows < 1 || rows > MAX_GRID_ROWS)
			throw new DomainError(`Bitte 1 bis ${MAX_GRID_ROWS} Zeilen angeben.`);
		if (!Number.isInteger(columns) || columns < 1 || columns > MAX_GRID_COLUMNS)
			throw new DomainError(`Bitte 1 bis ${MAX_GRID_COLUMNS} Spalten angeben.`);

		const previous = this.numbering();
		const existing = this.tables.list();
		let freeSortOrder = Math.max(
			0,
			...existing.filter((table) => !isGridTable(table)).map((table) => table.sortOrder)
		);
		const changes: TableChanges = { update: [], delete: [], create: [] };
		const cells = new Set<string>();

		for (const table of existing) {
			if (!isGridTable(table)) continue;
			const { gridRow: row, gridColumn: column } = table;
			if (row > rows || column > columns) {
				if (this.tables.hasOrders(table.id)) {
					freeSortOrder += 1;
					changes.update.push({
						id: table.id,
						input: { gridRow: null, gridColumn: null, active: false, sortOrder: freeSortOrder }
					});
				} else changes.delete.push(table.id);
				continue;
			}
			cells.add(`${row}:${column}`);
			const label = gridLabel(numbering, row, column);
			if (table.label !== label && table.label === gridLabel(previous, row, column))
				changes.update.push({ id: table.id, input: { label } });
		}

		for (let row = 1; row <= rows; row += 1)
			for (let column = 1; column <= columns; column += 1)
				if (!cells.has(`${row}:${column}`))
					changes.create.push({
						label: gridLabel(numbering, row, column),
						gridRow: row,
						gridColumn: column,
						sortOrder: 0,
						active: true
					});

		this.tables.apply(changes);
		this.settings.set('tableNumbering', numbering);
	}

	/** Creates a free table (outside the seating plan) or edits any table. */
	save(id: number | null, input: TableEdit): TableRecord | undefined {
		const label = input.label.trim();
		if (!label) throw new DomainError('Bitte eine Bezeichnung für den Tisch angeben.');
		const values = { label, sortOrder: input.sortOrder };
		if (id === null) return this.tables.create({ ...values, active: true });
		ensure(this.tables.get(id), 'Tisch');
		this.tables.update(id, values);
	}

	setActive(id: number, active: boolean) {
		ensure(this.tables.get(id), 'Tisch');
		this.tables.update(id, { active });
	}

	/** Rename only; used by the inline editing of the seating plan. */
	rename(id: number, label: string) {
		const table = ensure(this.tables.get(id), 'Tisch');
		this.save(id, { label, sortOrder: table.sortOrder });
	}

	/**
	 * Row or column handle: deactivates the whole line if any table in it is active, otherwise
	 * activates it. Returns the new state.
	 */
	toggleGridLine(line: { row: number } | { column: number }): boolean {
		const inLine = this.tables
			.list()
			.filter(isGridTable)
			.filter((table) =>
				'row' in line ? table.gridRow === line.row : table.gridColumn === line.column
			);
		if (inLine.length === 0) throw new DomainError('Diese Zeile oder Spalte gibt es nicht.');
		const active = !inLine.some((table) => table.active);
		this.tables.setGridLineActive(line, active);
		return active;
	}

	/** Free tables with orders are only deactivated; seating plan cells are never deleted here. */
	delete(id: number): 'deleted' | 'deactivated' {
		const table = ensure(this.tables.get(id), 'Tisch');
		if (isGridTable(table))
			throw new DomainError(
				'Tische im Saalplan werden deaktiviert oder durch Verkleinern des Rasters entfernt.'
			);
		if (this.tables.hasOrders(id)) {
			this.tables.update(id, { active: false });
			return 'deactivated';
		}
		this.tables.delete(id);
		return 'deleted';
	}

	private numbering(): TableNumbering {
		return this.settings.get('tableNumbering') === 'number' ? 'number' : 'letter';
	}
}

export function isGridTable(
	table: TableRecord
): table is TableRecord & { gridRow: number; gridColumn: number } {
	return table.gridRow !== null && table.gridColumn !== null;
}
