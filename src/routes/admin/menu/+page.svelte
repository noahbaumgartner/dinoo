<script lang="ts">
	import { deserialize, enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import AdminPage from '$lib/components/AdminPage.svelte';
	import ArticleOptionsEditor from '$lib/components/ArticleOptionsEditor.svelte';
	import CategoryColorPicker from '$lib/components/CategoryColorPicker.svelte';
	import {
		categoryColor,
		isCategoryColor,
		nextCategoryColor,
		type CategoryColor
	} from '$lib/category-colors';
	import { notify } from '$lib/components/notify';
	import { formatChf } from '$lib/money';
	import {
		AlertDialog,
		Badge,
		Button,
		Card,
		CardAction,
		CardContent,
		CardHeader,
		CardTitle,
		Dialog,
		EmptyState,
		Field,
		FieldDescription,
		Input,
		Label,
		Select,
		SortableList,
		toast
	} from '@noahbaumgartner/svelte-ui';
	import {
		CircleAlert,
		Eye,
		EyeOff,
		Pencil,
		Plus,
		Printer,
		SlidersHorizontal,
		Trash2,
		UtensilsCrossed
	} from '@lucide/svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	type Category = (typeof data.categories)[number];
	type Article = Category['articles'][number];

	const NO_PRINTER = '';
	const LIKE_CATEGORY = '';

	let printerName = $derived(new Map(data.printers.map((p) => [p.id, p.name])));
	let printerOptions = $derived(data.printers.map((p) => ({ value: String(p.id), label: p.name })));

	// Category dialog
	let categoryOpen = $state(false);
	let category = $state<Category | null>(null);
	let categoryPrinter = $state(NO_PRINTER);
	let categoryColorKey = $state<CategoryColor>(nextCategoryColor(0));

	function editCategory(value: Category | null) {
		category = value;
		categoryPrinter = value?.defaultPrinterId ? String(value.defaultPrinterId) : NO_PRINTER;
		categoryColorKey =
			value && isCategoryColor(value.color)
				? value.color
				: nextCategoryColor(data.categories.length);
		categoryOpen = true;
	}

	// Article dialog
	let articleOpen = $state(false);
	let article = $state<Article | null>(null);
	let articleCategory = $state('');
	let articlePrinter = $state(LIKE_CATEGORY);
	let articleMinAge = $state('0');
	/** Recreates the options editor, so it starts from the opened article. */
	let articleKey = $state(0);

	function editArticle(value: Article | null, categoryId: number) {
		article = value;
		articleCategory = String(value?.categoryId ?? categoryId);
		articlePrinter = value?.printerId ? String(value.printerId) : LIKE_CATEGORY;
		articleMinAge = String(value?.minAge ?? 0);
		articleKey++;
		articleOpen = true;
	}

	let inheritedPrinter = $derived.by(() => {
		const id = data.categories.find((c) => String(c.id) === articleCategory)?.defaultPrinterId;
		return id ? (printerName.get(id) ?? 'unbekannt') : 'kein Druck';
	});

	/** Saves a new order right after a drag; on failure the server's order is reloaded. */
	async function saveOrder(
		action: 'reorderCategories' | 'reorderArticles',
		ids: number[],
		categoryId?: number
	) {
		const body = new FormData();
		if (categoryId !== undefined) body.set('categoryId', String(categoryId));
		for (const id of ids) body.append('ids', String(id));
		let error = 'Die Reihenfolge konnte nicht gespeichert werden.';
		try {
			const response = await fetch(`?/${action}`, {
				method: 'POST',
				body,
				headers: { 'x-sveltekit-action': 'true' }
			});
			const result = deserialize(await response.text());
			if (result.type === 'success') error = '';
			else if (result.type === 'failure' && typeof result.data?.error === 'string')
				error = result.data.error;
		} catch {
			// Network error: keep the generic message.
		}
		await invalidateAll();
		if (error) toast(error, { icon: CircleAlert, duration: 6000 });
	}

	const position = (_: unknown, index: number, total: number) => `Position ${index} von ${total}`;

	// Delete confirmation
	let deleteOpen = $state(false);
	let deleting = $state<{ kind: 'category' | 'article'; id: number; name: string } | null>(null);
</script>

<AdminPage
	title="Angebot"
	description="Kategorien legen fest, wohin ihre Artikel standardmässig gedruckt werden. Pro Artikel lässt sich das übersteuern."
>
	{#snippet actions()}
		<Button icon={Plus} onclick={() => editCategory(null)}>Kategorie erfassen</Button>
	{/snippet}

	{#if data.categories.length === 0}
		<EmptyState
			icon={UtensilsCrossed}
			title="Noch kein Angebot"
			description="Lege zuerst eine Kategorie an, z. B. «Warme Küche», und erfasse darin die Artikel."
		>
			<Button icon={Plus} onclick={() => editCategory(null)}>Kategorie erfassen</Button>
		</EmptyState>
	{/if}

	<SortableList
		class="categories"
		items={data.categories}
		key={(cat) => cat.id}
		handleLabel={(cat) => `${cat.name} verschieben`}
		announce={position}
		onreorder={(ordered) =>
			saveOrder(
				'reorderCategories',
				ordered.map((cat) => cat.id)
			)}
	>
		{#snippet item(cat, handle)}
			<Card style="--category-color: {categoryColor(cat.color)}">
				<CardHeader>
					<CardTitle
						><span class="category-title"
							>{@render handle()}<span class="category-dot" aria-hidden="true"
							></span>{cat.name}</span
						></CardTitle
					>
					<CardAction>
						<span class="row">
							<Badge icon={Printer}
								>{cat.defaultPrinterId
									? printerName.get(cat.defaultPrinterId)
									: 'Kein Druck'}</Badge
							>
							<span class="icon-actions">
								<Button
									variant="ghost"
									size="sm"
									icon={Pencil}
									label="Kategorie bearbeiten"
									onclick={() => editCategory(cat)}
								/>
								<Button
									variant="ghost"
									size="sm"
									icon={Trash2}
									label="Kategorie löschen"
									onclick={() => (
										(deleting = { kind: 'category', id: cat.id, name: cat.name }),
										(deleteOpen = true)
									)}
								/>
							</span>
						</span></CardAction
					>
				</CardHeader>
				<CardContent>
					{#if cat.articles.length === 0}
						<p class="muted">Noch keine Artikel in dieser Kategorie.</p>
					{:else}
						<SortableList
							class="articles"
							items={cat.articles}
							key={(entry) => entry.id}
							handleLabel={(entry) => `${entry.name} verschieben`}
							announce={position}
							revealHandles
							onreorder={(ordered) =>
								saveOrder(
									'reorderArticles',
									ordered.map((entry) => entry.id),
									cat.id
								)}
						>
							{#snippet item(item, handle)}
								<div class={['article', { 'article--inactive': !item.active }]}>
									<span class="article-handle">{@render handle()}</span>
									<span class="article-name">
										{item.name}
										{#if item.minAge > 0}<Badge>{item.minAge}+</Badge>{/if}
										{#if item.options.length > 0}
											<Badge
												icon={SlidersHorizontal}
												title="{item.options.length} {item.options.length === 1
													? 'Option'
													: 'Optionen'}"
												aria-label="{item.options.length} {item.options.length === 1
													? 'Option'
													: 'Optionen'}">{item.options.length}</Badge
											>
										{/if}
									</span>
									<span class="tabular">{formatChf(item.priceCents)}</span>
									<span class="icon-actions">
										<form method="POST" action="?/setActive" use:enhance={notify()} class="toggle">
											<input type="hidden" name="id" value={item.id} />
											<input type="hidden" name="active" value={item.active ? 'false' : 'true'} />
											<Button
												type="submit"
												variant="ghost"
												size="sm"
												icon={item.active ? Eye : EyeOff}
												label={item.active
													? `${item.name} deaktivieren`
													: `${item.name} aktivieren`}
											/>
										</form>
										<Button
											variant="ghost"
											size="sm"
											icon={Pencil}
											label="{item.name} bearbeiten"
											onclick={() => editArticle(item, cat.id)}
										/>
										<Button
											variant="ghost"
											size="sm"
											icon={Trash2}
											label="{item.name} löschen"
											onclick={() => (
												(deleting = { kind: 'article', id: item.id, name: item.name }),
												(deleteOpen = true)
											)}
										/>
									</span>
								</div>
							{/snippet}
						</SortableList>
					{/if}
					<div class="add">
						<Button
							variant="secondary"
							size="sm"
							icon={Plus}
							onclick={() => editArticle(null, cat.id)}>Artikel erfassen</Button
						>
					</div>
				</CardContent>
			</Card>
		{/snippet}
	</SortableList>
</AdminPage>

<Dialog
	bind:open={categoryOpen}
	title={category ? 'Kategorie bearbeiten' : 'Kategorie erfassen'}
	closeLabel="Schliessen"
>
	<form
		id="category-form"
		method="POST"
		action="?/saveCategory"
		class="stack"
		use:enhance={notify(() => (categoryOpen = false))}
	>
		{#if category}<input type="hidden" name="id" value={category.id} />{/if}
		<Field>
			<Label for="category-name">Name</Label>
			<Input
				id="category-name"
				name="name"
				value={category?.name ?? ''}
				placeholder="z. B. Warme Küche"
				required
			/>
		</Field>
		<Field>
			<Label for="category-color">Farbe</Label>
			<CategoryColorPicker id="category-color" bind:value={categoryColorKey} />
			<FieldDescription>Hilft beim Bestellen, Kategorien schnell zu erkennen.</FieldDescription>
		</Field>
		<Field>
			<Label for="category-printer">Standard-Drucker</Label>
			<Select
				id="category-printer"
				name="defaultPrinterId"
				bind:value={categoryPrinter}
				options={[{ value: NO_PRINTER, label: 'Kein Druck' }, ...printerOptions]}
			/>
			<FieldDescription
				>Gilt für alle Artikel der Kategorie, die nichts anderes festlegen.</FieldDescription
			>
		</Field>
	</form>
	{#snippet actions(close)}
		<Button variant="secondary" onclick={close}>Abbrechen</Button>
		<Button type="submit" form="category-form">Speichern</Button>
	{/snippet}
</Dialog>

<Dialog
	bind:open={articleOpen}
	title={article ? 'Artikel bearbeiten' : 'Artikel erfassen'}
	closeLabel="Schliessen"
>
	<form
		id="article-form"
		method="POST"
		action="?/saveArticle"
		class="stack"
		use:enhance={notify(() => (articleOpen = false))}
	>
		{#if article}<input type="hidden" name="id" value={article.id} />{/if}
		<Field>
			<Label for="article-name">Name</Label>
			<Input id="article-name" name="name" value={article?.name ?? ''} required />
		</Field>
		<Field>
			<Label for="article-price">Preis (CHF)</Label>
			<Input
				id="article-price"
				name="price"
				inputmode="decimal"
				value={article ? (article.priceCents / 100).toFixed(2) : ''}
				placeholder="4.50"
				required
			/>
		</Field>
		<Field>
			<Label for="article-category">Kategorie</Label>
			<Select
				id="article-category"
				name="categoryId"
				bind:value={articleCategory}
				options={data.categories.map((c) => ({ value: String(c.id), label: c.name }))}
			/>
		</Field>
		<Field>
			<Label for="article-printer">Drucker</Label>
			<Select
				id="article-printer"
				name="printerId"
				bind:value={articlePrinter}
				options={[
					{ value: LIKE_CATEGORY, label: `Wie Kategorie (${inheritedPrinter})` },
					...printerOptions
				]}
			/>
		</Field>
		<Field>
			<Label for="article-description">Beschreibung (optional)</Label>
			<Input
				id="article-description"
				name="description"
				value={article?.description ?? ''}
				maxlength={200}
				placeholder="z. B. mit Pommes und Salat"
			/>
		</Field>
		<Field>
			<Label for="article-min-age">Mindestalter</Label>
			<Select
				id="article-min-age"
				name="minAge"
				bind:value={articleMinAge}
				options={[
					{ value: '0', label: 'Keines' },
					{ value: '16', label: '16 Jahre (Hinweis «16+»)' },
					{ value: '18', label: '18 Jahre (Hinweis «18+»)' }
				]}
			/>
		</Field>
		<!-- Not a Field: its disabled buttons would grey out the label. -->
		<section class="article-options" aria-labelledby="article-options-title">
			<h3 id="article-options-title">Optionen</h3>
			<p class="muted">Pro Position wählbar, Aufpreise kommen zum Preis dazu.</p>
			{#key articleKey}
				<ArticleOptionsEditor options={article?.options ?? []} />
			{/key}
		</section>
	</form>
	{#snippet actions(close)}
		<Button variant="secondary" onclick={close}>Abbrechen</Button>
		<Button type="submit" form="article-form">Speichern</Button>
	{/snippet}
</Dialog>

<AlertDialog
	bind:open={deleteOpen}
	title={deleting?.kind === 'category' ? 'Kategorie löschen?' : 'Artikel löschen?'}
	description={deleting?.kind === 'category'
		? `«${deleting?.name}» kann nur gelöscht werden, wenn sie keine Artikel mehr enthält.`
		: `«${deleting?.name}» wird gelöscht. Wurde der Artikel schon bestellt, wird er nur deaktiviert.`}
>
	{#snippet actions(close)}
		<Button variant="secondary" onclick={close}>Abbrechen</Button>
		<form
			method="POST"
			action={deleting?.kind === 'category' ? '?/deleteCategory' : '?/deleteArticle'}
			use:enhance={notify(close)}
		>
			<input type="hidden" name="id" value={deleting?.id} />
			<Button type="submit" icon={Trash2}>Löschen</Button>
		</form>
	{/snippet}
</AlertDialog>

<style>
	:global(.categories) {
		gap: 24px;
		--sortable-list-dragging-radius: 14px;
	}

	.category-title {
		display: inline-flex;
		align-items: center;
		gap: 10px;
		/* The handle sits in the card's padding, so the dot stays aligned with the content. */
		margin-left: -8px;
	}

	/* The dot lines up with the article names below. */
	.category-title :global(.sortable-list-handle) {
		margin-right: 2px;
	}

	.category-dot {
		flex-shrink: 0;
		width: 12px;
		height: 12px;
		border-radius: 4px;
		background-color: var(--category-color);
	}

	:global(.articles) {
		--sortable-list-dragging-background: var(--color-fill);
	}

	.article {
		position: relative;
		display: grid;
		grid-template-columns: auto 1fr auto auto;
		align-items: center;
		gap: 12px;
		min-height: 52px;
		padding: 0 12px;
	}

	/* The divider starts at the name, so the handles stand apart in the gutter. */
	.article::after {
		position: absolute;
		right: 12px;
		bottom: 0;
		left: 40px;
		border-bottom: 1px solid var(--color-border);
		content: '';
	}

	.article--inactive .article-name,
	.article--inactive .tabular {
		color: var(--color-text-muted);
	}

	.article-handle {
		display: flex;
		margin-left: -8px;
	}

	.article-name {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 6px;
		font-weight: 500;
	}

	.article .tabular {
		text-align: right;
		white-space: nowrap;
	}

	.toggle {
		display: flex;
	}

	.article-options {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.article-options h3 {
		font-size: 14px;
		font-weight: 600;
	}

	.article-options p {
		margin: 0 0 4px;
		font-size: 14px;
	}

	.add {
		margin-top: 12px;
	}
</style>
