<script lang="ts">
	import { enhance } from '$app/forms';
	import { Badge, Button, Card, CardContent, toast } from '@noahbaumgartner/svelte-ui';
	import { CircleAlert, CircleCheck, CircleHelp, Printer } from '@lucide/svelte';
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

	let { printer, compact = false }: { printer: PrinterStatus; compact?: boolean } = $props();

	const time = new Intl.DateTimeFormat('de-CH', { hour: '2-digit', minute: '2-digit' });

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
					<Button type="submit" variant="secondary" disabled={!printer.active}>Testdruck</Button>
				</form>
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
		align-items: center;
		gap: 8px;
		margin-top: 14px;
	}
</style>
