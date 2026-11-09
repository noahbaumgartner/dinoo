import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { RequestEvent } from '@sveltejs/kit';
import { FakePrinterDeviceRepository } from './repositories/printer/FakePrinterDeviceRepository';
import { Runtime } from './runtime';

/** A runtime on a throw-away data directory with a fake printer and a controllable clock. */
export function createTestRuntime() {
	const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dinoo-test-'));
	const device = new FakePrinterDeviceRepository();
	let now = new Date('2026-06-20T18:00:00Z');
	const runtime = new Runtime({
		dataDir,
		device,
		getRequestEvent: () => {
			throw new Error('No request in tests') as unknown as RequestEvent;
		},
		workerOptions: { tickMs: 60_000, backoffMs: [1000, 5000] },
		now: () => now
	});
	return {
		runtime,
		device,
		services: () => runtime.services,
		advance(ms: number) {
			now = new Date(now.getTime() + ms);
		},
		cleanup() {
			runtime.close();
			fs.rmSync(dataDir, { recursive: true, force: true });
		}
	};
}

/** Admin, service user, two printers, a small menu and three tables. */
export async function seedBasics(runtime: Runtime) {
	const s = runtime.services;
	const adminId = await s.users.createInitialAdmin({
		username: 'admin',
		name: 'Admin',
		password: 'secret'
	});
	const serviceId = await s.users.create({
		username: 'anna',
		name: 'Anna',
		role: 'service',
		password: 'secret'
	});
	const kitchen = s.printers.save(null, {
		name: 'Küche',
		host: '10.0.0.10',
		port: 443,
		model: 'TM-T20IV'
	})!;
	const grill = s.printers.save(null, {
		name: 'Grill',
		host: '10.0.0.11',
		port: 443,
		model: 'TM-T20III'
	})!;
	const food = s.menu.saveCategory(null, {
		name: 'Warme Küche',
		color: 'orange',
		defaultPrinterId: kitchen.id
	})!;
	const drinks = s.menu.saveCategory(null, {
		name: 'Getränke',
		color: 'sky',
		defaultPrinterId: null
	})!;
	const fries = s.menu.saveArticle(null, {
		name: 'Pommes',
		priceCents: 600,
		categoryId: food.id,
		printerId: null
	})!;
	const sausage = s.menu.saveArticle(null, {
		name: 'Bratwurst',
		priceCents: 750,
		categoryId: food.id,
		printerId: grill.id
	})!;
	const beer = s.menu.saveArticle(null, {
		name: 'Bier',
		priceCents: 550,
		categoryId: drinks.id,
		printerId: null
	})!;
	s.tables.applyGrid({ rows: 1, columns: 3, numbering: 'number' });
	const admin = runtime.repositories.users.get(adminId)!;
	const service = runtime.repositories.users.get(serviceId)!;
	const tables = s.tables.list();
	return { admin, service, kitchen, grill, food, drinks, fries, sausage, beer, tables };
}
