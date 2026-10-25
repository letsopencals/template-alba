import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getStudios } from '@/lib/studios-server';
import { getCatalog } from '@/lib/catalog-server';
import { bookHref, toGroups } from '@/lib/catalog';
import { siteConfig } from '@/lib/site-config';
import { PlateHead } from '@/components/ui/plate-head';
import { Tag } from '@/components/ui/chip';
import { Icon } from '@/components/ui/icon';
import { buttonClasses, ButtonInner } from '@/components/ui/button';
import { Portrait } from '@/components/dentists/portrait';
import { ContactSheet } from '@/components/dentists/contact-sheet';
import { PriceIndex } from '@/components/treatments/price-index';

/** Catalogue, studios and team re-read from the store every 5 minutes (ISR). */
export const revalidate = 300;

type Params = { slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
	const { slug } = await params;
	const c = (await getStudios()).clinicians.find((x) => x.slug === slug);
	return c ? { title: c.name, description: `${c.name}, ${c.title} at Alba Dental. ${c.bio ?? ''}`.trim().slice(0, 300) } : { title: 'Clinician' };
}

export default async function ClinicianPage({ params }: { params: Promise<Params> }) {
	const { slug } = await params;
	const [{ studios, clinicians }, catalog] = await Promise.all([getStudios(), getCatalog()]);
	const c = clinicians.find((x) => x.slug === slug);
	if (!c) notFound();
	const idx = clinicians.indexOf(c);
	const profile = siteConfig.clinicians[c.slug];
	const theirs = catalog.treatments.filter((t) => t.studios.some((s) => s.staffIds.includes(c.id)) || t.online?.staffIds.includes(c.id));
	const groups = toGroups(theirs);
	const where = studios.filter((s) => c.clinics.some((k) => k.id === s.id));
	const colleagues = clinicians.filter((x) => x.id !== c.id && x.clinics.some((k) => c.clinics.some((m) => m.id === k.id))).slice(0, 4);
	const firstStudio = where[0]?.slug ?? null;

	return (
		<>
			<section className="frame pt-8 lg:pt-12">
				<nav aria-label="Breadcrumb" className="t-anno flex gap-2">
					<Link href="/dentists" className="hover:!text-ink">
						04 Dentists
					</Link>
					<span>/</span>
					<span className="!text-ink-2">No. {String(idx + 1).padStart(2, '0')}</span>
				</nav>
				<div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
					<div className="relative">
						<Portrait src={c.imageUrl} name={c.name} priority sizes="(min-width:1024px) 34vw, 100vw" className="aspect-[4/5] w-full rounded-[6px]" />
						<div className="mt-3 flex items-center justify-between">
							<span className="t-anno">No. {String(idx + 1).padStart(2, '0')} · Alba Dental</span>
							<span className="t-anno">GDC-registered</span>
						</div>
					</div>
					<div className="lg:pt-6">
						<p className="t-anno">{c.title}</p>
						<h1 className="t-xl mt-3">{c.name}</h1>
						{profile?.qualifications ? <p className="t-num mt-4 text-[12px] text-ink-3">{profile.qualifications}</p> : null}
						{c.bio ? <p className="t-lede mt-7 max-w-[52ch]">{c.bio}</p> : null}

						<dl className="mt-9 grid gap-0 border-t border-line">
							<Row label="Studios">
								<span className="flex flex-wrap gap-x-4 gap-y-1">
									{where.map((s) => (
										<Link key={s.slug} href={`/clinics/${s.slug}`} className="link-hair">
											{s.short}
										</Link>
									))}
									{c.video ? <span className="inline-flex items-center gap-1.5"><Icon name="video" className="h-3.5 w-3.5 text-ink-3" />Video</span> : null}
								</span>
							</Row>
							{c.languages.length ? <Row label="Speaks">{c.languages.join(', ')}</Row> : null}
							{c.focus.length ? (
								<Row label="Special interests">
									<span className="flex flex-wrap gap-1.5">
										{c.focus.map((f) => (
											<Tag key={f}>{f}</Tag>
										))}
									</span>
								</Row>
							) : null}
						</dl>

						<div className="mt-9 flex flex-wrap gap-3">
							<Link href={bookHref({ staff: c.slug, clinic: firstStudio })} className={buttonClasses({ variant: 'solid', size: 'lg' })}>
								<ButtonInner size="lg">Book with {c.name.startsWith('Dr ') ? `Dr ${c.lastName}` : c.firstName}</ButtonInner>
							</Link>
						</div>
					</div>
				</div>
			</section>

			{groups.length ? (
				<section className="frame mt-20 lg:mt-28">
					<PlateHead index="01" title={<>Book {c.firstName} <em>for</em></>} anno={`${theirs.length} treatments`} />
					<PriceIndex groups={groups} currency={catalog.currency} clinic={firstStudio ?? undefined} />
				</section>
			) : null}

			{colleagues.length ? (
				<section className="frame mb-24 mt-20 lg:mt-28">
					<PlateHead index="02" title={<>Works <em>alongside</em></>} size="md" />
					<ContactSheet clinicians={colleagues} />
				</section>
			) : (
				<div className="mb-24" />
			)}
		</>
	);
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
	return (
		<div className="grid grid-cols-[140px_1fr] items-baseline gap-4 border-b border-line py-3.5 text-[15px]">
			<dt className="t-anno">{label}</dt>
			<dd>{children}</dd>
		</div>
	);
}
