<script lang="ts">
	import { Badge } from '@noahbaumgartner/svelte-ui';
	import { Check, Clock, Printer, X } from '@lucide/svelte';

	type Job = {
		id: number;
		printerName: string;
		printerUnreachable: boolean;
		status: 'queued' | 'printing' | 'printed' | 'cancelled';
		attempts: number;
		lastError: string | null;
	};

	let { jobs }: { jobs: Job[] } = $props();
</script>

{#if jobs.length === 0}
	<p class="muted">Keine Zettel zu drucken (nur Artikel ohne Drucker).</p>
{:else}
	<ul class="print-status" aria-live="polite">
		{#each jobs as job (job.id)}
			<li>
				<span class="printer"><Printer size={16} aria-hidden="true" /> {job.printerName}</span>
				{#if job.status === 'printed'}
					<Badge icon={Check}>Gedruckt</Badge>
				{:else if job.status === 'cancelled'}
					<Badge icon={X}>Abgebrochen</Badge>
				{:else if job.printerUnreachable}
					<Badge variant="primary" icon={Clock}>Drucker nicht erreichbar</Badge>
				{:else}
					<Badge icon={Clock}
						>{job.status === 'printing' ? 'Wird gedruckt' : 'In Warteschlange'}</Badge
					>
				{/if}
			</li>
		{/each}
	</ul>
	{#if jobs.some((job) => job.printerUnreachable && (job.status === 'queued' || job.status === 'printing'))}
		<p class="muted hint">
			Der Zettel bleibt in der Warteschlange und wird automatisch gedruckt, sobald der Drucker
			wieder erreichbar ist.
		</p>
	{/if}
{/if}

<style>
	.print-status {
		display: flex;
		flex-direction: column;
		gap: 8px;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	li {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
	}

	.hint {
		margin-top: 10px;
		font-size: 13px;
	}

	.printer {
		display: inline-flex;
		align-items: center;
		gap: 6px;
	}
</style>
