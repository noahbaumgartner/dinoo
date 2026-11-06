import { and, desc, eq, sql } from 'drizzle-orm';
import type { Db } from './client';
import { articles, orderItems, orders } from './schema';

export type RevenueBucket = { start: Date; revenueCents: number; orders: number };
export type ArticleSales = {
	articleId: number;
	name: string;
	quantity: number;
	revenueCents: number;
};
export type Totals = { orders: number; revenueCents: number; items: number };

/** Read-only aggregations for the dashboard. All values come from order snapshots. */
export class StatsRepository {
	constructor(private readonly db: Db) {}

	totals(): Totals {
		const order = this.db
			.select({
				orders: sql<number>`count(*)`,
				revenue: sql<number>`coalesce(sum(${orders.totalCents}), 0)`
			})
			.from(orders)
			.get();
		const items = this.db
			.select({ items: sql<number>`coalesce(sum(${orderItems.quantity}), 0)` })
			.from(orderItems)
			.get();
		return {
			orders: Number(order?.orders ?? 0),
			revenueCents: Number(order?.revenue ?? 0),
			items: Number(items?.items ?? 0)
		};
	}

	revenueTimeline(intervalMs: number): RevenueBucket[] {
		// Inlined integer, so SQLite does integer division instead of binding a REAL parameter.
		const interval = sql.raw(String(Math.trunc(intervalMs)));
		const bucket = sql<number>`(${orders.createdAt} / ${interval}) * ${interval}`;
		return this.db
			.select({
				start: bucket,
				revenue: sql<number>`sum(${orders.totalCents})`,
				count: sql<number>`count(*)`
			})
			.from(orders)
			.groupBy(bucket)
			.orderBy(bucket)
			.all()
			.map((row) => ({
				start: new Date(Number(row.start)),
				revenueCents: Number(row.revenue),
				orders: Number(row.count)
			}));
	}

	articleSales(categoryId?: number): ArticleSales[] {
		return this.db
			.select({
				articleId: orderItems.articleId,
				name: orderItems.articleName,
				quantity: sql<number>`sum(${orderItems.quantity})`,
				revenue: sql<number>`sum(${orderItems.quantity} * ${orderItems.priceCents})`
			})
			.from(orderItems)
			.innerJoin(articles, eq(articles.id, orderItems.articleId))
			.where(categoryId !== undefined ? and(eq(articles.categoryId, categoryId)) : undefined)
			.groupBy(orderItems.articleId)
			.orderBy(desc(sql`sum(${orderItems.quantity})`))
			.all()
			.map((row) => ({
				articleId: row.articleId,
				name: row.name,
				quantity: Number(row.quantity),
				revenueCents: Number(row.revenue)
			}));
	}
}
