<script lang="ts">
	import { enhance } from '$app/forms';
	import { beforeNavigate, replaceState } from '$app/navigation';
	import { page } from '$app/state';
	import { untrack } from 'svelte';
	import AdminPage from '$lib/components/AdminPage.svelte';
	import SeatingPlan from '$lib/components/SeatingPlan.svelte';
	import { notify } from '$lib/components/notify';
	import { gridLabel, MAX_GRID_COLUMNS, MAX_GRID_ROWS, type TableNumbering } from '$lib/table-grid';
	import {
		AlertDialog,
		Button,
		Card,
		CardAction,
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
		Tabs
	} from '@noahbaumgartner/svelte-ui';
	import { Eye, EyeOff, LayoutGrid, Pencil, Plus, Power, RotateCcw, Trash2 } from '@lucide/svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	type Area = (typeof data.areas)[number];
	type Table = Area['tables'][number];

	/** A seating plan cell as edited; `label: null` follows the numbering. */
	type DraftCell = { label: string | null; active: boolean };
	type Draft = {
		rows: string;
		columns: string;
		numbering: TableNumbering;
		/** Edited cells by `row:column`, kept when the grid shrinks so growing it restores them. */
		cells: Record<string, DraftCell>;
		/** Active flag of free tables by id; missing ids keep the saved value. */
		free: Record<number, boolean>;
	};

	const key = (row: number, column: number) => `${row}:${column}`;

	function draftFrom({ tables, plan }: Area): Draft {
		const cells: Record<string, DraftCell> = {};
		for (const { gridRow: row, gridColumn: column, label, active } of tables)
			if (row !== null && column !== null)
				cells[key(row, column)] = {
					label: label === gridLabel(plan.numbering, row, column) ? null : label,
					active
				};
		return {
			rows: plan.rows > 0 ? String(plan.rows) : '',
			columns: plan.columns > 0 ? String(plan.columns) : '',
			numbering: plan.numbering,
			cells,
			free: {}
		};
	}

	const draftsFrom = (areas: Area[]) =>
		Object.fromEntries(areas.map((area) => [area.id, draftFrom(area)]));

	/**
	 * One draft per area. Every change stays on this page until «Speichern», which saves all changed
	 * areas at once; switching areas keeps the drafts. «Verwerfen» goes back to the saved state.
	 */
	let drafts = $state<Record<number, Draft>>(untrack(() => draftsFrom(data.areas)));
	const discard = () => (drafts = draftsFrom(data.areas));

	// `?area=<id>` picks the area shown first; the tabs then switch without a request.
	let areaId = $state(untrack(() => Number(page.url.searchParams.get('area')) || data.areas[0].id));
	let area = $derived(data.areas.find((a) => a.id === areaId) ?? data.areas[0]);

	// Areas created or deleted elsewhere on the page: add a draft, drop the old one.
	$effect.pre(() => {
		for (const a of data.areas) if (!untrack(() => drafts[a.id])) drafts[a.id] = draftFrom(a);
		const ids = new Set(data.areas.map((a) => a.id));
		for (const id of Object.keys(untrack(() => drafts)).map(Number))
			if (!ids.has(id)) delete drafts[id];
	});

	let draft = $derived(drafts[area.id] ?? draftFrom(area));

	function showArea(id: number) {
		areaId = id;
		const url = new URL(page.url);
		url.searchParams.set('area', String(id));
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		replaceState(url, {});
	}

	/** A whole number from 1 to `max`, otherwise null. */
	function size(raw: string, max: number): number | null {
		const value = Number(raw.trim());
		return raw.trim() && Number.isInteger(value) && value >= 1 && value <= max ? value : null;
	}

	/** Seating plan with its tables, as it looks after saving; null while the size is invalid. */
	function planOf(state: Draft) {
		const rows = size(state.rows, MAX_GRID_ROWS);
		const columns = size(state.columns, MAX_GRID_COLUMNS);
		if (rows === null || columns === null) return null;
		const tables = [];
		for (let row = 1; row <= rows; row += 1)
			for (let column = 1; column <= columns; column += 1) {
				const cell = state.cells[key(row, column)];
				tables.push({
					id: row * 100 + column,
					gridRow: row,
					gridColumn: column,
					label: cell?.label ?? gridLabel(state.numbering, row, column),
					active: cell?.active ?? true
				});
			}
		return { rows, columns, tables };
	}

	let plan = $derived(planOf(draft));
	let gridTables = $derived(plan?.tables ?? []);
	const freeOf = (a: Area) => a.tables.filter((table) => table.gridRow === null);
	let freeTables = $derived(freeOf(area));
	let freeActive = (table: Table) => draft.free[table.id] ?? table.active;

	/** What «Speichern» sends for one area; equal to the saved one when nothing changed. */
	const payload = (a: Area, state: Draft) => {
		const { rows = 0, columns = 0, tables = [] } = planOf(state) ?? {};
		return JSON.stringify({
			areaId: a.id,
			rows,
			columns,
			numbering: state.numbering,
			cells: tables.map(({ gridRow, gridColumn, label, active }) => ({
				row: gridRow,
				column: gridColumn,
				label,
				active
			})),
			free: freeOf(a).map((table) => ({
				id: table.id,
				active: state.free[table.id] ?? table.active
			}))
		});
	};
	let changed = $derived(
		data.areas.filter((a) => drafts[a.id] && payload(a, drafts[a.id]) !== payload(a, draftFrom(a)))
	);
	let dirty = $derived(changed.length > 0);
	/** Changed areas whose size is not valid yet; saving waits for them. */
	let invalid = $derived(changed.filter((a) => !planOf(drafts[a.id])));
	let json = $derived(`[${changed.map((a) => payload(a, drafts[a.id])).join(',')}]`);

	beforeNavigate(({ cancel, type }) => {
		if (!dirty) return;
		// Leaving the site shows the browser's own dialog
		if (type === 'leave') cancel();
		else if (!confirm('Die Tische haben ungespeicherte Änderungen. Trotzdem verlassen?')) cancel();
	});

	let areaOpen = $state(false);
	/** Whether the area dialog renames the shown area instead of creating one. */
	let areaRenaming = $state(false);
	let areaDeleteOpen = $state(false);
	/** Areas with unsaved changes carry a dot. */
	let areaTabs = $derived(
		data.areas.map((a) => ({
			value: String(a.id),
			label: changed.includes(a) ? `${a.name} •` : a.name
		}))
	);

	/** «Ein/Aus»: a tap switches a table, handles switch rows and columns. «Umbenennen»: inline. */
	let mode = $state<'toggle' | 'rename'>('toggle');

	let rowName = (row: number) =>
		draft.numbering === 'letter' ? String.fromCharCode(64 + row) : String(row);
	let columnName = (column: number) => String(column).padStart(2, '0');
	type Line = { row: number } | { column: number };
	const inLine = (line: Line) =>
		gridTables.filter((table) =>
			'row' in line ? table.gridRow === line.row : table.gridColumn === line.column
		);
	let lineActive = (line: Line) => inLine(line).some((table) => table.active);

	function cellAt(row: number, column: number): DraftCell {
		return (draft.cells[key(row, column)] ??= { label: null, active: true });
	}

	/** Any active table in the line switches the whole line off, otherwise on. */
	function toggleLine(line: Line) {
		const active = !lineActive(line);
		for (const table of inLine(line)) cellAt(table.gridRow, table.gridColumn).active = active;
	}

	function rename(row: number, column: number, input: HTMLInputElement) {
		const label = input.value.trim();
		const cell = cellAt(row, column);
		// An empty name is not allowed; restore it instead of showing an error.
		if (!label) input.value = cell.label ?? gridLabel(draft.numbering, row, column);
		else cell.label = label === gridLabel(draft.numbering, row, column) ? null : label;
	}

	/** Enter moves to the next name like Tab. */
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

	function edit(table: Table | null) {
		editing = table;
		editOpen = true;
	}

	let deleteOpen = $state(false);
	let deleting = $state<Table | null>(null);
