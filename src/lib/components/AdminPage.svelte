<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		title,
		description,
		actions,
		children
	}: { title: string; description?: string; actions?: Snippet; children: Snippet } = $props();
</script>

<svelte:head><title>{title} · Admin · dinoo</title></svelte:head>

<div class="page">
	<header class="page-head">
		<div class="title-row">
			<h1>{title}</h1>
			{#if actions}<div class="page-actions">{@render actions()}</div>{/if}
		</div>
		{#if description}<p class="muted">{description}</p>{/if}
	</header>
	{@render children()}
</div>

<style>
	.page {
		display: flex;
		flex-direction: column;
		gap: 24px;
	}

	.page-head {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.title-row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
	}

	h1 {
		font-size: 26px;
	}

	.page-head p {
		max-width: 640px;
	}

	.page-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}
</style>
