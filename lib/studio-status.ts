import { siteConfig } from '@/lib/site-config';
import { formatClock, openStateAt, parseOpeningHours, type DayHours, type OpenState } from '@/lib/opening-hours';

/**
 * Open/closed for a studio in the studio's own clock (Europe/London), not the
 * visitor's. Client-safe; call after hydration (depends on "now").
 */
export function studioWeek(slug: string): DayHours[] {
	return parseOpeningHours(siteConfig.studioHours[slug] ?? siteConfig.contact.hours);
}

/** A Date whose local fields read as the wall clock in `timeZone`. */
export function wallClock(now: Date, timeZone: string = siteConfig.timezone): Date {
	const parts = new Intl.DateTimeFormat('en-GB', {
		timeZone,
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		hourCycle: 'h23',
	}).formatToParts(now);
	const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
	return new Date(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'));
}

export function studioOpenState(slug: string, now: Date): OpenState {
	return openStateAt(studioWeek(slug), wallClock(now));
}

/** "Open · until 19:00", "Opens 07:30", "Closed · Mon 08:30". */
export function openLine(state: OpenState): { tone: 'open' | 'soon' | 'closed'; text: string } {
	if (state.kind === 'open') return { tone: 'open', text: `Open until ${formatClock(state.until)}` };
	if (state.kind === 'later') return { tone: 'soon', text: `Opens ${formatClock(state.from)}` };
	const next = state.next;
	return { tone: 'closed', text: next && next.open !== null ? `Closed · ${next.short} ${formatClock(next.open)}` : 'Closed' };
}

/** Today's hours as "08:00–19:00", or "Closed". */
export function todaysHours(slug: string, now: Date): string {
	const d = studioWeek(slug)[wallClock(now).getDay()];
	return d && d.open !== null && d.close !== null ? `${formatClock(d.open)}–${formatClock(d.close)}` : 'Closed';
}
