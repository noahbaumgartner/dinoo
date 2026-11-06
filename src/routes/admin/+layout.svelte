<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import {
		Button,
		Sidebar,
		SidebarContent,
		SidebarFooter,
		SidebarGroup,
		SidebarHeader,
		SidebarInset,
		SidebarMenu,
		SidebarMenuItem,
		SidebarProvider,
		SidebarTrigger,
		ThemeToggle
	} from '@noahbaumgartner/svelte-ui';
	import {
		ChartLine,
		Database,
		LayoutGrid,
		LogOut,
		Printer,
		ReceiptText,
		ScrollText,
		Settings,
		ShoppingBasket,
		Users,
		UtensilsCrossed
	} from '@lucide/svelte';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();

	const sections = [
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
				{ href: '/admin/printers', label: 'Drucker', icon: Printer },
				{ href: '/admin/tables', label: 'Tische', icon: LayoutGrid },
				{ href: '/admin/users', label: 'Benutzer', icon: Users },
				{ href: '/admin/settings', label: 'Einstellungen', icon: Settings },
				{ href: '/admin/database', label: 'Datenbank', icon: Database }
			]
		}
	];

	function isActive(href: string, exact = false) {
		const path = page.url.pathname;
		return exact ? path === href : path === href || path.startsWith(href + '/');
	}
</script>

<SidebarProvider>
	<Sidebar collapsible="offcanvas" labels={{ close: 'Navigation schliessen' }}>
		<SidebarHeader>
			<a class="brand" href={resolve('/admin')}>
				<span class="brand-name">dinoo</span>
				<span class="brand-event">{data.eventName ?? data.database}</span>
			</a>
		</SidebarHeader>
		<SidebarContent>
			{#each sections as section (section.label)}
				<SidebarGroup label={section.label}>
					<SidebarMenu>
						{#each section.items as item (item.href)}
							<SidebarMenuItem
								href={item.href}
								icon={item.icon}
								active={isActive(item.href, item.exact)}
								badge={item.queue && data.pendingPrintJobs > 0 ? data.pendingPrintJobs : undefined}
								>{item.label}</SidebarMenuItem
							>
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
			<SidebarTrigger label="Navigation umschalten" variant="ghost" />
			<span class="topbar-title">Admin</span>
			<span class="topbar-spacer"></span>
			<ThemeToggle labels={{ light: 'Design: Hell', dark: 'Design: Dunkel' }} />
			<form method="POST" action={resolve('/logout')}>
				<Button type="submit" variant="ghost" icon={LogOut} label="Abmelden ({data.user.name})">
					<span class="user-name">{data.user.name}</span>
				</Button>
			</form>
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
		height: 56px;
		padding: 0 var(--gutter);
		border-bottom: 1px solid var(--color-border);
		background-color: var(--color-bg);
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

	@media (max-width: 640px) {
		.user-name {
			display: none;
		}
	}
</style>
