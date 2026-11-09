import { MAX_CHOICES, MAX_COUNT, MAX_OPTIONS, type ArticleOption } from '../../article-options';
import { uid } from '../../uid';
import type { ArticleRecord, CategoryRecord } from '../repositories/db/types';
import { DomainError } from './errors';

/** Where an article is printed: its own printer if set, otherwise the category default. */
export function effectivePrinterId(
	article: Pick<ArticleRecord, 'printerId'>,
	category: Pick<CategoryRecord, 'defaultPrinterId'> | undefined
): number | null {
	return article.printerId ?? category?.defaultPrinterId ?? null;
}

/**
 * Validates options entered in the admin dialog and returns them trimmed. Options and choices keep
 * their id, so positions in open orders stay valid when an article is edited; new ones get one.
 */
export function cleanArticleOptions(input: unknown): ArticleOption[] {
	if (!Array.isArray(input)) throw new DomainError('Die Optionen konnten nicht gelesen werden.');
	if (input.length > MAX_OPTIONS)
		throw new DomainError(`Höchstens ${MAX_OPTIONS} Optionen pro Artikel.`);
	const ids = new Set<string>();
	const id = (raw: unknown) => {
		const value = typeof raw === 'string' && /^[\w-]{1,64}$/.test(raw) ? raw : uid();
		if (ids.has(value)) throw new DomainError('Die Optionen konnten nicht gelesen werden.');
		ids.add(value);
		return value;
	};
	return input.map((raw: Record<string, unknown>): ArticleOption => {
		const option = raw && typeof raw === 'object' ? raw : {};
		const name = text(option.name);
		if (!name) throw new DomainError('Bitte jeder Option einen Namen geben.');
		const label = `Option «${name}»`;
		switch (option.kind) {
			case 'count': {
				const min = option.min;
				const max = option.max;
				if (!isCount(min) || !isCount(max) || min > max)
					throw new DomainError(
						`${label}: Bitte einen Bereich von 0 bis ${MAX_COUNT} angeben, «von» höchstens «bis».`
					);
				return {
					id: id(option.id),
					kind: 'count',
					name,
					min,
					max,
					priceCents: price(option, label)
				};
			}
			case 'toggle':
				return { id: id(option.id), kind: 'toggle', name, priceCents: price(option, label) };
			case 'choice': {
				const choices = Array.isArray(option.choices) ? option.choices : [];
				if (choices.length === 0)
					throw new DomainError(`${label}: Bitte mindestens einen Wert erfassen.`);
				if (choices.length > MAX_CHOICES)
					throw new DomainError(`${label}: Höchstens ${MAX_CHOICES} Werte.`);
				return {
					id: id(option.id),
					kind: 'choice',
					name,
					required: option.required === true,
					choices: choices.map((rawChoice: Record<string, unknown>) => {
						const choice = rawChoice && typeof rawChoice === 'object' ? rawChoice : {};
						const choiceName = text(choice.name);
						if (!choiceName) throw new DomainError(`${label}: Bitte jedem Wert einen Namen geben.`);
						return { id: id(choice.id), name: choiceName, priceCents: price(choice, label) };
					})
				};
			}
			default:
				throw new DomainError('Die Optionen konnten nicht gelesen werden.');
		}
	});
}

const MAX_NAME_LENGTH = 60;

function text(value: unknown): string {
	const trimmed = typeof value === 'string' ? value.trim() : '';
	if (trimmed.length > MAX_NAME_LENGTH)
		throw new DomainError(`Namen von Optionen sind höchstens ${MAX_NAME_LENGTH} Zeichen lang.`);
	return trimmed;
}

function isCount(value: unknown): value is number {
	return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= MAX_COUNT;
}

function price(entry: Record<string, unknown>, label: string): number {
	const value = entry.priceCents ?? 0;
	if (typeof value !== 'number' || !Number.isInteger(value) || value < 0)
		throw new DomainError(`${label}: Bitte einen gültigen Aufpreis angeben.`);
	return value;
}
