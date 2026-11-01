'use client';

import { clsx } from 'clsx';
import type { PaymentInstructions } from '@opencals/storefront-sdk';
import { invoiceHref } from '@/lib/booking-state';
import { siteConfig } from '@/lib/site-config';

const when = (iso: string) => {
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return null;
	return new Intl.DateTimeFormat('en-GB', { timeZone: siteConfig.timezone, weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }).format(d);
};

const TITLE: Record<string, string> = {
	bank_transfer: 'Pay by bank transfer',
	stripe_invoice: 'Pay your invoice',
	cash: 'Pay at the studio',
};

/**
 * The payment slip under the appointment card for manual methods: the
 * invoice link, the studio's bank details, or a pay-in-person note, plus the
 * pay-by date. With nothing in hand (a reload, another device) it points to
 * the inbox instead.
 */
export function PaymentSlip({
	instructions,
	dueAt,
	reference,
	className,
}: {
	instructions: PaymentInstructions | null;
	dueAt?: string | null;
	/** The order number, used as the transfer reference. */
	reference?: string | null;
	className?: string;
}) {
	const provider = instructions?.provider ?? '';
	const due = (instructions?.dueAt ?? dueAt) ? when((instructions?.dueAt ?? dueAt)!) : null;
	const link = invoiceHref(instructions?.hostedInvoiceUrl);
	const b = instructions?.bankDetails;
	const rows: [string, string | null | undefined][] = [
		['Account name', b?.accountName],
		['Bank', b?.bankName],
		['IBAN / account no.', b?.iban],
		['SWIFT / BIC', b?.swift],
		['Payment reference', provider === 'bank_transfer' ? reference : null],
	];
	const bank = rows.filter((r): r is [string, string] => Boolean(r[1]));

	return (
		<section aria-labelledby="payment-slip-title" className={clsx('border-l-2 border-brass bg-enamel px-5 py-5 sm:px-6', className)}>
			<p className="t-anno">Payment · to confirm the visit</p>
			<h2 id="payment-slip-title" className="t-md mt-2 text-ink">
				{TITLE[provider] ?? 'How to pay'}
			</h2>
			{due ? (
				<p className="mt-2 text-[14.5px] text-ink">
					Please pay by <span className="tabular-nums">{due}</span>.
				</p>
			) : null}

			{!instructions ? (
				<p className="mt-2 max-w-[46ch] text-[14.5px] leading-relaxed text-ink-2">How to pay is in your inbox. Look for the email from {siteConfig.name} (and check spam).</p>
			) : null}

			{provider === 'stripe_invoice' ? (
				link ? (
					<a href={link} target="_blank" rel="noopener noreferrer" className="link-hair mt-4 inline-block text-[15px] text-lagoon">
						Pay invoice ↗
					</a>
				) : (
					<p className="mt-2 text-[14.5px] text-ink-2">The invoice is on its way to your inbox, with a link to pay online.</p>
				)
			) : null}

			{bank.length ? (
				<dl className="mt-4 divide-y divide-line border-y border-line">
					{bank.map(([k, v]) => (
						<div key={k} className="grid grid-cols-[minmax(0,10rem)_1fr] gap-4 py-2 text-[14px]">
							<dt className="t-anno self-center">{k}</dt>
							<dd className="min-w-0 break-all text-ink select-all">{v}</dd>
						</div>
					))}
				</dl>
			) : null}
			{provider === 'bank_transfer' ? <p className="mt-3 text-[13px] text-ink-3">The same details are in your confirmation email.</p> : null}
			{provider === 'cash' ? <p className="mt-2 text-[14.5px] text-ink-2">Pay at reception on the day, or after a video consultation.</p> : null}
		</section>
	);
}
