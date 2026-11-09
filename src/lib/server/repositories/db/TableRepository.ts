import { asc, eq, inArray, sql } from 'drizzle-orm';
import { countRows, type Db } from './client';
import { areas, orders, tables } from './schema';
import type { AreaRecord, TableRecord } from './types';

export type AreaInput = Pick<AreaRecord, 'name' | 'numbering' | 'sortOrder'>;

export type TableInput = {
	areaId: number;
	label: string;
	gridRow?: number | null;
	gridColumn?: number | null;
	sortOrder: number;
	active: boolean;
};

export type TableChanges = {
	update: { id: number; input: Partial<TableInput> }[];
	delete: number[];
	create: TableInput[];
};

export class TableRepository {
	constructor(private readonly db: Db) {}

	listAreas(): AreaRecord[] {
		return this.db.select().from(areas).orderBy(asc(areas.sortOrder), asc(areas.id)).all();
	}

	getArea(id: number): AreaRecord | undefined {
		return this.db.select().from(areas).where(eq(areas.id, id)).get();
	}

	createArea(input: AreaInput): AreaRecord {
		return this.db.insert(areas).values(input).returning().get();
	}

	updateArea(id: number, input: Partial<AreaInput>) {
		this.db.update(areas).set(input).where(eq(areas.id, id)).run();
	}

	/** Deletes the area together with its tables. */
	deleteArea(id: number) {
		this.db.transaction((tx) => {
			tx.delete(tables).where(eq(tables.areaId, id)).run();
			tx.delete(areas).where(eq(areas.id, id)).run();
		});
	}

	/** Per area: seating plan by row and column first, then free tables. */
	list(areaId?: number): TableRecord[] {
		return this.db
			.select()
			.from(tables)
			.leftJoin(areas, eq(areas.id, tables.areaId))
			.where(areaId === undefined ? undefined : eq(tables.areaId, areaId))
			.orderBy(
				asc(areas.sortOrder),
				asc(tables.areaId),
				sql`${tables.gridRow} is null`,
				asc(tables.gridRow),
				asc(tables.gridColumn),
				asc(tables.sortOrder),
				asc(tables.label)
			)
			.all()
			.map((row) => row.tables);
	}

	get(id: number): TableRecord | undefined {
		return this.db.select().from(tables).where(eq(tables.id, id)).get();
	}

	create(input: TableInput): TableRecord {
		return this.db.insert(tables).values(input).returning().get();
	}

	update(id: number, input: Partial<TableInput>) {
		this.db.update(tables).set(input).where(eq(tables.id, id)).run();
	}

	delete(id: number) {
		this.db.delete(tables).where(eq(tables.id, id)).run();
	}

	/**
	 * Applies all changes and the area's numbering atomically: updates (freeing cells) first, then
	 * deletes, then inserts.
	 */
	apply(areaId: number, changes: TableChanges, area: Partial<AreaInput> = {}) {
		this.db.transaction((tx) => {
			for (const { id, input } of changes.update)
				tx.update(tables).set(input).where(eq(tables.id, id)).run();
			for (const id of changes.delete) tx.delete(tables).where(eq(tables.id, id)).run();
			if (changes.create.length > 0) tx.insert(tables).values(changes.create).run();
			if (Object.keys(area).length > 0)
				tx.update(areas).set(area).where(eq(areas.id, areaId)).run();
		});
	}

	hasOrders(id: number): boolean {
		return countRows(this.db, orders, eq(orders.tableId, id)) > 0;
	}

	/** Whether any table of the area has orders. */
	areaHasOrders(areaId: number): boolean {
		const areaTables = this.db
			.select({ id: tables.id })
			.from(tables)
			.where(eq(tables.areaId, areaId));
		return countRows(this.db, orders, inArray(orders.tableId, areaTables)) > 0;
	}
}
