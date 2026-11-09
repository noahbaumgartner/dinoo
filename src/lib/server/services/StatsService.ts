import type {
	ArticleSales,
	RevenueBucket,
	StatsRepository,
	TimeRange,
	Totals
} from '../repositories/db/StatsRepository';

export const INTERVALS = { '15m': 15, '30m': 30, '1h': 60 } as const;
export type Interval = keyof typeof INTERVALS;

/** The dashboard shows this much of the recent past unless a range is chosen. */
export const DEFAULT_WINDOW_MS = 6 * 60 * 60 * 1000;

/** Guards the line chart against absurd ranges (e.g. a start years ago with 15 min buckets). */
const MAX_BUCKETS = 500;

/**
 * Requested range: `undefined` means «default» (from: the last 6 hours, to: now), `null` means
 * explicitly unbounded.
 */
export type RangeInput = { from?: Date | null; to?: Date | null };

export type Dashboard = {
	/** The range that was applied; `from: null` is unbounded, `to: null` runs up to now. */
	range: TimeRange;
	totals: Totals;
	timeline: RevenueBucket[];
	articles: ArticleSales[];
};

/** Dashboard figures (F09): revenue over time, articles sold, sum of articles sold. */
export class StatsService {
	constructor(
		private readonly stats: StatsRepository,
		private readonly now: () => Date = () => new Date()
	) {}

	/** Fills in the default for a missing bound (last 6 hours up to now). */
	resolveRange(input: RangeInput = {}): TimeRange {
		return {
			from:
				input.from === undefined ? new Date(this.now().getTime() - DEFAULT_WINDOW_MS) : input.from,
			to: input.to ?? null
		};
	}

	dashboard(interval: Interval, input: RangeInput = {}, categoryId?: number): Dashboard {
		const intervalMs = INTERVALS[interval] * 60 * 1000;
		const range = this.resolveRange(input);
		return {
			range,
			totals: this.stats.totals(range),
			timeline: fillGaps(
				this.stats.revenueTimeline(intervalMs, range),
				intervalMs,
				range,
				this.now()
			),
			articles: this.stats.articleSales(range, categoryId)
		};
	}
}

/**
 * Adds empty buckets so the line chart shows quiet periods as zero. A chosen start (also the
 * default) is shown from there on; without one the chart starts with the first order. It runs up
 * to the end of the range, but never past now.
 */
function fillGaps(
	buckets: RevenueBucket[],
	intervalMs: number,
	range: TimeRange,
	now: Date
): RevenueBucket[] {
	const floor = (time: number) => Math.floor(time / intervalMs) * intervalMs;
	const first = range.from ? floor(range.from.getTime()) : buckets[0]?.start.getTime();
	if (first === undefined) return [];
	const lastOrder = buckets.at(-1)?.start.getTime() ?? first;
	const end = Math.max(lastOrder, floor(Math.min((range.to ?? now).getTime(), now.getTime())));
	const start = Math.max(first, end - (MAX_BUCKETS - 1) * intervalMs);
	const byStart = new Map(buckets.map((bucket) => [bucket.start.getTime(), bucket]));
	const filled: RevenueBucket[] = [];
	for (let time = start; time <= end; time += intervalMs) {
		filled.push(byStart.get(time) ?? { start: new Date(time), revenueCents: 0, orders: 0 });
	}
	return filled;
}
