<script lang="ts">
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<main class="public">
	<div class="public-card">
		<p class="brand">dinoo</p>
		{@render children()}
	</div>
</main>

<style>
	.public {
		display: grid;
		place-items: center;
		min-height: 100dvh;
		padding: var(--gutter);
		background-color: var(--color-bg);
	}

	.public-card {
		display: flex;
		flex-direction: column;
		gap: 20px;
		width: 100%;
		max-width: 400px;
		padding: 28px;
		border: 1px solid var(--color-border);
		border-radius: 16px;
		background-color: var(--color-fill);
	}

	.brand {
		font-size: 22px;
		font-weight: 700;
		letter-spacing: -0.02em;
	}
</style>
