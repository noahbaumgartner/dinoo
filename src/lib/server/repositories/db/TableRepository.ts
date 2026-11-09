import { asc, eq, sql } from 'drizzle-orm';
import { countRows, type Db } from './client';
import { orders, tables } from './schema';
import type { TableRecord } from './types';

export type TableInput = {
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

	/** Seating plan by row and column first, then free tables. */
	list(): TableRecord[] {
		return this.db
			.select()
			.from(tables)
			.orderBy(
				sql`${tables.gridRow} is null`,
				asc(tables.gridRow),
				asc(tables.gridColumn),
				asc(tables.sortOrder),
				asc(tables.label)
			)
			.all();
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

	/** Activates or deactivates a whole row or column of the seating plan. */
	delete(id: number) {
		this.db.delete(tables).where(eq(tables.id, id)).run();
	}

	/** Applies all changes atomically: updates (freeing cells) first, then deletes, then inserts. */
	apply(changes: TableChanges) {
		this.db.transaction((tx) => {
			for (const { id, input } of changes.update)
				tx.update(tables).set(input).where(eq(tables.id, id)).run();
			for (const id of changes.delete) tx.delete(tables).where(eq(tables.id, id)).run();
			if (changes.create.length > 0) tx.insert(tables).values(changes.create).run();
		});
	}

	hasOrders(id: number): boolean {
		return countRows(this.db, orders, eq(orders.tableId, id)) > 0;
	}
}
