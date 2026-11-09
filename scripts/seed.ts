/**
 * Fills a fresh event database with demo data for development and screenshots.
 *
 *   PRINTER_DRIVER=fake npm run seed            # into ./data (database «demo»)
 *   DATA_DIR=/tmp/x npm run seed
 *   SEED_DATABASE=last SEED_STAFF=8 SEED_HOURS=4 SEED_ORDERS=400 npm run seed
 *
 * SEED_PRINTER=<host> creates one printer «Küche» at that host for everything instead of the demo
 * printers (one of them offline). SEED_STAFF sets the number of service users (default 2), SEED_HOURS spreads SEED_ORDERS orders
 * over the last hours up to now with busier and quieter phases (default: one fixed evening).
 *
 * Demo logins (development only): admin / admin1234, anna / anna1234, ben / ben1234, further
 * service users <first name> / <first name>1234.
 * Printer hosts starting with «offline» fail on purpose with the fake printer driver, so the
 * print queue shows waiting jobs.
 */
import path from 'node:path';
import type { RequestEvent } from '@sveltejs/kit';
import { FakePrinterDeviceRepository } from '../src/lib/server/repositories/printer/FakePrinterDeviceRepository.ts';
import type { ArticleOption } from '../src/lib/article-options.ts';
import { nextCategoryColor } from '../src/lib/category-colors.ts';
import type { ArticleInput } from '../src/lib/server/repositories/db/MenuRepository.ts';
import { Runtime } from '../src/lib/server/runtime.ts';

const DATABASE = process.env.SEED_DATABASE ?? 'demo';
const dataDir = path.resolve(process.env.DATA_DIR ?? 'data');
const STAFF = Number(process.env.SEED_STAFF ?? 2);
const HOURS = process.env.SEED_HOURS ? Number(process.env.SEED_HOURS) : null;
const ORDERS = Number(process.env.SEED_ORDERS ?? 300);
const PRINTER = process.env.SEED_PRINTER ?? null;

let now = new Date();
if (HOURS === null) now.setHours(17, 30, 0, 0);
else now = new Date(now.getTime() - HOURS * 60 * 60 * 1000);
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
		eventName: 'Schauturnen STV Kriessern',
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

s.settings.setEventName('Schauturnen STV Kriessern');
// Demo content only; a real club scans its own TWINT code in the admin settings.
s.settings.setTwintQrContent('https://example.org/dinoo-demo-twint');

const adminId = await s.users.createInitialAdmin({
	username: 'admin',
	name: 'Sandra Keller',
	password: 'admin1234'
});
const staff = [
	['anna', 'Anna Meier'],
	['ben', 'Ben Huber'],
	['carla', 'Carla Frei'],
	['david', 'David Brunner'],
	['elena', 'Elena Steiner'],
	['fabio', 'Fabio Gerber'],
	['gina', 'Gina Moser'],
	['luca', 'Luca Widmer'],
	['mia', 'Mia Schmid'],
	['nico', 'Nico Weber']
].slice(0, STAFF);
const staffIds: string[] = [];
for (const [username, name] of staff)
	staffIds.push(
		await s.users.create({ username, name, role: 'service', password: `${username}1234` })
	);

const kitchen = s.printers.save(null, {
	name: 'Küche',
	host: PRINTER ?? '192.168.50.21',
	port: 443,
	model: 'TM-T20IV'
})!;
const grill = PRINTER
	? kitchen
	: s.printers.save(null, {
			name: 'Grill',
			host: 'offline-grill.local',
			port: 443,
			model: 'TM-T20III'
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
			['Crèmeschnitte', 500],
			['Hausgemachter Kuchen', 500]
		]
	]
];

/** Description, minimum age and options of some articles, to show what they look like. */
const extras: Record<string, Pick<ArticleInput, 'description' | 'minAge' | 'options'>> = {
	'Pommes frites': {
		description: 'Portion mit Sauce nach Wahl',
		minAge: 0,
		options: [
			{
				id: 'sauce',
				kind: 'choice',
				name: 'Sauce',
				required: false,
				choices: [
					{ id: 'ketchup', name: 'Ketchup', priceCents: 0 },
					{ id: 'mayo', name: 'Mayo', priceCents: 0 },
					{ id: 'curry', name: 'Curry', priceCents: 50 }
				]
			},
			{ id: 'xl', kind: 'toggle', name: 'Grosse Portion', priceCents: 200 }
		]
	},
	'Bratwurst mit Brot': {
		description: null,
		minAge: 0,
		options: [{ id: 'no-mustard', kind: 'toggle', name: 'ohne Senf', priceCents: 0 }]
	},
	'Bier 3 dl': {
		description: 'Lager vom Fass',
		minAge: 16,
		options: [{ id: 'cups', kind: 'count', name: 'Mehrwegbecher', min: 0, max: 4, priceCents: 200 }]
	},
	'Hausgemachter Kuchen': {
		description: 'Vom Kuchenbuffet des Vereins',
		minAge: 0,
		options: [
			{
				id: 'kind',
				kind: 'choice',
				name: 'Sorte',
				required: true,
				choices: [
					{ id: 'choc', name: 'Schoggi', priceCents: 0 },
					{ id: 'lemon', name: 'Zitrone', priceCents: 0 },
					{ id: 'carrot', name: 'Rüebli', priceCents: 50 }
				]
			},
			{ id: 'cream', kind: 'toggle', name: 'mit Rahm', priceCents: 100 }
		]
	}
};

