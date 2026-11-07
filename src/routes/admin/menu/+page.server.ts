import { action, Form } from '$lib/server/forms';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => ({
	categories: locals.services.menu.overview(),
	printers: locals.services.printers.list().map(({ id, name, active }) => ({ id, name, active }))
});

export const actions: Actions = {
	saveCategory: ({ request, locals }) =>
		action(async () => {
			const form = await Form.from(request);
			const id = form.optionalInt('id');
			locals.services.menu.saveCategory(id, {
				name: form.string('name'),
				sortOrder: form.optionalInt('sortOrder') ?? 0,
				color: form.string('color'),
				defaultPrinterId: form.optionalInt('defaultPrinterId')
			});
			return { message: id === null ? 'Kategorie erfasst' : 'Kategorie gespeichert' };
		}),
	deleteCategory: ({ request, locals }) =>
		action(async () => {
			const form = await Form.from(request);
			locals.services.menu.deleteCategory(form.int('id'));
			return { message: 'Kategorie gelöscht' };
		}),
	saveArticle: ({ request, locals }) =>
		action(async () => {
			const form = await Form.from(request);
			const id = form.optionalInt('id');
			locals.services.menu.saveArticle(id, {
				name: form.string('name'),
				priceCents: form.cents('price'),
				categoryId: form.int('categoryId'),
				printerId: form.optionalInt('printerId'),
				sortOrder: form.optionalInt('sortOrder') ?? 0,
				active: form.bool('active')
			});
			return { message: id === null ? 'Artikel erfasst' : 'Artikel gespeichert' };
		}),
	setActive: ({ request, locals }) =>
		action(async () => {
			const form = await Form.from(request);
			const active = form.bool('active');
			locals.services.menu.setArticleActive(form.int('id'), active);
			return { message: active ? 'Artikel wieder bestellbar' : 'Artikel als ausverkauft markiert' };
		}),
	deleteArticle: ({ request, locals }) =>
		action(async () => {
			const form = await Form.from(request);
			const result = locals.services.menu.deleteArticle(form.int('id'));
			return {
				message:
					result === 'deleted'
						? 'Artikel gelöscht'
						: 'Artikel wurde schon bestellt und ist jetzt deaktiviert'
			};
		})
};
