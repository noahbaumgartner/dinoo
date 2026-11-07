/**
 * Fills a fresh event database with demo data for development and screenshots.
 *
 *   PRINTER_DRIVER=fake npm run seed            # into ./data (database «demo»)
 *   DATA_DIR=/tmp/x npm run seed
 *
 * Demo logins (development only): admin / admin1234, anna / anna1234, ben / ben1234.
 * Printer hosts starting with «offline» fail on purpose with the fake printer driver, so the
 * print queue shows waiting jobs.
 */
import path from 'node:path';
import type { RequestEvent } from '@sveltejs/kit';
import { FakePrinterDeviceRepository } from '../src/lib/server/repositories/printer/FakePrinterDeviceRepository.ts';
import { nextCategoryColor } from '../src/lib/category-colors.ts';
import { Runtime } from '../src/lib/server/runtime.ts';

const DATABASE = process.env.SEED_DATABASE ?? 'demo';
const dataDir = path.resolve(process.env.DATA_DIR ?? 'data');

let now = new Date();
now.setHours(17, 30, 0, 0);
const clock = () => now;

const runtime = new Runtime({
	dataDir,
	device: new FakePrinterDeviceRepository(),
	getRequestEvent: () => {
		throw new Error('No request while seeding') as unknown as RequestEvent;
	},
	now: clock
});

if (!runtime.files.exists(DATABASE)) {
	runtime.services.databases.create({
		name: DATABASE,
		eventName: 'Sommerfest FC Dinoo',
		copyMasterData: false,
		activate: true
	});
} else {
	runtime.services.databases.activate(DATABASE, true);
}

const s = runtime.services;
if (!s.users.needsSetup()) {
	console.log(`Database «${DATABASE}» already has data, nothing seeded.`);
	runtime.close();
	process.exit(0);
}

s.settings.setEventName('Sommerfest FC Dinoo');
// Demo content only; a real club scans its own TWINT code in the admin settings.
s.settings.setTwintQrContent('https://example.org/dinoo-demo-twint');

const adminId = await s.users.createInitialAdmin({
	username: 'admin',
	name: 'Sandra Keller',
	password: 'admin1234'
});
const annaId = await s.users.create({
	username: 'anna',
	name: 'Anna Meier',
	role: 'service',
	password: 'anna1234'
});
const benId = await s.users.create({
	username: 'ben',
	name: 'Ben Huber',
	role: 'service',
	password: 'ben1234'
});

const kitchen = s.printers.save(null, {
	name: 'Küche',
	host: '192.168.50.21',
	port: 9100,
	model: 'TM-T20IV',
	active: true
})!;
const grill = s.printers.save(null, {
	name: 'Grill',
	host: 'offline-grill.local',
	port: 9100,
	model: 'TM-T20III',
	active: true
})!;

const menu: [string, number | null, [string, number, ('grill' | 'none')?][]][] = [
	[
		'Warme Küche',
		kitchen.id,
		[
			['Pommes frites', 600],
			['Bratwurst mit Brot', 750, 'grill'],
			['Cervelat', 650, 'grill'],
			['Chicken Nuggets', 900],
			['Älplermagronen', 1450]
		]
	],
	[
		'Kalte Küche',
		kitchen.id,
		[
			['Wurst-Käse-Salat', 1250],
			['Sandwich Schinken', 700]
		]
	],
	[
		'Getränke',
		null,
		[
			['Bier 3 dl', 550],
			['Mineral 5 dl', 400],
			['Rivella 5 dl', 450],
			['Kaffee', 350]
		]
	],
	[
		'Dessert',
		kitchen.id,
		[
			['Glace Vanille', 450],
			['Crèmeschnitte', 500]
		]
	]
];

const articles: { id: number; priceCents: number }[] = [];
menu.forEach(([name, printerId, items], categoryIndex) => {
	const category = s.menu.saveCategory(null, {
		name,
		sortOrder: categoryIndex + 1,
		color: nextCategoryColor(categoryIndex),
		defaultPrinterId: printerId
	})!;
	items.forEach(([articleName, priceCents, mode], index) => {
		articles.push(
			s.menu.saveArticle(null, {
				name: articleName,
				priceCents,
				categoryId: category.id,
				printerId: mode === 'grill' ? grill.id : null,
				sortOrder: index + 1,
				active: true
			})!
		);
	});
});

s.tables.applyGrid({ rows: 4, columns: 6, numbering: 'letter' });
// An aisle in the middle of the hall.
for (const table of s.tables.list())
	if (table.gridColumn === 4) s.tables.setActive(table.id, false);
s.tables.save(null, { label: 'Bar', sortOrder: 1, active: true });
const tables = s.tables.list().filter((table) => table.active);

const users = [annaId, benId, adminId].map((id) => runtime.repositories.users.get(id)!);

// Pseudo-random but stable, so screenshots look the same every time.
let seed = 7;
const random = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
const pick = <T>(list: T[]) => list[Math.floor(random() * list.length)];

// Busy around dinner, quieter later in the evening.
const perHalfHour = [2, 4, 7, 9, 6, 4, 5, 3, 2];
let orderCount = 0;
for (const count of perHalfHour) {
	for (let i = 0; i < count; i += 1) {
		now = new Date(now.getTime() + (30 * 60 * 1000) / count);
		const items = Array.from({ length: 1 + Math.floor(random() * 3) }, () => ({
			articleId: pick(articles).id,
			quantity: 1 + Math.floor(random() * 3)
		}));
		const by = pick(users);
		const order = s.orders.place(
			{
				clientRequestId: `seed-${orderCount++}`,
				tableId: pick(tables).id,
				items
			},
			by
		);
		// Most orders are paid right away, a few are split, some are still open.
		const roll = random();
		if (roll < 0.7)
			s.payments.add(order.id, order.totalCents, random() < 0.6 ? 'cash' : 'twint', by);
		else if (roll < 0.82 && order.totalCents >= 1000) {
			s.payments.add(order.id, 500, 'cash', by);
			s.payments.add(order.id, order.totalCents - 500, 'twint', by);
		}
	}
}

// The kitchen printer works, the grill printer is «offline»: print what can be printed.
await runtime.worker.tick();
runtime.close();
console.log(`Seeded «${DATABASE}» in ${dataDir} with ${orderCount} orders.`);
