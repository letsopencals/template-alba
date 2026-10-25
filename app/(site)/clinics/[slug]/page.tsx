import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getStudios } from '@/lib/studios-server';
import { getCatalog } from '@/lib/catalog-server';
import { bookHref, toGroups } from '@/lib/catalog';
import { siteConfig } from '@/lib/site-config';
import { PlateHead } from '@/components/ui/plate-head';
import { buttonClasses, ButtonInner } from '@/components/ui/button';
import { Icon, KindGlyph } from '@/components/ui/icon';
import { StudioStatus } from '@/components/clinics/studio-status';
import { WeekHours } from '@/components/clinics/week-hours';
import { StudioBoard, type BoardRow } from '@/components/clinics/studio-board';
import { LineBoard } from '@/components/clinics/line-board';
import { PriceIndex } from '@/components/treatments/price-index';
import { ContactSheet } from '@/components/dentists/contact-sheet';

/** Catalogue, studios and team re-read from the store every 5 minutes (ISR). */
export const revalidate = 300;

type Params = { slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
	const { slug } = await params;
	const { studios } = await getStudios();
	const s = studios.find((x) => x.slug === slug);
	if (!s) return { title: 'Studio' };
	return { title: `${s.short} studio`, description: `${s.title}: ${s.tagline}. ${s.addressLines.join(', ')}. Opening hours, the team, prices and the next free time.` };
}

/** Headline rows for the studio's departure board, in this order, if offered here. */
const BOARD: { label: string; slugs: string[] }[] = [
	{ label: 'Check-up', slugs: ['check-up'] },
	{ label: 'Hygiene clean', slugs: ['hygiene-clean', 'airflow-gbt'] },
	{ label: 'Emergency', slugs: ['emergency-appointment'] },
	{ label: 'Kids check-up', slugs: ['kids-check-up-junior', 'kids-check-up-little'] },
	{ label: 'New patient exam', slugs: ['new-patient-exam'] },
];

