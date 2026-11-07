<script lang="ts">
	import { enhance } from '$app/forms';
	import AdminPage from '$lib/components/AdminPage.svelte';
	import { notify } from '$lib/components/notify';
	import {
		AlertDialog,
		Badge,
		Button,
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle,
		Checkbox,
		Field,
		FieldDescription,
		Input,
		Label
	} from '@noahbaumgartner/svelte-ui';
	import { ArrowRightLeft, Database, Download, Plus, Trash2, Upload } from '@lucide/svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	type Row = (typeof data.databases)[number];

	const dateTime = new Intl.DateTimeFormat('de-CH', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	});

	let copyMasterData = $state(true);
	let activate = $state(true);
	let switching = $state<Row | null>(null);
	let switchOpen = $state(false);
	let cancelPending = $state(false);
	let deleting = $state<Row | null>(null);
	let deleteOpen = $state(false);

	function size(bytes: number) {
		if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
		return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
	}
</script>

<AdminPage
	title="Datenbank"
	description="Eine Datenbank entspricht genau einem Anlass. Für den nächsten Anlass eine neue anlegen; alte bleiben zum Nachschauen und Sichern erhalten."
>
	<ul class="databases">
		{#each data.databases as db (db.name)}
			<li class={['db', { 'db--active accent-bar': db.active }]}>
				<span class="icon" aria-hidden="true"><Database size={18} /></span>
				<span class="info">
					<strong>{db.eventName ?? db.name}</strong>
					<span class="muted small tabular"
						>{db.name}.sqlite · {size(db.sizeBytes)} · {dateTime.format(db.modifiedAt)}</span
					>
				</span>
				{#if db.active}<Badge variant="primary">Aktiv</Badge>{:else}<span></span>{/if}
				<span class="row actions">
					<Button
						href="/admin/database/{db.name}"
						variant="ghost"
						size="sm"
						icon={Download}
						label="{db.name} herunterladen"
						download
						data-sveltekit-reload
					/>
					{#if !db.active}
						<Button
							variant="secondary"
							size="sm"
							icon={ArrowRightLeft}
							onclick={() => ((switching = db), (cancelPending = false), (switchOpen = true))}
							>Aktivieren</Button
						>
						<Button
							variant="ghost"
							size="sm"
							icon={Trash2}
							label="{db.name} löschen"
							onclick={() => ((deleting = db), (deleteOpen = true))}
						/>
					{/if}
				</span>
			</li>
		{/each}
	</ul>

	<div class="cards">
		<Card>
			<CardHeader>
				<CardTitle>Neuer Anlass</CardTitle>
				<CardDescription
					>Legt eine leere Datenbank an, auf Wunsch mit den Stammdaten des aktiven Anlasses.</CardDescription
				>
			</CardHeader>
			<CardContent>
				<form method="POST" action="?/create" class="stack" use:enhance={notify()}>
					<Field>
						<Label for="new-event">Name des Anlasses</Label>
						<Input id="new-event" name="eventName" placeholder="z. B. Herbstfest 2026" required />
						<FieldDescription
							>Daraus entsteht der Dateiname, z. B. herbstfest-2026.sqlite.</FieldDescription
						>
					</Field>
					<Field orientation="horizontal">
						<Checkbox id="copy" name="copyMasterData" bind:checked={copyMasterData} />
						<Label for="copy">Benutzer, Drucker, Angebot und Tische übernehmen</Label>
					</Field>
					<Field orientation="horizontal">
						<Checkbox id="activate" name="activate" bind:checked={activate} />
						<Label for="activate">Gleich aktivieren (alle melden sich neu an)</Label>
					</Field>
					<div><Button type="submit" icon={Plus}>Anlegen</Button></div>
				</form>
			</CardContent>
		</Card>

		<Card>
			<CardHeader>
				<CardTitle>Sicherung hochladen</CardTitle>
				<CardDescription
					>Eine heruntergeladene .sqlite-Datei wieder hinzufügen, z. B. auf einem neuen Laptop.</CardDescription
				>
			</CardHeader>
			<CardContent>
				<form
					method="POST"
					action="?/upload"
					enctype="multipart/form-data"
					class="stack"
					use:enhance={notify()}
				>
					<Field>
						<Label for="upload-file">Datei</Label>
						<Input
							id="upload-file"
							name="file"
							type="file"
							accept=".sqlite,.db,application/vnd.sqlite3"
							required
						/>
					</Field>
					<Field>
						<Label for="upload-name">Name (optional)</Label>
						<Input id="upload-name" name="name" placeholder="sonst der Dateiname" />
					</Field>
					<div><Button type="submit" variant="secondary" icon={Upload}>Hochladen</Button></div>
				</form>
			</CardContent>
		</Card>
	</div>
</AdminPage>

<AlertDialog
	bind:open={switchOpen}
	title="Datenbank «{switching?.eventName ?? switching?.name}» aktivieren?"
	description="Alle Geräte arbeiten danach mit diesem Anlass. Alle Benutzer werden abgemeldet und melden sich mit den Benutzern dieser Datenbank neu an."
>
	{#if data.pendingPrintJobs > 0}
		<div class="stack warning">
			<p>
				In der Druckwarteschlange warten noch <strong>{data.pendingPrintJobs}</strong> Zettel. Ohne Abbruch
				ist kein Wechsel möglich.
			</p>
			<Field orientation="horizontal">
				<Checkbox id="cancel-pending" bind:checked={cancelPending} />
				<Label for="cancel-pending">Wartende Zettel abbrechen</Label>
			</Field>
		</div>
	{/if}
	{#snippet actions(close)}
		<Button variant="secondary" onclick={close}>Abbrechen</Button>
		<form method="POST" action="?/activate" use:enhance={notify(close)}>
			<input type="hidden" name="name" value={switching?.name} />
			<input type="hidden" name="cancelPending" value={cancelPending ? 'true' : 'false'} />
			<Button
				type="submit"
				icon={ArrowRightLeft}
				disabled={data.pendingPrintJobs > 0 && !cancelPending}>Aktivieren</Button
			>
		</form>
	{/snippet}
</AlertDialog>

<AlertDialog
	bind:open={deleteOpen}
	title="Datenbank «{deleting?.name}» löschen?"
	description="Alle Bestellungen und Zahlungen dieses Anlasses gehen verloren. Vorher herunterladen, wenn du sie behalten willst."
>
	{#snippet actions(close)}
		<Button variant="secondary" onclick={close}>Abbrechen</Button>
		<form method="POST" action="?/delete" use:enhance={notify(close)}>
			<input type="hidden" name="name" value={deleting?.name} />
			<Button type="submit" icon={Trash2}>Endgültig löschen</Button>
		</form>
	{/snippet}
</AlertDialog>

<style>
	.databases {
		display: flex;
		flex-direction: column;
		margin: 0;
		padding: 0;
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		list-style: none;
		/* Clips the active row's accent bar to the rounded corners. */
		overflow: hidden;
	}

	.db {
		display: grid;
		grid-template-columns: 36px 1fr auto auto;
		align-items: center;
		gap: 12px;
		padding: 12px 14px;
	}

	.db + .db {
		border-top: 1px solid var(--color-border);
	}

	/* Accent bar instead of a fill: buttons and icons inside share the surface colour. */
	.db--active {
		--accent-bar-inset: 10px;
	}

	.icon {
		display: grid;
		place-items: center;
		width: 36px;
		height: 36px;
		border-radius: 999px;
		background-color: var(--color-surface);
	}

	.info {
		display: flex;
		flex-direction: column;
		min-width: 0;
	}

	.small {
		font-size: 13px;
	}

	.actions {
		justify-content: flex-end;
	}

	.cards {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 16px;
	}

	/* Bordered, not filled: the checkbox inside has the surface colour. */
	.warning {
		padding: 12px;
		border: 1px solid var(--color-border);
		border-radius: 8px;
	}

	@media (max-width: 640px) {
		.db {
			grid-template-columns: 36px 1fr;
		}

		.actions {
			grid-column: 2;
			justify-content: flex-start;
		}
	}
</style>
