import type { SettingsRepository } from '../repositories/db/SettingsRepository';
import { DomainError } from './errors';

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
}
