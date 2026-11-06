import { MIN_PASSWORD_LENGTH, type AuthRepository } from '../repositories/auth/AuthRepository';
import type { Role, UserRecord } from '../repositories/db/types';
import type { UserRepository } from '../repositories/db/UserRepository';
import { DomainError, ensure, notFound } from './errors';

const USERNAME_PATTERN = /^[a-zA-Z0-9._-]{2,32}$/;

export type SessionUser = Pick<UserRecord, 'id' | 'name' | 'username' | 'role' | 'active'>;

/** Sign-in and user administration (F01, F06). */
export class UserService {
	constructor(
		private readonly users: UserRepository,
		private readonly auth: AuthRepository
	) {}

	needsSetup(): boolean {
		return this.users.count() === 0;
	}

	async currentUser(headers: Headers): Promise<UserRecord | null> {
		const session = await this.auth.getSession(headers);
		if (!session) return null;
		const user = this.users.get(session.user.id);
		return user?.active ? user : null;
	}

	async signIn(username: string, password: string, headers: Headers) {
		const user = this.users.findByUsername(username.trim().toLowerCase());
		// Same message for every failure, so it does not reveal which part was wrong (F01).
		const invalid = new DomainError('Benutzername oder Passwort ist falsch.');
		if (!user || !user.active) throw invalid;
		try {
			await this.auth.signIn(username.trim(), password, headers);
		} catch {
			throw invalid;
		}
	}

	async signOut(headers: Headers) {
		await this.auth.signOut(headers);
	}

	list(): UserRecord[] {
		return this.users.list();
	}

	async createInitialAdmin(input: { username: string; name: string; password: string }) {
		if (!this.needsSetup()) throw new DomainError('Es existiert bereits ein Benutzer.', 409);
		return this.create({ ...input, role: 'admin' });
	}

	async create(input: { username: string; name: string; role: Role; password: string }) {
		const username = input.username.trim();
		const name = input.name.trim();
		if (!USERNAME_PATTERN.test(username))
			throw new DomainError(
				'Der Benutzername darf 2–32 Zeichen lang sein: Buchstaben, Ziffern, Punkt, Binde- und Unterstrich.'
			);
		if (!name) throw new DomainError('Bitte einen Anzeigenamen angeben.');
		this.checkPassword(input.password);
		if (this.users.findByUsername(username.toLowerCase()))
			throw new DomainError('Dieser Benutzername ist bereits vergeben.', 409);
		return this.auth.createUser({ username, name, role: input.role, password: input.password });
	}

	update(id: string, input: { name: string; role: Role; active: boolean }, by: UserRecord) {
		const user = this.users.get(id) ?? notFound('Benutzer');
		const name = input.name.trim();
		if (!name) throw new DomainError('Bitte einen Anzeigenamen angeben.');
		const losesAdmin = user.role === 'admin' && (input.role !== 'admin' || !input.active);
		if (losesAdmin && user.active && this.users.countOtherActiveAdmins(id) === 0)
			throw new DomainError(
				'Der letzte aktive Admin kann nicht deaktiviert oder herabgestuft werden.'
			);
		if (id === by.id && !input.active)
			throw new DomainError('Du kannst dich nicht selbst deaktivieren.');
		this.users.update(id, { name, role: input.role, active: input.active });
		// Deactivated users are signed out everywhere immediately.
		if (!input.active) this.users.deleteSessions(id);
	}

	async setPassword(id: string, password: string) {
		ensure(this.users.get(id), 'Benutzer');
		this.checkPassword(password);
		await this.auth.setPassword(id, password);
	}

	private checkPassword(password: string) {
		if (password.length < MIN_PASSWORD_LENGTH)
			throw new DomainError(`Das Passwort muss mindestens ${MIN_PASSWORD_LENGTH} Zeichen haben.`);
	}
}
