import {
	gridLabel,
	MAX_GRID_COLUMNS,
	MAX_GRID_ROWS,
	TABLE_NUMBERINGS,
	type TableNumbering
} from '../../table-grid';
import type { TableChanges, TableInput, TableRepository } from '../repositories/db/TableRepository';
import type { AreaRecord, TableRecord } from '../repositories/db/types';
import { DomainError, ensure } from './errors';

export type SeatingPlan = {
	rows: number;
	columns: number;
	numbering: TableNumbering;
};

/** Label and active flag of one seating plan cell, as edited in the plan. */
export type CellEdit = { row: number; column: number; label: string; active: boolean };

/**
 * The whole seating plan as saved at once: size, numbering, the edited cells (cells without an
 * edit keep their state or start active with the default label) and the active flag of free tables.
 */
export type GridInput = SeatingPlan & {
	cells?: CellEdit[];
	free?: { id: number; active: boolean }[];
};

/**
 * Label and order; the position in the seating plan is set via `applyGrid`, the active flag via
 * `setActive` (new tables start active). `areaId` is needed for new tables only; a table never moves
 * to another area.
 */
export type TableEdit = Pick<TableInput, 'label' | 'sortOrder'> & { areaId?: number };

export class TableService {
	constructor(private readonly tables: TableRepository) {}

	/** All areas in their order; there is always at least one. */
	areas(): AreaRecord[] {
		return this.tables.listAreas();
	}

	area(id: number): AreaRecord {
		return ensure(this.tables.getArea(id), 'Bereich');
	}

	/** Creates an area (numbered like the last one) or renames one. */
	saveArea(id: number | null, input: { name: string }): AreaRecord | undefined {
		const name = input.name.trim();
		if (!name) throw new DomainError('Bitte einen Namen für den Bereich angeben.');
		if (id !== null) {
			this.area(id);
			this.tables.updateArea(id, { name });
			return;
		}
		const areas = this.tables.listAreas();
		return this.tables.createArea({
			name,
			numbering: areas.at(-1)?.numbering ?? 'letter',
			sortOrder: Math.max(0, ...areas.map((area) => area.sortOrder)) + 1
		});
	}

	/** Deletes an area with all its tables, unless it is the last one or has orders. */
	deleteArea(id: number) {
		this.area(id);
		if (this.tables.listAreas().length <= 1)
			throw new DomainError('Der letzte Bereich kann nicht gelöscht werden.');
		if (this.tables.areaHasOrders(id))
			throw new DomainError(
				'Der Bereich hat Bestellungen und kann nicht gelöscht werden. Schalte stattdessen seine Tische aus.',
				409
			);
		this.tables.deleteArea(id);
	}

	/**
	 * Tables for a filter selection; with several areas the area follows the label, since the same
	 * label may exist in more than one area.
	 */
	choices(): { id: number; label: string }[] {
		const areas = new Map(this.tables.listAreas().map((area) => [area.id, area.name]));
		return this.tables.list().map(({ id, label, areaId }) => ({
			id,
			label: areas.size > 1 ? `${label} · ${areas.get(areaId)}` : label
		}));
	}

	/** All tables, or those of one area. */
	list(areaId?: number): TableRecord[] {
		return this.tables.list(areaId);
	}

	/** Size of the area's seating plan (derived from its tables) and its numbering. */
	plan(areaId: number, tables = this.tables.list(areaId)): SeatingPlan {
		const grid = tables.filter((table) => table.areaId === areaId).filter(isGridTable);
		return {
			rows: Math.max(0, ...grid.map((table) => table.gridRow)),
			columns: Math.max(0, ...grid.map((table) => table.gridColumn)),
			numbering: this.area(areaId).numbering
		};
	}

