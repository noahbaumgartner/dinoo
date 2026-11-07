<script lang="ts">
	import { enhance } from '$app/forms';
	import AdminPage from '$lib/components/AdminPage.svelte';
	import SeatingPlan from '$lib/components/SeatingPlan.svelte';
	import { inPlace, notify } from '$lib/components/notify';
	import { MAX_GRID_COLUMNS, MAX_GRID_ROWS, type TableNumbering } from '$lib/table-grid';
	import {
		AlertDialog,
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
		Switch,
		Tabs
	} from '@noahbaumgartner/svelte-ui';
	import { Check, Eye, EyeOff, LayoutGrid, Pencil, Plus, Power, Trash2 } from '@lucide/svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	type Table = (typeof data.tables)[number];

	let gridTables = $derived(data.tables.filter((table) => table.gridRow !== null));
	let freeTables = $derived(data.tables.filter((table) => table.gridRow === null));

	// svelte-ignore state_referenced_locally
	let numbering = $state<TableNumbering>(data.plan.numbering);

	/** «Ein/Aus»: a tap switches a table, handles switch rows and columns. «Umbenennen»: inline. */
	let mode = $state<'toggle' | 'rename'>('toggle');

	let rowName = (row: number) =>
		data.plan.numbering === 'letter' ? String.fromCharCode(64 + row) : String(row);
	let columnName = (column: number) => String(column).padStart(2, '0');
	let lineActive = (line: { row: number } | { column: number }) =>
		gridTables.some(
			(table) =>
				table.active &&
				('row' in line ? table.gridRow === line.row : table.gridColumn === line.column)
		);

	/** Enter moves to the next name like Tab; leaving a changed field saves it. */
	function nextOnEnter(event: KeyboardEvent & { currentTarget: HTMLInputElement }) {
		if (event.key !== 'Enter') return;
		event.preventDefault();
		const inputs = [...document.querySelectorAll<HTMLInputElement>('.cell-input')];
		const next = inputs[inputs.indexOf(event.currentTarget) + 1];
		if (next) {
			next.focus();
			next.select();
		} else event.currentTarget.blur();
	}

	let editOpen = $state(false);
	let editing = $state<Table | null>(null);
	let active = $state(true);

	function edit(table: Table | null) {
		editing = table;
		active = table?.active ?? true;
		editOpen = true;
	}

	let deleteOpen = $state(false);
	let deleting = $state<Table | null>(null);
</script>

