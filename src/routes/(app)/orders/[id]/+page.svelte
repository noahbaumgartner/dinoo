<script lang="ts">
	import { resolve } from '$app/paths';
	import OrderScreen from '$lib/components/OrderScreen.svelte';
	import { Button, Steps } from '@noahbaumgartner/svelte-ui';
	import { ArrowLeft, Plus } from '@lucide/svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head><title>Bestellung {data.order.orderNumber} · dinoo</title></svelte:head>

<OrderScreen {data}>
	{#snippet header()}
		{#if data.isNew}
			<Steps
				steps={[
					{ label: 'Tisch' },
					{ label: 'Artikel' },
					{ label: 'Abschicken' },
					{ label: 'Abrechnen' }
				]}
				current={data.openCents === 0 ? 4 : 3}
				label="Bestellablauf"
				labels={{ done: 'erledigt', current: 'aktueller Schritt' }}
			/>
		{/if}
		<div class="row nav">
			<Button href={resolve('/orders')} variant="ghost" icon={ArrowLeft}>Meine Bestellungen</Button>
			<Button
				href={resolve('/order')}
				variant={data.openCents === 0 ? 'primary' : 'secondary'}
				icon={Plus}>Neue Bestellung</Button
			>
		</div>
	{/snippet}
</OrderScreen>

<style>
	.nav {
		justify-content: space-between;
	}
</style>
