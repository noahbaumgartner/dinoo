import { action, Form, requireUser } from './forms';
import { DomainError } from './services/errors';

type Event = { request: Request; locals: App.Locals; params: { id: string } };

/** Payment actions of the order screen, shared by service and admin routes. */
export const orderActions = {
	pay: ({ request, locals, params }: Event) =>
		action(async () => {
			const user = requireUser(locals);
			const form = await Form.from(request);
			const orderId = Number(params.id);
			const order = locals.services.orders.detail(orderId).order;
			if (user.role !== 'admin' && order.createdByUserId !== user.id)
				throw new DomainError('Diese Bestellung wurde von jemand anderem aufgenommen.', 403);
			let selection: { orderItemId: number; quantity: number }[];
			try {
				selection = JSON.parse(form.string('items') || '[]');
				if (!Array.isArray(selection)) throw new Error();
			} catch {
				throw new DomainError('Die Auswahl konnte nicht gelesen werden.');
			}
			locals.services.payments.add(
				orderId,
				form.oneOf('method', ['cash', 'twint'] as const),
				user,
				selection.map((line) => ({
					orderItemId: Number(line.orderItemId),
					quantity: Number(line.quantity)
				}))
			);
			return { paid: true };
		}),
	undo: ({ request, locals }: Event) =>
		action(async () => {
			const user = requireUser(locals);
			const form = await Form.from(request);
			locals.services.payments.remove(form.int('paymentId'), user);
			return { undone: true };
		})
};
