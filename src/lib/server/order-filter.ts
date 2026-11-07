import type { OrderFilter, PaymentStatus } from './repositories/db/OrderRepository';

const STATUSES: PaymentStatus[] = ['open', 'partial', 'paid', 'unpaid'];

function int(value: string | null): number | undefined {
	if (!value) return undefined;
	const parsed = Number.parseInt(value, 10);
	return Number.isNaN(parsed) ? undefined : parsed;
}

/** Reads the order search filters from the query string (GET forms keep them in the URL). */
export function orderFilterFromUrl(url: URL, defaults: Partial<OrderFilter> = {}) {
	const params = url.searchParams;
	const status = params.get('status');
	const filter: OrderFilter = {
		tableId: int(params.get('table')),
		orderNumber: int(params.get('number')),
		createdByUserId: params.get('staff') || undefined,
		paymentStatus: params.has('status')
			? STATUSES.includes(status as PaymentStatus)
				? (status as PaymentStatus)
				: undefined
			: defaults.paymentStatus,
		limit: 100
	};
	return {
		filter,
		values: {
			table: params.get('table') ?? '',
			number: params.get('number') ?? '',
			staff: params.get('staff') ?? '',
			status: params.has('status') ? (status ?? '') : (defaults.paymentStatus ?? '')
		}
	};
}
