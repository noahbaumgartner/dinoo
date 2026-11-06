<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button, Field, Input, Label } from '@noahbaumgartner/svelte-ui';
	import { LogIn } from '@lucide/svelte';
	import type { PageProps } from './$types';

	let { form }: PageProps = $props();
	let loading = $state(false);
</script>

<svelte:head><title>Anmelden · dinoo</title></svelte:head>

<div class="stack">
	<div>
		<h1>Anmelden</h1>
		<p class="muted">Mit dem Benutzer, den du vom Admin erhalten hast.</p>
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
			<Label for="username">Benutzername</Label>
			<Input
				id="username"
				name="username"
				autocomplete="username"
				autocapitalize="none"
				spellcheck={false}
				value={form?.username ?? ''}
				required
			/>
		</Field>
		<Field>
			<Label for="password">Passwort</Label>
			<Input
				id="password"
				name="password"
				type="password"
				autocomplete="current-password"
				required
			/>
		</Field>

		{#if form?.error}
			<p class="form-error" role="alert">{form.error}</p>
		{/if}

		<Button type="submit" size="lg" icon={LogIn} {loading}>Anmelden</Button>
	</form>
</div>
