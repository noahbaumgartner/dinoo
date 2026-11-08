import { request as httpRequest } from 'node:http';
import { request as httpsRequest } from 'node:https';
import { CharacterSet, PrinterTypes, ThermalPrinter } from 'node-thermal-printer';
import type { PrinterDeviceRepository, PrinterTarget } from './PrinterDeviceRepository';
import { textScale, TICKET_WIDTH, type Ticket } from './ticket';

/** How long the printer itself may take to print before it reports `EX_TIMEOUT`. */
const PRINTER_TIMEOUT_MS = 10000;
/** Extra time for the HTTP round trip on top of the printer timeout. */
const REQUEST_SLACK_MS = 5000;

export type EposOptions = {
	/** The printers serve ePOS-Print over HTTPS with a self-signed certificate. */
	protocol: 'https:' | 'http:';
	printerTimeoutMs: number;
};

/**
 * Epson TM-T20III / TM-T20IV through the printer's built-in ePOS-Print web service (SOAP over
 * HTTPS, `/cgi-bin/epos/service.cgi`). The ticket is still rendered as ESC/POS and passed in a
 * `<command>` element. Unlike raw TCP on port 9100, the printer answers only after it printed, and
 * reports why it could not (cover open, paper out, timeout).
 */
export class EposPrinterDeviceRepository implements PrinterDeviceRepository {
	private readonly options: EposOptions;

	constructor(options: Partial<EposOptions> = {}) {
		this.options = { protocol: 'https:', printerTimeoutMs: PRINTER_TIMEOUT_MS, ...options };
	}

	async print(target: PrinterTarget, ticket: Ticket): Promise<void> {
		const body = eposEnvelope(renderEscPos(ticket));
		const response = await this.post(target, body);
		const result = parseResponse(response);
		if (!result.success) throw new Error(describeFailure(result.code));
	}

	private post(target: PrinterTarget, body: string): Promise<string> {
		const { protocol, printerTimeoutMs } = this.options;
		const request = protocol === 'https:' ? httpsRequest : httpRequest;
		return new Promise((resolve, reject) => {
			const req = request(
				{
					protocol,
					host: target.host,
					port: target.port,
					method: 'POST',
					path: `/cgi-bin/epos/service.cgi?devid=local_printer&timeout=${printerTimeoutMs}`,
					headers: {
						'Content-Type': 'text/xml; charset=utf-8',
						'Content-Length': Buffer.byteLength(body),
						SOAPAction: '""'
					},
					// Offline network without a CA: the printers only have self-signed certificates.
					rejectUnauthorized: false,
					timeout: printerTimeoutMs + REQUEST_SLACK_MS
				},
				(res) => {
					const chunks: Buffer[] = [];
					res.on('data', (chunk: Buffer) => chunks.push(chunk));
					res.on('end', () => {
						const text = Buffer.concat(chunks).toString('utf8');
						if (res.statusCode !== 200) {
							reject(new Error(`ePOS-Print antwortet mit HTTP ${res.statusCode}`));
						} else resolve(text);
					});
				}
			);
			req.on('timeout', () =>
				req.destroy(new Error('Zeitüberschreitung: Drucker antwortet nicht'))
			);
			req.on('error', reject);
			req.end(body);
		});
	}
}

export function eposEnvelope(escPos: Buffer): string {
	return (
		'<?xml version="1.0" encoding="utf-8"?>' +
		'<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"><s:Body>' +
		'<epos-print xmlns="http://www.epson-pos.com/schemas/2011/03/epos-print">' +
		`<command>${escPos.toString('hex')}</command>` +
		'</epos-print></s:Body></s:Envelope>'
	);
}

export function parseResponse(xml: string): { success: boolean; code: string } {
	const tag = /<(?:\w+:)?response\b[^>]*>/.exec(xml)?.[0];
	if (!tag) throw new Error('Unerwartete Antwort von ePOS-Print');
	const attribute = (name: string) => new RegExp(`\\b${name}="([^"]*)"`).exec(tag)?.[1] ?? '';
	return { success: attribute('success') === 'true', code: attribute('code') };
}

const FAILURES: Record<string, string> = {
	EPTR_COVER_OPEN: 'Deckel offen',
	EPTR_REC_EMPTY: 'Papier leer',
	EPTR_AUTOCUTTER: 'Fehler am Abschneider',
	EPTR_CUTTER: 'Fehler am Abschneider',
	EPTR_MECHANICAL: 'Mechanischer Fehler',
	EPTR_UNRECOVERABLE: 'Nicht behebbarer Druckerfehler',
	EPTR_AUTOMATICAL: 'Druckerfehler (z. B. Druckkopf überhitzt)',
	EX_TIMEOUT: 'Zeitüberschreitung: Drucker antwortet nicht',
	EX_BADPORT: 'Drucker nicht verbunden',
	DeviceNotFound: 'Drucker «local_printer» in ePOS-Print nicht gefunden',
	SchemaError: 'ePOS-Print hat den Auftrag abgelehnt (SchemaError)',
	PrintSystemError: 'Fehler im Drucksystem des Druckers'
};

function describeFailure(code: string): string {
	return FAILURES[code] ?? `Druck fehlgeschlagen${code ? ` (${code})` : ''}`;
}

/** Translates the structured ticket into ESC/POS bytes. */
export function renderEscPos(ticket: Ticket): Buffer {
	const printer = new ThermalPrinter({
		type: PrinterTypes.EPSON,
		// Only used to build the bytes; sending goes through ePOS-Print.
		interface: 'tcp://localhost',
		// PC858 covers German umlauts and the euro sign on both models.
		characterSet: CharacterSet.PC858_EURO,
		removeSpecialCharacters: false,
		width: TICKET_WIDTH
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
	return printer.getBuffer();
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
