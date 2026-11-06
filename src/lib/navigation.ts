import { goto } from '$app/navigation';
import { page } from '$app/state';

/**
 * Updates query parameters of the current page (filters live in the URL, so reloads and the back
 * button keep them). `null` removes a parameter; an empty string keeps it, e.g. an explicit «all».
 */
export function setSearchParams(changes: Record<string, string | null>, replace = false) {
	const params = new URLSearchParams(replace ? '' : page.url.search);
	for (const [name, value] of Object.entries(changes)) {
		if (value === null) params.delete(name);
		else params.set(name, value);
	}
	const query = params.toString();
	// Same route, only the query changes, so there is nothing to resolve.
	// oxlint-disable-next-line svelte/no-navigation-without-resolve
	return goto(`${page.url.pathname}${query ? `?${query}` : ''}`, {
		keepFocus: true,
		noScroll: true
	});
}
