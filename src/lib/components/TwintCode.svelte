<script lang="ts">
	import QRCode from 'qrcode';

	let { content, size = 280 }: { content: string; size?: number } = $props();

	let src = $state<string | null>(null);

	// The club's static TWINT code is stored as its content and re-drawn here (F06/F07).
	$effect(() => {
		let cancelled = false;
		QRCode.toDataURL(content, { margin: 1, width: size * 2, errorCorrectionLevel: 'M' }).then(
			(url) => {
				if (!cancelled) src = url;
			},
			() => {
				if (!cancelled) src = null;
			}
		);
		return () => {
			cancelled = true;
		};
	});
</script>

<div class="twint-code" style:width="{size}px" style:height="{size}px">
	{#if src}
		<img {src} alt="TWINT-QR-Code" width={size} height={size} />
	{/if}
</div>

<style>
	.twint-code {
		display: grid;
		place-items: center;
		max-width: 100%;
		padding: 12px;
		border-radius: 16px;
		/* QR codes must stay dark on light, also in dark mode. */
		background-color: #fff;
		aspect-ratio: 1;
		height: auto !important;
	}

	img {
		display: block;
		width: 100%;
		height: auto;
		image-rendering: pixelated;
	}
</style>
