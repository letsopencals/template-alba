'use client';

import { useMemo } from 'react';
import { clsx } from 'clsx';
import { useHydrated } from '@/hooks/use-hydrated';
import { nextFreeLabel } from '@/lib/when';
import { studioMeta } from '@/lib/site-config';
import type { DentalBooking, StudioLite } from '@/hooks/use-dental-booking';

const short = (title: string) => title.replace(/^Alba\s+/i, '');

/**
 * 02 · Studio, drawn as the Alba Line: one station per studio offering this
 * treatment, west to east by longitude, each with its next free chair. The
 * "sooner nearby" hint reads like a line notice.
 */
export function StudioEditor({ flow }: { flow: DentalBooking }) {
	const hydrated = useHydrated();
	const stations = useMemo(
		() => [...flow.offeredStudios].sort((a, b) => (a.longitude ?? 0) - (b.longitude ?? 0)),
		[flow.offeredStudios],
	);

	if (flow.isVideo) {
		const n = flow.location ? flow.nextByStudio[flow.location.id] : null;
		return (
			<div className="grid gap-6 border-y border-line py-8 sm:grid-cols-[auto_1fr] sm:items-center">
				<span className="t-anno text-ink-3">Station · Video</span>
				<div>
					<p className="font-display text-[34px] leading-tight text-ink">From wherever you are.</p>
					<p className="mt-2 max-w-[56ch] text-[15px] text-ink-2">
						This consultation happens on video with an Alba dentist. The link arrives by email and opens ten minutes before.
						{hydrated && n ? <span className="ml-1 text-ink">Next free: {nextFreeLabel(n.at, flow.timeZone)}.</span> : null}
					</p>
				</div>
			</div>
		);
	}

	if (!flow.treatment) {
		return <p className="py-8 text-[15px] text-ink-2">Choose a treatment first and the line shows where it&rsquo;s offered.</p>;
	}

	return (
		<div>
			<div className="mb-6 flex flex-wrap items-center justify-between gap-3">
				<p className="text-[15px] text-ink-2">
					{stations.length === 1 ? 'Offered at one studio.' : `Offered at ${stations.length} studios.`} Times are each studio&rsquo;s next free chair for this visit.
				</p>
				<button type="button" onClick={flow.useMyLocation} className="t-anno flex items-center gap-2 text-lagoon hover:text-ink">
					<span aria-hidden className="inline-block h-2 w-2 rounded-full border-2 border-current" />
					{flow.hasNear ? 'Distances from you' : 'Use my location'}
				</button>
			</div>

			{/* Desktop: the line runs across. Phones: it runs down. */}
			<div className="relative max-md:pl-2" role="group" aria-label="Studios">
				<div className="line-rail max-md:!left-[19px] max-md:!right-auto max-md:!top-3 max-md:!bottom-3 max-md:!h-auto max-md:!w-[6px]" aria-hidden />
				<ol className="relative grid gap-y-2 md:gap-x-2" style={{ gridTemplateColumns: `repeat(${stations.length}, minmax(0, 1fr))` }}>
					{stations.map((s) => (
						<Station key={s.id} s={s} flow={flow} hydrated={hydrated} />
					))}
				</ol>
			</div>

			{flow.sooner && hydrated ? (
				<div className="line-notice mt-8" role="status">
					<span className="t-anno text-brass">Line notice</span>
					<p className="text-[14.5px] text-ink">
						{short(flow.sooner.studio.title)} has a chair {nextFreeLabel(flow.sooner.at, flow.timeZone)}, sooner than {flow.location ? short(flow.location.title) : 'your pick'}.
					</p>
					<button type="button" onClick={flow.switchToSooner} className="t-anno whitespace-nowrap text-lagoon underline underline-offset-4 hover:text-ink">
						Take it
					</button>
				</div>
			) : null}
		</div>
	);
}

function Station({ s, flow, hydrated }: { s: StudioLite; flow: DentalBooking; hydrated: boolean }) {
	const on = flow.location?.id === s.id;
	const meta = studioMeta(s.slug);
	const next = flow.nextByStudio[s.id];
	const avail = flow.availabilityFor(s.id);
	const km = flow.distances[s.id];
	return (
		<li className="max-md:!col-span-full">
			<button
				type="button"
				aria-pressed={on}
				onClick={() => flow.chooseStudio(s.slug)}
				className="station group flex w-full items-start gap-4 pt-[14px] text-left md:flex-col md:items-center md:gap-3 md:text-center"
			>
				<span className="station-dot shrink-0" aria-hidden />
				<span className="min-w-0 md:px-1">
					<span className={clsx('block font-display text-[24px] leading-none', on ? 'text-lagoon' : 'text-ink')}>{short(s.title)}</span>
					<span className="t-anno mt-2 block text-ink-3">{meta.area ?? s.addressLines[0]}</span>
					<span className="mt-2 block text-[13.5px] tabular-nums text-ink">
						{!hydrated || (!avail && flow.availabilityLoading) ? (
							<span className="text-ink-3">Reading the book…</span>
						) : next ? (
							<>
								<span className="text-ink-2">Next chair </span>
								{nextFreeLabel(next.at, flow.timeZone)}
							</>
						) : (
							<span className="text-ink-3">Fully booked this month</span>
						)}
					</span>
					<span className="mt-2 flex flex-wrap gap-1.5 md:justify-center">
						{meta.kidsRoom ? <Mark tone="dawn">Kids room</Mark> : null}
						{km != null ? <Mark tone="mist">{km < 10 ? km.toFixed(1) : Math.round(km)} km</Mark> : null}
					</span>
				</span>
			</button>
		</li>
	);
}

function Mark({ tone, children }: { tone: 'dawn' | 'mist'; children: React.ReactNode }) {
	return <span className={clsx('t-anno rounded-[3px] px-1.5 py-0.5 text-[9.5px]', tone === 'dawn' ? 'bg-brass-2 text-brass' : 'bg-porcelain-2 text-ink-2')}>{children}</span>;
}
