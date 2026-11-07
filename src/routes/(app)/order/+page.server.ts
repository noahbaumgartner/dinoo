import { redirect } from '@sveltejs/kit';
import { action, Form, requireUser } from '$lib/server/forms';
import { DomainError } from '$lib/server/services/errors';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => {
	const { tables, categories } = locals.services.orders.orderingData();
	const { rows, columns, numbering } = locals.services.tables.plan();
	return {
		plan: { rows, columns, numbering },
		tables: tables.map(({ id, label, gridRow, gridColumn }) => ({
			id,
			label,
			gridRow,
			gridColumn
		})),
		categories: categories.map((category) => ({
			id: category.id,
			name: category.name,
			color: category.color,
			articles: category.articles.map(({ id, name, priceCents }) => ({ id, name, priceCents }))
		}))
	};
};

export const actions: Actions = {
	place: ({ request, locals }) =>
		action(async () => {
			const user = requireUser(locals);
			const form = await Form.from(request);
			let items: { articleId: number; quantity: number; note?: unknown }[];
			try {
				items = JSON.parse(form.string('items'));
				if (!Array.isArray(items)) throw new Error();
			} catch {
				throw new DomainError('Die Bestellung konnte nicht gelesen werden.');
			}
			const order = locals.services.orders.place(
				{
					clientRequestId: form.string('clientRequestId'),
					tableId: form.int('tableId'),
					items: items.map((item) => ({
						articleId: Number(item.articleId),
						quantity: Number(item.quantity),
						note: typeof item.note === 'string' ? item.note : null
					}))
				},
				user
			);
			redirect(303, `/orders/${order.id}`);
		})
};
