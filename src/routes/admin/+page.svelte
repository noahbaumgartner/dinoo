<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { setSearchParams } from '$lib/navigation';
	import AdminPage from '$lib/components/AdminPage.svelte';
	import { formatAmount, formatChf } from '$lib/money';
	import {
		BarChart,
		Card,
		CardContent,
		CardHeader,
		CardTitle,
		LineChart,
		Select,
		Stat,
		Tabs
	} from '@noahbaumgartner/svelte-ui';
	import { Banknote, ShoppingBasket } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const time = new Intl.DateTimeFormat('de-CH', { hour: '2-digit', minute: '2-digit' });
	const count = new Intl.NumberFormat('de-CH');

	let timeline = $derived(
		data.dashboard.timeline.map((bucket) => ({
			label: time.format(bucket.start),
			value: bucket.revenueCents
		}))
	);
	let soldInCategory = $derived(data.dashboard.articles.reduce((sum, a) => sum + a.quantity, 0));

	const setParam = (name: string, value: string) => setSearchParams({ [name]: value || null });

	// The dashboard follows the event live.
	onMount(() => {
		const timer = setInterval(() => invalidateAll(), 30_000);
		return () => clearInterval(timer);
	});
</script>

<AdminPage
	title="Dashboard"
	description="Wie läuft der Anlass? Aktualisiert sich alle 30 Sekunden."
>
	<div class="stats">
		<Stat
			label="Umsatz"
			value={formatChf(data.dashboard.totals.revenueCents)}
			icon={Banknote}
			size="lg"
		/>
		<Stat
			label="Verkaufte Artikel"
			value={count.format(data.dashboard.totals.items)}
			icon={ShoppingBasket}
			size="lg"
		/>
	</div>

	<Card>
		<CardHeader>
			<div class="card-head">
				<CardTitle>Einnahmenverlauf</CardTitle>
				<Tabs
					size="sm"
					label="Intervall"
					value={data.interval}
					options={[
						{ value: '15m', label: '15 Min.' },
						{ value: '30m', label: '30 Min.' },
						{ value: '1h', label: '1 Std.' }
					]}
					onchange={(value) => setParam('interval', value)}
				/>
			</div>
		</CardHeader>
		<CardContent>
			<LineChart
				data={timeline}
				label="Umsatz pro Intervall"
				format={(cents) => formatAmount(cents)}
				height={260}
				labels={{ empty: 'Noch keine Bestellungen', labelColumn: 'Zeit', valueColumn: 'Umsatz' }}
			/>
		</CardContent>
	</Card>

	<Card>
		<CardHeader>
			<div class="card-head">
				<div>
					<CardTitle>Verkaufte Artikel</CardTitle>
					<p class="muted small">
						{count.format(soldInCategory)} Stück{data.categoryId
							? ' in dieser Kategorie'
							: ' total'}
					</p>
				</div>
				<div class="select">
					<Select
						value={data.categoryId === null ? '' : String(data.categoryId)}
						options={[
							{ value: '', label: 'Alle Kategorien' },
							...data.categories.map((c) => ({ value: String(c.id), label: c.name }))
						]}
						aria-label="Kategorie"
						onchange={(value) => setParam('category', value)}
					/>
				</div>
			</div>
		</CardHeader>
		<CardContent>
			<BarChart
				items={data.dashboard.articles.map((article) => ({
					label: article.name,
					value: article.quantity,
					detail: formatChf(article.revenueCents)
				}))}
				label="Verkaufte Artikel nach Stückzahl"
				format={(value) => `${count.format(value)}×`}
				labels={{ empty: 'Noch nichts verkauft' }}
			/>
		</CardContent>
	</Card>
</AdminPage>

<style>
	.stats {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 12px;
	}

	.card-head {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
	}

	.select {
		min-width: 200px;
	}

	.small {
		margin-top: 2px;
		font-size: 13px;
	}
</style>
