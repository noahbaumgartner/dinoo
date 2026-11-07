<script lang="ts">
	import { enhance } from '$app/forms';
	import { formatChf, parseChf, roundTo5 } from '$lib/money';
	import OrderItems from '$lib/components/OrderItems.svelte';
	import TwintCode from '$lib/components/TwintCode.svelte';
	import { Badge, Button, Drawer, Field, Input, Label } from '@noahbaumgartner/svelte-ui';
	import { Banknote, CircleCheck, QrCode, Smartphone, Undo2, X } from '@lucide/svelte';
	import { SvelteMap } from 'svelte/reactivity';

	type Payment = {
		id: number;
		amountCents: number;
		method: 'cash' | 'twint';
		paidAt: Date;
		paidByName: string;
		canUndo: boolean;
	};

	type Item = {
		id: number;
		quantity: number;
		paidQuantity: number;
		articleName: string;
		priceCents: number;
	};

	let {
		items,
		note,
		totalCents,
		paidCents,
		openCents,
		payments,
		twintQrContent
	}: {
		items: Item[];
		note: string | null;
		totalCents: number;
		paidCents: number;
		openCents: number;
		payments: Payment[];
		twintQrContent: string | null;
	} = $props();

	const time = new Intl.DateTimeFormat('de-CH', { hour: '2-digit', minute: '2-digit' });

	let cashOpen = $state(false);
	let twintOpen = $state(false);
	let submitting = $state(false);
	let received = $state('');

	// Every cash drawer starts with an empty «Erhalten».
	$effect(() => {
		if (!cashOpen) received = '';
	});

	/** Positions picked with «+»: as soon as one is picked, this is a partial payment. */
	const selection = new SvelteMap<number, number>();
	let selectedCents = $derived(
		items.reduce((sum, item) => sum + (selection.get(item.id) ?? 0) * item.priceCents, 0)
	);
	let partial = $derived(selection.size > 0);
	let amountCents = $derived(partial ? selectedCents : openCents);
	let selectionJson = $derived(
		JSON.stringify([...selection].map(([orderItemId, quantity]) => ({ orderItemId, quantity })))
	);
	let receivedCents = $derived(received === '' ? null : parseChf(received));
	let changeCents = $derived(
		amountCents !== null && receivedCents !== null ? roundTo5(receivedCents - amountCents) : null
	);
	let quickAmounts = $derived(
		amountCents === 0
			? []
			: [
					...new Set([
						amountCents,
						...[1000, 2000, 5000, 10000, 20000].filter((v) => v > amountCents)
					])
				].slice(0, 5)
	);

	function submitted() {
		return () => {
			submitting = true;
			return async ({
				result,
				update
			}: {
				result: { type: string };
				update: () => Promise<void>;
			}) => {
				await update();
				submitting = false;
				if (result.type === 'success') {
					cashOpen = false;
					twintOpen = false;
					received = '';
					selection.clear();
				}
			};
		};
	}
</script>

