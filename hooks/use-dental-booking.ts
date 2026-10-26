'use client';

import { useCallback, useMemo, useState } from 'react';
import type { CheckoutQuestionResponse } from '@opencals/storefront-sdk';
import { useCart } from '@/contexts/cart-context';
import { useBookingAddOns } from '@/hooks/use-booking-add-ons';
import { questionTitle, useCheckoutQuestions } from '@/hooks/use-checkout-questions';
import { invalidateStudioAvailability, useStudioAvailability } from '@/hooks/use-studio-availability';
import { CHECKBOX_FALSE, comfortOption, indexIntake, intakeKey, isHandledByComposer, isRequiredFor, isVisible, keyMapOf, patientOf, visitForOption, type AnswerMap, type Comfort, type VisitFor } from '@/lib/intake';
import { rememberPatient } from '@/components/confirmation/snapshot';
import { localDate, nextFree, slotOf, startsByDay, startsOf, type Start } from '@/lib/slots';
import { siteConfig } from '@/lib/site-config';
import type { Treatment } from '@/lib/catalog';
import type { PublicClinician } from '@/lib/clinicians';

/**
 * The /book orchestrator. Composes availability (one cached request per
 * treatment × studio, see `useStudioAvailability`), add-ons and questions, and
 * owns the patient's choices, the open step and the hold in the cart.
 * Selections are derived where possible (studio, clinician, the start's staff)
 * so changing one never needs an effect to repair another.
 */

export const STEP = { treatment: 0, studio: 1, clinician: 2, time: 3, extras: 4, about: 5 } as const;
export type StepIndex = (typeof STEP)[keyof typeof STEP];
export const STEP_COUNT = 6;

export interface StudioLite {
	id: string;
	slug: string;
	title: string;
	addressLines: string[];
	latitude: number | null;
	longitude: number | null;
}

export interface BookInitial {
	service?: string | null;
	for?: VisitFor | null;
	dept?: string | null;
	clinic?: string | null;
	staff?: string | null;
	comfort?: Comfort | null;
	nickname?: string | null;
	concern?: string | null;
}

export interface BookError {
	message: string;
	code: 'slot_unavailable' | 'other';
}

/** Comfort faces (1–5) → the three stored levels. */
export const COMFORT_OF_FACE: Record<number, Comfort> = { 1: 'relaxed', 2: 'relaxed', 3: 'nervous', 4: 'nervous', 5: 'anxious' };
const FACE_OF_COMFORT: Record<Comfort, number> = { relaxed: 1, nervous: 3, anxious: 5 };

/** DD/MM/YYYY, a real date, not in the future, not before 1900. */
export function isValidDob(value: string): boolean {
	const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value.trim());
	if (!m) return false;
	const [day, month, year] = [Number(m[1]), Number(m[2]), Number(m[3])];
	const d = new Date(Date.UTC(year, month - 1, day));
	if (d.getUTCFullYear() !== year || d.getUTCMonth() !== month - 1 || d.getUTCDate() !== day) return false;
	return year >= 1900 && d.getTime() <= Date.now();
}

const HYGIENE_AFTER_FOR = new Set(['check-up', 'new-patient-exam']);
const HYGIENE_SLUG = 'hygiene-clean';
/** Answers that carry over to the hygienist visit (questions attached to every product). */
const SHARED_KEYS = new Set(['visitFor', 'patientName', 'patientDob', 'comfort', 'nickname']);