{#snippet lineHandle(line: { row: number } | { column: number }, name: string, short: string)}
	{@const on = lineActive(line)}
	<form method="POST" action="?/line" class="handle-form" use:enhance={inPlace()}>
		{#if 'row' in line}
			<input type="hidden" name="row" value={line.row} />
		{:else}
			<input type="hidden" name="column" value={line.column} />
		{/if}
		<button
			type="submit"
			class={['handle', { 'handle--off': !on }]}
			disabled={mode !== 'toggle'}
			aria-label="{name} {on ? 'ausschalten' : 'einschalten'}"
			title="{name} {on ? 'ausschalten' : 'einschalten'}"
		>
			{short}
		</button>
	</form>
{/snippet}

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
			description="Gib oben Zeilen und Spalten an. Danach kannst du Tische, ganze Zeilen und Spalten ausschalten (z. B. für einen Gang) und Tische umbenennen."
		/>
	{:else}
		<section class="stack-sm" aria-labelledby="plan-heading">
			<div class="heading-row">
				<h2 id="plan-heading">Plan</h2>
				<Tabs
					bind:value={mode}
					label="Bearbeitung"
					size="sm"
					options={[
						{ value: 'toggle', label: 'Ein/Aus', icon: Power },
						{ value: 'rename', label: 'Umbenennen', icon: Pencil }
					]}
				/>
			</div>
			<p class="hint">
				{#if mode === 'toggle'}
					Tisch antippen schaltet ihn ein oder aus; die Griffe oben und links schalten eine ganze
					Spalte oder Zeile. Ausgeschaltete Tische sind Lücken im Plan.
				{:else}
					Namen direkt ändern; Enter springt zum nächsten Tisch.
				{/if}
			</p>
			<SeatingPlan rows={data.plan.rows} columns={data.plan.columns} tables={gridTables}>
				{#snippet columnHandle(column)}
					{@render lineHandle({ column }, `Spalte ${columnName(column)}`, columnName(column))}
				{/snippet}
				{#snippet rowHandle(row)}
					{@render lineHandle({ row }, `Zeile ${rowName(row)}`, rowName(row))}
				{/snippet}
				{#snippet cell(table)}
					{#if mode === 'toggle'}
						<form method="POST" action="?/toggle" class="cell-form" use:enhance={inPlace()}>
							<input type="hidden" name="id" value={table.id} />
							<input type="hidden" name="active" value={String(!table.active)} />
							<button
								type="submit"
								class={['cell', { 'cell--inactive': !table.active }]}
								aria-pressed={table.active}
								aria-label="Tisch {table.label}"
							>
								{table.label}
							</button>
						</form>
					{:else}
						<form method="POST" action="?/rename" class="cell-form" use:enhance={inPlace()}>
							<input type="hidden" name="id" value={table.id} />
							<input
								class={['cell', 'cell-input', { 'cell--inactive': !table.active }]}
								name="label"
								value={table.label}
								aria-label="Name von Tisch in Zeile {rowName(table.gridRow!)}, Spalte {columnName(
									table.gridColumn!
								)}"
								autocomplete="off"
								spellcheck="false"
								onfocus={(event) => event.currentTarget.select()}
								onkeydown={nextOnEnter}
								onchange={(event) => {
									const input = event.currentTarget;
									// An empty name is not allowed; restore it instead of showing an error.
									if (!input.value.trim()) input.value = table.label;
									else input.form?.requestSubmit();
								}}
							/>
						</form>
					{/if}
				{/snippet}
			</SeatingPlan>
		</section>
	{/if}

	<section class="stack-sm" aria-labelledby="free-heading">
		<div class="heading-row">
			<h2 id="free-heading">Weitere Tische</h2>
			<Button variant="secondary" icon={Plus} onclick={() => edit(null)}>Tisch erfassen</Button>
		</div>
		<p class="hint">Tische ausserhalb des Saalplans, z. B. «Bar» oder «Terrasse».</p>
		{#if freeTables.length > 0}
			<ul class="tables">
				{#each freeTables as table (table.id)}
					<li class={['table', { 'table--inactive': !table.active }]}>
						<span class="table-label">{table.label}</span>
						{#if !table.active}<span class="muted status">Inaktiv</span>{/if}
						<span class="icon-actions">
							<form method="POST" action="?/toggle" use:enhance={inPlace()} class="toggle">
								<input type="hidden" name="id" value={table.id} />
								<input type="hidden" name="active" value={String(!table.active)} />
								<Button
									type="submit"
									variant="ghost"
									size="sm"
									icon={table.active ? Eye : EyeOff}
									label={table.active
										? `Tisch ${table.label} deaktivieren`
										: `Tisch ${table.label} aktivieren`}
								/>
							</form>
							<Button
								variant="ghost"
								size="sm"
								icon={Pencil}
								label="Tisch {table.label} bearbeiten"
								onclick={() => edit(table)}
							/>
							<Button
								variant="ghost"
								size="sm"
								icon={Trash2}
								label="Tisch {table.label} löschen"
								onclick={() => ((deleting = table), (deleteOpen = true))}
							/>
						</span>
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
		<Field>
			<Label for="table-label">Bezeichnung</Label>
			<Input
				id="table-label"
				name="label"
				value={editing?.label ?? ''}
				placeholder="z. B. Bar oder Terrasse"
				required
			/>
		</Field>
		<Field>
			<Label for="table-sort">Reihenfolge</Label>
			<Input
				id="table-sort"
				name="sortOrder"
				inputmode="numeric"
				value={String(editing?.sortOrder ?? freeTables.length + 1)}
			/>
		</Field>
		<Field orientation="horizontal">
			<Switch id="table-active" name="active" bind:checked={active} />
			<Label for="table-active">Aktiv</Label>
		</Field>
	</form>
	{#snippet actions(close)}
		<Button variant="secondary" onclick={close}>Abbrechen</Button>
		<Button type="submit" form="table-form">Speichern</Button>
	{/snippet}
</Dialog>

<AlertDialog
	bind:open={deleteOpen}
	title="Tisch löschen?"
	description="«{deleting?.label}» wird gelöscht. Hat der Tisch schon Bestellungen, wird er nur deaktiviert."
>
	{#snippet actions(close)}
		<Button variant="secondary" onclick={close}>Abbrechen</Button>
		<form method="POST" action="?/delete" use:enhance={notify(close)}>
			<input type="hidden" name="id" value={deleting?.id} />
			<Button type="submit" icon={Trash2}>Löschen</Button>
		</form>
	{/snippet}
</AlertDialog>

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

	.cell-form,
	.handle-form {
		display: contents;
	}

	.cell-input {
		width: 100%;
		text-align: center;
		cursor: text;
	}

	.cell-input:focus {
		border-color: var(--color-accent);
		outline: none;
	}

	.handle {
		display: grid;
		place-items: center;
		min-width: 0;
		padding: 0;
		border: none;
		border-radius: 8px;
		background: none;
		color: var(--color-text-secondary);
		font: inherit;
		font-size: 13px;
		font-weight: 600;
		cursor: pointer;
		touch-action: manipulation;
	}

	.handle:hover:not(:disabled) {
		background-color: var(--color-surface);
		color: var(--color-text);
	}

	.handle:disabled {
		cursor: default;
	}

	.handle--off {
		color: var(--color-text-muted);
		text-decoration: line-through;
	}

	.cell:focus-visible,
	.handle:focus-visible {
		outline: 2px solid var(--color-accent);
		outline-offset: 2px;
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

	/* White like the seating plan above, rows divided like the article list in the menu. */
	.tables {
		display: flex;
		flex-direction: column;
		margin: 0;
		padding: 4px 16px;
		border-radius: 14px;
		background-color: var(--color-fill);
		list-style: none;
	}

	.table {
		display: flex;
		align-items: center;
		gap: 12px;
		min-height: 52px;
	}

	.table + .table {
		border-top: 1px solid var(--color-border);
	}

	.table-label {
		flex: 1;
		min-width: 0;
		overflow-wrap: anywhere;
		font-weight: 600;
	}

	.table--inactive .table-label {
		color: var(--color-text-muted);
	}

	.status {
		font-size: 13px;
	}

	.toggle {
		display: flex;
	}
</style>
