import type { OrderRepository } from '../repositories/db/OrderRepository';
import type { PaymentRepository } from '../repositories/db/PaymentRepository';
import type { PaymentMethod, PaymentRecord, UserRecord } from '../repositories/db/types';
import { DomainError, notFound } from './errors';

/** How long service staff can undo their own last payment. */
export const UNDO_WINDOW_MS = 5 * 60 * 1000;

/**
 * Payments, including splitting: any number of partial payments until the open amount is zero.
 */
export class PaymentService {
	constructor(
		private readonly orders: OrderRepository,
		private readonly payments: PaymentRepository,
		private readonly now: () => Date = () => new Date()
	) {}

	add(orderId: number, amountCents: number, method: PaymentMethod, by: UserRecord): PaymentRecord {
		const order = this.orders.get(orderId) ?? notFound('Bestellung');
		const open = order.totalCents - this.payments.sumByOrder(orderId);
		if (open <= 0) throw new DomainError('Diese Bestellung ist bereits bezahlt.', 409);
		if (!Number.isInteger(amountCents) || amountCents <= 0)
			throw new DomainError('Bitte einen Betrag grösser als 0 eingeben.');
		if (amountCents > open) throw new DomainError('Der Betrag ist höher als der offene Betrag.');
		// Partial amounts are cash-friendly (5 Rappen); only paying the exact rest may deviate.
		if (amountCents !== open && amountCents % 5 !== 0)
			throw new DomainError('Teilbeträge müssen auf 5 Rappen aufgehen.');
		return this.payments.create({
			orderId,
			amountCents,
			method,
			paidByUserId: by.id,
			paidAt: this.now()
		});
	}

	/** Admins can remove any payment; service staff only their own, shortly after recording it. */
	remove(paymentId: number, by: UserRecord) {
		const payment = this.payments.get(paymentId) ?? notFound('Zahlung');
		if (by.role !== 'admin') {
			const own = payment.paidByUserId === by.id;
			const recent = this.now().getTime() - payment.paidAt.getTime() <= UNDO_WINDOW_MS;
			const latest = this.payments.listByOrder(payment.orderId).at(-1)?.id === payment.id;
			if (!own || !recent || !latest)
				throw new DomainError(
					'Nur die eigene letzte Zahlung kann innerhalb von 5 Minuten rückgängig gemacht werden.',
					403
				);
		}
		this.payments.delete(paymentId);
	}

	canUndo(payment: PaymentRecord, by: UserRecord, isLatest: boolean): boolean {
		if (by.role === 'admin') return true;
		return (
			isLatest &&
			payment.paidByUserId === by.id &&
			this.now().getTime() - payment.paidAt.getTime() <= UNDO_WINDOW_MS
		);
	}
}
