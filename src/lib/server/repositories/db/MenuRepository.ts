import { asc, eq } from 'drizzle-orm';
import { countRows, type Db } from './client';
import { articles, categories, orderItems } from './schema';
import type { ArticleRecord, CategoryRecord } from './types';

export type CategoryInput = {
	name: string;
	sortOrder: number;
	color: string;
	defaultPrinterId: number | null;
};

export type ArticleInput = {
	name: string;
	priceCents: number;
	categoryId: number;
	printerId: number | null;
	sortOrder: number;
	active: boolean;
};

/** Categories and articles. */
export class MenuRepository {
	constructor(private readonly db: Db) {}

	listCategories(): CategoryRecord[] {
		return this.db
			.select()
			.from(categories)
			.orderBy(asc(categories.sortOrder), asc(categories.name))
			.all();
	}

	getCategory(id: number): CategoryRecord | undefined {
		return this.db.select().from(categories).where(eq(categories.id, id)).get();
	}

	createCategory(input: CategoryInput): CategoryRecord {
		return this.db.insert(categories).values(input).returning().get();
	}

	updateCategory(id: number, input: CategoryInput) {
		this.db.update(categories).set(input).where(eq(categories.id, id)).run();
	}

	deleteCategory(id: number) {
		this.db.delete(categories).where(eq(categories.id, id)).run();
	}

	countArticlesInCategory(categoryId: number): number {
		return countRows(this.db, articles, eq(articles.categoryId, categoryId));
	}

	listArticles(): ArticleRecord[] {
		return this.db
			.select()
			.from(articles)
			.orderBy(asc(articles.sortOrder), asc(articles.name))
			.all();
	}

	getArticle(id: number): ArticleRecord | undefined {
		return this.db.select().from(articles).where(eq(articles.id, id)).get();
	}

	getArticles(ids: number[]): ArticleRecord[] {
		if (ids.length === 0) return [];
		return this.listArticles().filter((article) => ids.includes(article.id));
	}

	createArticle(input: ArticleInput): ArticleRecord {
		return this.db.insert(articles).values(input).returning().get();
	}

	updateArticle(id: number, input: Partial<ArticleInput>) {
		this.db.update(articles).set(input).where(eq(articles.id, id)).run();
	}

	deleteArticle(id: number) {
		this.db.delete(articles).where(eq(articles.id, id)).run();
	}

	isArticleOrdered(id: number): boolean {
		return countRows(this.db, orderItems, eq(orderItems.articleId, id)) > 0;
	}
}
