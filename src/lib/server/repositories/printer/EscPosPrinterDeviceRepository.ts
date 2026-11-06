import { CharacterSet, PrinterTypes, ThermalPrinter } from 'node-thermal-printer';
import type { PrinterDeviceRepository, PrinterTarget } from './PrinterDeviceRepository';
import type { Ticket } from './ticket';

const TIMEOUT_MS = 4000;

/** Epson TM-T20III / TM-T20IV over the network (ESC/POS on TCP, usually port 9100). */
export class EscPosPrinterDeviceRepository implements PrinterDeviceRepository {
	async print(target: PrinterTarget, ticket: Ticket): Promise<void> {
		const printer = new ThermalPrinter({
			type: PrinterTypes.EPSON,
			interface: `tcp://${target.host}:${target.port}`,
			// PC858 covers German umlauts and the euro sign on both models.
			characterSet: CharacterSet.PC858_EURO,
			removeSpecialCharacters: false,
			width: 42,
			options: { timeout: TIMEOUT_MS }
		});

		for (const line of ticket.lines) {
			switch (line.type) {
				case 'text':
					if (line.align === 'center') printer.alignCenter();
					else printer.alignLeft();
					if (line.size === 'large') printer.setTextQuadArea();
					else printer.setTextNormal();
					printer.bold(Boolean(line.bold));
					printer.println(line.text);
					break;
				case 'pair':
					printer.alignLeft();
					printer.setTextNormal();
					printer.bold(Boolean(line.bold));
					printer.leftRight(line.left, line.right);
					break;
				case 'rule':
					printer.setTextNormal();
					printer.bold(false);
					printer.drawLine();
					break;
				case 'feed':
					printer.newLine();
					break;
			}
		}
		printer.setTextNormal();
		printer.bold(false);
		printer.cut();

		// `execute` resolves once the socket was written and closed, and rejects on connection
		// errors and timeouts, so a resolved promise means the printer accepted the data.
		await printer.execute();
	}
}
