<script lang="ts">
	import { enhance } from '$app/forms';
	import AdminPage from '$lib/components/AdminPage.svelte';
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
		Switch
	} from '@noahbaumgartner/svelte-ui';
	import { Pencil, Plus, Printer, Trash2, UtensilsCrossed } from '@lucide/svelte';
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
	let articleActive = $state(true);

	function editArticle(value: Article | null, categoryId: number) {
		article = value;
		articleCategory = String(value?.categoryId ?? categoryId);
		articlePrinter = value?.printerId ? String(value.printerId) : LIKE_CATEGORY;
		articleActive = value?.active ?? true;
		articleOpen = true;
	}

	let inheritedPrinter = $derived.by(() => {
		const id = data.categories.find((c) => String(c.id) === articleCategory)?.defaultPrinterId;
		return id ? (printerName.get(id) ?? 'unbekannt') : 'kein Druck';
	});

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

	{#each data.categories as cat (cat.id)}
		<Card style="--category-color: {categoryColor(cat.color)}">
			<CardHeader>
				<CardTitle
					><span class="category-title"
						><span class="category-dot" aria-hidden="true"></span>{cat.name}</span
					></CardTitle
				>
				<CardAction>
					<span class="row">
						<Badge icon={Printer}
							>{cat.defaultPrinterId ? printerName.get(cat.defaultPrinterId) : 'Kein Druck'}</Badge
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
					<ul class="articles">
						{#each cat.articles as item (item.id)}
							<li class={['article', { 'article--inactive': !item.active }]}>
								<span class="article-name">
									{item.name}
									{#if !item.active}<Badge>Ausverkauft</Badge>{/if}
								</span>
								<span class="tabular">{formatChf(item.priceCents)}</span>
								<span class="printer muted">
									<Printer size={14} aria-hidden="true" />
									{item.effectivePrinterId
										? printerName.get(item.effectivePrinterId)
										: 'Kein Druck'}
									{#if item.printerId}<Badge variant="primary">eigener</Badge>{/if}
								</span>
								<form method="POST" action="?/setActive" use:enhance={notify()} class="toggle">
									<input type="hidden" name="id" value={item.id} />
									<input type="hidden" name="active" value={item.active ? 'false' : 'true'} />
									<Switch
										checked={item.active}
										aria-label="{item.name} bestellbar"
										onchange={(event) => event.currentTarget.form?.requestSubmit()}
									/>
								</form>
								<span class="icon-actions">
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
							</li>
						{/each}
					</ul>
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
	{/each}
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
		<Field>
			<Label for="category-sort">Reihenfolge</Label>
			<Input
				id="category-sort"
				name="sortOrder"
				inputmode="numeric"
				value={String(category?.sortOrder ?? data.categories.length + 1)}
			/>
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
		<div class="grid-2">
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
				<Label for="article-sort">Reihenfolge</Label>
				<Input
					id="article-sort"
					name="sortOrder"
					inputmode="numeric"
					value={String(article?.sortOrder ?? 0)}
				/>
			</Field>
		</div>
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
		<Field orientation="horizontal">
			<Switch id="article-active" name="active" bind:checked={articleActive} />
			<Label for="article-active">Bestellbar (nicht ausverkauft)</Label>
		</Field>
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
	.category-title {
		display: inline-flex;
		align-items: center;
		gap: 10px;
	}

	.category-dot {
		flex-shrink: 0;
		width: 12px;
		height: 12px;
		border-radius: 4px;
		background-color: var(--category-color);
	}

	.articles {
		display: flex;
		flex-direction: column;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.article {
		display: grid;
		grid-template-columns: 1fr 90px 160px auto auto;
		align-items: center;
		gap: 12px;
		min-height: 52px;
		border-bottom: 1px solid var(--color-border);
	}

	.article--inactive .article-name,
	.article--inactive .tabular {
		color: var(--color-text-muted);
	}

	.article-name {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 6px;
		font-weight: 500;
	}

	.printer {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		font-size: 13px;
	}

	.toggle {
		display: flex;
	}

	.add {
		margin-top: 12px;
	}

	.grid-2 {
		display: grid;
		grid-template-columns: 1fr 110px;
		gap: 12px;
	}

	@media (max-width: 720px) {
		.article {
			grid-template-columns: 1fr auto auto;
			grid-template-areas:
				'name toggle actions'
				'meta meta meta';
			padding: 8px 0;
		}

		.article-name {
			grid-area: name;
		}

		.article .tabular,
		.printer {
			grid-row: 2;
		}

		.toggle {
			grid-area: toggle;
		}
	}
</style>
