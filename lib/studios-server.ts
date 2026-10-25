import { cache } from 'react';
import { getClinicians, getClinics, type PublicClinic } from '@/lib/server-data';
import { getCatalog } from '@/lib/catalog-server';
import { imagePath } from '@/lib/catalog';
import { siteConfig, studioMeta } from '@/lib/site-config';
import type { PublicClinician } from '@/lib/clinicians';

/**
 * A studio as the pages need it: the API location + site-config photography and
 * copy + what is bookable there (departments, treatments, clinicians), all
 * public-safe. Server-only; pass the result to client components as props.
 */
export interface Studio {
	id: string;
	slug: string;
	title: string;
	/** "Marylebone" (title without the brand). */
	short: string;
	addressLines: string[];
	lat: number | null;
	lng: number | null;
	area: string;
	tagline: string;
	note: string;
	image: string;
	image2: string;
	hours: string;
	/** Offers children's dentistry (from the catalogue, not config). */
	kids: boolean;
	/** Department slugs with at least one treatment here. */
	departments: string[];
	/** Variant ids bookable here. */
	treatmentIds: string[];
	clinicianIds: string[];
	/** A good "next check-up" probe: the general check-up variant offered here, if any. */
	probe: { checkup: string | null; hygiene: string | null };
}

export interface VideoStudio {
	id: string;
	slug: string;
	title: string;
	treatmentIds: string[];
	clinicianIds: string[];
}

export const getStudios = cache(async (): Promise<{ studios: Studio[]; video: VideoStudio | null; clinicians: PublicClinician[] }> => {
	const [clinics, catalog, clinicians] = await Promise.all([getClinics(), getCatalog(), getClinicians()]);
	const physical = clinics.filter((c) => c.type === 'physical');
	const online = clinics.find((c) => c.type === 'online') ?? null;
	const kidsDept = siteConfig.collections.kids;

	const studios = physical.map((c: PublicClinic, i): Studio => {
		const meta = studioMeta(c.slug, i);
		const here = catalog.treatments.filter((t) => t.studios.some((s) => s.id === c.id));
		const staff = new Set(here.flatMap((t) => t.studios.find((s) => s.id === c.id)?.staffIds ?? []));
		const find = (slugs: string[]) => slugs.map((slug) => here.find((t) => t.slug === slug)?.id).find(Boolean) ?? null;
		return {
			id: c.id,
			slug: c.slug,
			title: c.title,
			short: c.title.replace(/^Alba\s+/, ''),
			addressLines: c.addressLines,
			lat: c.latitude,
			lng: c.longitude,
			area: meta.area,
			tagline: meta.tagline,
			note: meta.note,
			image: imagePath(meta.image),
			image2: imagePath(meta.image2),
			hours: siteConfig.studioHours[c.slug] ?? siteConfig.contact.hours,
			kids: here.some((t) => t.department === kidsDept),
			departments: [...new Set(here.map((t) => t.department).filter((d): d is string => !!d))],
			treatmentIds: here.map((t) => t.id),
			clinicianIds: clinicians.filter((p) => p.clinics.some((k) => k.id === c.id) || staff.has(p.id)).map((p) => p.id),
			probe: { checkup: find(['check-up', 'new-patient-exam']), hygiene: find(['hygiene-clean', 'deep-clean', 'airflow-gbt']) },
		};
	});

	const video: VideoStudio | null = online
		? {
				id: online.id,
				slug: online.slug,
				title: online.title,
				treatmentIds: catalog.treatments.filter((t) => t.online?.id === online.id).map((t) => t.id),
				clinicianIds: clinicians.filter((p) => p.video).map((p) => p.id),
			}
		: null;

	return { studios, video, clinicians };
});
