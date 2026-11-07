import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { username } from 'better-auth/plugins/username';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import type { RequestEvent } from '@sveltejs/kit';
import type { Db } from '../db/client';
import { account, session, user, verification } from '../db/schema';
import type { Role } from '../db/types';

export const MIN_PASSWORD_LENGTH = 4;
const SESSION_DAYS = 7;

function createAuth(db: Db, secret: string, getRequestEvent: () => RequestEvent) {
	return betterAuth({
		appName: 'dinoo',
		secret,
		// Clients reach the laptop by IP or its local DNS name, always over plain HTTP.
		baseURL: { allowedHosts: ['*'], fallback: 'http://localhost', protocol: 'http' },
		database: drizzleAdapter(db, {
			provider: 'sqlite',
			schema: { user, session, account, verification }
		}),
		emailAndPassword: {
			enabled: true,
			// Accounts are created by admins only (F06).
			disableSignUp: true,
			minPasswordLength: MIN_PASSWORD_LENGTH
		},
		user: {
			additionalFields: {
				role: { type: 'string', input: false, defaultValue: 'service' },
				active: { type: 'boolean', input: false, defaultValue: true }
			}
		},
		session: {
			// At least the length of an event (F01).
			expiresIn: 60 * 60 * 24 * SESSION_DAYS,
			updateAge: 60 * 60 * 12
		},
		// Local network over plain HTTP, reached by IP or local DNS name.
		advanced: { useSecureCookies: false },
		trustedOrigins: (request) => (request ? [new URL(request.url).origin] : []),
		plugins: [username({ minUsernameLength: 2 }), sveltekitCookies(getRequestEvent)]
	});
}

type Auth = ReturnType<typeof createAuth>;

export type NewUser = { username: string; name: string; role: Role; password: string };

/** Sign-in, sessions and password storage, handled by Better Auth on the event database. */
export class AuthRepository {
	private readonly auth: Auth;

	constructor(db: Db, secret: string, getRequestEvent: () => RequestEvent) {
		this.auth = createAuth(db, secret, getRequestEvent);
	}

	async getSession(headers: Headers) {
		return this.auth.api.getSession({ headers });
	}

	/** Sets the session cookie on the current request (via the SvelteKit cookie plugin). */
	async signIn(username: string, password: string, headers: Headers) {
		await this.auth.api.signInUsername({ body: { username, password }, headers });
	}

	async signOut(headers: Headers) {
		await this.auth.api.signOut({ headers });
	}

	async createUser(input: NewUser): Promise<string> {
		const context = await this.auth.$context;
		const normalized = input.username.trim().toLowerCase();
		const created = await context.internalAdapter.createUser(
			{
				email: `${normalized}@dinoo.local`,
				emailVerified: false,
				name: input.name,
				username: normalized,
				displayUsername: input.username.trim(),
				role: input.role,
				active: true
			},
			// Created by an admin in the admin interface, not by self sign-up.
			{ method: 'admin' }
		);
		await context.internalAdapter.linkAccount({
			userId: created.id,
			providerId: 'credential',
			accountId: created.id,
			password: await context.password.hash(input.password)
		});
		return created.id;
	}

	/** Changes the signed-in user's own password; throws if the current password is wrong. */
	async changePassword(headers: Headers, currentPassword: string, newPassword: string) {
		await this.auth.api.changePassword({ body: { currentPassword, newPassword }, headers });
	}

	async setPassword(userId: string, password: string) {
		const context = await this.auth.$context;
		await context.internalAdapter.updatePassword(userId, await context.password.hash(password));
	}
}
