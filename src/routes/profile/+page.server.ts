import { redirect } from '@sveltejs/kit';
import { action, Form, requireUser } from '$lib/server/forms';
import type { Actions, PageServerLoad } from './$types';

/** Only the action is used, from the profile dialog in the user menu. */
export const load: PageServerLoad = () => {
	redirect(303, '/');
};

export const actions: Actions = {
	default: ({ request, locals }) =>
		action(async () => {
			const form = await Form.from(request);
			const { passwordChanged } = await locals.services.users.updateProfile(
				requireUser(locals),
				{
					name: form.string('name'),
					currentPassword: form.string('currentPassword'),
					newPassword: form.string('newPassword')
				},
				request.headers
			);
			return {
				message: passwordChanged ? 'Profil und Passwort gespeichert' : 'Profil gespeichert'
			};
		})
};
