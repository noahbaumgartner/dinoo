import { CharacterSet, PrinterTypes, ThermalPrinter } from 'node-thermal-printer';
import { assertReady, EscPosConnection } from './escPosConnection';
import type { PrinterDeviceRepository, PrinterTarget } from './PrinterDeviceRepository';
import { textScale, type Ticket } from './ticket';

const TIMEOUT_MS = 4000;

/** Epson TM-T20III / TM-T20IV over the network (ESC/POS on TCP, usually port 9100). */
export class EscPosPrinterDeviceRepository implements PrinterDeviceRepository {
	constructor(private readonly timeoutMs = TIMEOUT_MS) {}

	async print(target: PrinterTarget, ticket: Ticket): Promise<void> {
		// The library only builds the bytes; the connection is our own so we can read the status.
		const printer = new ThermalPrinter({
			type: PrinterTypes.EPSON,
			interface: `tcp://${target.host}:${target.port}`,
			// PC858 covers German umlauts and the euro sign on both models.
			characterSet: CharacterSet.PC858_EURO,
			removeSpecialCharacters: false,
			width: 42
		});

		for (const line of ticket.lines) {
			switch (line.type) {
				case 'text': {
					if (line.align === 'center') printer.alignCenter();
					else if (line.align === 'right') printer.alignRight();
					else printer.alignLeft();
					setScale(printer, textScale(line));
					printer.bold(Boolean(line.bold));
					printer.underline(Boolean(line.underline));
					printer.invert(Boolean(line.invert));
					printer.println(line.text);
					break;
				}
				case 'pair':
					resetStyle(printer);
					printer.bold(Boolean(line.bold));
					printer.leftRight(line.left, line.right);
					break;
				case 'rule':
					resetStyle(printer);
					printer.drawLine(line.char ?? '-');
					break;
				case 'feed':
					for (let i = 0; i < (line.lines ?? 1); i++) printer.newLine();
					break;
			}
		}
		resetStyle(printer);
		printer.cut();

		const connection = await EscPosConnection.open(target.host, target.port, this.timeoutMs);
		try {
			// Before: refuse to send into a printer that is offline or answers nothing at all.
			await assertReady(connection);
			await connection.write(printer.getBuffer());
			// After: the printer still answers, so it read the ticket, and no error (paper out,
			// cover opened) stopped it.
			await assertReady(connection);
			await connection.close();
		} catch (error) {
			connection.destroy();
			throw error;
		}
	}
}

/**
 * ESC/POS `GS ! n`: the high nibble is the width multiplier minus one, the low nibble the height.
 * Written directly because the library's `setTextSize` puts the height into the width nibble.
 */
function setScale(printer: ThermalPrinter, scale: { width: number; height: number }) {
	const width = Math.min(Math.max(scale.width, 1), 8) - 1;
	const height = Math.min(Math.max(scale.height, 1), 8) - 1;
	printer.append(Buffer.from([0x1d, 0x21, (width << 4) | height]));
}

function resetStyle(printer: ThermalPrinter) {
	printer.alignLeft();
	setScale(printer, { width: 1, height: 1 });
	printer.bold(false);
	printer.underline(false);
	printer.invert(false);
}
