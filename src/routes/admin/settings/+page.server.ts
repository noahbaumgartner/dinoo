import { action, Form } from '$lib/server/forms';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => ({
	settings: locals.services.settings.get()
});

export const actions: Actions = {
	event: ({ request, locals }) =>
		action(async () => {
			const form = await Form.from(request);
			locals.services.settings.setEventName(form.string('eventName'));
			return { message: 'Anlass gespeichert' };
		}),
	twint: ({ request, locals }) =>
		action(async () => {
			const form = await Form.from(request);
			const content = form.optionalString('twintQrContent');
			locals.services.settings.setTwintQrContent(content);
			return { message: content ? 'TWINT-QR-Code gespeichert' : 'TWINT-QR-Code entfernt' };
		})
};