</script>

{#snippet lineHandle(line: Line, name: string, short: string)}
	{@const on = lineActive(line)}
	<button
		type="button"
		class={['handle', { 'handle--off': !on }]}
		disabled={mode !== 'toggle'}
		aria-label="{name} {on ? 'ausschalten' : 'einschalten'}"
		title="{name} {on ? 'ausschalten' : 'einschalten'}"
		onclick={() => toggleLine(line)}
	>
		{short}
	</button>
{/snippet}

<AdminPage
	title="Tische"
	description="Der Service wählt beim Bestellen einen Tisch im Tischplan oder einen der weiteren Tische. Inaktive Tische erscheinen nicht."
>
	{#snippet actions()}
		<Button variant="ghost" icon={RotateCcw} disabled={!dirty} onclick={discard}>Verwerfen</Button>
		<!-- After saving, the draft starts again from the saved tables. -->
		<form method="POST" action="?/plan" use:enhance={notify(discard)}>
			<input type="hidden" name="plans" value={json} />
			<Button type="submit" disabled={!dirty || invalid.length > 0}>Speichern</Button>
		</form>
	{/snippet}

	<div class="area-bar">
		{#if data.areas.length > 1}
			<Tabs
				value={String(area.id)}
				options={areaTabs}
				label="Bereich"
				onchange={(value) => showArea(Number(value))}
			/>
		{:else}
			<p class="hint">Mehrere Bereiche (z. B. Saal und Festzelt) haben je einen eigenen Plan.</p>
		{/if}
		<Button
			variant="secondary"
			icon={Plus}
			aria-label="Bereich erfassen"
			onclick={() => ((areaRenaming = false), (areaOpen = true))}>Bereich</Button
		>
	</div>

	<Card>
		<CardHeader>
			<CardTitle>{area.name}</CardTitle>
			<CardDescription
				>Tischplan als Raster aus Zeilen und Spalten; jede Zelle ist ein Tisch. Beim Verkleinern
				werden Tische ausserhalb entfernt (mit Bestellungen: deaktiviert).</CardDescription
			>
			<CardAction>
				<span class="icon-actions">
					<Button
						variant="ghost"
						size="sm"
						icon={Pencil}
						label="Bereich {area.name} umbenennen"
						onclick={() => ((areaRenaming = true), (areaOpen = true))}
					/>
					{#if data.areas.length > 1}
						<Button
							variant="ghost"
							size="sm"
							icon={Trash2}
							label="Bereich {area.name} löschen"
							onclick={() => (areaDeleteOpen = true)}
						/>
					{/if}
				</span>
			</CardAction>
		</CardHeader>
		<CardContent>
			<div class="grid-form">
				<Field>
					<Label for="grid-rows">Zeilen</Label>
					<Input
						id="grid-rows"
						inputmode="numeric"
						placeholder="4"
						bind:value={draft.rows}
						aria-describedby="grid-limits"
					/>
				</Field>
				<Field>
					<Label for="grid-columns">Spalten</Label>
					<Input
						id="grid-columns"
						inputmode="numeric"
						placeholder="6"
						bind:value={draft.columns}
						aria-describedby="grid-limits"
					/>
				</Field>
				<Field class="numbering">
					<Label for="grid-numbering">Nummerierung</Label>
					<Select
						id="grid-numbering"
						bind:value={draft.numbering}
						options={[
							{ value: 'letter', label: 'A01, A02, …' },
							{ value: 'number', label: '101, 102, …' }
						]}
					/>
				</Field>
			</div>
			<p id="grid-limits" class="hint">
				Höchstens {MAX_GRID_ROWS} Zeilen und {MAX_GRID_COLUMNS} Spalten. Änderungen gelten erst nach «Speichern».
			</p>
		</CardContent>
	</Card>

	{#if !plan}
		<EmptyState
			icon={LayoutGrid}
			title={area.plan.rows > 0 ? 'Ungültige Grösse' : 'Noch kein Tischplan'}
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
			<SeatingPlan
				rows={plan.rows}
				columns={plan.columns}
				tables={gridTables}
				label="Tischplan {area.name}"
			>
				{#snippet columnHandle(column)}
					{@render lineHandle({ column }, `Spalte ${columnName(column)}`, columnName(column))}
				{/snippet}
				{#snippet rowHandle(row)}
					{@render lineHandle({ row }, `Zeile ${rowName(row)}`, rowName(row))}
				{/snippet}
				{#snippet cell(table)}
					{#if mode === 'toggle'}
						<button
							type="button"
							class={['cell', { 'cell--inactive': !table.active }]}
							aria-pressed={table.active}
							aria-label="Tisch {table.label}"
							onclick={() => {
								const cell = cellAt(table.gridRow, table.gridColumn);
								cell.active = !cell.active;
							}}
						>
							{table.label}
						</button>
					{:else}
						<input
							class={['cell', 'cell-input', { 'cell--inactive': !table.active }]}
							value={table.label}
							aria-label="Name von Tisch in Zeile {rowName(table.gridRow)}, Spalte {columnName(
								table.gridColumn
							)}"
							autocomplete="off"
							spellcheck="false"
							onfocus={(event) => event.currentTarget.select()}
							onkeydown={nextOnEnter}
							onchange={(event) => rename(table.gridRow, table.gridColumn, event.currentTarget)}
						/>
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
		<p class="hint">Tische dieses Bereichs ausserhalb des Plans, z. B. «Bar».</p>
		{#if freeTables.length > 0}
			<ul class="tables">
				{#each freeTables as table (table.id)}
					{@const active = freeActive(table)}
					<li class={['table', { 'table--inactive': !active }]}>
						<span class="table-label">{table.label}</span>
						{#if !active}<span class="muted status">Inaktiv</span>{/if}
						<span class="icon-actions">
							<Button
								variant="ghost"
								size="sm"
								icon={active ? Eye : EyeOff}
								label={active
									? `Tisch ${table.label} deaktivieren`
									: `Tisch ${table.label} aktivieren`}
								onclick={() => (draft.free[table.id] = !active)}
							/>
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
		{#if editing}
			<input type="hidden" name="id" value={editing.id} />
		{:else}
			<input type="hidden" name="areaId" value={area.id} />
		{/if}
		<Field>
			<Label for="table-label">Bezeichnung</Label>
			<Input
				id="table-label"
				name="label"
				value={editing?.label ?? ''}
				placeholder="z. B. Bar"
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

<Dialog
	bind:open={areaOpen}
	title={areaRenaming ? `Bereich ${area.name}` : 'Bereich erfassen'}
	description={areaRenaming
		? undefined
		: 'Ein Teil des Geländes mit eigenem Tischplan. Beim Bestellen wird zuerst der Bereich gewählt.'}
	closeLabel="Schliessen"
>
	<form
		id="area-form"
		method="POST"
		action="?/saveArea"
		class="stack"
		use:enhance={notify((result) => {
			areaOpen = false;
			// A new area opens right away so its plan can be set up.
			if (typeof result?.areaId === 'number') showArea(result.areaId);
		})}
	>
		{#if areaRenaming}<input type="hidden" name="id" value={area.id} />{/if}
		<Field>
			<Label for="area-name">Name</Label>
			<Input
				id="area-name"
				name="name"
				value={areaRenaming ? area.name : ''}
				placeholder="z. B. Festzelt oder Terrasse"
				required
			/>
		</Field>
	</form>
	{#snippet actions(close)}
		<Button variant="secondary" onclick={close}>Abbrechen</Button>
		<Button type="submit" form="area-form">{areaRenaming ? 'Speichern' : 'Erfassen'}</Button>
	{/snippet}
</Dialog>

<AlertDialog
	bind:open={areaDeleteOpen}
	title="Bereich löschen?"
	description="«{area.name}» wird mit allen seinen Tischen gelöscht. Hat ein Tisch schon Bestellungen, geht das nicht; schalte dann die Tische aus."
>
	{#snippet actions(close)}
		<Button variant="secondary" onclick={close}>Abbrechen</Button>
		<form
			method="POST"
			action="?/deleteArea"
			use:enhance={notify(() => {
				close();
				showArea(data.areas[0].id);
			})}
		>
			<input type="hidden" name="id" value={area.id} />
			<Button type="submit" icon={Trash2}>Löschen</Button>
		</form>
	{/snippet}
</AlertDialog>

<style>
	.area-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
	}

	/* Many areas scroll inside the tabs; the button keeps its size. */
	.area-bar :global(.tabs) {
		min-width: 0;
	}

	.area-bar :global(.button) {
		flex-shrink: 0;
	}

	.area-bar .hint {
		margin: 0;
	}

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

	.cell-input {
		width: 100%;
		text-align: center;
		cursor: text;
	}

	/* One ring while typing: the accent border replaces the focus-visible outline of .cell. */
	.cell.cell-input:focus {
		border-color: var(--color-accent);
		outline: none;
		box-shadow: 0 0 0 1px var(--color-accent);
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
</style>