export default async function StudioPage({ params }: { params: Promise<Params> }) {
	const { slug } = await params;
	const [{ studios, video, clinicians }, catalog] = await Promise.all([getStudios(), getCatalog()]);
	const studio = studios.find((s) => s.slug === slug);
	if (!studio) notFound();
	const i = studios.indexOf(studio);

	const here = catalog.treatments.filter((t) => studio.treatmentIds.includes(t.id));
	const team = clinicians.filter((c) => studio.clinicianIds.includes(c.id));
	const byDept = catalog.departments
		.map((d) => ({ d, groups: toGroups(here.filter((t) => t.department === d.slug)) }))
		.filter((x) => x.groups.length > 0);
	const board: BoardRow[] = BOARD.flatMap((b) => {
		const t = b.slugs.map((s) => here.find((x) => x.slug === s)).find(Boolean);
		return t ? [{ label: b.label, variantId: t.id, variantSlug: t.slug }] : [];
	}).slice(0, 4);
	const map = studio.lat != null && studio.lng != null ? `https://www.google.com/maps/search/?api=1&query=${studio.lat},${studio.lng}` : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(studio.addressLines.join(', '))}`;

	return (
		<>
			{/* Hero: the name set huge over a photo that opens like an aperture */}
			<section className="relative">
				<div className="frame pt-8 lg:pt-12">
					<nav aria-label="Breadcrumb" className="t-anno flex gap-2">
						<Link href="/clinics" className="hover:!text-ink">
							03 Studios
						</Link>
						<span>/</span>
						<span className="!text-ink-2">S·{String(i + 1).padStart(2, '0')}</span>
					</nav>
					<div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
						<div>
							<p className="t-anno">{studio.area}</p>
							<h1 className="t-mega mt-3">{studio.short}</h1>
						</div>
						<div className="grid gap-4 lg:justify-items-end lg:pb-4">
							<StudioStatus slug={studio.slug} className="text-ink-2" />
							<div className="flex flex-wrap gap-3">
								<Link href={bookHref({ clinic: studio.slug })} className={buttonClasses({ variant: 'solid', size: 'lg' })}>
									<ButtonInner size="lg">Book at {studio.short}</ButtonInner>
								</Link>
								<a href={map} target="_blank" rel="noreferrer" className={buttonClasses({ variant: 'line', size: 'lg' })}>
									<ButtonInner variant="line" size="lg" cell={<Icon name="arrow-up-right" className="h-3.5 w-3.5" />}>
										Directions
									</ButtonInner>
								</a>
							</div>
						</div>
					</div>
				</div>
				<div className="frame mt-8">
					<div className="image-well aperture relative aspect-[16/10] overflow-hidden rounded-[6px] sm:aspect-[21/9]">
						<Image src={studio.image} alt={`Inside Alba ${studio.short}`} fill priority sizes="100vw" className="object-cover" />
						<div aria-hidden className="lamp absolute inset-0 mix-blend-screen" />
						<p className="t-anno absolute bottom-3 left-3 bg-enamel/85 px-2 py-1 !text-ink-2">{studio.tagline}</p>
					</div>
				</div>
			</section>

			{/* Facts: address, getting there, hours, live board */}
			<section className="frame mt-14 grid gap-10 lg:mt-20 lg:grid-cols-[120px_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-10">
				<span className="t-num hidden text-[12px] text-brass lg:block">01</span>
				<div className="grid content-start gap-6">
					<div>
						<p className="t-anno">Address</p>
						<address className="mt-2 not-italic text-[17px] leading-snug">
							{studio.addressLines.map((l) => (
								<span key={l} className="block">
									{l}
								</span>
							))}
						</address>
					</div>
					<div>
						<p className="t-anno">Getting there</p>
						<p className="mt-2 flex gap-2 text-[15px] text-ink-2">
							<Icon name="train" className="mt-1 h-4 w-4 text-ink-3" />
							{studio.note}
						</p>
					</div>
					<div>
						<p className="t-anno">Patient line</p>
						<a href={siteConfig.contact.phoneHref} className="link-hair mt-2 inline-block text-[15px]">
							{siteConfig.contact.phone}
						</a>
					</div>
				</div>
				<div>
					<p className="t-anno mb-2">Opening hours</p>
					<WeekHours hours={studio.hours} />
				</div>
				<div className="plate-dark rounded-[6px] p-5 sm:p-6">
					<StudioBoard rows={board} locationId={studio.id} clinic={studio.slug} />
					<p className="t-anno mt-4">Times are live from our diary and held for you while you book.</p>
				</div>
			</section>

			{/* Kids room callout */}
			{studio.kids ? (
				<section className="frame mt-16">
					<Link href="/kids" className="group grid items-center gap-6 rounded-[6px] border border-dashed border-brass/60 bg-enamel/60 p-6 sm:grid-cols-[auto_1fr_auto] sm:p-8">
						<KindGlyph kind="kids" className="h-14 w-14 text-brass" />
						<div>
							<p className="t-anno !text-brass">Alba Kids · this studio has a kids room</p>
							<p className="t-md mt-2">
								Little patients get their own room, their own team and <em>Tooth Town</em>.
							</p>
						</div>
						<span className="t-anno !text-ink group-hover:!text-lagoon">Visit Tooth Town →</span>
					</Link>
				</section>
			) : null}

			{/* Treatments and prices here */}
			<section className="frame mt-20 lg:mt-28">
				<PlateHead index="02" title={<>Treatments at <em>{studio.short}</em></>} anno={`${here.length} treatments · prices in writing`} />
				<div className="grid gap-x-12 gap-y-12 lg:grid-cols-2">
					{byDept.map(({ d, groups }) => (
						<div key={d.slug}>
							<div className="mb-2 flex items-center gap-3">
								<KindGlyph kind={d.kind} className="h-7 w-7 text-lagoon-3" />
								<Link href={`/treatments/${d.slug}`} className="t-anno !text-ink hover:!text-lagoon">
									{d.index} · {d.short}
								</Link>
							</div>
							<PriceIndex groups={groups} currency={catalog.currency} clinic={studio.slug} dense />
						</div>
					))}
				</div>
			</section>

			{/* Team */}
			{team.length ? (
				<section className="frame mt-20 lg:mt-28">
					<PlateHead index="03" title={<>Who&rsquo;s in the chair <em>here</em></>} anno={`${team.length} clinicians`} />
					<ContactSheet clinicians={team} cols="wide" />
				</section>
			) : null}

			{/* The line, with this station lit */}
			<section className="frame mb-24 mt-20 lg:mt-28">
				<PlateHead index="04" title="Other stops on the Alba Line" size="md" />
				<LineBoard studios={studios} video={video} selected={studio.slug} className="md:my-[110px]" />
			</section>
		</>
	);
}
