'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useCheckout, type BillingDraft, type ConsentChannel, type FieldErrors } from '@/contexts/checkout-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { describedBy, Field } from './field';
import { DETAILS_FORM_ID } from './form-ids';
import { countryOptions } from './countries';

const CONSENT_COPY: Record<ConsentChannel, { label: string; hint: string }> = {
	email: { label: 'Email me Alba news and the odd care tip', hint: 'A few times a year. Unsubscribe whenever you like.' },
	sms: { label: 'Text me Alba news and offers', hint: 'Appointment reminders come either way.' },
	whatsapp: { label: 'Message me Alba news on WhatsApp', hint: 'You can stop these at any time.' },
};

/** First error for a field, accepting both "phone" and "customer.phone" style paths. */
function errorFor(errors: FieldErrors, ...keys: string[]): string | undefined {
	for (const k of keys) {
		const hit = errors[k] ?? errors[`customer.${k}`];
		if (hit) return hit;
	}
	return undefined;
}

/** PT · Contact. The person we write to: the patient, or the parent booking for a child. */
export function ContactPart() {
	const c = useCheckout();
	const { fields, fieldErrors, signedIn } = c;
	const emailError = errorFor(fieldErrors, 'email');
	const firstError = errorFor(fieldErrors, 'firstName');
	const lastError = errorFor(fieldErrors, 'lastName');
	const phoneError = errorFor(fieldErrors, 'phone');

	return (
		<form id={DETAILS_FORM_ID} onSubmit={c.handleSaveCustomer} className="space-y-6">
			<p className="text-[14px] leading-relaxed text-ink-2">
				{signedIn ? (
					<>Signed in: we&rsquo;ve filled in what&rsquo;s on your record. Check it&rsquo;s still right.</>
				) : (
					<>
						Been to Alba before?{' '}
						<Link href="/auth/sign-in?callbackUrl=/checkout" className="link-hair text-lagoon">
							Sign in
						</Link>{' '}
						and this fills itself in. Booking for a child? Use your own details here; their name is on the visit.
					</>
				)}
			</p>

			<div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
				<Field htmlFor="checkout-first-name" label="First name" required={fields.firstNameRequired} error={firstError}>
					<Input
						id="checkout-first-name"
						autoComplete="given-name"
						required={fields.firstNameRequired}
						value={c.firstName}
						onChange={(e) => c.setFirstName(e.target.value)}
						aria-invalid={firstError ? true : undefined}
						aria-describedby={describedBy('checkout-first-name', false, firstError)}
					/>
				</Field>
				<Field htmlFor="checkout-last-name" label="Last name" required error={lastError}>
					<Input
						id="checkout-last-name"
						autoComplete="family-name"
						required
						value={c.lastName}
						onChange={(e) => c.setLastName(e.target.value)}
						aria-invalid={lastError ? true : undefined}
						aria-describedby={describedBy('checkout-last-name', false, lastError)}
					/>
				</Field>
				<Field htmlFor="checkout-email" label="Email" required error={emailError} hint={signedIn ? 'The email on your record.' : undefined}>
					<Input
						id="checkout-email"
						type="email"
						required
						readOnly={signedIn}
						autoComplete="email"
						value={c.email}
						onChange={(e) => c.setEmail(e.target.value)}
						aria-invalid={emailError ? true : undefined}
						aria-describedby={describedBy('checkout-email', signedIn, emailError)}
						className={signedIn ? 'bg-porcelain-2 text-ink-2' : undefined}
					/>
				</Field>
				{fields.phone !== 'hidden' ? (
					<Field
						htmlFor="checkout-phone"
						label="Mobile"
						required={fields.phone === 'required'}
						optional={fields.phone === 'optional'}
						hint="Only if a time has to move."
						error={phoneError}
					>
						<Input
							id="checkout-phone"
							type="tel"
							inputMode="tel"
							autoComplete="tel"
							required={fields.phone === 'required'}
							value={c.phone}
							onChange={(e) => c.setPhone(e.target.value)}
							placeholder="07700 900123"
							aria-invalid={phoneError ? true : undefined}
							aria-describedby={describedBy('checkout-phone', true, phoneError)}
						/>
					</Field>
				) : null}
			</div>

			{fields.billingAddress === 'optional' ? (
				<label className="flex cursor-pointer items-start gap-3 text-[14px] text-ink">
					<input type="checkbox" checked={c.billingOpen} onChange={(e) => c.setBillingOpen(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[var(--color-lagoon)]" />
					<span>
						Add a billing address
						<span className="block text-[12.5px] text-ink-3">For receipts you claim back from an employer or insurer.</span>
					</span>
				</label>
			) : null}
			{c.billingOpen ? <BillingFields billing={c.billing} errors={fieldErrors} onChange={c.updateBilling} fields={fields} /> : null}

			{fields.consentChannels.length > 0 ? (
				<fieldset className="space-y-3 border-t border-line pt-5">
					<legend className="t-anno mb-3 text-ink-2">CN · Keeping in touch</legend>
					{fields.consentChannels.map((ch) => (
						<label key={ch} className="flex cursor-pointer items-start gap-3 text-[14px] text-ink">
							<input type="checkbox" checked={c.consent[ch]} onChange={(e) => c.setConsent(ch, e.target.checked)} className="mt-0.5 h-4 w-4 accent-[var(--color-lagoon)]" />
							<span>
								{CONSENT_COPY[ch].label}
								<span className="block text-[12.5px] text-ink-3">{CONSENT_COPY[ch].hint}</span>
							</span>
						</label>
					))}
				</fieldset>
			) : null}

			<Button type="submit" size="lg" disabled={c.submitting || !c.email || c.isExpired}>
				{c.submitting ? 'Filing…' : 'File these details'}
			</Button>
		</form>
	);
}

/** One typed line once the contact part is filed. */
export function ContactSummary({ onEdit }: { onEdit?: () => void }) {
	const { firstName, lastName, email, phone } = useCheckout();
	return (
		<div className="flex flex-wrap items-baseline justify-between gap-3">
			<p className="text-[15px] text-ink">
				<span className="font-display text-[22px]">{[firstName, lastName].filter(Boolean).join(' ') || email}</span>
				<span className="ml-3 text-ink-2">{[email, phone].filter(Boolean).join(' · ')}</span>
			</p>
			{onEdit ? (
				<button type="button" onClick={onEdit} className="t-anno text-lagoon hover:text-ink">
					Amend
				</button>
			) : null}
		</div>
	);
}

interface BillingFieldsProps {
	billing: BillingDraft;
	errors: FieldErrors;
	onChange: (patch: Partial<BillingDraft>) => void;
	fields: ReturnType<typeof useCheckout>['fields'];
}

function BillingFields({ billing, errors, onChange, fields }: BillingFieldsProps) {
	const countries = useMemo(() => countryOptions(), []);
	const required = fields.billingAddress === 'required';
	const err = (k: string) => errorFor(errors, `billingAddress.${k}`);
	return (
		<fieldset className="grid grid-cols-1 gap-5 border-l-2 border-brass-2 pl-4 sm:grid-cols-2">
			<legend className="t-anno mb-3 text-ink-2">BL · Billing address</legend>
			{fields.companyName !== 'hidden' ? (
				<Field htmlFor="billing-company" label="Company" required={fields.companyName === 'required'} optional={fields.companyName === 'optional'} error={err('companyName')}>
					<Input id="billing-company" autoComplete="organization" value={billing.companyName} onChange={(e) => onChange({ companyName: e.target.value })} />
				</Field>
			) : null}
			{fields.taxId !== 'hidden' ? (
				<Field htmlFor="billing-tax" label="VAT number" required={fields.taxId === 'required'} optional={fields.taxId === 'optional'} error={err('taxRegistrationId')}>
					<Input id="billing-tax" value={billing.taxRegistrationId} onChange={(e) => onChange({ taxRegistrationId: e.target.value })} />
				</Field>
			) : null}
			<div className="sm:col-span-2">
				<Field htmlFor="billing-line1" label="Address" required={required} error={err('addressLine1')}>
					<Input id="billing-line1" autoComplete="address-line1" required={required} value={billing.addressLine1} onChange={(e) => onChange({ addressLine1: e.target.value })} />
				</Field>
			</div>
			<div className="sm:col-span-2">
				<Field htmlFor="billing-line2" label="Flat, floor" optional>
					<Input id="billing-line2" autoComplete="address-line2" value={billing.addressLine2} onChange={(e) => onChange({ addressLine2: e.target.value })} />
				</Field>
			</div>
			<Field htmlFor="billing-city" label="Town or city" required={required} error={err('city')}>
				<Input id="billing-city" autoComplete="address-level2" required={required} value={billing.city} onChange={(e) => onChange({ city: e.target.value })} />
			</Field>
			<Field htmlFor="billing-postcode" label="Postcode" required={required} error={err('postalCode')}>
				<Input id="billing-postcode" autoComplete="postal-code" required={required} value={billing.postalCode} onChange={(e) => onChange({ postalCode: e.target.value })} />
			</Field>
			<Field htmlFor="billing-country" label="Country" required={required} error={err('country')}>
				<select id="billing-country" className="field" autoComplete="country" value={billing.country} onChange={(e) => onChange({ country: e.target.value })}>
					{countries.map((o) => (
						<option key={o.code} value={o.code}>
							{o.name}
						</option>
					))}
				</select>
			</Field>
		</fieldset>
	);
}
