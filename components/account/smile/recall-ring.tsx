'use client';

import Link from 'next/link';
import { clsx } from 'clsx';
import { siteConfig } from '@/lib/site-config';
import { isUpcoming } from '@/components/account/care-utils';
import type { CareVisit } from '@/components/account/care-types';

export interface RingState {
	label: string;
	book: string;
	/** 0–1 of the interval elapsed since the last visit; null = never had one here. */
	elapsed: number | null;
	lastAt: number | null;
	dueAt: number | null;
	bookedAt: number | null;
	overdue: boolean;
	months: number;
}

/** The recall clocks for one patient: which of `siteConfig.recalls` apply, and how far round each is. */
export function ringsOf(visits: CareVisit[], nowMs: number, child: boolean): RingState[] {
	const relevant = siteConfig.recalls.filter((r) => visits.some((v) => r.services.includes(v.product.slug)));
	const fallback = siteConfig.recalls.filter((r) => (child ? r.book.startsWith('kids-') : r.book === 'check-up' || r.book === 'hygiene-clean'));
	const list = (relevant.length ? relevant : fallback).slice(0, 2);
	return list.map((r) => {
		const matching = visits.filter((v) => r.services.includes(v.product.slug));
		const booked = matching.filter((v) => isUpcoming(v, nowMs)).sort((a, b) => a.from.localeCompare(b.from))[0];
		const last = matching.filter((v) => v.status === 'completed' || (v.status !== 'canceled' && Date.parse(v.to) < nowMs)).sort((a, b) => b.from.localeCompare(a.from))[0];
		if (!last) return { label: r.label, book: r.book, elapsed: null, lastAt: null, dueAt: null, bookedAt: booked ? Date.parse(booked.from) : null, overdue: false, months: r.months };
		const lastAt = Date.parse(last.from);
		const due = new Date(lastAt);
		due.setMonth(due.getMonth() + r.months);
		const dueAt = due.getTime();
		return {
			label: r.label,
			book: r.book,
			elapsed: Math.min(1, Math.max(0, (nowMs - lastAt) / (dueAt - lastAt))),
			lastAt,
			dueAt,
			bookedAt: booked ? Date.parse(booked.from) : null,
			overdue: dueAt < nowMs && !booked,
			months: r.months,
		};
	});
}

const RADII = [118, 92];
const monthYear = (ms: number) => new Intl.DateTimeFormat('en-GB', { timeZone: siteConfig.timezone, month: 'long', year: 'numeric' }).format(ms);
const dayMonth = (ms: number) => new Intl.DateTimeFormat('en-GB', { timeZone: siteConfig.timezone, day: 'numeric', month: 'short' }).format(ms);

function arc(r: number, fraction: number): string {
	const f = Math.min(0.9999, Math.max(0, fraction));
	const a = -Math.PI / 2 + f * 2 * Math.PI;
	const x = Math.round((140 + r * Math.cos(a)) * 100) / 100;
	const y = Math.round((140 + r * Math.sin(a)) * 100) / 100;
	return `M 140 ${140 - r} A ${r} ${r} 0 ${f > 0.5 ? 1 : 0} 1 ${x} ${y}`;
}

/**
 * The recall ring: each ring is one recall interval (check-up, hygiene), the
 * top is the last visit, a full turn is when the next one is due. The arc shows
 * how far round the patient is today; brass ticks mark the months.
 */
export function RecallRing({ rings, bookHrefFor, className }: { rings: RingState[]; bookHrefFor: (book: string) => string; className?: string }) {
	const lead = [...rings].sort((a, b) => (a.dueAt ?? Infinity) - (b.dueAt ?? Infinity))[0];
	return (
		<section aria-label="When you're due" className={clsx('grid items-center gap-8 sm:grid-cols-[280px_1fr]', className)}>
			<div className="relative mx-auto aspect-square w-full max-w-[280px]">
				<svg viewBox="0 0 280 280" className="h-full w-full -rotate-0" aria-hidden>
					{rings.map((r, i) => {
						const radius = RADII[i]!;
						return (
							<g key={r.label}>
								<circle cx="140" cy="140" r={radius} fill="none" stroke="var(--color-line)" strokeWidth="14" />
								{Array.from({ length: r.months }, (_, m) => {
									const a = -Math.PI / 2 + (m / r.months) * 2 * Math.PI;
									const x1 = Math.round((140 + (radius + 9) * Math.cos(a)) * 100) / 100;
									const y1 = Math.round((140 + (radius + 9) * Math.sin(a)) * 100) / 100;
									const x2 = Math.round((140 + (radius + 13) * Math.cos(a)) * 100) / 100;
									const y2 = Math.round((140 + (radius + 13) * Math.sin(a)) * 100) / 100;
									return <line key={m} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--color-brass)" strokeWidth="1" />;
								})}
								{r.elapsed != null ? (
									<path
										d={arc(radius, r.elapsed)}
										fill="none"
										stroke={r.overdue ? 'var(--color-signal)' : i === 0 ? 'var(--color-lagoon-3)' : 'var(--color-mint-2)'}
										strokeWidth="14"
										strokeLinecap="round"
										className="ring-draw"
										pathLength={1}
									/>
								) : null}
							</g>
						);
					})}
				</svg>
				<div className="absolute inset-0 flex flex-col items-center justify-center px-14 text-center">
					{lead?.bookedAt ? (
						<>
							<span className="t-anno">{lead.label} booked</span>
							<span className="mt-1 font-display text-[34px] leading-none text-ink">{dayMonth(lead.bookedAt)}</span>
						</>
					) : lead?.dueAt ? (
						<>
							<span className={clsx('t-anno', lead.overdue && '!text-signal')}>{lead.overdue ? `${lead.label} overdue` : `${lead.label} due`}</span>
							<span className="mt-1 font-display text-[30px] leading-[1] text-ink">{monthYear(lead.dueAt)}</span>
						</>
					) : (
						<>
							<span className="t-anno">No clock yet</span>
							<span className="mt-1 font-display text-[22px] leading-tight text-ink">Your first visit starts it</span>
						</>
					)}
				</div>
			</div>

			<ul className="space-y-5">
				{rings.map((r, i) => (
					<li key={r.label} className="flex items-start gap-4">
						<span aria-hidden className={clsx('mt-1.5 h-3 w-6 shrink-0 rounded-full', r.overdue ? 'bg-signal' : i === 0 ? 'bg-lagoon-3' : 'bg-mint-2')} />
						<div>
							<p className="text-[16px] text-ink">{r.label}</p>
							<p className="t-anno mt-1">
								{r.bookedAt
									? `Booked for ${dayMonth(r.bookedAt)}`
									: r.dueAt
										? `${r.overdue ? 'Was due' : 'Due'} ${monthYear(r.dueAt)} · every ${r.months} months`
										: `Every ${r.months} months`}
							</p>
							{!r.bookedAt ? (
								<Link href={bookHrefFor(r.book)} className="link-hair mt-2 inline-block text-[14px] text-lagoon">
									{r.dueAt ? 'Book it' : 'Book the first one'}
								</Link>
							) : null}
						</div>
					</li>
				))}
			</ul>
		</section>
	);
}
