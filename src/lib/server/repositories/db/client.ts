import Database from 'better-sqlite3';
import { sql, type SQL } from 'drizzle-orm';
import type { SQLiteTable } from 'drizzle-orm/sqlite-core';
import { drizzle, type BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import path from 'node:path';
import { schema } from './schema';

export type Db = BetterSQLite3Database<typeof schema>;

export type Connection = {
	file: string;
	sqlite: Database.Database;
	db: Db;
};

const MIGRATIONS_FOLDER = path.resolve(process.env.MIGRATIONS_DIR ?? 'drizzle');

/** Opens (and creates if missing) an SQLite file and brings its schema up to date. */
export function openConnection(file: string): Connection {
	const sqlite = new Database(file);
	sqlite.pragma('journal_mode = WAL');
	sqlite.pragma('foreign_keys = ON');
	sqlite.pragma('busy_timeout = 5000');
	const db = drizzle(sqlite, { schema });
	migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });
	return { file, sqlite, db };
}

export function closeConnection(connection: Connection) {
	connection.sqlite.close();
}

/** Synchronous `count(*)` (Drizzle's `$count` is promise-based). */
export function countRows(db: Db, table: SQLiteTable, where?: SQL): number {
	const row = db
		.select({ count: sql<number>`count(*)` })
		.from(table)
		.where(where)
		.get();
	return Number(row?.count ?? 0);
}
