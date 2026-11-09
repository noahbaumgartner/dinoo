<script lang="ts">
	import { enhance } from '$app/forms';
	import ActionBar from '$lib/components/ActionBar.svelte';
	import SeatingPlan from '$lib/components/SeatingPlan.svelte';
	import { categoryColor } from '$lib/category-colors';
	import { rowLabel } from '$lib/table-grid';
	import { formatChf } from '$lib/money';
	import { uid } from '$lib/uid';
	import {
		Button,
		Drawer,
		EmptyState,
		Field,
		Input,
		Label,
		NumberStepper,
		Tabs,
		Textarea
	} from '@noahbaumgartner/svelte-ui';
	import {
		ArrowLeft,
		ClipboardCheck,
		LayoutGrid,
		List,
		Pencil,
		Send,
		Trash2,
		UtensilsCrossed
	} from '@lucide/svelte';
	import { SvelteMap } from 'svelte/reactivity';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	let step = $state(0);
	let tableId = $state<number | null>(null);
	let quantities = new SvelteMap<number, number>();
	/** Note for the kitchen per article line, e.g. «ohne Zwiebeln». */
	let notes = new SvelteMap<number, string>();
	/** Article whose note is being edited in the drawer. */
	let noteArticleId = $state<number | null>(null);
	let noteDraft = $state('');
	let noteOpen = $state(false);
	let clientRequestId = $state(uid());
	let submitting = $state(false);
	let activeCategory = $state<number | null>(null);
	let reviewOpen = $state(false);

	/** How the tables are shown; remembered per device. */
	type TableView = 'list' | 'plan';
	const TABLE_VIEW_KEY = 'dinoo.tableView';
	let tableView = $state<TableView>('list');

	// Read after hydration so the server-rendered list and the client agree first.
	$effect(() => {
		try {
			if (localStorage.getItem(TABLE_VIEW_KEY) === 'plan') tableView = 'plan';
		} catch {
			// Storage unavailable; keep the default.
		}
	});

	function setTableView(view: TableView) {
		try {
			localStorage.setItem(TABLE_VIEW_KEY, view);
		} catch {
			// Storage unavailable (private mode); the choice just isn't remembered.
		}
	}

	let articles = $derived(data.categories.flatMap((category) => category.articles));
	let table = $derived(data.tables.find((t) => t.id === tableId));
	let planTables = $derived(data.tables.filter((t) => t.gridRow !== null));
	let freeTables = $derived(data.tables.filter((t) => t.gridRow === null));
	/** Plan tables grouped by row, in column order. */
	let planRows = $derived(
		Array.from({ length: data.plan.rows }, (_, index) => index + 1)
			.map((row) => ({
				row,
				tables: planTables
					.filter((t) => t.gridRow === row)
					.sort((a, b) => (a.gridColumn ?? 0) - (b.gridColumn ?? 0))
			}))
			.filter((group) => group.tables.length > 0)
	);
	let lines = $derived(
		articles
			.filter((article) => (quantities.get(article.id) ?? 0) > 0)
			.map((article) => ({
				...article,
				quantity: quantities.get(article.id) ?? 0,
				note: notes.get(article.id) ?? null
			}))
	);
	let itemCount = $derived(lines.reduce((sum, line) => sum + line.quantity, 0));
	let totalCents = $derived(lines.reduce((sum, line) => sum + line.quantity * line.priceCents, 0));

	function go(next: number) {
		step = next;
		window.scrollTo({ top: 0 });
	}

	function setQuantity(articleId: number, quantity: number) {
		if (quantity > 0) return quantities.set(articleId, quantity);
		quantities.delete(articleId);
		notes.delete(articleId);
	}

	let noteArticle = $derived(articles.find((article) => article.id === noteArticleId));

	function editNote(articleId: number) {
		noteArticleId = articleId;
		noteDraft = notes.get(articleId) ?? '';
		noteOpen = true;
	}

	function saveNote(text: string) {
		if (noteArticleId === null) return;
		const trimmed = text.trim();
		if (trimmed) notes.set(noteArticleId, trimmed);
		else notes.delete(noteArticleId);
		noteOpen = false;
	}

	function jumpTo(categoryId: number) {
		activeCategory = categoryId;
		document.getElementById(`category-${categoryId}`)?.scrollIntoView({ behavior: 'smooth' });
	}
