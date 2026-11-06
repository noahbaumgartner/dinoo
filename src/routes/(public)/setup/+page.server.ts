import { fail, redirect } from '@sveltejs/kit';
import { action, Form } from '$lib/server/forms';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => {
	if (!locals.services.users.needsSetup()) redirect(303, '/');
};

export const actions: Actions = {
	default: ({ request, locals }) =>
		action(async () => {
			const form = await Form.from(request);
			const { users, settings } = locals.services;
			const username = form.string('username');
			const password = form.string('password');
			if (password !== form.string('passwordRepeat'))
				return fail(400, { error: 'Die Passwörter stimmen nicht überein.' });
			await users.createInitialAdmin({ username, name: form.string('name'), password });
			const eventName = form.optionalString('eventName');
			if (eventName) settings.setEventName(eventName);
			await users.signIn(username, password, request.headers);
			redirect(303, '/admin');
		})
};
