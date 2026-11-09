<script lang="ts">
	import type { Snippet } from 'svelte';

	let { summary, children }: { summary?: Snippet; children?: Snippet } = $props();
</script>

<!-- Sticks to the bottom of the screen, where thumbs are on a phone. -->
<div class="action-bar">
	<div class="action-bar-inner">
		<div class="action-bar-summary">{@render summary?.()}</div>
		{#if children}<div class="action-bar-actions">{@render children()}</div>{/if}
	</div>
</div>

<style>
	.action-bar {
		position: fixed;
		inset: auto 0 0;
		z-index: 20;
		padding: 12px var(--gutter) calc(12px + env(safe-area-inset-bottom));
		border-top: 1px solid var(--color-border);
		background-color: color-mix(in srgb, var(--color-bg) 92%, transparent);
		backdrop-filter: blur(12px);
	}

	.action-bar-inner {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		max-width: var(--content-max-width);
		margin: 0 auto;
	}

	/* Takes the free width, e.g. for tabs that scroll sideways. */
	.action-bar-summary {
		flex: 1;
		min-width: 0;
		font-variant-numeric: tabular-nums;
	}

	.action-bar-actions {
		display: flex;
		flex-shrink: 0;
		gap: 8px;
	}
</style>
