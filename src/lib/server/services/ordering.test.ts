import { afterEach, beforeEach, describe, expect, it } from 'vite-plus/test';
import { createTestRuntime, seedBasics } from '../test-utils';

let t: ReturnType<typeof createTestRuntime>;
let seed: Awaited<ReturnType<typeof seedBasics>>;

beforeEach(async () => {
	t = createTestRuntime();
	seed = await seedBasics(t.runtime);
});

afterEach(() => t.cleanup());

function place(clientRequestId = crypto.randomUUID()) {
	return t.services().orders.place(
		{
			clientRequestId,
			tableId: seed.tables[1].id,
			items: [
				{ articleId: seed.fries.id, quantity: 2 },
				{ articleId: seed.sausage.id, quantity: 1, note: ' ohne Senf ' },
				{ articleId: seed.beer.id, quantity: 3 }
			]
		},
		seed.service
	);
}

describe('placing an order', () => {
	it('stores snapshots, totals and a running order number', () => {
		const first = place();
		const second = place();
		expect(first.orderNumber).toBe(1);
		expect(second.orderNumber).toBe(2);
		expect(first.tableLabel).toBe('102');
		expect(first.totalCents).toBe(2 * 600 + 750 + 3 * 550);

		const detail = t.services().orders.detail(first.id);
		expect(detail.items.map((item) => [item.articleName, item.printerId])).toEqual([
			['Pommes', seed.kitchen.id],
			['Bratwurst', seed.grill.id],
			['Bier', null]
		]);
	});

	it('keeps the note per item and splits items with different notes', () => {
		const order = t.services().orders.place(
			{
				clientRequestId: 'notes',
				tableId: seed.tables[0].id,
				items: [
					{ articleId: seed.fries.id, quantity: 1, note: 'ohne Salz' },
					{ articleId: seed.fries.id, quantity: 2 },
					{ articleId: seed.fries.id, quantity: 1, note: '  ' },
					{ articleId: seed.fries.id, quantity: 1, note: 'ohne Salz' }
				]
			},
			seed.service
		);
		const items = t.services().orders.detail(order.id).items;
		expect(items.map((item) => [item.quantity, item.note])).toEqual([
			[2, 'ohne Salz'],
			[3, null]
		]);
		expect(order.totalCents).toBe(5 * 600);
		expect(() =>
			t.services().orders.place(
				{
					clientRequestId: 'long',
					tableId: seed.tables[0].id,
					items: [{ articleId: seed.fries.id, quantity: 1, note: 'x'.repeat(201) }]
				},
				seed.service
			)
		).toThrow(/höchstens 200 Zeichen/);
	});

	it('is idempotent for the same client request id', () => {
		const id = crypto.randomUUID();
		expect(place(id).id).toBe(place(id).id);
		expect(t.services().orders.search({})).toHaveLength(1);
	});

	it('requires a table and at least one item', () => {
		const s = t.services();
		const base = {
			clientRequestId: 'x',
			tableId: seed.tables[0].id,
			items: [{ articleId: seed.fries.id, quantity: 1 }]
		};
		expect(() => s.orders.place({ ...base, tableId: 999 }, seed.service)).toThrow(/Tisch/);
		expect(() => s.orders.place({ ...base, items: [] }, seed.service)).toThrow(/keine Artikel/);
	});

	it('rejects inactive articles', () => {
		t.services().menu.setArticleActive(seed.fries.id, false);
		expect(() => place()).toThrow(/nicht mehr verfügbar/);
	});

	it('keeps old prices when the menu changes', () => {
		const order = place();
		t.services().menu.saveArticle(seed.fries.id, { ...seed.fries, priceCents: 900 });
		expect(t.services().orders.detail(order.id).order.totalCents).toBe(order.totalCents);
	});
});

