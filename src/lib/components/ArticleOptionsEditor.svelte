<script lang="ts">
	import {
		MAX_CHOICES,
		MAX_COUNT,
		MAX_OPTIONS,
		type ArticleOption,
		type OptionKind
	} from '$lib/article-options';
	import { formatAmount, parseChf } from '$lib/money';
	import { uid } from '$lib/uid';
	import { Button, Input, Label, NumberStepper, Switch } from '@noahbaumgartner/svelte-ui';
	import { ArrowDown, ArrowUp, Hash, ListChecks, Plus, ToggleRight, Trash2 } from '@lucide/svelte';

	let {
		options,
		name = 'options'
	}: {
		/** Options to start from; edits stay local and are submitted as JSON in a hidden field. */
		options: ArticleOption[];
		name?: string;
	} = $props();

	type DraftChoice = { id: string; name: string; price: string };
	type Draft = {
		id: string;
		kind: OptionKind;
		name: string;
		price: string;
		min: number;
		max: number;
		required: boolean;
		choices: DraftChoice[];
	};

	const KINDS: { kind: OptionKind; label: string; icon: typeof Hash; placeholder: string }[] = [
		{ kind: 'count', label: 'Anzahl', icon: Hash, placeholder: 'z. B. Becher' },
		{ kind: 'toggle', label: 'Schalter', icon: ToggleRight, placeholder: 'z. B. ohne Sauce' },
		{ kind: 'choice', label: 'Auswahl', icon: ListChecks, placeholder: 'z. B. Sorte' }
	];

	const price = (cents: number) => (cents ? formatAmount(cents) : '');

	function toDraft(option: ArticleOption): Draft {
		return {
			id: option.id,
			kind: option.kind,
			name: option.name,
			price: option.kind === 'choice' ? '' : price(option.priceCents),
			min: option.kind === 'count' ? option.min : 0,
			max: option.kind === 'count' ? option.max : 1,
			required: option.kind === 'choice' && option.required,
			choices:
				option.kind === 'choice'
					? option.choices.map((c) => ({ id: c.id, name: c.name, price: price(c.priceCents) }))
					: []
		};
	}

	// The dialog creates this component anew for every article, so the start value is read once.
	// svelte-ignore state_referenced_locally
	let drafts = $state(options.map(toDraft));

	/** Invalid amounts are sent as -1, so the server answers with its message. */
	const cents = (value: string) => (value.trim() ? (parseChf(value) ?? -1) : 0);

	let json = $derived(
		JSON.stringify(
			drafts.map((draft) => {
				const common = { id: draft.id, kind: draft.kind, name: draft.name };
				if (draft.kind === 'count')
					return { ...common, min: draft.min, max: draft.max, priceCents: cents(draft.price) };
				if (draft.kind === 'toggle') return { ...common, priceCents: cents(draft.price) };
				return {
					...common,
					required: draft.required,
					choices: draft.choices.map((c) => ({
						id: c.id,
						name: c.name,
						priceCents: cents(c.price)
					}))
				};
			})
		)
	);

	function add(kind: OptionKind) {
		drafts.push({
			id: uid(),
			kind,
			name: '',
			price: '',
			min: 0,
			max: 4,
			required: false,
			choices: kind === 'choice' ? [{ id: uid(), name: '', price: '' }] : []
		});
	}

	function move(index: number, by: number) {
		const [draft] = drafts.splice(index, 1);
		drafts.splice(index + by, 0, draft);
	}

	const kindOf = (kind: OptionKind) => KINDS.find((k) => k.kind === kind)!;
</script>

<input type="hidden" {name} value={json} />

