import type { OrderRepository } from '../repositories/db/OrderRepository';
import type { PaymentLine, PaymentRepository } from '../repositories/db/PaymentRepository';
import type { PaymentMethod, PaymentRecord, UserRecord } from '../repositories/db/types';
import { DomainError, notFound } from './errors';

/** How long service staff can undo their own last payment. */
export const UNDO_WINDOW_MS = 5 * 60 * 1000;

/**
 * Payments, including splitting: a partial payment covers selected positions (a quantity of each),
 * any number of them until the open amount is zero. Without a selection the whole rest is paid.
 */
export class PaymentService {
	constructor(
		private readonly orders: OrderRepository,
		private readonly payments: PaymentRepository,
		private readonly now: () => Date = () => new Date()
	) {}

	add(
		orderId: number,
		method: PaymentMethod,
		by: UserRecord,
		selection: PaymentLine[] = []
	): PaymentRecord {
		const order = this.orders.get(orderId) ?? notFound('Bestellung');
		const open = order.totalCents - this.payments.sumByOrder(orderId);
		if (open <= 0) throw new DomainError('Diese Bestellung ist bereits bezahlt.', 409);

		const paid = this.payments.paidQuantities(orderId);
		const remaining = new Map(
			this.orders
				.items(orderId)
				.map((item) => [item.id, { item, left: item.quantity - (paid.get(item.id) ?? 0) }])
		);

		let lines: PaymentLine[];
		let amountCents: number;
		if (selection.length === 0) {
			lines = [...remaining.values()]
				.filter(({ left }) => left > 0)
				.map(({ item, left }) => ({ orderItemId: item.id, quantity: left }));
			amountCents = open;
		} else {
			const merged = new Map<number, number>();
			for (const { orderItemId, quantity } of selection) {
				if (!Number.isInteger(quantity) || quantity <= 0)
					throw new DomainError('Ungültige Menge für die Teilzahlung.');
				merged.set(orderItemId, (merged.get(orderItemId) ?? 0) + quantity);
			}
			lines = [...merged].map(([orderItemId, quantity]) => ({ orderItemId, quantity }));
			amountCents = 0;
			for (const line of lines) {
				const entry = remaining.get(line.orderItemId);
				if (!entry) throw new DomainError('Diese Position gehört nicht zur Bestellung.');
				if (line.quantity > entry.left)
					throw new DomainError(`${entry.item.articleName} ist bereits bezahlt.`, 409);
				amountCents += line.quantity * entry.item.priceCents;
			}
			if (amountCents > open) throw new DomainError('Der Betrag ist höher als der offene Betrag.');
		}

		return this.payments.create(
			{ orderId, amountCents, method, paidByUserId: by.id, paidAt: this.now() },
			lines
		);
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
