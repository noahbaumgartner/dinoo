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

	let timeline = $derived(
		data.dashboard.timeline.map((bucket) => ({
			label: time.format(bucket.start),
			value: bucket.revenueCents
		}))
	);
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
