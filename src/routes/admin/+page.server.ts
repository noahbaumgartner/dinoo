import { INTERVALS, type Interval } from '$lib/server/services/StatsService';
import type { PageServerLoad } from './$types';

/** Dashboard (F09): revenue over time, articles sold, sum of articles sold. */
export const load: PageServerLoad = ({ locals, url }) => {
	const raw = url.searchParams.get('interval');
	const interval: Interval = raw && raw in INTERVALS ? (raw as Interval) : '30m';
	const category = Number.parseInt(url.searchParams.get('category') ?? '', 10);
	const categoryId = Number.isNaN(category) ? undefined : category;
	return {
		interval,
		categoryId: categoryId ?? null,
		categories: locals.services.menu.overview().map(({ id, name }) => ({ id, name })),
		dashboard: locals.services.stats.dashboard(interval, categoryId)
	};
};
