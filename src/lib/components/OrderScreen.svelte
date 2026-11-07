<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import PaymentPanel from '$lib/components/PaymentPanel.svelte';
	import PrintStatus from '$lib/components/PrintStatus.svelte';
	import { Card, CardContent, CardHeader, CardTitle } from '@noahbaumgartner/svelte-ui';
	import type { Snippet } from 'svelte';
	import { onDestroy } from 'svelte';

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
		printJobs: {
			id: number;
			printerName: string;
			printerUnreachable: boolean;
			status: 'queued' | 'printing' | 'printed' | 'cancelled';
			attempts: number;
			lastError: string | null;
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

	let printing = $derived(
		data.printJobs.some((job) => job.status === 'queued' || job.status === 'printing')
	);

	// Follow the print queue live while tickets are still waiting.
	let timer: ReturnType<typeof setInterval> | undefined;
	$effect(() => {
		if (!printing) return;
		timer = setInterval(() => invalidateAll(), 2500);
		return () => clearInterval(timer);
	});
	onDestroy(() => clearInterval(timer));
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

	<div class="grid" class:with-side={data.printJobs.length > 0}>
		<div class="main">
			<PaymentPanel
				items={data.items}
				totalCents={data.order.totalCents}
				paidCents={data.paidCents}
				openCents={data.openCents}
				payments={data.payments}
				twintQrContent={data.twintQrContent}
			/>
		</div>
		{#if data.printJobs.length > 0}
			<div class="side stack">
				<Card>
					<CardHeader><CardTitle>Druck</CardTitle></CardHeader>
					<CardContent><PrintStatus jobs={data.printJobs} /></CardContent>
				</Card>
			</div>
		{/if}
	</div>
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

	.grid {
		display: grid;
		gap: 20px;
	}

	@media (min-width: 900px) {
		.grid.with-side {
			grid-template-columns: minmax(0, 1fr) 360px;
			align-items: start;
		}
	}
</style>
