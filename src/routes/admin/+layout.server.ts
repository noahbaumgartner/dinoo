import { requireUser } from '$lib/server/forms';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ locals }) => {
	const user = requireUser(locals);
	return {
		user: {
			id: user.id,
			name: user.name,
			username: user.displayUsername ?? user.username ?? '',
			role: user.role
		},
		eventName: locals.services.settings.get().eventName,
		database: locals.services.databases.activeName(),
		pendingPrintJobs: locals.services.printQueue.countPending()
	};
};
