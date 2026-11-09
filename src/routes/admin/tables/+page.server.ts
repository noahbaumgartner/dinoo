import { action, Form } from '$lib/server/forms';
import { DomainError } from '$lib/server/services/errors';
import type { GridInput } from '$lib/server/services/TableService';
import { TABLE_NUMBERINGS } from '$lib/table-grid';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => {
	const tables = locals.services.tables.list();
	return { tables, plan: locals.services.tables.plan(tables) };
};

/** The seating plan as edited on the page, sent as JSON in one field. */
function planFrom(form: Form): GridInput {
	const invalid = () => new DomainError('Der Saalplan ist ungültig.');
	let plan: GridInput;
	try {
		plan = JSON.parse(form.string('plan'));
	} catch {
		throw invalid();
	}
	const int = (value: unknown) => Number.isInteger(value);
	if (
		!int(plan?.rows) ||
		!int(plan.columns) ||
		!TABLE_NUMBERINGS.includes(plan.numbering) ||
		!Array.isArray(plan.cells) ||
		!Array.isArray(plan.free) ||
		!plan.cells.every(
			(cell) =>
				int(cell?.row) &&
				int(cell.column) &&
				typeof cell.label === 'string' &&
				typeof cell.active === 'boolean'
		) ||
		!plan.free.every((table) => int(table?.id) && typeof table.active === 'boolean')
	)
		throw invalid();
	return plan;
}

export const actions: Actions = {
	plan: ({ request, locals }) =>
		action(async () => {
			const form = await Form.from(request);
			locals.services.tables.applyGrid(planFrom(form));
			return { message: 'Tische gespeichert' };
		}),
	save: ({ request, locals }) =>
		action(async () => {
			const form = await Form.from(request);
			const id = form.optionalInt('id');
			locals.services.tables.save(id, {
				label: form.string('label'),
				sortOrder: form.optionalInt('sortOrder') ?? 0
			});
			return { message: id === null ? 'Tisch erfasst' : 'Tisch gespeichert' };
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
