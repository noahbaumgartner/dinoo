import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	dialect: 'sqlite',
	schema: './src/lib/server/repositories/db/schema.ts',
	out: './drizzle'
});
