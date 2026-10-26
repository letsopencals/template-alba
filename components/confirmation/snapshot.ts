'use client';

import type { CartItem } from '@opencals/storefront-sdk';
import { toCartLine } from '@/components/cart/cart-line';

/**
 * What the patient booked, kept in sessionStorage while they're on the
 * patient record, so the appointment card can be drawn after checkout even
 * when the order can't be read back (a guest without a session).
 */
export interface SnapshotVisit {
	id: string;
	title: string;
	option: string | null;
	productSlug: string | null;
	clinicianName: string | null;
	clinicianImage: string | null;
	locationTitle: string | null;
	locationSlug: string | null;
	address: string | null;
	video: boolean;
	from: string;
	to: string;
	patientName: string | null;
	/** What to call a child on the card and the bravery certificate. */
	nickname?: string | null;
	addOns: string[];
}

export interface VisitSnapshot {
	savedAt: number;
	currency: string | null;
	total: number;
	visits: SnapshotVisit[];
}

const KEY = 'alba:visit-snapshot';
const PATIENTS_KEY = 'alba:held-patients';
const MAX_AGE = 6 * 60 * 60 * 1000;

/** Who a held cart item is for. Cart payloads don't carry intake answers, so the planner remembers them. */
export interface HeldPatient {
	name: string | null;
	nickname: string | null;
}

function readPatients(): Record<string, HeldPatient> {
	try {
		const raw = sessionStorage.getItem(PATIENTS_KEY);
		return raw ? (JSON.parse(raw) as Record<string, HeldPatient>) : {};
	} catch {
		return {};
	}
}

/** Called by the chair planner when it holds visits, keyed by cart item id. */
export function rememberPatient(itemIds: string[], patient: HeldPatient): void {
	if (!patient.name && !patient.nickname) return;
	try {
		const all = readPatients();
		for (const id of itemIds) all[id] = patient;
		sessionStorage.setItem(PATIENTS_KEY, JSON.stringify(all));
	} catch {
		/* private mode: the card falls back to "you" */
	}
}

export function snapshotFromCart(items: CartItem[], currency: string | null, total: number): VisitSnapshot {
	const visits: SnapshotVisit[] = [];
	const held = readPatients();
	for (const item of items) {
		const line = toCartLine(item);
		const appt = item.appointment;
		if (!line.from || !line.to) continue;
		const loc = appt?.location;
		visits.push({
			id: line.id,
			title: line.title,
			option: line.option,
			productSlug: appt?.product?.slug ?? null,
			clinicianName: line.clinicianName,
			clinicianImage: line.clinicianImage,
			locationTitle: line.locationTitle,
			locationSlug: loc?.slug ?? null,
			address: loc ? ([loc.addressLine1, loc.city, loc.postalCode].filter(Boolean).join(', ') || null) : null,
			video: line.video,
			from: line.from,
			to: line.to,
			patientName: line.patientName ?? held[line.id]?.name ?? null,
			nickname: held[line.id]?.nickname ?? null,
			addOns: line.addOns.map((a) => a.title),
		});
	}
	return { savedAt: Date.now(), currency, total, visits };
}

export function saveSnapshot(s: VisitSnapshot): void {
	try {
		sessionStorage.setItem(KEY, JSON.stringify(s));
	} catch {
		/* private mode: the guest card falls back to the email copy */
	}
}

export function readSnapshot(): VisitSnapshot | null {
	try {
		const raw = sessionStorage.getItem(KEY);
		if (!raw) return null;
		const s = JSON.parse(raw) as VisitSnapshot;
		return Date.now() - s.savedAt < MAX_AGE && Array.isArray(s.visits) ? s : null;
	} catch {
		return null;
	}
}
