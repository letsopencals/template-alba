import Link from 'next/link';
import { Pip } from '@/components/kids/pip';
import { RisoTitle } from '@/components/kids/paper';
import { kidsThemeClass } from '@/lib/kids/fonts';
import { kidsDate } from '@/lib/kids/format';
import './riso.css';

export interface StickerBookProps {
	visits: {
		id: string;
		/** Product/variant title. */
		title: string;
		/** ISO UTC. */
		startsAt: string;
		status: 'upcoming' | 'done' | 'cancelled';
		childName: string | null;
		clinicTitle: string | null;
	}[];
	timeZone: string;
	/** e.g. '/book?for=child&dept=childrens-dentistry'. */
	bookHref: string;
}

/** Stamps to a Tooth Town medal. */
const PAGE = 6;
const INKS = ['#d62b8a', 'var(--r-teal)', 'var(--r-blue)', '#00804a', '#d4531c'];
const ROTS = [-9, 6, -4, 11, -7, 3];

/** A rubber-stamp mark: ink that didn't quite take everywhere, slightly rotated. */
function StampMark({ title, date, place, i }: { title: string; date: string; place: string | null; i: number }) {
	const ink = INKS[i % INKS.length]!;
	return (
		<div className="relative grid aspect-square place-items-center" style={{ transform: `rotate(${ROTS[i % ROTS.length]}deg)` }}>
			<svg viewBox="0 0 120 120" className="absolute inset-0 size-full r-multiply" aria-hidden>
				<defs>
					<filter id={`stamp-ink-${i % 3}`}>
						<feTurbulence type="fractalNoise" baseFrequency={0.9} numOctaves={2} seed={i % 3} result="n" />
						<feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.6 1.25" result="mask" />
						<feComposite in="SourceGraphic" in2="mask" operator="in" />
					</filter>
				</defs>
				<g filter={`url(#stamp-ink-${i % 3})`} fill="none" stroke={ink}>
					<circle cx={60} cy={60} r={54} strokeWidth={4} />
					<circle cx={60} cy={60} r={46} strokeWidth={1.6} />
					<path d="M60 26C54 18 42 20 42 32C42 42 46 50 49 58C51 64 55 64 56 57C57 50 63 50 64 57C65 64 69 64 71 58C74 50 78 42 78 32C78 20 66 18 60 26Z" fill={ink} stroke="none" opacity={0.9} />
				</g>
			</svg>
			<div className="relative mt-[42%] px-3 text-center leading-tight" style={{ color: ink }}>
				<p className="text-[0.62rem] font-bold tracking-[0.12em] uppercase">{date}</p>
				<p className="text-[0.7rem] font-bold">{title}</p>
				{place ? <p className="text-[0.6rem]">{place.replace(/^Alba\s+/, '')}</p> : null}
			</div>
		</div>
	);
}

/**
 * My Smile's Tooth Town passport for child visits: a rubber stamp per finished
 * visit, a "stamp waiting" box per upcoming one, empty boxes up to the next
 * medal. Server or client; no data fetching.
 */
export function StickerBook({ visits, timeZone, bookHref }: StickerBookProps) {
	const shown = visits.filter((v) => v.status !== 'cancelled').sort((a, b) => a.startsAt.localeCompare(b.startsAt));
	const done = shown.filter((v) => v.status === 'done');
	const upcoming = shown.filter((v) => v.status === 'upcoming');
	const names = [...new Set(shown.map((v) => v.childName?.trim()).filter(Boolean))] as string[];
	const owner = names.length === 1 ? names[0]! : null;
	const slots = Math.max(PAGE, Math.ceil((shown.length + 1) / PAGE) * PAGE);
	const toMedal = PAGE - (done.length % PAGE);

	return (
		<div className={kidsThemeClass} style={{ background: 'transparent' }}>
			<div className="grid overflow-hidden rounded-[6px] shadow-[0_2px_2px_rgb(47_65_112/.12),0_20px_40px_-20px_rgb(47_65_112/.45)] md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.6fr)]">
				{/* passport cover / photo page */}
				<div className="relative flex flex-col justify-between gap-6 bg-(--r-blue) p-6 text-white">
					<div aria-hidden className="r-halftone absolute inset-0 opacity-30" style={{ ['--dot' as string]: '#1d3f78' }} />
					<div className="relative">
						<p className="text-[0.7rem] font-bold tracking-[0.24em] uppercase opacity-85">Tooth Town</p>
						<RisoTitle as="p" className="text-[2.6rem] leading-[0.9]" ink="#fff" second="var(--r-sun)">
							Passport
						</RisoTitle>
						<p className="mt-3 text-sm opacity-90">{owner ? `Belongs to ${owner}` : 'For every brave visit in the family'}</p>
					</div>
					<div className="relative flex items-end justify-between gap-3">
						<div className="rounded-full bg-white/90 p-1.5">
							<Pip size={64} pose="wave" mood="grin" animated={false} />
						</div>
						<p className="text-right text-sm">
							<span className="r-brush block text-4xl leading-none">{done.length}</span>
							{done.length === 1 ? 'stamp' : 'stamps'}
						</p>
					</div>
				</div>
				{/* stamp pages */}
				<div className="r-paper p-5 sm:p-6">
					<div className="flex flex-wrap items-baseline justify-between gap-2">
						<p className="font-bold">Visits</p>
						<p className="text-sm text-(--r-ink-soft)">
							{toMedal === PAGE && done.length > 0 ? 'Medal earned! ' : null}
							{toMedal} more {toMedal === 1 ? 'stamp' : 'stamps'} to a Tooth Town medal
						</p>
					</div>
					<ul className="mt-4 grid grid-cols-3 gap-3 sm:gap-4">
						{Array.from({ length: slots }, (_, i) => {
							const v = shown[i];
							if (v?.status === 'done') {
								return (
									<li key={v.id} className="r-stamp-in" style={{ ['--stamp-rot' as string]: `${ROTS[i % ROTS.length]}deg`, animationDelay: `${i * 90}ms` }}>
										<StampMark title={v.title} date={kidsDate(v.startsAt, timeZone, 'short')} place={v.clinicTitle} i={i} />
									</li>
								);
							}
							if (v?.status === 'upcoming') {
								return (
									<li key={v.id} className="grid aspect-square place-items-center rounded-full border-2 border-dashed border-(--r-teal) p-2 text-center">
										<span className="text-[0.7rem] leading-tight text-(--r-teal)">
											<span className="r-brush block text-lg leading-none">Stamp waiting</span>
											{kidsDate(v.startsAt, timeZone, 'short')}
										</span>
									</li>
								);
							}
							return <li key={`empty-${i}`} aria-hidden className="aspect-square rounded-full border-2 border-dotted border-(--r-ink)/15" />;
						})}
					</ul>
					<div className="mt-5 flex flex-wrap items-center justify-between gap-3">
						<p className="text-sm text-(--r-ink-soft)">{upcoming.length > 0 ? 'Your next stamp is waiting at the visit.' : 'Every kids visit earns a stamp.'}</p>
						<Link href={bookHref} className="r-tag r-tag-pink text-sm">
							Book a kids visit
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}
