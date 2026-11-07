import { action, Form } from '$lib/server/forms';
import { TABLE_NUMBERINGS } from '$lib/table-grid';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => {
	const tables = locals.services.tables.list();
	return { tables, plan: locals.services.tables.plan(tables) };
};

export const actions: Actions = {
	grid: ({ request, locals }) =>
		action(async () => {
			const form = await Form.from(request);
			locals.services.tables.applyGrid({
				rows: form.int('rows'),
				columns: form.int('columns'),
				numbering: form.oneOf('numbering', TABLE_NUMBERINGS)
			});
			return { message: 'Saalplan übernommen' };
		}),
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
	toggle: ({ request, locals }) =>
		action(async () => {
			const form = await Form.from(request);
			locals.services.tables.setActive(form.int('id'), form.bool('active'));
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
