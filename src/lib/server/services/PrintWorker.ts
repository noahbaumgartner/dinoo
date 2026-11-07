import type { PrinterRepository } from '../repositories/db/PrinterRepository';
import type { PrintJobRepository } from '../repositories/db/PrintJobRepository';
import type { PrinterRecord } from '../repositories/db/types';
import type { PrinterDeviceRepository } from '../repositories/printer/PrinterDeviceRepository';
import type { Ticket } from '../repositories/printer/ticket';

export type PrintWorkerRepositories = {
	printJobs: PrintJobRepository;
	printers: PrinterRepository;
};

export type PrintWorkerOptions = {
	tickMs: number;
	/** Wait times after consecutive failures; the last value repeats forever. */
	backoffMs: number[];
};

type PrinterState = { busy: boolean; failures: number; nextAttemptAt: number };

const DEFAULT_OPTIONS: PrintWorkerOptions = {
	tickMs: 1000,
	backoffMs: [2000, 5000, 15000, 30000]
};

/**
 * Works off the print queue: one lane per printer, strictly oldest job first. A failed job stays
 * queued and the printer is retried with growing pauses until it is reachable again, then every
 * waiting job is printed in order.
 */
export class PrintWorker {
	private readonly states = new Map<number, PrinterState>();
	private readonly options: PrintWorkerOptions;
	private timer: ReturnType<typeof setInterval> | null = null;
	private running = new Set<Promise<void>>();

	constructor(
		/** Called on every tick, so switching the event database is picked up automatically. */
		private readonly repositories: () => PrintWorkerRepositories,
		private readonly device: PrinterDeviceRepository,
		options: Partial<PrintWorkerOptions> = {},
		private readonly now: () => Date = () => new Date()
	) {
		this.options = { ...DEFAULT_OPTIONS, ...options };
	}

	start() {
		if (this.timer) return;
		this.repositories().printJobs.resetPrinting();
		this.timer = setInterval(() => void this.tick(), this.options.tickMs);
		void this.tick();
	}

	stop() {
		if (this.timer) clearInterval(this.timer);
		this.timer = null;
	}

	/** Prints new jobs right away instead of waiting for the next tick. */
	kick(printerId?: number) {
		if (printerId !== undefined) {
			const state = this.states.get(printerId);
			// An explicit kick (new job, reprint, test print) retries a failing printer immediately.
			if (state) state.nextAttemptAt = 0;
		}
		void this.tick();
	}

	/** Forget backoff state, e.g. after switching the database. */
	reset() {
		this.states.clear();
	}

	/** One pass over all printers. Resolves once every started lane is idle (used by tests). */
	async tick(): Promise<void> {
		let repositories: PrintWorkerRepositories;
		try {
			repositories = this.repositories();
		} catch {
			return;
		}
		const now = this.now().getTime();
		for (const printer of repositories.printers.list()) {
			if (!printer.active) continue;
			const state = this.state(printer.id);
			if (state.busy || now < state.nextAttemptAt) continue;
			state.busy = true;
			const lane = this.drain(repositories, printer, state).finally(() => {
				state.busy = false;
				this.running.delete(lane);
			});
			this.running.add(lane);
		}
		await Promise.all(this.running);
	}

	private state(printerId: number): PrinterState {
		let state = this.states.get(printerId);
		if (!state) {
			state = { busy: false, failures: 0, nextAttemptAt: 0 };
			this.states.set(printerId, state);
		}
		return state;
	}

	private async drain(
		repositories: PrintWorkerRepositories,
		printer: PrinterRecord,
		state: PrinterState
	) {
		for (;;) {
			const job = repositories.printJobs.nextQueued(printer.id);
			if (!job) return;
			if (!repositories.printJobs.claim(job.id, printer.id, this.now())) continue;
			try {
				await this.device.print(
					{ host: printer.host, port: printer.port, model: printer.model },
					JSON.parse(job.payload) as Ticket
				);
				const at = this.now();
				repositories.printJobs.markPrinted(job.id, at);
				repositories.printers.markSuccess(printer.id, at);
				state.failures = 0;
				state.nextAttemptAt = 0;
			} catch (error) {
				const message = error instanceof Error ? error.message : String(error);
				try {
					repositories.printJobs.markAttemptFailed(job.id, message);
					repositories.printers.markError(printer.id, this.now(), message);
				} catch {
					// The database was switched while printing; the job stays with the old database.
				}
				state.failures += 1;
				const delays = this.options.backoffMs;
				state.nextAttemptAt =
					this.now().getTime() + delays[Math.min(state.failures - 1, delays.length - 1)];
				return;
			}
		}
	}
}