describe('print queue', () => {
	it('queues one ticket per effective printer with only its items', async () => {
		const order = place();
		const jobs = t.services().printQueue.listByOrder(order.id);
		expect(jobs.map((job) => job.printerName).sort()).toEqual(['Grill', 'Küche']);
		const kitchen = jobs.find((job) => job.printerName === 'Küche')!;
		expect(kitchen.preview).toContain('2 x Pommes');
		expect(kitchen.preview).not.toContain('Bratwurst');
		expect(kitchen.preview).not.toContain('Bier');
		expect(kitchen.preview).toContain('Tisch 102'.toUpperCase());
		expect(kitchen.preview).not.toContain('Name:');
		expect(kitchen.preview).toContain('Aufgenommen von: Anna');
		const grill = jobs.find((job) => job.printerName === 'Grill')!;
		expect(grill.preview).toMatch(/1 x Bratwurst\n\s*> ohne Senf/);
		expect(kitchen.preview).not.toContain('ohne Senf');

		await t.runtime.worker.tick();
		expect(t.device.printed).toHaveLength(2);
		expect(t.services().printQueue.countPending()).toBe(0);
	});

	it('keeps jobs while a printer is offline and prints them in order once it is back', async () => {
		t.device.offlineHosts.add(seed.kitchen.host);
		const first = place();
		const second = place();
		await t.runtime.worker.tick();

		const pending = t.services().printQueue.list({ status: 'pending' });
		expect(pending.map((job) => job.orderNumber)).toEqual([first.orderNumber, second.orderNumber]);
		expect(pending[0].attempts).toBe(1);
		expect(pending[0].lastError).toMatch(/ECONNREFUSED/);
		expect(
			t
				.services()
				.printQueue.printerStatuses()
				.find((p) => p.id === seed.kitchen.id)
		).toMatchObject({ reachable: false, pendingJobs: 2 });

		// Within the backoff nothing is retried.
		await t.runtime.worker.tick();
		expect(t.services().printQueue.list({ status: 'pending' })[0].attempts).toBe(1);

		t.device.offlineHosts.clear();
		t.advance(1500);
		await t.runtime.worker.tick();
		expect(t.services().printQueue.countPending()).toBe(0);
		const kitchenTickets = t.device.printed.filter((p) => p.target.host === seed.kitchen.host);
		expect(kitchenTickets.map((p) => p.text.match(/BESTELLUNG (\d+)/)?.[1])).toEqual(['1', '2']);
	});

	it('cancels and reprints jobs', async () => {
		const order = place();
		await t.runtime.worker.tick();
		const s = t.services().printQueue;
		expect(s.countPending()).toBe(0);

		const printed = s.listByOrder(order.id)[0];
		t.device.offlineHosts.add(seed.kitchen.host);
		t.device.offlineHosts.add(seed.grill.host);
		s.reprint(printed.id);
		await t.runtime.worker.tick();
		expect(s.countPending()).toBe(1);
		const copy = s.list({ status: 'queued' })[0];
		s.cancel(copy.id);
		expect(s.countPending()).toBe(0);
		expect(() => s.cancel(copy.id)).toThrow(/wartende/);
	});

	it('resets jobs left in printing after a restart', async () => {
		t.device.offlineHosts.add(seed.kitchen.host);
		t.device.offlineHosts.add(seed.grill.host);
		place();
		await t.runtime.worker.tick();
		const repo = t.runtime.repositories.printJobs;
		const job = repo.list({ status: 'queued' })[0];
		repo.claim(job.id, job.printerId, new Date());
		expect(repo.get(job.id)?.status).toBe('printing');
		repo.resetPrinting();
		expect(repo.get(job.id)?.status).toBe('queued');
	});

	it('lays out order tickets with the saved print template', () => {
		const settings = t.services().settings;
		settings.setTicketTemplate({
			blocks: [
				{
					type: 'text',
					text: '{tisch} / {drucker}',
					style: { align: 'center', width: 3, height: 3, invert: true }
				},
				{
					type: 'items',
					line: { text: '{artikel} ({menge})', style: { align: 'left' } },
					note: { text: '-> {notiz}', style: { align: 'left' } }
				}
			]
		});
		const order = place();
		const grill = t
			.services()
			.printQueue.listByOrder(order.id)
			.find((job) => job.printerName === 'Grill')!;
		expect(grill.preview).toMatch(/102 \/ GRILL\nBratwurst \(1\)\n-> ohne Senf$/);
		expect(grill.preview).not.toContain('Aufgenommen');

		settings.resetTicketTemplate();
		expect(settings.ticketTemplate().isDefault).toBe(true);
	});

	it('rejects invalid print templates', () => {
		const settings = t.services().settings;
		expect(() => settings.setTicketTemplate({ blocks: [] })).toThrow(/genau einen Block/);
		expect(() =>
			settings.setTicketTemplate({
				blocks: [
					{ type: 'text', text: '{preis}', style: {} },
					{ type: 'items', line: { text: '', style: {} }, note: { text: '', style: {} } }
				]
			})
		).toThrow(/Block 1: Unbekannter Platzhalter \{preis\}/);
		expect(settings.ticketTemplate().isDefault).toBe(true);
	});

	it('queues a template test print with the sample order', async () => {
		const template = {
			blocks: [
				{ type: 'text', text: 'Test {bestellnummer}', style: { align: 'left' } },
				{
					type: 'items',
					line: { text: '{menge} {artikel}', style: { align: 'left' } },
					note: { text: '{notiz}', style: { align: 'left' } }
				}
			]
		};
		const queue = t.services().printQueue;
		queue.enqueueTemplateTest(seed.kitchen.id, template, 'Anna');
		const [job] = queue.list({ status: 'pending' });
		expect(job).toMatchObject({ kind: 'test', printerName: 'Küche' });
		expect(job.preview).toContain('Test 42');
		expect(job.preview).toContain('1 Cordon bleu mit Pommes und Salat');
		expect(() => queue.enqueueTemplateTest(seed.kitchen.id, { blocks: [] }, 'Anna')).toThrow(
			/ungültig/
		);
		await t.runtime.worker.tick();
		expect(queue.countPending()).toBe(0);
	});

	it('does not deactivate printers with waiting jobs', () => {
		t.device.offlineHosts.add(seed.kitchen.host);
		place();
		expect(() => t.services().printers.setActive(seed.kitchen.id, false)).toThrow(/wartende/);
	});
});

