import { orderFilterFromUrl } from '$lib/server/order-filter';
import type { PageServerLoad } from './$types';

/** Order search for admins: by table, staff or order number (F08). */
export const load: PageServerLoad = ({ locals, url }) => {
	const { filter, values } = orderFilterFromUrl(url);
	return {
		orders: locals.services.orders.search(filter),
		tables: locals.services.tables.list().map(({ id, label }) => ({ id, label })),
		staff: locals.services.users.list().map(({ id, name }) => ({ id, name })),
		values
	};
};
