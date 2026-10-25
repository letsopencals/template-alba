import { clinicianDisplayName, siteConfig, type ClinicianProfile } from '@/lib/site-config';

/**
 * Public-safe clinician card, shared by RSC pages (`lib/server-data.ts`) and the
 * `/api/clinicians` route. Names, portrait, what and where they practise — no
 * emails, user ids or schedules. Client-safe (no SDK calls here).
 */
export interface PublicClinician {
	id: string;
	slug: string;
	/** Display name with honorific, e.g. "Dr Helena Whitmore". */
	name: string;
	firstName: string;
	lastName: string;
	imageUrl: string | null;
	/** Curated or department-derived title, e.g. "Paediatric Dentist". */
	qualifications: string | null;
	title: string;
	bio: string | null;
	languages: string[];
	focus: string[];
	/** Department (collection) slugs they deliver services in. */
	departments: string[];
	/** Variant slugs they can be booked for. */
	services: string[];
	/** Physical clinics they work at. */
	clinics: { id: string; slug: string; title: string }[];
	/** Works at the online location → offers video visits. */
	video: boolean;
	/** Has a curated profile (featured ordering, richer card). */
	curated: boolean;
}

export interface ClinicianSource {
	id: string;
	slug: string;
	firstName?: string | null;
	lastName?: string | null;
	image?: { url?: string | null } | null;
	products?: { slug: string }[] | null;
	locations?: { id: string; slug: string; title?: string | null; type?: string | null }[] | null;
}

/** variant slug → department slug, from the collection list. */
export type DepartmentIndex = Record<string, string>;

export function toPublicClinician(s: ClinicianSource, departmentsBySlug: DepartmentIndex): PublicClinician {
	const profile: ClinicianProfile | undefined = siteConfig.clinicians[s.slug];
	const services = [...new Set((s.products ?? []).map((p) => p.slug))];
	// Their main department first: shared visits (e.g. specialist consults under
	// General medicine) shouldn't label a dermatologist as a GP.
	const counts = new Map<string, number>();
	for (const v of services) {
		const d = departmentsBySlug[v];
		if (d) counts.set(d, (counts.get(d) ?? 0) + 1);
	}
	const departments = [...counts.keys()].sort((a, b) => counts.get(b)! - counts.get(a)!);
	const locations = s.locations ?? [];
	const firstName = s.firstName ?? '';
	const lastName = s.lastName ?? '';
	return {
		id: s.id,
		slug: s.slug,
		name: clinicianDisplayName(s.slug, firstName, lastName),
		firstName,
		lastName,
		imageUrl: s.image?.url ?? null,
		title: profile?.title ?? (departments[0] && siteConfig.clinicianRoles[departments[0]]) ?? 'Clinician',
		bio: profile?.bio ?? null,
		qualifications: profile?.qualifications ?? null,
		languages: profile?.languages ?? [],
		focus: profile?.focus ?? [],
		departments,
		services,
		clinics: locations.filter((l) => l.type !== 'online').map((l) => ({ id: l.id, slug: l.slug, title: l.title ?? '' })),
		video: locations.some((l) => l.type === 'online'),
		curated: !!profile,
	};
}

/** Curated clinicians first (in config order), then alphabetical. */
export function sortClinicians(list: PublicClinician[]): PublicClinician[] {
	const order = Object.keys(siteConfig.clinicians);
	return [...list].sort((a, b) => {
		const ai = order.indexOf(a.slug);
		const bi = order.indexOf(b.slug);
		if (ai !== -1 || bi !== -1) return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
		return a.lastName.localeCompare(b.lastName);
	});
}

/** "Dr Helena Whitmore" → "Dr Whitmore"; "Grace Liu" → "Grace". For warm short references. */
export function shortName(c: Pick<PublicClinician, 'name' | 'firstName' | 'lastName'>): string {
	return c.name.startsWith('Dr ') ? `Dr ${c.lastName}` : c.firstName;
}
