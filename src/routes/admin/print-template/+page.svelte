<script lang="ts">
	import { enhance } from '$app/forms';
	import { beforeNavigate } from '$app/navigation';
	import { untrack } from 'svelte';
	import AdminPage from '$lib/components/AdminPage.svelte';
	import { notify } from '$lib/components/notify';
	import TemplateLineFields from '$lib/components/TemplateLineFields.svelte';
	import TicketPreview from '$lib/components/TicketPreview.svelte';
	import {
		lineStyle,
		MAX_BLOCKS,
		MAX_FEED,
		renderTemplate,
		sampleTicketData,
		validateTemplate,
		type TemplateBlock,
		type TicketTemplate
	} from '$lib/print/template';
	import {
		AlertDialog,
		Badge,
		Button,
		Card,
		CardContent,
		Dialog,
		Field,
		FieldDescription,
		Label,
		NumberStepper,
		Select,
		SortableList,
		Tabs
	} from '@noahbaumgartner/svelte-ui';
	import {
		ChevronDown,
		CircleAlert,
		List,
		Minus,
		Plus,
		Printer,
		RotateCcw,
		TextWrap,
		Trash2,
		Type,
		UnfoldVertical
	} from '@lucide/svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	type Entry = { key: string; block: TemplateBlock };

	let nextKey = 0;
	const toEntries = (template: TicketTemplate): Entry[] =>
		template.blocks.map((block) => ({ key: `b${nextKey++}`, block: structuredClone(block) }));

	// Edited locally; replaced only by an explicit reset
	let entries = $state<Entry[]>(untrack(() => toEntries(data.template)));
	let expanded = $state<string | null>(null);

	let template = $derived<TicketTemplate>({ blocks: entries.map((entry) => entry.block) });
	let json = $derived(JSON.stringify(template));
	let savedJson = $derived(JSON.stringify(data.template));
	let dirty = $derived(json !== savedJson);

	let validation = $derived(validateTemplate(template));
	let blockErrors = $derived.by(() => {
		const byBlock: Record<number, string[]> = {};
		for (const { block, message } of validation.errors) {
			if (block !== null) byBlock[block] = [...(byBlock[block] ?? []), message];
		}
		return byBlock;
	});
	let templateErrors = $derived(validation.errors.filter((e) => e.block === null));
	let valid = $derived(validation.errors.length === 0);

	const now = new Date();
	let preview = $derived(
		renderTemplate(
			validation.template,
			sampleTicketData({
				eventName: data.eventName,
				serviceName: data.serviceName,
				printerName: data.printers[0]?.name ?? 'Küche',
				now
			})
		)
	);

	beforeNavigate(({ cancel, type }) => {
		if (!dirty) return;
		// Leaving the site shows the browser's own dialog
		if (type === 'leave') cancel();
		else if (!confirm('Die Druckvorlage hat ungespeicherte Änderungen. Trotzdem verlassen?')) {
			cancel();
		}
	});

	const icons = { text: Type, items: List, rule: Minus, feed: UnfoldVertical };

	function title(block: TemplateBlock) {
		switch (block.type) {
			case 'text':
				return block.text.trim() ? block.text : '(leerer Text)';
			case 'items':
				return `Positionen: ${block.line.text}`;
			case 'rule':
				return `Linie ${block.char.repeat(12)}`;
			case 'feed':
				return block.lines === 1 ? 'Abstand: 1 Zeile' : `Abstand: ${block.lines} Zeilen`;
		}
	}

	function add(type: 'text' | 'rule' | 'feed') {
		const block: TemplateBlock =
			type === 'text'
				? { type, text: '', style: lineStyle() }
				: type === 'rule'
					? { type, char: '-' }
					: { type, lines: 1 };
		const entry = { key: `b${nextKey++}`, block };
		entries.push(entry);
		expanded = type === 'feed' || type === 'rule' ? null : entry.key;
	}

	function remove(key: string) {
		entries = entries.filter((entry) => entry.key !== key);
	}

	const position = (_: unknown, index: number, total: number) => `Position ${index} von ${total}`;

	// Test print
	let testOpen = $state(false);
	let resetOpen = $state(false);
	let printerId = $state(
		untrack(() => (data.printers[0] ? String(data.printers[0].id) : undefined))
	);
</script>

<AdminPage
	title="Druckvorlage"
	description="Legt fest, was auf jedem Bestellzettel steht, wo und wie gross. Gilt für alle Drucker."
