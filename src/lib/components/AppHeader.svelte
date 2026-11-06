<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { Button, Navbar, NavigationMenuItem, ThemeToggle } from '@noahbaumgartner/svelte-ui';
	import { LogOut, Menu, X } from '@lucide/svelte';
	import type { Snippet } from 'svelte';

	type NavItem = { href: string; label: string; exact?: boolean };

	let {
		items,
		userName,
		subtitle,
		extra
	}: {
		items: NavItem[];
		userName: string;
		subtitle?: string;
		/** Extra buttons before the theme toggle. */
		extra?: Snippet;
	} = $props();

	function isActive(item: NavItem) {
		const path = page.url.pathname;
		return item.exact ? path === item.href : path === item.href || path.startsWith(item.href + '/');
	}
</script>

<Navbar class="app-navbar" label="Hauptnavigation">
	{#snippet logo()}
		<a href={resolve('/')} class="logo">
			dinoo
			{#if subtitle}<span class="logo-subtitle">{subtitle}</span>{/if}
		</a>
	{/snippet}
	{#snippet actions()}
		{@render extra?.()}
		<ThemeToggle labels={{ light: 'Design: Hell', dark: 'Design: Dunkel' }} />
		<form method="POST" action={resolve('/logout')}>
			<Button type="submit" variant="ghost" icon={LogOut} label="Abmelden ({userName})">
				<span class="user-name">{userName}</span>
			</Button>
		</form>
	{/snippet}
	{#snippet trigger(props, open)}
		<Button
			{...props}
			variant="secondary"
			icon={open ? X : Menu}
			label={open ? 'Menü schliessen' : 'Menü öffnen'}
		/>
	{/snippet}
	{#each items as item (item.href)}
		<NavigationMenuItem href={item.href} active={isActive(item)}>{item.label}</NavigationMenuItem>
	{/each}
</Navbar>

<style>
	:global(.app-navbar) {
		--navbar-gutter: var(--gutter);
	}

	:global(.app-navbar .navbar-bar) {
		box-sizing: content-box;
		max-width: var(--content-max-width);
		margin-inline: auto;
	}

	.logo {
		display: inline-flex;
		align-items: baseline;
		gap: 8px;
		color: var(--color-text);
		font-size: 18px;
		font-weight: 700;
		letter-spacing: -0.02em;
		text-decoration: none;
	}

	.logo-subtitle {
		color: var(--color-text-muted);
		font-size: 13px;
		font-weight: 500;
		letter-spacing: 0;
	}

	@media (max-width: 640px) {
		.user-name {
			display: none;
		}
	}
</style>
