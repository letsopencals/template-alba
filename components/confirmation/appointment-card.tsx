'use client';

import { useState } from 'react';
import { clsx } from 'clsx';
import { useHydrated } from '@/hooks/use-hydrated';
import { ToothStrip } from '@/components/brand/tooth-strip';
import { siteConfig } from '@/lib/site-config';
import type { CardVisit } from './card-model';
import './card.css';

const UPPER = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
const LOWER = [38, 37, 36, 35, 34, 33, 32, 31, 41, 42, 43, 44, 45, 46, 47, 48];

/** The studio's stamp: an FDI tooth-number ring (upper arch over the top, lower under), the studio in the middle. */
export function FdiStamp({ studio, className }: { studio: string | null; className?: string }) {
	const numbers = [...UPPER.map((n, i) => ({ n, a: Math.PI + (i + 0.5) * (Math.PI / 16) })), ...LOWER.map((n, i) => ({ n, a: (i + 0.5) * (Math.PI / 16) }))];
	return (
		<svg viewBox="0 0 120 120" className={className} aria-hidden>
			<g fill="none" stroke="var(--color-brass)">
				<circle cx="60" cy="60" r="57" strokeWidth="1.6" />
				<circle cx="60" cy="60" r="38" strokeWidth="0.8" />
				<path d="M 24 60 H 96" strokeWidth="0.6" strokeDasharray="1.5 2" />
			</g>
			<g fill="var(--color-brass)" fontFamily="var(--font-mono)" fontSize="6.2" textAnchor="middle" dominantBaseline="central">
				{numbers.map(({ n, a }) => (
					<text key={n} x={Math.round((60 + 47.5 * Math.cos(a)) * 100) / 100} y={Math.round((60 + 47.5 * Math.sin(a)) * 100) / 100}>
						{n}
					</text>
				))}
			</g>
			<g fill="var(--color-brass)" textAnchor="middle">
				<text x="60" y="52" fontFamily="var(--font-display)" fontSize="17">
					alba
				</text>
				<text x="60" y="73" fontFamily="var(--font-mono)" fontSize="6" letterSpacing="1.2">
					{(studio ?? 'Dental').toUpperCase().slice(0, 14)}
				</text>
			</g>
		</svg>
	);
}

/** Teeth the visit is about, lit on the chart strip: the whole arch for a clean, the front six for cosmetic work. */
function highlightFor(v: CardVisit): number[] {
	if (v.department === 'hygiene' || /hygiene|clean|airflow/.test(v.productSlug ?? '')) return [17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27];
	if (v.department === 'cosmetic' || v.department === 'orthodontics') return [13, 12, 11, 21, 22, 23];
	return [];
}

