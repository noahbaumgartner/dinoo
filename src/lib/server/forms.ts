import { error, fail, isRedirect } from '@sveltejs/kit';
import { parseChf } from '$lib/money';
import { DomainError } from './services/errors';
import type { UserRecord } from './repositories/db/types';

/** Reads typed values from submitted form data. Invalid input becomes a user-facing error. */
export class Form {
	constructor(private readonly data: FormData) {}

	static async from(request: Request) {
		return new Form(await request.formData());
	}

	string(name: string): string {
		const value = this.data.get(name);
		return typeof value === 'string' ? value : '';
	}

	optionalString(name: string): string | null {
		return this.string(name).trim() || null;
	}

	int(name: string): number {
		const value = Number.parseInt(this.string(name), 10);
		if (Number.isNaN(value)) throw new DomainError('Ungültige Eingabe.');
		return value;
	}

	/** All values of a repeated field, e.g. an ordered list of ids. */
	ints(name: string): number[] {
		return this.data.getAll(name).map((raw) => {
			const value = typeof raw === 'string' ? Number.parseInt(raw, 10) : Number.NaN;
			if (Number.isNaN(value)) throw new DomainError('Ungültige Eingabe.');
			return value;
		});
	}

	optionalInt(name: string): number | null {
		const raw = this.string(name).trim();
		return raw === '' ? null : this.int(name);
	}

	bool(name: string): boolean {
		const value = this.string(name);
		return value === 'on' || value === 'true' || value === '1';
	}

	/** Parsed JSON of a field; the service checks its shape. */
	json(name: string): unknown {
		try {
			return JSON.parse(this.string(name));
		} catch {
			throw new DomainError('Ungültige Eingabe.');
		}
	}

	cents(name: string): number {
		const value = parseChf(this.string(name));
		if (value === null) throw new DomainError('Bitte einen gültigen Betrag angeben, z. B. 4.50.');
		return value;
	}

	oneOf<T extends string>(name: string, options: readonly T[]): T {
		const value = this.string(name);
		if (!options.includes(value as T)) throw new DomainError('Ungültige Auswahl.');
		return value as T;
	}

	file(name: string): File | null {
		const value = this.data.get(name);
		return value instanceof File && value.size > 0 ? value : null;
	}
}

/**
 * Runs a form action and turns domain errors into `fail()`, so pages can show `form.error`.
 * Redirects and other errors pass through.
 */
export async function action<T>(run: () => T | Promise<T>) {
	try {
		return await run();
	} catch (err) {
		if (isRedirect(err)) throw err;
		if (err instanceof DomainError) return fail(err.status, { error: err.message });
		throw err;
	}
}

/** The signed-in user; the hook already redirected anonymous requests. */
export function requireUser(locals: App.Locals): UserRecord {
	if (!locals.user) error(401, { message: 'Bitte zuerst anmelden.' });
	return locals.user;
}
