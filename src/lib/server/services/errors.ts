/**
 * A rule of the domain was violated. The message is user-facing (German, like all UI texts) and
 * routes turn it into a form error.
 */
export class DomainError extends Error {
	constructor(
		message: string,
		readonly status: 400 | 403 | 404 | 409 = 400
	) {
		super(message);
		this.name = 'DomainError';
	}
}

export function notFound(what: string): never {
	throw new DomainError(`${what} wurde nicht gefunden.`, 404);
}

/** Returns the value, or throws a «not found» domain error when it is missing. */
export function ensure<T>(value: T | undefined, what: string): T {
	if (value === undefined) notFound(what);
	return value;
}
