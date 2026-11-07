<script lang="ts">
	import { enhance } from '$app/forms';
	import AdminPage from '$lib/components/AdminPage.svelte';
	import SeatingPlan from '$lib/components/SeatingPlan.svelte';
	import { notify } from '$lib/components/notify';
	import { MAX_GRID_COLUMNS, MAX_GRID_ROWS, type TableNumbering } from '$lib/table-grid';
	import {
		Button,
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle,
		Dialog,
		EmptyState,
		Field,
		Input,
		Label,
		Select,
		Switch
	} from '@noahbaumgartner/svelte-ui';
	import { Check, LayoutGrid, Plus, Trash2 } from '@lucide/svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	type Table = (typeof data.tables)[number];

	let gridTables = $derived(data.tables.filter((table) => table.gridRow !== null));
	let freeTables = $derived(data.tables.filter((table) => table.gridRow === null));

	// svelte-ignore state_referenced_locally
	let numbering = $state<TableNumbering>(data.plan.numbering);

	let editOpen = $state(false);
	let editing = $state<Table | null>(null);
	let active = $state(true);
	let editingGrid = $derived(editing !== null && editing.gridRow !== null);

	function edit(table: Table | null) {
		editing = table;
		active = table?.active ?? true;
		editOpen = true;
	}
</script>

<AdminPage
	title="Tische"
	description="Der Service wählt beim Bestellen einen Tisch im Saalplan oder einen der weiteren Tische. Inaktive Tische erscheinen nicht."
