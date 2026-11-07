import { and, asc, desc, eq, inArray, sql, type SQL } from 'drizzle-orm';
import { countRows, type Db } from './client';
import { orders, printers, printJobs } from './schema';
import type { PrintJobRecord, PrintJobStatus } from './types';

export type NewPrintJob = Pick<PrintJobRecord, 'kind' | 'orderId' | 'printerId' | 'payload'>;

export type PrintJobFilter = {
	printerId?: number;
	status?: PrintJobStatus | 'pending';
	limit?: number;
};

export type PrintJobListItem = PrintJobRecord & {
	printerName: string;
	orderNumber: number | null;
	tableLabel: string | null;
};

const PENDING: PrintJobStatus[] = ['queued', 'printing'];

/** The persistent print queue. */
export class PrintJobRepository {
	constructor(private readonly db: Db) {}

	enqueue(jobs: NewPrintJob[], at: Date) {
		if (jobs.length === 0) return;
		this.db
			.insert(printJobs)
			.values(jobs.map((job) => ({ ...job, status: 'queued' as const, createdAt: at })))
			.run();
	}

	get(id: number): PrintJobRecord | undefined {
		return this.db.select().from(printJobs).where(eq(printJobs.id, id)).get();
	}

	/** Oldest queued job of a printer (strict FIFO per printer). */
	nextQueued(printerId: number): PrintJobRecord | undefined {
		return this.db
			.select()
			.from(printJobs)
			.where(and(eq(printJobs.printerId, printerId), eq(printJobs.status, 'queued')))
			.orderBy(asc(printJobs.createdAt), asc(printJobs.id))
			.get();
	}

	/** Atomically claims a queued job; false if it changed in the meantime (e.g. cancelled). */
	claim(id: number, printerId: number, at: Date): boolean {
		const result = this.db
			.update(printJobs)
			.set({ status: 'printing', lastAttemptAt: at, attempts: sql`${printJobs.attempts} + 1` })
			.where(
				and(
					eq(printJobs.id, id),
					eq(printJobs.printerId, printerId),
					eq(printJobs.status, 'queued')
				)
			)
			.run();
		return result.changes === 1;
	}

	markPrinted(id: number, at: Date) {
		this.db
			.update(printJobs)
			.set({ status: 'printed', printedAt: at, lastError: null })
			.where(eq(printJobs.id, id))
			.run();
	}

	/** A failed attempt puts the job back in the queue; it is never dropped. */
	markAttemptFailed(id: number, error: string) {
		this.db
			.update(printJobs)
			.set({ status: 'queued', lastError: error })
			.where(and(eq(printJobs.id, id), eq(printJobs.status, 'printing')))
			.run();
	}

	/** After a crash, jobs left in `printing` go back to the queue. */
	resetPrinting() {
		this.db
			.update(printJobs)
			.set({ status: 'queued' })
			.where(eq(printJobs.status, 'printing'))
			.run();
	}

	cancel(id: number): boolean {
		return (
			this.db
				.update(printJobs)
				.set({ status: 'cancelled' })
				.where(and(eq(printJobs.id, id), eq(printJobs.status, 'queued')))
				.run().changes === 1
		);
	}

	countPendingByPrinter(): Map<number, number> {
		const rows = this.db
			.select({ printerId: printJobs.printerId, count: sql<number>`count(*)` })
			.from(printJobs)
			.where(inArray(printJobs.status, PENDING))
			.groupBy(printJobs.printerId)
			.all();
		return new Map(rows.map((row) => [row.printerId, Number(row.count)]));
	}

	countPending(printerId?: number): number {
		const conditions = [inArray(printJobs.status, PENDING)];
		if (printerId !== undefined) conditions.push(eq(printJobs.printerId, printerId));
		return countRows(this.db, printJobs, and(...conditions));
	}

	listByOrder(orderId: number): PrintJobListItem[] {
		return this.list({ limit: 50 }, eq(printJobs.orderId, orderId));
	}

	list(filter: PrintJobFilter, extra?: SQL): PrintJobListItem[] {
		const conditions: SQL[] = [];
		if (extra) conditions.push(extra);
		if (filter.printerId !== undefined) conditions.push(eq(printJobs.printerId, filter.printerId));
		if (filter.status === 'pending') conditions.push(inArray(printJobs.status, PENDING));
		else if (filter.status) conditions.push(eq(printJobs.status, filter.status));

		return this.db
			.select({
				job: printJobs,
				printerName: printers.name,
				orderNumber: orders.orderNumber,
				tableLabel: orders.tableLabel
			})
			.from(printJobs)
			.innerJoin(printers, eq(printers.id, printJobs.printerId))
			.leftJoin(orders, eq(orders.id, printJobs.orderId))
			.where(conditions.length > 0 ? and(...conditions) : undefined)
			.orderBy(
				filter.status === 'pending' ? asc(printJobs.createdAt) : desc(printJobs.createdAt),
				asc(printJobs.id)
			)
			.limit(filter.limit ?? 200)
			.all()
			.map((row) => ({
				...row.job,
				printerName: row.printerName,
				orderNumber: row.orderNumber,
				tableLabel: row.tableLabel
			}));
	}
}