	/**
	 * Saves the seating plan in one transaction: creates missing cells, removes cells outside (tables
	 * with orders become inactive free tables), relabels cells that still carry the old default label
	 * and applies the edited labels and active flags.
	 */
	applyGrid(areaId: number, input: GridInput) {
		const { rows, columns, numbering } = input;
		if (!TABLE_NUMBERINGS.includes(numbering)) throw new DomainError('Ungültige Nummerierung.');
		if (!Number.isInteger(rows) || rows < 1 || rows > MAX_GRID_ROWS)
			throw new DomainError(`Bitte 1 bis ${MAX_GRID_ROWS} Zeilen angeben.`);
		if (!Number.isInteger(columns) || columns < 1 || columns > MAX_GRID_COLUMNS)
			throw new DomainError(`Bitte 1 bis ${MAX_GRID_COLUMNS} Spalten angeben.`);

		const edits = new Map<string, CellEdit>();
		for (const edit of input.cells ?? []) {
			if (edit.row < 1 || edit.row > rows || edit.column < 1 || edit.column > columns)
				throw new DomainError('Diese Zeile oder Spalte gibt es nicht.');
			const label = edit.label.trim();
			if (!label) throw new DomainError('Bitte jedem Tisch im Tischplan eine Bezeichnung geben.');
			edits.set(`${edit.row}:${edit.column}`, { ...edit, label });
		}

		const previous = this.area(areaId).numbering;
		const existing = this.tables.list(areaId);
		const byId = new Map(existing.map((table) => [table.id, table]));
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
			const edit = edits.get(`${row}:${column}`);
			const followsNumbering = table.label === gridLabel(previous, row, column);
			const label =
				edit?.label ?? (followsNumbering ? gridLabel(numbering, row, column) : table.label);
			const active = edit?.active ?? table.active;
			if (label !== table.label || active !== table.active)
				changes.update.push({ id: table.id, input: { label, active } });
		}

		for (let row = 1; row <= rows; row += 1)
			for (let column = 1; column <= columns; column += 1)
				if (!cells.has(`${row}:${column}`)) {
					const edit = edits.get(`${row}:${column}`);
					changes.create.push({
						areaId,
						label: edit?.label ?? gridLabel(numbering, row, column),
						gridRow: row,
						gridColumn: column,
						sortOrder: 0,
						active: edit?.active ?? true
					});
				}

		for (const { id, active } of input.free ?? []) {
			// Only tables of this area are in `byId`.
			const table = ensure(byId.get(id), 'Tisch');
			if (isGridTable(table)) throw new DomainError('Dieser Tisch liegt im Tischplan.');
			if (table.active !== active) changes.update.push({ id, input: { active } });
		}

		this.tables.apply(areaId, changes, { numbering });
	}

	/** Creates a free table (outside the seating plan) in an area or edits any table. */
	save(id: number | null, input: TableEdit): TableRecord | undefined {
		const label = input.label.trim();
		if (!label) throw new DomainError('Bitte eine Bezeichnung für den Tisch angeben.');
		const values = { label, sortOrder: input.sortOrder };
		if (id === null) {
			if (input.areaId === undefined) throw new DomainError('Bitte einen Bereich wählen.');
			const areaId = this.area(input.areaId).id;
			return this.tables.create({ ...values, areaId, active: true });
		}
		ensure(this.tables.get(id), 'Tisch');
		this.tables.update(id, values);
	}

	setActive(id: number, active: boolean) {
		ensure(this.tables.get(id), 'Tisch');
		this.tables.update(id, { active });
	}

	/** Free tables with orders are only deactivated; seating plan cells are never deleted here. */
	delete(id: number): 'deleted' | 'deactivated' {
		const table = ensure(this.tables.get(id), 'Tisch');
		if (isGridTable(table))
			throw new DomainError(
				'Tische im Tischplan werden deaktiviert oder durch Verkleinern des Rasters entfernt.'
			);
		if (this.tables.hasOrders(id)) {
			this.tables.update(id, { active: false });
			return 'deactivated';
		}
		this.tables.delete(id);
		return 'deleted';
	}
}

export function isGridTable(
	table: TableRecord
): table is TableRecord & { gridRow: number; gridColumn: number } {
	return table.gridRow !== null && table.gridColumn !== null;
}
