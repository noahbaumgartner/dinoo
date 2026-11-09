import type { PrinterModel } from '../db/types';
import type { Ticket } from './ticket';

export type PrinterTarget = {
	host: string;
	port: number;
	model: PrinterModel;
};

/** Access to a physical (or fake) receipt printer. Throws if the ticket was not fully accepted. */
export interface PrinterDeviceRepository {
	/** True if nothing is physically printed (development, tests). */
	readonly simulated: boolean;
	print(target: PrinterTarget, ticket: Ticket): Promise<void>;
}
