import type {
	DatabaseFile,
	DatabaseFileRepository
} from '../repositories/db/DatabaseFileRepository';
import { DomainError } from './errors';

/** Tables copied into a new event database when the admin keeps the master data. */
const MASTER_DATA_TABLES = ['user', 'account', 'printers', 'categories', 'articles', 'tables'];

export type DatabaseRuntime = {
	activeName(): string;
	activate(name: string): void;
	/** Runs SQL on the active database (used to copy master data). */
	copyMasterDataInto(name: string, tables: string[], eventName: string): void;
	backup(name: string): Promise<Uint8Array>;
};

export type DatabaseView = DatabaseFile & { active: boolean };

const SQLITE_HEADER = 'SQLite format 3\0';

/** One SQLite file per event, switchable in the admin interface (F10). */
export class DatabaseService {
	constructor(
		private readonly files: DatabaseFileRepository,
		private readonly runtime: DatabaseRuntime,
		private readonly pendingPrintJobs: () => number,
		private readonly cancelPendingPrintJobs: () => number
	) {}

	list(): DatabaseView[] {
		const active = this.runtime.activeName();
		return this.files.list().map((file) => ({ ...file, active: file.name === active }));
	}

	activeName() {
		return this.runtime.activeName();
	}

	/** Creates a new event database, optionally with users, printers, menu and tables. */
	create(input: { name: string; eventName: string; copyMasterData: boolean; activate: boolean }) {
		const name = slug(input.name);
		if (!name) throw new DomainError('Bitte einen Namen für die Datenbank angeben.');
		if (this.files.exists(name))
			throw new DomainError(`Eine Datenbank «${name}» existiert bereits.`, 409);
		this.runtime.copyMasterDataInto(
			name,
			input.copyMasterData ? MASTER_DATA_TABLES : [],
			input.eventName.trim()
		);
		if (input.activate) this.activate(name, false);
		return name;
	}

	/** Switching needs an empty print queue, unless the admin agrees to cancel what is waiting. */
	activate(name: string, cancelPendingPrintJobs: boolean) {
		if (!this.files.exists(name)) throw new DomainError('Diese Datenbank existiert nicht.', 404);
		if (name === this.runtime.activeName()) return;
		if (this.pendingPrintJobs() > 0) {
			if (!cancelPendingPrintJobs)
				throw new DomainError(
					'In der Druckwarteschlange warten noch Aufträge. Bitte abwarten oder abbrechen.',
					409
				);
			this.cancelPendingPrintJobs();
		}
		this.runtime.activate(name);
	}

	async download(name: string): Promise<Uint8Array> {
		if (!this.files.exists(name)) throw new DomainError('Diese Datenbank existiert nicht.', 404);
		return this.runtime.backup(name);
	}

	upload(rawName: string, content: Uint8Array): string {
		const name = slug(rawName.replace(/\.(sqlite|db)$/i, ''));
		if (!name) throw new DomainError('Bitte einen gültigen Dateinamen verwenden.');
		if (this.files.exists(name))
			throw new DomainError(`Eine Datenbank «${name}» existiert bereits.`, 409);
		const header = new TextDecoder().decode(content.slice(0, SQLITE_HEADER.length));
		if (header !== SQLITE_HEADER) throw new DomainError('Die Datei ist keine SQLite-Datenbank.');
		this.files.write(name, content);
		return name;
	}

	delete(name: string) {
		if (name === this.runtime.activeName())
			throw new DomainError('Die aktive Datenbank kann nicht gelöscht werden.', 409);
		if (!this.files.exists(name)) throw new DomainError('Diese Datenbank existiert nicht.', 404);
		this.files.delete(name);
	}
}

/** `"Herbstfest 2026"` → `"herbstfest-2026"` */
export function slug(input: string): string {
	return input
		.trim()
		.toLowerCase()
		.replace(/ä/g, 'ae')
		.replace(/ö/g, 'oe')
		.replace(/ü/g, 'ue')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 63);
}
