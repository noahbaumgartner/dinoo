import { action, Form, requireUser } from '$lib/server/forms';
import { DomainError } from '$lib/server/services/errors';
import type { Actions, PageServerLoad } from './$types';

function templateFrom(form: Form): unknown {
	try {
		return JSON.parse(form.string('template'));
	} catch {
		throw new DomainError('Die Druckvorlage ist ungültig.');
	}
}

export const load: PageServerLoad = ({ locals }) => {
	const { settings, printQueue } = locals.services;
	return {
		...settings.ticketTemplate(),
		eventName: settings.get().eventName,
		serviceName: requireUser(locals).name,
		printers: printQueue
			.printerStatuses()
			.filter((printer) => printer.active)
			.map((printer) => ({ id: printer.id, name: printer.name }))
	};
};

export const actions: Actions = {
	save: ({ request, locals }) =>
		action(async () => {
			const form = await Form.from(request);
			locals.services.settings.setTicketTemplate(templateFrom(form));
			return { message: 'Druckvorlage gespeichert' };
		}),
	reset: ({ locals }) =>
		action(() => {
			locals.services.settings.resetTicketTemplate();
			return { message: 'Standardvorlage wiederhergestellt' };
		}),
	test: ({ request, locals }) =>
		action(async () => {
			const form = await Form.from(request);
			locals.services.printQueue.enqueueTemplateTest(
				form.int('printerId'),
				templateFrom(form),
				requireUser(locals).name
			);
			return { message: 'Testdruck in die Warteschlange gestellt' };
		})
};
