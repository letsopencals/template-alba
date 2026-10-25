'use client';

import { clsx } from 'clsx';
import { useHydrated } from '@/hooks/use-hydrated';
import { icsHref } from '@/lib/calendar';
import { siteConfig } from '@/lib/site-config';

const month = (ms: number, o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('en-GB', { timeZone: siteConfig.timezone, ...o }).format(ms);

/**
 * "Pencil in your 6-month check-up". The book only opens a few weeks ahead, so
 * this pencils a reminder into the patient's calendar on the due date, with a
 * link straight back to the chair planner (same studio, same clinician).
 */
export function RecallPlate({ recall, studio, className }: { recall: { label: string; href: string; due: number }; studio: string | null; className?: string }) {
	const hydrated = useHydrated();
	if (!hydrated) return <div className={clsx('h-[220px]', className)} aria-hidden />;

	const now = Date.now();
	const months: { key: string; at: number; due: boolean }[] = [];
	const d = new Date(now);
	d.setDate(1);
	const dueKey = month(recall.due, { month: 'numeric', year: 'numeric' });
	for (let i = 0; i < 9; i++) {
		const at = d.getTime();
		const key = month(at, { month: 'numeric', year: 'numeric' });
		months.push({ key, at, due: key === dueKey });
		d.setMonth(d.getMonth() + 1);
	}
	const url = typeof window !== 'undefined' ? new URL(recall.href, window.location.origin).toString() : recall.href;
	const reminder = icsHref([
		{
			uid: `recall-${recall.due}`,
			title: `${recall.label} due · ${siteConfig.name}`,
			start: recall.due,
			end: recall.due + 30 * 60_000,
			description: `Time for your ${recall.label.toLowerCase()}${studio ? ` at ${studio}` : ''}. Book it here: ${url}`,
		},
	]);

	return (
		<section aria-labelledby="recall-title" className={clsx('grid gap-8 border-y border-line py-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.25fr)] lg:items-center lg:gap-16', className)}>
			<div>
				<p className="t-anno">Next, in {Math.round((recall.due - now) / (30.4 * 86_400_000))} months</p>
				<h2 id="recall-title" className="t-md mt-3 text-ink">
					Pencil in your <em>{recall.label.toLowerCase()}.</em>
				</h2>
				<p className="mt-3 max-w-[44ch] text-[14.5px] leading-relaxed text-ink-2">
					Due around {month(recall.due, { day: 'numeric', month: 'long', year: 'numeric' })}. We&rsquo;ll put a note in your calendar that links straight back here{studio ? `, set for ${studio}` : ''}.
				</p>
				<a href={reminder} download="alba-recall.ics" className="link-hair mt-5 inline-block text-[14.5px] text-lagoon">
					Pencil it into my calendar
				</a>
			</div>

			<ol className="grid grid-cols-9 gap-[3px]" aria-label="The next nine months">
				{months.map((m, i) => (
					<li
						key={m.key}
						className={clsx(
							'relative flex h-28 flex-col justify-between rounded-[4px] border px-1 py-2 text-center',
							m.due ? 'border-ink bg-mint' : i === 0 ? 'border-line-2 bg-enamel' : 'border-line bg-transparent',
						)}
					>
						<span className="t-anno !text-[9px]">{month(m.at, { month: 'short' })}</span>
						{m.due ? <span className="font-display text-[24px] leading-none text-lagoon">due</span> : i === 0 ? <span className="t-anno !text-[8.5px] !text-lagoon">now</span> : <span />}
						<span className="t-anno !text-[8px] !text-ink-4">{month(m.at, { year: '2-digit' })}</span>
					</li>
				))}
			</ol>
		</section>
	);
}
