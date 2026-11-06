import { getRequestEvent } from '$app/server';
import { env } from '$env/dynamic/private';
import path from 'node:path';
import { EscPosPrinterDeviceRepository } from './repositories/printer/EscPosPrinterDeviceRepository';
import { FakePrinterDeviceRepository } from './repositories/printer/FakePrinterDeviceRepository';
import { Runtime } from './runtime';

let runtime: Runtime | undefined;

/**
 * The single runtime of this process. `PRINTER_DRIVER=fake` replaces the network printers with a
 * console logger (development without hardware); `DATA_DIR` sets where event databases live.
 */
export function app(): Runtime {
	if (!runtime) {
		runtime = new Runtime({
			dataDir: path.resolve(env.DATA_DIR || 'data'),
			device:
				env.PRINTER_DRIVER === 'fake'
					? new FakePrinterDeviceRepository(true)
					: new EscPosPrinterDeviceRepository(),
			getRequestEvent
		});
		runtime.worker.start();
	}
	return runtime;
}
