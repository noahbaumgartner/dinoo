<script lang="ts">
	/** The dinoo dinosaur as a one-colour mark; takes the surrounding text colour unless `color` is set. */
	let { size = 24, color = 'currentColor' }: { size?: number | string; color?: string } = $props();

	const maskId = $props.id();
</script>

<svg
	class="dino-mark"
	viewBox="0 0 32 32"
	width={size}
	height={size}
	fill={color}
	aria-hidden="true"
	focusable="false"
>
	<mask id={maskId}>
		<rect width="32" height="32" fill="#fff" />
		<circle cx="23.6" cy="7.7" r="1.1" fill="#000" />
	</mask>
	<g mask="url(#{maskId})" stroke={color} stroke-linejoin="round" stroke-linecap="round">
		<path
			stroke-width="1"
			d="M3.2 19.6C7.2 19.2 9.6 16.8 11.6 12.8C12.6 10.8 14 9.8 15.2 9.2V8C15.2 5.8 16.8 4.6 18.8 4.6H26C28 4.6 29 5.8 29 7.6V9.6C29 10.6 28.3 11.3 27.3 11.3H23C22.4 11.3 22 11.7 22 12.3V20.4C22 22 20.6 23 18.8 23H13.6C9.6 23 6 22.2 3.9 21.4C3.2 21.1 3 20.4 3.2 19.6Z"
		/>
		<path fill="none" stroke-width="3" d="M12.2 22.5V26.6H15.6" />
		<path fill="none" stroke-width="3" d="M19.8 22.5V26.6H23.2" />
		<path fill="none" stroke-width="1.8" d="M22 15.6L24.8 17.4" />
	</g>
</svg>

<style>
	.dino-mark {
		flex: none;
		align-self: center;
	}
</style>
