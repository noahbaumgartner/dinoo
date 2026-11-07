<script lang="ts">
	import { tick } from 'svelte';
	import {
		Button,
		Field,
		Input,
		Label,
		NumberStepper,
		Tabs,
		Toggle
	} from '@noahbaumgartner/svelte-ui';
	import {
		Bold,
		Contrast,
		TextAlignCenter,
		TextAlignEnd,
		TextAlignStart,
		Underline
	} from '@lucide/svelte';
	import {
		PLACEHOLDERS,
		placeholdersFor,
		type TemplateLine,
		type TextContext
	} from '$lib/print/template';
	import { MAX_SCALE, type TextAlign } from '$lib/print/ticket';

	/** Text with placeholders and its style: a text block, or a line of the items block. */
	let {
		line = $bindable(),
		context,
		id,
		label
	}: { line: TemplateLine; context: TextContext; id: string; label: string } = $props();

	let input = $state<HTMLInputElement | null>(null);

	const aligns = [
		{ value: 'left', label: 'Links', icon: TextAlignStart },
		{ value: 'center', label: 'Zentriert', icon: TextAlignCenter },
		{ value: 'right', label: 'Rechts', icon: TextAlignEnd }
	] satisfies { value: TextAlign; label: string; icon: typeof Bold }[];

	/** Inserts a placeholder at the cursor (or at the end) and keeps typing there. */
	async function insert(name: string) {
		const token = `{${name}}`;
		const start = input?.selectionStart ?? line.text.length;
		const end = input?.selectionEnd ?? start;
		line.text = line.text.slice(0, start) + token + line.text.slice(end);
		await tick();
		input?.focus();
		input?.setSelectionRange(start + token.length, start + token.length);
	}
</script>

<div class="line-fields">
	<Field>
		<Label for={id}>{label}</Label>
		<Input {id} bind:ref={input} bind:value={line.text} spellcheck={false} autocomplete="off" />
		<div class="chips" role="group" aria-label="Platzhalter einfügen">
			{#each placeholdersFor(context) as name (name)}
				<Button
					variant="secondary"
					size="sm"
					onclick={() => insert(name)}
					aria-label={`Platzhalter ${PLACEHOLDERS[name].label} einfügen`}
					>{PLACEHOLDERS[name].label}</Button
				>
			{/each}
		</div>
	</Field>

	<div class="style">
		<Tabs size="sm" label="Ausrichtung" options={aligns} bind:value={line.style.align}>
			{#snippet tab(option)}
				<option.icon size={16} aria-hidden="true" /><span class="visually-hidden"
					>{option.label}</span
				>
			{/snippet}
		</Tabs>
		<span class="scale">
			<span class="muted">Breite</span>
			<NumberStepper
				label="Breite"
				decreaseLabel="Weniger"
				increaseLabel="Mehr"
				min={1}
				max={MAX_SCALE}
				format={(v) => `${v}×`}
				bind:value={line.style.width}
			/>
		</span>
		<span class="scale">
			<span class="muted">Höhe</span>
			<NumberStepper
				label="Höhe"
				decreaseLabel="Weniger"
				increaseLabel="Mehr"
				min={1}
				max={MAX_SCALE}
				format={(v) => `${v}×`}
				bind:value={line.style.height}
			/>
		</span>
		<span class="icon-actions">
			<Toggle size="sm" icon={Bold} label="Fett" bind:pressed={line.style.bold} />
			<Toggle
				size="sm"
				icon={Underline}
				label="Unterstrichen"
				bind:pressed={line.style.underline}
			/>
			<Toggle
				size="sm"
				icon={Contrast}
				label="Invertiert (weiss auf schwarz)"
				bind:pressed={line.style.invert}
			/>
		</span>
	</div>
</div>

<style>
	.line-fields {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}

	.style {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 12px 16px;
	}

	.scale {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		font-size: 14px;
	}
</style>
