<script lang="ts" module>
	export type MenuUser = { name: string; username: string; role?: 'service' | 'admin' };
</script>

<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import {
		Avatar,
		Button,
		ContextMenu,
		ContextMenuInfo,
		ContextMenuItem,
		ContextMenuSeparator,
		Dialog,
		Field,
		FieldDescription,
		Input,
		Label
	} from '@noahbaumgartner/svelte-ui';
	import { LogOut, UserPen } from '@lucide/svelte';
	import { notify } from './notify';

	let { user }: { user: MenuUser } = $props();

	const roleLabels = { service: 'Service', admin: 'Administrator' } as const;

	const initials = $derived(
		user.name
			.split(/\s+/)
			.filter(Boolean)
			.slice(0, 2)
			.map((part) => part[0])
			.join('') || undefined
	);

	let logoutForm: HTMLFormElement | undefined = $state();
	let profileOpen = $state(false);
	let newPassword = $state('');
</script>

<ContextMenu align="end">
	{#snippet trigger(props)}
		<button {...props} type="button" class="user-trigger" aria-label="Benutzermenü ({user.name})">
			<Avatar alt={user.name} fallback={initials} />
		</button>
	{/snippet}
	<ContextMenuInfo description={user.role ? roleLabels[user.role] : undefined}>
		{#snippet leading()}<Avatar alt={user.name} fallback={initials} />{/snippet}
		{user.name}
	</ContextMenuInfo>
	<ContextMenuSeparator />
	<ContextMenuItem
		icon={UserPen}
		onclick={() => {
			newPassword = '';
			profileOpen = true;
		}}>Profil bearbeiten</ContextMenuItem
	>
	<ContextMenuItem icon={LogOut} onclick={() => logoutForm?.requestSubmit()}
		>Abmelden</ContextMenuItem
	>
</ContextMenu>
<form method="POST" action={resolve('/logout')} bind:this={logoutForm} hidden></form>

<Dialog bind:open={profileOpen} title="Profil" closeLabel="Schliessen">
	<!-- Recreated on every open, so no old password stays in the fields -->
	{#key profileOpen}
		<form
			id="profile-form"
			method="POST"
			action={resolve('/profile')}
			class="stack"
			use:enhance={notify(() => (profileOpen = false))}
		>
			<Field>
				<Label for="profile-username">Benutzername</Label>
				<Input id="profile-username" value={user.username} readonly disabled />
				<FieldDescription>Kann nur ein Admin ändern.</FieldDescription>
			</Field>
			<Field>
				<Label for="profile-name">Anzeigename</Label>
				<Input id="profile-name" name="name" value={user.name} autocomplete="name" required />
				<FieldDescription>Erscheint auf den Zetteln unter «Aufgenommen von».</FieldDescription>
			</Field>
			<Field>
				<Label for="profile-new-password">Neues Passwort (optional)</Label>
				<Input
					id="profile-new-password"
					name="newPassword"
					type="password"
					autocomplete="new-password"
					bind:value={newPassword}
				/>
				<FieldDescription>Mindestens 4 Zeichen. Leer lassen, um es zu behalten.</FieldDescription>
			</Field>
			{#if newPassword}
				<Field>
					<Label for="profile-current-password">Aktuelles Passwort</Label>
					<Input
						id="profile-current-password"
						name="currentPassword"
						type="password"
						autocomplete="current-password"
						required
					/>
				</Field>
			{/if}
		</form>
	{/key}
	{#snippet actions(close)}
		<Button variant="secondary" onclick={close}>Abbrechen</Button>
		<Button type="submit" form="profile-form">Speichern</Button>
	{/snippet}
</Dialog>

<style>
	.user-trigger {
		display: inline-flex;
		padding: 0;
		background: none;
		border: none;
		/* Same corners as the md Avatar inside, so the focus ring follows its shape */
		border-radius: 10px;
		cursor: pointer;
	}

	.user-trigger:focus-visible {
		outline: 2px solid var(--color-accent);
		outline-offset: 2px;
	}
</style>
