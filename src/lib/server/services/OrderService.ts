import type { MenuRepository } from '../repositories/db/MenuRepository';
import type {
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
	note?: string;
	items: { articleId: number; quantity: number }[];
};

export type OrderingData = {
	tables: TableRecord[];
	categories: (CategoryRecord & { articles: ArticleRecord[] })[];
};

export type OrderDetail = {
	order: OrderRecord;
	items: OrderItemRecord[];
	payments: PaymentWithUser[];
	printJobs: PrintJobView[];
	paidCents: number;
	openCents: number;
	createdByName: string;
};

const MAX_QUANTITY = 99;

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

		const quantities = new Map<number, number>();
		for (const item of input.items) {
			if (!Number.isInteger(item.quantity) || item.quantity <= 0) continue;
			quantities.set(item.articleId, (quantities.get(item.articleId) ?? 0) + item.quantity);
		}
		if (quantities.size === 0) throw new DomainError('Die Bestellung enthält keine Artikel.');

		const articles = this.menu.getArticles([...quantities.keys()]);
		const categories = new Map(this.menu.listCategories().map((c) => [c.id, c]));
		const items = [...quantities].map(([articleId, quantity]) => {
			const article = articles.find((a) => a.id === articleId);
			if (!article || !article.active)
				throw new DomainError(
					'Ein Artikel ist nicht mehr verfügbar. Bitte Bestellung prüfen.',
					409
				);
			if (quantity > MAX_QUANTITY)
				throw new DomainError(`Höchstens ${MAX_QUANTITY} Stück pro Artikel.`);
			return {
				articleId,
				articleName: article.name,
				priceCents: article.priceCents,
				quantity,
				printerId: effectivePrinterId(article, categories.get(article.categoryId))
			};
		});

		const order = this.orders.create(
			{
				clientRequestId: input.clientRequestId,
				tableId: table.id,
				tableLabel: table.label,
				note: input.note?.trim() || null,
				totalCents: items.reduce((sum, item) => sum + item.priceCents * item.quantity, 0),
				createdByUserId: by.id,
				createdAt: this.now()
			},
			items,
			// Queued in the same transaction: an order never exists without its tickets.
			(created) =>
				this.printQueue.enqueueOrder(
					created,
					items.map((item, index) => ({ ...item, id: index, orderId: created.id })),
					by.name
				)
		);
		this.printQueue.wake();
		return order;
	}

	detail(orderId: number): OrderDetail {
		const order = this.orders.get(orderId) ?? notFound('Bestellung');
		const paidCents = this.payments.sumByOrder(orderId);
		return {
			order,
			items: this.orders.items(orderId),
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
