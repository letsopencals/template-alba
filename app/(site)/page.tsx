import Link from 'next/link';
import { getCatalog } from '@/lib/catalog-server';
import { getStudios } from '@/lib/studios-server';
import { siteConfig } from '@/lib/site-config';
import { Hero } from '@/components/home/hero';
import { LightPlate } from '@/components/home/light-plate';
import { TodayBoard } from '@/components/home/today-board';
import { TreatmentIndex } from '@/components/home/treatment-index';
import { SmileTeaser } from '@/components/home/smile-teaser';
import { PatientNotes } from '@/components/home/patient-notes';
import { KidsTeaser } from '@/components/home/kids-teaser';
import { LineBoard } from '@/components/clinics/line-board';
import { ContactSheet } from '@/components/dentists/contact-sheet';
import { PlateHead } from '@/components/ui/plate-head';
import { Faq } from '@/components/ui/faq';

/** Catalogue, studios and team re-read from the store every 5 minutes (ISR). */
export const revalidate = 300;

/*
 * Home: a sequence of plates. Hero (porcelain tooth) → first light (film) →
 * Today at Alba (live board) → the treatment index → Smile Check → the Alba
 * Line → the team → patient notes → Alba Kids → questions. The colophon
 * closes the page (site layout).
 */
export default async function HomePage() {
	const [catalog, { studios, video, clinicians }] = await Promise.all([getCatalog(), getStudios()]);
	const rows = catalog.departments
		.filter((d) => d.groups.length)
		.map((d) => ({
			slug: d.slug,
			index: d.index,
			title: d.title,
			tagline: d.tagline,
			image: d.image,
			fromPrice: d.fromPrice,
			freeConsult: d.freeConsult,
			count: d.groups.reduce((n, g) => n + g.variants.length, 0),
		}));
	const featured = siteConfig.featuredClinicians.map((s) => clinicians.find((c) => c.slug === s)).filter((c): c is NonNullable<typeof c> => !!c);
	const team = featured.length >= 4 ? featured : clinicians.slice(0, 8);

	return (
		<>
			<Hero studios={studios} clinicians={clinicians.length} treatments={catalog.treatments.length} />
			<LightPlate />
			<TodayBoard studios={studios} />

			<section className="frame py-20 lg:py-28" aria-labelledby="treatments-title">
				<PlateHead
					id="treatments-title"
					index="04"
					title={
						<>
							Every treatment, <em>every price.</em>
						</>
					}
					anno={<>{catalog.treatments.length} treatments<br />written down before you book</>}
				/>
				<TreatmentIndex rows={rows} currency={catalog.currency} />
				<Link href="/treatments" className="link-hair mt-8 inline-block text-[15px]">
					The full price list →
				</Link>
			</section>

			<section className="plate frame py-20 lg:py-28">
				<SmileTeaser />
			</section>

			<section className="plate frame py-20 lg:py-28" aria-labelledby="line-title">
				<PlateHead
					id="line-title"
					index="06"
					title={
						<>
							{studios.length} studios, <em>one line.</em>
						</>
					}
					anno={<>West to east<br />● kids room</>}
				/>
				<LineBoard studios={studios} video={video} className="my-6 md:my-[120px]" />
				<Link href="/clinics" className="link-hair inline-block text-[15px]">
					Studios, hours and directions →
				</Link>
			</section>

			<section className="plate frame py-20 lg:py-28" aria-labelledby="team-title">
				<PlateHead
					id="team-title"
					index="07"
					title={
						<>
							The people in <em>the chair.</em>
						</>
					}
					anno={<>{clinicians.length} clinicians<br />GDC-registered</>}
				/>
				<ContactSheet clinicians={team} />
				<Link href="/dentists" className="link-hair mt-8 inline-block text-[15px]">
					Meet all {clinicians.length} →
				</Link>
			</section>

			<section className="plate frame py-20 lg:py-28" aria-labelledby="notes-title">
				<PlateHead id="notes-title" index="08" title={<>Patient <em>notes.</em></>} anno="In their words" />
				<PatientNotes />
			</section>

			<section className="plate frame py-20 lg:py-28">
				<KidsTeaser studios={studios.filter((s) => s.kids).map((s) => s.short)} />
			</section>

			<section className="plate frame pb-24 pt-20 lg:pb-32 lg:pt-28" aria-labelledby="faq-title">
				<PlateHead id="faq-title" index="09" title={<>Before you <em>ask.</em></>} />
				<Faq items={siteConfig.faqs} />
			</section>
		</>
	);
}
