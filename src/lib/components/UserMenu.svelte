<script lang="ts">
	import { resolve } from '$app/paths';
	import {
		Avatar,
		ContextMenu,
		ContextMenuInfo,
		ContextMenuItem,
		ContextMenuSeparator
	} from '@noahbaumgartner/svelte-ui';
	import { LogOut } from '@lucide/svelte';

	let { name, role }: { name: string; role?: 'service' | 'admin' } = $props();

	const roleLabels = { service: 'Service', admin: 'Administrator' } as const;

	const initials = $derived(
		name
			.split(/\s+/)
			.filter(Boolean)
			.slice(0, 2)
			.map((part) => part[0])
			.join('') || undefined
	);

	let logoutForm: HTMLFormElement | undefined = $state();
</script>

<ContextMenu align="end">
	{#snippet trigger(props)}
		<button {...props} type="button" class="user-trigger" aria-label="Benutzermenü ({name})">
			<Avatar alt={name} fallback={initials} />
		</button>
	{/snippet}
	<ContextMenuInfo description={role ? roleLabels[role] : undefined}>
		{#snippet leading()}<Avatar alt={name} fallback={initials} />{/snippet}
		{name}
	</ContextMenuInfo>
	<ContextMenuSeparator />
	<ContextMenuItem icon={LogOut} onclick={() => logoutForm?.requestSubmit()}
		>Abmelden</ContextMenuItem
	>
</ContextMenu>
<form method="POST" action={resolve('/logout')} bind:this={logoutForm} hidden></form>

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
