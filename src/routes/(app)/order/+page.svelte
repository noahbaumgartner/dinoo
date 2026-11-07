<script lang="ts">
	import { enhance } from '$app/forms';
	import ActionBar from '$lib/components/ActionBar.svelte';
	import { formatChf } from '$lib/money';
	import { uid } from '$lib/uid';
	import {
		Button,
		EmptyState,
		Field,
		Input,
		Label,
		NumberStepper,
		Steps,
		Textarea
	} from '@noahbaumgartner/svelte-ui';
	import { ArrowLeft, ArrowRight, Send, UtensilsCrossed } from '@lucide/svelte';
	import { SvelteMap } from 'svelte/reactivity';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	const steps = [
		{ label: 'Tisch' },
		{ label: 'Artikel' },
		{ label: 'Abschicken' },
		{ label: 'Abrechnen' }
	];

	let step = $state(0);
	let tableId = $state<number | null>(null);
	let note = $state('');
	let quantities = new SvelteMap<number, number>();
	let clientRequestId = $state(uid());
	let submitting = $state(false);
	let activeCategory = $state<number | null>(null);

	let articles = $derived(data.categories.flatMap((category) => category.articles));
	let table = $derived(data.tables.find((t) => t.id === tableId));
	let lines = $derived(
		articles
			.filter((article) => (quantities.get(article.id) ?? 0) > 0)
			.map((article) => ({ ...article, quantity: quantities.get(article.id) ?? 0 }))
	);
	let itemCount = $derived(lines.reduce((sum, line) => sum + line.quantity, 0));
	let totalCents = $derived(lines.reduce((sum, line) => sum + line.quantity * line.priceCents, 0));
	let canContinue = $derived(tableId !== null);

	function go(next: number) {
		step = next;
		window.scrollTo({ top: 0 });
	}

	function setQuantity(articleId: number, quantity: number) {
		if (quantity <= 0) quantities.delete(articleId);
		else quantities.set(articleId, quantity);
	}

	function jumpTo(categoryId: number) {
		activeCategory = categoryId;
		document.getElementById(`category-${categoryId}`)?.scrollIntoView({ behavior: 'smooth' });
	}
</script>

<svelte:head><title>Bestellen · dinoo</title></svelte:head>

