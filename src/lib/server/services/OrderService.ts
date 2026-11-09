import { normalizeValues, optionLabels, surchargeCents, valuesKey } from '../../article-options';
import type { MenuRepository } from '../repositories/db/MenuRepository';
import type {
	NewOrderItem,
	OrderFilter,
	OrderRepository,
	OrderSummary
} from '../repositories/db/OrderRepository';
import type { PaymentRepository, PaymentWithUser } from '../repositories/db/PaymentRepository';
import type { TableRepository } from '../repositories/db/TableRepository';
import type {
	ArticleRecord,
	CategoryRecord,
	OrderItemRecord,
	OrderRecord,
	TableRecord,
	UserRecord
} from '../repositories/db/types';
import type { UserRepository } from '../repositories/db/UserRepository';
import { DomainError, notFound } from './errors';
import { effectivePrinterId } from './menu-rules';
import type { PrintJobView, PrintQueueService } from './PrintQueueService';

export type PlaceOrderInput = {
	clientRequestId: string;
	tableId: number;
	/**
	 * `options` are the picked values per option id (`OptionValues`), checked against the article.
	 * `note` is free text for the kitchen for this item, e.g. «ohne Zwiebeln».
	 */
	items: { articleId: number; quantity: number; options?: unknown; note?: string | null }[];
};

export type OrderingData = {
	tables: TableRecord[];
	categories: (CategoryRecord & { articles: ArticleRecord[] })[];
};

export type OrderDetail = {
	order: OrderRecord;
	items: (OrderItemRecord & { paidQuantity: number })[];
	payments: PaymentWithUser[];
	printJobs: PrintJobView[];
	paidCents: number;
	openCents: number;
	createdByName: string;
};

const MAX_QUANTITY = 99;
const MAX_NOTE_LENGTH = 200;

export class OrderService {
	constructor(
		private readonly orders: OrderRepository,
		private readonly menu: MenuRepository,
		private readonly tables: TableRepository,
		private readonly payments: PaymentRepository,
		private readonly users: UserRepository,
		private readonly printQueue: PrintQueueService,
		private readonly now: () => Date = () => new Date()
	) {}

	/** Active tables and the orderable menu (active articles in categories that have any). */
	orderingData(): OrderingData {
		const articles = this.menu.listArticles().filter((article) => article.active);
		return {
			tables: this.tables.list().filter((table) => table.active),
			categories: this.menu
				.listCategories()
				.map((category) => ({
					...category,
					articles: articles.filter((article) => article.categoryId === category.id)
				}))
				.filter((category) => category.articles.length > 0)
		};
	}

	/**
	 * Saves the order with price/name/printer snapshots and queues its tickets. Submitting the same
	 * `clientRequestId` again returns the existing order instead of creating a second one.
	 */
	place(input: PlaceOrderInput, by: UserRecord): OrderRecord {
		const existing = this.orders.findByClientRequestId(input.clientRequestId);
		if (existing) return existing;

		const table = this.tables.get(input.tableId);
		if (!table || !table.active) throw new DomainError('Bitte einen gültigen Tisch wählen.');

		const requested = input.items.filter(
			(item) => Number.isInteger(item.quantity) && item.quantity > 0
		);
		if (requested.length === 0) throw new DomainError('Die Bestellung enthält keine Artikel.');
		const articles = new Map(
			this.menu
				.getArticles([...new Set(requested.map((item) => item.articleId))])
				.map((a) => [a.id, a])
		);
		const categories = new Map(this.menu.listCategories().map((c) => [c.id, c]));

		// Same article with the same options and note is one item; anything else makes its own item.
		const items = new Map<string, NewOrderItem>();
		for (const item of requested) {
			const article = articles.get(item.articleId);
			if (!article || !article.active)
				throw new DomainError(
					'Ein Artikel ist nicht mehr verfügbar. Bitte Bestellung prüfen.',
					409
				);
			const values = normalizeValues(article.options, item.options);
			if (!values)
				throw new DomainError('Ein Artikel wurde geändert. Bitte Bestellung prüfen.', 409);
			const note = item.note?.trim() || null;
			if (note && note.length > MAX_NOTE_LENGTH)
				throw new DomainError(`Notizen sind höchstens ${MAX_NOTE_LENGTH} Zeichen lang.`);
			const key = `${article.id}:${valuesKey(article.options, values)}:${note ?? ''}`;
			const same = items.get(key);
			if (same) same.quantity += item.quantity;
			else
				items.set(key, {
					articleId: article.id,
					articleName: article.name,
					priceCents: article.priceCents + surchargeCents(article.options, values),
					quantity: item.quantity,
					options: optionLabels(article.options, values),
					note,
					printerId: effectivePrinterId(article, categories.get(article.categoryId))
				});
		}
		const lines = [...items.values()];
		if (lines.some((item) => item.quantity > MAX_QUANTITY))
			throw new DomainError(`Höchstens ${MAX_QUANTITY} Stück pro Position.`);

		const order = this.orders.create(
			{
				clientRequestId: input.clientRequestId,
				tableId: table.id,
				tableLabel: table.label,
				totalCents: lines.reduce((sum, item) => sum + item.priceCents * item.quantity, 0),
				createdByUserId: by.id,
				createdAt: this.now()
			},
			lines,
			// Queued in the same transaction: an order never exists without its tickets.
			(created) =>
				this.printQueue.enqueueOrder(
					created,
					lines.map((item, index) => ({ ...item, id: index, orderId: created.id })),
					by.name
				)
		);
		this.printQueue.wake();
		return order;
	}

	detail(orderId: number): OrderDetail {
		const order = this.orders.get(orderId) ?? notFound('Bestellung');
		const paidCents = this.payments.sumByOrder(orderId);
		const paid = this.payments.paidQuantities(orderId);
		return {
			order,
			items: this.orders
				.items(orderId)
				.map((item) => ({ ...item, paidQuantity: paid.get(item.id) ?? 0 })),
			payments: this.payments.listByOrder(orderId),
			printJobs: this.printQueue.listByOrder(orderId),
			paidCents,
			openCents: Math.max(0, order.totalCents - paidCents),
			createdByName: this.users.get(order.createdByUserId)?.name ?? 'Unbekannt'
		};
	}

	search(filter: OrderFilter): OrderSummary[] {
		return this.orders.search(filter);
	}
}
