import { action, Form, requireUser } from '$lib/server/forms';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => ({
	users: locals.services.users
		.list()
		.map(({ id, name, username, displayUsername, role, active }) => ({
			id,
			name,
			username: displayUsername ?? username ?? '',
			role,
			active
		})),
	currentUserId: requireUser(locals).id
});

export const actions: Actions = {
	create: ({ request, locals }) =>
		action(async () => {
			const form = await Form.from(request);
			await locals.services.users.create({
				username: form.string('username'),
				name: form.string('name'),
				role: form.oneOf('role', ['service', 'admin'] as const),
				password: form.string('password')
			});
			return { message: 'Benutzer angelegt' };
		}),
	update: ({ request, locals }) =>
		action(async () => {
			const form = await Form.from(request);
			locals.services.users.update(
				form.string('id'),
				{
					name: form.string('name'),
					role: form.oneOf('role', ['service', 'admin'] as const),
					active: form.bool('active')
				},
				requireUser(locals)
			);
			const password = form.string('password');
			if (password) await locals.services.users.setPassword(form.string('id'), password);
			return { message: password ? 'Benutzer und Passwort gespeichert' : 'Benutzer gespeichert' };
		})
};
