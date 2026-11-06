import { error } from '@sveltejs/kit';
import type { UserRecord } from './repositories/db/types';
import type { Services } from './runtime';
import { DomainError } from './services/errors';

/** Data for the order detail and payment screen, shared by service and admin routes. */
export function loadOrderView(services: Services, orderId: number, user: UserRecord) {
	let detail;
	try {
		detail = services.orders.detail(orderId);
	} catch (err) {
		if (err instanceof DomainError) error(err.status, { message: err.message });
		throw err;
	}
	if (user.role !== 'admin' && detail.order.createdByUserId !== user.id)
		error(403, { message: 'Diese Bestellung wurde von jemand anderem aufgenommen.' });

	const latestId = detail.payments.at(-1)?.id;
	const unreachable = new Set(
		services.printQueue
			.printerStatuses()
			.filter((printer) => printer.reachable === false)
			.map((printer) => printer.id)
	);
	return {
		order: detail.order,
		items: detail.items,
		paidCents: detail.paidCents,
		openCents: detail.openCents,
		createdByName: detail.createdByName,
		payments: detail.payments.map((payment) => ({
			...payment,
			canUndo: services.payments.canUndo(payment, user, payment.id === latestId)
		})),
		printJobs: detail.printJobs.map((job) => ({
			id: job.id,
			printerName: job.printerName,
			printerUnreachable: unreachable.has(job.printerId),
			status: job.status,
			attempts: job.attempts,
			lastError: job.lastError,
			printedAt: job.printedAt,
			createdAt: job.createdAt
		})),
		twintQrContent: services.settings.get().twintQrContent
	};
}