>
	{#snippet actions()}
		<Button
			variant="ghost"
			icon={RotateCcw}
			disabled={data.isDefault && !dirty}
			onclick={() => (resetOpen = true)}>Standard</Button
		>
		<Button variant="secondary" icon={Printer} onclick={() => (testOpen = true)}>Testdruck</Button>
		<form method="POST" action="?/save" use:enhance={notify()}>
			<input type="hidden" name="template" value={json} />
			<Button type="submit" disabled={!dirty || !valid}>Speichern</Button>
		</form>
	{/snippet}

	<div class="editor">
		<div class="blocks stack">
			{#if templateErrors.length}
				<div class="form-error" role="alert">
					{#each templateErrors as error (error.message)}<p>{error.message}</p>{/each}
				</div>
			{/if}

			<Card class="block-card">
				<CardContent>
					<SortableList
						class="block-list"
						items={entries}
						key={(entry) => entry.key}
						handleLabel={(entry) => `${title(entry.block)} verschieben`}
						announce={position}
						onreorder={(ordered) => (entries = ordered)}
					>
						{#snippet item(entry, handle)}
							{@const index = entries.indexOf(entry)}
							{@const errors = blockErrors[index] ?? []}
							{@const Icon = icons[entry.block.type]}
							{@const open = expanded === entry.key}
							<div class={['block', { 'block--open': open }]}>
								<div class="block-head">
									<span class="block-handle">{@render handle()}</span>
									<Icon size={16} class="muted" aria-hidden="true" />
									<button
										type="button"
										class="block-title"
										aria-expanded={open}
										aria-controls="block-{entry.key}"
										onclick={() => (expanded = open ? null : entry.key)}
									>
										<span class="block-text">{title(entry.block)}</span>
										{#if errors.length}
											<Badge icon={CircleAlert}
												>{errors.length === 1 ? 'Fehler' : `${errors.length} Fehler`}</Badge
											>
										{:else if preview.wrapped.has(index)}
											<Badge icon={TextWrap}>bricht um</Badge>
										{/if}
										<ChevronDown size={16} class="chevron" aria-hidden="true" />
									</button>
									{#if entry.block.type !== 'items'}
										<Button
											variant="ghost"
											size="sm"
											icon={Trash2}
											label="Block löschen"
											onclick={() => remove(entry.key)}
										/>
									{:else}
										<!-- Keeps the chevron in line with the rows that can be deleted -->
										<span class="delete-spacer" aria-hidden="true"></span>
									{/if}
								</div>

								{#if open}
									<div class="block-body stack" id="block-{entry.key}">
										{#if entry.block.type === 'text'}
											<TemplateLineFields
												bind:line={entry.block}
												context="text"
												id="text-{entry.key}"
												label="Text"
											/>
										{:else if entry.block.type === 'items'}
											<FieldDescription>
												Wird für jede Position des Zettels wiederholt. Die Notizzeile erscheint nur
												bei Positionen mit Notiz.
											</FieldDescription>
											<TemplateLineFields
												bind:line={entry.block.line}
												context="line"
												id="line-{entry.key}"
												label="Positionszeile"
											/>
											<TemplateLineFields
												bind:line={entry.block.note}
												context="note"
												id="note-{entry.key}"
												label="Notizzeile"
											/>
										{:else if entry.block.type === 'rule'}
											<Field>
												<Label>Linienzeichen</Label>
												<Tabs
													size="sm"
													label="Linienzeichen"
													options={[
														{ value: '-', label: 'Einfach  - - -' },
														{ value: '=', label: 'Doppelt  = = =' }
													]}
													bind:value={entry.block.char}
												/>
											</Field>
										{:else}
											<span class="row">
												<span class="muted">Leerzeilen</span>
												<NumberStepper
													label="Leerzeilen"
													decreaseLabel="Weniger"
													increaseLabel="Mehr"
													min={1}
													max={MAX_FEED}
													bind:value={entry.block.lines}
												/>
											</span>
										{/if}
										{#if errors.length}
											<div class="form-error" role="alert">
												{#each errors as message, i (i)}<p>{message}</p>{/each}
											</div>
										{/if}
									</div>
								{/if}
							</div>
						{/snippet}
					</SortableList>
				</CardContent>
			</Card>

			<div class="row">
				<span class="muted">Block hinzufügen:</span>
				<Button
					variant="secondary"
					size="sm"
					icon={Plus}
					disabled={entries.length >= MAX_BLOCKS}
					onclick={() => add('text')}>Text</Button
				>
				<Button
					variant="secondary"
					size="sm"
					icon={Plus}
					disabled={entries.length >= MAX_BLOCKS}
					onclick={() => add('rule')}>Linie</Button
				>
				<Button
					variant="secondary"
					size="sm"
					icon={Plus}
					disabled={entries.length >= MAX_BLOCKS}
					onclick={() => add('feed')}>Abstand</Button
				>
			</div>
		</div>

		<aside class="preview">
			<p class="muted small">
				{dirty ? 'Vorschau, noch nicht gespeichert' : 'Vorschau mit Beispieldaten'}
			</p>
			<TicketPreview ticket={preview.ticket} />
		</aside>
	</div>
</AdminPage>

<Dialog bind:open={testOpen} title="Testdruck mit Vorlage" closeLabel="Schliessen">
	<form
		id="test-form"
		method="POST"
		action="?/test"
		class="stack"
		use:enhance={notify(() => (testOpen = false))}
	>
		<input type="hidden" name="template" value={json} />
		{#if data.printers.length === 0}
			<p class="muted">Es gibt keinen aktiven Drucker.</p>
		{:else}
			<Field>
				<Label for="test-printer">Drucker</Label>
				<Select
					id="test-printer"
					name="printerId"
					bind:value={printerId}
					options={data.printers.map((p) => ({ value: String(p.id), label: p.name }))}
				/>
				<FieldDescription>
					Gedruckt wird die Vorlage, wie sie gerade hier steht (auch ungespeichert), mit einer
					Beispielbestellung.
				</FieldDescription>
			</Field>
			{#if !valid}
				<p class="form-error">Bitte zuerst die Fehler in der Vorlage beheben.</p>
			{/if}
		{/if}
	</form>
	{#snippet actions(close)}
		<Button variant="secondary" onclick={close}>Abbrechen</Button>
		<Button
			type="submit"
			form="test-form"
			icon={Printer}
			disabled={!valid || data.printers.length === 0}>Drucken</Button
		>
	{/snippet}
</Dialog>

<AlertDialog
	bind:open={resetOpen}
	title="Standardvorlage wiederherstellen?"
	description="Die aktuelle Druckvorlage wird durch die Standardvorlage ersetzt. Das lässt sich nicht rückgängig machen."
>
	{#snippet actions(close)}
		<Button variant="secondary" onclick={close}>Abbrechen</Button>
		<form
			method="POST"
			action="?/reset"
			use:enhance={notify(() => {
				entries = toEntries(data.template);
				expanded = null;
				close();
			})}
		>
			<Button type="submit" icon={RotateCcw}>Wiederherstellen</Button>
		</form>
	{/snippet}
</AlertDialog>

<style>
	.editor {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		align-items: start;
		gap: 24px;
	}

	@media (min-width: 1000px) {
		.editor {
			grid-template-columns: minmax(0, 1fr) auto;
		}

		.preview {
			position: sticky;
			top: 80px;
		}
	}

	.preview {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
	}

	.small {
		font-size: 13px;
	}

	/* The rows bring their own height; card padding above the first and below the last row would
	   make those look taller than the rest. */
	:global(.card.block-card) {
		padding-block: 0;
	}

	:global(.block-list) {
		--sortable-list-dragging-background: var(--color-fill);
	}

	.block {
		position: relative;
	}

	/* Divider from the icon on, so the handles stand apart in the gutter */
	.block::after {
		position: absolute;
		right: 0;
		bottom: 0;
		left: 28px;
		border-bottom: 1px solid var(--color-border);
		content: '';
	}

	:global(.block-list > :last-child) .block::after {
		display: none;
	}

	.block-head {
		display: flex;
		align-items: center;
		gap: 8px;
		min-height: 48px;
	}

	.block-handle {
		display: flex;
		margin-left: -8px;
	}

	.block-title {
		display: flex;
		flex: 1;
		align-items: center;
		gap: 8px;
		min-width: 0;
		min-height: 40px;
		padding: 0;
		border: 0;
		background: none;
		color: inherit;
		font: inherit;
		text-align: left;
		cursor: pointer;
	}

	.block-text {
		flex: 1;
		min-width: 0;
		overflow: hidden;
		font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
		font-size: 13px;
		text-overflow: ellipsis;
		white-space: pre;
	}

	.block-title :global(.chevron) {
		flex-shrink: 0;
		color: var(--color-text-muted);
		transition: transform 0.15s;
	}

	.block--open .block-title :global(.chevron) {
		transform: rotate(180deg);
	}

	.delete-spacer {
		flex-shrink: 0;
		width: 28px;
	}

	.block-body {
		padding: 4px 0 20px 28px;
	}

	.form-error p + p {
		margin-top: 4px;
	}
</style>
