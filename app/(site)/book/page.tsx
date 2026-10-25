import type { Metadata } from 'next';
import { getCatalog } from '@/lib/catalog-server';
import { getCheckoutQuestions, getClinicians, getClinics, getStoreSettings } from '@/lib/server-data';
import { siteConfig } from '@/lib/site-config';
import { Planner } from '@/components/book/planner';
import type { BookInitial } from '@/hooks/use-dental-booking';

export const metadata: Metadata = {
	title: 'Book a visit',
	description: 'Choose a treatment, a studio, your dentist and a time. Real availability at five London studios and on video.',
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? null;

/**
 * /book?service=&for=&dept=&clinic=&staff=&comfort=&nickname=&concern=
 * RSC: the catalogue, clinicians, studios and the deep-linked treatment's
 * questions are read on the server; availability loads per studio in the
 * browser from one cached request each.
 */
export default async function BookPage({ searchParams }: { searchParams: SearchParams }) {
	const sp = await searchParams;
	const [catalog, clinicians, clinics, settings] = await Promise.all([getCatalog(), getClinicians(), getClinics(), getStoreSettings()]);

	const forParam = one(sp.for);
	const comfort = one(sp.comfort);
	const initial: BookInitial = {
		service: one(sp.service),
		for: forParam === 'self' || forParam === 'child' || forParam === 'other' ? forParam : null,
		dept: one(sp.dept),
		clinic: one(sp.clinic) ?? one(sp.practice),
		staff: one(sp.staff),
		comfort: comfort === 'relaxed' || comfort === 'nervous' || comfort === 'anxious' ? comfort : null,
		nickname: one(sp.nickname)?.slice(0, 60) ?? null,
		concern: one(sp.concern)?.slice(0, 500) ?? null,
	};

	const deep = initial.service ? (catalog.treatments.find((t) => t.slug === initial.service) ?? catalog.treatments.find((t) => t.groupSlug === initial.service)) : null;
	const questions = deep ? await getCheckoutQuestions(deep.id) : [];

	const lite = (c: (typeof clinics)[number]) => ({ id: c.id, slug: c.slug, title: c.title, addressLines: c.addressLines, latitude: c.latitude, longitude: c.longitude });
	const online = clinics.find((c) => c.type === 'online');

	return (
		<Planner
			treatments={catalog.treatments}
			departments={catalog.departments}
			clinicians={clinicians}
			studios={clinics.filter((c) => c.type === 'physical').map(lite)}
			online={online ? lite(online) : null}
			currency={catalog.currency}
			timeZone={settings?.settings?.timezone || siteConfig.timezone}
			initial={initial}
			initialQuestions={deep ? { slug: deep.slug, questions } : null}
		/>
	);
}
