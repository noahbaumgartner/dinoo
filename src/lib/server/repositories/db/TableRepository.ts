import { asc, eq } from 'drizzle-orm';
import { countRows, type Db } from './client';
import { orders, tables } from './schema';
import type { TableRecord } from './types';

export type TableInput = {
	label: string;
	sortOrder: number;
	active: boolean;
};

export class TableRepository {
	constructor(private readonly db: Db) {}

	list(): TableRecord[] {
		return this.db.select().from(tables).orderBy(asc(tables.sortOrder), asc(tables.label)).all();
	}

	get(id: number): TableRecord | undefined {
		return this.db.select().from(tables).where(eq(tables.id, id)).get();
	}

	create(input: TableInput): TableRecord {
		return this.db.insert(tables).values(input).returning().get();
	}

	createMany(inputs: TableInput[]) {
		if (inputs.length > 0) this.db.insert(tables).values(inputs).run();
	}

	update(id: number, input: Partial<TableInput>) {
		this.db.update(tables).set(input).where(eq(tables.id, id)).run();
	}

	delete(id: number) {
		this.db.delete(tables).where(eq(tables.id, id)).run();
	}

	hasOrders(id: number): boolean {
		return countRows(this.db, orders, eq(orders.tableId, id)) > 0;
	}
}
