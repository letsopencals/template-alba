'use client';

import Link from 'next/link';
import { useMemo, useRef } from 'react';
import { clsx } from 'clsx';
import { useNow } from '@/hooks/use-now';
import { useInView } from '@/hooks/use-in-view';
import { useNextFree } from '@/hooks/use-next-free';
import { openLine, studioOpenState, wallClock } from '@/lib/studio-status';
import { bookHref } from '@/lib/catalog';
import { Flap } from '@/components/light/flap';
import { NextFreeLabel } from '@/components/clinics/next-free-label';
import type { Studio } from '@/lib/studios-server';

/*
 * "Today at Alba": a departure board for the five studios. Live London clock,
 * each studio's open/closed light, and the next free check-up and hygiene
 * visit (one cached read per treatment per studio, loaded in view; values
 * turn over like a split-flap). Each row books that studio.
 */
export function TodayBoard({ studios }: { studios: Studio[] }) {
	const ref = useRef<HTMLDivElement>(null);
	const inView = useInView(ref, '400px');
	const now = useNow(30_000);
	const checkups = useMemo(() => studios.filter((s) => s.probe.checkup).map((s) => ({ variantId: s.probe.checkup!, locationId: s.id })), [studios]);
	const hygienes = useMemo(() => studios.filter((s) => s.probe.hygiene).map((s) => ({ variantId: s.probe.hygiene!, locationId: s.id })), [studios]);
	// Same key as the hero's LiveLine → shared, not refetched.
	const freeCheck = useNextFree(checkups, true);
	const freeHyg = useNextFree(hygienes, inView);
	const clock = now ? wallClock(now) : null;
	const hhmm = clock ? `${String(clock.getHours()).padStart(2, '0')}:${String(clock.getMinutes()).padStart(2, '0')}` : '--:--';

	return (
		<section ref={ref} className="plate-dark relative overflow-hidden" aria-labelledby="today-title">
			<div aria-hidden className="chart-paper-light pointer-events-none absolute inset-0 opacity-40" />
			<div className="frame relative py-16 lg:py-24">
				<div className="flex flex-wrap items-end justify-between gap-6">
					<div>
						<p className="t-anno">03 · Live from the diary</p>
						<h2 id="today-title" className="t-xl mt-3 text-enamel">
							Today at <em>Alba</em>
						</h2>
					</div>
					<div className="text-right">
						<p className="t-anno">London</p>
						<p className="t-num mt-1 text-[clamp(2rem,4vw,3.4rem)] leading-none text-mint">
							<Flap value={hhmm} />
						</p>
					</div>
				</div>

				<div className="mt-10 overflow-hidden rounded-[6px] border border-line-light">
					<div className="hidden grid-cols-[72px_minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,0.9fr)_minmax(0,0.9fr)_56px] border-b border-line-light bg-white/[0.03] px-2 py-3 md:grid">
						{['', 'Studio', 'Status', 'Next check-up', 'Next hygiene', ''].map((h, i) => (
							<span key={i} className="t-anno px-3">
								{h}
							</span>
						))}
					</div>
					<ol>
						{studios.map((s, i) => {
							const line = now ? openLine(studioOpenState(s.slug, now)) : null;
							return (
								<li key={s.slug} className="border-b border-line-light last:border-b-0">
									<Link
										href={bookHref({ clinic: s.slug })}
										className="group grid grid-cols-[48px_1fr_auto] items-center gap-y-2 px-2 py-4 transition-colors hover:bg-white/[0.04] md:grid-cols-[72px_minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,0.9fr)_minmax(0,0.9fr)_56px] md:py-5"
									>
										<span className="t-num px-3 text-[11px] text-brass-2">S·{String(i + 1).padStart(2, '0')}</span>
										<span className="px-3">
											<span className="t-sm block text-[1.5rem] text-enamel group-hover:text-mint">{s.short}</span>
											<span className="t-anno mt-0.5 block md:hidden">{line?.text ?? ''}</span>
										</span>
										<span className="hidden items-center gap-2 px-3 text-[14px] text-enamel/80 md:flex">
											<span className="status-light" data-state={line?.tone ?? 'closed'} aria-hidden />
											{line?.text ?? '—'}
										</span>
										<span className="col-span-2 col-start-2 flex items-baseline gap-2 px-3 md:col-span-1 md:col-start-auto md:block">
											<span className="t-anno md:hidden">Check-up</span>
											<NextFreeLabel at={s.probe.checkup ? (freeCheck ? freeCheck[`${s.probe.checkup}:${s.id}`] : undefined) : null} className="text-[14px] text-mint" />
										</span>
										<span className="col-span-2 col-start-2 flex items-baseline gap-2 px-3 md:col-span-1 md:col-start-auto md:block">
											<span className="t-anno md:hidden">Hygiene</span>
											<NextFreeLabel at={s.probe.hygiene ? (freeHyg ? freeHyg[`${s.probe.hygiene}:${s.id}`] : undefined) : null} className="text-[14px] text-enamel/85" />
										</span>
										<span className={clsx('row-start-1 col-start-3 flex justify-end px-3 text-enamel/50 transition-transform group-hover:translate-x-1 group-hover:text-mint md:row-auto md:col-auto')} aria-hidden>
											→
										</span>
									</Link>
								</li>
							);
						})}
					</ol>
				</div>
				<p className="t-anno mt-5 max-w-[70ch] normal-case tracking-normal !text-enamel/50">
					Same-day emergency slots at every studio, from 07:30 at Canary Wharf. Times come straight from our diary and are held while you book.
				</p>
			</div>
		</section>
	);
}
