import { cache } from 'react';
import { getClinics, getCollection, getProducts, getStoreSettings } from '@/lib/server-data';
import {
	DEFAULT_ROOM,
	KIDS_COLLECTION,
	KIDS_ROOMS,
	toneAt,
	buildingFor,
	heroFor,
	type Building,
	type BuildingTone,
} from '@/lib/kids/kids-config';

/*
 * Server-only: Tooth Town's data, derived from the store. Kids services are the
 * product groups with a variant in the children's-dentistry collection; kids
 * branches are the physical locations those variants are offered at; Tooth
 * Heroes are the clinicians on those variants. Only public-safe fields leave
 * this module. Never import from a 'use client' file.
 */

export interface KidsOption {
	slug: string;
	/** Variant title ("Ages 3–6") or '' for single-variant groups. */
	label: string;
	price: number;
	/** Minutes. */
	minutes: number;
}

export interface KidsService extends Building {
	key: string;
	title: string;
	description: string | null;
	options: KidsOption[];
	fromPrice: number;
	minutes: number;
	branches: { slug: string; title: string }[];
}

export interface KidsBranch {
	slug: string;
	title: string;
	addressLines: string[];
	nickname: string;
	features: string[];
	tone: BuildingTone;
	serviceCount: number;
}

export interface KidsHero {
	slug: string;
	name: string;
	imageUrl: string | null;
	alias: string;
	role: string;
	superpower: string;
	funFact: string;
	branches: string[];
}

export interface KidsWorld {
	services: KidsService[];
	branches: KidsBranch[];
	heroes: KidsHero[];
	currency: string;
}

export const getKidsWorld = cache(async (): Promise<KidsWorld> => {
	const [products, collection, clinics, settings] = await Promise.all([
		getProducts(),
		getCollection(KIDS_COLLECTION),
		getClinics(),
		getStoreSettings(),
	]);

	const order = new Map((collection?.products ?? []).map((p, i) => [p.slug, i]));
	const inKids = (v: { slug: string; collections?: { slug: string }[] | null }) =>
		order.has(v.slug) || (v.collections ?? []).some((c) => c.slug === KIDS_COLLECTION);

	const services: KidsService[] = [];
	const branchMap = new Map<string, { slug: string; title: string; count: number }>();
	const heroMap = new Map<string, { s: { slug: string; firstName: string; lastName: string; image?: { url?: string | null } | null }; branches: Set<string> }>();

	for (const group of products) {
		const variants = (group.variants ?? []).filter(inKids);
		const first = variants[0];
		if (!first) continue;
		const title = first.title || group.title;
		const building = buildingFor(
			variants.map((v) => v.slug),
			title,
		);
		const branches = new Map<string, string>();
		for (const v of variants) {
			for (const l of v.locations ?? []) if (l.type === 'physical') branches.set(l.slug, l.title ?? l.slug);
			for (const s of v.staffMembers ?? []) {
				const entry = heroMap.get(s.slug) ?? { s, branches: new Set<string>() };
				for (const l of s.locations ?? []) if (l.type === 'physical') entry.branches.add(l.title ?? l.slug);
				heroMap.set(s.slug, entry);
			}
		}
		for (const [slug, t] of branches) {
			const b = branchMap.get(slug) ?? { slug, title: t, count: 0 };
			b.count += 1;
			branchMap.set(slug, b);
		}
		const options = variants
			.map((v) => ({ slug: v.slug, label: v.variantTitle ?? '', price: v.price ?? 0, minutes: Math.round((v.duration ?? 0) / 60) }))
			.sort((a, b) => (order.get(a.slug) ?? 99) - (order.get(b.slug) ?? 99));
		services.push({
			...building,
			key: group.id,
			title,
			description: first.description ?? null,
			options,
			fromPrice: Math.min(...options.map((o) => o.price)),
			minutes: Math.min(...options.map((o) => o.minutes)),
			branches: [...branches].map(([slug, t]) => ({ slug, title: t })),
		});
	}
	services.sort((a, b) => (order.get(a.options[0]?.slug ?? '') ?? 99) - (order.get(b.options[0]?.slug ?? '') ?? 99));

	const branches: KidsBranch[] = [...branchMap.values()].map((b, i) => {
		const clinic = clinics.find((c) => c.slug === b.slug);
		const room = KIDS_ROOMS[b.slug] ?? { ...DEFAULT_ROOM, tone: toneAt(i) };
		return {
			slug: b.slug,
			title: clinic?.title ?? b.title,
			addressLines: clinic?.addressLines ?? [],
			nickname: room.nickname,
			features: [...room.features],
			tone: room.tone,
			serviceCount: b.count,
		};
	});

	const heroes: KidsHero[] = [...heroMap.values()].map(({ s, branches: bs }, i) => {
		const profile = heroFor(s.slug, i);
		const doctor = /dentist|orthodontist/i.test(profile.role);
		const name = [s.firstName, s.lastName].filter(Boolean).join(' ');
		return {
			slug: s.slug,
			name: doctor ? `Dr ${name}` : name,
			imageUrl: s.image?.url ?? null,
			...profile,
			branches: [...bs],
		};
	});
	// Paediatric dentists first, then hygienists, then specialists.
	const rank = (h: KidsHero) => (/paediatric/i.test(h.role) ? 0 : /hygienist/i.test(h.role) ? 1 : 2);
	heroes.sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name));

	return { services, branches, heroes, currency: settings?.currency ?? 'GBP' };
});
