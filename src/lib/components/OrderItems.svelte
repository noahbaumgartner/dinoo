<script lang="ts">
	import { formatChf } from '$lib/money';

	type Item = { id: number; quantity: number; articleName: string; priceCents: number };

	let { items, totalCents, note }: { items: Item[]; totalCents: number; note: string | null } =
		$props();
</script>

<ul class="items">
	{#each items as item (item.id)}
		<li>
			<span class="tabular">{item.quantity} ×</span>
			<span>{item.articleName}</span>
			<span class="tabular">{formatChf(item.quantity * item.priceCents)}</span>
		</li>
	{/each}
	<li class="total">
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

	li {
		display: grid;
		grid-template-columns: 40px 1fr auto;
		gap: 8px;
		padding: 8px 0;
		border-bottom: 1px solid var(--color-border);
	}

	.total {
		border-bottom: none;
		font-weight: 700;
	}

	.note {
		margin-top: 8px;
	}
</style>
