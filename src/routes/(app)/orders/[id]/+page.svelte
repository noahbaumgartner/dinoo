<script lang="ts">
	import { resolve } from '$app/paths';
	import ActionBar from '$lib/components/ActionBar.svelte';
	import OrderScreen from '$lib/components/OrderScreen.svelte';
	import { Button } from '@noahbaumgartner/svelte-ui';
	import { Plus } from '@lucide/svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head><title>Bestellung {data.order.orderNumber} · dinoo</title></svelte:head>

<OrderScreen {data} />

{#if data.openCents === 0}
	<ActionBar>
		{#snippet summary()}
			<strong>Bezahlt</strong>
		{/snippet}
		<Button href={resolve('/order')} size="lg" icon={Plus}>Neue Bestellung</Button>
	</ActionBar>
{/if}
