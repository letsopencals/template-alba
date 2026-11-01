import type { PaymentInstructions, StorefrontAppointmentPendingReason } from '@opencals/storefront-sdk';

/**
 * Booked, or still waiting on the patient's payment / the studio's say-so.
 * Only `pending` + a `pendingReason` waits: right after checkout, studios that
 * confirm automatically leave a visit `pending` with no reason for a moment
 * while a job confirms it. That is booked.
 */
export type BookingState = 'booked' | 'awaiting_payment' | 'awaiting_approval';

type Appt = { status?: string | null; pendingReason?: StorefrontAppointmentPendingReason | null } | null | undefined;

export function bookingStateOf(appts: Appt[]): BookingState {
	const reasons = appts.flatMap((a) => (a?.status === 'pending' && a.pendingReason ? [a.pendingReason] : []));
	if (reasons.includes('awaiting_payment')) return 'awaiting_payment';
	if (reasons.includes('awaiting_approval')) return 'awaiting_approval';
	return 'booked';
}

/** The appointment-card stamp for a waiting visit, or null when it's booked. */
export function waitingLabel(status: string | null | undefined, reason: StorefrontAppointmentPendingReason | null | undefined): string | null {
	if (status !== 'pending' || !reason) return null;
	return reason === 'awaiting_payment' ? 'Awaiting payment' : 'Awaiting the studio';
}

/** Only ever send a patient to an https invoice page. */
export function invoiceHref(url: string | null | undefined): string | null {
	return typeof url === 'string' && url.startsWith('https://') ? url : null;
}

/** What checkout submit returned for the order (payment instructions only come from there). */
export interface FiledCheckout {
	orderId: string;
	/** Order number ("#A5013"): the bank transfer reference, as in the confirmation email. */
	orderName: string | null;
	state: BookingState;
	instructions: PaymentInstructions | null;
	at: number;
}

const KEY = 'alba:filed-checkout';
const MAX_AGE = 6 * 60 * 60 * 1000;

export function fileCheckout(f: Omit<FiledCheckout, 'at'>): void {
	try {
		sessionStorage.setItem(KEY, JSON.stringify({ ...f, at: Date.now() }));
	} catch {
		/* private mode: the card falls back to "check your inbox" */
	}
}

export function readFiledCheckout(orderId: string | null): FiledCheckout | null {
	if (!orderId) return null;
	try {
		const raw = sessionStorage.getItem(KEY);
		const f = raw ? (JSON.parse(raw) as FiledCheckout) : null;
		return f && f.orderId === orderId && Date.now() - f.at < MAX_AGE ? f : null;
	} catch {
		return null;
	}
}
