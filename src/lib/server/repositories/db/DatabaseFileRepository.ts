import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

export type DatabaseFile = {
	name: string;
	sizeBytes: number;
	modifiedAt: Date;
	eventName: string | null;
};

const EXTENSION = '.sqlite';
const NAME_PATTERN = /^[a-z0-9][a-z0-9-]{0,62}$/;

/** File-system access to the event databases in the data directory. */
export class DatabaseFileRepository {
	constructor(private readonly dataDir: string) {
		fs.mkdirSync(dataDir, { recursive: true });
	}

	static isValidName(name: string) {
		return NAME_PATTERN.test(name);
	}

	pathOf(name: string) {
		if (!DatabaseFileRepository.isValidName(name))
			throw new Error(`Invalid database name: ${name}`);
		return path.join(this.dataDir, name + EXTENSION);
	}

	exists(name: string) {
		return fs.existsSync(this.pathOf(name));
	}

	list(): DatabaseFile[] {
		return fs
			.readdirSync(this.dataDir)
			.filter((file) => file.endsWith(EXTENSION))
			.map((file) => {
				const name = file.slice(0, -EXTENSION.length);
				const stat = fs.statSync(path.join(this.dataDir, file));
				return {
					name,
					sizeBytes: stat.size,
					modifiedAt: stat.mtime,
					eventName: this.readEventName(name)
				};
			})
			.filter((file) => DatabaseFileRepository.isValidName(file.name))
			.sort((a, b) => b.modifiedAt.getTime() - a.modifiedAt.getTime());
	}

	readActiveName(): string | null {
		try {
			const raw = JSON.parse(fs.readFileSync(this.activeFile(), 'utf8')) as { active?: unknown };
			return typeof raw.active === 'string' && DatabaseFileRepository.isValidName(raw.active)
				? raw.active
				: null;
		} catch {
			return null;
		}
	}

	writeActiveName(name: string) {
		fs.writeFileSync(this.activeFile(), JSON.stringify({ active: name }, null, '\t') + '\n');
	}

	write(name: string, content: Uint8Array) {
		fs.writeFileSync(this.pathOf(name), content);
	}

	delete(name: string) {
		for (const suffix of ['', '-wal', '-shm'])
			fs.rmSync(this.pathOf(name) + suffix, { force: true });
	}

	/** Reads the secret used to sign sessions, creating it on first start. */
	readOrCreateSecret(create: () => string) {
		const file = path.join(this.dataDir, 'secret');
		if (fs.existsSync(file)) return fs.readFileSync(file, 'utf8').trim();
		const secret = create();
		fs.writeFileSync(file, secret + '\n', { mode: 0o600 });
		return secret;
	}

	private activeFile() {
		return path.join(this.dataDir, 'active.json');
	}

	private readEventName(name: string): string | null {
		try {
			const db = new Database(this.pathOf(name), { readonly: true, fileMustExist: true });
			try {
				const row = db.prepare("select value from settings where key = 'eventName'").get() as
					| { value: string }
					| undefined;
				return row?.value ?? null;
			} finally {
				db.close();
			}
		} catch {
			return null;
		}
	}
}