const articles: { id: number; priceCents: number; options: ArticleOption[] }[] = [];
menu.forEach(([name, printerId, items], categoryIndex) => {
	const category = s.menu.saveCategory(null, {
		name,
		color: nextCategoryColor(categoryIndex),
		defaultPrinterId: printerId
	})!;
	items.forEach(([articleName, priceCents, mode]) => {
		articles.push(
			s.menu.saveArticle(null, {
				name: articleName,
				priceCents,
				categoryId: category.id,
				printerId: mode === 'grill' && grill !== kitchen ? grill.id : null,
				...extras[articleName]
			})!
		);
	});
});

const hall = s.tables.areas()[0];
s.tables.applyGrid(hall.id, { rows: 4, columns: 6, numbering: 'letter' });
// An aisle in the middle of the hall.
for (const table of s.tables.list(hall.id))
	if (table.gridColumn === 4) s.tables.setActive(table.id, false);
s.tables.save(null, { label: 'Bar', sortOrder: 1, areaId: hall.id });
// A second area with its own plan.
const tent = s.tables.saveArea(null, { name: 'Festzelt' })!;
s.tables.applyGrid(tent.id, { rows: 2, columns: 5, numbering: 'number' });
const tables = s.tables.list().filter((table) => table.active);

const users = [...staffIds, adminId].map((id) => runtime.repositories.users.get(id)!);

// Pseudo-random but stable, so screenshots look the same every time.
let seed = 7;
const random = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
const pick = <T>(list: T[]) => list[Math.floor(random() * list.length)];

/** Order times: one fixed evening, or ORDERS orders over the last HOURS hours with waves. */
function orderTimes(): Date[] {
	if (HOURS === null) {
		// Busy around dinner, quieter later in the evening.
		const perHalfHour = [2, 4, 7, 9, 6, 4, 5, 3, 2];
		const times: Date[] = [];
		let at = now.getTime();
		for (const count of perHalfHour)
			for (let i = 0; i < count; i += 1) times.push(new Date((at += (30 * 60 * 1000) / count)));
		return times;
	}
	// Ten-minute slots whose weight follows two rush waves plus noise, some slots almost empty.
	const start = now.getTime();
	const slots = HOURS * 6;
	const weights = Array.from({ length: slots }, (_, i) => {
		const x = i / slots;
		const wave = Math.exp(-((x - 0.3) ** 2) / 0.01) + 0.8 * Math.exp(-((x - 0.7) ** 2) / 0.006);
		return Math.max(0.05, 0.25 + wave + (random() - 0.5) * 0.5);
	});
	const total = weights.reduce((sum, w) => sum + w, 0);
	const times: Date[] = [];
	for (let i = 0; i < ORDERS; i += 1) {
		let r = random() * total;
		let slot = 0;
		while (r > weights[slot] && slot < slots - 1) r -= weights[slot++];
		times.push(new Date(start + (slot + random()) * 10 * 60 * 1000));
	}
	return times.sort((a, b) => a.getTime() - b.getTime());
}

const end = HOURS === null ? null : Date.now();
let orderCount = 0;
for (const at of orderTimes()) {
	now = at;
	const items = Array.from({ length: 1 + Math.floor(random() * 3) }, () => {
		const article = pick(articles);
		// Required choices need a value; other options keep their start value.
		const options = Object.fromEntries(
			article.options.flatMap((option) =>
				option.kind === 'choice' && option.required ? [[option.id, pick(option.choices).id]] : []
			)
		);
		return { articleId: article.id, quantity: 1 + Math.floor(random() * 3), options };
	});
	const by = pick(users);
	const order = s.orders.place(
		{
			clientRequestId: `seed-${orderCount++}`,
			tableId: pick(tables).id,
			items
		},
		by
	);
	// Most orders are paid right away, a few are split, some are still open. Older orders of a
	// history are almost all paid.
	const old = end !== null && end - at.getTime() > 45 * 60 * 1000;
	const roll = random();
	if (roll < (old ? 0.93 : 0.7)) s.payments.add(order.id, random() < 0.6 ? 'cash' : 'twint', by);
	else if (roll < (old ? 0.98 : 0.82) && s.orders.detail(order.id).items.length > 1) {
		const first = s.orders.detail(order.id).items[0];
		s.payments.add(order.id, 'cash', by, [{ orderItemId: first.id, quantity: first.quantity }]);
		s.payments.add(order.id, 'twint', by);
	}
}

// The kitchen printer works, the grill printer is «offline»: print what can be printed.
await runtime.worker.tick();
runtime.close();
console.log(`Seeded «${DATABASE}» in ${dataDir} with ${orderCount} orders.`);
