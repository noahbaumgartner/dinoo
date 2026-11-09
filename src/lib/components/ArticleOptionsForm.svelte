<script lang="ts">
	import type { ArticleOption, OptionValues } from '$lib/article-options';
	import { formatChf } from '$lib/money';
	import {
		Field,
		FieldContent,
		FieldDescription,
		FieldLegend,
		FieldSet,
		Label,
		NumberStepper,
		RadioGroup,
		RadioGroupItem,
		Switch
	} from '@noahbaumgartner/svelte-ui';

	let {
		options,
		values = $bindable(),
		id
	}: {
		options: ArticleOption[];
		/** Picked value per option id, see `OptionValues`. */
		values: OptionValues;
		/** Prefix for element ids. */
		id: string;
	} = $props();

	const NONE = '';
	const surcharge = (cents: number, suffix = '') => (cents ? `+ ${formatChf(cents)}${suffix}` : '');
</script>

<div class="options">
	{#each options as option (option.id)}
		{@const field = `${id}-${option.id}`}
		{#if option.kind === 'count'}
			<Field orientation="horizontal" class="option">
				<FieldContent>
					<Label for={field}>{option.name}</Label>
					{#if option.priceCents}
						<FieldDescription>{surcharge(option.priceCents, ' pro Stück')}</FieldDescription>
					{/if}
				</FieldContent>
				<NumberStepper
					id={field}
					size="md"
					bind:value={
						() => Number(values[option.id] ?? option.min), (value) => (values[option.id] = value)
					}
					min={option.min}
					max={option.max}
					label={option.name}
					decreaseLabel="Weniger"
					increaseLabel="Mehr"
				/>
			</Field>
		{:else if option.kind === 'toggle'}
			<Field orientation="horizontal" class="option">
				<FieldContent>
					<Label for={field}>{option.name}</Label>
					{#if option.priceCents}
						<FieldDescription>{surcharge(option.priceCents)}</FieldDescription>
					{/if}
				</FieldContent>
				<Switch
					id={field}
					bind:checked={() => values[option.id] === true, (on) => (values[option.id] = on)}
				/>
			</Field>
		{:else}
			{@const missing = option.required && !values[option.id]}
			<FieldSet class="option">
				<FieldLegend
					>{option.name}{#if option.required}<span class="required"
							>{missing ? ' · bitte wählen' : ' · Pflicht'}</span
						>{/if}</FieldLegend
				>
				<RadioGroup
					aria-label={option.name}
					bind:value={
						() => (typeof values[option.id] === 'string' ? String(values[option.id]) : NONE),
						(value) => (values[option.id] = value === NONE || value === undefined ? null : value)
					}
				>
					{#if !option.required}
						<Field orientation="horizontal">
							<RadioGroupItem value={NONE} id="{field}-none" />
							<Label for="{field}-none">Keine Auswahl</Label>
						</Field>
					{/if}
					{#each option.choices as choice (choice.id)}
						<Field orientation="horizontal">
							<RadioGroupItem value={choice.id} id="{field}-{choice.id}" />
							<Label for="{field}-{choice.id}"
								>{choice.name}
								{#if choice.priceCents}<span class="muted">{surcharge(choice.priceCents)}</span
									>{/if}</Label
							>
						</Field>
					{/each}
				</RadioGroup>
			</FieldSet>
		{/if}
	{/each}
</div>

<style>
	.options {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.required {
		color: var(--color-text-secondary);
		font-weight: 400;
	}
</style>