describe('payments', () => {
	/** 2 × fries (6.00), 1 × sausage (7.50), 3 × beer (5.50) = 36.00 */
	function itemsOf(orderId: number) {
		const items = t.services().orders.detail(orderId).items;
		const by = (articleId: number) => items.find((item) => item.articleId === articleId)!;
		return { fries: by(seed.fries.id), sausage: by(seed.sausage.id), beer: by(seed.beer.id) };
	}

	it('splits by positions until everything is paid', () => {
		const order = place();
		const s = t.services();
		const { fries, beer } = itemsOf(order.id);
		const first = s.payments.add(order.id, 'cash', seed.service, [
			{ orderItemId: fries.id, quantity: 1 },
			{ orderItemId: beer.id, quantity: 2 }
		]);
		expect(first.amountCents).toBe(1700);
		const detail = s.orders.detail(order.id);
		expect(detail.openCents).toBe(1900);
		expect(itemsOf(order.id).beer.paidQuantity).toBe(2);
		expect(s.orders.search({ paymentStatus: 'partial' })).toHaveLength(1);
		expect(() =>
			s.payments.add(order.id, 'twint', seed.service, [{ orderItemId: beer.id, quantity: 2 }])
		).toThrow(/bereits bezahlt/);
		expect(() =>
			s.payments.add(order.id, 'twint', seed.service, [{ orderItemId: 9999, quantity: 1 }])
		).toThrow(/gehört nicht/);

		// Without a selection the rest is paid, and all remaining positions with it.
		const rest = s.payments.add(order.id, 'twint', seed.service);
		expect(rest.amountCents).toBe(1900);
		expect(s.orders.detail(order.id).items.every((i) => i.paidQuantity === i.quantity)).toBe(true);
		expect(s.orders.search({ paymentStatus: 'paid' })).toHaveLength(1);
		expect(() => s.payments.add(order.id, 'cash', seed.service)).toThrow(/bereits bezahlt/);
	});

	it('frees the positions of an undone payment', () => {
		const order = place();
		const s = t.services();
		const { sausage } = itemsOf(order.id);
		const payment = s.payments.add(order.id, 'cash', seed.service, [
			{ orderItemId: sausage.id, quantity: 1 }
		]);
		s.payments.remove(payment.id, seed.service);
		expect(itemsOf(order.id).sausage.paidQuantity).toBe(0);
		expect(s.orders.detail(order.id).openCents).toBe(3600);
	});

	it('lets service staff undo only their own latest payment within five minutes', () => {
		const order = place();
		const s = t.services();
		const { fries } = itemsOf(order.id);
		const first = s.payments.add(order.id, 'cash', seed.service, [
			{ orderItemId: fries.id, quantity: 1 }
		]);
		const second = s.payments.add(order.id, 'cash', seed.service, [
			{ orderItemId: fries.id, quantity: 1 }
		]);
		expect(() => s.payments.remove(first.id, seed.service)).toThrow(/letzte Zahlung/);
		t.advance(6 * 60 * 1000);
		expect(() => s.payments.remove(second.id, seed.service)).toThrow(/5 Minuten/);
		s.payments.remove(second.id, seed.admin);
		expect(s.orders.detail(order.id).paidCents).toBe(600);
	});
});

