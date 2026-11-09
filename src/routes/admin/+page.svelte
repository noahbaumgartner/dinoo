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
		Field,
		Input,
		Label,
		LineChart,
		Button,
		Select,
		Stat,
		Tabs
	} from '@noahbaumgartner/svelte-ui';
	import { Banknote, RotateCcw, ShoppingBasket } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const time = new Intl.DateTimeFormat('de-CH', { hour: '2-digit', minute: '2-digit' });
	const count = new Intl.NumberFormat('de-CH');

	let byRevenue = $derived(data.metric === 'revenue');

	// Revenue in Rappen or a count; the other figure is shown as the detail next to each bar.
	const orderCount = (n: number) => `${count.format(n)} ${n === 1 ? 'Bestellung' : 'Bestellungen'}`;
	let timeline = $derived(
		data.dashboard.timeline.map((bucket) => ({
			label: time.format(bucket.start),
			value: byRevenue ? bucket.revenueCents : bucket.orders
		}))
	);
	let articles = $derived(
		data.dashboard.articles
			.map((article) => ({
				label: article.name,
				value: byRevenue ? article.revenueCents : article.quantity,
				detail: byRevenue ? `${count.format(article.quantity)}×` : formatChf(article.revenueCents)
			}))
			.sort((a, b) => b.value - a.value)
	);
	let staff = $derived(
		data.dashboard.staff
			.map((person) => ({
				label: person.name,
				value: byRevenue ? person.revenueCents : person.orders,
				detail: byRevenue ? orderCount(person.orders) : formatChf(person.revenueCents)
			}))
			.sort((a, b) => b.value - a.value)
	);
	// Table labels repeat across areas («A01»), so the area is only named when there are several.
	let severalAreas = $derived(new Set(data.dashboard.tables.map((t) => t.areaName)).size > 1);
	let tables = $derived(
		data.dashboard.tables
			.map((table) => ({
				label: severalAreas && table.areaName ? `${table.label} (${table.areaName})` : table.label,
				value: byRevenue ? table.revenueCents : table.orders,
				detail: byRevenue ? orderCount(table.orders) : formatChf(table.revenueCents)
			}))
			.sort((a, b) => b.value - a.value)
	);
	const formatMetric = (value: number) => (byRevenue ? formatChf(value) : count.format(value));
	let soldInCategory = $derived(data.dashboard.articles.reduce((sum, a) => sum + a.quantity, 0));

	const setParam = (name: string, value: string) => setSearchParams({ [name]: value || null });
	// An empty range field is kept in the URL as «unbounded», so it does not fall back to the default.
	const setBound = (name: 'from' | 'to', value: string) => setSearchParams({ [name]: value });
	const resetRange = () => setSearchParams({ from: null, to: null });

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
	<!-- Not a Card: its overflow clipping would trap the pickers' popovers. -->
	<div class="range-bar">
		<form class="range" onsubmit={(event) => event.preventDefault()}>
			<Field>
				<Label for="range-from">Von</Label>
				<Input
					id="range-from"
					type="datetime-local"
					value={data.range.from}
					max={data.range.to || undefined}
					onchange={(event) => setBound('from', event.currentTarget.value)}
				/>
			</Field>
			<Field>
				<Label for="range-to">Bis</Label>
				<Input
					id="range-to"
					type="datetime-local"
					value={data.range.to}
					min={data.range.from || undefined}
					onchange={(event) => setBound('to', event.currentTarget.value)}
				/>
			</Field>
			<Button
				type="button"
				variant="secondary"
				icon={RotateCcw}
				disabled={data.range.isDefault}
				onclick={resetRange}
			>
				Letzte 6 Stunden
			</Button>
		</form>
		<p class="muted small">
			{#if data.range.isDefault}
				Standardmässig die letzten 6 Stunden bis jetzt. Gilt für alle Zahlen und Diagramme.
			{:else}
				Gilt für alle Zahlen und Diagramme. Ein leeres Feld bedeutet keine Einschränkung.
			{/if}
		</p>
	</div>

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

	<div class="metric">
		<Tabs
			label="Diagramme anzeigen nach"
			value={data.metric}
			options={[
				{ value: 'revenue', label: 'Umsatz' },
				{ value: 'count', label: 'Anzahl' }
			]}
			onchange={(value) => setParam('metric', value === 'revenue' ? '' : value)}
		/>
		<p class="muted small">
			{byRevenue
				? 'Die Diagramme zeigen den Umsatz.'
				: 'Die Diagramme zeigen Anzahlen: Bestellungen, bei den Artikeln Stück.'}
		</p>
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
				label={byRevenue ? 'Umsatz pro Intervall' : 'Bestellungen pro Intervall'}
				format={(value) => (byRevenue ? formatAmount(value) : count.format(value))}
				height={260}
				labels={{
					empty: 'Noch keine Bestellungen',
					labelColumn: 'Zeit',
					valueColumn: byRevenue ? 'Umsatz' : 'Bestellungen'
				}}
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
				items={articles}
				label={byRevenue ? 'Verkaufte Artikel nach Umsatz' : 'Verkaufte Artikel nach Stückzahl'}
				format={(value) => (byRevenue ? formatChf(value) : `${count.format(value)}×`)}
				labels={{ empty: 'Noch nichts verkauft' }}
			/>
		</CardContent>
	</Card>

	<Card>
		<CardHeader>
			<CardTitle>Personal</CardTitle>
			<p class="muted small">Wer hat wie viel eingebracht? Nach aufgenommenen Bestellungen.</p>
		</CardHeader>
		<CardContent>
			<BarChart
				items={staff}
				label={byRevenue ? 'Umsatz pro Person' : 'Bestellungen pro Person'}
				format={formatMetric}
				labels={{ empty: 'Noch keine Bestellungen' }}
			/>
		</CardContent>
	</Card>

	<Card>
		<CardHeader>
			<CardTitle>Tische</CardTitle>
			<p class="muted small">Nur Tische mit Bestellungen im gewählten Zeitraum.</p>
		</CardHeader>
		<CardContent>
			<BarChart
				items={tables}
				label={byRevenue ? 'Umsatz pro Tisch' : 'Bestellungen pro Tisch'}
				format={formatMetric}
				labels={{ empty: 'Noch keine Bestellungen' }}
			/>
		</CardContent>
	</Card>
</AdminPage>

<style>
	.range-bar {
		display: flex;
		flex-direction: column;
		gap: 12px;
		padding: 14px;
		border-radius: 14px;
		background-color: var(--color-fill);
	}

	.range {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-end;
		gap: 12px;
	}

	.range :global(.field) {
		flex: 1 1 200px;
	}

	.metric {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 8px 16px;
	}

	.metric .small {
		margin-top: 0;
	}

	.stats {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 12px;
	}

	/* White like the cards below instead of the off-white page background. */
	.stats :global(.stat) {
		border: none;
		background-color: var(--color-fill);
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
