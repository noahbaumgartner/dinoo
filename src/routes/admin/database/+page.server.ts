import { redirect } from '@sveltejs/kit';
import { action, Form } from '$lib/server/forms';
import { DomainError } from '$lib/server/services/errors';
import type { Actions, PageServerLoad } from './$types';

const MAX_UPLOAD_BYTES = 200 * 1024 * 1024;

export const load: PageServerLoad = ({ locals }) => ({
	databases: locals.services.databases.list(),
	pendingPrintJobs: locals.services.printQueue.countPending()
});

export const actions: Actions = {
	create: ({ request, locals }) =>
		action(async () => {
			const form = await Form.from(request);
			const activate = form.bool('activate');
			const name = locals.services.databases.create({
				name: form.string('name') || form.string('eventName'),
				eventName: form.string('eventName'),
				copyMasterData: form.bool('copyMasterData'),
				activate
			});
			// After switching, sessions of the old database are gone: sign in again.
			if (activate) redirect(303, '/login');
			return { message: `Datenbank «${name}» angelegt` };
		}),
	activate: ({ request, locals }) =>
		action(async () => {
			const form = await Form.from(request);
			locals.services.databases.activate(form.string('name'), form.bool('cancelPending'));
			redirect(303, '/login');
		}),
	upload: ({ request, locals }) =>
		action(async () => {
			const form = await Form.from(request);
			const file = form.file('file');
			if (!file) throw new DomainError('Bitte eine Datei wählen.');
			if (file.size > MAX_UPLOAD_BYTES) throw new DomainError('Die Datei ist zu gross.');
			const name = locals.services.databases.upload(
				form.string('name') || file.name,
				new Uint8Array(await file.arrayBuffer())
			);
			return { message: `Datenbank «${name}» hochgeladen` };
		}),
	delete: ({ request, locals }) =>
		action(async () => {
			const form = await Form.from(request);
			locals.services.databases.delete(form.string('name'));
			return { message: 'Datenbank gelöscht' };
		})
};
