import { action, Form } from '$lib/server/forms';
import { DomainError } from '$lib/server/services/errors';
import type { GridInput } from '$lib/server/services/TableService';
import { TABLE_NUMBERINGS } from '$lib/table-grid';
import type { Actions, PageServerLoad } from './$types';

/** All areas with their tables, so switching between them needs no request and keeps drafts. */
export const load: PageServerLoad = ({ locals }) => {
	const { tables } = locals.services;
	return {
		areas: tables.areas().map((area) => {
			const areaTables = tables.list(area.id);
			return { ...area, tables: areaTables, plan: tables.plan(area.id, areaTables) };
		})
	};
};

type AreaGrid = GridInput & { areaId: number };

/** The changed seating plans as edited on the page, sent as a JSON list in one field. */
function plansFrom(form: Form): AreaGrid[] {
	const plans = form.json('plans');
	if (!Array.isArray(plans)) throw new DomainError('Der Tischplan ist ungültig.');
	return plans.map(planFrom);
}

function planFrom(plan: AreaGrid): AreaGrid {
	const invalid = () => new DomainError('Der Tischplan ist ungültig.');
	const int = (value: unknown) => Number.isInteger(value);
	if (
		!int(plan?.areaId) ||
		!int(plan.rows) ||
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
			locals.services.tables.applyGrids(plansFrom(form));
			return { message: 'Tische gespeichert' };
		}),
	save: ({ request, locals }) =>
		action(async () => {
			const form = await Form.from(request);
			const id = form.optionalInt('id');
			locals.services.tables.save(id, {
				label: form.string('label'),
				sortOrder: form.optionalInt('sortOrder') ?? 0,
				areaId: form.optionalInt('areaId') ?? undefined
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
		}),
	saveArea: ({ request, locals }) =>
		action(async () => {
			const form = await Form.from(request);
			const id = form.optionalInt('id');
			const area = locals.services.tables.saveArea(id, { name: form.string('name') });
			// A new area opens right away so its plan can be set up.
			if (area) return { message: 'Bereich erfasst', areaId: area.id };
			return { message: 'Bereich gespeichert' };
		}),
	deleteArea: ({ request, locals }) =>
		action(async () => {
			const form = await Form.from(request);
			locals.services.tables.deleteArea(form.int('id'));
			return { message: 'Bereich gelöscht' };
		})
};
