import { redirect } from '@sveltejs/kit';
import { action, Form, requireUser } from '$lib/server/forms';
import { DomainError } from '$lib/server/services/errors';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => {
	const { tables, categories } = locals.services.orders.orderingData();
	return {
		tables: tables.map(({ id, label }) => ({ id, label })),
		categories: categories.map((category) => ({
			id: category.id,
			name: category.name,
			articles: category.articles.map(({ id, name, priceCents }) => ({ id, name, priceCents }))
		}))
	};
};

export const actions: Actions = {
	place: ({ request, locals }) =>
		action(async () => {
			const user = requireUser(locals);
			const form = await Form.from(request);
			let items: { articleId: number; quantity: number }[];
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
					note: form.string('note'),
					items: items.map((item) => ({
						articleId: Number(item.articleId),
						quantity: Number(item.quantity)
					}))
				},
				user
			);
			redirect(303, `/orders/${order.id}?neu=1`);
		})
};
