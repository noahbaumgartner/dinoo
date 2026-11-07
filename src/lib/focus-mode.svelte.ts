import { getContext, setContext } from 'svelte';

/** A page that must not be left by the menu, e.g. an order in progress. */
export type Focus = {
	/** Shown in the header instead of the navigation. */
	title: string;
	/** Called by the header's cancel button. */
	onexit: () => void;
};

export class FocusMode {
	current = $state<Focus | null>(null);
}

const KEY = Symbol('focus-mode');

/** Created by the app layout, which swaps its navigation for the focus header. */
export function provideFocusMode() {
	return setContext(KEY, new FocusMode());
}

export function useFocusMode() {
	return getContext<FocusMode>(KEY);
}
