<script
	lang="ts"
	generics="T extends { id: number; gridRow: number | null; gridColumn: number | null }"
>
	import type { Snippet } from 'svelte';

	type Props = {
		rows: number;
		columns: number;
		/** Tables in the plan; cells without a table stay empty. */
		tables: T[];
		/** Content of a cell that has a table. */
		cell: Snippet<[table: T]>;
		/** Optional handle above each column (e.g. to switch the whole column). */
		columnHandle?: Snippet<[column: number]>;
		/** Optional handle left of each row. */
		rowHandle?: Snippet<[row: number]>;
		label?: string;
		role?: string;
	};

	let {
		rows,
		columns,
		tables,
		cell,
		columnHandle,
		rowHandle,
		label = 'Saalplan',
		role
	}: Props = $props();

	let byCell = $derived(
		new Map(tables.map((table) => [`${table.gridRow}:${table.gridColumn}`, table]))
	);
	let rowNumbers = $derived(Array.from({ length: rows }, (_, index) => index + 1));
	let columnNumbers = $derived(Array.from({ length: columns }, (_, index) => index + 1));
	let handles = $derived(Boolean(columnHandle || rowHandle));
</script>

<div class="scroller">
	<div
		class={['plan', { 'plan--handles': handles }]}
		style:--columns={columns}
		{role}
		aria-label={label}
	>
		{#if handles}
			<span aria-hidden="true"></span>
			{#each columnNumbers as column (column)}
				{#if columnHandle}{@render columnHandle(column)}{:else}<span></span>{/if}
			{/each}
		{/if}
		{#each rowNumbers as row (row)}
			{#if handles}
				{#if rowHandle}{@render rowHandle(row)}{:else}<span></span>{/if}
			{/if}
			{#each columnNumbers as column (column)}
				{@const table = byCell.get(`${row}:${column}`)}
				{#if table}
					{@render cell(table)}
				{:else}
					<span aria-hidden="true"></span>
				{/if}
			{/each}
		{/each}
	</div>
</div>

<style>
	/* White like a Card, so the plan reads as one area on the off-white page. */
	.scroller {
		padding: 12px;
		overflow-x: auto;
		border-radius: 14px;
		background-color: var(--color-fill);
	}

	.plan {
		--tile: var(--table-tile-size, 72px);
		display: grid;
		/* Fixed tile size on every screen; wide plans scroll instead of shrinking. */
		grid-template-columns: repeat(var(--columns), var(--tile));
		grid-auto-rows: var(--tile);
		gap: 6px;
		width: max-content;
	}

	/* Handles: a narrow first column and a low first row. */
	.plan--handles {
		grid-template-columns: 32px repeat(var(--columns), var(--tile));
		grid-template-rows: 32px;
	}
</style>
