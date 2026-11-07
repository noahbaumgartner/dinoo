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
		label?: string;
		role?: string;
	};

	let { rows, columns, tables, cell, label = 'Saalplan', role }: Props = $props();

	let byCell = $derived(
		new Map(tables.map((table) => [`${table.gridRow}:${table.gridColumn}`, table]))
	);
	let positions = $derived(
		Array.from({ length: rows * columns }, (_, index) => ({
			row: Math.floor(index / columns) + 1,
			column: (index % columns) + 1
		}))
	);
</script>

<div class="scroller">
	<div class="plan" style:--columns={columns} {role} aria-label={label}>
		{#each positions as { row, column } (`${row}:${column}`)}
			{@const table = byCell.get(`${row}:${column}`)}
			{#if table}
				{@render cell(table)}
			{:else}
				<span class="gap" aria-hidden="true"></span>
			{/if}
		{/each}
	</div>
</div>

<style>
	.scroller {
		margin-inline: calc(-1 * var(--gutter, 0px));
		padding-inline: var(--gutter, 0px);
		padding-bottom: 8px;
		overflow-x: auto;
	}

	.plan {
		display: grid;
		/* Fixed tile size on every screen; wide plans scroll instead of shrinking. */
		grid-template-columns: repeat(var(--columns), var(--table-tile-size, 72px));
		grid-auto-rows: var(--table-tile-size, 72px);
		gap: 6px;
		width: max-content;
	}

	.gap {
		aspect-ratio: 1;
	}
</style>
