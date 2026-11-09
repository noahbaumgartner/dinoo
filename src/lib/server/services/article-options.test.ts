import { afterEach, beforeEach, describe, expect, it } from 'vite-plus/test';
import type { ArticleOption } from '$lib/article-options';
import { createTestRuntime, seedBasics } from '../test-utils';

let t: ReturnType<typeof createTestRuntime>;
let seed: Awaited<ReturnType<typeof seedBasics>>;

const cakeOptions: ArticleOption[] = [
	{
		id: 'kind',
		kind: 'choice',
		name: 'Sorte',
		required: true,
		choices: [
			{ id: 'choc', name: 'Schoggi', priceCents: 0 },
			{ id: 'lemon', name: 'Zitrone', priceCents: 50 }
		]
	},
	{ id: 'cups', kind: 'count', name: 'Becher', min: 0, max: 4, priceCents: 200 },
	{ id: 'cream', kind: 'toggle', name: 'mit Rahm', priceCents: 100 }
];

beforeEach(async () => {
	t = createTestRuntime();
	seed = await seedBasics(t.runtime);
});

afterEach(() => t.cleanup());

function saveCake(options: unknown = cakeOptions) {
	return t.services().menu.saveArticle(null, {
		name: 'Kuchen',
		priceCents: 400,
		categoryId: seed.food.id,
		printerId: null,
		description: '  hausgemacht ',
		minAge: 0,
		options: options as ArticleOption[]
	})!;
}

function order(items: { articleId: number; quantity: number; options?: unknown; note?: string }[]) {
	return t
		.services()
		.orders.place(
			{ clientRequestId: crypto.randomUUID(), tableId: seed.tables[0].id, items },
			seed.service
		);
}

describe('article options', () => {
	it('stores description, minimum age and options', () => {
		const cake = saveCake();
		expect(cake).toMatchObject({ description: 'hausgemacht', minAge: 0, options: cakeOptions });
		t.services().menu.saveArticle(seed.beer.id, { ...seed.beer, minAge: 18 });
		const beer = t
			.services()
			.menu.overview()
			.flatMap((c) => c.articles)
			.find((a) => a.id === seed.beer.id);
		expect(beer?.minAge).toBe(18);
		expect(() =>
			t.services().menu.saveArticle(seed.beer.id, { ...seed.beer, minAge: 12 as 16 })
		).toThrow(/Mindestalter/);
	});

	it('rejects invalid options', () => {
		const menu = () => t.services().menu;
		expect(() => saveCake([{ kind: 'toggle', name: ' ' }])).toThrow(/Namen/);
		expect(() => saveCake([{ kind: 'count', name: 'Becher', min: 3, max: 1 }])).toThrow(/Bereich/);
		expect(() => saveCake([{ kind: 'count', name: 'Becher', min: 0, max: 21 }])).toThrow(/Bereich/);
		expect(() => saveCake([{ kind: 'choice', name: 'Sorte', choices: [] }])).toThrow(
			/mindestens einen Wert/
		);
		expect(() => saveCake([{ kind: 'toggle', name: 'Rahm', priceCents: -1 }])).toThrow(/Aufpreis/);
		expect(
			menu()
				.overview()
				.flatMap((c) => c.articles)
		).toHaveLength(3);
		// New options get an id.
		const cake = saveCake([{ kind: 'toggle', name: 'ohne Sauce' }]);
		expect(cake.options[0]).toMatchObject({ kind: 'toggle', priceCents: 0 });
		expect(cake.options[0].id).toMatch(/\w+/);
	});

	it('prices options, snapshots their texts and splits positions by combination', () => {
		const cake = saveCake();
		const placed = order([
			{ articleId: cake.id, quantity: 2, options: { kind: 'choc' } },
			{ articleId: cake.id, quantity: 1, options: { kind: 'lemon', cups: 2, cream: true } },
			{ articleId: cake.id, quantity: 1, options: { kind: 'choc', cups: 0 } }
		]);
		const items = t.services().orders.detail(placed.id).items;
		expect(items.map((item) => [item.quantity, item.priceCents, item.options])).toEqual([
			[3, 400, ['Sorte: Schoggi']],
			[1, 400 + 50 + 2 * 200 + 100, ['Sorte: Zitrone', '2× Becher', 'mit Rahm']]
		]);
		expect(placed.totalCents).toBe(3 * 400 + 950);

		const [job] = t.services().printQueue.listByOrder(placed.id);
		expect(job.preview).toContain('Sorte: Zitrone\n');
		expect(job.preview).toContain('2× Becher');
	});

	it('rejects values that do not fit the article', () => {
		const cake = saveCake();
		const changed = /Artikel wurde geändert/;
		expect(() => order([{ articleId: cake.id, quantity: 1 }])).toThrow(changed);
		expect(() =>
			order([{ articleId: cake.id, quantity: 1, options: { kind: 'choc', cups: 5 } }])
		).toThrow(changed);
		expect(() => order([{ articleId: cake.id, quantity: 1, options: { kind: 'apple' } }])).toThrow(
			changed
		);
		expect(() =>
			order([{ articleId: cake.id, quantity: 1, options: { kind: 'choc', gone: true } }])
		).toThrow(changed);
		expect(() => order([{ articleId: seed.fries.id, quantity: 1, options: { x: 1 } }])).toThrow(
			changed
		);
	});
});
