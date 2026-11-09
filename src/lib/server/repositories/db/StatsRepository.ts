import { and, desc, eq, gte, lte, sql } from 'drizzle-orm';
import type { Db } from './client';
import { articles, orderItems, orders, user } from './schema';

export type RevenueBucket = { start: Date; revenueCents: number; orders: number };
export type ArticleSales = {
	articleId: number;
	name: string;
	quantity: number;
	revenueCents: number;
};
export type StaffSales = { userId: string; name: string; orders: number; revenueCents: number };
export type TableSales = {
	tableId: number;
	label: string;
	areaName: string;
	orders: number;
	revenueCents: number;
};
/** Orders created within the range; a missing bound is open. Both bounds are inclusive. */
export type TimeRange = { from: Date | null; to: Date | null };
export type Totals = { orders: number; revenueCents: number; items: number };

/** Read-only aggregations for the dashboard. All values come from order snapshots. */
export class StatsRepository {
	constructor(private readonly db: Db) {}

	totals(range: TimeRange): Totals {
		const order = this.db
			.select({
				orders: sql<number>`count(*)`,
				revenue: sql<number>`coalesce(sum(${orders.totalCents}), 0)`
			})
			.from(orders)
			.where(inRange(range))
			.get();
		const items = this.db
			.select({ items: sql<number>`coalesce(sum(${orderItems.quantity}), 0)` })
			.from(orderItems)
			.innerJoin(orders, eq(orders.id, orderItems.orderId))
			.where(inRange(range))
			.get();
		return {
			orders: Number(order?.orders ?? 0),
			revenueCents: Number(order?.revenue ?? 0),
			items: Number(items?.items ?? 0)
		};
	}

	revenueTimeline(intervalMs: number, range: TimeRange): RevenueBucket[] {
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
			.where(inRange(range))
			.groupBy(bucket)
			.orderBy(bucket)
			.all()
			.map((row) => ({
				start: new Date(Number(row.start)),
				revenueCents: Number(row.revenue),
				orders: Number(row.count)
			}));
	}

	articleSales(range: TimeRange, categoryId?: number): ArticleSales[] {
		return this.db
			.select({
				articleId: orderItems.articleId,
				name: orderItems.articleName,
				quantity: sql<number>`sum(${orderItems.quantity})`,
				revenue: sql<number>`sum(${orderItems.quantity} * ${orderItems.priceCents})`
			})
			.from(orderItems)
			.innerJoin(articles, eq(articles.id, orderItems.articleId))
			.innerJoin(orders, eq(orders.id, orderItems.orderId))
			.where(
				and(
					inRange(range),
					categoryId !== undefined ? eq(articles.categoryId, categoryId) : undefined
				)
			)
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

	/** Orders taken and revenue brought in per staff member, highest revenue first. */
	staffSales(range: TimeRange): StaffSales[] {
		return this.db
			.select({
				userId: orders.createdByUserId,
				name: user.name,
				orders: sql<number>`count(*)`,
				revenue: sql<number>`sum(${orders.totalCents})`
			})
			.from(orders)
			.innerJoin(user, eq(user.id, orders.createdByUserId))
			.where(inRange(range))
			.groupBy(orders.createdByUserId)
			.orderBy(desc(sql`sum(${orders.totalCents})`))
			.all()
			.map((row) => ({
				userId: row.userId,
				name: row.name,
				orders: Number(row.orders),
				revenueCents: Number(row.revenue)
			}));
	}

	/** Orders and revenue per table, highest revenue first. Label and area are order snapshots. */
	tableSales(range: TimeRange): TableSales[] {
		return this.db
			.select({
				tableId: orders.tableId,
				label: sql<string>`max(${orders.tableLabel})`,
				areaName: sql<string>`max(${orders.areaName})`,
				orders: sql<number>`count(*)`,
				revenue: sql<number>`sum(${orders.totalCents})`
			})
			.from(orders)
			.where(inRange(range))
			.groupBy(orders.tableId)
			.orderBy(desc(sql`sum(${orders.totalCents})`))
			.all()
			.map((row) => ({
				tableId: row.tableId,
				label: row.label,
				areaName: row.areaName,
				orders: Number(row.orders),
				revenueCents: Number(row.revenue)
			}));
	}
}

function inRange({ from, to }: TimeRange) {
	return and(
		from ? gte(orders.createdAt, from) : undefined,
		to ? lte(orders.createdAt, to) : undefined
	);
}
