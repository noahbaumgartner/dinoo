<script lang="ts">
	import { Button } from '@noahbaumgartner/svelte-ui';
	import { Camera, CameraOff, ImageUp } from '@lucide/svelte';
	import jsQR from 'jsqr';
	import { onDestroy } from 'svelte';

	let { ondetect }: { ondetect: (content: string) => void } = $props();

	let video = $state<HTMLVideoElement | null>(null);
	let fileInput = $state<HTMLInputElement | null>(null);
	let stream: MediaStream | null = null;
	let scanning = $state(false);
	let message = $state<string | null>(null);
	let frame = 0;

	// Camera access needs a secure context: https or http://localhost on the server laptop.
	const cameraAvailable =
		typeof window !== 'undefined' && window.isSecureContext && !!navigator.mediaDevices;

	function decode(source: CanvasImageSource, width: number, height: number): string | null {
		const canvas = document.createElement('canvas');
		const scale = Math.min(1, 1024 / Math.max(width, height));
		canvas.width = Math.round(width * scale);
		canvas.height = Math.round(height * scale);
		const context = canvas.getContext('2d', { willReadFrequently: true });
		if (!context) return null;
		context.drawImage(source, 0, 0, canvas.width, canvas.height);
		const image = context.getImageData(0, 0, canvas.width, canvas.height);
		return jsQR(image.data, image.width, image.height)?.data ?? null;
	}

	async function startCamera() {
		message = null;
		try {
			stream = await navigator.mediaDevices.getUserMedia({
				video: { facingMode: 'environment' },
				audio: false
			});
			scanning = true;
			await Promise.resolve();
			if (!video) return;
			video.srcObject = stream;
			await video.play();
			tick();
		} catch {
			message = 'Die Kamera konnte nicht gestartet werden.';
			stopCamera();
		}
	}

	function tick() {
		if (!scanning || !video) return;
		if (video.readyState >= 2) {
			const content = decode(video, video.videoWidth, video.videoHeight);
			if (content) {
				stopCamera();
				ondetect(content);
				return;
			}
		}
		frame = requestAnimationFrame(tick);
	}

	function stopCamera() {
		scanning = false;
		// Also runs on the server (onDestroy during SSR), where there are no animation frames.
		if (frame) cancelAnimationFrame(frame);
		frame = 0;
		stream?.getTracks().forEach((track) => track.stop());
		stream = null;
	}

	async function readFile(event: Event) {
		message = null;
		const file = (event.currentTarget as HTMLInputElement).files?.[0];
		if (!file) return;
		try {
			const bitmap = await createImageBitmap(file);
			const content = decode(bitmap, bitmap.width, bitmap.height);
			bitmap.close();
			if (content) ondetect(content);
			else message = 'Auf dem Bild wurde kein QR-Code gefunden.';
		} catch {
			message = 'Das Bild konnte nicht gelesen werden.';
		} finally {
			if (fileInput) fileInput.value = '';
		}
	}

	onDestroy(stopCamera);
</script>

<div class="reader stack">
	<div class="row">
		{#if cameraAvailable}
			{#if scanning}
				<Button variant="secondary" icon={CameraOff} onclick={stopCamera}>Scannen beenden</Button>
			{:else}
				<Button variant="secondary" icon={Camera} onclick={startCamera}>Mit Kamera scannen</Button>
			{/if}
		{/if}
		<Button variant="secondary" icon={ImageUp} onclick={() => fileInput?.click()}
			>Foto des QR-Codes wählen</Button
		>
		<input
			bind:this={fileInput}
			type="file"
			accept="image/*"
			capture="environment"
			class="visually-hidden"
			tabindex="-1"
			aria-hidden="true"
			onchange={readFile}
		/>
	</div>
	{#if !cameraAvailable}
		<p class="muted small">
			Die Live-Kamera geht ohne HTTPS nur direkt am Server-Laptop (http://localhost). Auf anderen
			Geräten ein Foto des QR-Codes wählen oder aufnehmen.
		</p>
	{/if}
	{#if scanning}
		<!-- svelte-ignore a11y_media_has_caption -->
		<video bind:this={video} class="video" playsinline muted></video>
	{/if}
	{#if message}<p class="form-error" role="alert">{message}</p>{/if}
</div>

<style>
	.video {
		width: 100%;
		max-width: 360px;
		aspect-ratio: 1;
		border-radius: var(--radius);
		background-color: #000;
		object-fit: cover;
	}

	.small {
		font-size: 13px;
	}
</style>
