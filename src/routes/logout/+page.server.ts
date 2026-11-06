import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = () => {
	redirect(303, '/');
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		await locals.services.users.signOut(request.headers);
		redirect(303, '/login');
	}
};
