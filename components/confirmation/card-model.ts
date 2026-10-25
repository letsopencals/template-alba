import type { OrderDetailAppointment, OrderDetailResponse } from '@opencals/storefront-sdk';
import { getStaffImageUrl, getStaffName } from '@/lib/staff-utils';
import { prepFor, siteConfig, studioMeta, type Prep } from '@/lib/site-config';
import type { CalendarEvent } from '@/lib/calendar';
import type { CareVisit } from '@/components/account/care-types';
import type { VisitSnapshot } from './snapshot';

/** variant slug → department (collection) slug. */
export type DepartmentIndex = Record<string, string>;

/** One appointment card, whatever it was built from (order, snapshot, care record). */
export interface CardVisit {
	id: string;
	title: string;
	option: string | null;
	productSlug: string | null;
	department: string | null;
	kids: boolean;
	video: boolean;
	/** UTC ms. */
	from: number;
	to: number;
	clinicianName: string | null;
	clinicianImage: string | null;
	clinicianSlug: string | null;
	studioTitle: string | null;
	studioSlug: string | null;
	address: string | null;
	directionsHref: string | null;
	onlineLink: string | null;
	transportNote: string | null;
	patientName: string | null;
	nickname: string | null;
	addOns: string[];
	prep: Prep;
}

const short = (t: string | null | undefined) => (t ? t.replace(/^Alba\s+/i, '') : null);

function isKids(department: string | null, productSlug: string | null): boolean {
	return department === siteConfig.collections.kids || /^kids-|happy-visit|tooth-town|fissure|first-look/.test(productSlug ?? '');
}

function directions(address: string | null): string | null {
	return address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}` : null;
}

function addressOf(a: OrderDetailAppointment): string | null {
	const loc = a.location;
	if (a.displayAddress) return a.displayAddress;
	if (!loc) return null;
	if (loc.displayAddress) return loc.displayAddress;
	if (loc.address) return loc.address;
	const parts = [loc.addressLine1, loc.addressLine2, loc.city, loc.postalCode].filter(Boolean);
	return parts.length ? parts.join(', ') : null;
}

function base(
	partial: Omit<CardVisit, 'kids' | 'prep' | 'directionsHref' | 'transportNote' | 'department'> & { department: string | null },
): CardVisit {
	const meta = partial.studioSlug ? studioMeta(partial.studioSlug) : null;
	return {
		...partial,
		kids: isKids(partial.department, partial.productSlug),
		prep: prepFor(partial.department, partial.video),
		directionsHref: partial.video ? null : directions(partial.address),
		transportNote: partial.video ? null : (meta?.note ?? null),
	};
}

export function cardsFromOrder(order: OrderDetailResponse | null | undefined, departments: DepartmentIndex): CardVisit[] {
	if (!order) return [];
	return (order.lineItems ?? []).flatMap((li, i) => {
		const a = li.appointment;
		if (!a) return [];
		const loc = a.location ?? null;
		const video = loc?.type === 'online';
		const option = a.product?.variantTitle && a.product.variantTitle !== 'Default Title' ? a.product.variantTitle : null;
		const productSlug = a.product?.slug ?? null;
		return [
			base({
				id: a.id ?? `line-${i}`,
				title: a.product?.title ?? 'Visit',
				option,
				productSlug,
				department: (productSlug && departments[productSlug]) || null,
				video,
				from: Date.parse(a.from),
				to: Date.parse(a.to),
				clinicianName: a.staffMember ? getStaffName(a.staffMember) || null : null,
				clinicianImage: a.staffMember ? getStaffImageUrl(a.staffMember) : null,
				clinicianSlug: (a.staffMember as { slug?: string } | null)?.slug ?? null,
				studioTitle: video ? 'Video' : short(loc?.title),
				studioSlug: loc?.slug ?? null,
				address: video ? null : addressOf(a),
				onlineLink: video ? (loc?.link ?? null) : null,
				patientName: null,
				nickname: null,
				addOns: (li.addOnLineItems ?? []).map((ao) => ao.addOn?.title ?? 'Add-on'),
			}),
		];
	});
}

export function cardsFromSnapshot(s: VisitSnapshot | null, departments: DepartmentIndex): CardVisit[] {
	if (!s) return [];
	return s.visits.map((v) =>
		base({
			id: v.id,
			title: v.title,
			option: v.option,
			productSlug: v.productSlug,
			department: (v.productSlug && departments[v.productSlug]) || null,
			video: v.video,
			from: Date.parse(v.from),
			to: Date.parse(v.to),
			clinicianName: v.clinicianName,
			clinicianImage: v.clinicianImage,
			clinicianSlug: null,
			studioTitle: v.video ? 'Video' : short(v.locationTitle),
			studioSlug: v.locationSlug,
			address: v.address,
			onlineLink: null,
			patientName: v.patientName,
			nickname: null,
			addOns: v.addOns,
		}),
	);
}

export function cardFromCare(v: CareVisit): CardVisit {
	const address = v.place && !v.place.video ? v.place.addressLines.join(', ') || null : null;
	return base({
		id: v.id,
		title: v.product.title,
		option: v.product.variantTitle,
		productSlug: v.product.slug,
		department: v.department,
		video: v.video,
		from: Date.parse(v.from),
		to: Date.parse(v.to),
		clinicianName: v.clinician?.name ?? null,
		clinicianImage: v.clinician?.imageUrl ?? null,
		clinicianSlug: v.clinician?.slug ?? null,
		studioTitle: v.video ? 'Video' : short(v.place?.title),
		studioSlug: v.place?.slug ?? null,
		address,
		onlineLink: v.place?.link ?? null,
		patientName: v.patient.name,
		nickname: v.patient.nickname,
		addOns: v.addOns.map((a) => a.title),
	});
}

export function calendarEventOf(c: CardVisit): CalendarEvent {
	return {
		uid: c.id,
		title: `${c.title} · ${siteConfig.name}`,
		start: c.from,
		end: c.to,
		location: c.address ?? c.onlineLink ?? c.studioTitle ?? undefined,
		description: [c.option, c.clinicianName ? `with ${c.clinicianName}` : null, c.video ? 'Video consultation. Your link arrives by email.' : c.studioTitle].filter(Boolean).join(' · ') || undefined,
	};
}

/** The recall this visit starts ("your next check-up"), as a /book deep link and a due date. */
export function recallOf(c: CardVisit): { label: string; href: string; due: number } {
	const r = siteConfig.recalls.find((x) => c.productSlug && x.services.includes(c.productSlug)) ?? (c.kids ? siteConfig.recalls.find((x) => x.book.startsWith('kids-')) : null) ?? siteConfig.recalls[0]!;
	const due = new Date(c.from);
	due.setMonth(due.getMonth() + r.months);
	const params = new URLSearchParams({ service: r.book });
	if (c.studioSlug && !c.video) params.set('clinic', c.studioSlug);
	if (c.clinicianSlug) params.set('staff', c.clinicianSlug);
	if (c.kids) params.set('for', 'child');
	return { label: r.label, href: `/book?${params}`, due: due.getTime() };
}
