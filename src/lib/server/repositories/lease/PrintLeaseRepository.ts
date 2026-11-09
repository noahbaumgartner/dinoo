import fs from 'node:fs';
import path from 'node:path';

export type PrintLease = {
	/** Unique per worker instance, so two processes never mistake each other's lease for their own. */
	owner: string;
	/** Higher wins: a worker with real printers outranks one with simulated printers. */
	priority: number;
	heartbeatAt: number;
};

/**
 * A file in the data directory telling which process works off the print queue. The queue lives in
 * the event databases, which several processes may open at once (e.g. a dev server beside a
 * production one); without this, any of them would claim jobs.
 */
export class PrintLeaseRepository {
	private readonly file: string;

	constructor(dataDir: string) {
		this.file = path.join(dataDir, 'print-worker.lease');
	}

	read(): PrintLease | null {
		try {
			const raw = JSON.parse(fs.readFileSync(this.file, 'utf8')) as Partial<PrintLease>;
			return typeof raw.owner === 'string' &&
				typeof raw.priority === 'number' &&
				typeof raw.heartbeatAt === 'number'
				? (raw as PrintLease)
				: null;
		} catch {
			return null;
		}
	}

	write(lease: PrintLease) {
		const temporary = `${this.file}.${process.pid}.tmp`;
		fs.writeFileSync(temporary, JSON.stringify(lease));
		fs.renameSync(temporary, this.file);
	}

	/** Removes the lease, but only if it still belongs to `owner`. */
	release(owner: string) {
		if (this.read()?.owner === owner) fs.rmSync(this.file, { force: true });
	}
}
