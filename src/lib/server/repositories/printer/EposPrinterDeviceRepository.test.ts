import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterEach, describe, expect, it } from 'vite-plus/test';
import { EposPrinterDeviceRepository, parseResponse } from './EposPrinterDeviceRepository';
import type { Ticket } from './ticket';

const ticket: Ticket = { lines: [{ type: 'text', text: 'Pommes' }] };

function eposResponse(success: boolean, code = '') {
	return (
		'<?xml version="1.0" encoding="UTF-8"?><soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"><soapenv:Body>' +
		`<response success="${success}" code="${code}" status="251658262" battery="0" xmlns="http://www.epson-pos.com/schemas/2011/03/epos-print"/>` +
		'</soapenv:Body></soapenv:Envelope>'
	);
}

let servers: Server[] = [];
afterEach(() => {
	for (const server of servers) server.close();
	servers = [];
});

/** A stand-in for the printer's ePOS-Print service that records requests. */
async function fakeEpos(reply: (body: string) => string | null) {
	const requests: { path: string; body: string }[] = [];
	const server = createServer((req, res) => {
		let body = '';
		req.on('data', (chunk) => (body += chunk));
		req.on('end', () => {
			requests.push({ path: req.url ?? '', body });
			const answer = reply(body);
			if (answer !== null) res.end(answer);
		});
	});
	servers.push(server);
	await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
	const port = (server.address() as AddressInfo).port;
	const device = new EposPrinterDeviceRepository({ protocol: 'http:', printerTimeoutMs: 200 });
	const print = () => device.print({ host: '127.0.0.1', port, model: 'TM-T20IV' }, ticket);
	return { print, requests };
}

describe('EposPrinterDeviceRepository', () => {
	it('posts the ticket as ESC/POS command to the local printer', async () => {
		const epos = await fakeEpos(() => eposResponse(true));
		await epos.print();
		expect(epos.requests).toHaveLength(1);
		expect(epos.requests[0].path).toContain('/cgi-bin/epos/service.cgi?devid=local_printer');
		const hex = /<command>([0-9a-f]+)<\/command>/.exec(epos.requests[0].body)?.[1];
		expect(Buffer.from(hex!, 'hex').toString('latin1')).toContain('Pommes');
	});

	it('reports the printer error in German', async () => {
		const epos = await fakeEpos(() => eposResponse(false, 'EPTR_COVER_OPEN'));
		await expect(epos.print()).rejects.toThrow('Deckel offen');
	});

	it('fails when the printer does not finish in time', async () => {
		const epos = await fakeEpos(() => eposResponse(false, 'EX_TIMEOUT'));
		await expect(epos.print()).rejects.toThrow('Drucker antwortet nicht');
	});

	it('fails when the service never answers', async () => {
		const epos = await fakeEpos(() => null);
		await expect(epos.print()).rejects.toThrow('Zeitüberschreitung');
	}, 10000);

	it('reads success and code from the response', () => {
		expect(parseResponse(eposResponse(true))).toEqual({ success: true, code: '' });
		expect(() => parseResponse('<html/>')).toThrow();
	});
});
