import type { ProductCollectionResponse, ProductListItemResponse } from '@opencals/storefront-sdk';
import { siteConfig, type DepartmentKind } from '@/lib/site-config';
import type { DepartmentIndex } from '@/lib/clinicians';
import { compareOptions } from '@/lib/variant-order';

/**
 * The treatment catalogue: every bookable variant and every department
 * (collection), flattened into small, public-safe shapes for the home page,
 * Smile Check, treatment pages and the booking composer. Built on the server
 * from `getProducts()` / `getCollections()` and passed to client components as
 * plain props. Staff travel only as ids per studio (names and faces come from
 * `PublicClinician`). Client-safe (no SDK calls).
 */

export interface Treatment {
	/** Variant id (what availability and booking take). */
	id: string;
	/** Variant slug (what `/book?service=` takes). */
	slug: string;
	/** Product group slug and title, e.g. "hygiene" / "Hygiene Visit". */
	groupSlug: string;
	groupTitle: string;
	/** The option within the group, e.g. "Deep clean"; null for single-variant groups. */
	option: string | null;
	/** Display name: the option for multi-variant groups ("Deep clean"), else the group title. */
	title: string;
	description: string | null;
	/** Plain-English note from site-config, if any. */
	note: string | null;
	price: number;
	/** Seconds. */
	duration: number;
	image: string | null;
	/** Department (collection) slug and kind. */
	department: string | null;
	kind: DepartmentKind | null;
	/** Offered on video (at the online location). */
	video: boolean;
	/** Studios (physical locations) where it's offered, with the clinicians who do it there. */
	studios: { id: string; slug: string; staffIds: string[] }[];
	/** The online location, when offered on video. */
	online: { id: string; slug: string; staffIds: string[] } | null;
	allowCustomerCancel: boolean;
	cancelGap: number;
}

export interface TreatmentGroup {
	slug: string;
	title: string;
	department: string | null;
	kind: DepartmentKind | null;
	image: string | null;
	description: string | null;
	fromPrice: number;
	variants: Treatment[];
}

export interface Department {
	slug: string;
	kind: DepartmentKind | null;
	title: string;
	short: string;
	index: string;
	tagline: string;
	intro: string;
	description: string | null;
	/** Local photo path (`/images/...`). */
	image: string;
	treats: string[];
	faqs: { q: string; a: string }[];
	groups: TreatmentGroup[];
	/** Lowest paid price (free consultations aside). */
	fromPrice: number | null;
	/** Has a free consultation or visit. */
	freeConsult: boolean;
}

/** `/images/<rel>` for a siteConfig image path. */
export function imagePath(rel: string): string {
	return rel.startsWith('/') || rel.startsWith('http') ? rel : `/images/${rel}`;
}

export function toTreatments(products: ProductListItemResponse[], departments: DepartmentIndex): Treatment[] {
	const out: Treatment[] = [];
	for (const p of products) {
		const variants = p.variants ?? [];
		const multi = variants.length > 1;
		for (const v of variants) {
			const productStaff = new Set((v.staffMembers ?? []).map((s) => s.id));
			const atLocation = (l: NonNullable<typeof v.locations>[number]) => {
				const here = (l.staffMembers ?? []).map((s) => s.id).filter((id) => productStaff.has(id));
				return { id: l.id, slug: l.slug, staffIds: here.length > 0 ? here : [...productStaff] };
			};
			const locations = v.locations ?? [];
			const onlineLoc = locations.find((l) => l.type === 'online');
			const department = departments[v.slug] ?? v.collections?.[0]?.slug ?? null;
			const option = multi && v.variantTitle && v.variantTitle !== 'Default Title' ? v.variantTitle : null;
			out.push({
				id: v.id,
				slug: v.slug,
				groupSlug: p.slug,
				groupTitle: v.title || p.title,
				option,
				title: option ?? (v.title || p.title),
				description: v.description || null,
				note: siteConfig.serviceNotes[v.slug] ?? null,
				price: v.price ?? 0,
				duration: v.duration ?? 0,
				image: v.image?.url ?? v.images?.[0]?.url ?? p.image?.url ?? null,
				department,
				kind: (department && siteConfig.departments[department]?.kind) || null,
				video: !!onlineLoc,
				studios: locations.filter((l) => l.type !== 'online').map(atLocation),
				online: onlineLoc ? atLocation(onlineLoc) : null,
				allowCustomerCancel: v.allowCustomerCancel !== false,
				cancelGap: v.cancelGap ?? 0,
			});
		}
	}
	return out;
}

