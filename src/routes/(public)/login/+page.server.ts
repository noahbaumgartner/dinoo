import { fail, redirect } from '@sveltejs/kit';
import { Form } from '$lib/server/forms';
import { DomainError } from '$lib/server/services/errors';
import type { Actions, PageServerLoad } from './$types';

function safeRedirect(target: string | null) {
	// Only same-site paths, never `//host` or absolute URLs.
	return target && target.startsWith('/') && !target.startsWith('//') ? target : '/';
}

export const load: PageServerLoad = ({ locals, url }) => {
	if (locals.user) redirect(303, safeRedirect(url.searchParams.get('redirectTo')));
};

export const actions: Actions = {
	default: async ({ request, locals, url }) => {
		const form = await Form.from(request);
		const username = form.string('username');
		try {
			await locals.services.users.signIn(username, form.string('password'), request.headers);
		} catch (err) {
			if (err instanceof DomainError) return fail(400, { error: err.message, username });
			throw err;
		}
		redirect(303, safeRedirect(url.searchParams.get('redirectTo')));
	}
};
