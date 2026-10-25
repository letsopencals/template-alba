'use client';

import { useEffect, type ReactNode } from 'react';
import Link from 'next/link';
import { clsx } from 'clsx';
import { useCart } from '@/contexts/cart-context';
import { useCheckout } from '@/contexts/checkout-context';
import { useHydrated } from '@/hooks/use-hydrated';
import { ChairTrack } from '@/components/book/chair-track';
import { useCartLanes } from '@/components/book/planner';
import { CartTotals } from '@/components/cart/cart-totals';
import { PromoCode } from '@/components/cart/promo-code';
import { saveSnapshot, snapshotFromCart } from '@/components/confirmation/snapshot';
import { formatPrice } from '@/lib/format';
import { siteConfig } from '@/lib/site-config';
import { ContactPart, ContactSummary } from './contact-part';
import { PaymentPart } from './payment-part';
import './record.css';

/** /checkout: the patient record. One sheet, ruled margin of field codes, nothing folds away. */
export function CheckoutView() {
	const { cart, cartId, isLoaded } = useCart();
	const { checkoutComplete } = useCheckout();

	if (checkoutComplete) {
		return (
			<Shell>
				<div className="record flex min-h-[320px] flex-col items-center justify-center gap-4 p-10 text-center" role="status">
					<span className="status-light" aria-hidden />
					<p className="t-md text-ink">Filing your record…</p>
					<p className="text-[14px] text-ink-2">Your appointment card is on its way.</p>
				</div>
			</Shell>
		);
	}
	if (!isLoaded || (cartId && !cart)) {
		return (
			<Shell>
				<div className="record h-[560px] animate-pulse" aria-busy="true" aria-label="Opening your record" />
			</Shell>
		);
	}
	if (!cartId || !cart || (cart.items ?? []).length === 0) {
		return (
			<Shell>
				<div className="record p-10 text-center">
					<p className="t-md text-ink">No visits on this record yet.</p>
					<p className="mt-3 text-[15px] text-ink-2">Plan one in the chair planner and it&rsquo;s held here while you finish.</p>
					<Link href="/book" className="link-hair mt-6 inline-block text-lagoon">
						Open the chair planner
					</Link>
				</div>
			</Shell>
		);
	}
	return <Record />;
}

function Shell({ children }: { children: ReactNode }) {
	return (
		<section className="frame pt-24 pb-24 sm:pt-28">
			<div className="mx-auto max-w-[880px]">
				<p className="t-anno">Patient record</p>
				<h1 className="t-lg mt-3 mb-10 text-ink">
					Nearly <em>yours.</em>
				</h1>
				{children}
			</div>
		</section>
	);
}

function countdown(s: number | null): string | null {
	if (s == null || s <= 0) return null;
	return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function Record() {
	const { cart, cartId, removeItem, extendCart } = useCart();
	const c = useCheckout();
	const hydrated = useHydrated();
	const tz = siteConfig.timezone;
	const items = cart?.items ?? [];
	const lanes = useCartLanes(items, tz, hydrated);
	const total = formatPrice(cart?.total ?? cart?.subtotal ?? 0, cart?.paymentCurrencyCode);
	const left = countdown(c.timeRemaining);
	const lowTime = c.timeRemaining != null && c.timeRemaining < 120;

	// Keep a copy of what's booked for the guest appointment card.
	useEffect(() => {
		if (cart?.items?.length) saveSnapshot(snapshotFromCart(cart.items, cart.paymentCurrencyCode ?? null, cart.total ?? cart.subtotal ?? 0));
	}, [cart]);

	const contactDone = c.step !== 'customer';
	return (
		<Shell>
			{c.error ? (
				<div role="alert" className="mb-5 flex items-start gap-4 border-l-2 border-signal bg-signal-wash px-4 py-3 text-[14px] text-ink">
					<p className="flex-1">{c.error}</p>
					<button type="button" onClick={() => c.setError(null)} className="t-anno text-signal hover:underline">
						Dismiss
					</button>
				</div>
			) : null}

			<article className="record" aria-label="Patient record">
				<header className="record-head">
					<span className="font-display text-[22px] leading-none">{siteConfig.name}</span>
					<span className="flex flex-wrap items-center gap-x-6 gap-y-1">
						<span className="t-anno">Ref · {(cartId ?? '').slice(-6).toUpperCase()}</span>
						{c.isExpired ? (
							<span className="t-anno !text-signal-wash">Hold expired</span>
						) : left ? (
							<span className={clsx('t-anno flex items-center gap-2', lowTime && '!text-brass-2')}>
								Held for {left}
								{lowTime ? (
									<button type="button" onClick={() => void extendCart()} className="underline underline-offset-2">
										More time
									</button>
								) : null}
							</span>
						) : null}
					</span>
				</header>

				<Row code="VS" n="01" title={items.length > 1 ? `${items.length} visits` : 'The visit'}>
					<div className="max-md:hidden">
						<ChairTrack lanes={lanes} compact className="rounded-[4px]" />
					</div>
					<ul className="space-y-3 md:hidden">
						{lanes.map((l) => (
							<li key={l.key} className="border-l-2 border-brass pl-3">
								<p className="text-[15px] text-ink">{l.blocks.map((b) => b.title).join(' + ')}</p>
								<p className="t-anno mt-1">
									{l.whenSub} {l.when} · {l.station}
									{l.patient ? ` · ${l.patient}` : ''}
								</p>
							</li>
						))}
					</ul>
					<div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
						<Link href="/book" className="t-anno text-lagoon hover:text-ink">
							+ Add a visit
						</Link>
						{items.map((it, i) => (
							<button key={it.id} type="button" onClick={() => void removeItem(it.id)} disabled={c.submitting} className="t-anno text-ink-3 hover:text-signal disabled:opacity-40">
								Remove {items.length > 1 ? `visit ${i + 1}` : 'this visit'}
							</button>
						))}
					</div>
				</Row>

				<Row code="PT" n="02" title="Contact">
					{contactDone ? <ContactSummary onEdit={c.submitting ? undefined : () => c.setStep('customer')} /> : <ContactPart />}
				</Row>

				<Row code="PY" n="03" title="Payment" locked={!contactDone}>
					<PaymentPart payLabel={total} />
				</Row>

				<Row code="Σ" n="04" title="Fees">
					<div className="grid gap-6 md:grid-cols-[1fr_minmax(0,320px)] md:items-end">
						<p className="max-w-[44ch] text-[13px] leading-relaxed text-ink-3">
							Change or cancel free up to 24 hours before. {siteConfig.emergency.short}
						</p>
						<div className="space-y-4">
							{cart ? <CartTotals cart={cart} showTax /> : null}
							<PromoCode />
						</div>
					</div>
				</Row>
			</article>
		</Shell>
	);
}

export function Row({ code, n, title, locked, children }: { code: string; n: string; title: string; locked?: boolean; children: ReactNode }) {
	return (
		<section className="record-row" data-state={locked ? 'locked' : undefined} aria-label={title}>
			<div className="record-margin">
				<p className="t-anno flex gap-2 md:block">
					<span className="text-brass md:block">{code}</span>
					<span className="md:mt-1 md:block">{n}</span>
					<span className="md:mt-3 md:block md:normal-case md:tracking-normal md:font-sans md:text-[12px] md:text-ink-2">{title}</span>
				</p>
			</div>
			<div className="record-body">{children}</div>
		</section>
	);
}
