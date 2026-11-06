import { and, asc, eq, ne } from 'drizzle-orm';
import { countRows, type Db } from './client';
import { session, user } from './schema';
import type { Role, UserRecord } from './types';

export type UserUpdate = {
	name?: string;
	role?: Role;
	active?: boolean;
};

/** Read and update users. Creating users and passwords goes through Better Auth (`AuthGateway`). */
export class UserRepository {
	constructor(private readonly db: Db) {}

	list(): UserRecord[] {
		return this.db.select().from(user).orderBy(asc(user.name)).all();
	}

	get(id: string): UserRecord | undefined {
		return this.db.select().from(user).where(eq(user.id, id)).get();
	}

	findByUsername(username: string): UserRecord | undefined {
		return this.db.select().from(user).where(eq(user.username, username)).get();
	}

	count(): number {
		return countRows(this.db, user);
	}

	countOtherActiveAdmins(exceptId: string): number {
		return countRows(
			this.db,
			user,
			and(eq(user.role, 'admin'), eq(user.active, true), ne(user.id, exceptId))
		);
	}

	update(id: string, update: UserUpdate) {
		this.db.update(user).set(update).where(eq(user.id, id)).run();
	}

	deleteSessions(userId: string) {
		this.db.delete(session).where(eq(session.userId, userId)).run();
	}
}
