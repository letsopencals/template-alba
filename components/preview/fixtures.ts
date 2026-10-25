import { prepFor, studioMeta } from '@/lib/site-config';
import type { CardVisit } from '@/components/confirmation/card-model';
import type { CareVisit } from '@/components/account/care-types';
import type { TrackLane } from '@/components/book/chair-track';

/*
 * Fixtures for /preview/[screen]: the screens behind a finished booking,
 * without calling the store. Times are relative to "now", so build them on the
 * client after hydration.
 */

const DAY = 86_400_000;
const at = (now: number, days: number, hh: number, mm = 0): number => {
	const d = new Date(now + days * DAY);
	d.setHours(hh, mm, 0, 0);
	return d.getTime();
};
const IMG = (slug: string) => `/images/team/${slug}.jpg`;

function card(p: Partial<CardVisit> & Pick<CardVisit, 'id' | 'title' | 'from' | 'to'>): CardVisit {
	const studioSlug = p.studioSlug ?? 'marylebone';
	const department = p.department ?? 'general-dentistry';
	return {
		option: null,
		productSlug: 'check-up',
		department,
		kids: false,
		video: false,
		clinicianName: 'Dr Helena Whitmore',
		clinicianImage: IMG('helena-whitmore'),
		clinicianSlug: 'helena-whitmore',
		studioTitle: 'Marylebone',
		studioSlug,
		address: '41 Wimpole Street, London W1G 8AE',
		directionsHref: 'https://www.google.com/maps/search/?api=1&query=41%20Wimpole%20Street%20London',
		onlineLink: null,
		transportNote: studioMeta(studioSlug).note ?? null,
		patientName: null,
		nickname: null,
		addOns: [],
		prep: prepFor(department, false),
		...p,
	};
}

export function previewCards(now: number): { adult: CardVisit[]; kids: CardVisit[] } {
	const from = at(now, 3, 10, 30);
	return {
		adult: [
			card({ id: 'pv-1', title: 'Check-up', from, to: from + 30 * 60_000, addOns: ['Fluoride varnish'] }),
			card({
				id: 'pv-2',
				title: 'Hygiene Visit',
				option: 'Hygiene clean',
				productSlug: 'hygiene-clean',
				department: 'hygiene',
				from: from + 30 * 60_000,
				to: from + 60 * 60_000,
				clinicianName: 'Ella Morgan',
				clinicianImage: IMG('ella-morgan'),
				clinicianSlug: 'ella-morgan',
			}),
		],
		kids: [
			card({
				id: 'pv-k',
				title: 'Kids Check-up',
				option: 'Ages 7–12',
				productSlug: 'kids-check-up-junior',
				department: 'childrens-dentistry',
				kids: true,
				from: at(now, 5, 9, 45),
				to: at(now, 5, 10, 15),
				clinicianName: 'Dr Noor Haddad',
				clinicianImage: IMG('noor-haddad'),
				clinicianSlug: 'noor-haddad',
				studioTitle: 'Notting Hill',
				studioSlug: 'notting-hill',
				address: '88 Westbourne Grove, London W2 5RT',
				patientName: 'Maya Davies',
				nickname: 'Maya',
			}),
		],
	};
}

export function previewLanes(now: number): TrackLane[] {
	const c = previewCards(now).adult;
	return [
		{
			key: 'pv',
			station: 'Marylebone',
			when: '10:30',
			whenSub: 'Thu 29 Oct',
			patient: 'You',
			blocks: [
				{ key: 'a', kind: 'treatment', title: 'Check-up', minutes: 30, offset: 0, face: { name: c[0]!.clinicianName!, src: c[0]!.clinicianImage }, tabs: ['Fluoride'], state: 'held', label: 'Check-up' },
				{ key: 'b', kind: 'hygiene', title: 'Hygiene clean', minutes: 30, offset: 30, face: { name: 'Ella Morgan', src: IMG('ella-morgan') }, state: 'held', label: 'Hygiene clean' },
			],
		},
	];
}

