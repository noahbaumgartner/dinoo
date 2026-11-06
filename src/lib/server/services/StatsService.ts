import type {
	ArticleSales,
	RevenueBucket,
	StatsRepository,
	Totals
} from '../repositories/db/StatsRepository';

export const INTERVALS = { '15m': 15, '30m': 30, '1h': 60 } as const;
export type Interval = keyof typeof INTERVALS;

export type Dashboard = {
	totals: Totals;
	timeline: RevenueBucket[];
	articles: ArticleSales[];
};

/** Dashboard figures (F09): revenue over time, articles sold, sum of articles sold. */
export class StatsService {
	constructor(private readonly stats: StatsRepository) {}

	dashboard(interval: Interval, categoryId?: number): Dashboard {
		const intervalMs = INTERVALS[interval] * 60 * 1000;
		return {
			totals: this.stats.totals(),
			timeline: fillGaps(this.stats.revenueTimeline(intervalMs), intervalMs),
			articles: this.stats.articleSales(categoryId)
		};
	}
}

/** Adds empty buckets between orders so the line chart shows quiet periods as zero. */
function fillGaps(buckets: RevenueBucket[], intervalMs: number): RevenueBucket[] {
	if (buckets.length < 2) return buckets;
	const byStart = new Map(buckets.map((bucket) => [bucket.start.getTime(), bucket]));
	const filled: RevenueBucket[] = [];
	const last = buckets.at(-1)!.start.getTime();
	for (let start = buckets[0].start.getTime(); start <= last; start += intervalMs) {
		filled.push(byStart.get(start) ?? { start: new Date(start), revenueCents: 0, orders: 0 });
	}
	return filled;
}
