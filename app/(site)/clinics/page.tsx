import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { getStudios } from '@/lib/studios-server';
import { siteConfig } from '@/lib/site-config';
import { bookHref } from '@/lib/catalog';
import { PlateHead } from '@/components/ui/plate-head';
import { LineBoard } from '@/components/clinics/line-board';
import { StudioStatus } from '@/components/clinics/studio-status';
import { KindGlyph } from '@/components/ui/icon';
import { Tag } from '@/components/ui/chip';
import { buttonClasses, ButtonInner } from '@/components/ui/button';

/** Catalogue, studios and team re-read from the store every 5 minutes (ISR). */
export const revalidate = 300;

export const metadata: Metadata = {
	title: 'Studios',
	description: 'Five Alba Dental studios across London (Marylebone, Shoreditch, Notting Hill, Canary Wharf and Clapham) plus video consultations. Opening hours, addresses and the next free time at each.',
};

export default async function ClinicsPage() {
	const { studios, video } = await getStudios();
	return (
		<>
			<section className="frame pt-10 lg:pt-16">
				<PlateHead
					as="h1"
					index="03"
					size="xl"
					title={
						<>
							{studios.length} studios, <em>one line.</em>
						</>
					}
					anno={<>London · {siteConfig.timezone}<br />+ video consultations</>}
					lede="Every studio runs to the same standard, with its own team and its own hours. Pick the one on your way, or let the line show you who has the soonest chair."
				/>
				<LineBoard studios={studios} video={video} className="my-10 md:my-[120px]" />
			</section>

			<section className="frame pb-20" aria-label="Studio directory">
				<ol className="border-t border-line">
					{studios.map((s, i) => (
						<li key={s.slug} className="grid gap-6 border-b border-line py-10 lg:grid-cols-[120px_minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-10 lg:py-14">
							<span className="t-num text-[12px] text-brass">S·{String(i + 1).padStart(2, '0')}</span>
							<div className="min-w-0">
								<Link href={`/clinics/${s.slug}`} className="group inline-block">
									<h2 className="t-lg group-hover:text-lagoon-3">{s.short}</h2>
								</Link>
								<p className="t-anno mt-2">{s.area}</p>
								<p className="mt-4 max-w-[46ch] text-[16px] text-ink-2">{s.tagline}</p>
								<StudioStatus slug={s.slug} className="mt-5 text-ink-2" />
								<dl className="mt-6 grid gap-4 text-[14px] sm:grid-cols-2">
									<div>
										<dt className="t-anno">Address</dt>
										<dd className="mt-1.5 text-ink">{s.addressLines.join(', ')}</dd>
									</div>
									<div>
										<dt className="t-anno">Getting there</dt>
										<dd className="mt-1.5 text-ink-2">{s.note}</dd>
									</div>
								</dl>
								<div className="mt-6 flex flex-wrap items-center gap-2">
									{s.departments.map((d) => {
										const kind = siteConfig.departments[d]?.kind;
										return (
											<span key={d} className="inline-flex items-center gap-1.5 rounded-[3px] border border-line px-2 py-1 text-[12.5px] text-ink-2" title={siteConfig.departments[d]?.short ?? d}>
												<KindGlyph kind={kind} className="h-5 w-5 text-lagoon-3" />
												{siteConfig.departments[d]?.short ?? d}
											</span>
										);
									})}
									{s.kids ? <Tag tone="brass">Kids room</Tag> : null}
								</div>
								<div className="mt-8 flex flex-wrap gap-3">
									<Link href={bookHref({ clinic: s.slug })} className={buttonClasses({ variant: 'solid' })}>
										<ButtonInner>Book at {s.short}</ButtonInner>
									</Link>
									<Link href={`/clinics/${s.slug}`} className={buttonClasses({ variant: 'line' })}>
										<ButtonInner variant="line" cell={<span className="t-num text-[10px]">{String(s.clinicianIds.length).padStart(2, '0')}</span>}>
											Studio &amp; team
										</ButtonInner>
									</Link>
								</div>
							</div>
							<Link href={`/clinics/${s.slug}`} className="image-well aperture relative block aspect-[16/11] rounded-[6px]" aria-label={`${s.short} studio`}>
								<Image src={s.image} alt={`Inside Alba ${s.short}`} fill sizes="(min-width:1024px) 45vw, 100vw" className="object-cover" />
							</Link>
						</li>
					))}
				</ol>
			</section>
		</>
	);
}
