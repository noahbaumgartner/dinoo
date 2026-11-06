import { asc, eq, sql } from 'drizzle-orm';
import type { Db } from './client';
import { payments, user } from './schema';
import type { PaymentRecord } from './types';

export type PaymentWithUser = PaymentRecord & { paidByName: string };

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

	get(id: number): PaymentRecord | undefined {
		return this.db.select().from(payments).where(eq(payments.id, id)).get();
	}

	create(payment: Omit<PaymentRecord, 'id'>): PaymentRecord {
		return this.db.insert(payments).values(payment).returning().get();
	}

	delete(id: number) {
		this.db.delete(payments).where(eq(payments.id, id)).run();
	}
}
