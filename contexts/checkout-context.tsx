'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { signIn as nextAuthSignIn, useSession } from 'next-auth/react';
import type {
	BillingAddress,
	CartItem,
	CheckoutFieldRequirement,
	CheckoutSetting,
	CheckoutResponse,
	CheckoutErrorResponse,
	CheckoutStartResponse,
	CustomerProviderCatalogItem,
	ExistingOrderCustomer,
	MarketingConsentInput,
	NewOrderCustomer,
	PaymentProviderName,
	SaveCustomerResponse,
	StartCheckout,
	SubmitCheckout,
} from '@opencals/storefront-sdk';
import { useCart } from '@/contexts/cart-context';
import { useSettings } from '@/contexts/settings-context';
import { usePaymentProviders } from '@/hooks/use-payment-providers';
import { bookingStateOf, fileCheckout } from '@/lib/booking-state';

/**
 * Clinic checkout is two steps — contact details, then payment. Intake
 * questions are answered per visit in the booking composer, so there is no
 * questions step here.
 */
export type CheckoutStep = 'customer' | 'payment-select' | 'payment';

export type ConsentChannel = keyof MarketingConsentInput;
type ProviderName = PaymentProviderName;

/** What the store asks for at checkout, with safe defaults when settings are missing. */
export interface CheckoutFields {
	firstNameRequired: boolean;
	phone: CheckoutFieldRequirement;
	billingAddress: CheckoutFieldRequirement;
	companyName: CheckoutFieldRequirement;
	taxId: CheckoutFieldRequirement;
	/** Marketing channels offered at checkout, in display order. */
	consentChannels: ConsentChannel[];
}

export interface BillingDraft {
	companyName: string;
	addressLine1: string;
	addressLine2: string;
	city: string;
	state: string;
	postalCode: string;
	/** ISO 3166-1 alpha-2. */
	country: string;
	taxRegistrationId: string;
}

export type ConsentDraft = Record<ConsentChannel, boolean>;

const EMPTY_BILLING: BillingDraft = {
	companyName: '',
	addressLine1: '',
	addressLine2: '',
	city: '',
	state: '',
	postalCode: '',
	country: 'GB',
	taxRegistrationId: '',
};
const EMPTY_CONSENT: ConsentDraft = { email: false, sms: false, whatsapp: false };

/**
 * How the method checkout started with gets paid: 'internal' (card element), 'redirect', 'manual'
 * (pay at the studio, bank transfer, invoice) or 'none'. The backend may swap in "no payment
 * required" when nothing is collectible, so the response provider wins over the requested one.
 */
function payModeOf(
	started: ProviderName,
	requested: ProviderName,
	providers: CustomerProviderCatalogItem[],
): CustomerProviderCatalogItem['checkoutMode'] | undefined {
	if (started === 'no_payment_required') return 'none';
	return (providers.find((p) => p.name === started) ?? providers.find((p) => p.name === requested))?.checkoutMode;
}

/** CHECKOUT_IN_PROGRESS (a double click, a second tab): ask again a few times before giving up. */
const BUSY_RETRIES = 3;
const BUSY_WAIT_MS = 1500;
const pause = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

function requirement(value: string | null | undefined): CheckoutFieldRequirement {
	return value === 'required' || value === 'optional' ? value : 'hidden';
}

function shown(value: string | null | undefined): boolean {
	return value === 'checkout_only' || value === 'checkout_and_account';
}

export function checkoutFieldsOf(cs: CheckoutSetting | null | undefined): CheckoutFields {
	const consentChannels: ConsentChannel[] = [];
	if (shown(cs?.emailMarketingOptIn)) consentChannels.push('email');
	if (shown(cs?.smsMarketingOptIn)) consentChannels.push('sms');
	if (shown(cs?.whatsappMarketingOptIn)) consentChannels.push('whatsapp');
	return {
		firstNameRequired: cs?.customerFirstNameRequired ?? false,
		phone: requirement(cs?.customerPhoneRequirement ?? 'optional'),
		billingAddress: requirement(cs?.customerBillingAddressRequirement),
		companyName: requirement(cs?.customerCompanyNameRequirement),
		taxId: requirement(cs?.customerCompanyVatNumberRequirement),
		consentChannels,
	};
}

