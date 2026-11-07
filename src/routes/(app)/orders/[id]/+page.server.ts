import { requireUser } from '$lib/server/forms';
import { orderActions } from '$lib/server/order-actions';
import { loadOrderView } from '$lib/server/order-view';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals, params }) =>
	loadOrderView(locals.services, Number(params.id), requireUser(locals));

export const actions: Actions = orderActions;
