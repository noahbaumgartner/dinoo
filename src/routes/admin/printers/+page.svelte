<script lang="ts">
	import { enhance } from '$app/forms';
	import AdminPage from '$lib/components/AdminPage.svelte';
	import { inPlace, notify } from '$lib/components/notify';
	import {
		AlertDialog,
		Badge,
		Button,
		Dialog,
		EmptyState,
		Field,
		FieldDescription,
		Input,
		Label,
		Select
	} from '@noahbaumgartner/svelte-ui';
	import {
		CircleAlert,
		CircleCheck,
		Eye,
		EyeOff,
		Pencil,
		Plus,
		Printer,
		Trash2
	} from '@lucide/svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	type PrinterRow = (typeof data.printers)[number];

	let editOpen = $state(false);
	let deleteOpen = $state(false);
	let editing = $state<PrinterRow | null>(null);
	let deleting = $state<PrinterRow | null>(null);
	let model = $state('TM-T20IV');

	function edit(printer: PrinterRow | null) {
		editing = printer;
		model = printer?.model ?? 'TM-T20IV';
		editOpen = true;
	}
</script>

<AdminPage
	title="Drucker"
	description="Die Epson-Bondrucker im selben Netz wie der Server, per Kabel oder WLAN. Sie werden über ihre IP-Adresse angesprochen (ePOS-Print über HTTPS, Port 443)."
>
	{#snippet actions()}
		<Button icon={Plus} onclick={() => edit(null)}>Drucker erfassen</Button>
	{/snippet}

	{#if data.printers.length === 0}
		<EmptyState
			icon={Printer}
			title="Noch keine Drucker"
			description="Erfasse die Drucker mit ihrer IP-Adresse und mache einen Testdruck."
		>
			<Button icon={Plus} onclick={() => edit(null)}>Drucker erfassen</Button>
		</EmptyState>
	{:else}
		<ul class="printers">
			{#each data.printers as printer (printer.id)}
				<li class={['printer', { 'printer--inactive': !printer.active }]}>
					<div class="info">
						<span class="name">
							<Printer size={18} aria-hidden="true" />
							{printer.name}
							{#if !printer.active}<Badge>Deaktiviert</Badge>{/if}
						</span>
						<span class="muted small tabular">{printer.host}:{printer.port} · {printer.model}</span>
					</div>
					<span class="state">
						{#if printer.reachable === false}
							<Badge variant="primary" icon={CircleAlert}>Nicht erreichbar</Badge>
						{:else if printer.reachable === true}
							<Badge icon={CircleCheck}>Erreichbar</Badge>
						{/if}
						{#if printer.pendingJobs > 0}
							<span class="muted small">{printer.pendingJobs} wartend</span>
						{/if}
					</span>
					<span class="row">
						<form method="POST" action="?/test" use:enhance={notify()}>
							<input type="hidden" name="printerId" value={printer.id} />
							<Button type="submit" variant="secondary" size="sm" disabled={!printer.active}
								>Testdruck</Button
							>
						</form>
						<span class="icon-actions">
							<form method="POST" action="?/toggle" use:enhance={inPlace()} class="toggle">
								<input type="hidden" name="id" value={printer.id} />
								<input type="hidden" name="active" value={String(!printer.active)} />
								<Button
									type="submit"
									variant="ghost"
									size="sm"
									icon={printer.active ? Eye : EyeOff}
									label={printer.active
										? `Drucker ${printer.name} deaktivieren`
										: `Drucker ${printer.name} aktivieren`}
								/>
							</form>
							<Button
								variant="ghost"
								size="sm"
								icon={Pencil}
								label="Bearbeiten"
								onclick={() => edit(printer)}
							/>
							<Button
								variant="ghost"
								size="sm"
								icon={Trash2}
								label="Löschen"
								onclick={() => ((deleting = printer), (deleteOpen = true))}
							/>
						</span>
					</span>
				</li>
			{/each}
		</ul>
	{/if}
</AdminPage>

<Dialog
	bind:open={editOpen}
	title={editing ? 'Drucker bearbeiten' : 'Drucker erfassen'}
	closeLabel="Schliessen"
>
	<form
		id="printer-form"
		method="POST"
		action="?/save"
		class="stack"
		use:enhance={notify(() => (editOpen = false))}
	>
		{#if editing}<input type="hidden" name="id" value={editing.id} />{/if}
		<Field>
			<Label for="printer-name">Name</Label>
			<Input
				id="printer-name"
				name="name"
				value={editing?.name ?? ''}
				placeholder="z. B. Küche"
				required
			/>
		</Field>
		<div class="grid-2">
			<Field>
				<Label for="printer-host">IP-Adresse oder Hostname</Label>
				<Input
					id="printer-host"
					name="host"
					value={editing?.host ?? ''}
					placeholder="192.168.1.50"
					autocapitalize="none"
					spellcheck={false}
					required
				/>
			</Field>
			<Field>
				<Label for="printer-port">Port</Label>
				<Input
					id="printer-port"
					name="port"
					inputmode="numeric"
					value={String(editing?.port ?? 443)}
				/>
			</Field>
		</div>
		<Field>
			<Label for="printer-model">Modell</Label>
			<Select
				id="printer-model"
				name="model"
				bind:value={model}
				options={[
					{ value: 'TM-T20IV', label: 'Epson TM-T20IV' },
					{ value: 'TM-T20III', label: 'Epson TM-T20III' }
				]}
			/>
		</Field>
		<FieldDescription>
			Tipp: Die IP-Adresse steht auf dem Statusblatt des Druckers (Feed-Taste beim Einschalten
			gedrückt halten).
		</FieldDescription>
	</form>
	{#snippet actions(close)}
		<Button variant="secondary" onclick={close}>Abbrechen</Button>
		<Button type="submit" form="printer-form">Speichern</Button>
	{/snippet}
</Dialog>

<AlertDialog
	bind:open={deleteOpen}
	title="Drucker löschen?"
	description="Drucker, die einer Kategorie oder einem Artikel zugeordnet sind oder schon gedruckt haben, werden nur deaktiviert."
>
	{#snippet actions(close)}
		<Button variant="secondary" onclick={close}>Abbrechen</Button>
		<form method="POST" action="?/delete" use:enhance={notify(close)}>
			<input type="hidden" name="id" value={deleting?.id} />
			<Button type="submit" icon={Trash2}>Löschen</Button>
		</form>
	{/snippet}
</AlertDialog>

<style>
	.printers {
		display: flex;
		flex-direction: column;
		margin: 0;
		padding: 0;
		border-radius: var(--radius);
		background-color: var(--color-fill);
		list-style: none;
		overflow: hidden;
	}

	.printer {
		position: relative;
		display: grid;
		grid-template-columns: 1fr auto auto;
		align-items: center;
		gap: 12px;
		padding: 12px 14px;
	}

	/* Inset divider like the order list. */
	.printer + .printer::before {
		content: '';
		position: absolute;
		top: 0;
		right: 14px;
		left: 14px;
		border-top: 1px solid var(--color-border);
	}

	.printer--inactive .name {
		color: var(--color-text-muted);
	}

	.toggle {
		display: flex;
	}

	.info {
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-width: 0;
	}

	.name {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		font-weight: 600;
	}

	.state {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 2px;
	}

	.small {
		font-size: 13px;
	}

	.grid-2 {
		display: grid;
		grid-template-columns: 1fr 110px;
		gap: 12px;
	}

	@media (max-width: 640px) {
		.printer {
			grid-template-columns: 1fr;
		}

		.state {
			align-items: flex-start;
		}
	}
</style>
