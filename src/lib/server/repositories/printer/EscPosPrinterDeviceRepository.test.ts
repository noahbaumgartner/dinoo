import { createServer, type AddressInfo, type Server, type Socket } from 'node:net';
import { afterEach, describe, expect, it } from 'vite-plus/test';
import { EscPosPrinterDeviceRepository } from './EscPosPrinterDeviceRepository';
import type { Ticket } from './ticket';

const ticket: Ticket = { lines: [{ type: 'text', text: 'Pommes' }] };
const READY = 0x12;

type Behaviour = { answer: boolean; status?: (n: number) => number };

/** A minimal ESC/POS printer on localhost that answers `DLE EOT n` like an Epson TM. */
function fakePrinter(behaviour: Behaviour) {
	const received: Buffer[] = [];
	const server: Server = createServer((socket: Socket) => {
		socket.on('data', (data) => {
			received.push(data);
			if (!behaviour.answer) return;
			for (let i = 0; i + 2 < data.length; i++) {
				if (data[i] === 0x10 && data[i + 1] === 0x04) {
					socket.write(Buffer.from([behaviour.status?.(data[i + 2]) ?? READY]));
				}
			}
		});
	});
	return new Promise<{ server: Server; port: number; received: () => string }>((resolve) =>
		server.listen(0, '127.0.0.1', () =>
			resolve({
				server,
				port: (server.address() as AddressInfo).port,
				received: () => Buffer.concat(received).toString('latin1')
			})
		)
	);
}

let servers: Server[] = [];
afterEach(() => {
	for (const server of servers) server.close();
	servers = [];
});

async function print(behaviour: Behaviour) {
	const printer = await fakePrinter(behaviour);
	servers.push(printer.server);
	const result = new EscPosPrinterDeviceRepository(300)
		.print({ host: '127.0.0.1', port: printer.port, model: 'TM-T20IV' }, ticket)
		.then(() => 'ok');
	return { result, received: printer.received };
}

describe('EscPosPrinterDeviceRepository', () => {
	it('sends the ticket when the printer answers the status queries', async () => {
		const { result, received } = await print({ answer: true });
		await expect(result).resolves.toBe('ok');
		expect(received()).toContain('Pommes');
	});

	it('fails when the printer accepts the connection but never answers', async () => {
		const { result, received } = await print({ answer: false });
		await expect(result).rejects.toThrow('Drucker antwortet nicht');
		expect(received()).not.toContain('Pommes');
	});

	it('reports an open cover and does not send the ticket', async () => {
		const { result, received } = await print({
			answer: true,
			status: (n) => (n === 2 ? READY | 0x04 : READY)
		});
		await expect(result).rejects.toThrow('Deckel offen');
		expect(received()).not.toContain('Pommes');
	});

	it('reports paper out', async () => {
		const { result } = await print({
			answer: true,
			status: (n) => (n === 4 ? READY | 0x60 : READY)
		});
		await expect(result).rejects.toThrow('Papier leer');
	});
});
