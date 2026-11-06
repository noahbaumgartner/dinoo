import { action, Form, requireUser } from '$lib/server/forms';
import { orderActions } from '$lib/server/order-actions';
import { loadOrderView } from '$lib/server/order-view';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals, params }) => ({
	...loadOrderView(locals.services, Number(params.id), requireUser(locals)),
	printers: locals.services.printers
		.list()
		.filter((printer) => printer.active)
		.map(({ id, name }) => ({ id, name }))
});

export const actions: Actions = {
	...orderActions,
	reprint: ({ request, locals }) =>
		action(async () => {
			const form = await Form.from(request);
			locals.services.printQueue.reprint(
				form.int('jobId'),
				form.optionalInt('printerId') ?? undefined
			);
			return { reprinted: true };
		})
};
