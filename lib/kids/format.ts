/** "£45", "£45.50" or "Free" — whole amounts without pennies. Client-safe. */
export function kidsPrice(amount: number, currency = 'GBP'): string {
	if (!amount) return 'Free';
	return new Intl.NumberFormat('en-GB', {
		style: 'currency',
		currency,
		minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
		maximumFractionDigits: 2,
	}).format(amount);
}

export function kidsMinutes(minutes: number): string {
	return `${minutes} min`;
}

/**
 * "Wednesday 4 November 2026" (long) or "4 Nov 2026" in `timeZone`, assembled
 * from parts so Node's and the browser's ICU (which disagree on the comma)
 * render the same text and hydration matches.
 */
export function kidsDate(iso: string, timeZone: string, style: 'long' | 'short' = 'long'): string {
	try {
		const parts = new Intl.DateTimeFormat('en-GB', {
			weekday: style === 'long' ? 'long' : undefined,
			day: 'numeric',
			month: style === 'long' ? 'long' : 'short',
			year: 'numeric',
			timeZone,
		}).formatToParts(new Date(iso));
		const get = (t: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === t)?.value ?? '';
		return [get('weekday'), get('day'), get('month'), get('year')].filter(Boolean).join(' ');
	} catch {
		return iso.slice(0, 10);
	}
}
