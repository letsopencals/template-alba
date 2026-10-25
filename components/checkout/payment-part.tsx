'use client';

import { useState, type FormEvent } from 'react';
import dynamic from 'next/dynamic';
import { useCheckout } from '@/contexts/checkout-context';
import { Button } from '@/components/ui/button';
import { PAYMENT_METHOD_FORM_ID } from './form-ids';

// Stripe is heavy and only needed once a card payment starts: load on demand, client-only.
const StripePayment = dynamic(() => import('@/components/checkout/stripe-payment').then((m) => m.StripePayment), {
	ssr: false,
	loading: () => (
		<div className="space-y-3" aria-busy="true" aria-label="Loading the secure payment form">
			<div className="h-12 animate-pulse rounded-[4px] bg-porcelain-2" />
			<div className="grid grid-cols-2 gap-3">
				<div className="h-12 animate-pulse rounded-[4px] bg-porcelain-2" />
				<div className="h-12 animate-pulse rounded-[4px] bg-porcelain-2" />
			</div>
		</div>
	),
});

const TITLE: Record<string, string> = {
	stripe: 'Card',
	cash: 'Pay at the studio',
	bank_transfer: 'Bank transfer',
	no_payment_required: 'Nothing to pay today',
};
const COPY: Record<string, string> = {
	stripe: 'Card, Apple Pay or Google Pay, paid securely now.',
	cash: 'We hold the chair now. Pay at reception on the day, or after a video consultation.',
	bank_transfer: 'We’ll email the transfer details with your confirmation.',
	no_payment_required: 'This visit is free, so it’s confirmed straight away.',
};
const ACTION: Record<string, string> = {
	stripe: 'Continue to card',
	cash: 'Confirm, pay at the studio',
	bank_transfer: 'Confirm, pay by transfer',
	no_payment_required: 'Confirm the visit',
};

/**
 * PY · Payment, on the same sheet as the details. Choosing a method doesn't
 * start the checkout; filing it does, so the patient can change their mind
 * before anything is created. Card payments then open the Stripe element.
 */
export function PaymentPart({ payLabel }: { payLabel: string }) {
	const c = useCheckout();
	const [chosen, setChosen] = useState<string | undefined>();
	const method = chosen && c.providers.some((p) => p.name === chosen) ? chosen : c.providers[0]?.name;

	if (c.step === 'customer') {
		return <p className="text-[14px]">File your details above and the ways to pay appear here.</p>;
	}

	if (c.step === 'payment' && c.paymentData) {
		return (
			<div className="space-y-5">
				{c.selectedProvider === 'stripe' && c.paymentData.clientSecret ? (
					<StripePayment
						clientSecret={c.paymentData.clientSecret}
						stripeAccountId={c.paymentData.stripeAccountId}
						publishableKey={c.paymentData.publishableKey}
						onSuccess={(piId) => c.handleSubmitCheckout(piId)}
						onError={(msg) => c.setError(msg)}
						disabled={c.isExpired || c.submitting}
						payLabel={payLabel}
						onProcessingChange={() => undefined}
					/>
				) : (
					<Signature onConfirm={() => void c.handleSubmitCheckout()} busy={c.submitting} disabled={c.isExpired} label="Confirm the visit" />
				)}
				<button type="button" onClick={() => c.setStep('payment-select')} disabled={c.submitting} className="t-anno text-ink-3 hover:text-ink disabled:opacity-40">
					← Another way to pay
				</button>
			</div>
		);
	}

	if (c.providers.length === 0) {
		return <p className="text-[14px] text-ink-2">No way to pay online right now. Call the studio and we&rsquo;ll book you in.</p>;
	}

	const onSubmit = (e: FormEvent) => {
		e.preventDefault();
		if (method && !c.submitting && !c.isExpired) void c.handleStartCheckout(method);
	};

	return (
		<form id={PAYMENT_METHOD_FORM_ID} onSubmit={onSubmit}>
			<fieldset>
				<legend className="sr-only">How would you like to pay?</legend>
				{c.providers.map((p) => (
					<label key={p.name} className="method">
						<input type="radio" name="payment-method" value={p.name} checked={method === p.name} onChange={() => setChosen(p.name)} disabled={c.submitting || c.isExpired} className="sr-only" />
						<span className="tick" aria-hidden>
							✓
						</span>
						<span className="min-w-0">
							<span className="block text-[16px] text-ink">{TITLE[p.name] ?? p.displayName}</span>
							<span className="mt-0.5 block text-[13.5px] text-ink-2">{COPY[p.name] ?? p.description}</span>
						</span>
						{p.mode === 'test' ? <span className="t-anno rounded-[3px] bg-brass-2/50 px-1.5 py-0.5 text-[9px] text-ink">Test</span> : <span />}
					</label>
				))}
			</fieldset>
			<p className="mt-4 text-[12.5px] text-ink-3">Claiming on dental insurance? We give you an itemised receipt to send in after the visit.</p>
			{method === 'stripe' ? (
				<Button type="submit" size="lg" className="mt-6" disabled={!method || c.submitting || c.isExpired}>
					{c.submitting ? 'One moment…' : ACTION.stripe}
				</Button>
			) : (
				<div className="mt-6">
					<Signature submit busy={c.submitting} disabled={!method || c.isExpired} label={method ? (ACTION[method] ?? 'Confirm') : 'Confirm'} />
				</div>
			)}
		</form>
	);
}

/** The signature line: the patient's name "signed" above the confirm button. */
function Signature({ label, busy, disabled, submit, onConfirm }: { label: string; busy: boolean; disabled?: boolean; submit?: boolean; onConfirm?: () => void }) {
	const { firstName, lastName } = useCheckout();
	const name = [firstName, lastName].filter(Boolean).join(' ');
	return (
		<div className="grid gap-5 sm:grid-cols-[1fr_auto] sm:items-end">
			<div>
				<div className="sign-line">
					<span>{name}</span>
				</div>
				<p className="t-anno mt-1.5 text-ink-3">Patient or guardian · I&rsquo;ve read the 24-hour change policy</p>
			</div>
			<Button type={submit ? 'submit' : 'button'} size="lg" onClick={onConfirm} disabled={busy || disabled}>
				{busy ? 'Confirming…' : label}
			</Button>
		</div>
	);
}
