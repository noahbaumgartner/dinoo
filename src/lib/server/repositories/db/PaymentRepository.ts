import { asc, eq, sql } from 'drizzle-orm';
import type { Db } from './client';
import { paymentItems, payments, user } from './schema';
import type { PaymentRecord } from './types';

export type PaymentWithUser = PaymentRecord & { paidByName: string };
export type PaymentLine = { orderItemId: number; quantity: number };

export class PaymentRepository {
	constructor(private readonly db: Db) {}

	listByOrder(orderId: number): PaymentWithUser[] {
		return this.db
			.select({ payment: payments, paidByName: user.name })
			.from(payments)
			.innerJoin(user, eq(user.id, payments.paidByUserId))
			.where(eq(payments.orderId, orderId))
			.orderBy(asc(payments.paidAt))
			.all()
			.map((row) => ({ ...row.payment, paidByName: row.paidByName }));
	}

	sumByOrder(orderId: number): number {
		const row = this.db
			.select({ total: sql<number>`coalesce(sum(${payments.amountCents}), 0)` })
			.from(payments)
			.where(eq(payments.orderId, orderId))
			.get();
		return Number(row?.total ?? 0);
	}

	/** Paid quantity per order item id. */
	paidQuantities(orderId: number): Map<number, number> {
		const rows = this.db
			.select({
				orderItemId: paymentItems.orderItemId,
				quantity: sql<number>`sum(${paymentItems.quantity})`
			})
			.from(paymentItems)
			.innerJoin(payments, eq(payments.id, paymentItems.paymentId))
			.where(eq(payments.orderId, orderId))
			.groupBy(paymentItems.orderItemId)
			.all();
		return new Map(rows.map((row) => [row.orderItemId, Number(row.quantity)]));
	}

	get(id: number): PaymentRecord | undefined {
		return this.db.select().from(payments).where(eq(payments.id, id)).get();
	}

	create(payment: Omit<PaymentRecord, 'id'>, lines: PaymentLine[]): PaymentRecord {
		return this.db.transaction((tx) => {
			const created = tx.insert(payments).values(payment).returning().get();
			if (lines.length > 0)
				tx.insert(paymentItems)
					.values(lines.map((line) => ({ ...line, paymentId: created.id })))
					.run();
			return created;
		});
	}

	delete(id: number) {
		this.db.transaction((tx) => {
			tx.delete(paymentItems).where(eq(paymentItems.paymentId, id)).run();
			tx.delete(payments).where(eq(payments.id, id)).run();
		});
	}
}
