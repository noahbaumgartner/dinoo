<script lang="ts">
	import '@noahbaumgartner/svelte-ui/tokens.css';
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { Toaster } from '@noahbaumgartner/svelte-ui';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<meta name="theme-color" content="#0a0a0a" />
	<title>dinoo</title>
</svelte:head>

{@render children()}

<Toaster label="Meldungen" locale="de-CH" />
