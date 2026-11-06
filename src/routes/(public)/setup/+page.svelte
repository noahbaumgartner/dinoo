<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button, Field, FieldDescription, Input, Label } from '@noahbaumgartner/svelte-ui';
	import { ShieldCheck } from '@lucide/svelte';
	import type { PageProps } from './$types';

	let { form }: PageProps = $props();
	let loading = $state(false);
</script>

<svelte:head><title>Einrichten · dinoo</title></svelte:head>

<div class="stack">
	<div>
		<h1>Einrichten</h1>
		<p class="muted">
			Diese Datenbank hat noch keine Benutzer. Lege den ersten Admin an; weitere Benutzer, Drucker
			und das Angebot erfasst du danach im Admin-Bereich.
		</p>
	</div>

	<form
		method="POST"
		class="stack"
		use:enhance={() => {
			loading = true;
			return async ({ update }) => {
				await update({ reset: false });
				loading = false;
			};
		}}
	>
		<Field>
			<Label for="eventName">Anlass</Label>
			<Input id="eventName" name="eventName" placeholder="z. B. Sommerfest 2026" />
			<FieldDescription>Erscheint oben auf jedem Bestellzettel.</FieldDescription>
		</Field>
		<Field>
			<Label for="name">Dein Name</Label>
			<Input id="name" name="name" autocomplete="name" required />
		</Field>
		<Field>
			<Label for="username">Benutzername</Label>
			<Input id="username" name="username" autocapitalize="none" spellcheck={false} required />
		</Field>
		<Field>
			<Label for="password">Passwort</Label>
			<Input id="password" name="password" type="password" autocomplete="new-password" required />
		</Field>
		<Field>
			<Label for="passwordRepeat">Passwort wiederholen</Label>
			<Input
				id="passwordRepeat"
				name="passwordRepeat"
				type="password"
				autocomplete="new-password"
				required
			/>
		</Field>

		{#if form?.error}
			<p class="form-error" role="alert">{form.error}</p>
		{/if}

		<Button type="submit" size="lg" icon={ShieldCheck} {loading}>Admin anlegen</Button>
	</form>
</div>
