import type { TableInput, TableRepository } from '../repositories/db/TableRepository';
import type { TableRecord } from '../repositories/db/types';
import { DomainError, ensure } from './errors';

const MAX_BULK = 200;

export class TableService {
	constructor(private readonly tables: TableRepository) {}

	list(): TableRecord[] {
		return this.tables.list();
	}

	save(id: number | null, input: TableInput): TableRecord | undefined {
		const label = input.label.trim();
		if (!label) throw new DomainError('Bitte eine Bezeichnung für den Tisch angeben.');
		if (id === null) return this.tables.create({ ...input, label });
		ensure(this.tables.get(id), 'Tisch');
		this.tables.update(id, { ...input, label });
	}

	/** «Tische 1–30 anlegen»: skips labels that already exist. */
	createRange(from: number, to: number): number {
		if (!Number.isInteger(from) || !Number.isInteger(to) || from < 0 || to < from)
			throw new DomainError('Bitte einen gültigen Bereich angeben, z. B. 1 bis 30.');
		if (to - from + 1 > MAX_BULK) throw new DomainError(`Höchstens ${MAX_BULK} Tische auf einmal.`);
		const existing = this.tables.list();
		const labels = new Set(existing.map((table) => table.label));
		let sortOrder = Math.max(0, ...existing.map((table) => table.sortOrder));
		const inputs: TableInput[] = [];
		for (let number = from; number <= to; number += 1) {
			if (labels.has(String(number))) continue;
			sortOrder += 1;
			inputs.push({ label: String(number), sortOrder, active: true });
		}
		this.tables.createMany(inputs);
		return inputs.length;
	}

	/** Tables with orders are only deactivated. */
	delete(id: number): 'deleted' | 'deactivated' {
		ensure(this.tables.get(id), 'Tisch');
		if (this.tables.hasOrders(id)) {
			this.tables.update(id, { active: false });
			return 'deactivated';
		}
		this.tables.delete(id);
		return 'deleted';
	}
}
