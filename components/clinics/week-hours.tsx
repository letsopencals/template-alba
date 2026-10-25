'use client';

import { clsx } from 'clsx';
import { useNow } from '@/hooks/use-now';
import { formatClock, parseOpeningHours, WEEK_ORDER } from '@/lib/opening-hours';
import { wallClock } from '@/lib/studio-status';

/** The week's hours as a ruled table; today's row lights up after hydration (studio clock). */
export function WeekHours({ hours, className }: { hours: string; className?: string }) {
	const now = useNow(300_000);
	const today = now ? wallClock(now).getDay() : -1;
	const week = parseOpeningHours(hours);
	return (
		<table className={clsx('w-full text-[14px]', className)}>
			<caption className="sr-only">Opening hours</caption>
			<tbody>
				{WEEK_ORDER.map((d) => {
					const day = week[d]!;
					const on = d === today;
					return (
						<tr key={d} className={clsx('border-b border-line', on && 'bg-mint/40')}>
							<th scope="row" className={clsx('py-2 pl-2 text-left font-normal', on ? 'text-ink' : 'text-ink-2')}>
								<span className="t-anno mr-3 !text-[9.5px]">{day.short}</span>
								{on ? <span className="t-anno !text-mint-3">Today</span> : null}
							</th>
							<td className={clsx('t-num py-2 pr-2 text-right text-[12px]', day.open === null ? 'text-ink-4' : 'text-ink')}>
								{day.open !== null && day.close !== null ? `${formatClock(day.open)} – ${formatClock(day.close)}` : 'Closed'}
							</td>
						</tr>
					);
				})}
			</tbody>
		</table>
	);
}
