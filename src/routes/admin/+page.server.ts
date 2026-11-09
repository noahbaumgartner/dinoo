import { formatDatetimeLocal, parseDatetimeLocal } from '$lib/datetime';
import { INTERVALS, type Interval, type RangeInput } from '$lib/server/services/StatsService';
import type { PageServerLoad } from './$types';

/**
 * A bound in the query string: absent means «default» (undefined), empty means «unbounded» (null),
 * otherwise a local `datetime-local` value (server time, which is the event's time on site).
 */
function bound(url: URL, name: string): Date | null | undefined {
	if (!url.searchParams.has(name)) return undefined;
	return parseDatetimeLocal(url.searchParams.get(name));
}

/** Dashboard (F09): revenue over time, articles sold, revenue per staff member and table. */
export const load: PageServerLoad = ({ locals, url }) => {
	const raw = url.searchParams.get('interval');
	const interval: Interval = raw && raw in INTERVALS ? (raw as Interval) : '30m';
	// What the charts show: revenue (default) or counts.
	const metric = url.searchParams.get('metric') === 'count' ? 'count' : 'revenue';
	const category = Number.parseInt(url.searchParams.get('category') ?? '', 10);
	const categoryId = Number.isNaN(category) ? undefined : category;
	const input: RangeInput = { from: bound(url, 'from'), to: bound(url, 'to') };
	const dashboard = locals.services.stats.dashboard(interval, input, categoryId);
	return {
		interval,
		metric,
		categoryId: categoryId ?? null,
		categories: locals.services.menu.overview().map(({ id, name }) => ({ id, name })),
		dashboard,
		range: {
			from: dashboard.range.from ? formatDatetimeLocal(dashboard.range.from) : '',
			to: dashboard.range.to ? formatDatetimeLocal(dashboard.range.to) : '',
			isDefault: !url.searchParams.has('from') && !url.searchParams.has('to')
		}
	};
};