</script>

{#snippet tile(t: (typeof data.tables)[number])}
	<button
		type="button"
		role="radio"
		aria-checked={tableId === t.id}
		class={['table-tile', { 'table-tile--selected': tableId === t.id }]}
		onclick={() => {
			tableId = t.id;
			go(1);
		}}
	>
		{t.label}
	</button>
{/snippet}

<svelte:head><title>Bestellen · dinoo</title></svelte:head>

<div class="order stack">
	{#if data.tables.length === 0 || data.categories.length === 0}
		<EmptyState
			icon={UtensilsCrossed}
			title="Noch nicht bereit"
			description="Es sind noch keine Tische oder Artikel erfasst. Ein Admin muss das Angebot und die Tische zuerst einrichten."
		/>
	{:else if step === 0}
		<section
			class={[
				'stack',
				{ 'plan-mode fill-viewport': planTables.length > 0 && tableView === 'plan' }
			]}
			aria-labelledby="step-table"
		>
			<div class="row heading-row">
				<h1 id="step-table">Tisch wählen</h1>
				{#if planTables.length > 0}
					<Tabs
						bind:value={tableView}
						onchange={setTableView}
						label="Ansicht"
						size="sm"
						options={[
							{ value: 'list', label: 'Liste', icon: List },
							{ value: 'plan', label: 'Saalplan', icon: LayoutGrid }
						]}
					/>
				{/if}
			</div>
			<div class="stack table-choice" role="radiogroup" aria-label="Tisch">
				{#if planTables.length > 0}
					{#if tableView === 'plan'}
						<SeatingPlan rows={data.plan.rows} columns={data.plan.columns} tables={planTables} fill>
							{#snippet cell(t)}
								{@render tile(t)}
							{/snippet}
						</SeatingPlan>
					{:else}
						{#each planRows as group (group.row)}
							<div class="table-group">
								<h2>{rowLabel(data.plan.numbering, group.row)}</h2>
								<div class="tables">
									{#each group.tables as t (t.id)}
										{@render tile(t)}
									{/each}
								</div>
							</div>
						{/each}
					{/if}
				{/if}
				{#if freeTables.length > 0}
					<div class="table-group">
						{#if planTables.length > 0}
							<h2>{tableView === 'plan' ? 'Weitere' : 'Weitere Tische'}</h2>
						{/if}
						<div class={['tables', { 'tables--strip': tableView === 'plan' }]}>
							{#each freeTables as t (t.id)}
								{@render tile(t)}
							{/each}
						</div>
					</div>
				{/if}
			</div>
		</section>
	{:else if step === 1}
		<section class="stack" aria-labelledby="step-articles">
			<div class="row heading-row">
				<h1 id="step-articles">Artikel</h1>
				<span class="muted">Tisch {table?.label}</span>
			</div>
			{#if data.categories.length > 1}
				<nav class="category-nav" aria-label="Kategorien">
					{#each data.categories as category (category.id)}
						<button
							type="button"
							class={['chip', { 'chip--active': activeCategory === category.id }]}
							style:--category-color={categoryColor(category.color)}
							onclick={() => jumpTo(category.id)}
							><span class="category-dot" aria-hidden="true"></span>{category.name}</button
						>
					{/each}
				</nav>
			{/if}
			{#each data.categories as category (category.id)}
				<div
					class="category"
					id="category-{category.id}"
					style:--category-color={categoryColor(category.color)}
				>
					<h2 class="category-heading">
						<span class="category-dot" aria-hidden="true"></span>{category.name}
					</h2>
					<ul class="articles">
						{#each category.articles as article (article.id)}
							{@const quantity = quantities.get(article.id) ?? 0}
							<li class={['article', { 'article--selected accent-bar': quantity > 0 }]}>
								<button
									type="button"
									class="article-add"
									onclick={() => setQuantity(article.id, quantity + 1)}
									aria-label="{article.name} hinzufügen"
								>
									<span class="article-name">{article.name}</span>
									<span class="article-price muted">{formatChf(article.priceCents)}</span>
									{#if quantity > 0 && notes.get(article.id)}
										<span class="article-note">{notes.get(article.id)}</span>
									{/if}
								</button>
								{#if quantity > 0}
									<Button
										variant="ghost"
										icon={Pencil}
										label="Notiz für {article.name}"
										aria-haspopup="dialog"
										onclick={() => editNote(article.id)}
									/>
								{/if}
								<NumberStepper
									value={quantity}
									min={0}
									max={99}
									size="md"
									label="Menge {article.name}"
									decreaseLabel="Weniger"
									increaseLabel="Mehr"
									onchange={(value) => setQuantity(article.id, value)}
								/>
							</li>
						{/each}
					</ul>
				</div>
			{/each}
		</section>
		<ActionBar>
			{#snippet summary()}
				<strong>{formatChf(totalCents)}</strong>
				<span class="muted"> · {itemCount} {itemCount === 1 ? 'Artikel' : 'Artikel'}</span>
			{/snippet}
			<Button variant="secondary" size="lg" icon={ArrowLeft} label="Zurück" onclick={() => go(0)} />
			<Button
				size="lg"
				icon={ClipboardCheck}
				disabled={itemCount === 0}
				onclick={() => (reviewOpen = true)}>Prüfen</Button
			>
		</ActionBar>
		<Drawer
			bind:open={reviewOpen}
			title="Bestellung prüfen"
			description="Tisch {table?.label}"
			closeLabel="Schliessen"
		>
			<ul class="review">
				{#each lines as line (line.id)}
					<li>
						<span class="tabular">{line.quantity} ×</span>
						<span class="review-name">
							{line.name}
							{#if line.note}<span class="article-note">{line.note}</span>{/if}
						</span>
						<span class="tabular">{formatChf(line.quantity * line.priceCents)}</span>
					</li>
				{/each}
				<li class="review-total">
					<span></span>
					<span>Total</span>
					<span class="tabular">{formatChf(totalCents)}</span>
				</li>
			</ul>
			{#if form?.error}
				<p class="form-error" role="alert">{form.error}</p>
			{/if}
			{#snippet actions(close)}
				<Button variant="secondary" size="lg" disabled={submitting} onclick={close}
					>Weiter bearbeiten</Button
				>
				<form
					method="POST"
					action="?/place"
					use:enhance={() => {
						submitting = true;
						return async ({ result, update }) => {
							// A new id only after a definite answer; retries of the same submit keep it.
							if (result.type === 'redirect') clientRequestId = uid();
							await update();
							submitting = false;
						};
					}}
				>
					<input type="hidden" name="clientRequestId" value={clientRequestId} />
					<input type="hidden" name="tableId" value={tableId} />
					<input
						type="hidden"
						name="items"
						value={JSON.stringify(
							lines.map((l) => ({ articleId: l.id, quantity: l.quantity, note: l.note }))
						)}
					/>
					<Button type="submit" size="lg" icon={Send} loading={submitting}
						>Bestellung abschicken · {formatChf(totalCents)}</Button
					>
				</form>
			{/snippet}
		</Drawer>
		<Drawer
			bind:open={noteOpen}
			title="Notiz für die Küche"
			description={noteArticle?.name}
			closeLabel="Schliessen"
		>
			<Field>
				<Label for="item-note">Notiz</Label>
				<Textarea
					id="item-note"
					bind:value={noteDraft}
					rows={3}
					maxlength={200}
					placeholder="z. B. ohne Zwiebeln"
				/>
			</Field>
			{#snippet actions()}
				{#if noteArticleId !== null && notes.has(noteArticleId)}
					<Button variant="secondary" size="lg" icon={Trash2} onclick={() => saveNote('')}
						>Notiz entfernen</Button
					>
				{/if}
				<Button size="lg" onclick={() => saveNote(noteDraft)}>Speichern</Button>
			{/snippet}
		</Drawer>
	{/if}
</div>

<style>
	.order {
		gap: 20px;
	}

	h1 {
		font-size: 24px;
	}

	h2 {
		margin-bottom: 8px;
		font-size: 15px;
		color: var(--color-text-secondary);
	}

	.heading-row {
		justify-content: space-between;
	}

	/* Same fixed tile size and white card as the seating plan; the row title stays outside. */
	.tables {
		padding: 12px;
		border-radius: 14px;
		background-color: var(--color-fill);
		display: grid;
		grid-template-columns: repeat(auto-fill, 72px);
		grid-auto-rows: 72px;
		gap: 6px;
	}

	.table-group h2 {
		margin-bottom: 8px;
	}

	/* Plan mode: the page does not scroll, the plan takes the remaining height. */
	.order:has(.plan-mode),
	.plan-mode,
	.plan-mode .table-choice {
		flex: 1;
		min-height: 0;
	}

	.plan-mode .table-group {
		flex-shrink: 0;
	}

	/* The other tables in one row that scrolls sideways. */
	.tables--strip {
		grid-template-columns: none;
		grid-auto-columns: 72px;
		grid-auto-flow: column;
		overflow-x: auto;
	}

	.table-tile {
		min-width: 0;
		padding: 4px;
		overflow: hidden;
		overflow-wrap: anywhere;
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		background-color: var(--color-bg);
		color: var(--color-text);
		font: inherit;
		font-size: 20px;
		font-weight: 600;
		line-height: 1.1;
		cursor: pointer;
		touch-action: manipulation;
	}

	.table-tile:hover {
		background-color: var(--color-surface);
	}

	.table-tile--selected,
	.table-tile--selected:hover {
		border-color: var(--color-accent);
		background-color: var(--color-accent);
		color: var(--color-accent-foreground);
	}

	.table-tile:focus-visible,
	.chip:focus-visible,
	.article-add:focus-visible {
		outline: 2px solid var(--color-accent);
		outline-offset: 2px;
	}

	.category-nav {
		position: sticky;
		top: 0;
		z-index: 5;
		display: flex;
		gap: 6px;
		margin-inline: calc(-1 * var(--gutter));
		padding: 8px var(--gutter);
		overflow-x: auto;
		background-color: var(--color-bg);
		scrollbar-width: none;
	}

	.chip {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		flex-shrink: 0;
		padding: 8px 14px;
		border: 1px solid var(--color-border);
		border-radius: 999px;
		background-color: var(--color-bg);
		color: var(--color-text);
		font: inherit;
		font-size: 14px;
		cursor: pointer;
	}

	.chip--active {
		border-color: var(--category-color);
		background-color: var(--color-surface);
	}

	.category {
		scroll-margin-top: 64px;
	}

	.category-heading {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.category-dot {
		flex-shrink: 0;
		width: 10px;
		height: 10px;
		border-radius: 3px;
		background-color: var(--category-color);
	}

	.articles {
		display: flex;
		flex-direction: column;
		margin: 0;
		padding: 0;
		border-radius: var(--radius);
		background-color: var(--color-fill);
		list-style: none;
		overflow: hidden;
	}

	.article {
		position: relative;
		display: flex;
		align-items: center;
		gap: 12px;
		padding-right: 12px;
	}

	/* Inset divider like the admin lists; ::after because ::before is the accent bar. */
	.article + .article::after {
		content: '';
		position: absolute;
		top: 0;
		right: 12px;
		left: 12px;
		border-top: 1px solid var(--color-border);
	}

	/* Accent bar instead of a fill: the stepper buttons share the surface colour. */
	.article--selected {
		--accent-bar-color: var(--color-accent);
		--accent-bar-inset: 10px;
	}

	.article-add {
		display: flex;
		flex: 1;
		flex-direction: column;
		align-items: flex-start;
		gap: 2px;
		min-width: 0;
		padding: 14px 12px;
		border: none;
		background: none;
		color: inherit;
		font: inherit;
		text-align: left;
		cursor: pointer;
		touch-action: manipulation;
	}

	.article-name {
		font-weight: 500;
	}

	.article-note {
		color: var(--color-text-secondary);
		font-size: 14px;
		font-style: italic;
		overflow-wrap: anywhere;
	}

	.review-name {
		display: flex;
		flex-direction: column;
	}

	.article-price {
		font-size: 14px;
		font-variant-numeric: tabular-nums;
	}

	.review {
		display: flex;
		font-size: 15px;
		flex-direction: column;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.review li {
		display: grid;
		grid-template-columns: 44px 1fr auto;
		gap: 8px;
		padding: 10px 0;
		border-bottom: 1px solid var(--color-border);
	}

	.review-total {
		font-weight: 700;
		border-bottom: none !important;
	}
</style>
