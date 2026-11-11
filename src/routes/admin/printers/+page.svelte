<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
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
		Forward,
		Pencil,
		Plus,
		Printer,
		Trash2
	} from '@lucide/svelte';
	import { onMount } from 'svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	type PrinterRow = (typeof data.printers)[number];

	let editOpen = $state(false);
	let deleteOpen = $state(false);
	let editing = $state<PrinterRow | null>(null);
	let deleting = $state<PrinterRow | null>(null);
	let model = $state('TM-T20IV');
	let redirectOpen = $state(false);
	let redirecting = $state<PrinterRow | null>(null);
	let redirectTarget = $state('');

	const time = new Intl.DateTimeFormat('de-CH', { hour: '2-digit', minute: '2-digit' });

	/** Active printers that are not redirected themselves; a redirect never forms a chain. */
	function redirectTargets(source: PrinterRow) {
		return data.printers.filter(
			(p) => p.id !== source.id && p.active && p.redirectToPrinterId === null
		);
	}

	function isRedirectTarget(printer: PrinterRow) {
		return data.printers.some((p) => p.redirectToPrinterId === printer.id);
	}

	function startRedirect(printer: PrinterRow) {
		redirecting = printer;
		redirectTarget = String(redirectTargets(printer)[0]?.id ?? '');
		redirectOpen = true;
	}

	function edit(printer: PrinterRow | null) {
		editing = printer;
		model = printer?.model ?? 'TM-T20IV';
		editOpen = true;
	}

	// Live view: the pending counter and reachability follow the print queue.
	onMount(() => {
		const timer = setInterval(() => invalidateAll(), 3000);
		return () => clearInterval(timer);
	});
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
							{#if printer.reachable === false}
								<Badge variant="primary" icon={CircleAlert}>Nicht erreichbar</Badge>
							{:else if printer.reachable === true}
								<Badge icon={CircleCheck}>Erreichbar</Badge>
							{/if}
						</span>
						<span class="muted small tabular">{printer.host}:{printer.port} · {printer.model}</span>
						{#if printer.redirectTargetName}
							<span class="redirect small">
								<Forward size={14} aria-hidden="true" />
								Umgeleitet auf {printer.redirectTargetName}
								{#if printer.redirectedAt}seit {time.format(printer.redirectedAt)}{/if}
							</span>
						{/if}
					</div>
					<span class="state">
						{#if printer.pendingJobs > 0}
							<span class="muted small">{printer.pendingJobs} wartend</span>
						{/if}
					</span>
					<span class="row">
						{#if printer.redirectToPrinterId !== null}
							<form method="POST" action="?/clearRedirect" use:enhance={notify()}>
								<input type="hidden" name="id" value={printer.id} />
								<Button type="submit" variant="secondary" size="sm">Umleitung aufheben</Button>
							</form>
						{:else}
							{#if !isRedirectTarget(printer) && redirectTargets(printer).length > 0}
								<Button variant="secondary" size="sm" onclick={() => startRedirect(printer)}
									>Umleiten …</Button
								>
							{/if}
							<form method="POST" action="?/test" use:enhance={notify()}>
								<input type="hidden" name="printerId" value={printer.id} />
								<Button type="submit" variant="secondary" size="sm" disabled={!printer.active}
									>Testdruck</Button
								>
							</form>
						{/if}
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

<Dialog
	bind:open={redirectOpen}
	title="Drucker «{redirecting?.name}» umleiten"
	closeLabel="Schliessen"
>
	<form
		id="redirect-form"
		method="POST"
		action="?/redirect"
		class="stack"
		use:enhance={notify(() => (redirectOpen = false))}
	>
		<input type="hidden" name="id" value={redirecting?.id} />
		<Field>
			<Label for="redirect-target">Zieldrucker</Label>
			<Select
				id="redirect-target"
				name="targetId"
				bind:value={redirectTarget}
				options={redirecting
					? redirectTargets(redirecting).map((p) => ({ value: String(p.id), label: p.name }))
					: []}
			/>
		</Field>
		<FieldDescription>
			Alle wartenden und neuen Zettel dieses Druckers kommen auf den Zieldrucker, mit dem Hinweis
			«FÜR: {redirecting?.name.toUpperCase()}» oben. Hebe die Umleitung auf, sobald der Drucker
			wieder läuft.
		</FieldDescription>
	</form>
	{#snippet actions(close)}
		<Button variant="secondary" onclick={close}>Abbrechen</Button>
		<Button type="submit" form="redirect-form" icon={Forward}>Umleiten</Button>
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
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 4px 8px;
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

	.redirect {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		font-weight: 600;
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
