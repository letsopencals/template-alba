'use client';

import { clsx } from 'clsx';
import { formatPrice } from '@/lib/format';
import type { CartWithDiscounts } from '@/types/discount';
import { cartSubtotal } from './cart-line';

/** Subtotal, discounts, optional tax and the total, as dotted leader lines (the fee list voice). */
export function CartTotals({ cart, showTax = false, className }: { cart: CartWithDiscounts; showTax?: boolean; className?: string }) {
	const currency = cart.paymentCurrencyCode;
	const discounts = cart.appliedDiscounts ?? [];
	const total = cart.total ?? cart.subtotal ?? 0;
	return (
		<dl className={clsx('space-y-2 text-[14px]', className)}>
			<Line label="Subtotal" value={formatPrice(cartSubtotal(cart), currency)} />
			{discounts.map((d) => (
				<Line key={d.id} label={d.title} value={`−${formatPrice(d.totalAmount, currency)}`} tone="mint" />
			))}
			{showTax && cart.totalTax > 0 ? <Line label={cart.taxesIncluded ? 'VAT (included)' : 'VAT'} value={formatPrice(cart.totalTax, currency)} /> : null}
			<div className="flex items-baseline gap-2 border-t border-line pt-3">
				<dt className="t-anno text-ink">Total</dt>
				<span className="leader" aria-hidden />
				<dd className="font-display text-[30px] leading-none tabular-nums text-ink">{formatPrice(total, currency)}</dd>
			</div>
		</dl>
	);
}

function Line({ label, value, tone }: { label: string; value: string; tone?: 'mint' }) {
	return (
		<div className="flex items-baseline gap-2">
			<dt className={clsx('min-w-0 truncate', tone === 'mint' ? 'text-mint-3' : 'text-ink-2')}>{label}</dt>
			<span className="leader" aria-hidden />
			<dd className={clsx('t-num', tone === 'mint' ? 'text-mint-3' : 'text-ink')}>{value}</dd>
		</div>
	);
}
