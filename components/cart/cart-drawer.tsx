'use client';

import { useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { clsx } from 'clsx';
import { useCart } from '@/contexts/cart-context';
import { buttonClasses, ButtonInner } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { useModalOverlay, useMounted } from '@/components/ui/use-overlay';
import { useHydrated } from '@/hooks/use-hydrated';
import { formatPrice } from '@/lib/format';
import { siteConfig } from '@/lib/site-config';
import { HoldBar } from './hold-bar';
import { PromoCode } from './promo-code';
import { cartSubtotal, useAppointmentFormat, useCartLines, type CartLine } from './cart-line';

interface CartDrawerProps {
	open: boolean;
	onClose: () => void;
}

/*
 * "Your visits": the chair list. A panel that slides in from the right with
 * each held visit as a numbered row (date in the margin, time, who and where,
 * add-ons, price on a leader), the hold, a code and the total. Opened from the
 * chart rail and the phone top bar. Portalled to <body>.
 */
export function CartDrawer({ open, onClose }: CartDrawerProps) {
	const mounted = useMounted();
	if (!mounted) return null;
	return createPortal(<Panel open={open} onClose={onClose} />, document.body);
}

function Panel({ open, onClose }: CartDrawerProps) {
	const panelRef = useRef<HTMLDivElement>(null);
	const titleId = useId();
	const { cart, removeItem, timeRemaining, extendCart } = useCart();
	const lines = useCartLines(cart);
	useModalOverlay(open, onClose, panelRef);

	const count = lines.length;
	const expired = timeRemaining !== null && timeRemaining <= 0;
	const currency = cart?.paymentCurrencyCode;
	const total = cart?.total ?? cart?.subtotal ?? 0;
	const subtotal = cartSubtotal(cart ?? null);
	const discounts = cart?.appliedDiscounts ?? [];

	return (
		<div className={clsx('fixed inset-0 z-[60]', open ? 'visible' : 'invisible pointer-events-none')} aria-hidden={!open}>
			<div
				aria-hidden
				onClick={onClose}
				className={clsx('absolute inset-0 bg-night/40 transition-opacity duration-300', open ? 'opacity-100' : 'opacity-0')}
			/>
			<div
				ref={panelRef}
				role="dialog"
				aria-modal="true"
				aria-labelledby={titleId}
				tabIndex={-1}
				className={clsx(
					'absolute inset-y-0 right-0 flex w-full max-w-[480px] flex-col border-l border-line bg-porcelain text-ink shadow-[var(--shadow-lift)] outline-none transition-transform duration-500 ease-[var(--ease-light)] motion-reduce:transition-none',
					open ? 'translate-x-0' : 'translate-x-full',
				)}
			>
				<header className="flex items-end justify-between gap-4 border-b border-line px-5 pb-5 pt-6 sm:px-7">
					<div>
						<p className="t-anno">
							Held for you · <span className="text-brass">{String(count).padStart(2, '0')}</span>
						</p>
						<h2 id={titleId} className="t-md mt-2">
							Your <em>visits</em>
						</h2>
					</div>
					<button
						type="button"
						onClick={onClose}
						aria-label="Close your visits"
						className="flex h-10 items-center gap-2 rounded-[4px] border border-line-2 px-3 text-ink-2 transition-colors hover:border-lagoon hover:text-ink"
					>
						<span className="t-anno">Close</span>
						<Icon name="close" className="h-3 w-3" />
					</button>
				</header>

				{count > 0 && timeRemaining !== null ? (
					<div className="border-b border-line bg-enamel/70 px-5 py-3.5 sm:px-7">
						<HoldBar timeRemaining={timeRemaining} expiresAt={cart?.expiresAt} onExtend={extendCart} onNavigate={onClose} />
					</div>
				) : null}

				<div className="flex-1 overflow-y-auto overscroll-contain">
					{count === 0 ? (
						<Empty onNavigate={onClose} />
					) : (
						<ol>
							{lines.map((line, i) => (
								<VisitRow key={line.id} line={line} index={i} currency={currency} onRemove={removeItem} />
							))}
						</ol>
					)}
				</div>

				{count > 0 && cart ? (
					<footer className="border-t border-line bg-enamel px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-5 sm:px-7">
						<PromoCode />
						<dl className="mt-4 grid gap-1.5 text-[14px]">
							<Row label="Subtotal" value={formatPrice(subtotal, currency)} />
							{discounts.map((d) => (
								<Row key={d.id} label={d.title} value={`−${formatPrice(d.totalAmount, currency)}`} tone="mint" />
							))}
							<div className="mt-2 flex items-baseline gap-2 border-t border-line pt-3">
								<dt className="t-anno !text-ink">Total</dt>
								<span className="leader" aria-hidden />
								<dd className="t-sm tabular">{formatPrice(total, currency)}</dd>
							</div>
						</dl>
						<Link
							href={expired ? '/book' : '/checkout'}
							onClick={onClose}
							className={buttonClasses({ variant: 'solid', size: 'lg', fullWidth: true, className: 'mt-5' })}
						>
							<ButtonInner size="lg">{expired ? 'Find a new time' : 'Continue to checkout'}</ButtonInner>
						</Link>
						<div className="mt-3 flex items-center justify-between gap-4">
							<Link href="/book" onClick={onClose} className="link-hair text-[13px] text-ink-2">
								Add another visit
							</Link>
							<span className="t-anno">Pay now or at the studio</span>
						</div>
					</footer>
				) : null}
			</div>
		</div>
	);
}

function Row({ label, value, tone }: { label: string; value: string; tone?: 'mint' }) {
	return (
		<div className="flex items-baseline gap-2">
			<dt className={clsx('min-w-0 truncate', tone === 'mint' ? 'text-mint-3' : 'text-ink-2')}>{label}</dt>
			<span className="leader" aria-hidden />
			<dd className={clsx('tabular', tone === 'mint' ? 'text-mint-3' : 'text-ink')}>{value}</dd>
		</div>
	);
}

function VisitRow({ line, index, currency, onRemove }: { line: CartLine; index: number; currency: string | undefined; onRemove: (id: string) => Promise<void> }) {
	const fmt = useAppointmentFormat();
	const hydrated = useHydrated();
	const [removing, setRemoving] = useState(false);
	const [day, ...rest] = hydrated ? fmt.date(line.from).split(' ') : ['', ''];
	return (
		<li className="grid grid-cols-[64px_1fr] border-b border-line">
			<div className="flex flex-col items-center justify-start border-r border-line py-5">
				<span className="t-num text-[10px] text-brass">{String(index + 1).padStart(2, '0')}</span>
				<span className="t-anno mt-3 !text-[9.5px]">{day}</span>
				<span className="t-lg mt-0.5 !text-[2.1rem] leading-none">{rest[0] ?? ''}</span>
				<span className="t-anno !text-[9.5px]">{rest[1] ?? ''}</span>
			</div>
			<div className="min-w-0 px-5 py-5 sm:pr-7">
				<div className="flex items-start justify-between gap-3">
					<div className="min-w-0">
						<p className="t-num text-[12px] text-lagoon-3">{hydrated ? fmt.time(line.from, line.to) : ' '}</p>
						<h3 className="mt-1 text-[16px] font-medium leading-snug">
							{line.title}
							{line.option ? <span className="text-ink-3"> · {line.option}</span> : null}
						</h3>
						<p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-ink-2">
							{line.clinicianName ? (
								<span className="inline-flex items-center gap-1.5">
									<Icon name="person" className="h-3.5 w-3.5 text-ink-3" />
									{line.clinicianName}
								</span>
							) : null}
							{line.locationTitle ? (
								<span className="inline-flex items-center gap-1.5">
									<Icon name={line.video ? 'video' : 'pin'} className="h-3.5 w-3.5 text-ink-3" />
									{line.video ? 'Video consultation' : line.locationTitle.replace(/^Alba\s+/, '')}
								</span>
							) : null}
						</p>
						{line.patientName ? <p className="t-anno mt-2">For {line.patientName}</p> : null}
					</div>
					<p className="tabular shrink-0 text-[15px]">
						{line.discountedPrice !== line.price ? <s className="mr-1.5 text-[12px] text-ink-4">{formatPrice(line.price, currency)}</s> : null}
						{line.discountedPrice === 0 ? 'Free' : formatPrice(line.discountedPrice, currency)}
					</p>
				</div>
				{line.addOns.length ? (
					<ul className="mt-3 grid gap-1 border-t border-dashed border-line-2 pt-2.5 text-[13px] text-ink-2">
						{line.addOns.map((a) => (
							<li key={a.id} className="flex items-baseline gap-2">
								<span>
									+ {a.title}
									{a.quantity > 1 ? ` × ${a.quantity}` : ''}
								</span>
								<span className="leader" aria-hidden />
								<span className="tabular">{formatPrice(a.price, currency)}</span>
							</li>
						))}
					</ul>
				) : null}
				<button
					type="button"
					disabled={removing}
					onClick={async () => {
						setRemoving(true);
						try {
							await onRemove(line.id);
						} finally {
							setRemoving(false);
						}
					}}
					className="t-anno mt-3 hover:!text-signal disabled:opacity-50"
				>
					{removing ? 'Releasing…' : 'Release this time'}
				</button>
			</div>
		</li>
	);
}

function Empty({ onNavigate }: { onNavigate: () => void }) {
	return (
		<div className="flex h-full flex-col justify-center px-6 py-12 sm:px-8">
			<div className="chart-paper rounded-[6px] border border-line p-6">
				<p className="t-anno">Chair list · empty</p>
				<div className="mt-5 grid gap-2" aria-hidden>
					{[0.8, 0.55, 0.7].map((w, i) => (
						<span key={i} className="block h-[10px] rounded-[2px] border border-dashed border-line-2" style={{ width: `${w * 100}%` }} />
					))}
				</div>
			</div>
			<h3 className="t-md mt-8">
				No time held <em>yet</em>
			</h3>
			<p className="mt-3 max-w-[34ch] text-[14px] leading-relaxed text-ink-2">
				Pick a treatment and we&rsquo;ll show real times at all five studios. Not sure what you need? Smile Check takes thirty seconds.
			</p>
			<div className="mt-7 flex flex-wrap gap-3">
				<Link href="/book" onClick={onNavigate} className={buttonClasses({ variant: 'solid' })}>
					<ButtonInner>Book a visit</ButtonInner>
				</Link>
				<Link href="/smile-check" onClick={onNavigate} className={buttonClasses({ variant: 'line' })}>
					<ButtonInner variant="line" cell={<span className="t-num text-[10px]">01</span>}>
						Smile Check
					</ButtonInner>
				</Link>
			</div>
			<p className="t-anno mt-10 max-w-[44ch] normal-case tracking-normal">{siteConfig.emergency.short}</p>
		</div>
	);
}
