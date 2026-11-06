import { eq } from 'drizzle-orm';
import type { Db } from './client';
import { settings } from './schema';

export type SettingKey = 'eventName' | 'twintQrContent';

export class SettingsRepository {
	constructor(private readonly db: Db) {}

	get(key: SettingKey): string | null {
		return this.db.select().from(settings).where(eq(settings.key, key)).get()?.value ?? null;
	}

	set(key: SettingKey, value: string | null) {
		if (value === null) {
			this.db.delete(settings).where(eq(settings.key, key)).run();
			return;
		}
		this.db
			.insert(settings)
			.values({ key, value })
			.onConflictDoUpdate({ target: settings.key, set: { value } })
			.run();
	}
}
