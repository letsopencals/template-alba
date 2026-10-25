import type { Metadata } from 'next';
import { getStudios } from '@/lib/studios-server';
import { getCatalog } from '@/lib/catalog-server';
import { PlateHead } from '@/components/ui/plate-head';
import { TeamFinder } from '@/components/dentists/team-finder';

/** Catalogue, studios and team re-read from the store every 5 minutes (ISR). */
export const revalidate = 300;

export const metadata: Metadata = {
	title: 'Our dentists',
	description: 'Meet the Alba Dental team: dentists, hygienists, paediatric dentists, orthodontists and specialists across five London studios. Filter by studio, speciality and language.',
};

export default async function DentistsPage() {
	const [{ studios, clinicians }, catalog] = await Promise.all([getStudios(), getCatalog()]);
	const departments = catalog.departments.filter((d) => clinicians.some((c) => c.departments.includes(d.slug))).map((d) => ({ slug: d.slug, short: d.short }));
	return (
		<section className="frame pb-24 pt-10 lg:pt-16">
			<PlateHead
				as="h1"
				index="04"
				size="xl"
				title={
					<>
						The people in <em>the chair.</em>
					</>
				}
				anno={<>{clinicians.length} clinicians<br />GDC-registered</>}
				lede="Dentists, hygienists and specialists, each at one or two studios. Book anyone by name, or let us pick whoever is free first."
			/>
			<div className="mt-6">
				<TeamFinder clinicians={clinicians} studios={studios.map((s) => ({ id: s.id, short: s.short }))} departments={departments} />
			</div>
		</section>
	);
}
