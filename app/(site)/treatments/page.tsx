import type { Metadata } from 'next';
import Link from 'next/link';
import { getCatalog } from '@/lib/catalog-server';
import { bookHref } from '@/lib/catalog';
import { PlateHead } from '@/components/ui/plate-head';
import { KindGlyph } from '@/components/ui/icon';
import { PriceIndex } from '@/components/treatments/price-index';
import { LightLink } from '@/components/light/view-transitions';
import { vtName } from '@/components/light/vt-name';

/** Catalogue, studios and team re-read from the store every 5 minutes (ISR). */
export const revalidate = 300;

export const metadata: Metadata = {
	title: 'Treatments & prices',
	description: 'Every Alba Dental treatment with its length and price: check-ups, hygiene, whitening, bonding, clear aligners, implants, emergencies, children’s dentistry and video consultations.',
};

export default async function TreatmentsPage() {
	const { departments, currency, treatments } = await getCatalog();
	const shown = departments.filter((d) => d.groups.length);
	return (
		<>
			<section className="frame pt-10 lg:pt-16">
				<PlateHead
					as="h1"
					index="02"
					size="xl"
					title={
						<>
							Treatments, <em>in writing.</em>
						</>
					}
					anno={<>{treatments.length} treatments<br />one price per visit, no extras</>}
					lede="What you see is what you pay. Every visit below shows its length and its price, and books in a minute at any studio that offers it."
				/>
			</section>

			<div className="frame grid gap-12 pb-24 pt-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-16">
				{/* Department index: sticky on desktop, a scroll row on phones */}
				<nav aria-label="Departments" className="lg:sticky lg:top-8 lg:self-start">
					<ol className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 lg:mx-0 lg:grid lg:gap-0 lg:overflow-visible lg:border-t lg:border-line lg:px-0">
						{shown.map((d) => (
							<li key={d.slug} className="shrink-0 lg:border-b lg:border-line">
								<a href={`#${d.slug}`} className="flex items-center gap-3 rounded-[4px] border border-line-2 px-3 py-2 text-[14px] text-ink-2 hover:text-ink lg:rounded-none lg:border-0 lg:px-0 lg:py-2.5">
									<span className="t-num text-[10.5px] text-brass">{d.index}</span>
									{d.short}
								</a>
							</li>
						))}
					</ol>
				</nav>

				<div className="grid gap-20">
					{shown.map((d) => (
						<section key={d.slug} id={d.slug} className="scroll-mt-20" aria-labelledby={`${d.slug}-title`}>
							<div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
								<div className="flex items-start gap-4">
									<KindGlyph kind={d.kind} className="mt-1 h-10 w-10 text-lagoon-3" />
									<div>
										<p className="t-num text-[12px] text-brass" style={vtName('dept-n', d.slug)}>
											{d.index}
										</p>
										<h2 id={`${d.slug}-title`} className="t-lg mt-1" style={vtName('dept-t', d.slug)}>
											{d.title}
										</h2>
										<p className="mt-2 text-[15px] text-ink-2">{d.tagline}</p>
									</div>
								</div>
								<div className="flex gap-4 sm:justify-end">
									<LightLink href={`/treatments/${d.slug}`} className="link-hair text-[14px]">
										About {d.short.toLowerCase()}
									</LightLink>
									<Link href={bookHref({ dept: d.slug })} className="link-hair text-[14px] text-lagoon">
										Book →
									</Link>
								</div>
							</div>
							<PriceIndex groups={d.groups} currency={currency} className="mt-6" />
						</section>
					))}
				</div>
			</div>
		</>
	);
}
