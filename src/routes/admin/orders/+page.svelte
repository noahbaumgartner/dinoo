<script lang="ts">
	import AdminPage from '$lib/components/AdminPage.svelte';
	import OrderFilters from '$lib/components/OrderFilters.svelte';
	import OrderList from '$lib/components/OrderList.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<AdminPage
	title="Bestellungen"
	description="Nach Tisch, Personal oder Bestellnummer suchen. Die neuesten zuerst, höchstens 100."
>
	<OrderFilters values={data.values} tables={data.tables} staff={data.staff} />
	<OrderList orders={data.orders} hrefFor={(id) => `/admin/orders/${id}`} showStaff />
</AdminPage>
