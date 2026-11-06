<script lang="ts">
	import { enhance } from '$app/forms';
	import AdminPage from '$lib/components/AdminPage.svelte';
	import { notify } from '$lib/components/notify';
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
		Switch
	} from '@noahbaumgartner/svelte-ui';
	import { LayoutGrid, Plus, Trash2 } from '@lucide/svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	type Table = (typeof data.tables)[number];

	let editOpen = $state(false);
	let editing = $state<Table | null>(null);
	let active = $state(true);

	function edit(table: Table | null) {
		editing = table;
		active = table?.active ?? true;
		editOpen = true;
	}
</script>

<AdminPage
	title="Tische"
	description="Der Service wählt beim Bestellen einen dieser Tische. Inaktive Tische erscheinen nicht."
>
	{#snippet actions()}
		<Button icon={Plus} onclick={() => edit(null)}>Tisch erfassen</Button>
	{/snippet}

	<Card variant="secondary">
		<CardHeader>
			<CardTitle>Mehrere Tische anlegen</CardTitle>
			<CardDescription
				>Nummerierte Tische auf einmal; bestehende Nummern werden übersprungen.</CardDescription
			>
		</CardHeader>
		<CardContent>
			<form method="POST" action="?/range" class="range" use:enhance={notify()}>
				<Field>
					<Label for="range-from">Von</Label>
					<Input id="range-from" name="from" inputmode="numeric" value="1" />
				</Field>
				<Field>
					<Label for="range-to">Bis</Label>
					<Input id="range-to" name="to" inputmode="numeric" value="30" />
				</Field>
				<Button type="submit" icon={Plus}>Anlegen</Button>
			</form>
		</CardContent>
	</Card>

	{#if data.tables.length === 0}
		<EmptyState
			icon={LayoutGrid}
			title="Noch keine Tische"
			description="Lege die Tische des Anlasses an."
		/>
	{:else}
		<ul class="tables">
			{#each data.tables as table (table.id)}
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
				placeholder="z. B. 12, 12a oder Bar"
				required
			/>
		</Field>
		<Field>
			<Label for="table-sort">Reihenfolge</Label>
			<Input
				id="table-sort"
				name="sortOrder"
				inputmode="numeric"
				value={String(editing?.sortOrder ?? data.tables.length + 1)}
			/>
		</Field>
		<Field orientation="horizontal">
			<Switch id="table-active" name="active" bind:checked={active} />
			<Label for="table-active">Aktiv</Label>
		</Field>
	</form>
	{#snippet actions(close)}
		{#if editing}
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
	.range {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-end;
		gap: 12px;
	}

	.range :global(.field) {
		width: 100px;
	}

	.tables {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
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
