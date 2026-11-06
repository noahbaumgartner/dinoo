<script lang="ts">
	import { enhance } from '$app/forms';
	import { Badge, Button, Card, CardContent, Select, toast } from '@noahbaumgartner/svelte-ui';
	import { ArrowRightLeft, CircleAlert, CircleCheck, CircleHelp, Printer } from '@lucide/svelte';
	import type { SubmitFunction } from '@sveltejs/kit';

	type PrinterStatus = {
		id: number;
		name: string;
		host: string;
		port: number;
		model: string;
		active: boolean;
		pendingJobs: number;
		reachable: boolean | null;
		lastError: string | null;
		lastSuccessAt: Date | null;
	};

	let {
		printer,
		others,
		compact = false
	}: {
		printer: PrinterStatus;
		others: { id: number; name: string }[];
		compact?: boolean;
	} = $props();

	const time = new Intl.DateTimeFormat('de-CH', { hour: '2-digit', minute: '2-digit' });

	// svelte-ignore state_referenced_locally
	let target = $state(others[0] ? String(others[0].id) : '');

	const notify: SubmitFunction =
		() =>
		async ({ result, update }) => {
			await update();
			if (result.type === 'success' && typeof result.data?.message === 'string')
				toast(result.data.message);
			if (result.type === 'failure' && typeof result.data?.error === 'string')
				toast(result.data.error, { icon: CircleAlert });
		};
</script>

<Card class="printer-card">
	<CardContent>
		<div class="head">
			<span class="name"><Printer size={18} aria-hidden="true" /> {printer.name}</span>
			{#if !printer.active}
				<Badge>Deaktiviert</Badge>
			{:else if printer.reachable === false}
				<Badge variant="primary" icon={CircleAlert}>Nicht erreichbar</Badge>
			{:else if printer.reachable === true}
				<Badge icon={CircleCheck}>Erreichbar</Badge>
			{:else}
				<Badge icon={CircleHelp}>Noch nicht gedruckt</Badge>
			{/if}
		</div>
		<p class="muted small">{printer.host}:{printer.port} · {printer.model}</p>
		<p class="pending">
			<strong class="tabular">{printer.pendingJobs}</strong>
			<span class="muted">{printer.pendingJobs === 1 ? 'wartender Zettel' : 'wartende Zettel'}</span
			>
		</p>
		{#if printer.reachable === false && printer.lastError}
			<p class="error small">{printer.lastError}</p>
		{:else if printer.lastSuccessAt}
			<p class="muted small">Zuletzt gedruckt um {time.format(printer.lastSuccessAt)}</p>
		{/if}

		{#if !compact}
			<div class="actions">
				<form method="POST" action="?/test" use:enhance={notify}>
					<input type="hidden" name="printerId" value={printer.id} />
					<Button type="submit" variant="secondary" size="sm" disabled={!printer.active}
						>Testdruck</Button
					>
				</form>
				{#if printer.pendingJobs > 0 && others.length > 0}
					<form method="POST" action="?/rerouteAll" class="reroute" use:enhance={notify}>
						<input type="hidden" name="from" value={printer.id} />
						<div class="target">
							<Select
								name="to"
								bind:value={target}
								aria-label="Zieldrucker"
								options={others.map((o) => ({ value: String(o.id), label: o.name }))}
							/>
						</div>
						<Button type="submit" size="sm" icon={ArrowRightLeft}>Alle umleiten</Button>
					</form>
				{/if}
			</div>
		{/if}
	</CardContent>
</Card>

<style>
	.head {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
	}

	.name {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		font-size: 17px;
		font-weight: 600;
	}

	.small {
		font-size: 13px;
	}

	.pending {
		display: flex;
		align-items: baseline;
		gap: 6px;
		margin-top: 12px;
	}

	.pending strong {
		font-size: 28px;
	}

	.error {
		color: var(--color-destructive);
		word-break: break-word;
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin-top: 14px;
	}

	.reroute {
		display: flex;
		gap: 6px;
	}

	.target {
		min-width: 120px;
	}
</style>