type Partialish = Omit<CareVisit, 'product' | 'patient' | 'clinician' | 'place'> & {
	product: Partial<CareVisit['product']> & Pick<CareVisit['product'], 'slug' | 'title'>;
};

function visit(now: number, v: { id: string; slug: string; title: string; variant?: string; days: number; hh: number; status: CareVisit['status']; who: 'me' | 'oscar'; staff: [string, string]; dept: string }): CareVisit {
	const from = at(now, v.days, v.hh, v.hh % 1 ? 30 : 0);
	const child = v.who === 'oscar';
	const base: Partialish = {
		id: v.id,
		status: v.status,
		from: new Date(from).toISOString(),
		to: new Date(from + 30 * 60_000).toISOString(),
		createdAt: new Date(from - 20 * DAY).toISOString(),
		product: { slug: v.slug, title: v.title, variantTitle: v.variant ?? null },
		department: v.dept,
		video: false,
		answers: [],
		feedback: [],
		addOns: [],
		charge: null,
	};
	return {
		...base,
		product: { id: v.slug, productId: v.slug, duration: 1800, price: 65, imageUrl: null, allowCustomDuration: false, allowCustomerCancel: true, allowCustomerReschedule: true, cancelGap: 86400, rescheduleGap: 86400, variantTitle: null, ...base.product },
		patient: child ? { visitFor: 'child', name: 'Oscar Davies', dob: null, nickname: 'Ozzie', comfort: 'nervous' } : { visitFor: 'self', name: null, dob: null, nickname: null, comfort: 'relaxed' },
		clinician: { id: v.staff[0], slug: v.staff[0], name: v.staff[1], firstName: v.staff[1].replace(/^Dr\s/, '').split(' ')[0]!, imageUrl: IMG(v.staff[0]), title: '' },
		place: { id: 'loc-marylebone', slug: 'marylebone', title: 'Alba Marylebone', video: false, addressLines: ['41 Wimpole Street', 'London W1G 8AE'], latitude: null, longitude: null, link: null },
	};
}

export function previewCareVisits(now: number): CareVisit[] {
	return [
		visit(now, { id: 'c1', slug: 'check-up', title: 'Check-up', days: 3, hh: 10.5, status: 'scheduled', who: 'me', staff: ['helena-whitmore', 'Dr Helena Whitmore'], dept: 'general-dentistry' }),
		visit(now, { id: 'c2', slug: 'kids-sparkle-clean', title: 'Kids Sparkle Clean', days: 9, hh: 16, status: 'scheduled', who: 'oscar', staff: ['grace-liu', 'Grace Liu'], dept: 'childrens-dentistry' }),
		visit(now, { id: 'c3', slug: 'hygiene-clean', title: 'Hygiene Visit', variant: 'Hygiene clean', days: -150, hh: 9, status: 'completed', who: 'me', staff: ['grace-liu', 'Grace Liu'], dept: 'hygiene' }),
		visit(now, { id: 'c4', slug: 'kids-check-up-little', title: 'Kids Check-up', variant: 'Ages 3–6', days: -130, hh: 15.5, status: 'completed', who: 'oscar', staff: ['freya-lindqvist', 'Dr Freya Lindqvist'], dept: 'childrens-dentistry' }),
		visit(now, { id: 'c5', slug: 'new-patient-exam', title: 'New Patient Exam', days: -200, hh: 10, status: 'completed', who: 'me', staff: ['helena-whitmore', 'Dr Helena Whitmore'], dept: 'general-dentistry' }),
		visit(now, { id: 'c6', slug: 'fissure-sealants', title: 'Fissure Sealants', days: -60, hh: 14, status: 'completed', who: 'oscar', staff: ['noor-haddad', 'Dr Noor Haddad'], dept: 'childrens-dentistry' }),
	];
}
