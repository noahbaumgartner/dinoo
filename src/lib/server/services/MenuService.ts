import type {
	ArticleInput,
	CategoryInput,
	MenuRepository
} from '../repositories/db/MenuRepository';
import type { PrinterRepository } from '../repositories/db/PrinterRepository';
import type { ArticleRecord, CategoryRecord } from '../repositories/db/types';
import { DomainError, ensure, notFound } from './errors';
import { effectivePrinterId } from './menu-rules';

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

	saveCategory(id: number | null, input: CategoryInput): CategoryRecord | undefined {
		const name = input.name.trim();
		if (!name) throw new DomainError('Bitte einen Namen für die Kategorie angeben.');
		if (input.defaultPrinterId !== null) this.printer(input.defaultPrinterId);
		const clean = { ...input, name };
		if (id === null) return this.menu.createCategory(clean);
		ensure(this.menu.getCategory(id), 'Kategorie');
		this.menu.updateCategory(id, clean);
	}

	deleteCategory(id: number) {
		ensure(this.menu.getCategory(id), 'Kategorie');
		if (this.menu.countArticlesInCategory(id) > 0)
			throw new DomainError('Kategorien mit Artikeln können nicht gelöscht werden.', 409);
		this.menu.deleteCategory(id);
	}

	saveArticle(id: number | null, input: ArticleInput): ArticleRecord | undefined {
		const name = input.name.trim();
		if (!name) throw new DomainError('Bitte einen Namen für den Artikel angeben.');
		if (!Number.isInteger(input.priceCents) || input.priceCents < 0)
			throw new DomainError('Bitte einen gültigen Preis angeben.');
		ensure(this.menu.getCategory(input.categoryId), 'Kategorie');
		if (input.printerId !== null) this.printer(input.printerId);
		const clean = { ...input, name };
		if (id === null) return this.menu.createArticle(clean);
		ensure(this.menu.getArticle(id), 'Artikel');
		this.menu.updateArticle(id, clean);
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

	private printer(id: number) {
		return this.printers.get(id) ?? notFound('Drucker');
	}
}
