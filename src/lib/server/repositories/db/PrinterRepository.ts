import { asc, eq } from 'drizzle-orm';
import type { Db } from './client';
import { articles, categories, printers } from './schema';
import type { PrinterModel, PrinterRecord } from './types';

export type PrinterInput = {
	name: string;
	host: string;
	port: number;
	model: PrinterModel;
	active: boolean;
};

/** Printer configuration stored in the database (the device itself is `PrinterDeviceRepository`). */
export class PrinterRepository {
	constructor(private readonly db: Db) {}

	list(): PrinterRecord[] {
		return this.db.select().from(printers).orderBy(asc(printers.name)).all();
	}

	get(id: number): PrinterRecord | undefined {
		return this.db.select().from(printers).where(eq(printers.id, id)).get();
	}

	create(input: PrinterInput): PrinterRecord {
		return this.db.insert(printers).values(input).returning().get();
	}

	update(id: number, input: PrinterInput) {
		this.db.update(printers).set(input).where(eq(printers.id, id)).run();
	}

	delete(id: number) {
		this.db.delete(printers).where(eq(printers.id, id)).run();
	}

	isAssigned(id: number): boolean {
		const category = this.db
			.select({ id: categories.id })
			.from(categories)
			.where(eq(categories.defaultPrinterId, id))
			.get();
		const article = this.db
			.select({ id: articles.id })
			.from(articles)
			.where(eq(articles.printerId, id))
			.get();
		return Boolean(category || article);
	}

	/** Sets or (with `null`) lifts the redirect of a printer. */
	setRedirect(id: number, targetId: number | null, at: Date | null) {
		this.db
			.update(printers)
			.set({ redirectToPrinterId: targetId, redirectedAt: targetId === null ? null : at })
			.where(eq(printers.id, id))
			.run();
	}

	markSuccess(id: number, at: Date) {
		this.db
			.update(printers)
			.set({ lastSuccessAt: at, lastError: null })
			.where(eq(printers.id, id))
			.run();
	}

	markError(id: number, at: Date, error: string) {
		this.db
			.update(printers)
			.set({ lastErrorAt: at, lastError: error })
			.where(eq(printers.id, id))
			.run();
	}
}
