import Link from 'next/link';
import { ChapterMark, RisoTitle, TornEdge } from '@/components/kids/paper';
import { kidsMinutes, kidsPrice } from '@/lib/kids/format';
import { kidsBookHref, kidsCopy } from '@/lib/kids/kids-config';
import type { KidsService } from '@/lib/kids/kids-data';

/*
 * "For grown-ups": the calm back pages of the book. Promises on a lined
 * notepad, a printed price card with every kids option from the store, and
 * the questions parents ask.
 */
export function GrownUps({ services, currency }: { services: KidsService[]; currency: string }) {
	const t = kidsCopy.parents;
	const rows = services.flatMap((s) =>
		s.options.map((o) => ({ key: o.slug, title: s.options.length > 1 && o.label ? `${s.title} · ${o.label}` : s.title, price: o.price, minutes: o.minutes, slug: o.slug })),
	);
	return (
		<section id="grown-ups" aria-labelledby="grown-ups-title" className="relative scroll-mt-4">
			<TornEdge color="var(--r-paper-2)" seed={67} />
			<div className="bg-(--r-paper-2) px-4 pt-10 pb-20 sm:px-6">
				<div className="mx-auto max-w-6xl">
					<div className="max-w-2xl">
						<ChapterMark n="G" label={t.label} tone="#00804a" />
						<RisoTitle id="grown-ups-title" className="mt-3 text-[clamp(2.8rem,7vw,4.4rem)] leading-[0.9]" second="var(--r-green)">
							{t.title}
						</RisoTitle>
						<p className="mt-4 text-lg leading-relaxed">{t.lead}</p>
					</div>

					<div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
						{/* the notepad */}
						<div className="r-lined r-cut relative rounded-[2px] pt-[3.9rem] pr-6 pb-[1.95rem] pl-14 sm:pl-16">
							<div aria-hidden className="absolute inset-x-0 top-0 flex h-6 justify-around bg-(--r-ink)/90 px-6">
								{Array.from({ length: 9 }, (_, i) => (
									<span key={i} className="mt-3 size-3 rounded-full bg-(--r-paper)" />
								))}
							</div>
							<ol className="space-y-[1.95rem]">
								{t.promises.map((p, i) => (
									<li key={p.title} className="relative leading-[1.95rem]">
										<span className="r-brush absolute -left-11 text-3xl leading-[1.95rem] text-(--r-pink) sm:-left-12">{i + 1}.</span>
										<h3 className="font-bold">{p.title}</h3>
										<p className="text-(--r-ink-soft)">{p.text}</p>
									</li>
								))}
							</ol>
						</div>

						{/* the price card */}
						<div className="r-paper r-cut rounded-[2px] p-6 sm:p-8" style={{ transform: 'rotate(0.8deg)' }}>
							<p className="r-brush text-3xl text-(--r-teal)">{t.priceCard}</p>
							<p className="text-sm text-(--r-ink-soft)">Every kids visit, the price you pay. Nothing added in the room without asking.</p>
							<ul className="mt-5 space-y-3">
								{rows.map((r) => (
									<li key={r.key}>
										<Link href={kidsBookHref({ service: r.slug })} className="r-focus group flex items-baseline gap-2">
											<span className="font-bold group-hover:text-(--r-teal)">{r.title}</span>
											<span aria-hidden className="mb-1 min-w-4 flex-1 border-b-2 border-dotted border-(--r-ink)/30" />
											<span className="shrink-0 text-sm text-(--r-ink-soft)">{kidsMinutes(r.minutes)}</span>
											<span className="w-14 shrink-0 text-right font-bold tabular-nums">{kidsPrice(r.price, currency)}</span>
										</Link>
									</li>
								))}
							</ul>
							<p className="mt-6 border-t-2 border-dashed border-(--r-ink)/20 pt-4 text-sm text-(--r-ink-soft)">
								Happy air (gentle nitrous oxide) can be added in the booking, only if you want it.
							</p>
						</div>
					</div>

					{/* questions */}
					<div className="mt-14 grid gap-8 lg:grid-cols-[0.6fr_1.4fr]">
						<div>
							<h3 className="r-brush text-4xl leading-none">Questions grown-ups ask</h3>
							<p className="mt-3 text-(--r-ink-soft)">
								Anything else? Call{' '}
								<a href={kidsCopy.contact.phoneHref} className="r-quiet">
									{kidsCopy.contact.phone}
								</a>
							</p>
							<Link href="/kids/quest" className="r-tag r-tag-pink mt-6">
								Take the Tooth Quest
							</Link>
						</div>
						<div className="divide-y-2 divide-dashed divide-(--r-ink)/15 border-y-2 border-dashed border-(--r-ink)/15">
							{t.faqs.map((f) => (
								<details key={f.q} className="group py-4">
									<summary className="r-focus flex cursor-pointer list-none items-start justify-between gap-4 text-lg font-bold [&::-webkit-details-marker]:hidden">
										{f.q}
										<span aria-hidden className="r-brush mt-[-0.2rem] text-3xl leading-none text-(--r-pink) transition-transform group-open:rotate-45">
											+
										</span>
									</summary>
									<p className="mt-2 max-w-2xl leading-relaxed text-(--r-ink-soft)">{f.a}</p>
								</details>
							))}
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
