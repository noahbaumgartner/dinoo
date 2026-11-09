<script lang="ts">
	import PaymentPanel from '$lib/components/PaymentPanel.svelte';
	import type { Snippet } from 'svelte';

	type Data = {
		order: {
			orderNumber: number;
			tableLabel: string;
			totalCents: number;
			createdAt: Date;
		};
		items: {
			id: number;
			quantity: number;
			paidQuantity: number;
			articleName: string;
			priceCents: number;
			options: string[];
			note: string | null;
		}[];
		paidCents: number;
		openCents: number;
		createdByName: string;
		payments: {
			id: number;
			amountCents: number;
			method: 'cash' | 'twint';
			paidAt: Date;
			paidByName: string;
			canUndo: boolean;
		}[];
		twintQrContent: string | null;
	};

	let { data, header }: { data: Data; header?: Snippet } = $props();

	const dateTime = new Intl.DateTimeFormat('de-CH', {
		day: '2-digit',
		month: '2-digit',
		hour: '2-digit',
		minute: '2-digit'
	});
</script>

<div class="screen">
	<div class="screen-head">
		{@render header?.()}
		<div class="title">
			<h1>Bestellung {data.order.orderNumber}</h1>
			<p class="muted">
				Tisch {data.order.tableLabel} · {dateTime.format(data.order.createdAt)} · {data.createdByName}
			</p>
		</div>
	</div>

	<PaymentPanel
		items={data.items}
		totalCents={data.order.totalCents}
		paidCents={data.paidCents}
		openCents={data.openCents}
		payments={data.payments}
		twintQrContent={data.twintQrContent}
	/>
</div>

<style>
	.screen {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.screen-head {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	h1 {
		font-size: 26px;
	}
</style>
