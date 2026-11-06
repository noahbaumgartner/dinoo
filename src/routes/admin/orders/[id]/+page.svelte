<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import OrderScreen from '$lib/components/OrderScreen.svelte';
	import {
		Button,
		Card,
		CardContent,
		CardHeader,
		CardTitle,
		Select,
		toast
	} from '@noahbaumgartner/svelte-ui';
	import { ArrowLeft, Printer } from '@lucide/svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
</script>

<svelte:head><title>Bestellung {data.order.orderNumber} · Admin · dinoo</title></svelte:head>

<div class="stack">
	<OrderScreen {data}>
		{#snippet header()}
			<div class="row">
				<Button href={resolve('/admin/orders')} variant="ghost" icon={ArrowLeft}
					>Alle Bestellungen</Button
				>
			</div>
		{/snippet}
	</OrderScreen>

	<Card>
		<CardHeader><CardTitle>Zettel erneut drucken</CardTitle></CardHeader>
		<CardContent>
			{#if form?.error}<p class="form-error" role="alert">{form.error}</p>{/if}
			{#if data.printJobs.length === 0}
				<p class="muted">Diese Bestellung hat keine Zettel.</p>
			{:else}
				<ul class="reprint">
					{#each data.printJobs as job (job.id)}
						<li>
							<span>Zettel für {job.printerName}</span>
							<form
								method="POST"
								action="?/reprint"
								class="row"
								use:enhance={() =>
									async ({ result, update }) => {
										await update();
										if (result.type === 'success') toast('Kopie in die Warteschlange gestellt');
									}}
							>
								<input type="hidden" name="jobId" value={job.id} />
								<div class="printer-select">
									<Select
										name="printerId"
										aria-label="Drucker für die Kopie"
										value={String(
											data.printers.find((p) => p.name === job.printerName)?.id ??
												data.printers[0]?.id ??
												''
										)}
										options={data.printers.map((p) => ({ value: String(p.id), label: p.name }))}
									/>
								</div>
								<Button type="submit" variant="secondary" size="sm" icon={Printer}
									>Kopie drucken</Button
								>
							</form>
						</li>
					{/each}
				</ul>
			{/if}
		</CardContent>
	</Card>
</div>

<style>
	.reprint {
		display: flex;
		flex-direction: column;
		gap: 8px;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.reprint li {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
	}

	.printer-select {
		min-width: 160px;
	}
</style>
