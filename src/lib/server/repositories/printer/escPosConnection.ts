import { connect, type Socket } from 'node:net';

/**
 * One TCP session with an ESC/POS printer (port 9100) that can also read the printer's answers.
 * Writing alone proves nothing: the printer's network interface accepts data even when the
 * printer behind it is stuck, so callers ask for the real-time status before and after a ticket.
 */
export class EscPosConnection {
	private received = Buffer.alloc(0);
	private failure: Error | null = null;
	private notify: (() => void) | null = null;

	private constructor(
		private readonly socket: Socket,
		private readonly timeoutMs: number
	) {
		socket.on('data', (data) => {
			this.received = Buffer.concat([this.received, data]);
			this.notify?.();
		});
		socket.on('error', (error) => this.fail(error));
		socket.on('close', () => this.fail(new Error('Verbindung zum Drucker getrennt')));
	}

	static open(host: string, port: number, timeoutMs: number): Promise<EscPosConnection> {
		return new Promise((resolve, reject) => {
			const socket = connect({ host, port });
			const timer = setTimeout(() => {
				socket.destroy();
				reject(new Error(`Zeitüberschreitung beim Verbinden mit ${host}:${port}`));
			}, timeoutMs);
			socket.once('error', (error) => {
				clearTimeout(timer);
				socket.destroy();
				reject(error);
			});
			socket.once('connect', () => {
				clearTimeout(timer);
				socket.removeAllListeners('error');
				resolve(new EscPosConnection(socket, timeoutMs));
			});
		});
	}

	write(data: Buffer): Promise<void> {
		return new Promise((resolve, reject) => {
			if (this.failure) return reject(this.failure);
			this.socket.write(data, (error) => (error ? reject(error) : resolve()));
		});
	}

	/** Sends `DLE EOT n` and returns the single status byte the printer answers with. */
	async status(n: 1 | 2 | 3 | 4): Promise<number> {
		await this.write(Buffer.from([0x10, 0x04, n]));
		const byte = await this.readByte();
		// Every real-time status byte has bit 1 and 4 set and bit 0 and 7 cleared.
		if ((byte & 0x93) !== 0x12) {
			throw new Error(`Unerwartete Antwort vom Drucker (0x${byte.toString(16)})`);
		}
		return byte;
	}

	/** Closes the session gracefully so the printer keeps everything it received. */
	close(): Promise<void> {
		return new Promise((resolve) => {
			if (this.socket.destroyed) return resolve();
			const timer = setTimeout(() => this.socket.destroy(), this.timeoutMs);
			this.socket.once('close', () => {
				clearTimeout(timer);
				resolve();
			});
			this.socket.end();
		});
	}

	destroy() {
		this.socket.destroy();
	}

	private readByte(): Promise<number> {
		return new Promise((resolve, reject) => {
			const finish = () => {
				clearTimeout(timer);
				this.notify = null;
			};
			const check = () => {
				if (this.received.length > 0) {
					const byte = this.received[0];
					this.received = this.received.subarray(1);
					finish();
					resolve(byte);
				} else if (this.failure) {
					finish();
					reject(this.failure);
				}
			};
			const timer = setTimeout(() => {
				this.notify = null;
				reject(
					new Error('Drucker antwortet nicht (Daten werden angenommen, aber nicht verarbeitet)')
				);
			}, this.timeoutMs);
			this.notify = check;
			check();
		});
	}

	private fail(error: Error) {
		this.failure ??= error;
		this.notify?.();
	}
}

/**
 * Reads the printer's real-time status and throws a readable error if it cannot print right now
 * (offline, cover open, paper out, cutter or other errors).
 */
export async function assertReady(connection: EscPosConnection): Promise<void> {
	const printer = await connection.status(1);
	const offline = await connection.status(2);
	const error = await connection.status(3);
	const paper = await connection.status(4);

	const problems: string[] = [];
	if (offline & 0x04) problems.push('Deckel offen');
	if (offline & 0x20 || paper & 0x60) problems.push('Papier leer');
	if (error & 0x08) problems.push('Fehler am Abschneider');
	if (error & 0x20) problems.push('nicht behebbarer Druckerfehler');
	if (error & 0x40) problems.push('Druckerfehler (z. B. Druckkopf überhitzt)');
	if (problems.length === 0 && (offline & 0x40 || printer & 0x08)) problems.push('Drucker offline');
	if (problems.length > 0) throw new Error(problems.join(', '));
}