describe('search and dashboard', () => {
	it('filters by table, staff and order number', () => {
		const order = place();
		const s = t.services();
		expect(s.orders.search({ tableId: seed.tables[1].id })).toHaveLength(1);
		expect(s.orders.search({ tableId: seed.tables[0].id })).toHaveLength(0);
		expect(s.orders.search({ createdByUserId: seed.admin.id })).toHaveLength(0);
		expect(s.orders.search({ orderNumber: order.orderNumber })).toHaveLength(1);
	});

	it('aggregates revenue over time and articles sold', () => {
		place();
		t.advance(40 * 60 * 1000);
		place();
		const dashboard = t.services().stats.dashboard('15m');
		expect(dashboard.totals).toEqual({ orders: 2, revenueCents: 7200, items: 12 });
		expect(dashboard.timeline.length).toBeGreaterThanOrEqual(3);
		expect(dashboard.timeline.filter((bucket) => bucket.orders > 0)).toHaveLength(2);
		expect(dashboard.articles[0]).toMatchObject({ name: 'Bier', quantity: 6 });
		const food = t.services().stats.dashboard('1h', seed.food.id);
		expect(food.articles.map((article) => article.name)).toEqual(['Pommes', 'Bratwurst']);
	});
});

describe('menu', () => {
	it('stores a category color from the palette and rejects others', () => {
		const s = t.services();
		const input = { name: 'Dessert', defaultPrinterId: null };
		expect(s.menu.saveCategory(null, { ...input, color: 'pink' })?.color).toBe('pink');
		expect(() => s.menu.saveCategory(null, { ...input, color: '#ff0000' })).toThrow(/Farbe/);
	});

	it('reorders categories and the articles within a category', () => {
		const s = t.services();
		s.menu.reorderCategories([seed.drinks.id, seed.food.id]);
		s.menu.reorderArticles(seed.food.id, [seed.sausage.id, seed.fries.id]);
		const menu = s.menu.overview();
		expect(menu.map((category) => category.name)).toEqual(['Getränke', 'Warme Küche']);
		expect(menu[1].articles.map((article) => article.name)).toEqual(['Bratwurst', 'Pommes']);
	});

	it('rejects an order computed from an outdated list', () => {
		const s = t.services();
		expect(() => s.menu.reorderCategories([seed.food.id])).toThrow(/inzwischen geändert/);
		expect(() => s.menu.reorderArticles(seed.food.id, [seed.fries.id, seed.beer.id])).toThrow(
			/inzwischen geändert/
		);
	});
});

describe('users', () => {
	it('protects the last active admin', () => {
		const s = t.services();
		expect(() =>
			s.users.update(seed.admin.id, { name: 'Admin', role: 'service', active: true }, seed.admin)
		).toThrow(/letzte aktive Admin/);
		s.users.update(seed.service.id, { name: 'Anna', role: 'admin', active: true }, seed.admin);
		s.users.update(seed.admin.id, { name: 'Admin', role: 'service', active: true }, seed.service);
	});

	it('rejects duplicate usernames', async () => {
		await expect(
			t.services().users.create({ username: 'Anna', name: 'X', role: 'service', password: 'abcd' })
		).rejects.toThrow(/vergeben/);
	});
});

