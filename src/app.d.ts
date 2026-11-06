import type { UserRecord } from '$lib/server/repositories/db/types';
import type { Services } from '$lib/server/runtime';

declare global {
	namespace App {
		interface Locals {
			user: UserRecord | null;
			services: Services;
		}
		interface Error {
			message: string;
		}
	}
}

export {};
