'use client';

import { useMemo } from 'react';
import { clsx } from 'clsx';
import { Button } from '@/components/ui/button';
import { useHydrated } from '@/hooks/use-hydrated';
import { localDate } from '@/lib/slots';
import { localMinutes, nextFreeLabel, timeLabel } from '@/lib/when';
import type { DentalBooking } from '@/hooks/use-dental-booking';
import { Face } from './face';

const DAYS = 28;
const RULER_FROM = 7 * 60;
const RULER_TO = 20 * 60;

const weekday = (ms: number, timeZone: string) => new Intl.DateTimeFormat('en-GB', { timeZone, weekday: 'short' }).format(ms);
const dayNum = (ms: number, timeZone: string) => new Intl.DateTimeFormat('en-GB', { timeZone, day: 'numeric' }).format(ms);
const monthShort = (ms: number, timeZone: string) => new Intl.DateTimeFormat('en-GB', { timeZone, month: 'short' }).format(ms);

/**
 * 04 · Time. The light strip: the next four weeks as columns that glow with
 * how many chairs are free that day. A day lays its starts on a 07:00–20:00
 * ruler as lit ticks, with the times themselves below.
 */
export function TimeEditor({ flow }: { flow: DentalBooking }) {
	const hydrated = useHydrated();
	const tz = flow.timeZone;

	const strip = useMemo(() => {
		if (!hydrated) return [];
		const now = Date.now();
		const seen = new Set<string>();
		const out: { key: string; at: number; count: number }[] = [];
		for (let i = 0; out.length < DAYS && i < DAYS + 3; i++) {
			const at = now + i * 86_400_000;
			const key = localDate(at, tz);
			if (seen.has(key)) continue;
			seen.add(key);
			out.push({ key, at, count: flow.days.get(key)?.length ?? 0 });
		}
		return out;
	}, [hydrated, flow.days, tz]);
	const max = Math.max(1, ...strip.map((d) => d.count));

	if (!flow.location) return <p className="py-8 text-[15px] text-ink-2">Pick a studio first; its free chairs show here.</p>;
	if (!hydrated || (flow.availabilityLoading && flow.starts.length === 0)) return <StripSkeleton />;
	if (flow.starts.length === 0) {
		return (
			<p className="border-y border-line py-8 text-[15px] text-ink-2">
				No free chair for this visit in the next four weeks{flow.staffPick && flow.staffPick !== 'any' ? ' with this clinician. Try “First available”.' : '. Try another studio on the line.'}
			</p>
		);
	}

	const dayStarts = flow.activeDay ? (flow.days.get(flow.activeDay) ?? []) : [];
	const groups = [
		{ name: 'Morning', list: dayStarts.filter((s) => localMinutes(s.at, tz) < 12 * 60) },
		{ name: 'Afternoon', list: dayStarts.filter((s) => localMinutes(s.at, tz) >= 12 * 60 && localMinutes(s.at, tz) < 17 * 60) },
		{ name: 'Evening', list: dayStarts.filter((s) => localMinutes(s.at, tz) >= 17 * 60) },
	].filter((g) => g.list.length > 0);
	const choosing = flow.staffPick === 'any' && !!flow.selected && flow.freeAtStart.length > 1;

	return (
		<div>
			<div className="mb-4 flex flex-wrap items-center justify-between gap-3">
				<p className="text-[15px] text-ink-2">Brighter days have more free chairs.</p>
				<button type="button" onClick={flow.pickSoonest} className="t-anno text-lagoon hover:text-ink">
					Soonest: {nextFreeLabel(flow.starts[0]!.at, tz)} →
				</button>
			</div>

			<div className="no-scrollbar -mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
				<div className="grid min-w-[760px] grid-cols-[repeat(28,minmax(0,1fr))] gap-[3px]" role="group" aria-label="Days">
					{strip.map((d, i) => {
						const on = flow.activeDay === d.key;
						const first = i === 0 || dayNum(d.at, tz) === '1';
						return (
							<button
								key={d.key}
								type="button"
								disabled={d.count === 0}
								aria-pressed={on}
								aria-label={`${weekday(d.at, tz)} ${dayNum(d.at, tz)} ${monthShort(d.at, tz)}, ${d.count} free`}
								onClick={() => flow.chooseDay(d.key)}
								className="day-cell flex h-[92px] flex-col items-center justify-between rounded-[4px] py-2"
								style={{ ['--glow' as string]: d.count === 0 ? 0 : 0.25 + 0.75 * (d.count / max) }}
							>
								<span className="t-anno text-[9px] opacity-70">{weekday(d.at, tz).slice(0, 2)}</span>
								<span className="font-display text-[22px] leading-none tabular-nums">{dayNum(d.at, tz)}</span>
								<span className="t-anno text-[8.5px] opacity-60">{first ? monthShort(d.at, tz) : ' '}</span>
							</button>
						);
					})}
				</div>
			</div>

			{flow.activeDay ? (
				<div className="swap-in mt-8" key={flow.activeDay}>
					<div className="day-ruler" style={{ ['--hours' as string]: (RULER_TO - RULER_FROM) / 60 }} aria-hidden>
						{dayStarts.map((s) => {
							const m = localMinutes(s.at, tz);
							if (m < RULER_FROM || m > RULER_TO) return null;
							return <span key={s.at} className="day-tick" data-on={flow.selected?.at === s.at} style={{ left: `${((m - RULER_FROM) / (RULER_TO - RULER_FROM)) * 100}%` }} />;
						})}
					</div>
					<div className="t-anno mt-1 flex justify-between text-[9px] text-ink-3" aria-hidden>
						{[7, 9, 11, 13, 15, 17, 19].map((h) => (
							<span key={h}>{String(h).padStart(2, '0')}:00</span>
						))}
					</div>

					<div className="mt-6 grid gap-6 md:grid-cols-3">
						{groups.map((g) => (
							<div key={g.name}>
								<p className="t-anno mb-2 text-ink-3">{g.name}</p>
								<div className="grid grid-cols-4 gap-1.5 md:grid-cols-3 lg:grid-cols-4">
									{g.list.map((s) => (
										<button key={s.at} type="button" aria-pressed={flow.selected?.at === s.at} onClick={() => flow.chooseStart(s.at)} className="time-chip">
											{timeLabel(s.at, tz)}
										</button>
									))}
								</div>
							</div>
						))}
					</div>
				</div>
			) : (
				<p className="mt-6 text-[14px] text-ink-2">Choose a day to see its times.</p>
			)}

			{choosing ? (
				<div className="swap-in mt-8 border-t border-line pt-6">
					<p className="text-[15px] text-ink">
						{flow.freeAtStart.length} clinicians are free at {timeLabel(flow.selected!.at, tz)}. Anyone in particular?
					</p>
					<div className="mt-4 flex flex-wrap gap-3">
						{flow.freeAtStart.map((id) => {
							const c = flow.cliniciansById.get(id);
							if (!c) return null;
							const on = flow.finalStaffId === id;
							return (
								<button
									key={id}
									type="button"
									aria-pressed={on}
									onClick={() => flow.setPickedStaff(id)}
									className={clsx('flex items-center gap-3 rounded-[6px] border py-1.5 pr-4 pl-1.5 text-left transition-colors', on ? 'border-ink bg-ink text-porcelain' : 'border-line-2 hover:border-lagoon')}
								>
									<Face name={c.name} src={c.imageUrl} className="h-11 w-9 rounded-[4px] text-[13px]" sizes="36px" />
									<span>
										<span className="block text-[14px]">{c.name}</span>
										<span className={clsx('t-anno block text-[9px]', on ? 'text-mint-2' : 'text-ink-3')}>{c.title}</span>
									</span>
								</button>
							);
						})}
					</div>
					<Button type="button" className="mt-5" onClick={flow.advanceFromTime}>
						Continue with {flow.finalClinician?.name ?? 'this time'}
					</Button>
				</div>
			) : null}
		</div>
	);
}

function StripSkeleton() {
	return (
		<div aria-busy="true" aria-label="Reading the appointment book">
			<div className="grid grid-cols-[repeat(14,minmax(0,1fr))] gap-[3px] sm:grid-cols-[repeat(28,minmax(0,1fr))]">
				{Array.from({ length: 28 }, (_, i) => (
					<span key={i} className={clsx('h-[92px] animate-pulse rounded-[4px] bg-porcelain-2', i >= 14 && 'max-sm:hidden')} />
				))}
			</div>
		</div>
	);
}
