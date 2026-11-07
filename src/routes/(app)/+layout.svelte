<script lang="ts">
	import AppHeader from '$lib/components/AppHeader.svelte';
	import { provideFocusMode } from '$lib/focus-mode.svelte';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();

	const focusMode = provideFocusMode();

	let items = $derived([
		{ href: '/order', label: 'Bestellen' },
		{ href: '/orders', label: 'Meine Bestellungen' },
		...(data.user.role === 'admin' ? [{ href: '/admin', label: 'Admin' }] : [])
	]);
</script>

<div class="app">
	<AppHeader
		{items}
		userName={data.user.name}
		userRole={data.user.role}
		subtitle={data.eventName ?? undefined}
		focus={focusMode.current}
	/>

	<main class="app-main">
		{@render children()}
	</main>
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100dvh;
	}

	.app-main {
		width: 100%;
		max-width: calc(var(--content-max-width) + 2 * var(--gutter));
		margin: 0 auto;
		padding: 16px var(--gutter) 120px;
	}

	/* A page with a .fill-viewport element gets exactly the screen height and scrolls inside. */
	.app:has(:global(.fill-viewport)) {
		height: 100dvh;
	}

	.app:has(:global(.fill-viewport)) .app-main {
		display: flex;
		flex: 1;
		flex-direction: column;
		min-height: 0;
		padding-bottom: var(--gutter);
	}
</style>