/** Backend field paths (e.g. "billingAddress.city") → message. */
export type FieldErrors = Record<string, string>;

interface CheckoutContextValue {
	step: CheckoutStep;
	error: string | null;
	fieldErrors: FieldErrors;
	submitting: boolean;
	checkoutComplete: boolean;
	/** The held chair time went to someone else mid-checkout (409 CART_EXPIRED); the cart is cleared. */
	holdLost: boolean;

	fields: CheckoutFields;
	email: string;
	firstName: string;
	lastName: string;
	phone: string;
	billing: BillingDraft;
	/** Optional billing address opened by the patient. Always true when required. */
	billingOpen: boolean;
	consent: ConsentDraft;
	/** Signed-in patient (details prefilled, email locked). */
	signedIn: boolean;
	customerId: string | null;
	setEmail: (v: string) => void;
	setFirstName: (v: string) => void;
	setLastName: (v: string) => void;
	setPhone: (v: string) => void;
	updateBilling: (patch: Partial<BillingDraft>) => void;
	setBillingOpen: (v: boolean) => void;
	setConsent: (channel: ConsentChannel, value: boolean) => void;

	providers: CustomerProviderCatalogItem[];
	selectedProvider: ProviderName | null;
	paymentData: CheckoutStartResponse | null;

	items: CartItem[];
	isExpired: boolean;
	timeRemaining: number | null;

	setStep: (step: CheckoutStep) => void;
	setError: (error: string | null) => void;
	handleSaveCustomer: (e: React.FormEvent) => Promise<void>;
	handleStartCheckout: (providerName: ProviderName) => Promise<void>;
	handleSubmitCheckout: (stripePaymentIntentId?: string) => Promise<void>;
	extendCart: () => Promise<void>;
}

const CheckoutContext = createContext<CheckoutContextValue | undefined>(undefined);

function trimmed(v: string): string | undefined {
	const t = v.trim();
	return t ? t : undefined;
}

/** An /api error: message, field errors, and the API's `code` (+ `orderId` for CART_ALREADY_CHECKED_OUT). */
type ApiFailure = { message: string; fields: FieldErrors } & Pick<Partial<CheckoutErrorResponse>, 'code' | 'orderId'>;

async function readError(res: Response, fallback: string): Promise<ApiFailure> {
	try {
		const data = (await res.json()) as { error?: string; errors?: FieldErrors } & Pick<Partial<CheckoutErrorResponse>, 'code' | 'orderId'>;
		return { message: data.error || fallback, fields: data.errors ?? {}, code: data.code, orderId: data.orderId };
	} catch {
		return { message: fallback, fields: {} };
	}
}

