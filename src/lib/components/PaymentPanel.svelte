<script lang="ts">
	import { enhance } from '$app/forms';
	import { formatChf, parseChf, roundTo5 } from '$lib/money';
	import TwintCode from '$lib/components/TwintCode.svelte';
	import {
		Badge,
		Button,
		Dialog,
		Field,
		FieldDescription,
		Input,
		Label,
		Numpad,
		toast
	} from '@noahbaumgartner/svelte-ui';
	import { Banknote, CircleCheck, QrCode, Smartphone, Undo2 } from '@lucide/svelte';

	type Payment = {
		id: number;
		amountCents: number;
		method: 'cash' | 'twint';
		paidAt: Date;
		paidByName: string;
		canUndo: boolean;
	};

	let {
		totalCents,
		paidCents,
		openCents,
		payments,
		twintQrContent
	}: {
		totalCents: number;
		paidCents: number;
		openCents: number;
		payments: Payment[];
		twintQrContent: string | null;
	} = $props();

	const time = new Intl.DateTimeFormat('de-CH', { hour: '2-digit', minute: '2-digit' });

	let mode = $state<'choose' | 'cash'>('choose');
	let twintOpen = $state(false);
	let submitting = $state(false);
	const toInput = (cents: number) => (cents / 100).toFixed(2);

	/**
	 * Editable for splitting. Reset only when the open amount really changes (after a payment), not
	 * on every reload of the page data, which happens while tickets are printing.
	 */
	// svelte-ignore state_referenced_locally
	let amountInput = $state(toInput(openCents));
	// svelte-ignore state_referenced_locally
	let lastOpenCents = openCents;
	$effect.pre(() => {
		if (openCents === lastOpenCents) return;
		lastOpenCents = openCents;
		amountInput = toInput(openCents);
	});
	let received = $state('');

	let amountCents = $derived(parseChf(amountInput));
	let amountValid = $derived(amountCents !== null && amountCents > 0 && amountCents <= openCents);
	let receivedCents = $derived(received === '' ? null : parseChf(received));
	let changeCents = $derived(
		amountCents !== null && receivedCents !== null ? roundTo5(receivedCents - amountCents) : null
	);
	let quickAmounts = $derived(
		amountCents === null
			? []
			: [
					...new Set([
						amountCents,
						...[1000, 2000, 5000, 10000, 20000].filter((v) => v > amountCents)
					])
				].slice(0, 5)
	);

	function submitted(kind: 'cash' | 'twint') {
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
					toast(kind === 'cash' ? 'Barzahlung erfasst' : 'TWINT-Zahlung erfasst', {
						icon: CircleCheck
					});
					mode = 'choose';
					twintOpen = false;
					received = '';
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
	{:else if mode === 'choose'}
		<Field>
			<Label for="amount">Betrag dieser Zahlung</Label>
			<Input id="amount" bind:value={amountInput} inputmode="decimal" autocomplete="off" />
			<FieldDescription>
				Für eine Teilzahlung (Splitting) den Betrag anpassen. Danach den Rest gleich erneut
				abrechnen.
			</FieldDescription>
		</Field>
		{#if !amountValid}
			<p class="form-error" role="alert">
				Der Betrag muss grösser als 0 und höchstens {formatChf(openCents)} sein.
			</p>
		{/if}
		<div class="methods">
			<Button size="lg" icon={Banknote} disabled={!amountValid} onclick={() => (mode = 'cash')}
				>Bar</Button
			>
			<Button
				size="lg"
				variant="secondary"
				icon={QrCode}
				disabled={!amountValid || !twintQrContent}
				onclick={() => (twintOpen = true)}>TWINT</Button
			>
		</div>
		{#if !twintQrContent}
			<p class="muted small">
				TWINT ist nicht verfügbar: Ein Admin muss zuerst den QR-Code erfassen.
			</p>
		{/if}
	{:else}
		<div class="cash stack">
			<div class="cash-due">
				<span class="muted">Zu bezahlen</span>
				<strong class="tabular">{formatChf(amountCents ?? 0)}</strong>
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
			<div class="cash-grid">
				<div class="stack">
					<div class="cash-line">
						<span class="muted">Erhalten</span>
						<output class="tabular"
							>{receivedCents === null ? '–' : formatChf(receivedCents)}</output
						>
					</div>
					<div
						class={['cash-line', 'cash-change', { 'cash-change--short': (changeCents ?? 0) < 0 }]}
					>
						<span>{(changeCents ?? 0) < 0 ? 'Fehlt noch' : 'Rückgeld'}</span>
						<output class="tabular" aria-live="polite"
							>{changeCents === null ? '–' : formatChf(Math.abs(changeCents))}</output
						>
					</div>
				</div>
				<Numpad
					bind:value={received}
					decimals={2}
					label="Erhaltener Betrag"
					labels={{ delete: 'Löschen' }}
				/>
			</div>
			<form method="POST" action="?/pay" use:enhance={submitted('cash')} class="row cash-actions">
				<input type="hidden" name="amount" value={amountInput} />
				<input type="hidden" name="method" value="cash" />
				<Button variant="ghost" onclick={() => ((mode = 'choose'), (received = ''))}
					>Abbrechen</Button
				>
				<Button
					type="submit"
					size="lg"
					icon={CircleCheck}
					loading={submitting}
					disabled={changeCents !== null && changeCents < 0}>Bar bezahlt</Button
				>
			</form>
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

{#if twintQrContent}
	<Dialog
		bind:open={twintOpen}
		title="Mit TWINT bezahlen"
		description="QR-Code mit der TWINT-App scannen und den Betrag eingeben."
		closeLabel="Schliessen"
	>
		<div class="twint stack">
			<TwintCode content={twintQrContent} />
			<p class="twint-amount tabular">{formatChf(amountCents ?? 0)}</p>
		</div>
		{#snippet actions(close)}
			<Button variant="secondary" onclick={close}>Abbrechen</Button>
			<form method="POST" action="?/pay" use:enhance={submitted('twint')}>
				<input type="hidden" name="amount" value={amountInput} />
				<input type="hidden" name="method" value="twint" />
				<Button type="submit" icon={CircleCheck} loading={submitting}>TWINT bezahlt</Button>
			</form>
		{/snippet}
	</Dialog>
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

	.paid {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 16px;
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
	}

	.cash {
		padding: 16px;
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
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

	.cash-grid {
		display: grid;
		gap: 16px;
	}

	@media (min-width: 640px) {
		.cash-grid {
			grid-template-columns: 1fr 280px;
			align-items: start;
		}
	}

	.cash-line {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		font-size: 18px;
	}

	.cash-change {
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

	.cash-actions {
		justify-content: flex-end;
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