export function toGroups(treatments: Treatment[]): TreatmentGroup[] {
	const map = new Map<string, TreatmentGroup>();
	for (const t of treatments) {
		let g = map.get(t.groupSlug);
		if (!g) {
			g = { slug: t.groupSlug, title: t.groupTitle, department: t.department, kind: t.kind, image: t.image, description: t.description, fromPrice: t.price, variants: [] };
			map.set(t.groupSlug, g);
		}
		g.variants.push(t);
		g.fromPrice = Math.min(g.fromPrice, t.price);
	}
	for (const g of map.values()) g.variants.sort((a, b) => compareOptions({ label: a.option, price: a.price, duration: a.duration }, { label: b.option, price: b.price, duration: b.duration }));
	return [...map.values()];
}

/**
 * Departments in the curated `siteConfig.departments` order, then any extra
 * collections the store adds. A collection without editorial content still
 * renders from the API alone.
 */
export function toDepartments(collections: ProductCollectionResponse[], treatments: Treatment[]): Department[] {
	const bySlug = new Map(treatments.map((t) => [t.slug, t]));
	const curated = Object.keys(siteConfig.departments);
	const sorted = [...collections]
		.filter((c) => c.isVisible !== false)
		.sort((a, b) => {
			const ai = curated.indexOf(a.slug);
			const bi = curated.indexOf(b.slug);
			return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
		});
	return sorted.map((c, i) => {
		const content = siteConfig.departments[c.slug];
		const list = (c.products ?? []).map((p) => bySlug.get(p.slug)).filter((t): t is Treatment => !!t);
		const groups = toGroups(list);
		const paid = list.map((t) => t.price).filter((p) => p > 0);
		return {
			slug: c.slug,
			kind: content?.kind ?? null,
			title: c.title,
			short: content?.short ?? c.title,
			index: content?.index ?? String(i + 1).padStart(2, '0'),
			tagline: content?.tagline ?? c.description ?? '',
			intro: content?.intro ?? c.description ?? '',
			description: c.description ?? null,
			image: imagePath(content?.image ?? siteConfig.studioImages[i % siteConfig.studioImages.length]!),
			treats: content?.treats ?? [],
			faqs: content?.faqs ?? [],
			groups,
			fromPrice: paid.length ? Math.min(...paid) : list.length ? 0 : null,
			freeConsult: list.some((t) => t.price === 0),
		};
	});
}

export interface BookLink {
	service?: string | null;
	for?: 'self' | 'child' | 'other' | null;
	dept?: string | null;
	clinic?: string | null;
	staff?: string | null;
	comfort?: 'relaxed' | 'nervous' | 'anxious' | null;
	nickname?: string | null;
	concern?: string | null;
}

/** The composer deep link (`/book?service=…`), see the README for every param. */
export function bookHref(opts: BookLink = {}): string {
	const params = new URLSearchParams();
	for (const [k, v] of Object.entries(opts)) if (v) params.set(k, v);
	const qs = params.toString();
	return `/book${qs ? `?${qs}` : ''}`;
}

/** "30 min", "1 hr", "1 hr 30". */
export function visitLength(seconds: number): string {
	const mins = Math.round(seconds / 60);
	if (mins < 60) return `${mins} min`;
	const h = Math.floor(mins / 60);
	const m = mins % 60;
	return m ? `${h} hr ${m}` : `${h} hr`;
}

/** "£95", "£42.50", "Free". */
export function formatFee(amount: number, currency = 'GBP'): string {
	if (amount === 0) return 'Free';
	const whole = Number.isInteger(amount);
	return new Intl.NumberFormat('en-GB', { style: 'currency', currency, minimumFractionDigits: whole ? 0 : 2, maximumFractionDigits: 2 }).format(amount);
}
