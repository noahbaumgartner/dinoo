<script lang="ts">
	import { textScale, TICKET_WIDTH, type Ticket } from '$lib/print/ticket';

	/** A ticket as it comes out of the receipt printer: 42 columns, enlarged characters scaled. */
	let { ticket, label = 'Vorschau des Bestellzettels' }: { ticket: Ticket; label?: string } =
		$props();

	const justify = { left: 'flex-start', center: 'center', right: 'flex-end' } as const;
</script>

<div class="paper" role="img" aria-label={label}>
	{#each ticket.lines as line, index (index)}
		{#if line.type === 'text'}
			{@const scale = textScale(line)}
			<div
				class="line"
				style:height="{scale.height * 1.3}em"
				style:justify-content={justify[line.align ?? 'left']}
			>
				<!-- The outer cell takes the scaled width in the layout, the inner text is scaled visually -->
				<span class="cell" style:width="{line.text.length * scale.width}ch">
					<span
						class={['glyphs', { bold: line.bold, underline: line.underline, invert: line.invert }]}
						style:transform="scale({scale.width}, {scale.height})">{line.text}</span
					>
				</span>
			</div>
		{:else if line.type === 'pair'}
			<div class={['line', 'pair', { bold: line.bold }]}>
				<span>{line.left}</span><span>{line.right}</span>
			</div>
		{:else if line.type === 'rule'}
			<div class="line">{(line.char ?? '-').repeat(TICKET_WIDTH)}</div>
		{:else}
			{#each { length: line.lines ?? 1 }, feed (feed)}
				<div class="line"></div>
			{/each}
		{/if}
	{/each}
</div>

<style>
	/* Thermal paper stays white in dark mode too. */
	.paper {
		width: calc(42ch + 32px);
		max-width: 100%;
		padding: 20px 16px 28px;
		overflow: hidden;
		border-radius: 4px;
		background: #fff;
		box-shadow:
			0 1px 2px rgb(0 0 0 / 0.12),
			0 8px 24px rgb(0 0 0 / 0.08);
		color: #111;
		font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
		font-size: 12px;
		line-height: 1.3;
		/* The cut */
		mask-image: linear-gradient(to bottom, #000 calc(100% - 6px), transparent);
	}

	.line {
		display: flex;
		min-height: 1.3em;
		white-space: pre;
	}

	.pair {
		justify-content: space-between;
	}

	.cell {
		display: inline-block;
		flex-shrink: 0;
	}

	.glyphs {
		display: inline-block;
		transform-origin: 0 0;
		white-space: pre;
	}

	.bold {
		font-weight: 700;
	}

	.underline {
		text-decoration: underline;
	}

	.invert {
		background: #111;
		color: #fff;
	}
</style>
