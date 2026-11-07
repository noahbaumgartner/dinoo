import type { SettingsRepository } from '../repositories/db/SettingsRepository';
import { parseStoredTemplate, validateTemplate, type TicketTemplate } from '$lib/print/template';
import { DomainError } from './errors';

/**
 * A template from user input, or a domain error that lists every problem (the editor shows them
 * per block before sending, so this is the safety net).
 */
export function checkedTemplate(input: unknown): TicketTemplate {
	const { template, errors } = validateTemplate(input);
	if (errors.length) {
		const messages = errors.map((e) =>
			e.block === null ? e.message : `Block ${e.block + 1}: ${e.message}`
		);
		throw new DomainError(`Die Druckvorlage ist ungültig. ${messages.join(' ')}`);
	}
	return template;
}

export type EventSettings = {
	eventName: string | null;
	twintQrContent: string | null;
};

const MAX_QR_CONTENT = 2000;

export class SettingsService {
	constructor(private readonly settings: SettingsRepository) {}

	get(): EventSettings {
		return {
			eventName: this.settings.get('eventName'),
			twintQrContent: this.settings.get('twintQrContent')
		};
	}

	setEventName(name: string) {
		this.settings.set('eventName', name.trim() || null);
	}

	/** Stores the content of the club's static TWINT QR code; the code is re-generated from it. */
	setTwintQrContent(content: string | null) {
		const value = content?.trim() || null;
		if (value && value.length > MAX_QR_CONTENT) throw new DomainError('Der QR-Inhalt ist zu lang.');
		this.settings.set('twintQrContent', value);
	}

	/** The print template (F11); the default one while none is stored. */
	ticketTemplate(): { template: TicketTemplate; isDefault: boolean } {
		const stored = this.settings.get('ticketTemplate');
		return { template: parseStoredTemplate(stored), isDefault: stored === null };
	}

	setTicketTemplate(input: unknown) {
		this.settings.set('ticketTemplate', JSON.stringify(checkedTemplate(input)));
	}

	resetTicketTemplate() {
		this.settings.set('ticketTemplate', null);
	}
}
