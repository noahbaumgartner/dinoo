<script lang="ts">
	import { formatChf } from '$lib/money';
	import { Button, NumberStepper } from '@noahbaumgartner/svelte-ui';
	import { Plus } from '@lucide/svelte';
	import type { SvelteMap } from 'svelte/reactivity';

	type Item = {
		id: number;
		quantity: number;
		paidQuantity: number;
		articleName: string;
		priceCents: number;
	};

	let {
		items,
		totalCents,
		note,
		selection
	}: {
		items: Item[];
		totalCents: number;
		note: string | null;
		/** Quantities picked for a partial payment; without it the list is read-only. */
		selection?: SvelteMap<number, number>;
	} = $props();

	function select(itemId: number, quantity: number) {
		if (quantity <= 0) selection?.delete(itemId);
		else selection?.set(itemId, quantity);
	}
</script>

<ul class="items">
	{#each items as item (item.id)}
		{@const left = item.quantity - item.paidQuantity}
		{@const selected = selection?.get(item.id) ?? 0}
		<li class={['item', { 'item--paid': left <= 0, 'accent-bar': selected > 0 }]}>
			<span class="tabular">{item.quantity} ×</span>
			<span class="item-name">
				{item.articleName}
				{#if item.paidQuantity > 0}
					<span class="muted small">
						{left <= 0 ? 'bezahlt' : `${item.paidQuantity} von ${item.quantity} bezahlt`}
					</span>
				{/if}
			</span>
			<span class="tabular">{formatChf(item.quantity * item.priceCents)}</span>
			{#if selection}
				<span class="item-select">
					{#if left > 0 && selected === 0}
						<Button
							variant="secondary"
							icon={Plus}
							label="{item.articleName} für Teilzahlung wählen"
							onclick={() => select(item.id, 1)}
						/>
					{:else if left > 0}
						<NumberStepper
							value={selected}
							min={0}
							max={left}
							label="Teilzahlung {item.articleName}"
							decreaseLabel="Weniger"
							increaseLabel="Mehr"
							onchange={(value) => select(item.id, value)}
						/>
					{/if}
				</span>
			{/if}
		</li>
	{/each}
	<li class="item total">
		<span></span>
		<span>Total</span>
		<span class="tabular">{formatChf(totalCents)}</span>
	</li>
</ul>
{#if note}
	<p class="note"><span class="muted">Notiz:</span> {note}</p>
{/if}

<style>
	.items {
		display: flex;
		flex-direction: column;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.item {
		display: grid;
		grid-template-columns: 40px 1fr auto auto;
		align-items: center;
		gap: 8px;
		min-height: 44px;
		padding: 6px 0 6px 12px;
		border-bottom: 1px solid var(--color-border);
		--accent-bar-inset: 8px;
	}

	.item-name {
		display: flex;
		flex-direction: column;
	}

	.item-select {
		display: flex;
		justify-content: flex-end;
	}

	.item--paid > :not(.item-select) {
		color: var(--color-text-muted);
	}

	.small {
		font-size: 13px;
	}

	.total {
		border-bottom: none;
		font-weight: 700;
	}

	.note {
		margin-top: 8px;
	}
</style>
