<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import {
		Sidebar,
		SidebarContent,
		SidebarFooter,
		SidebarGroup,
		SidebarHeader,
		SidebarInset,
		SidebarMenu,
		SidebarMenuItem,
		SidebarProvider,
		SidebarTrigger
	} from '@noahbaumgartner/svelte-ui';
	import {
		ChartLine,
		LayoutGrid,
		LayoutTemplate,
		Menu,
		Printer,
		ReceiptText,
		ScrollText,
		Settings,
		ShoppingBasket,
		UtensilsCrossed
	} from '@lucide/svelte';
	import DinoMark from '$lib/components/DinoMark.svelte';
	import UserMenu from '$lib/components/UserMenu.svelte';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();

	type NavItem = {
		href: string;
		label: string;
		icon?: typeof ChartLine;
		exact?: boolean;
		queue?: boolean;
	};
	type NavEntry = NavItem | { label: string; icon: typeof ChartLine; items: NavItem[] };

	const sections: { label: string; items: NavEntry[] }[] = [
		{
			label: 'Anlass',
			items: [
				{ href: '/admin', label: 'Dashboard', icon: ChartLine, exact: true },
				{ href: '/admin/orders', label: 'Bestellungen', icon: ReceiptText },
				{ href: '/admin/print-queue', label: 'Druckwarteschlange', icon: ScrollText, queue: true }
			]
		},
		{
			label: 'Einrichtung',
			items: [
				{ href: '/admin/menu', label: 'Angebot', icon: UtensilsCrossed },
				{ href: '/admin/tables', label: 'Tische', icon: LayoutGrid },
				{ href: '/admin/printers', label: 'Drucker', icon: Printer },
				{ href: '/admin/print-template', label: 'Druckvorlage', icon: LayoutTemplate },
				{
					label: 'Verwaltung',
					icon: Settings,
					items: [
						{ href: '/admin/users', label: 'Benutzer' },
						{ href: '/admin/settings', label: 'Einstellungen' },
						{ href: '/admin/database', label: 'Datenbank' }
					]
				}
			]
		}
	];

	function isActive(href: string, exact = false) {
		const path = page.url.pathname;
		return exact ? path === href : path === href || path.startsWith(href + '/');
	}

	const submenus = sections.flatMap((section) => section.items.filter((entry) => 'items' in entry));

	function hasActiveItem(submenu: (typeof submenus)[number]) {
		return submenu.items.some((item) => isActive(item.href, item.exact));
	}

	// Open or closed by the user; a submenu that holds the current page opens on navigation
	let expanded = $state(
		Object.fromEntries(submenus.map((submenu) => [submenu.label, hasActiveItem(submenu)]))
	);

	$effect(() => {
		for (const submenu of submenus) {
			if (hasActiveItem(submenu)) expanded[submenu.label] = true;
		}
	});

	function badge(item: NavItem) {
		return item.queue && data.pendingPrintJobs > 0 ? data.pendingPrintJobs : undefined;
	}
</script>

