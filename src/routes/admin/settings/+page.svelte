<script lang="ts">
	import { enhance } from '$app/forms';
	import AdminPage from '$lib/components/AdminPage.svelte';
	import { notify } from '$lib/components/notify';
	import QrReader from '$lib/components/QrReader.svelte';
	import TwintCode from '$lib/components/TwintCode.svelte';
	import {
		Button,
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle,
		Field,
		FieldDescription,
		Input,
		Label,
		Textarea,
		toast
	} from '@noahbaumgartner/svelte-ui';
	import { ScanLine } from '@lucide/svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	// Editable copy; reset when the saved value changes.
	let qrContent = $derived(data.settings.twintQrContent ?? '');
	let dirty = $derived(qrContent !== (data.settings.twintQrContent ?? ''));
</script>

<AdminPage title="Einstellungen" description="Gilt für den aktiven Anlass (die aktive Datenbank).">
	<Card>
		<CardHeader>
			<CardTitle>Anlass</CardTitle>
			<CardDescription
				>Der Name erscheint oben auf jedem Bestellzettel und in der Navigation.</CardDescription
			>
		</CardHeader>
		<CardContent>
			<form method="POST" action="?/event" class="inline" use:enhance={notify()}>
				<Field>
					<Label for="eventName">Name des Anlasses</Label>
					<Input
						id="eventName"
						name="eventName"
						value={data.settings.eventName ?? ''}
						placeholder="z. B. Sommerfest 2026"
					/>
				</Field>
				<Button type="submit">Speichern</Button>
			</form>
		</CardContent>
	</Card>

	<Card>
		<CardHeader>
			<CardTitle>TWINT</CardTitle>
			<CardDescription>
				Den statischen TWINT-QR-Code des Vereins einmal einlesen. Gespeichert wird sein Inhalt; beim
				Bezahlen zeigt dinoo daraus einen neuen QR-Code an.
			</CardDescription>
		</CardHeader>
		<CardContent>
			<div class="twint">
				<div class="stack">
					<QrReader
						ondetect={(content) => {
							qrContent = content;
							toast('QR-Code gelesen. Jetzt speichern.', { icon: ScanLine });
						}}
					/>
					<form method="POST" action="?/twint" class="stack" use:enhance={notify()}>
						<Field>
							<Label for="twintQrContent">Inhalt des QR-Codes</Label>
							<Textarea
								id="twintQrContent"
								name="twintQrContent"
								bind:value={qrContent}
								rows={3}
								spellcheck={false}
							/>
							<FieldDescription
								>Wird beim Scannen ausgefüllt, kann aber auch eingefügt werden.</FieldDescription
							>
						</Field>
						<div class="row">
							<Button type="submit" disabled={!dirty}>Speichern</Button>
							{#if data.settings.twintQrContent}
								<Button variant="ghost" onclick={() => (qrContent = '')}>Entfernen</Button>
							{/if}
						</div>
					</form>
				</div>
				<div class="preview">
					{#if qrContent}
						<TwintCode content={qrContent} size={220} />
						<p class="muted small">
							{dirty ? 'Vorschau (noch nicht gespeichert)' : 'So sieht der Gast den Code.'}
						</p>
					{:else}
						<div class="placeholder muted">
							Noch kein QR-Code hinterlegt. TWINT ist beim Bezahlen deaktiviert.
						</div>
					{/if}
				</div>
			</div>
		</CardContent>
	</Card>
</AdminPage>

<style>
	.inline {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-end;
		gap: 12px;
	}

	.inline :global(.field) {
		flex: 1;
		min-width: 220px;
	}

	.twint {
		display: grid;
		gap: 24px;
	}

	@media (min-width: 800px) {
		.twint {
			grid-template-columns: 1fr 260px;
		}
	}

	.preview {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
	}

	.placeholder {
		display: grid;
		place-items: center;
		width: 220px;
		height: 220px;
		padding: 16px;
		border: 1px dashed var(--color-border);
		border-radius: var(--radius);
		font-size: 14px;
		text-align: center;
	}

	.small {
		font-size: 13px;
		text-align: center;
	}
</style>