<div class="options">
	{#each drafts as draft, index (draft.id)}
		{@const kind = kindOf(draft.kind)}
		{@const field = `option-${draft.id}`}
		<fieldset class="option">
			<legend class="option-kind"><kind.icon size={16} aria-hidden="true" />{kind.label}</legend>
			<div class="option-head">
				<Input
					id="{field}-name"
					aria-label="Name der Option"
					bind:value={draft.name}
					placeholder={kind.placeholder}
					maxlength={60}
				/>
				<span class="icon-actions">
					<Button
						variant="ghost"
						size="sm"
						icon={ArrowUp}
						label="Nach oben"
						disabled={index === 0}
						onclick={() => move(index, -1)}
					/>
					<Button
						variant="ghost"
						size="sm"
						icon={ArrowDown}
						label="Nach unten"
						disabled={index === drafts.length - 1}
						onclick={() => move(index, 1)}
					/>
					<Button
						variant="ghost"
						size="sm"
						icon={Trash2}
						label="Option entfernen"
						onclick={() => drafts.splice(index, 1)}
					/>
				</span>
			</div>
			{#if draft.kind === 'count'}
				<div class="option-row">
					<span>Mindestens</span>
					<NumberStepper
						bind:value={draft.min}
						min={0}
						max={MAX_COUNT}
						label="Anzahl mindestens"
						decreaseLabel="Weniger"
						increaseLabel="Mehr"
					/>
				</div>
				<div class="option-row">
					<span>Höchstens</span>
					<NumberStepper
						bind:value={draft.max}
						min={0}
						max={MAX_COUNT}
						label="Anzahl höchstens"
						decreaseLabel="Weniger"
						increaseLabel="Mehr"
					/>
				</div>
			{/if}
			{#if draft.kind !== 'choice'}
				<div class="option-row">
					<Label for="{field}-price"
						>{draft.kind === 'count' ? 'Aufpreis pro Stück (CHF)' : 'Aufpreis (CHF)'}</Label
					>
					<Input
						id="{field}-price"
						class="price"
						inputmode="decimal"
						bind:value={draft.price}
						placeholder="0.00"
					/>
				</div>
			{:else}
				<label class="option-row">
					<span>Pflicht</span>
					<Switch bind:checked={draft.required} />
				</label>
				<ul class="choices">
					{#each draft.choices as choice, choiceIndex (choice.id)}
						<li class="choice">
							<Input
								aria-label="Wert {choiceIndex + 1}"
								bind:value={choice.name}
								placeholder="z. B. Schoggi"
								maxlength={60}
							/>
							<Input
								class="price"
								aria-label="Aufpreis Wert {choiceIndex + 1} (CHF)"
								inputmode="decimal"
								bind:value={choice.price}
								placeholder="0.00"
							/>
							<Button
								variant="ghost"
								size="sm"
								icon={Trash2}
								label="Wert entfernen"
								disabled={draft.choices.length === 1}
								onclick={() => draft.choices.splice(choiceIndex, 1)}
							/>
						</li>
					{/each}
				</ul>
				<div>
					<Button
						variant="secondary"
						size="sm"
						icon={Plus}
						disabled={draft.choices.length >= MAX_CHOICES}
						onclick={() => draft.choices.push({ id: uid(), name: '', price: '' })}
						>Wert hinzufügen</Button
					>
				</div>
			{/if}
		</fieldset>
	{/each}

	{#if drafts.length < MAX_OPTIONS}
		<div class="add" role="group" aria-label="Option hinzufügen">
			{#each KINDS as kind (kind.kind)}
				<Button variant="secondary" size="sm" icon={Plus} onclick={() => add(kind.kind)}
					>{kind.label}</Button
				>
			{/each}
		</div>
	{/if}
</div>

<style>
	.options {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.option {
		display: flex;
		flex-direction: column;
		gap: 10px;
		margin: 0;
		padding: 10px 12px 12px;
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
	}

	.option-kind {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 0 4px;
		color: var(--color-text-secondary);
		font-size: 13px;
		font-weight: 600;
	}

	.option-head,
	.choice {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.option-head :global(.input),
	.choice :global(.input:first-child) {
		flex: 1;
		min-width: 0;
	}

	.option-row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
	}

	.option :global(.price) {
		width: 96px;
	}

	.choices {
		display: flex;
		flex-direction: column;
		gap: 8px;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.add {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}
</style>