describe('seating plan', () => {
	const cells = () =>
		t
			.services()
			.tables.list()
			.filter((table) => table.gridRow !== null)
			.map((table) => table.label);

	it('creates a grid numbered by row and column', () => {
		const s = t.services();
		expect(cells()).toEqual(['101', '102', '103']);
		s.tables.applyGrid({ rows: 2, columns: 2, numbering: 'letter' });
		expect(cells()).toEqual(['A01', 'A02', 'B01', 'B02']);
		expect(s.tables.plan()).toEqual({ rows: 2, columns: 2, numbering: 'letter' });
	});

	it('keeps renamed tables and turns removed tables with orders into inactive free tables', () => {
		const s = t.services();
		place(); // on 102
		const first = s.tables.list()[0];
		s.tables.save(first.id, { label: 'VIP', sortOrder: 0 });
		s.tables.applyGrid({ rows: 2, columns: 1, numbering: 'letter' });
		expect(cells()).toEqual(['VIP', 'B01']);
		const free = s.tables.list().filter((table) => table.gridRow === null);
		expect(free).toMatchObject([{ label: '102', active: false }]);
		expect(s.tables.plan()).toMatchObject({ rows: 2, columns: 1 });
	});

	it('deactivates but never deletes grid tables; free tables can be deleted', () => {
		const s = t.services();
		const cell = s.tables.list()[0];
		s.tables.setActive(cell.id, false);
		expect(s.tables.list()[0].active).toBe(false);
		expect(() => s.tables.delete(cell.id)).toThrow(/Saalplan/);
		const bar = s.tables.save(null, { label: 'Bar', sortOrder: 1 })!;
		expect(bar.gridRow).toBeNull();
		expect(s.tables.delete(bar.id)).toBe('deleted');
	});

	it('saves edited cells and free tables together with the grid', () => {
		const s = t.services();
		const bar = s.tables.save(null, { label: 'Bar', sortOrder: 1 })!;
		s.tables.applyGrid({
			rows: 2,
			columns: 2,
			numbering: 'letter',
			cells: [
				{ row: 1, column: 1, label: ' VIP ', active: true },
				{ row: 2, column: 2, label: 'B02', active: false }
			],
			free: [{ id: bar.id, active: false }]
		});
		expect(s.tables.list().map(({ label, active }) => ({ label, active }))).toEqual([
			{ label: 'VIP', active: true },
			{ label: 'A02', active: true },
			{ label: 'B01', active: true },
			{ label: 'B02', active: false },
			{ label: 'Bar', active: false }
		]);
		// Renamed cells keep their name when the numbering changes.
		s.tables.applyGrid({ rows: 2, columns: 2, numbering: 'number' });
		expect(cells()).toEqual(['VIP', '102', '201', '202']);
	});

	it('rejects empty names and cells outside the grid', () => {
		const s = t.services();
		const grid = { rows: 1, columns: 3, numbering: 'number' } as const;
		expect(() =>
			s.tables.applyGrid({ ...grid, cells: [{ row: 1, column: 1, label: ' ', active: true }] })
		).toThrow(/Bezeichnung/);
		expect(() =>
			s.tables.applyGrid({ ...grid, cells: [{ row: 2, column: 1, label: 'X', active: true }] })
		).toThrow(/gibt es nicht/);
		expect(cells()).toEqual(['101', '102', '103']);
	});

	it('rejects grids that are too large', () => {
		expect(() =>
			t.services().tables.applyGrid({ rows: 27, columns: 2, numbering: 'letter' })
		).toThrow(/Zeilen/);
	});
});

describe('event databases', () => {
	it('creates a new database with master data and switches to it', async () => {
		place();
		await t.runtime.worker.tick();
		const s = t.services();
		s.settings.setEventName('Sommerfest');
		const name = s.databases.create({
			name: 'Herbstfest 2026',
			eventName: 'Herbstfest',
			copyMasterData: true,
			activate: true
		});
		expect(name).toBe('herbstfest-2026');
		expect(t.runtime.activeName()).toBe('herbstfest-2026');

		const next = t.services();
		expect(next.settings.get().eventName).toBe('Herbstfest');
		expect(next.orders.search({})).toHaveLength(0);
		expect(next.menu.overview().flatMap((c) => c.articles)).toHaveLength(3);
		expect(
			next.users
				.list()
				.map((u) => u.username ?? '')
				.sort((a, b) => a.localeCompare(b))
		).toEqual(['admin', 'anna']);

		const list = next.databases.list();
		expect(list.find((db) => db.active)?.name).toBe('herbstfest-2026');
		expect(list.find((db) => db.name === 'anlass')?.eventName).toBe('Sommerfest');

		const backup = await next.databases.download('anlass');
		expect(new TextDecoder().decode(backup.slice(0, 15))).toBe('SQLite format 3');
		expect(next.databases.upload('kopie.sqlite', backup)).toBe('kopie');
		expect(() => next.databases.upload('x', new Uint8Array([1, 2, 3]))).toThrow(/keine SQLite/);
		expect(() => next.databases.delete('herbstfest-2026')).toThrow(/aktive/);
	});

	it('refuses to switch while print jobs are waiting', () => {
		t.device.offlineHosts.add(seed.kitchen.host);
		place();
		const s = t.services();
		s.databases.create({ name: 'neu', eventName: '', copyMasterData: false, activate: false });
		expect(() => s.databases.activate('neu', false)).toThrow(/Druckwarteschlange/);
		s.databases.activate('neu', true);
		expect(t.runtime.activeName()).toBe('neu');
		expect(t.services().users.needsSetup()).toBe(true);
	});
});