>
	<Card>
		<CardHeader>
			<CardTitle>Saalplan</CardTitle>
			<CardDescription
				>Raster aus Zeilen und Spalten; jede Zelle ist ein Tisch. Beim Verkleinern werden Tische
				ausserhalb entfernt (mit Bestellungen: deaktiviert).</CardDescription
			>
		</CardHeader>
		<CardContent>
			<form method="POST" action="?/grid" class="grid-form" use:enhance={notify()}>
				<Field>
					<Label for="grid-rows">Zeilen</Label>
					<Input
						id="grid-rows"
						name="rows"
						inputmode="numeric"
						value={String(data.plan.rows || 4)}
						aria-describedby="grid-limits"
					/>
				</Field>
				<Field>
					<Label for="grid-columns">Spalten</Label>
					<Input
						id="grid-columns"
						name="columns"
						inputmode="numeric"
						value={String(data.plan.columns || 6)}
						aria-describedby="grid-limits"
					/>
				</Field>
				<Field class="numbering">
					<Label for="grid-numbering">Nummerierung</Label>
					<Select
						id="grid-numbering"
						name="numbering"
						bind:value={numbering}
						options={[
							{ value: 'letter', label: 'A01, A02, …' },
							{ value: 'number', label: '101, 102, …' }
						]}
					/>
				</Field>
				<Button type="submit" icon={Check}
					>{data.plan.rows > 0 ? 'Übernehmen' : 'Saalplan anlegen'}</Button
				>
			</form>
			<p id="grid-limits" class="hint">
				Höchstens {MAX_GRID_ROWS} Zeilen und {MAX_GRID_COLUMNS} Spalten.
			</p>
		</CardContent>
	</Card>

	{#if gridTables.length === 0}
		<EmptyState
			icon={LayoutGrid}
			title="Noch kein Saalplan"
			description="Gib oben Zeilen und Spalten an. Tippe danach einen Tisch an, um ihn umzubenennen oder zu deaktivieren (z. B. für einen Gang)."
		/>
	{:else}
		<section class="stack-sm" aria-labelledby="plan-heading">
			<h2 id="plan-heading">Plan</h2>
			<p class="hint">
				Tisch antippen zum Umbenennen oder Deaktivieren. Deaktivierte Tische sind Lücken im Plan.
			</p>
			<SeatingPlan rows={data.plan.rows} columns={data.plan.columns} tables={gridTables}>
				{#snippet cell(table)}
					<button
						type="button"
						class={['cell', { 'cell--inactive': !table.active }]}
						onclick={() => edit(table)}
						aria-label="Tisch {table.label} bearbeiten{table.active ? '' : ' (inaktiv)'}"
					>
						{table.label}
					</button>
				{/snippet}
			</SeatingPlan>
		</section>
	{/if}

	<section class="stack-sm" aria-labelledby="free-heading">
		<div class="heading-row">
			<h2 id="free-heading">Weitere Tische</h2>
			<Button variant="secondary" icon={Plus} onclick={() => edit(null)}>Tisch erfassen</Button>
		</div>
		{#if freeTables.length === 0}
			<p class="hint">Tische ausserhalb des Saalplans, z. B. «Bar» oder «Terrasse».</p>
		{:else}
			<ul class="tables">
				{#each freeTables as table (table.id)}
					<li class={['table', { 'table--inactive': !table.active }]}>
						<button
							type="button"
							class="label"
							onclick={() => edit(table)}
							aria-label="Tisch {table.label} bearbeiten"
						>
							{table.label}
						</button>
						<form method="POST" action="?/toggle" use:enhance={notify()}>
							<input type="hidden" name="id" value={table.id} />
							<input type="hidden" name="active" value={String(!table.active)} />
							<Switch
								checked={table.active}
								aria-label="Tisch {table.label} aktiv"
								onchange={(event) => event.currentTarget.form?.requestSubmit()}
							/>
						</form>
					</li>
				{/each}
			</ul>
		{/if}
	</section>
</AdminPage>

<Dialog
	bind:open={editOpen}
	title={editing ? `Tisch ${editing.label}` : 'Tisch erfassen'}
	closeLabel="Schliessen"
>
	<form
		id="table-form"
		method="POST"
		action="?/save"
		class="stack"
		use:enhance={notify(() => (editOpen = false))}
	>
		{#if editing}<input type="hidden" name="id" value={editing.id} />{/if}
		{#if editingGrid && editing}
			<p class="hint">Zeile {editing.gridRow}, Spalte {editing.gridColumn} im Saalplan.</p>
		{/if}
		<Field>
			<Label for="table-label">Bezeichnung</Label>
			<Input
				id="table-label"
				name="label"
				value={editing?.label ?? ''}
				placeholder={editingGrid ? 'z. B. A01 oder VIP' : 'z. B. Bar oder Terrasse'}
				required
			/>
		</Field>
		{#if editingGrid}
			<input type="hidden" name="sortOrder" value={editing?.sortOrder ?? 0} />
		{:else}
			<Field>
				<Label for="table-sort">Reihenfolge</Label>
				<Input
					id="table-sort"
					name="sortOrder"
					inputmode="numeric"
					value={String(editing?.sortOrder ?? freeTables.length + 1)}
				/>
			</Field>
		{/if}
		<Field orientation="horizontal">
			<Switch id="table-active" name="active" bind:checked={active} />
			<Label for="table-active">Aktiv</Label>
		</Field>
	</form>
	{#snippet actions(close)}
		{#if editing && !editingGrid}
			<form method="POST" action="?/delete" use:enhance={notify(close)} class="delete">
				<input type="hidden" name="id" value={editing.id} />
				<Button type="submit" variant="ghost" icon={Trash2}>Löschen</Button>
			</form>
		{/if}
		<Button variant="secondary" onclick={close}>Abbrechen</Button>
		<Button type="submit" form="table-form">Speichern</Button>
	{/snippet}
</Dialog>

<style>
	.grid-form {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-end;
		gap: 12px;
	}

	.grid-form :global(.field) {
		width: 90px;
	}

	.grid-form :global(.field.numbering) {
		width: 170px;
	}

	.hint {
		margin: 8px 0 0;
		color: var(--color-text-muted);
		font-size: 14px;
	}

	.stack-sm {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	h2 {
		margin: 0;
		font-size: 18px;
	}

	.heading-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
	}

	.cell {
		min-width: 0;
		padding: 4px;
		overflow: hidden;
		overflow-wrap: anywhere;
		line-height: 1.1;
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		background-color: var(--color-bg);
		color: var(--color-text);
		font: inherit;
		font-size: 16px;
		font-weight: 600;
		cursor: pointer;
		touch-action: manipulation;
	}

	.cell:hover {
		background-color: var(--color-surface);
	}

	.cell--inactive {
		border-style: dashed;
		background-color: transparent;
		color: var(--color-text-muted);
		text-decoration: line-through;
		font-weight: 400;
	}

	.tables {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
		gap: 8px;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.table {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
		padding: 8px 8px 8px 4px;
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
	}

	.table--inactive {
		background-color: var(--color-surface);
	}

	.table--inactive .label {
		color: var(--color-text-muted);
		text-decoration: line-through;
	}

	.label {
		flex: 1;
		padding: 6px;
		border: none;
		border-radius: 6px;
		background: none;
		color: var(--color-text);
		font: inherit;
		font-size: 18px;
		font-weight: 600;
		text-align: left;
		cursor: pointer;
	}

	.label:hover {
		background-color: var(--color-surface);
	}

	.delete {
		margin-right: auto;
	}
</style>
