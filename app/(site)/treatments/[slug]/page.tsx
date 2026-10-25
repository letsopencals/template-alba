import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCatalog } from '@/lib/catalog-server';
import { getStudios } from '@/lib/studios-server';
import { bookHref } from '@/lib/catalog';
import { prepFor, siteConfig } from '@/lib/site-config';
import { PlateHead } from '@/components/ui/plate-head';
import { Faq } from '@/components/ui/faq';
import { KindGlyph } from '@/components/ui/icon';
import { buttonClasses, ButtonInner } from '@/components/ui/button';
import { PriceIndex } from '@/components/treatments/price-index';
import { ContactSheet } from '@/components/dentists/contact-sheet';
import { AlbaLine } from '@/components/clinics/alba-line';
import { LightLink } from '@/components/light/view-transitions';
import { vtName } from '@/components/light/vt-name';

/** Catalogue, studios and team re-read from the store every 5 minutes (ISR). */
export const revalidate = 300;

type Params = { slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
	const { slug } = await params;
	const d = (await getCatalog()).departments.find((x) => x.slug === slug);
	return d ? { title: d.title, description: `${d.tagline} ${d.intro}`.slice(0, 300) } : { title: 'Treatment' };
}

export default async function DepartmentPage({ params }: { params: Promise<Params> }) {
	const { slug } = await params;
	const [catalog, { studios, video, clinicians }] = await Promise.all([getCatalog(), getStudios()]);
	const d = catalog.departments.find((x) => x.slug === slug);
	if (!d) notFound();

	const variants = d.groups.flatMap((g) => g.variants);
	const studioIds = new Set(variants.flatMap((t) => t.studios.map((s) => s.id)));
	const offeredAt = studios.filter((s) => studioIds.has(s.id));
	const onVideo = variants.some((t) => t.online);
	const staffIds = new Set(variants.flatMap((t) => [...t.studios.flatMap((s) => s.staffIds), ...(t.online?.staffIds ?? [])]));
	const team = clinicians.filter((c) => staffIds.has(c.id));
	const prep = prepFor(d.slug, d.kind === 'video');
	const isKids = d.slug === siteConfig.collections.kids;
	const others = catalog.departments.filter((x) => x.slug !== d.slug && x.groups.length);

	return (
		<>
			<section className="frame pt-8 lg:pt-12">
				<nav aria-label="Breadcrumb" className="t-anno flex gap-2">
					<LightLink href="/treatments" className="hover:!text-ink">
						02 Treatments
					</LightLink>
					<span>/</span>
					<span className="!text-ink-2">{d.short}</span>
				</nav>
				<div className="mt-8 grid gap-10 lg:grid-cols-[120px_minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-10">
					<p className="t-num text-[12px] text-brass" style={vtName('dept-n', d.slug)}>
						{d.index}
					</p>
					<div>
						<KindGlyph kind={d.kind} className="h-12 w-12 text-lagoon-3" />
						<h1 className="t-xl mt-4" style={vtName('dept-t', d.slug)}>
							{d.title}
						</h1>
						<p className="t-md mt-5 text-lagoon-3">{d.tagline}</p>
						<p className="t-lede mt-6 max-w-[54ch]">{d.intro}</p>
						<div className="mt-8 flex flex-wrap gap-3">
							<Link href={bookHref({ dept: d.slug, for: isKids ? 'child' : null })} className={buttonClasses({ variant: 'solid', size: 'lg' })}>
								<ButtonInner size="lg">Book {d.short.toLowerCase()}</ButtonInner>
							</Link>
							{isKids ? (
								<Link href="/kids" className={buttonClasses({ variant: 'line', size: 'lg' })}>
									<ButtonInner variant="line" size="lg">
										Visit Tooth Town
									</ButtonInner>
								</Link>
							) : (
								<Link href="/smile-check" className={buttonClasses({ variant: 'line', size: 'lg' })}>
									<ButtonInner variant="line" size="lg" cell={<span className="t-num text-[10px]">01</span>}>
										Not sure? Smile Check
									</ButtonInner>
								</Link>
							)}
						</div>
					</div>
					<div className="image-well develop relative aspect-[4/5] overflow-hidden rounded-[6px] lg:aspect-auto lg:min-h-[480px]" style={vtName('dept-img', d.slug)}>
						<Image src={d.image} alt={d.title} fill priority sizes="(min-width:1024px) 38vw, 100vw" className="object-cover" />
					</div>
				</div>
			</section>

			{d.treats.length ? (
				<section className="frame mt-16 lg:mt-24">
					<div className="grid gap-6 border-y border-line py-6 lg:grid-cols-[120px_1fr]">
						<p className="t-anno pt-1">Helps with</p>
						<ul className="flex flex-wrap gap-x-8 gap-y-3">
							{d.treats.map((t, i) => (
								<li key={t} className="flex items-baseline gap-2 text-[16px]">
									<span className="t-num text-[10px] text-brass">{String(i + 1).padStart(2, '0')}</span>
									{t}
								</li>
							))}
						</ul>
					</div>
				</section>
			) : null}

			<section className="frame mt-16 lg:mt-24">
				<PlateHead index="01" title={<>Visits &amp; <em>prices</em></>} anno={`${variants.length} options`} />
				<PriceIndex groups={d.groups} currency={catalog.currency} />
			</section>

			<section className="frame mt-20 lg:mt-28">
				<PlateHead index="02" title={<>Where to <em>book it</em></>} anno={offeredAt.length ? `${offeredAt.length} studio${offeredAt.length > 1 ? 's' : ''}${onVideo ? ' + video' : ''}` : 'Video only'} />
				{offeredAt.length ? (
					<AlbaLine
						className="md:my-[110px]"
						stations={offeredAt.map((s) => ({ slug: s.slug, title: s.title, area: s.area, lat: s.lat, lng: s.lng, kids: s.kids, href: bookHref({ dept: d.slug, clinic: s.slug, for: isKids ? 'child' : null }) }))}
						video={onVideo && video ? { label: 'Alba Video', note: 'From your sofa', href: bookHref({ dept: d.slug, clinic: video.slug }) } : null}
						label={`Studios offering ${d.title}`}
					/>
				) : (
					<p className="text-ink-2">Booked as a video consultation, wherever you are.</p>
				)}
			</section>

			<section className="frame mt-16 grid gap-12 lg:mt-24 lg:grid-cols-2">
				<div>
					<p className="t-anno">Before you come</p>
					<ul className="mt-4 border-t border-line">
						{prep.bring.map((b) => (
							<li key={b} className="flex gap-3 border-b border-line py-3 text-[15px]">
								<span aria-hidden className="text-brass">—</span>
								{b}
							</li>
						))}
					</ul>
					<p className="mt-4 text-[15px] text-ink-2">{prep.tip}</p>
				</div>
				{d.faqs.length ? (
					<div>
						<p className="t-anno mb-2">Questions</p>
						<Faq items={d.faqs} />
					</div>
				) : null}
			</section>

			{team.length ? (
				<section className="frame mt-20 lg:mt-28">
					<PlateHead index="03" title={<>Who you&rsquo;ll <em>see</em></>} anno={`${team.length} clinicians`} />
					<ContactSheet clinicians={team} cols="wide" />
				</section>
			) : null}

			<section className="frame mb-24 mt-20 lg:mt-28">
				<p className="t-anno">Other departments</p>
				<ul className="mt-4 flex flex-wrap gap-2">
					{others.map((o) => (
						<li key={o.slug}>
							<LightLink href={`/treatments/${o.slug}`} className="inline-flex items-center gap-2 rounded-[4px] border border-line-2 px-3 py-2 text-[14px] hover:border-lagoon">
								<span className="t-num text-[10px] text-brass">{o.index}</span>
								{o.short}
							</LightLink>
						</li>
					))}
				</ul>
			</section>
		</>
	);
}
