import { and, asc, desc, eq, gte, lte, sql, type SQL } from 'drizzle-orm';
import type { Db } from './client';
import { orderItems, orders, payments, printJobs, user } from './schema';
import type { OrderItemRecord, OrderRecord } from './types';

export type NewOrder = Omit<OrderRecord, 'id' | 'orderNumber'>;
export type NewOrderItem = Omit<OrderItemRecord, 'id' | 'orderId'>;

/** `unpaid` = open or partially paid. */
export type PaymentStatus = 'open' | 'partial' | 'paid' | 'unpaid';

export type OrderFilter = {
	tableId?: number;
	createdByUserId?: string;
	orderNumber?: number;
	paymentStatus?: PaymentStatus;
	from?: Date;
	to?: Date;
	limit?: number;
};

export type OrderSummary = OrderRecord & {
	paidCents: number;
	pendingPrintJobs: number;
	createdByName: string;
};

const paidCents = sql<number>`coalesce((select sum(${payments.amountCents}) from ${payments} where ${payments.orderId} = ${orders.id}), 0)`;
const pendingPrintJobs = sql<number>`(select count(*) from ${printJobs} where ${printJobs.orderId} = ${orders.id} and ${printJobs.status} in ('queued', 'printing'))`;

export class OrderRepository {
	constructor(private readonly db: Db) {}

	/**
	 * Inserts the order with its items and returns it. The order number is assigned inside the
	 * same (synchronous) transaction, so it is unique without gaps from concurrent requests.
	 */
	create(order: NewOrder, items: NewOrderItem[], afterInsert?: (order: OrderRecord) => void) {
		return this.db.transaction((tx) => {
			const next = tx
				.select({ value: sql<number>`coalesce(max(${orders.orderNumber}), 0) + 1` })
				.from(orders)
				.get();
			const created = tx
				.insert(orders)
				.values({ ...order, orderNumber: next?.value ?? 1 })
				.returning()
				.get();
			tx.insert(orderItems)
				.values(items.map((item) => ({ ...item, orderId: created.id })))
				.run();
			afterInsert?.(created);
			return created;
		});
	}

	get(id: number): OrderRecord | undefined {
		return this.db.select().from(orders).where(eq(orders.id, id)).get();
	}

	findByClientRequestId(clientRequestId: string): OrderRecord | undefined {
		return this.db.select().from(orders).where(eq(orders.clientRequestId, clientRequestId)).get();
	}

	items(orderId: number): OrderItemRecord[] {
		return this.db
			.select()
			.from(orderItems)
			.where(eq(orderItems.orderId, orderId))
			.orderBy(asc(orderItems.id))
			.all();
	}

	search(filter: OrderFilter): OrderSummary[] {
		const conditions: SQL[] = [];
		if (filter.tableId !== undefined) conditions.push(eq(orders.tableId, filter.tableId));
		if (filter.createdByUserId) conditions.push(eq(orders.createdByUserId, filter.createdByUserId));
		if (filter.orderNumber !== undefined)
			conditions.push(eq(orders.orderNumber, filter.orderNumber));
		if (filter.from) conditions.push(gte(orders.createdAt, filter.from));
		if (filter.to) conditions.push(lte(orders.createdAt, filter.to));
		if (filter.paymentStatus === 'open') conditions.push(sql`${paidCents} = 0`);
		if (filter.paymentStatus === 'partial')
			conditions.push(sql`${paidCents} > 0 and ${paidCents} < ${orders.totalCents}`);
		if (filter.paymentStatus === 'paid') conditions.push(sql`${paidCents} >= ${orders.totalCents}`);
		if (filter.paymentStatus === 'unpaid')
			conditions.push(sql`${paidCents} < ${orders.totalCents}`);

		const rows = this.db
			.select({
				order: orders,
				paidCents,
				pendingPrintJobs,
				createdByName: user.name
			})
			.from(orders)
			.innerJoin(user, eq(user.id, orders.createdByUserId))
			.where(conditions.length > 0 ? and(...conditions) : undefined)
			.orderBy(desc(orders.createdAt))
			.limit(filter.limit ?? 100)
			.all();

		return rows.map((row) => ({
			...row.order,
			paidCents: Number(row.paidCents),
			pendingPrintJobs: Number(row.pendingPrintJobs),
			createdByName: row.createdByName
		}));
	}
}
