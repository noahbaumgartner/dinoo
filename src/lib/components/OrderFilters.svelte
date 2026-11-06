<script lang="ts">
	import { setSearchParams } from '$lib/navigation';
	import { Button, Input, Label, Select } from '@noahbaumgartner/svelte-ui';
	import { RotateCcw, Search } from '@lucide/svelte';

	type Values = { table: string; number: string; staff: string; q: string; status: string };

	let {
		values,
		tables,
		staff
	}: {
		values: Values;
		tables: { id: number; label: string }[];
		/** Only the admin search filters by staff. */
		staff?: { id: string; name: string }[];
	} = $props();

	// Local copies of the URL filters, edited before applying.
	let table = $derived(values.table);
	let number = $derived(values.number);
	let person = $derived(values.staff);
	let q = $derived(values.q);
	let status = $derived(values.status);

	const statusOptions = [
		{ value: '', label: 'Alle' },
		{ value: 'unpaid', label: 'Nicht bezahlt' },
		{ value: 'open', label: 'Offen' },
		{ value: 'partial', label: 'Teilbezahlt' },
		{ value: 'paid', label: 'Bezahlt' }
	];

	function apply(event?: SubmitEvent) {
		event?.preventDefault();
		const optional = (value: string) => value || null;
		// `status` is always set: an explicit «Alle» must not fall back to the page's default filter.
		setSearchParams(
			{
				table: optional(table),
				number: optional(number),
				staff: optional(person),
				q: optional(q),
				status
			},
			true
		);
	}

	function reset() {
		setSearchParams({}, true);
	}
</script>

<form class="filters" role="search" onsubmit={apply}>
	{#if staff}
		<div class="filter filter--wide">
			<Label for="filter-q">Suche</Label>
			<Input id="filter-q" type="search" bind:value={q} placeholder="Bestellnummer oder Name" />
		</div>
	{/if}
	<div class="filter">
		<Label for="filter-number">Bestellnummer</Label>
		<Input id="filter-number" bind:value={number} inputmode="numeric" placeholder="z. B. 42" />
	</div>
	<div class="filter">
		<Label for="filter-table">Tisch</Label>
		<Select
			id="filter-table"
			bind:value={table}
			placeholder="Alle Tische"
			options={[
				{ value: '', label: 'Alle Tische' },
				...tables.map((t) => ({ value: String(t.id), label: t.label }))
			]}
			onchange={() => apply()}
		/>
	</div>
	{#if staff}
		<div class="filter">
			<Label for="filter-staff">Personal</Label>
			<Select
				id="filter-staff"
				bind:value={person}
				placeholder="Alle"
				options={[
					{ value: '', label: 'Alle' },
					...staff.map((s) => ({ value: s.id, label: s.name }))
				]}
				onchange={() => apply()}
			/>
		</div>
	{/if}
	<div class="filter">
		<Label for="filter-status">Zahlung</Label>
		<Select
			id="filter-status"
			bind:value={status}
			options={statusOptions}
			onchange={() => apply()}
		/>
	</div>
	<div class="filter-actions">
		<Button type="submit" icon={Search}>Suchen</Button>
		<Button variant="ghost" icon={RotateCcw} label="Filter zurücksetzen" onclick={reset} />
	</div>
</form>

<style>
	.filters {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
		align-items: end;
		gap: 12px;
	}

	.filter {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.filter--wide {
		grid-column: span 2;
	}

	.filter-actions {
		display: flex;
		gap: 4px;
	}

	@media (max-width: 480px) {
		.filter--wide {
			grid-column: 1 / -1;
		}
	}
</style>
