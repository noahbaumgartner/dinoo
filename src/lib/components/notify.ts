import { toast } from '@noahbaumgartner/svelte-ui';
import { CircleAlert, CircleCheck } from '@lucide/svelte';
import type { SubmitFunction } from '@sveltejs/kit';

/**
 * `use:enhance` handler that shows the action's `message` or `error` as a toast and optionally runs
 * `onSuccess` (e.g. to close a dialog).
 */
export function notify(onSuccess?: () => void): SubmitFunction {
	return () =>
		async ({ result, update }) => {
			await update({ reset: false });
			if (result.type === 'success') {
				onSuccess?.();
				if (typeof result.data?.message === 'string')
					toast(result.data.message, { icon: CircleCheck });
			}
			if (result.type === 'failure' && typeof result.data?.error === 'string')
				toast(result.data.error, { icon: CircleAlert, duration: 6000 });
		};
}
