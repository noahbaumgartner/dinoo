import { action, Form } from '$lib/server/forms';
import type { PrintJobStatus } from '$lib/server/repositories/db/types';
import type { Actions, PageServerLoad } from './$types';

const STATUSES = ['pending', 'queued', 'printing', 'printed', 'cancelled'] as const;
type StatusFilter = (typeof STATUSES)[number] | 'all';

/** The persistent print queue, visible and controllable (F03/F05). */
export const load: PageServerLoad = ({ locals, url }) => {
	const raw = url.searchParams.get('status') ?? 'pending';
	const status: StatusFilter = (STATUSES as readonly string[]).includes(raw)
		? (raw as StatusFilter)
		: 'all';
	const printer = Number.parseInt(url.searchParams.get('printer') ?? '', 10);
	const printerId = Number.isNaN(printer) ? undefined : printer;
	const { printQueue } = locals.services;
	return {
		status,
		printerId: printerId ?? null,
		printers: printQueue.printerStatuses(),
		jobs: printQueue.list({
			status: status === 'all' ? undefined : (status as PrintJobStatus | 'pending'),
			printerId,
			limit: 200
		})
	};
};

export const actions: Actions = {
	cancel: ({ request, locals }) =>
		action(async () => {
			const form = await Form.from(request);
			locals.services.printQueue.cancel(form.int('jobId'));
			return { message: 'Druckauftrag abgebrochen' };
		}),
	reroute: ({ request, locals }) =>
		action(async () => {
			const form = await Form.from(request);
			locals.services.printQueue.reroute(form.int('jobId'), form.int('printerId'));
			return { message: 'Druckauftrag umgeleitet' };
		}),
	rerouteAll: ({ request, locals }) =>
		action(async () => {
			const form = await Form.from(request);
			const count = locals.services.printQueue.rerouteAll(form.int('from'), form.int('to'));
			return { message: `${count} Druckaufträge umgeleitet` };
		}),
	reprint: ({ request, locals }) =>
		action(async () => {
			const form = await Form.from(request);
			locals.services.printQueue.reprint(form.int('jobId'));
			return { message: 'Kopie in die Warteschlange gestellt' };
		}),
	test: ({ request, locals }) =>
		action(async () => {
			const form = await Form.from(request);
			locals.services.printQueue.enqueueTest(form.int('printerId'));
			return { message: 'Testdruck in die Warteschlange gestellt' };
		})
};
