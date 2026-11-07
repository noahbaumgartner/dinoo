<script lang="ts">
	import { enhance } from '$app/forms';
	import AdminPage from '$lib/components/AdminPage.svelte';
	import { notify } from '$lib/components/notify';
	import {
		Badge,
		Button,
		Dialog,
		Field,
		FieldDescription,
		Input,
		Label,
		Select,
		Switch
	} from '@noahbaumgartner/svelte-ui';
	import { Pencil, Plus, ShieldCheck, User } from '@lucide/svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	type Row = (typeof data.users)[number];

	let open = $state(false);
	let editing = $state<Row | null>(null);
	let role = $state<string>('service');
	let active = $state(true);

	function edit(user: Row | null) {
		editing = user;
		role = user?.role ?? 'service';
		active = user?.active ?? true;
		open = true;
	}
</script>

<AdminPage
	title="Benutzer"
	description="Service-Personal nimmt Bestellungen auf und kassiert. Admins verwalten zusätzlich den ganzen Anlass."
>
	{#snippet actions()}
		<Button icon={Plus} onclick={() => edit(null)}>Benutzer anlegen</Button>
	{/snippet}

	<ul class="users">
		{#each data.users as user (user.id)}
			<li class={['user', { 'user--inactive': !user.active }]}>
				<span class="avatar" aria-hidden="true">
					{#if user.role === 'admin'}<ShieldCheck size={18} />{:else}<User size={18} />{/if}
				</span>
				<span class="info">
					<strong>{user.name}{user.id === data.currentUserId ? ' (du)' : ''}</strong>
					<span class="muted small">{user.username}</span>
				</span>
				<span class="row">
					<Badge variant={user.role === 'admin' ? 'primary' : 'secondary'}
						>{user.role === 'admin' ? 'Admin' : 'Service'}</Badge
					>
					{#if !user.active}<Badge>Deaktiviert</Badge>{/if}
				</span>
				<Button
					variant="ghost"
					size="sm"
					icon={Pencil}
					label="{user.name} bearbeiten"
					onclick={() => edit(user)}
				/>
			</li>
		{/each}
	</ul>
</AdminPage>

<Dialog bind:open title={editing ? editing.name : 'Benutzer anlegen'} closeLabel="Schliessen">
	<form
		id="user-form"
		method="POST"
		action={editing ? '?/update' : '?/create'}
		class="stack"
		use:enhance={notify(() => (open = false))}
	>
		{#if editing}<input type="hidden" name="id" value={editing.id} />{/if}
		<Field>
			<Label for="user-name">Anzeigename</Label>
			<Input
				id="user-name"
				name="name"
				value={editing?.name ?? ''}
				placeholder="z. B. Anna Meier"
				required
			/>
			<FieldDescription>Erscheint auf den Zetteln unter «Aufgenommen von».</FieldDescription>
		</Field>
		{#if !editing}
			<Field>
				<Label for="user-username">Benutzername</Label>
				<Input
					id="user-username"
					name="username"
					autocapitalize="none"
					spellcheck={false}
					required
				/>
			</Field>
		{/if}
		<Field>
			<Label for="user-role">Rolle</Label>
			<Select
				id="user-role"
				name="role"
				bind:value={role}
				options={[
					{ value: 'service', label: 'Service' },
					{ value: 'admin', label: 'Admin' }
				]}
			/>
		</Field>
		<Field>
			<Label for="user-password">{editing ? 'Neues Passwort (optional)' : 'Passwort'}</Label>
			<Input
				id="user-password"
				name="password"
				type="password"
				autocomplete="new-password"
				required={!editing}
			/>
			<FieldDescription
				>Mindestens 4 Zeichen. Der Benutzer kann es auch selbst im Profil ändern.</FieldDescription
			>
		</Field>
		{#if editing}
			<Field orientation="horizontal">
				<Switch id="user-active" name="active" bind:checked={active} />
				<Label for="user-active">Aktiv (darf sich anmelden)</Label>
			</Field>
		{/if}
	</form>
	{#snippet actions(close)}
		<Button variant="secondary" onclick={close}>Abbrechen</Button>
		<Button type="submit" form="user-form">Speichern</Button>
	{/snippet}
</Dialog>

<style>
	.users {
		display: flex;
		flex-direction: column;
		margin: 0;
		padding: 0;
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		list-style: none;
	}

	.user {
		display: grid;
		grid-template-columns: 36px 1fr auto auto;
		align-items: center;
		gap: 12px;
		padding: 12px 14px;
	}

	.user + .user {
		border-top: 1px solid var(--color-border);
	}

	.user--inactive .info {
		opacity: 0.6;
	}

	.avatar {
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
</style>
