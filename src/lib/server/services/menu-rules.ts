import type { ArticleRecord, CategoryRecord } from '../repositories/db/types';

/** Where an article is printed: its own printer if set, otherwise the category default. */
export function effectivePrinterId(
	article: Pick<ArticleRecord, 'printerId'>,
	category: Pick<CategoryRecord, 'defaultPrinterId'> | undefined
): number | null {
	return article.printerId ?? category?.defaultPrinterId ?? null;
}
