'use client';

import { memo } from 'react';
import { clsx } from 'clsx';
import moment from 'moment-timezone';

export const RIBBON_DAYS = 28;

/** `YYYY-MM-DD` days from today in `timezone`. */
export function ribbonDays(timezone: string, nowMs: number): string[] {
	const start = moment.tz(nowMs, timezone).startOf('day');
	return Array.from({ length: RIBBON_DAYS }, (_, i) => start.clone().add(i, 'day').format('YYYY-MM-DD'));
}

/** Horizontal strip of days for the reschedule dialog. */
export const DayRibbon = memo(function DayRibbon({
	days,
	value,
	onChange,
	currentDay,
}: {
	days: string[];
	value: string;
	onChange: (day: string) => void;
	/** The visit's current day (marked with a brass dot). */
	currentDay: string | null;
}) {
	return (
		<div role="radiogroup" aria-label="Choose a day" className="-mx-1 flex snap-x gap-2 overflow-x-auto px-1 pt-1 pb-3">
			{days.map((d) => {
				const m = moment(d, 'YYYY-MM-DD');
				const active = d === value;
				return (
					<button
						key={d}
						type="button"
						role="radio"
						aria-checked={active}
						aria-label={m.format('dddd D MMMM')}
						onClick={() => onChange(d)}
						className={clsx(
							'relative flex h-[4.5rem] w-14 shrink-0 snap-start flex-col items-center justify-center rounded-[6px] border text-center transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lagoon',
							active ? 'border-lagoon bg-lagoon text-enamel shadow-[var(--shadow-enamel)]' : 'border-line bg-enamel text-ink hover:border-lagoon/50',
						)}
					>
						<span className={clsx('text-[10px] font-semibold tracking-[0.14em] uppercase', active ? 'text-white/75' : 'text-ink-3')}>{m.format('ddd')}</span>
						<span className="font-display text-xl leading-tight">{m.format('D')}</span>
						<span className={clsx('text-[10px]', active ? 'text-white/75' : 'text-ink-2')}>{m.format('MMM')}</span>
						{d === currentDay ? <span aria-hidden className={clsx('absolute top-1.5 right-1.5 size-1.5 rounded-full', active ? 'bg-enamel' : 'bg-brass')} /> : null}
					</button>
				);
			})}
		</div>
	);
});
