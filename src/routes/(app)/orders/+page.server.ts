import { requireUser } from '$lib/server/forms';
import { orderFilterFromUrl } from '$lib/server/order-filter';
import type { PageServerLoad } from './$types';

/** «Meine Bestellungen»: the reduced search for service staff, only their own orders (F08). */
export const load: PageServerLoad = ({ locals, url }) => {
	const user = requireUser(locals);
	const { filter, values } = orderFilterFromUrl(url, { paymentStatus: 'unpaid' });
	return {
		orders: locals.services.orders.search({
			...filter,
			createdByUserId: user.id
		}),
		tables: locals.services.tables.choices(),
		values
	};
};
