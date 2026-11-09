import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { RequestEvent } from '@sveltejs/kit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test';
import { FakePrinterDeviceRepository } from '../repositories/printer/FakePrinterDeviceRepository';
import { Runtime } from '../runtime';
import { seedBasics } from '../test-utils';

/** Pretends to be a physical printer: not simulated, so it outranks the fake driver. */
class RealLookingDevice extends FakePrinterDeviceRepository {
	override readonly simulated: boolean = false;
}

describe('print worker lease', () => {
	let dataDir: string;
	let now: Date;
	let runtimes: Runtime[];

	function open(device: FakePrinterDeviceRepository) {
		const runtime = new Runtime({
			dataDir,
			device,
			getRequestEvent: () => {
				throw new Error('No request in tests') as unknown as RequestEvent;
			},
			workerOptions: { tickMs: 60_000, backoffMs: [1000] },
			now: () => now
		});
		runtimes.push(runtime);
		return runtime;
	}

	beforeEach(() => {
		dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dinoo-lease-'));
		now = new Date('2026-06-20T18:00:00Z');
		runtimes = [];
		vi.spyOn(console, 'warn').mockImplementation(() => {});
	});

	afterEach(() => {
		for (const runtime of runtimes) runtime.close();
		fs.rmSync(dataDir, { recursive: true, force: true });
		vi.restoreAllMocks();
	});

	let printerId: number;

	/** Queues a job without kicking the worker, so each test decides which process ticks. */
	function enqueue(runtime: Runtime) {
		runtime.repositories.printJobs.enqueue(
			[
				{
					kind: 'test',
					orderId: null,
					printerId,
					payload: JSON.stringify({ lines: [{ type: 'text', text: 'Test' }] })
				}
			],
			now
		);
	}

	async function setUp(runtime: Runtime) {
		printerId = (await seedBasics(runtime)).kitchen.id;
		enqueue(runtime);
	}

	function pending(runtime: Runtime) {
		return runtime.repositories.printJobs.countPending();
	}

	it('keeps a simulated worker from printing while a real one is alive', async () => {
		const real = new RealLookingDevice();
		const fake = new FakePrinterDeviceRepository();
		const realRuntime = open(real);
		await setUp(realRuntime);
		const fakeRuntime = open(fake);

		await realRuntime.worker.tick(); // takes the lease and prints
		expect(real.printed).toHaveLength(1);

		enqueue(realRuntime);
		await fakeRuntime.worker.tick();
		expect(fake.printed).toHaveLength(0);
		expect(pending(fakeRuntime)).toBe(1);

		await realRuntime.worker.tick();
		expect(real.printed).toHaveLength(2);
	});

	it('lets a real worker take over from a simulated one', async () => {
		const fake = new FakePrinterDeviceRepository();
		const real = new RealLookingDevice();
		const fakeRuntime = open(fake);
		await setUp(fakeRuntime);
		await fakeRuntime.worker.tick(); // holds the lease, prints the first job
		expect(fake.printed).toHaveLength(1);

		const realRuntime = open(real);
		enqueue(fakeRuntime);
		await realRuntime.worker.tick();
		expect(real.printed).toHaveLength(1);

		enqueue(fakeRuntime);
		await fakeRuntime.worker.tick();
		expect(fake.printed).toHaveLength(1);
		expect(pending(fakeRuntime)).toBe(1);
	});

	it('takes over once the other worker stopped sending heartbeats', async () => {
		const real = new RealLookingDevice();
		const fake = new FakePrinterDeviceRepository();
		const realRuntime = open(real);
		await setUp(realRuntime);
		await realRuntime.worker.tick();
		const fakeRuntime = open(fake);

		enqueue(realRuntime);
		now = new Date(now.getTime() + 11_000);
		await fakeRuntime.worker.tick();
		expect(fake.printed).toHaveLength(1);
	});

	it('hands the queue over when the holder stops', async () => {
		const real = new RealLookingDevice();
		const fake = new FakePrinterDeviceRepository();
		const realRuntime = open(real);
		await setUp(realRuntime);
		await realRuntime.worker.tick();
		const fakeRuntime = open(fake);

		enqueue(realRuntime);
		realRuntime.worker.stop();
		await fakeRuntime.worker.tick();
		expect(fake.printed).toHaveLength(1);
	});
});