export function CheckoutProvider({ children }: { children: ReactNode }) {
	const router = useRouter();
	const { data: session } = useSession();
	const { settings } = useSettings();
	const { cart, cartId, isLoaded, timeRemaining, extendCart, clearCart } = useCart();
	const fields = useMemo(() => checkoutFieldsOf(settings?.checkoutSettings), [settings?.checkoutSettings]);

	const [step, setStep] = useState<CheckoutStep>('customer');
	const [error, setError] = useState<string | null>(null);
	const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
	const [submitting, setSubmitting] = useState(false);
	const [checkoutComplete, setCheckoutComplete] = useState(false);
	const [holdLost, setHoldLost] = useState(false);

	const [email, setEmail] = useState('');
	const [firstName, setFirstName] = useState('');
	const [lastName, setLastName] = useState('');
	const [phone, setPhone] = useState('');
	const [billing, setBilling] = useState<BillingDraft>(EMPTY_BILLING);
	const [billingOpenState, setBillingOpen] = useState(false);
	const [consent, setConsentState] = useState<ConsentDraft>(EMPTY_CONSENT);
	/** Id returned by save-customer (trusted only); used when starting checkout. */
	const [customerId, setCustomerId] = useState<string | null>(null);
	const [prefilled, setPrefilled] = useState(false);

	const sessionCustomerId = session?.customer?.id ?? null;

	// Prefill from the session once.
	useEffect(() => {
		if (session?.customer && !prefilled) {
			if (session.customer.id) setCustomerId(session.customer.id);
			if (session.customer.email) setEmail(session.customer.email);
			if (session.customer.firstName) setFirstName(session.customer.firstName);
			if (session.customer.lastName) setLastName(session.customer.lastName);
			setPrefilled(true);
		}
	}, [session, prefilled]);

	const providers = usePaymentProviders(cartId);
	const [selectedProvider, setSelectedProvider] = useState<ProviderName | null>(null);
	const [paymentData, setPaymentData] = useState<CheckoutStartResponse | null>(null);

	// No cart at all → back to Find care. Only once CartProvider has read the
	// stored cart id from localStorage (before that cartId is always null, so a
	// hard reload of /checkout would otherwise bounce away).
	useEffect(() => {
		if (isLoaded && !cartId && !checkoutComplete && !holdLost) {
			router.replace('/book');
		}
	}, [isLoaded, cartId, checkoutComplete, holdLost, router]);

	const loseHold = useCallback(() => {
		setHoldLost(true);
		setSubmitting(false);
		clearCart();
	}, [clearCart]);

	const openCard = useCallback(
		(orderId: string) => {
			setCheckoutComplete(true);
			clearCart();
			router.push(`/thank-you?orderId=${encodeURIComponent(orderId)}`);
		},
		[clearCart, router],
	);

	const updateBilling = useCallback((patch: Partial<BillingDraft>) => setBilling((b) => ({ ...b, ...patch })), []);
	const setConsent = useCallback(
		(channel: ConsentChannel, value: boolean) => setConsentState((c) => ({ ...c, [channel]: value })),
		[],
	);
	const billingOpen = fields.billingAddress === 'required' || (fields.billingAddress === 'optional' && billingOpenState);

	const cartHeaders = useCallback(
		(): Record<string, string> =>
			cartId ? { 'X-Cart-Id': cartId, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' },
		[cartId],
	);

	/** The contact fields the store asks for, shared by save-customer and checkout start. */
	const contactFields = useCallback(() => {
		let billingAddress: BillingAddress | undefined;
		if (billingOpen) {
			billingAddress = {
				firstName: trimmed(firstName),
				lastName: trimmed(lastName),
				email: trimmed(email),
				phone: trimmed(phone),
				companyName: fields.companyName !== 'hidden' ? trimmed(billing.companyName) : undefined,
				taxRegistrationId: fields.taxId !== 'hidden' ? trimmed(billing.taxRegistrationId) : undefined,
				addressLine1: trimmed(billing.addressLine1),
				addressLine2: trimmed(billing.addressLine2),
				city: trimmed(billing.city),
				state: trimmed(billing.state),
				postalCode: trimmed(billing.postalCode),
				country: billing.country || undefined,
			};
		}
		let marketingConsent: MarketingConsentInput | undefined;
		if (fields.consentChannels.length > 0) {
			marketingConsent = {};
			for (const ch of fields.consentChannels) marketingConsent[ch] = consent[ch];
		}
		return {
			firstName: trimmed(firstName),
			lastName: trimmed(lastName),
			phone: fields.phone !== 'hidden' ? trimmed(phone) : undefined,
			billingAddress,
			marketingConsent,
		};
	}, [billing, billingOpen, consent, email, fields, firstName, lastName, phone]);

	// 01 — Save contact details.
	const handleSaveCustomer = useCallback(
		async (e: React.FormEvent) => {
			e.preventDefault();
			setError(null);
			setFieldErrors({});
			setSubmitting(true);

			try {
				// A signed-in patient checks out as themselves; everyone else by email.
				const customer: ExistingOrderCustomer | NewOrderCustomer = sessionCustomerId
					? { kind: 'existing', customerId: sessionCustomerId, ...contactFields() }
					: { kind: 'new', email: email.trim(), ...contactFields() };

				const res = await fetch('/api/checkout/save-customer', {
					method: 'POST',
					headers: cartHeaders(),
					body: JSON.stringify({ customer }),
				});

				if (!res.ok) {
					const { message, fields: errs } = await readError(res, 'We couldn’t save your details. Please check them and try again.');
					setFieldErrors(errs);
					throw new Error(message);
				}

				const saved = (await res.json().catch(() => ({}))) as SaveCustomerResponse;
				// Only trusted ids come back; an email already on file stays attached to the cart server-side.
				setCustomerId(saved.customerId ?? sessionCustomerId);
				setStep('payment-select');
			} catch (err: unknown) {
				setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
			} finally {
				setSubmitting(false);
			}
		},
		[sessionCustomerId, contactFields, email, cartHeaders],
	);

	// Final — submit the order.
	const handleSubmitCheckout = useCallback(
		async (stripePaymentIntentId?: string) => {
			setError(null);
			setSubmitting(true);

			try {
				const submitPayload: SubmitCheckout = {
					appointmentsSettings: { markAsScheduled: true },
				};
				if (stripePaymentIntentId) submitPayload.stripePaymentIntentId = stripePaymentIntentId;

				const send = () =>
					fetch('/api/checkout/submit', { method: 'POST', headers: cartHeaders(), body: JSON.stringify(submitPayload) });
				let res = await send();
				for (let tries = 0; !res.ok && tries < BUSY_RETRIES; tries++) {
					if ((await readError(res.clone(), '')).code !== 'CHECKOUT_IN_PROGRESS') break;
					await pause(BUSY_WAIT_MS);
					res = await send();
				}

				if (!res.ok) {
					const failure = await readError(res, 'We couldn’t file your visit. Please try again.');
					switch (failure.code) {
						case 'CART_EXPIRED':
							loseHold();
							return;
						case 'PAYMENT_NOT_AUTHORIZED':
							throw new Error('Your card wasn’t authorised. Nothing was taken and the chair is still held: try the card again, or another one.');
						case 'CHECKOUT_IN_PROGRESS':
							throw new Error('We’re still filing this visit. Give it a moment and try again; it won’t be booked twice.');
						default:
							throw new Error(failure.message);
					}
				}

				const data = (await res.json()) as CheckoutResponse;
				const orderId = data.order?.id;
				if (!orderId) throw new Error('We couldn’t file your visit. Please try again.');

				// Auto-authenticate the patient if tokens came back.
				if (data.auth?.accessToken) {
					await nextAuthSignIn('checkout-token', {
						accessToken: data.auth.accessToken,
						refreshToken: data.auth.refreshToken,
						redirect: false,
					});
				}

				// Payment instructions only come back from submit; keep them for the appointment card.
				fileCheckout({
					orderId,
					orderName: data.order.name ?? null,
					state: bookingStateOf((data.order.lineItems ?? []).map((li) => li.appointment)),
					instructions: data.paymentInstructions ?? null,
				});

				setCheckoutComplete(true);
				clearCart();
				router.push(`/thank-you?orderId=${encodeURIComponent(orderId)}`);
			} catch (err: unknown) {
				setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
				setSubmitting(false);
			}
		},
		[cartHeaders, clearCart, loseHold, router],
	);

	// 02 — Start checkout with the chosen method.
	const handleStartCheckout = useCallback(
		async (providerName: ProviderName) => {
			setError(null);
			setSubmitting(true);
			setSelectedProvider(providerName);

			try {
				// Re-send the contact fields: start re-validates the store's requirements. Without a
				// trusted id (an email already on file) they go by email, so billing / consent still
				// reach the booking.
				const startPayload: StartCheckout = {
					provider: providerName,
					customer: customerId
						? { kind: 'existing', customerId, ...contactFields() }
						: { kind: 'new', email: email.trim(), ...contactFields() },
				};

				const res = await fetch('/api/checkout/start', {
					method: 'POST',
					headers: cartHeaders(),
					body: JSON.stringify(startPayload),
				});

				if (!res.ok) {
					const failure = await readError(res, 'We couldn’t start payment. Please try again.');
					if (failure.code === 'CART_ALREADY_CHECKED_OUT') {
						// Already filed (another tab, a double click): a repeat submit hands back that order.
						if (failure.orderId) openCard(failure.orderId);
						else await handleSubmitCheckout();
						return;
					}
					if (failure.code === 'CART_EXPIRED') {
						loseHold();
						return;
					}
					if (failure.code === 'CHECKOUT_IN_PROGRESS') {
						throw new Error('We’re already filing this visit. Give it a moment and try again.');
					}
					throw new Error(failure.message);
				}

				const data: CheckoutStartResponse = await res.json();
				setPaymentData(data);
				setSelectedProvider(data.provider);

				// Card → the Stripe element; hosted page → redirect; everything else (pay at the studio,
				// bank transfer, invoice, nothing to pay) is filed now, with no card form.
				const mode = payModeOf(data.provider, providerName, providers);
				if (mode === 'redirect' && data.redirectUrl) {
					window.location.href = data.redirectUrl;
				} else if (mode === 'internal' || (mode === undefined && data.clientSecret)) {
					setStep('payment');
					setSubmitting(false);
				} else {
					await handleSubmitCheckout();
				}
			} catch (err: unknown) {
				setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
				setSubmitting(false);
			}
		},
		[cartHeaders, customerId, contactFields, email, providers, openCard, loseHold, handleSubmitCheckout],
	);

	const items = useMemo(() => cart?.items ?? [], [cart?.items]);
	const isExpired = timeRemaining !== null && timeRemaining <= 0;

	const value = useMemo<CheckoutContextValue>(
		() => ({
			step,
			error,
			fieldErrors,
			submitting,
			checkoutComplete,
			holdLost,
			fields,
			email,
			firstName,
			lastName,
			phone,
			billing,
			billingOpen,
			consent,
			signedIn: Boolean(sessionCustomerId),
			customerId,
			setEmail,
			setFirstName,
			setLastName,
			setPhone,
			updateBilling,
			setBillingOpen,
			setConsent,
			providers,
			selectedProvider,
			paymentData,
			items,
			isExpired,
			timeRemaining,
			setStep,
			setError,
			handleSaveCustomer,
			handleStartCheckout,
			handleSubmitCheckout,
			extendCart,
		}),
		[
			step,
			error,
			fieldErrors,
			submitting,
			checkoutComplete,
			holdLost,
			fields,
			email,
			firstName,
			lastName,
			phone,
			billing,
			billingOpen,
			consent,
			sessionCustomerId,
			customerId,
			updateBilling,
			setConsent,
			providers,
			selectedProvider,
			paymentData,
			items,
			isExpired,
			timeRemaining,
			handleSaveCustomer,
			handleStartCheckout,
			handleSubmitCheckout,
			extendCart,
		],
	);

	return <CheckoutContext.Provider value={value}>{children}</CheckoutContext.Provider>;
}

export function useCheckout(): CheckoutContextValue {
	const ctx = useContext(CheckoutContext);
	if (!ctx) {
		throw new Error('useCheckout must be used within CheckoutProvider');
	}
	return ctx;
}
