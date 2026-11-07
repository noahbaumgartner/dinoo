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
	import { ChevronRight, Plus, ShieldCheck, User } from '@lucide/svelte';
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
			<li>
				<button
					type="button"
					class={['user', { 'user--inactive': !user.active }]}
					aria-label="{user.name} bearbeiten"
					onclick={() => edit(user)}
				>
					<span class="avatar" aria-hidden="true">
						{#if user.role === 'admin'}<ShieldCheck size={18} />{:else}<User size={18} />{/if}
					</span>
					<span class="info">
						<strong>{user.name}{user.id === data.currentUserId ? ' (du)' : ''}</strong>
						<span class="muted small">{user.username}</span>
					</span>
					<span class="badges">
						<Badge variant={user.role === 'admin' ? 'primary' : 'secondary'}
							>{user.role === 'admin' ? 'Admin' : 'Service'}</Badge
						>
						{#if !user.active}<Badge>Deaktiviert</Badge>{/if}
					</span>
					<ChevronRight size={18} class="chevron" aria-hidden="true" />
				</button>
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
		border-radius: var(--radius);
		background-color: var(--color-fill);
		list-style: none;
		overflow: hidden;
	}

	/* Inset divider like the orders list; the row button keeps its full-width hover. */
	li {
		position: relative;
	}

	li + li::before {
		content: '';
		position: absolute;
		top: 0;
		right: 14px;
		left: 14px;
		border-top: 1px solid var(--color-border);
	}

	.user {
		display: grid;
		grid-template-columns: 36px 1fr 18px;
		grid-template-areas:
			'avatar info chevron'
			'avatar badges chevron';
		align-items: center;
		gap: 4px 12px;
		width: 100%;
		padding: 12px 14px;
		border: 0;
		background: none;
		color: inherit;
		font: inherit;
		text-align: left;
		cursor: pointer;
	}

	.user:hover {
		background-color: var(--color-surface);
	}

	.user:focus-visible {
		outline: 2px solid var(--color-accent);
		outline-offset: -2px;
	}

	.user--inactive .info,
	.user--inactive .avatar {
		opacity: 0.6;
	}

	.avatar {
		grid-area: avatar;
		display: grid;
		place-items: center;
		width: 36px;
		height: 36px;
		border-radius: 999px;
		background-color: var(--color-surface);
	}

	/* Keep the avatar distinct from the row while hovered. */
	.user:hover .avatar {
		background-color: var(--color-fill);
	}

	.info {
		grid-area: info;
		display: flex;
		flex-direction: column;
		min-width: 0;
	}

	.info strong {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.badges {
		grid-area: badges;
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
	}

	.small {
		font-size: 13px;
	}

	.user :global(.chevron) {
		grid-area: chevron;
		color: var(--color-text-faint);
	}

	@media (min-width: 720px) {
		.user {
			grid-template-columns: 36px 1fr auto 18px;
			grid-template-areas: 'avatar info badges chevron';
		}
	}
</style>
