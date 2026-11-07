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
		note: string | null;
	};

	let {
		items,
		totalCents,
		selection
	}: {
		items: Item[];
		totalCents: number;
		/** Quantities picked for a partial payment; without it the list is read-only. */
		selection?: SvelteMap<number, number>;
	} = $props();

	/** As soon as one position is picked, the others step back. */
	let selecting = $derived((selection?.size ?? 0) > 0);

	function select(itemId: number, quantity: number) {
		if (quantity <= 0) selection?.delete(itemId);
		else selection?.set(itemId, quantity);
	}
</script>

<ul class="items">
	{#each items as item (item.id)}
		{@const left = item.quantity - item.paidQuantity}
		{@const selected = selection?.get(item.id) ?? 0}
		<li
			class={[
				'item',
				{
					'item--paid': left <= 0,
					'item--dimmed': left > 0 && selecting && selected === 0,
					'item--selected': selected > 0,
					'accent-bar': selected > 0
				}
			]}
		>
			<span class="tabular">{item.quantity} ×</span>
			<span class="item-name">
				{item.articleName}
				{#if item.note}
					<span class="item-note small">{item.note}</span>
				{/if}
				{#if item.paidQuantity > 0}
					<span class="muted small">
						{left <= 0 ? 'bezahlt' : `${item.paidQuantity} von ${item.quantity} bezahlt`}
					</span>
				{/if}
			</span>
			<span class="item-price tabular">{formatChf(item.quantity * item.priceCents)}</span>
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
							size="md"
							min={0}
							max={left}
							label="Teilzahlung {item.articleName}"
							decreaseLabel="Weniger"
							increaseLabel="Mehr"
							format={(value) => `${value} / ${left}`}
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
		min-height: 52px;
		padding: 8px 0 8px 12px;
		border-bottom: 1px solid var(--color-border);
		--accent-bar-inset: 8px;
	}

	.item-name {
		display: flex;
		flex-direction: column;
	}

	.item-price {
		white-space: nowrap;
	}

	.item-select {
		display: flex;
		justify-content: flex-end;
		margin-left: 8px;
	}

	/* On phones the stepper does not fit next to name and price: it moves to its own line. */
	@media (max-width: 479px) {
		.item--selected .item-select {
			grid-column: 2 / -1;
			margin-left: 0;
		}
	}

	.item--paid > :not(.item-select) {
		color: var(--color-text-muted);
	}

	.item-select :global(.number-stepper) {
		gap: 8px;
		font-size: 15px;
	}

	.item-select :global(.number-stepper-value) {
		min-width: 44px;
	}

	.item--dimmed > :not(.item-select) {
		opacity: 0.4;
		transition: opacity 150ms ease;
	}

	/* Same touch target as the stepper's buttons, so «+» does not change size when picked. */
	@media (pointer: coarse) {
		.item-select :global(.button) {
			min-width: 44px;
			min-height: 44px;
		}
	}

	.small {
		font-size: 13px;
	}

	.total {
		border-bottom: none;
		font-weight: 700;
	}

	.item-note {
		color: var(--color-text-secondary);
		font-style: italic;
	}
</style>
