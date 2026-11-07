<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { setSearchParams } from '$lib/navigation';
	import AdminPage from '$lib/components/AdminPage.svelte';
	import PrinterStatusCard from '$lib/components/PrinterStatusCard.svelte';
	import {
		Badge,
		Button,
		Dialog,
		EmptyState,
		Select,
		Table,
		Tabs,
		toast,
		type TableColumn
	} from '@noahbaumgartner/svelte-ui';
	import { CircleAlert, Copy, Eye, ScrollText, X } from '@lucide/svelte';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { onMount } from 'svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	type Job = (typeof data.jobs)[number];

	const time = new Intl.DateTimeFormat('de-CH', {
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit'
	});

	let preview = $state<Job | null>(null);
	let previewOpen = $state(false);

	const statusLabels: Record<Job['status'], string> = {
		queued: 'Wartet',
		printing: 'Druckt',
		printed: 'Gedruckt',
		cancelled: 'Abgebrochen'
	};

	const notify: SubmitFunction =
		() =>
		async ({ result, update }) => {
			await update();
			if (result.type === 'success' && typeof result.data?.message === 'string')
				toast(result.data.message);
			if (result.type === 'failure' && typeof result.data?.error === 'string')
				toast(result.data.error, { icon: CircleAlert });
		};

	const setParam = (name: string, value: string) => setSearchParams({ [name]: value || null });

	// Live view: watch the queue drain once a printer is back.
	onMount(() => {
		const timer = setInterval(() => invalidateAll(), 3000);
		return () => clearInterval(timer);
	});

	// With `npm link`, svelte-ui type-checks against its own copy of svelte, so a local snippet is not
	// assignable to the library's `Snippet` type. Same runtime value; the cast only bridges the types.
	type Cell = Extract<TableColumn<Job>, { cell: unknown }>['cell'];
	const cell = (snippet: unknown) => snippet as Cell;

	// The snippets are declared in the markup below; the linter does not see them.
	/* oxlint-disable no-undef */
	const columns: TableColumn<Job>[] = [
		{ header: 'Erstellt', cell: cell(created), sortable: (job) => job.createdAt },
		{ header: 'Zettel', cell: cell(ticket) },
		{ header: 'Drucker', key: 'printerName', sortable: true },
		{ header: 'Status', cell: cell(status) },
		{ header: 'Versuche', key: 'attempts', align: 'right' },
		{ header: '', cell: cell(actions), align: 'right' }
	];
	/* oxlint-enable no-undef */
</script>

