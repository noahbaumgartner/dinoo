<script lang="ts">
	import { Popover } from '@noahbaumgartner/svelte-ui';
	import { Check, ChevronDown } from '@lucide/svelte';
	import { CATEGORY_COLORS, type CategoryColor } from '$lib/category-colors';

	type Props = {
		/** Bindable color key. */
		value: CategoryColor;
		/** Form field name; the key is submitted through a hidden input. */
		name?: string;
		id?: string;
	};

	let { value = $bindable(), name = 'color', id }: Props = $props();

	let open = $state(false);
	let grid = $state<HTMLDivElement | null>(null);
	let current = $derived(
		CATEGORY_COLORS.find((color) => color.key === value) ?? CATEGORY_COLORS[0]
	);

	// The popover focuses its first button; move focus to the selected color instead.
	$effect(() => {
		if (open && grid) grid.querySelector<HTMLElement>('[aria-checked="true"]')?.focus();
	});

	function select(key: CategoryColor) {
		value = key;
		open = false;
	}

	/** Arrow keys move through the 5 × 2 grid like a radio group. */
	function keydown(event: KeyboardEvent) {
		const step = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: 5, ArrowUp: -5 }[event.key];
		if (step === undefined || !grid) return;
		event.preventDefault();
		const buttons = [...grid.querySelectorAll<HTMLElement>('button')];
		const index = buttons.indexOf(document.activeElement as HTMLElement);
		buttons[(index + step + buttons.length) % buttons.length]?.focus();
	}
</script>

<input type="hidden" {name} {value} />
<Popover bind:open side="bottom" align="start" class="color-popover" aria-label="Farbe wählen">
	{#snippet trigger(props)}
		<button {...props} {id} type="button" class="trigger">
			<span class="swatch" style:background-color={current.value}></span>
			<span class="trigger-label">{current.label}</span>
			<ChevronDown size={16} aria-hidden="true" />
		</button>
	{/snippet}
	<div
		bind:this={grid}
		class="grid"
		role="radiogroup"
		aria-label="Farbe"
		tabindex="-1"
		onkeydown={keydown}
	>
		{#each CATEGORY_COLORS as color (color.key)}
			<button
				type="button"
				role="radio"
				aria-checked={color.key === value}
				aria-label={color.label}
				title={color.label}
				class="option"
				style:background-color={color.value}
				onclick={() => select(color.key)}
			>
				{#if color.key === value}<Check size={18} strokeWidth={3} aria-hidden="true" />{/if}
			</button>
		{/each}
	</div>
</Popover>

<style>
	/* The popover defaults to a fixed width; hug the 5-column grid instead. */
	:global(.color-popover) {
		width: fit-content;
	}

	.trigger {
		display: flex;
		align-items: center;
		gap: 10px;
		width: 100%;
		min-height: 44px;
		padding: 0 12px;
		border: 1px solid var(--color-border);
		border-radius: 10px;
		background-color: var(--color-surface);
		color: var(--color-text);
		font: inherit;
		text-align: left;
		cursor: pointer;
	}

	.trigger:focus-visible {
		outline: 2px solid var(--color-accent);
		outline-offset: 2px;
	}

	.trigger-label {
		flex: 1;
	}

	.swatch {
		width: 20px;
		height: 20px;
		border-radius: 6px;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(5, 40px);
		gap: 8px;
		outline: none;
	}

	.option {
		display: grid;
		place-items: center;
		width: 40px;
		height: 40px;
		padding: 0;
		border: 0;
		border-radius: 10px;
		color: #fff;
		cursor: pointer;
		transition: transform 120ms ease;
	}

	.option:hover {
		transform: scale(1.08);
	}

	.option[aria-checked='true'] {
		box-shadow:
			0 0 0 2px var(--color-bg),
			0 0 0 4px var(--color-text);
	}

	.option:focus-visible {
		outline: 2px solid var(--color-accent);
		outline-offset: 3px;
	}

	@media (prefers-reduced-motion: reduce) {
		.option {
			transition: none;
		}
	}
</style>
