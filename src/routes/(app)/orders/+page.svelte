<script lang="ts">
	import OrderFilters from '$lib/components/OrderFilters.svelte';
	import OrderList from '$lib/components/OrderList.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head><title>Meine Bestellungen · dinoo</title></svelte:head>

<div class="stack">
	<div>
		<h1>Meine Bestellungen</h1>
		<p class="muted">Bestellungen, die du aufgenommen hast. Antippen, um weiterzukassieren.</p>
	</div>
	<OrderFilters values={data.values} tables={data.tables} />
	<OrderList orders={data.orders} hrefFor={(id) => `/orders/${id}`} />
</div>

<style>
	h1 {
		font-size: 24px;
	}
</style>