<SidebarProvider>
	<Sidebar collapsible="offcanvas" labels={{ close: 'Menü schliessen' }}>
		<SidebarHeader class="admin-sidebar-header" labels={{ close: 'Menü schliessen' }}>
			<a class="brand" href={resolve('/admin')}>
				<span class="brand-name">
					<DinoMark size={22} color="var(--color-accent)" />
					dinoo
				</span>
				<span class="brand-event">{data.eventName ?? data.database}</span>
			</a>
		</SidebarHeader>
		<SidebarContent>
			{#each sections as section (section.label)}
				<SidebarGroup label={section.label}>
					<SidebarMenu>
						{#each section.items as entry (entry.label)}
							{#if 'items' in entry}
								<SidebarMenuItem
									icon={entry.icon}
									active={!expanded[entry.label] && hasActiveItem(entry)}
									bind:expanded={expanded[entry.label]}
								>
									{entry.label}
									{#snippet items()}
										{#each entry.items as item (item.href)}
											<SidebarMenuItem
												href={item.href}
												icon={item.icon}
												active={isActive(item.href, item.exact)}
												badge={badge(item)}>{item.label}</SidebarMenuItem
											>
										{/each}
									{/snippet}
								</SidebarMenuItem>
							{:else}
								<SidebarMenuItem
									href={entry.href}
									icon={entry.icon}
									active={isActive(entry.href, entry.exact)}
									badge={badge(entry)}>{entry.label}</SidebarMenuItem
								>
							{/if}
						{/each}
					</SidebarMenu>
				</SidebarGroup>
			{/each}
		</SidebarContent>
		<SidebarFooter>
			<SidebarMenu>
				<SidebarMenuItem href="/order" icon={ShoppingBasket}>Zum Bestellen</SidebarMenuItem>
			</SidebarMenu>
		</SidebarFooter>
	</Sidebar>
	<SidebarInset>
		<header class="topbar">
			<span class="trigger-desktop">
				<SidebarTrigger label="Navigation umschalten" variant="ghost" size="md" />
			</span>
			<span class="topbar-title">Admin</span>
			<span class="topbar-spacer"></span>
			<UserMenu user={data.user} />
			<!-- On phones the menu button sits top right, as in the ordering view -->
			<span class="trigger-mobile">
				<SidebarTrigger label="Menü öffnen" variant="secondary" size="md" icon={Menu} />
			</span>
		</header>
		<main class="admin-main">
			{@render children()}
		</main>
	</SidebarInset>
</SidebarProvider>

<style>
	.brand {
		display: flex;
		flex-direction: column;
		gap: 2px;
		padding: 4px 8px;
		color: var(--color-text);
		text-decoration: none;
		overflow: hidden;
		white-space: nowrap;
	}

	.brand-name {
		display: flex;
		align-items: center;
		gap: 8px;
		font-family: var(--font-display);
		font-size: 18px;
		font-weight: 700;
		letter-spacing: -0.02em;
	}

	.brand-event {
		overflow: hidden;
		color: var(--color-text-muted);
		font-size: 12px;
		text-overflow: ellipsis;
	}

	.topbar {
		position: sticky;
		top: 0;
		z-index: 10;
		display: flex;
		align-items: center;
		gap: 8px;
		/* Same inset on every side: 32px controls (trigger, avatar) in a 56px bar */
		padding: 12px;
		border-bottom: 1px solid var(--color-border);
		background-color: var(--color-bg);
	}

	.trigger-desktop,
	.trigger-mobile {
		display: contents;
	}

	/* Same breakpoint as the sidebar's mobile drawer */
	@media (max-width: 767px) {
		.trigger-desktop {
			display: none;
		}

		/* Without the left trigger the title lines up with the content, as the ordering logo does */
		.topbar {
			padding-inline-start: var(--gutter);
		}
	}

	@media (min-width: 768px) {
		.trigger-mobile {
			display: none;
		}
	}

	/* The drawer's close button takes the place and size of the menu button that opened it.
	   The drawer spans the viewport, so its edges are the top bar's edges. */
	@media (max-width: 767px) {
		:global(.admin-sidebar-header) {
			padding-inline-end: 56px;
		}

		:global(.admin-sidebar-header > .button) {
			position: absolute;
			top: 12px;
			right: 12px;
			width: 32px;
			height: 32px;
			border-radius: 10px;
		}

		:global(.admin-sidebar-header > .button .button-icon) {
			width: 16px;
			height: 16px;
		}
	}

	.topbar-title {
		font-weight: 600;
	}

	.topbar-spacer {
		flex: 1;
	}

	.admin-main {
		width: 100%;
		max-width: calc(var(--content-max-width) + 2 * var(--gutter));
		margin: 0 auto;
		padding: 24px var(--gutter) 80px;
	}
</style>
