import { sql } from 'drizzle-orm';
import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

const timestamps = {
	createdAt: integer('created_at', { mode: 'timestamp_ms' })
		.notNull()
		.default(sql`(unixepoch() * 1000)`),
	updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
		.notNull()
		.default(sql`(unixepoch() * 1000)`)
		.$onUpdate(() => new Date())
};

// --- Better Auth tables -------------------------------------------------------------------------
// Shape required by Better Auth's Drizzle adapter (core tables + username plugin + our fields).

export const user = sqliteTable('user', {
	id: text('id').primaryKey(),
	/** Display name, shown on tickets and in lists. */
	name: text('name').notNull(),
	/** Synthetic, never used for mail: `<username>@dinoo.local`. Better Auth requires one. */
	email: text('email').notNull().unique(),
	emailVerified: integer('email_verified', { mode: 'boolean' }).notNull().default(false),
	image: text('image'),
	username: text('username').unique(),
	displayUsername: text('display_username'),
	role: text('role', { enum: ['service', 'admin'] })
		.notNull()
		.default('service'),
	active: integer('active', { mode: 'boolean' }).notNull().default(true),
	...timestamps
});

export const session = sqliteTable(
	'session',
	{
		id: text('id').primaryKey(),
		expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
		token: text('token').notNull().unique(),
		ipAddress: text('ip_address'),
		userAgent: text('user_agent'),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		...timestamps
	},
	(t) => [index('session_user_idx').on(t.userId)]
);

export const account = sqliteTable(
	'account',
	{
		id: text('id').primaryKey(),
		accountId: text('account_id').notNull(),
		providerId: text('provider_id').notNull(),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		accessToken: text('access_token'),
		refreshToken: text('refresh_token'),
		idToken: text('id_token'),
		accessTokenExpiresAt: integer('access_token_expires_at', { mode: 'timestamp_ms' }),
		refreshTokenExpiresAt: integer('refresh_token_expires_at', { mode: 'timestamp_ms' }),
		scope: text('scope'),
		password: text('password'),
		...timestamps
	},
	(t) => [index('account_user_idx').on(t.userId)]
);

export const verification = sqliteTable('verification', {
	id: text('id').primaryKey(),
	identifier: text('identifier').notNull(),
	value: text('value').notNull(),
	expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
	...timestamps
});

// --- Domain tables --------------------------------------------------------------------------------

export const printers = sqliteTable('printers', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull(),
	host: text('host').notNull(),
	port: integer('port').notNull().default(9100),
	model: text('model', { enum: ['TM-T20IV', 'TM-T20III'] })
		.notNull()
		.default('TM-T20IV'),
	active: integer('active', { mode: 'boolean' }).notNull().default(true),
	lastSuccessAt: integer('last_success_at', { mode: 'timestamp_ms' }),
	lastErrorAt: integer('last_error_at', { mode: 'timestamp_ms' }),
	lastError: text('last_error'),
	...timestamps
});

export const categories = sqliteTable('categories', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull(),
	sortOrder: integer('sort_order').notNull().default(0),
	defaultPrinterId: integer('default_printer_id').references(() => printers.id, {
		onDelete: 'set null'
	}),
	...timestamps
});

export const articles = sqliteTable(
	'articles',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		name: text('name').notNull(),
		priceCents: integer('price_cents').notNull(),
		categoryId: integer('category_id')
			.notNull()
			.references(() => categories.id),
		/** Overrides the category default; null = printed like the category. */
		printerId: integer('printer_id').references(() => printers.id, { onDelete: 'set null' }),
		sortOrder: integer('sort_order').notNull().default(0),
		active: integer('active', { mode: 'boolean' }).notNull().default(true),
		...timestamps
	},
	(t) => [index('articles_category_idx').on(t.categoryId)]
);

export const tables = sqliteTable(
	'tables',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		label: text('label').notNull(),
		/** Position in the seating plan; both null for free tables such as «Bar». */
		gridRow: integer('grid_row'),
		gridColumn: integer('grid_column'),
		sortOrder: integer('sort_order').notNull().default(0),
		active: integer('active', { mode: 'boolean' }).notNull().default(true),
		...timestamps
	},
	(t) => [uniqueIndex('tables_grid_cell_idx').on(t.gridRow, t.gridColumn)]
);

export const orders = sqliteTable(
	'orders',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		orderNumber: integer('order_number').notNull().unique(),
		/** Client-generated id that makes submitting idempotent (double taps, retries). */
		clientRequestId: text('client_request_id').notNull().unique(),
		tableId: integer('table_id')
			.notNull()
			.references(() => tables.id),
		tableLabel: text('table_label').notNull(),
		note: text('note'),
		totalCents: integer('total_cents').notNull(),
		createdByUserId: text('created_by_user_id')
			.notNull()
			.references(() => user.id),
		createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull()
	},
	(t) => [
		index('orders_table_idx').on(t.tableId),
		index('orders_user_idx').on(t.createdByUserId),
		index('orders_created_idx').on(t.createdAt)
	]
);

export const orderItems = sqliteTable(
	'order_items',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		orderId: integer('order_id')
			.notNull()
			.references(() => orders.id, { onDelete: 'cascade' }),
		articleId: integer('article_id')
			.notNull()
			.references(() => articles.id),
		articleName: text('article_name').notNull(),
		priceCents: integer('price_cents').notNull(),
		quantity: integer('quantity').notNull(),
		printerId: integer('printer_id').references(() => printers.id, { onDelete: 'set null' })
	},
	(t) => [index('order_items_order_idx').on(t.orderId)]
);

export const payments = sqliteTable(
	'payments',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		orderId: integer('order_id')
			.notNull()
			.references(() => orders.id, { onDelete: 'cascade' }),
		amountCents: integer('amount_cents').notNull(),
		method: text('method', { enum: ['cash', 'twint'] }).notNull(),
		paidByUserId: text('paid_by_user_id')
			.notNull()
			.references(() => user.id),
		paidAt: integer('paid_at', { mode: 'timestamp_ms' }).notNull()
	},
	(t) => [index('payments_order_idx').on(t.orderId)]
);

export const printJobs = sqliteTable(
	'print_jobs',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		kind: text('kind', { enum: ['order', 'test'] }).notNull(),
		orderId: integer('order_id').references(() => orders.id, { onDelete: 'cascade' }),
		printerId: integer('printer_id')
			.notNull()
			.references(() => printers.id),
		/** JSON-encoded `Ticket`, rendered when the job is queued. */
		payload: text('payload').notNull(),
		status: text('status', { enum: ['queued', 'printing', 'printed', 'cancelled'] })
			.notNull()
			.default('queued'),
		attempts: integer('attempts').notNull().default(0),
		lastError: text('last_error'),
		lastAttemptAt: integer('last_attempt_at', { mode: 'timestamp_ms' }),
		createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
		printedAt: integer('printed_at', { mode: 'timestamp_ms' })
	},
	(t) => [
		index('print_jobs_queue_idx').on(t.printerId, t.status, t.createdAt),
		index('print_jobs_order_idx').on(t.orderId)
	]
);

export const settings = sqliteTable('settings', {
	key: text('key').primaryKey(),
	value: text('value').notNull()
});

export const schema = {
	user,
	session,
	account,
	verification,
	printers,
	categories,
	articles,
	tables,
	orders,
	orderItems,
	payments,
	printJobs,
	settings
};