<div class="order stack">
	<Steps
		{steps}
		current={step}
		label="Bestellablauf"
		labels={{ done: 'erledigt', current: 'aktueller Schritt' }}
		onselect={(index) => go(index)}
	/>

	{#if data.tables.length === 0 || data.categories.length === 0}
		<EmptyState
			icon={UtensilsCrossed}
			title="Noch nicht bereit"
			description="Es sind noch keine Tische oder Artikel erfasst. Ein Admin muss das Angebot und die Tische zuerst einrichten."
		/>
	{:else if step === 0}
		<section class="stack" aria-labelledby="step-table">
			<h1 id="step-table">Tisch wählen</h1>
			<div class="tables" role="radiogroup" aria-label="Tisch">
				{#each data.tables as t (t.id)}
					<button
						type="button"
						role="radio"
						aria-checked={tableId === t.id}
						class={['table-tile', { 'table-tile--selected': tableId === t.id }]}
						onclick={() => (tableId = t.id)}
					>
						{t.label}
					</button>
				{/each}
			</div>
		</section>
		<ActionBar>
			{#snippet summary()}
				{#if table}
					<strong>Tisch {table.label}</strong>
				{:else}
					<span class="muted">Tisch wählen</span>
				{/if}
			{/snippet}
			<Button size="lg" icon={ArrowRight} disabled={!canContinue} onclick={() => go(1)}
				>Weiter</Button
			>
		</ActionBar>
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
							onclick={() => jumpTo(category.id)}>{category.name}</button
						>
					{/each}
				</nav>
			{/if}
			{#each data.categories as category (category.id)}
				<div class="category" id="category-{category.id}">
					<h2>{category.name}</h2>
					<ul class="articles">
						{#each category.articles as article (article.id)}
							{@const quantity = quantities.get(article.id) ?? 0}
							<li class={['article', { 'article--selected': quantity > 0 }]}>
								<button
									type="button"
									class="article-add"
									onclick={() => setQuantity(article.id, quantity + 1)}
									aria-label="{article.name} hinzufügen"
								>
									<span class="article-name">{article.name}</span>
									<span class="article-price muted">{formatChf(article.priceCents)}</span>
								</button>
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
			<Field>
				<Label for="note">Notiz für die Küche (optional)</Label>
				<Textarea id="note" bind:value={note} rows={2} placeholder="z. B. ohne Zwiebeln" />
			</Field>
		</section>
		<ActionBar>
			{#snippet summary()}
				<strong>{formatChf(totalCents)}</strong>
				<span class="muted"> · {itemCount} {itemCount === 1 ? 'Artikel' : 'Artikel'}</span>
			{/snippet}
			<Button variant="secondary" size="lg" icon={ArrowLeft} label="Zurück" onclick={() => go(0)} />
			<Button size="lg" icon={ArrowRight} disabled={itemCount === 0} onclick={() => go(2)}
				>Weiter</Button
			>
		</ActionBar>
	{:else}
		<section class="stack" aria-labelledby="step-review">
			<h1 id="step-review">Bestellung prüfen</h1>
			<dl class="facts">
				<div>
					<dt>Tisch</dt>
					<dd>{table?.label}</dd>
				</div>
			</dl>
			<ul class="review">
				{#each lines as line (line.id)}
					<li>
						<span class="tabular">{line.quantity} ×</span>
						<span>{line.name}</span>
						<span class="tabular">{formatChf(line.quantity * line.priceCents)}</span>
					</li>
				{/each}
				<li class="review-total">
					<span></span>
					<span>Total</span>
					<span class="tabular">{formatChf(totalCents)}</span>
				</li>
			</ul>
			{#if note.trim()}
				<p><span class="muted">Notiz:</span> {note.trim()}</p>
			{/if}
			{#if form?.error}
				<p class="form-error" role="alert">{form.error}</p>
			{/if}
		</section>
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
			<input type="hidden" name="note" value={note} />
			<input
				type="hidden"
				name="items"
				value={JSON.stringify(lines.map((l) => ({ articleId: l.id, quantity: l.quantity })))}
			/>
			<ActionBar>
				{#snippet summary()}
					<strong>{formatChf(totalCents)}</strong>
				{/snippet}
				<Button
					variant="secondary"
					size="lg"
					icon={ArrowLeft}
					label="Zurück"
					disabled={submitting}
					onclick={() => go(1)}
				/>
				<Button type="submit" size="lg" icon={Send} loading={submitting}
					>Bestellung abschicken</Button
				>
			</ActionBar>
		</form>
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

	.tables {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(76px, 1fr));
		gap: 8px;
	}

	.table-tile {
		aspect-ratio: 1;
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		background-color: var(--color-bg);
		color: var(--color-text);
		font: inherit;
		font-size: 22px;
		font-weight: 600;
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
		border-color: var(--color-accent);
		background-color: var(--color-surface);
	}

	.category {
		scroll-margin-top: 64px;
	}

	.articles {
		display: flex;
		flex-direction: column;
		margin: 0;
		padding: 0;
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		list-style: none;
		overflow: hidden;
	}

	.article {
		display: flex;
		align-items: center;
		gap: 12px;
		padding-right: 12px;
	}

	.article + .article {
		border-top: 1px solid var(--color-border);
	}

	.article--selected {
		background-color: var(--color-surface);
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

	.article-price {
		font-size: 14px;
		font-variant-numeric: tabular-nums;
	}

	.facts {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 12px;
		margin: 0;
	}

	.facts div {
		padding: 12px 14px;
		border-radius: var(--radius);
		background-color: var(--color-surface);
	}

	.facts dt {
		color: var(--color-text-muted);
		font-size: 13px;
	}

	.facts dd {
		margin: 2px 0 0;
		font-size: 20px;
		font-weight: 600;
	}

	.review {
		display: flex;
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