function distanceKm(a: { latitude: number | null; longitude: number | null }, b: { lat: number; lng: number }): number | null {
	if (a.latitude == null || a.longitude == null) return null;
	const R = 6371;
	const dLat = ((b.lat - a.latitude) * Math.PI) / 180;
	const dLng = ((b.lng - a.longitude) * Math.PI) / 180;
	const x = Math.sin(dLat / 2) ** 2 + Math.cos((a.latitude * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
	return 2 * R * Math.asin(Math.sqrt(x));
}

export function useDentalBooking({
	treatments,
	clinicians,
	studios,
	online,
	timeZone,
	initial,
	initialQuestions,
}: {
	treatments: Treatment[];
	clinicians: PublicClinician[];
	studios: StudioLite[];
	online: StudioLite | null;
	timeZone: string;
	initial: BookInitial;
	initialQuestions?: { slug: string; questions: CheckoutQuestionResponse[] } | null;
}) {
	const { cartId, setCart, removeItem, timeRemaining } = useCart();

	// ------------------------------------------------------------ Treatment
	const resolveSlug = (slug: string | null | undefined) => {
		if (!slug) return null;
		return treatments.find((t) => t.slug === slug)?.slug ?? treatments.find((t) => t.groupSlug === slug)?.slug ?? null;
	};
	const [treatmentSlug, setTreatmentSlug] = useState<string | null>(() => resolveSlug(initial.service));
	const [dept, setDept] = useState<string | null>(() => initial.dept ?? (initial.for === 'child' ? siteConfig.collections.kids : null));
	const treatment = treatments.find((t) => t.slug === treatmentSlug) ?? null;
	const isVideo = !!treatment && treatment.studios.length === 0 && !!treatment.online;
	const isKids = treatment?.kind === 'kids';

	// ------------------------------------------------------------ Studio
	const [studioChoice, setStudioChoice] = useState<string | null>(initial.clinic ?? null);
	const [near, setNear] = useState<{ lat: number; lng: number } | null>(null);
	const offeredStudios = useMemo(() => {
		if (!treatment) return [] as StudioLite[];
		const ids = new Set(treatment.studios.map((s) => s.id));
		return studios.filter((s) => ids.has(s.id));
	}, [treatment, studios]);
	const location: StudioLite | null = isVideo
		? online
		: (offeredStudios.find((s) => s.slug === studioChoice) ?? (offeredStudios.length === 1 ? offeredStudios[0]! : null));
	const locationStaffIds = useMemo(() => {
		if (!treatment || !location) return [] as string[];
		const entry = isVideo ? treatment.online : treatment.studios.find((s) => s.id === location.id);
		return entry?.staffIds ?? [];
	}, [treatment, location, isVideo]);

	// One request per studio for this treatment: next free per studio, "sooner nearby", the times.
	const probeIds = useMemo(() => (isVideo ? (online ? [online.id] : []) : offeredStudios.map((s) => s.id)), [isVideo, online, offeredStudios]);
	const { byLocation, loading: availabilityLoading } = useStudioAvailability(treatment?.id, probeIds);
	const nextByStudio = useMemo(() => {
		const out: Record<string, Start | null> = {};
		for (const id of probeIds) out[id] = nextFree(byLocation[id]);
		return out;
	}, [byLocation, probeIds]);

	// ------------------------------------------------------------ Clinician
	const byId = useMemo(() => new Map(clinicians.map((c) => [c.id, c])), [clinicians]);
	const candidates = useMemo(() => locationStaffIds.map((id) => byId.get(id)).filter((c): c is PublicClinician => !!c), [locationStaffIds, byId]);
	const initialStaff = initial.staff ? (clinicians.find((c) => c.slug === initial.staff)?.id ?? null) : null;
	/** null = not answered yet, 'any' = first available. */
	const [staffChoice, setStaffChoice] = useState<string | null>(initialStaff);
	const staffPick: string | 'any' | null = staffChoice && staffChoice !== 'any' && !locationStaffIds.includes(staffChoice) ? null : staffChoice;
	const clinicianDone = staffPick !== null || (!!location && candidates.length <= 1);
	const namedStaff = staffPick && staffPick !== 'any' ? staffPick : null;

	// ------------------------------------------------------------ Time
	const availability = location ? byLocation[location.id] : null;
	const starts = useMemo(() => startsOf(availability, namedStaff), [availability, namedStaff]);
	const days = useMemo(() => startsByDay(starts, timeZone), [starts, timeZone]);
	const [day, setDay] = useState<string | null>(null);
	const [startAt, setStartAt] = useState<number | null>(null);
	const [pickedStaff, setPickedStaff] = useState<string | null>(null);
	const activeDay = day && days.has(day) ? day : null;
	const selected = startAt != null ? (starts.find((s) => s.at === startAt) ?? null) : null;
	const freeAtStart = selected?.staffIds ?? [];
	const finalStaffId = namedStaff ?? (pickedStaff && freeAtStart.includes(pickedStaff) ? pickedStaff : (freeAtStart[0] ?? null));
	const finalClinician = finalStaffId ? (byId.get(finalStaffId) ?? null) : null;
	const timeDone = !!selected && !!finalStaffId;
	const endAt = selected && treatment ? selected.at + treatment.duration * 1000 : null;

	// "Sooner nearby": another studio is at least a day sooner for the same treatment.
	const sooner = useMemo(() => {
		if (isVideo || !location || namedStaff) return null;
		const mine = nextByStudio[location.id];
		let best: { studio: StudioLite; at: number } | null = null;
		for (const s of offeredStudios) {
			if (s.id === location.id) continue;
			const n = nextByStudio[s.id];
			if (n && (!mine || n.at + 86_400_000 <= mine.at) && (!best || n.at < best.at)) best = { studio: s, at: n.at };
		}
		return best;
	}, [isVideo, location, namedStaff, nextByStudio, offeredStudios]);

	// ------------------------------------------------------------ Extras
	const addOns = useBookingAddOns({ variantSlug: treatment?.slug ?? null, locationId: location?.id ?? null, staffMemberId: finalStaffId, bookedDurationUnits: 1 });
	const hygiene = treatment && HYGIENE_AFTER_FOR.has(treatment.slug) ? (treatments.find((t) => t.slug === HYGIENE_SLUG) ?? null) : null;
	const hygieneHere = hygiene && location ? hygiene.studios.some((s) => s.id === location.id) : false;
	const { byLocation: hygieneAvail } = useStudioAvailability(hygieneHere && timeDone ? hygiene!.id : null, hygieneHere && location ? [location.id] : []);
	const hygieneSlot = useMemo(() => {
		if (!hygieneHere || !location || endAt == null) return null;
		const s = startsOf(hygieneAvail[location.id]).find((x) => x.at >= endAt && x.at <= endAt + 15 * 60_000);
		return s ? { at: s.at, staffId: s.staffIds[0]!, clinician: byId.get(s.staffIds[0]!) ?? null } : null;
	}, [hygieneHere, location, endAt, hygieneAvail, byId]);
	const [hygieneAfter, setHygieneAfter] = useState(false);
	const withHygiene = hygieneAfter && !!hygieneSlot;
	const [extrasDone, setExtrasDone] = useState(false);
	const noExtras = !addOns.addOnsLoading && addOns.availableAddOns.length === 0 && !hygieneHere;

	// ------------------------------------------------------------ About
	const fallback = initialQuestions && treatment && initialQuestions.slug === treatment.slug ? initialQuestions.questions : undefined;
	const questions = useCheckoutQuestions(treatment?.slug ?? null, fallback);
	const intake = useMemo(() => indexIntake(questions), [questions]);
	const [visitFor, setVisitFor] = useState<VisitFor | null>(() => initial.for ?? null);
	const effectiveFor: VisitFor = visitFor ?? (isKids ? 'child' : 'self');
	const [comfortFace, setComfortFace] = useState<number | null>(() => (initial.comfort ? FACE_OF_COMFORT[initial.comfort] : null));
	const [answers, setAnswers] = useState<AnswerMap>({});
	const [prefilled, setPrefilled] = useState<string | null>(null);
	// Deep-link prefills (nickname, concern) land once the matching questions are known.
	if (questions.length > 0 && prefilled !== treatment?.slug) {
		setPrefilled(treatment?.slug ?? null);
		const next: AnswerMap = {};
		if (initial.nickname && intake.nickname && !answers[intake.nickname.id]) next[intake.nickname.id] = initial.nickname;
		if (initial.concern && intake.concern && !answers[intake.concern.id]) next[intake.concern.id] = initial.concern;
		if (Object.keys(next).length) setAnswers((a) => ({ ...a, ...next }));
	}

	const noteQuestions = useMemo(
		() => questions.filter((q) => !isHandledByComposer(q) && q.type !== 'file-upload' && isVisible(q, effectiveFor)).sort((a, b) => a.order - b.order),
		[questions, effectiveFor],
	);
	const [showErrors, setShowErrors] = useState(false);
	const fieldErrors = useMemo(() => {
		const out: Record<string, string> = {};
		for (const q of noteQuestions) {
			const required = isRequiredFor(q, effectiveFor);
			const v = (answers[q.id] ?? '').trim();
			if (intakeKey(q) === 'patientDob' && v && !isValidDob(v)) out[q.id] = 'Please use DD/MM/YYYY, for example 23/04/2019.';
			else if (required && (!v || v === CHECKBOX_FALSE)) out[q.id] = q.type === 'checkbox' ? 'Please confirm this to continue.' : 'Please fill this in.';
		}
		return out;
	}, [noteQuestions, effectiveFor, answers]);

	// ------------------------------------------------------------ Steps
	const done: Record<StepIndex, boolean> = {
		0: !!treatment,
		1: !!location,
		2: clinicianDone,
		3: timeDone,
		4: extrasDone || noExtras,
		5: false,
	};
	const firstOpen = (from: number, o: Partial<Record<StepIndex, boolean>> = {}): StepIndex => {
		for (let i = from; i < STEP_COUNT - 1; i++) if (!(o[i as StepIndex] ?? done[i as StepIndex])) return i as StepIndex;
		return STEP.about;
	};
	const [open, setOpen] = useState<StepIndex>(() => firstOpen(0));
	const doneCount = ([0, 1, 2, 3, 4] as StepIndex[]).filter((i) => done[i]).length;

	// ------------------------------------------------------------ Hold
	const [held, setHeld] = useState<{ itemIds: string[] } | null>(null);
	const [booking, setBooking] = useState(false);
	const [error, setError] = useState<BookError | null>(null);

	const resetTime = useCallback(() => {
		setStartAt(null);
		setPickedStaff(null);
		setHygieneAfter(false);
	}, []);

	// ------------------------------------------------------------ Handlers
	const chooseTreatment = useCallback(
		(slug: string) => {
			setTreatmentSlug(slug);
			resetTime();
			setDay(null);
			setExtrasDone(false);
			addOns.resetSelection();
			setError(null);
			const t = treatments.find((x) => x.slug === slug);
			if (t?.kind === 'kids' && !visitFor) setVisitFor('child');
			const offered = t ? t.studios : [];
			const studioOk = !!t && (offered.length === 0 ? !!t.online : offered.some((s) => s.slug === studioChoice) || offered.length === 1);
			setOpen(studioOk ? STEP.clinician : STEP.studio);
		},
		[resetTime, addOns, treatments, visitFor, studioChoice],
	);

	const chooseStudio = useCallback(
		(slug: string) => {
			setStudioChoice(slug);
			resetTime();
			setDay(null);
			setError(null);
			const loc = offeredStudios.find((s) => s.slug === slug);
			const staffHere = loc && treatment ? (treatment.studios.find((s) => s.id === loc.id)?.staffIds ?? []) : [];
			const keepStaff = staffChoice === 'any' || (!!staffChoice && staffHere.includes(staffChoice));
			if (!keepStaff) setStaffChoice(null);
			setOpen(keepStaff || staffHere.length <= 1 ? STEP.time : STEP.clinician);
		},
		[resetTime, offeredStudios, treatment, staffChoice],
	);

	const chooseClinician = useCallback(
		(id: string | 'any') => {
			setStaffChoice(id);
			resetTime();
			setError(null);
			setOpen(STEP.time);
		},
		[resetTime],
	);

	const chooseDay = useCallback((d: string) => {
		setDay(d);
		setStartAt(null);
		setPickedStaff(null);
	}, []);

	const advanceFromTime = useCallback(
		() => setOpen(firstOpen(STEP.extras, { 3: true })),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[extrasDone, noExtras],
	);

	const chooseStart = useCallback(
		(at: number) => {
			setStartAt(at);
			setPickedStaff(null);
			setHygieneAfter(false);
			setError(null);
			// "First available" with several people free: stay so the patient can pick one.
			const s = starts.find((x) => x.at === at);
			if (staffPick === 'any' && s && s.staffIds.length > 1) return;
			advanceFromTime();
		},
		[starts, staffPick, advanceFromTime],
	);

	const pickSoonest = useCallback(() => {
		const first = starts[0];
		if (!first) return;
		setDay(localDate(first.at, timeZone));
		chooseStart(first.at);
	}, [starts, timeZone, chooseStart]);

	const switchToSooner = useCallback(() => {
		if (!sooner) return;
		setStudioChoice(sooner.studio.slug);
		setStaffChoice('any');
		setDay(localDate(sooner.at, timeZone));
		setStartAt(sooner.at);
		setPickedStaff(null);
		setOpen(STEP.time);
	}, [sooner, timeZone]);

	const continueFromExtras = useCallback(() => {
		setExtrasDone(true);
		setOpen(STEP.about);
	}, []);

	const setAnswer = useCallback((questionId: string, value: string) => {
		setAnswers((prev) => (prev[questionId] === value ? prev : { ...prev, [questionId]: value }));
	}, []);

	const useMyLocation = useCallback(() => {
		if (typeof navigator === 'undefined' || !navigator.geolocation) return;
		navigator.geolocation.getCurrentPosition(
			(pos) => setNear({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
			() => undefined,
			{ maximumAge: 600_000, timeout: 8000 },
		);
	}, []);
	const distances = useMemo(() => {
		const out: Record<string, number | null> = {};
		if (near) for (const s of offeredStudios) out[s.id] = distanceKm(s, near);
		return out;
	}, [near, offeredStudios]);

	// ------------------------------------------------------------ Missing
	const missing: string[] = [];
	if (!treatment) missing.push('a treatment');
	else if (!location) missing.push('a studio');
	else if (!clinicianDone) missing.push('who you’d like to see');
	else if (!selected) missing.push('a time');
	if (Object.keys(fieldErrors).length > 0) missing.push('a few details about the patient');
	const canReserve = missing.length === 0 && !booking && !held;

	// ------------------------------------------------------------ Totals
	const basePrice = treatment?.price ?? 0;
	const hygienePrice = withHygiene ? (hygiene?.price ?? 0) : 0;
	const total = basePrice + addOns.addOnsTotal + hygienePrice;

	// ------------------------------------------------------------ Payload
	const buildAnswers = useCallback(
		(onlyShared = false) => {
			const out: { questionId: string; question: string; answer: string }[] = [];
			if (intake.visitFor) out.push({ questionId: intake.visitFor.id, question: questionTitle(intake.visitFor), answer: visitForOption(intake.visitFor, effectiveFor) });
			if (intake.comfort && comfortFace) out.push({ questionId: intake.comfort.id, question: questionTitle(intake.comfort), answer: comfortOption(intake.comfort, COMFORT_OF_FACE[comfortFace]!) });
			for (const q of noteQuestions) {
				if (onlyShared && !SHARED_KEYS.has(intakeKey(q) ?? '')) continue;
				const raw = answers[q.id];
				if (raw === undefined) continue;
				const value = q.type === 'checkbox' ? (raw === '' ? CHECKBOX_FALSE : raw) : raw.trim();
				if (value) out.push({ questionId: q.id, question: questionTitle(q), answer: value });
			}
			return out;
		},
		[intake, effectiveFor, comfortFace, noteQuestions, answers],
	);

	const postBook = useCallback(
		async (cart: string | null, body: unknown) => {
			const headers: Record<string, string> = { 'Content-Type': 'application/json' };
			if (cart) headers['X-Cart-Id'] = cart;
			const res = await fetch('/api/book', { method: 'POST', headers, body: JSON.stringify(body) });
			const data = (await res.json().catch(() => null)) as { cart?: Parameters<typeof setCart>[0]; itemId?: string | null; error?: string; code?: string } | null;
			return { ok: res.ok, data };
		},
		[setCart],
	);

	const reserve = useCallback(async (): Promise<boolean> => {
		setShowErrors(true);
		if (!treatment || !location || !selected || !finalStaffId || missing.length > 0 || booking || held) {
			if (Object.keys(fieldErrors).length > 0) setOpen(STEP.about);
			return false;
		}
		setBooking(true);
		setError(null);
		try {
			const first = await postBook(cartId, {
				slot: { productId: treatment.id, ...slotOf(selected.at, treatment.duration), staffMemberId: finalStaffId, locationId: location.id },
				numberOfAttendees: 1,
				addOns: Array.from(addOns.selectedAddOns.entries()).map(([addOnId, quantity]) => {
					const a = addOns.availableAddOns.find((x) => x.id === addOnId);
					return a?.durationMultiplied ? { addOnId } : { addOnId, quantity };
				}),
				checkoutQuestionAnswers: buildAnswers(),
			});
			if (!first.ok) {
				if (first.data?.cart) setCart(first.data.cart);
				const code = first.data?.code === 'slot_unavailable' ? 'slot_unavailable' : 'other';
				if (code === 'slot_unavailable') {
					invalidateStudioAvailability();
					resetTime();
					setOpen(STEP.time);
				}
				setError({ message: first.data?.error || 'We couldn’t hold that time. Please try again.', code });
				return false;
			}
			if (first.data?.cart) setCart(first.data.cart);
			const itemIds = [first.data?.itemId].filter((x): x is string => !!x);

			if (withHygiene && hygiene && hygieneSlot) {
				const newCartId = (first.data?.cart as { id?: string } | undefined)?.id ?? cartId;
				const second = await postBook(newCartId, {
					slot: { productId: hygiene.id, ...slotOf(hygieneSlot.at, hygiene.duration), staffMemberId: hygieneSlot.staffId, locationId: location.id },
					numberOfAttendees: 1,
					addOns: [],
					checkoutQuestionAnswers: buildAnswers(true),
				});
				if (second.ok) {
					if (second.data?.cart) setCart(second.data.cart);
					if (second.data?.itemId) itemIds.push(second.data.itemId);
				} else {
					setError({ message: 'Your visit is held, but the hygienist slot was just taken. You can add a hygiene visit separately.', code: 'other' });
				}
			}
			const patient = patientOf(buildAnswers(), keyMapOf(questions));
			rememberPatient(itemIds, { name: patient.name, nickname: patient.nickname });
			setHeld({ itemIds });
			return true;
		} catch {
			setError({ message: 'We couldn’t reach the studio just now. Please try again.', code: 'other' });
			return false;
		} finally {
			setBooking(false);
		}
	}, [treatment, location, selected, finalStaffId, missing.length, booking, held, fieldErrors, postBook, cartId, addOns, buildAnswers, setCart, resetTime, withHygiene, hygiene, hygieneSlot, questions]);

	/** Release the hold and reopen the flow with every choice intact. */
	const [releasing, setReleasing] = useState(false);
	const changeVisit = useCallback(async () => {
		if (!held) return;
		setReleasing(true);
		try {
			for (const id of held.itemIds) await removeItem(id).catch(() => undefined);
			invalidateStudioAvailability();
		} finally {
			setHeld(null);
			setReleasing(false);
		}
	}, [held, removeItem]);

	/** Book another visit (a family member, a second treatment) after a hold: same studio, fresh choices. */
	const bookAnother = useCallback(() => {
		setHeld(null);
		setTreatmentSlug(null);
		resetTime();
		setDay(null);
		setStaffChoice(null);
		setExtrasDone(false);
		setVisitFor(null);
		setAnswers({});
		setShowErrors(false);
		addOns.resetSelection();
		invalidateStudioAvailability();
		setOpen(STEP.treatment);
	}, [resetTime, addOns]);

	return {
		// Treatment
		treatment,
		treatments,
		dept,
		setDept,
		chooseTreatment,
		isVideo,
		isKids: isKids || effectiveFor === 'child',

		// Studio
		offeredStudios,
		location,
		chooseStudio,
		nextByStudio,
		availabilityLoading,
		availabilityFor: (id: string) => byLocation[id],
		useMyLocation,
		distances,
		hasNear: !!near,

		// Clinician
		candidates,
		staffPick,
		chooseClinician,
		cliniciansById: byId,

		// Time
		starts,
		days,
		activeDay,
		chooseDay,
		selected,
		chooseStart,
		advanceFromTime,
		pickSoonest,
		freeAtStart,
		setPickedStaff,
		finalStaffId,
		finalClinician,
		sooner,
		switchToSooner,
		endAt,
		timeZone,

		// Extras
		addOns,
		hygiene,
		hygieneHere,
		hygieneSlot,
		hygieneAfter,
		setHygieneAfter,
		withHygiene,
		continueFromExtras,
		noExtras,

		// About
		questions,
		noteQuestions,
		visitFor: effectiveFor,
		visitForAsked: !!intake.visitFor,
		setVisitFor,
		comfortAsked: !!intake.comfort,
		comfortFace,
		setComfortFace,
		answers,
		setAnswer,
		fieldErrors,
		showErrors,

		// Steps
		open,
		setOpen,
		done,
		doneCount,

		// Totals
		basePrice,
		hygienePrice,
		total,

		// Hold
		missing,
		canReserve,
		booking,
		reserve,
		held: !!held,
		heldCount: held?.itemIds.length ?? 0,
		timeRemaining,
		changeVisit,
		releasing,
		bookAnother,
		error,
	};
}

export type DentalBooking = ReturnType<typeof useDentalBooking>;