const fmt = (tz: string, o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('en-GB', { timeZone: tz, ...o });

/**
 * The appointment card: the reminder card a dental practice hands you at the
 * desk, filled in by hand. "Turn over" flips it to the back, which says what to
 * bring and how to get there.
 */
export function AppointmentCard({ visit, timeZone = siteConfig.timezone, className, label = 'Your next appointment' }: { visit: CardVisit; timeZone?: string; className?: string; label?: string }) {
	const [flipped, setFlipped] = useState(false);
	const hydrated = useHydrated();
	// Video visits read in the visitor's own zone; studio visits in the studio's.
	const tz = visit.video && hydrated ? Intl.DateTimeFormat().resolvedOptions().timeZone : timeZone;
	const day = fmt(tz, { weekday: 'long', day: 'numeric', month: 'long' }).format(visit.from);
	const time = fmt(tz, { hour: '2-digit', minute: '2-digit', hour12: false }).format(visit.from);
	const arrive = !visit.video && visit.prep.arriveEarly > 0 ? fmt(tz, { hour: '2-digit', minute: '2-digit', hour12: false }).format(visit.from - visit.prep.arriveEarly * 60_000) : null;
	const who = visit.nickname ?? visit.patientName;
	const treatment = `${visit.title}${visit.option ? ` · ${visit.option}` : ''}`;

	return (
		<div className={clsx('appt relative', className)} data-flipped={flipped}>
			{flipped ? null : <FdiStamp studio={visit.studioTitle} className="appt-stamp -right-[3%] bottom-[18%] z-10 w-[clamp(84px,19%,132px)]" />}
			<div className="appt-inner">
				{/* ── Front ─────────────────────────────── */}
				<section className="appt-face appt-front porcelain-card" aria-hidden={flipped}>
					<div className="flex items-start justify-between">
						<div>
							<p className="font-display text-[clamp(20px,3vw,28px)] leading-none text-lagoon">alba</p>
							<p className="t-anno mt-1 !text-[8.5px]">Dental · {visit.studioTitle ?? 'London'}</p>
						</div>
						<p className="t-anno text-right !text-[8.5px]">{label}</p>
					</div>
					{/* The printed chart strip across the top of the card stock. */}
					<ToothStrip tone="light" numbers={false} highlight={highlightFor(visit)} className="mt-[clamp(8px,2vw,16px)] h-[clamp(22px,4.5vw,40px)] opacity-80" />

					<div className="relative mt-auto space-y-[clamp(6px,1.4vw,14px)] text-[clamp(12px,1.9vw,16px)] text-ink-2">
						<p>
							on <span className="blank text-[1.65em]">{hydrated ? day : ' '}</span>
						</p>
						<p>
							at <span className="blank text-[1.65em] tabular-nums">{hydrated ? time : ' '}</span>
							{visit.clinicianName ? (
								<>
									{' '}
									with <span className="blank text-[1.4em]">{visit.clinicianName}</span>
								</>
							) : null}
						</p>
						<p className="flex flex-wrap gap-x-4">
							<span>
								for <span className="blank text-[1.25em]">{who ?? 'you'}</span>
							</span>
							<span className="min-w-0">
								visit <span className="blank max-w-full truncate align-bottom text-[1.25em]">{treatment}</span>
							</span>
						</p>
					</div>

					<div className="mt-[clamp(10px,2.4vw,22px)] flex items-end justify-between gap-4 border-t border-line pt-2.5">
						<p className="t-anno !text-[8.5px] leading-snug">
							Please give 24 hours&rsquo; notice to change
							<br />
							{siteConfig.contact.phone}
						</p>
						<button type="button" onClick={() => setFlipped(true)} className="t-anno shrink-0 !text-lagoon hover:!text-ink">
							Turn over ↻
						</button>
					</div>
				</section>

				{/* ── Back ──────────────────────────────── */}
				<section className="appt-face appt-back porcelain-card" aria-hidden={!flipped}>
					<div className="grid min-h-0 flex-1 grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
						<div className="min-h-0">
							<p className="t-anno">Before you come</p>
							<ul className="mt-2 space-y-1 text-[clamp(11.5px,1.6vw,14px)] leading-snug text-ink">
								{visit.prep.bring.slice(0, 4).map((b) => (
									<li key={b} className="flex gap-2">
										<span aria-hidden className="mt-[0.45em] h-2 w-2 shrink-0 rounded-[2px] border border-ink-3" />
										{b}
									</li>
								))}
							</ul>
						</div>
						<div className="min-h-0 max-sm:hidden">
							<p className="t-anno">{visit.video ? 'Joining' : 'Getting there'}</p>
							{visit.video ? (
								<p className="mt-2 text-[14px] leading-snug text-ink">Your video link arrives by email and opens ten minutes before. Somewhere bright, with a mirror if you can.</p>
							) : (
								<>
									<p className="mt-2 text-[14px] leading-snug text-ink">{visit.address ?? visit.studioTitle}</p>
									{visit.transportNote ? <p className="mt-1.5 text-[13px] leading-snug text-ink-2">{visit.transportNote}</p> : null}
									{arrive ? <p className="mt-2 text-[13px] text-ink">Arrive by <span className="blank">{hydrated ? arrive : ' '}</span></p> : null}
								</>
							)}
						</div>
					</div>
					<div className="mt-3 flex items-end justify-between gap-4 border-t border-line pt-2.5">
						<p className="font-display text-[clamp(14px,2vw,18px)] leading-tight text-lagoon-2">{visit.prep.tip}</p>
						<button type="button" onClick={() => setFlipped(false)} className="t-anno shrink-0 !text-lagoon hover:!text-ink">
							↺ Front
						</button>
					</div>
				</section>
			</div>
		</div>
	);
}
