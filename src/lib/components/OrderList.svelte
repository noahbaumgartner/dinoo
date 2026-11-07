<script lang="ts">
	import { formatChf } from '$lib/money';
	import { Badge, EmptyState } from '@noahbaumgartner/svelte-ui';
	import { ChevronRight, Clock, ReceiptText } from '@lucide/svelte';

	type Order = {
		id: number;
		orderNumber: number;
		tableLabel: string;
		createdByName: string;
		createdAt: Date;
		totalCents: number;
		paidCents: number;
		pendingPrintJobs: number;
	};

	let {
		orders,
		hrefFor,
		showStaff = false
	}: { orders: Order[]; hrefFor: (id: number) => string; showStaff?: boolean } = $props();

	const time = new Intl.DateTimeFormat('de-CH', { hour: '2-digit', minute: '2-digit' });
</script>

{#if orders.length === 0}
	<EmptyState
		icon={ReceiptText}
		title="Keine Bestellungen"
		description="Keine Bestellung passt zu den Filtern."
	/>
{:else}
	<ul class="orders">
		{#each orders as order (order.id)}
			{@const open = order.totalCents - order.paidCents}
			<li>
				<a href={hrefFor(order.id)} class="order">
					<span class="number tabular">#{order.orderNumber}</span>
					<span class="info">
						<strong>Tisch {order.tableLabel}</strong>
						<span class="muted small">
							{time.format(order.createdAt)}{showStaff ? ` · ${order.createdByName}` : ''}
						</span>
					</span>
					<span class="badges">
						{#if order.pendingPrintJobs > 0}
							<Badge icon={Clock}>Druck wartet</Badge>
						{/if}
						{#if open <= 0}
							<Badge>Bezahlt</Badge>
						{:else if order.paidCents > 0}
							<Badge variant="primary">Teilbezahlt</Badge>
						{:else}
							<Badge variant="primary">Offen</Badge>
						{/if}
					</span>
					<span class="amount tabular">
						{formatChf(order.totalCents)}
						{#if open > 0 && order.paidCents > 0}
							<span class="muted small">offen {formatChf(open)}</span>
						{/if}
					</span>
					<ChevronRight size={18} class="chevron" aria-hidden="true" />
				</a>
			</li>
		{/each}
	</ul>
{/if}

<style>
	.orders {
		display: flex;
		flex-direction: column;
		margin: 0;
		padding: 0;
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		background-color: var(--color-fill);
		list-style: none;
		overflow: hidden;
	}

	li + li {
		border-top: 1px solid var(--color-border);
	}

	.order {
		display: grid;
		grid-template-columns: 52px 1fr auto 18px;
		grid-template-areas:
			'number info amount chevron'
			'number badges amount chevron';
		align-items: center;
		gap: 4px 12px;
		padding: 12px 14px;
		color: inherit;
		text-decoration: none;
	}

	.order:hover {
		background-color: var(--color-surface);
	}

	.order:focus-visible {
		outline: 2px solid var(--color-accent);
		outline-offset: -2px;
	}

	.number {
		grid-area: number;
		font-size: 18px;
		font-weight: 700;
	}

	.info {
		grid-area: info;
		display: flex;
		flex-direction: column;
		min-width: 0;
	}

	.info strong {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.badges {
		grid-area: badges;
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
	}

	.amount {
		grid-area: amount;
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		font-weight: 600;
	}

	.small {
		font-size: 13px;
		font-weight: 400;
	}

	.order :global(.chevron) {
		grid-area: chevron;
		color: var(--color-text-faint);
	}

	@media (min-width: 720px) {
		.order {
			grid-template-columns: 60px 1fr auto 140px 18px;
			grid-template-areas: 'number info badges amount chevron';
		}
	}
</style>
