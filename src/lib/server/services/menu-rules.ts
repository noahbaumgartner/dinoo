import type { ArticleRecord, CategoryRecord } from '../repositories/db/types';

/** Where an article is printed: the category default unless the article overrides it. */
export function effectivePrinterId(
	article: Pick<ArticleRecord, 'printerMode' | 'printerId'>,
	category: Pick<CategoryRecord, 'defaultPrinterId'> | undefined
): number | null {
	switch (article.printerMode) {
		case 'inherit':
			return category?.defaultPrinterId ?? null;
		case 'custom':
			return article.printerId;
		case 'none':
			return null;
	}
}
