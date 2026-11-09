import { isCategoryColor } from '../../category-colors';
import type {
	ArticleInput,
	CategoryInput,
	MenuRepository
} from '../repositories/db/MenuRepository';
import type { PrinterRepository } from '../repositories/db/PrinterRepository';
import type { ArticleRecord, CategoryRecord } from '../repositories/db/types';
import { DomainError, ensure, notFound } from './errors';
import { effectivePrinterId } from './menu-rules';

/**
 * New entries go to the end; the order is changed with `reorderCategories`/`reorderArticles`.
 * Articles start active; the active flag is changed via `setArticleActive`.
 */
export type CategoryFields = Omit<CategoryInput, 'sortOrder'>;
export type ArticleFields = Omit<ArticleInput, 'sortOrder' | 'active'>;

export type MenuArticle = ArticleRecord & { effectivePrinterId: number | null };
export type MenuCategory = CategoryRecord & { articles: MenuArticle[] };

/** Categories, articles, prices and their printer assignment (F04). */
export class MenuService {
	constructor(
		private readonly menu: MenuRepository,
		private readonly printers: PrinterRepository
	) {}

	overview(): MenuCategory[] {
		const articles = this.menu.listArticles();
		return this.menu.listCategories().map((category) => ({
			...category,
			articles: articles
				.filter((article) => article.categoryId === category.id)
				.map((article) => ({
					...article,
					effectivePrinterId: effectivePrinterId(article, category)
				}))
		}));
	}

	saveCategory(id: number | null, input: CategoryFields): CategoryRecord | undefined {
		const name = input.name.trim();
		if (!name) throw new DomainError('Bitte einen Namen für die Kategorie angeben.');
		if (!isCategoryColor(input.color)) throw new DomainError('Bitte eine Farbe auswählen.');
		if (input.defaultPrinterId !== null) this.printer(input.defaultPrinterId);
		const clean = { ...input, name };
		if (id === null)
			return this.menu.createCategory({
				...clean,
				sortOrder: nextSortOrder(this.menu.listCategories())
			});
		ensure(this.menu.getCategory(id), 'Kategorie');
		this.menu.updateCategory(id, clean);
	}

	deleteCategory(id: number) {
		ensure(this.menu.getCategory(id), 'Kategorie');
		if (this.menu.countArticlesInCategory(id) > 0)
			throw new DomainError('Kategorien mit Artikeln können nicht gelöscht werden.', 409);
		this.menu.deleteCategory(id);
	}

	saveArticle(id: number | null, input: ArticleFields): ArticleRecord | undefined {
		const name = input.name.trim();
		if (!name) throw new DomainError('Bitte einen Namen für den Artikel angeben.');
		if (!Number.isInteger(input.priceCents) || input.priceCents < 0)
			throw new DomainError('Bitte einen gültigen Preis angeben.');
		ensure(this.menu.getCategory(input.categoryId), 'Kategorie');
		if (input.printerId !== null) this.printer(input.printerId);
		const clean = { ...input, name };
		const appended = () => nextSortOrder(this.articlesIn(input.categoryId));
		if (id === null)
			return this.menu.createArticle({ ...clean, active: true, sortOrder: appended() });
		const existing = ensure(this.menu.getArticle(id), 'Artikel');
		// Moved to another category: append there.
		const sortOrder = existing.categoryId === input.categoryId ? existing.sortOrder : appended();
		this.menu.updateArticle(id, { ...clean, sortOrder });
	}

	/** `ids` are all categories in their new order. */
	reorderCategories(ids: number[]) {
		ensureSameEntries(ids, this.menu.listCategories());
		this.menu.setCategoryOrder(ids);
	}

	/** `ids` are all articles of the category in their new order. */
	reorderArticles(categoryId: number, ids: number[]) {
		ensure(this.menu.getCategory(categoryId), 'Kategorie');
		ensureSameEntries(ids, this.articlesIn(categoryId));
		this.menu.setArticleOrder(ids);
	}

	setArticleActive(id: number, active: boolean) {
		ensure(this.menu.getArticle(id), 'Artikel');
		this.menu.updateArticle(id, { active });
	}

	/** Ordered articles are only deactivated, so their history stays intact. */
	deleteArticle(id: number): 'deleted' | 'deactivated' {
		ensure(this.menu.getArticle(id), 'Artikel');
		if (this.menu.isArticleOrdered(id)) {
			this.menu.updateArticle(id, { active: false });
			return 'deactivated';
		}
		this.menu.deleteArticle(id);
		return 'deleted';
	}

	private articlesIn(categoryId: number) {
		return this.menu.listArticles().filter((article) => article.categoryId === categoryId);
	}

	private printer(id: number) {
		return this.printers.get(id) ?? notFound('Drucker');
	}
}

function nextSortOrder(entries: { sortOrder: number }[]) {
	return Math.max(0, ...entries.map((entry) => entry.sortOrder)) + 1;
}

/** Rejects a new order that was computed from an outdated list (e.g. another admin added one). */
function ensureSameEntries(ids: number[], current: { id: number }[]) {
	const known = new Set(current.map((entry) => entry.id));
	if (
		ids.length !== known.size ||
		new Set(ids).size !== ids.length ||
		!ids.every((id) => known.has(id))
	)
		throw new DomainError(
			'Das Angebot wurde inzwischen geändert. Die Reihenfolge wurde neu geladen.',
			409
		);
}
