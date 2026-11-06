import type { PrinterDeviceRepository, PrinterTarget } from './PrinterDeviceRepository';
import { ticketToText, type Ticket } from './ticket';

export type FakePrint = { target: PrinterTarget; ticket: Ticket; text: string; at: Date };

/**
 * Stand-in for real printers in development and tests. Hosts listed in `offlineHosts` (or any host
 * starting with `offline`) fail like an unreachable printer.
 */
export class FakePrinterDeviceRepository implements PrinterDeviceRepository {
	readonly printed: FakePrint[] = [];
	readonly offlineHosts = new Set<string>();

	constructor(private readonly log = false) {}

	async print(target: PrinterTarget, ticket: Ticket): Promise<void> {
		if (this.offlineHosts.has(target.host) || target.host.startsWith('offline')) {
			throw new Error(`connect ECONNREFUSED ${target.host}:${target.port}`);
		}
		const text = ticketToText(ticket);
		this.printed.push({ target, ticket, text, at: new Date() });
		if (this.log) console.log(`\n[fake printer ${target.host}:${target.port}]\n${text}\n`);
	}
}
