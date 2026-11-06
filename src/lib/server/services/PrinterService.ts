import type { PrinterInput, PrinterRepository } from '../repositories/db/PrinterRepository';
import type { PrintJobRepository } from '../repositories/db/PrintJobRepository';
import type { PrinterRecord } from '../repositories/db/types';
import { DomainError, notFound } from './errors';

const HOST_PATTERN = /^[a-zA-Z0-9.-]{1,253}$/;

/** Printer configuration (F05). The queue itself is `PrintQueueService`. */
export class PrinterService {
	constructor(
		private readonly printers: PrinterRepository,
		private readonly printJobs: PrintJobRepository
	) {}

	list(): PrinterRecord[] {
		return this.printers.list();
	}

	save(id: number | null, input: PrinterInput): PrinterRecord | undefined {
		const clean = { ...input, name: input.name.trim(), host: input.host.trim() };
		if (!clean.name) throw new DomainError('Bitte einen Namen für den Drucker angeben.');
		if (!HOST_PATTERN.test(clean.host))
			throw new DomainError('Bitte eine gültige IP-Adresse oder einen Hostnamen angeben.');
		if (!Number.isInteger(clean.port) || clean.port < 1 || clean.port > 65535)
			throw new DomainError('Der Port muss zwischen 1 und 65535 liegen.');
		if (id === null) return this.printers.create(clean);
		const existing = this.printers.get(id) ?? notFound('Drucker');
		if (existing.active && !clean.active && this.printJobs.countPending(id) > 0)
			throw new DomainError(
				'Der Drucker hat noch wartende Druckaufträge. Bitte zuerst umleiten oder abbrechen.',
				409
			);
		this.printers.update(id, clean);
	}

	/** Printers in use are only deactivated, never deleted. */
	delete(id: number): 'deleted' | 'deactivated' {
		const printer = this.printers.get(id) ?? notFound('Drucker');
		if (this.printJobs.countPending(id) > 0)
			throw new DomainError(
				'Der Drucker hat noch wartende Druckaufträge. Bitte zuerst umleiten oder abbrechen.',
				409
			);
		if (this.printers.isAssigned(id) || this.hasHistory(id)) {
			this.printers.update(id, { ...printer, active: false });
			return 'deactivated';
		}
		this.printers.delete(id);
		return 'deleted';
	}

	private hasHistory(id: number) {
		return this.printJobs.list({ printerId: id, limit: 1 }).length > 0;
	}
}
