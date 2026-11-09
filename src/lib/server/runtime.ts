import type { RequestEvent } from '@sveltejs/kit';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { AuthRepository } from './repositories/auth/AuthRepository';
import { closeConnection, openConnection, type Connection } from './repositories/db/client';
import { DatabaseFileRepository } from './repositories/db/DatabaseFileRepository';
import { MenuRepository } from './repositories/db/MenuRepository';
import { OrderRepository } from './repositories/db/OrderRepository';
import { PaymentRepository } from './repositories/db/PaymentRepository';
import { PrinterRepository } from './repositories/db/PrinterRepository';
import { PrintJobRepository } from './repositories/db/PrintJobRepository';
import { SettingsRepository } from './repositories/db/SettingsRepository';
import { StatsRepository } from './repositories/db/StatsRepository';
import { TableRepository } from './repositories/db/TableRepository';
import { UserRepository } from './repositories/db/UserRepository';
import type { PrinterDeviceRepository } from './repositories/printer/PrinterDeviceRepository';
import { DatabaseService, type DatabaseRuntime } from './services/DatabaseService';
import { MenuService } from './services/MenuService';
import { OrderService } from './services/OrderService';
import { PaymentService } from './services/PaymentService';
import { PrinterService } from './services/PrinterService';
import { PrintQueueService } from './services/PrintQueueService';
import { PrintWorker, type PrintWorkerOptions } from './services/PrintWorker';
import { SettingsService } from './services/SettingsService';
import { StatsService } from './services/StatsService';
import { TableService } from './services/TableService';
import { TicketService } from './services/TicketService';
import { UserService } from './services/UserService';

export const DEFAULT_DATABASE = 'anlass';

export type RuntimeOptions = {
	dataDir: string;
	device: PrinterDeviceRepository;
	getRequestEvent: () => RequestEvent;
	workerOptions?: Partial<PrintWorkerOptions>;
	now?: () => Date;
};

function createRepositories(connection: Connection) {
	const { db } = connection;
	return {
		menu: new MenuRepository(db),
		orders: new OrderRepository(db),
		payments: new PaymentRepository(db),
		printers: new PrinterRepository(db),
		printJobs: new PrintJobRepository(db),
		settings: new SettingsRepository(db),
		stats: new StatsRepository(db),
		tables: new TableRepository(db),
		users: new UserRepository(db)
	};
}

export type Repositories = ReturnType<typeof createRepositories>;

/**
 * Composition root. Owns the connection to the active event database and wires repositories into
 * services; switching the database rebuilds both.
 */
export class Runtime implements DatabaseRuntime {
	readonly files: DatabaseFileRepository;
	readonly worker: PrintWorker;
	private readonly secret: string;
	private readonly now: () => Date;
	private scope!: Scope;

	constructor(private readonly options: RuntimeOptions) {
		this.files = new DatabaseFileRepository(options.dataDir);
		this.secret = this.files.readOrCreateSecret(() => crypto.randomBytes(32).toString('hex'));
		this.now = options.now ?? (() => new Date());
		this.worker = new PrintWorker(
			() => this.scope.repositories,
			options.device,
			options.workerOptions,
			this.now
		);
		const name = this.files.readActiveName() ?? DEFAULT_DATABASE;
		this.scope = this.createScope(name);
		this.files.writeActiveName(name);
	}

	get services(): Services {
		return this.scope.services;
	}

	get repositories(): Repositories {
		return this.scope.repositories;
	}

	activeName(): string {
		return this.scope.name;
	}

	activate(name: string) {
		const next = this.createScope(name);
		const previous = this.scope;
		this.scope = next;
		this.files.writeActiveName(name);
		this.worker.reset();
		closeConnection(previous.connection);
		this.worker.kick();
	}

	copyMasterDataInto(name: string, tables: string[], eventName: string) {
		const connection = openConnection(this.files.pathOf(name));
		try {
			const { sqlite } = connection;
			sqlite.prepare('attach database ? as source').run(this.scope.connection.file);
			sqlite.transaction(() => {
				for (const table of tables) {
					// Replaces what the migrations created, e.g. the default area.
					sqlite.prepare(`delete from main."${table}"`).run();
					sqlite.prepare(`insert into main."${table}" select * from source."${table}"`).run();
				}
				if (eventName) new SettingsRepository(connection.db).set('eventName', eventName);
			})();
			sqlite.prepare('detach database source').run();
		} finally {
			closeConnection(connection);
		}
	}

	async backup(name: string): Promise<Uint8Array> {
		const target = path.join(os.tmpdir(), `dinoo-${name}-${crypto.randomUUID()}.sqlite`);
		const source =
			name === this.scope.name ? this.scope.connection : openConnection(this.files.pathOf(name));
		try {
			// The backup API yields a consistent copy even while the database is in use.
			await source.sqlite.backup(target);
			return fs.readFileSync(target);
		} finally {
			fs.rmSync(target, { force: true });
			if (source !== this.scope.connection) closeConnection(source);
		}
	}

	close() {
		this.worker.stop();
		closeConnection(this.scope.connection);
	}

	private createScope(name: string): Scope {
		return createScope(this.files.pathOf(name), name, {
			secret: this.secret,
			getRequestEvent: this.options.getRequestEvent,
			worker: this.worker,
			now: this.now,
			files: this.files,
			runtime: this,
			currentServices: () => this.scope.services
		});
	}
}

type ScopeDeps = {
	secret: string;
	getRequestEvent: () => RequestEvent;
	worker: PrintWorker;
	now: () => Date;
	files: DatabaseFileRepository;
	runtime: DatabaseRuntime;
	currentServices: () => Services;
};

export type Services = {
	users: UserService;
	menu: MenuService;
	tables: TableService;
	settings: SettingsService;
	printers: PrinterService;
	printQueue: PrintQueueService;
	orders: OrderService;
	payments: PaymentService;
	stats: StatsService;
	databases: DatabaseService;
};

type Scope = {
	name: string;
	connection: Connection;
	repositories: Repositories;
	services: Services;
};

function createScope(file: string, name: string, deps: ScopeDeps): Scope {
	const connection = openConnection(file);
	const repositories = createRepositories(connection);
	const auth = new AuthRepository(connection.db, deps.secret, deps.getRequestEvent);
	const printQueue = new PrintQueueService(
		repositories.printJobs,
		repositories.printers,
		repositories.settings,
		new TicketService(),
		deps.worker,
		deps.now
	);
	const services: Services = {
		users: new UserService(repositories.users, auth),
		menu: new MenuService(repositories.menu, repositories.printers),
		tables: new TableService(repositories.tables),
		settings: new SettingsService(repositories.settings),
		printers: new PrinterService(repositories.printers, repositories.printJobs),
		printQueue,
		orders: new OrderService(
			repositories.orders,
			repositories.menu,
			repositories.tables,
			repositories.payments,
			repositories.users,
			printQueue,
			deps.now
		),
		payments: new PaymentService(repositories.orders, repositories.payments, deps.now),
		stats: new StatsService(repositories.stats),
		databases: new DatabaseService(
			deps.files,
			deps.runtime,
			() => deps.currentServices().printQueue.countPending(),
			() => deps.currentServices().printQueue.cancelAllPending()
		)
	};
	return { name, connection, repositories, services };
}
