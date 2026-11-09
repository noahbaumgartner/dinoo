<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { Button, Navbar, NavigationMenuItem } from '@noahbaumgartner/svelte-ui';
	import { Menu, X } from '@lucide/svelte';
	import type { Focus } from '$lib/focus-mode.svelte';
	import UserMenu, { type MenuUser } from './UserMenu.svelte';
	import type { Snippet } from 'svelte';

	type NavItem = { href: string; label: string; exact?: boolean };

	let {
		items,
		user,
		subtitle,
		extra,
		focus
	}: {
		items: NavItem[];
		user: MenuUser;
		subtitle?: string;
		/** Extra buttons before the user menu. */
		extra?: Snippet;
		/** Replaces navigation and user menu with a title and a cancel button. */
		focus?: Focus | null;
	} = $props();

	function isActive(item: NavItem) {
		const path = page.url.pathname;
		return item.exact ? path === item.href : path === item.href || path.startsWith(item.href + '/');
	}
</script>

<Navbar class={['app-navbar', focus && 'app-navbar--focus']} label="Hauptnavigation">
	{#snippet logo()}
		{#if focus}
			<span class="logo">
				dinoo
				<span class="logo-subtitle">{focus.title}</span>
			</span>
		{:else}
			<a href={resolve('/')} class="logo">
				dinoo
				{#if subtitle}<span class="logo-subtitle">{subtitle}</span>{/if}
			</a>
		{/if}
	{/snippet}
	{#snippet actions()}
		{#if focus}
			<Button variant="secondary" icon={X} onclick={focus.onexit}>Abbrechen</Button>
		{:else}
			{@render extra?.()}
			<UserMenu {user} />
		{/if}
	{/snippet}
	{#snippet trigger(props, open)}
		{#if !focus}
			<Button
				{...props}
				variant="secondary"
				icon={open ? X : Menu}
				label={open ? 'Menü schliessen' : 'Menü öffnen'}
			/>
		{/if}
	{/snippet}
	{#if !focus}
		{#each items as item (item.href)}
			<NavigationMenuItem href={item.href} active={isActive(item)}>{item.label}</NavigationMenuItem>
		{/each}
	{/if}
</Navbar>

<style>
	:global(.app-navbar) {
		--navbar-gutter: var(--gutter);
	}

	:global(.app-navbar .navbar-bar) {
		/* Same box as .app-main, so the logo and the rightmost button line up
		   with the left and right edges of the page content. */
		box-sizing: border-box;
		max-width: calc(var(--content-max-width) + 2 * var(--gutter));
		margin-inline: auto;
		padding-inline: var(--gutter);
	}

	/* The navbar renders an empty trigger wrapper; its gap would push the cancel button off the edge */
	:global(.app-navbar--focus .navbar-trigger) {
		display: none;
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
</style>
