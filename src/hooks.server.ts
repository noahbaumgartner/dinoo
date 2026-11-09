import { redirect, type Handle, type ServerInit } from '@sveltejs/kit';
import { app } from '$lib/server/app';

const PUBLIC_PATHS = new Set(['/login', '/setup']);

/** Opens the active database and starts the print worker at boot, not on the first request. */
export const init: ServerInit = () => {
	app();
};

export const handle: Handle = async ({ event, resolve }) => {
	const runtime = app();
	const { services } = runtime;
	event.locals.services = services;
	event.locals.user = await services.users.currentUser(event.request.headers);

	const path = event.url.pathname;
	if (services.users.needsSetup()) {
		if (path !== '/setup') redirect(303, '/setup');
		return resolve(event);
	}
	if (!PUBLIC_PATHS.has(path) && !event.locals.user) {
		const target = path === '/' ? '' : `?redirectTo=${encodeURIComponent(path + event.url.search)}`;
		redirect(303, `/login${target}`);
	}
	// Service staff who open an admin link (e.g. a bookmark) land on their start page instead.
	if ((path === '/admin' || path.startsWith('/admin/')) && event.locals.user?.role !== 'admin') {
		redirect(303, '/');
	}
	return resolve(event);
};
