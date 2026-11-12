import type { RequestEvent } from '@sveltejs/kit';
import { afterEach, beforeEach, describe, expect, it } from 'vite-plus/test';
import { FakePrinterDeviceRepository } from '../repositories/printer/FakePrinterDeviceRepository';
import { Runtime } from '../runtime';
import { createTestRuntime, seedBasics } from '../test-utils';

let t: ReturnType<typeof createTestRuntime>;
let seed: Awaited<ReturnType<typeof seedBasics>>;

beforeEach(async () => {
	t = createTestRuntime();
	seed = await seedBasics(t.runtime);
});

afterEach(() => t.cleanup());

/** Fries go to the kitchen, sausages to the grill. */
function place() {
	return t.services().orders.place(
		{
			clientRequestId: crypto.randomUUID(),
			tableId: seed.tables[0].id,
			items: [
				{ articleId: seed.fries.id, quantity: 1 },
				{ articleId: seed.sausage.id, quantity: 1 }
			]
		},
		seed.service
	);
}

const printedOn = (host: string) => t.device.printed.filter((p) => p.target.host === host);
const orderNumber = (text: string) => text.match(/#(\d+)/)?.[1];

describe('redirecting a printer', () => {
	it('moves queued jobs in their order and sends new jobs to the target, with a hint', async () => {
		t.device.offlineHosts.add(seed.kitchen.host);
		place();
		place();
		await t.runtime.worker.tick();
		expect(printedOn(seed.grill.host)).toHaveLength(2);

		const queue = t.services().printQueue;
		expect(queue.redirect(seed.kitchen.id, seed.grill.id)).toBe(2);
		place();
		await t.runtime.worker.tick();

		const kitchenTickets = printedOn(seed.grill.host).filter((p) => /POMMES/.test(p.text));
		expect(kitchenTickets.map((p) => orderNumber(p.text))).toEqual(['1', '2', '3']);
		for (const ticket of kitchenTickets) {
			expect(ticket.text.split('\n')[0]).toContain('FÜR: KÜCHE');
			expect(ticket.text.match(/FÜR:/g)).toHaveLength(1);
		}
		expect(printedOn(seed.kitchen.host)).toHaveLength(0);
		expect(queue.countPending()).toBe(0);

		const status = queue.printerStatuses().find((p) => p.id === seed.kitchen.id)!;
		expect(status).toMatchObject({
			redirectToPrinterId: seed.grill.id,
			redirectTargetName: 'Grill'
		});
		expect(status.redirectedAt).toBeInstanceOf(Date);
		const moved = queue.list({ printerId: seed.grill.id }).filter((job) => job.redirectedFrom);
		expect(moved).toHaveLength(3);
	});

	it('sends new jobs to the printer itself again once the redirect is lifted', async () => {
		t.device.offlineHosts.add(seed.kitchen.host);
		place();
		await t.runtime.worker.tick();
		const queue = t.services().printQueue;
		queue.redirect(seed.kitchen.id, seed.grill.id);
		queue.clearRedirect(seed.kitchen.id);
		const order = place();

		const jobs = queue.listByOrder(order.id);
		const kitchenJob = jobs.find((job) => job.preview.includes('POMMES'))!;
		expect(kitchenJob.printerId).toBe(seed.kitchen.id);
		expect(kitchenJob.redirectedFrom).toBeNull();
		// The job moved earlier stays with the target.
		expect(queue.list({ printerId: seed.grill.id }).some((job) => job.redirectedFrom)).toBe(true);
		expect(queue.printerStatuses().find((p) => p.id === seed.kitchen.id)).toMatchObject({
			redirectToPrinterId: null,
			redirectedAt: null
		});
	});

	it('never prints a job twice that was printing while the redirect was set', async () => {
		t.device.offlineHosts.add(seed.kitchen.host);
		place();
		await t.runtime.worker.tick();
		const repo = t.runtime.repositories.printJobs;
		const job = repo.list({ status: 'queued', printerId: seed.kitchen.id })[0];
		repo.claim(job.id, seed.kitchen.id, new Date());

		expect(t.services().printQueue.redirect(seed.kitchen.id, seed.grill.id)).toBe(0);
		expect(repo.get(job.id)).toMatchObject({ status: 'printing', printerId: seed.kitchen.id });
		await t.runtime.worker.tick();
		expect(repo.get(job.id)).toMatchObject({ status: 'printing', printerId: seed.kitchen.id });

		// The print fails, the job goes back to the queue of the source, and the worker moves it on.
		repo.markAttemptFailed(job.id, 'timeout');
		await t.runtime.worker.tick();
		expect(repo.get(job.id)).toMatchObject({ status: 'printed', printerId: seed.grill.id });
		const kitchenTickets = t.device.printed.filter((p) => /POMMES/.test(p.text));
		expect(kitchenTickets).toHaveLength(1);
		expect(kitchenTickets[0].target.host).toBe(seed.grill.host);
	});

	it('routes reprints of a redirected printer to the target', async () => {
		const order = place();
		await t.runtime.worker.tick();
		const queue = t.services().printQueue;
		const kitchenJob = queue
			.listByOrder(order.id)
			.find((job) => job.printerId === seed.kitchen.id)!;
		queue.redirect(seed.kitchen.id, seed.grill.id);
		queue.reprint(kitchenJob.id);
		const copy = queue.list({ status: 'queued' })[0];
		expect(copy).toMatchObject({ printerId: seed.grill.id, redirectedFrom: 'Küche' });
	});

	it('rejects targets that would form a chain, a loop or a dead end', () => {
		const s = t.services();
		const bar = s.printers.save(null, {
			name: 'Bar',
			host: '10.0.0.12',
			port: 443,
			model: 'TM-T20IV'
		})!;
		const queue = s.printQueue;
		expect(() => queue.redirect(seed.kitchen.id, seed.kitchen.id)).toThrow(/sich selbst/);

		s.printers.setActive(bar.id, false);
		expect(() => queue.redirect(seed.kitchen.id, bar.id)).toThrow(/deaktiviert/);
		s.printers.setActive(bar.id, true);

		queue.redirect(seed.kitchen.id, seed.grill.id);
		// Grill is a target, so it cannot be redirected itself (no chain) ...
		expect(() => queue.redirect(seed.grill.id, bar.id)).toThrow(/Küche/);
		// ... and Küche is redirected, so it cannot be a target (no chain, no loop).
		expect(() => queue.redirect(bar.id, seed.kitchen.id)).toThrow(/selbst umgeleitet/);
		// A target stays active and is never deleted while the redirect is active.
		expect(() => s.printers.setActive(seed.grill.id, false)).toThrow(/umgeleitet/);
		expect(() => s.printers.delete(seed.grill.id)).toThrow(/umgeleitet/);
		// A test print checks the printer itself, which makes no sense while it is redirected.
		expect(() => queue.enqueueTest(seed.kitchen.id)).toThrow(/umgeleitet/);

		// Redirecting again to another target is fine; Grill is free then.
		queue.redirect(seed.kitchen.id, bar.id);
		expect(() => queue.redirect(seed.grill.id, bar.id)).not.toThrow();
	});

	it('keeps the redirect after a restart', () => {
		t.services().printQueue.redirect(seed.kitchen.id, seed.grill.id);
		t.runtime.close();

		const restarted = new Runtime({
			dataDir: t.dataDir,
			device: new FakePrinterDeviceRepository(),
			getRequestEvent: () => {
				throw new Error('No request in tests') as unknown as RequestEvent;
			},
			workerOptions: { tickMs: 60_000, backoffMs: [1000] }
		});
		try {
			const kitchen = restarted.services.printQueue
				.printerStatuses()
				.find((p) => p.id === seed.kitchen.id);
			expect(kitchen).toMatchObject({ redirectToPrinterId: seed.grill.id });
		} finally {
			restarted.close();
		}
	});
});
