import { action, Form } from '$lib/server/forms';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => ({
	tables: locals.services.tables.list()
});

export const actions: Actions = {
	save: ({ request, locals }) =>
		action(async () => {
			const form = await Form.from(request);
			const id = form.optionalInt('id');
			locals.services.tables.save(id, {
				label: form.string('label'),
				sortOrder: form.optionalInt('sortOrder') ?? 0,
				active: form.bool('active')
			});
			return { message: id === null ? 'Tisch erfasst' : 'Tisch gespeichert' };
		}),
	range: ({ request, locals }) =>
		action(async () => {
			const form = await Form.from(request);
			const count = locals.services.tables.createRange(form.int('from'), form.int('to'));
			return {
				message: count === 0 ? 'Diese Tische existieren bereits' : `${count} Tische angelegt`
			};
		}),
	toggle: ({ request, locals }) =>
		action(async () => {
			const form = await Form.from(request);
			const table = locals.services.tables.list().find((t) => t.id === form.int('id'));
			if (table) locals.services.tables.save(table.id, { ...table, active: !table.active });
			return {};
		}),
	delete: ({ request, locals }) =>
		action(async () => {
			const form = await Form.from(request);
			const result = locals.services.tables.delete(form.int('id'));
			return {
				message:
					result === 'deleted' ? 'Tisch gelöscht' : 'Tisch hat Bestellungen und wurde deaktiviert'
			};
		})
};
