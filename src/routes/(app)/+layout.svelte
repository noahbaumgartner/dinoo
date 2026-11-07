<script lang="ts">
	import AppHeader from '$lib/components/AppHeader.svelte';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();

	let items = $derived([
		{ href: '/order', label: 'Bestellen' },
		{ href: '/orders', label: 'Meine Bestellungen' },
		...(data.user.role === 'admin' ? [{ href: '/admin', label: 'Admin' }] : [])
	]);
</script>

<AppHeader
	{items}
	userName={data.user.name}
	userRole={data.user.role}
	subtitle={data.eventName ?? undefined}
/>

<main class="app-main">
	{@render children()}
</main>

<style>
	.app-main {
		width: 100%;
		max-width: calc(var(--content-max-width) + 2 * var(--gutter));
		margin: 0 auto;
		padding: 16px var(--gutter) 120px;
	}
</style>
