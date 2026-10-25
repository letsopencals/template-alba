'use client';

import Link from 'next/link';
import { clsx } from 'clsx';
import { Face } from '@/components/book/face';
import { siteConfig } from '@/lib/site-config';
import { isUpcoming, personLabel } from '@/components/account/care-utils';
import type { CareVisit } from '@/components/account/care-types';

const tz = siteConfig.timezone;
const f = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('en-GB', { timeZone: tz, ...o });
const MONTH = f({ month: 'long', year: 'numeric' });
const DAY = f({ day: 'numeric' });
const WEEKDAY = f({ weekday: 'short' });
const TIME = f({ hour: '2-digit', minute: '2-digit', hour12: false });

const STATUS: Record<string, { label: string; tone: string }> = {
	upcoming: { label: 'Booked', tone: 'bg-mint text-mint-3' },
	completed: { label: 'Done', tone: 'bg-porcelain-2 text-ink-2' },
	canceled: { label: 'Cancelled', tone: 'bg-signal-wash text-signal' },
	past: { label: 'Seen', tone: 'bg-porcelain-2 text-ink-2' },
};

/**
 * The patient's history down a single rule: month labels in the margin, each
 * visit a row with its day in serif numerals. A "today" mark divides what's
 * booked from what's been.
 */
export function HistoryTimeline({ visits, nowMs, hrefFor, showPerson, limit }: { visits: CareVisit[]; nowMs: number; hrefFor: (id: string) => string; showPerson: boolean; limit?: number }) {
	const sorted = [...visits].sort((a, b) => b.from.localeCompare(a.from));
	const list = limit ? sorted.slice(0, limit) : sorted;
	let lastMonth = '';
	let todayDrawn = false;
	return (
		<ol className="relative border-l border-line-2 pl-0">
			{list.map((v) => {
				const at = Date.parse(v.from);
				const month = MONTH.format(at);
				const showMonth = month !== lastMonth;
				lastMonth = month;
				const upcoming = isUpcoming(v, nowMs);
				const drawToday = !todayDrawn && !upcoming;
				if (drawToday) todayDrawn = true;
				const status = upcoming ? STATUS.upcoming! : v.status === 'canceled' ? STATUS.canceled! : v.status === 'completed' ? STATUS.completed! : STATUS.past!;
				return (
					<li key={v.id}>
						{drawToday ? (
							<div className="relative -ml-px flex items-center gap-3 py-3 pl-5" aria-label="Today">
								<span aria-hidden className="absolute left-[-5px] h-[9px] w-[9px] rounded-full bg-brass" />
								<span className="t-anno !text-brass">Today</span>
								<span className="hair-brass flex-1" aria-hidden />
							</div>
						) : null}
						{showMonth ? <p className="t-anno pt-5 pb-2 pl-5">{month}</p> : null}
						<Link
							href={hrefFor(v.id)}
							className={clsx('group relative grid grid-cols-[52px_1fr_auto] items-center gap-4 py-3 pr-2 pl-5 transition-colors hover:bg-enamel', v.status === 'canceled' && 'opacity-60')}
						>
							<span aria-hidden className={clsx('absolute left-[-4px] h-[7px] w-[7px] rounded-full', upcoming ? 'bg-lagoon-3' : 'bg-ink-4')} />
							<span className="text-center">
								<span className="block font-display text-[30px] leading-none tabular-nums text-ink">{DAY.format(at)}</span>
								<span className="t-anno block !text-[9px]">{WEEKDAY.format(at)}</span>
							</span>
							<span className="flex min-w-0 items-center gap-3">
								{v.clinician ? <Face name={v.clinician.name} src={v.clinician.imageUrl} className="h-11 w-9 shrink-0 rounded-[3px] text-[12px]" sizes="36px" /> : null}
								<span className="min-w-0">
									<span className="block truncate text-[15.5px] text-ink group-hover:text-lagoon">
										{v.product.title}
										{v.product.variantTitle ? <span className="text-ink-2"> · {v.product.variantTitle}</span> : null}
									</span>
									<span className="t-anno mt-0.5 block truncate">
										{TIME.format(at)} · {v.video ? 'Video' : (v.place?.title ?? '').replace(/^Alba\s+/i, '')}
										{v.clinician ? ` · ${v.clinician.name}` : ''}
										{showPerson ? ` · ${personLabel(v)}` : ''}
									</span>
								</span>
							</span>
							<span className={clsx('t-anno rounded-[3px] px-1.5 py-0.5 !text-[9px]', status.tone)}>{status.label}</span>
						</Link>
					</li>
				);
			})}
		</ol>
	);
}
