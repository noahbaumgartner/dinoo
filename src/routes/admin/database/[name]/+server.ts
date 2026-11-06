import { error } from '@sveltejs/kit';
import { DomainError } from '$lib/server/services/errors';
import type { RequestHandler } from './$types';

/** Download of an event database as a consistent `.sqlite` copy (admins only, see hooks). */
export const GET: RequestHandler = async ({ locals, params }) => {
	try {
		const content = await locals.services.databases.download(params.name);
		const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');
		return new Response(new Blob([content.slice()]), {
			headers: {
				'content-type': 'application/vnd.sqlite3',
				'content-disposition': `attachment; filename="dinoo-${params.name}-${stamp}.sqlite"`,
				'cache-control': 'no-store'
			}
		});
	} catch (err) {
		if (err instanceof DomainError) error(err.status, { message: err.message });
		throw err;
	}
};
