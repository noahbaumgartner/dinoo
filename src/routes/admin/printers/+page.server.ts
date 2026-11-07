import { action, Form } from '$lib/server/forms';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => ({
	printers: locals.services.printQueue.printerStatuses()
});

export const actions: Actions = {
	save: ({ request, locals }) =>
		action(async () => {
			const form = await Form.from(request);
			const id = form.optionalInt('id');
			locals.services.printers.save(id, {
				name: form.string('name'),
				host: form.string('host'),
				port: form.optionalInt('port') ?? 9100,
				model: form.oneOf('model', ['TM-T20IV', 'TM-T20III'] as const)
			});
			return { message: id === null ? 'Drucker erfasst' : 'Drucker gespeichert' };
		}),
	toggle: ({ request, locals }) =>
		action(async () => {
			const form = await Form.from(request);
			locals.services.printers.setActive(form.int('id'), form.bool('active'));
			return {};
		}),
	delete: ({ request, locals }) =>
		action(async () => {
			const form = await Form.from(request);
			const result = locals.services.printers.delete(form.int('id'));
			return {
				message:
					result === 'deleted'
						? 'Drucker gelöscht'
						: 'Drucker wird verwendet und wurde deshalb nur deaktiviert'
			};
		}),
	test: ({ request, locals }) =>
		action(async () => {
			const form = await Form.from(request);
			locals.services.printQueue.enqueueTest(form.int('printerId'));
			return { message: 'Testdruck in die Warteschlange gestellt' };
		})
};