{#snippet created(job: Job)}
	<span class="tabular">{time.format(job.createdAt)}</span>
{/snippet}

{#snippet ticket(job: Job)}
	{#if job.kind === 'test'}
		<span class="muted">Testdruck</span>
	{:else}
		<a href="/admin/orders/{job.orderId}">#{job.orderNumber} · Tisch {job.tableLabel}</a>
	{/if}
{/snippet}

{#snippet status(job: Job)}
	<span class="status">
		<Badge variant={job.status === 'queued' && job.lastError ? 'primary' : 'secondary'}
			>{statusLabels[job.status]}</Badge
		>
		{#if job.status === 'queued' && job.lastError}
			<span class="error" title={job.lastError}>{job.lastError}</span>
		{/if}
	</span>
{/snippet}

{#snippet actions(job: Job)}
	<span class="row actions">
		<Button
			variant="ghost"
			size="sm"
			icon={Eye}
			label="Vorschau"
			onclick={() => ((preview = job), (previewOpen = true))}
		/>
		{#if job.status === 'queued'}
			{@const others = data.printers.filter((p) => p.id !== job.printerId && p.active)}
			{#if others.length > 0}
				<form method="POST" action="?/reroute" class="row" use:enhance={notify}>
					<input type="hidden" name="jobId" value={job.id} />
					<div class="target">
						<Select
							name="printerId"
							value={String(others[0].id)}
							aria-label="Umleiten auf"
							options={others.map((p) => ({ value: String(p.id), label: p.name }))}
						/>
					</div>
					<Button type="submit" variant="secondary" size="sm">Umleiten</Button>
				</form>
			{/if}
			<form method="POST" action="?/cancel" use:enhance={notify}>
				<input type="hidden" name="jobId" value={job.id} />
				<Button type="submit" variant="ghost" size="sm" icon={X} label="Abbrechen" />
			</form>
		{:else if job.status === 'printed' || job.status === 'cancelled'}
			<form method="POST" action="?/reprint" use:enhance={notify}>
				<input type="hidden" name="jobId" value={job.id} />
				<Button type="submit" variant="ghost" size="sm" icon={Copy} label="Erneut drucken" />
			</form>
		{/if}
	</span>
{/snippet}

<AdminPage
	title="Druckwarteschlange"
	description="Jeder Zettel läuft durch diese Warteschlange. Ist ein Drucker nicht erreichbar, bleiben seine Zettel hier und werden automatisch nachgedruckt, sobald er wieder antwortet."
>
	<div class="printers">
		{#each data.printers as printer (printer.id)}
			<PrinterStatusCard
				{printer}
				others={data.printers.filter((p) => p.id !== printer.id && p.active)}
			/>
		{/each}
	</div>

	<div class="filters">
		<Tabs
			size="sm"
			label="Status"
			value={data.status}
			options={[
				{ value: 'pending', label: 'Nicht gedruckt' },
				{ value: 'printed', label: 'Gedruckt' },
				{ value: 'cancelled', label: 'Abgebrochen' },
				{ value: 'all', label: 'Alle' }
			]}
			onchange={(value) => setParam('status', value)}
		/>
		<div class="printer-filter">
			<Select
				value={data.printerId === null ? '' : String(data.printerId)}
				aria-label="Drucker"
				options={[
					{ value: '', label: 'Alle Drucker' },
					...data.printers.map((p) => ({ value: String(p.id), label: p.name }))
				]}
				onchange={(value) => setParam('printer', value)}
			/>
		</div>
	</div>

	{#if data.jobs.length === 0}
		<EmptyState
			icon={ScrollText}
			title={data.status === 'pending' ? 'Alles gedruckt' : 'Keine Druckaufträge'}
			description={data.status === 'pending'
				? 'Es warten keine Zettel. Neue Bestellungen werden sofort gedruckt.'
				: 'Für diesen Filter gibt es keine Einträge.'}
		/>
	{:else}
		<div class="table-wrap">
			<Table data={data.jobs} {columns} rowId={(job) => job.id} locale="de-CH" />
		</div>
	{/if}
</AdminPage>

<Dialog
	bind:open={previewOpen}
	title={preview?.kind === 'test' ? 'Testdruck' : `Zettel #${preview?.orderNumber ?? ''}`}
	description={preview ? `für ${preview.printerName}` : undefined}
	closeLabel="Schliessen"
>
	{#if preview}<pre class="ticket">{preview.preview}</pre>{/if}
</Dialog>

<style>
	.printers {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 12px;
	}

	.filters {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
	}

	.printer-filter {
		min-width: 180px;
	}

	/* White like the cards instead of the off-white page background. */
	.table-wrap {
		border-radius: var(--radius);
		background-color: var(--color-fill);
		overflow-x: auto;
	}

	/* Inset divider like the order list, also below the header. Drawn on the cells: a pseudo-element
	   on the row would become an extra table cell and shift the columns. */
	.table-wrap :global(tbody td) {
		background-image: linear-gradient(var(--color-border), var(--color-border));
		background-position: left top;
		background-size: 100% 1px;
		background-repeat: no-repeat;
	}

	.table-wrap :global(tbody td:first-child) {
		background-position: 14px top;
		background-size: calc(100% - 14px) 1px;
	}

	.table-wrap :global(tbody td:last-child) {
		background-size: calc(100% - 14px) 1px;
	}

	.status {
		display: inline-flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 2px;
	}

	.error {
		max-width: 220px;
		overflow: hidden;
		color: var(--color-destructive);
		font-size: 12px;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.actions {
		flex-wrap: nowrap;
		justify-content: flex-end;
	}

	.target {
		min-width: 110px;
	}

	.ticket {
		margin: 0;
		padding: 16px;
		border-radius: 8px;
		background-color: #fff;
		color: #000;
		font-size: 12px;
		line-height: 1.4;
		overflow-x: auto;
	}
</style>