<section class="payment stack" aria-labelledby="payment-title">
	<h2 id="payment-title" class="visually-hidden">Abrechnung</h2>

	<dl class="amounts">
		<div>
			<dt>Total</dt>
			<dd>{formatChf(totalCents)}</dd>
		</div>
		<div>
			<dt>Bezahlt</dt>
			<dd>{formatChf(paidCents)}</dd>
		</div>
		<div class="amounts-open">
			<dt>Offen</dt>
			<dd>{formatChf(openCents)}</dd>
		</div>
	</dl>

	{#if openCents === 0}
		<div class="paid" role="status">
			<CircleCheck size={28} aria-hidden="true" />
			<div>
				<strong>Bezahlt</strong>
				<p class="muted">Die Bestellung ist vollständig abgerechnet.</p>
			</div>
		</div>
	{/if}

	<OrderItems {items} {totalCents} {note} selection={openCents > 0 ? selection : undefined} />

	{#if openCents === 0}
		<!-- Paid: nothing left to choose. -->
	{:else}
		{#if partial}
			<div class="partial accent-bar">
				<span>Teilzahlung <strong class="tabular">{formatChf(selectedCents)}</strong></span>
				<Button variant="ghost" size="sm" icon={X} onclick={() => selection.clear()}
					>Aufheben</Button
				>
			</div>
		{/if}
		<div class="methods">
			<Button size="lg" icon={Banknote} onclick={() => (cashOpen = true)}>Bar</Button>
			<Button
				size="lg"
				variant="secondary"
				icon={QrCode}
				disabled={!twintQrContent}
				onclick={() => (twintOpen = true)}>TWINT</Button
			>
		</div>
	{/if}

	{#if payments.length > 0}
		<div class="stack">
			<h3 class="payments-title">Zahlungen</h3>
			<ul class="payments">
				{#each payments as payment (payment.id)}
					<li>
						<span class="row">
							{#if payment.method === 'cash'}
								<Badge icon={Banknote}>Bar</Badge>
							{:else}
								<Badge icon={Smartphone}>TWINT</Badge>
							{/if}
							<span class="muted small">{time.format(payment.paidAt)} · {payment.paidByName}</span>
						</span>
						<span class="row">
							<strong class="tabular">{formatChf(payment.amountCents)}</strong>
							{#if payment.canUndo}
								<form method="POST" action="?/undo" use:enhance>
									<input type="hidden" name="paymentId" value={payment.id} />
									<Button
										type="submit"
										variant="ghost"
										size="sm"
										icon={Undo2}
										label="Zahlung rückgängig machen"
									/>
								</form>
							{/if}
						</span>
					</li>
				{/each}
			</ul>
		</div>
	{/if}
</section>

<Drawer
	bind:open={cashOpen}
	title={partial ? 'Teilzahlung bar' : 'Bar bezahlen'}
	closeLabel="Schliessen"
>
	<div class="cash stack">
		<div class="cash-due">
			<span class="muted">Zu bezahlen</span>
			<strong class="tabular">{formatChf(amountCents)}</strong>
		</div>
		<div class="quick" role="group" aria-label="Erhaltener Betrag">
			{#each quickAmounts as value (value)}
				<Button
					variant={receivedCents === value ? 'primary' : 'secondary'}
					onclick={() => (received = (value / 100).toFixed(2))}
					>{value === amountCents ? 'Passend' : formatChf(value)}</Button
				>
			{/each}
		</div>
		<Field>
			<Label for="received">Erhalten</Label>
			<Input
				id="received"
				bind:value={received}
				inputmode="decimal"
				autocomplete="off"
				placeholder="0.00"
			/>
		</Field>
		<div class={['cash-change', { 'cash-change--short': (changeCents ?? 0) < 0 }]}>
			<span>{(changeCents ?? 0) < 0 ? 'Fehlt noch' : 'Rückgeld'}</span>
			<output class="tabular" aria-live="polite"
				>{changeCents === null ? '–' : formatChf(Math.abs(changeCents))}</output
			>
		</div>
	</div>
	{#snippet actions(close)}
		<Button variant="secondary" size="lg" onclick={close}>Abbrechen</Button>
		<form method="POST" action="?/pay" use:enhance={submitted()}>
			<input type="hidden" name="items" value={selectionJson} />
			<input type="hidden" name="method" value="cash" />
			<Button
				type="submit"
				size="lg"
				icon={CircleCheck}
				loading={submitting}
				disabled={changeCents !== null && changeCents < 0}>Bar bezahlt</Button
			>
		</form>
	{/snippet}
</Drawer>

{#if twintQrContent}
	<Drawer
		bind:open={twintOpen}
		title="Mit TWINT bezahlen"
		description="QR-Code mit der TWINT-App scannen und den Betrag eingeben."
		closeLabel="Schliessen"
	>
		<div class="twint stack">
			<TwintCode content={twintQrContent} />
			<p class="twint-amount tabular">{formatChf(amountCents)}</p>
		</div>
		{#snippet actions(close)}
			<Button variant="secondary" size="lg" onclick={close}>Abbrechen</Button>
			<form method="POST" action="?/pay" use:enhance={submitted()}>
				<input type="hidden" name="items" value={selectionJson} />
				<input type="hidden" name="method" value="twint" />
				<Button type="submit" size="lg" icon={CircleCheck} loading={submitting}
					>TWINT bezahlt</Button
				>
			</form>
		{/snippet}
	</Drawer>
{/if}

<style>
	.amounts {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 8px;
		margin: 0;
	}

	.amounts div {
		padding: 12px;
		border-radius: var(--radius);
		background-color: var(--color-surface);
	}

	.amounts dt {
		color: var(--color-text-muted);
		font-size: 13px;
	}

	.amounts dd {
		margin: 2px 0 0;
		font-size: clamp(14px, 4vw, 17px);
		white-space: nowrap;
		font-weight: 600;
		font-variant-numeric: tabular-nums;
	}

	.amounts .amounts-open {
		background-color: var(--color-accent);
		color: var(--color-accent-foreground);
	}

	.amounts .amounts-open dt {
		color: inherit;
		opacity: 0.75;
	}

	.amounts .amounts-open dd {
		font-size: clamp(16px, 5vw, 22px);
	}

	.methods {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 8px;
	}

	.methods :global(.button) {
		min-height: 56px;
		font-size: 17px;
	}

	.small {
		font-size: 13px;
	}

	.partial {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
		padding: 4px 0 4px 16px;
		--accent-bar-inset: 4px;
	}

	.paid {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 16px;
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
	}

	.cash {
		font-size: 15px;
	}

	.cash-due {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
	}

	.cash-due strong {
		font-size: 26px;
	}

	.quick {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}

	.cash-change {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		font-size: 18px;
		padding: 12px 14px;
		border-radius: var(--radius);
		background-color: var(--color-surface);
		font-weight: 600;
	}

	.cash-change output {
		font-size: 30px;
	}

	.cash-change--short {
		color: var(--color-destructive);
	}

	.payments-title {
		font-size: 15px;
	}

	.payments {
		display: flex;
		flex-direction: column;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.payments li {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
		min-height: 44px;
		border-bottom: 1px solid var(--color-border);
	}

	.twint {
		align-items: center;
	}

	.twint-amount {
		font-size: 32px;
		font-weight: 700;
	}
</style>
