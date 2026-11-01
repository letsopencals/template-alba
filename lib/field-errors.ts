import type { OpencalsApiError } from '@opencals/storefront-sdk';

/** The API's field errors, as `/api/*` routes pass them on in `fieldErrors` (`{ property: 'customer.phone', messages }`). */
export type ApiFieldErrors = NonNullable<OpencalsApiError['errors']>;

/** Shown under every phone input, and as the error when the number has no country code. */
export const PHONE_HINT = 'Include your country code, e.g. +44 7911 123456';

/** A light client check before sending: the API wants international format. It stays the source of truth. */
export function phoneNeedsCountryCode(phone: string): boolean {
	const v = phone.trim();
	return v.length > 0 && !v.startsWith('+');
}

/** Reads `fieldErrors` from an `/api/*` error body, keeping only well-formed entries. */
export function fieldErrorsOf(data: unknown): ApiFieldErrors {
	const list = (data as { fieldErrors?: unknown } | null)?.fieldErrors;
	if (!Array.isArray(list)) return [];
	return list.filter(
		(e): e is ApiFieldErrors[number] =>
			!!e && typeof e.property === 'string' && Array.isArray(e.messages) && e.messages.every((m: unknown) => typeof m === 'string'),
	);
}

/**
 * Maps the API's field errors onto a form's fields by the end of each path. `keys` are the form's field keys:
 * a two-segment key (`billingAddress.city`) wins over a one-segment one (`city`), so `customer.billingAddress.city`
 * lands on the billing field and `customer.phone` on `phone`. Whatever matches no key is returned as `unmapped`,
 * for the form's generic message.
 */
export function mapFieldErrors<K extends string>(
	errors: ApiFieldErrors,
	keys: readonly K[],
): { fields: Partial<Record<K, string>>; unmapped: ApiFieldErrors } {
	const known = new Set<string>(keys);
	const fields: Partial<Record<K, string>> = {};
	const unmapped: ApiFieldErrors = [];
	for (const e of errors) {
		const parts = e.property.split('.');
		const key = [parts.slice(-2).join('.'), parts.at(-1) ?? ''].find((k) => known.has(k)) as K | undefined;
		const text = e.messages.join(' ');
		// The billing phone is a copy of the contact phone, so the same message can arrive twice: show it once.
		if (key && text) fields[key] = fields[key] && !fields[key].includes(text) ? `${fields[key]} ${text}` : (fields[key] ?? text);
		else unmapped.push(e);
	}
	return { fields, unmapped };
}
