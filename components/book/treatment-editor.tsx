'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { clsx } from 'clsx';
import { formatFee, visitLength, type Department } from '@/lib/catalog';
import type { DentalBooking } from '@/hooks/use-dental-booking';
import { siteConfig } from '@/lib/site-config';

/** Longest visit in the catalogue sets the minutes-bar scale, so bars compare. */
function maxMinutes(flow: DentalBooking): number {
	return Math.max(60, ...flow.treatments.map((t) => Math.round(t.duration / 60)));
}

/**
 * 01 · Treatment: the departments as a numbered index, the treatments as
 * typographic rows with their length drawn on the same kind of scale as the
 * track above.
 */
export function TreatmentEditor({ flow, departments, currency }: { flow: DentalBooking; departments: Department[]; currency: string }) {
	const visible = departments.filter((d) => d.groups.length > 0);
	const active = flow.dept && visible.some((d) => d.slug === flow.dept) ? flow.dept : (flow.treatment?.department ?? visible[0]?.slug ?? null);
	const rows = useMemo(() => flow.treatments.filter((t) => t.department === active), [flow.treatments, active]);
	const scale = maxMinutes(flow);

	return (
		<div>
			<div role="tablist" aria-label="Departments" className="no-scrollbar -mx-5 flex gap-0 overflow-x-auto border-b border-line px-5 sm:mx-0 sm:px-0">
				{visible.map((d) => {
					const on = d.slug === active;
					return (
						<button
							key={d.slug}
							type="button"
							role="tab"
							aria-selected={on}
							onClick={() => flow.setDept(d.slug)}
							className={clsx(
								'-mb-px flex shrink-0 items-baseline gap-2 border-b-2 px-3 pt-2 pb-3 text-[14px] transition-colors',
								on ? 'border-ink text-ink' : 'border-transparent text-ink-2 hover:text-ink',
							)}
						>
							<span className="t-anno text-ink-3">{d.index}</span>
							{d.short || d.title}
						</button>
					);
				})}
			</div>

			<ul className="mt-2" role="tabpanel">
				{rows.map((t) => {
					const on = flow.treatment?.slug === t.slug;
					const minutes = Math.round(t.duration / 60);
					return (
						<li key={t.slug} data-kind={t.kind ?? undefined}>
							<button
								type="button"
								aria-pressed={on}
								onClick={() => flow.chooseTreatment(t.slug)}
								className="row-btn grid-cols-[1fr_auto] items-center gap-x-6 gap-y-2 px-1 py-4 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_auto] sm:px-3"
							>
								<span className="min-w-0">
									<span className="block text-[17px] leading-snug text-ink">
										{t.groupTitle}
										{t.option ? <span className="text-ink-2"> · {t.option}</span> : null}
									</span>
									{t.note || t.description ? <span className="mt-1 line-clamp-1 block text-[13.5px] text-ink-2">{t.note ?? t.description}</span> : null}
								</span>
								<span className="col-span-2 flex items-center gap-3 sm:col-span-1">
									<span className="minutes-bar" style={{ width: `${(minutes / scale) * 100}%` }} aria-hidden />
									<span className="t-anno shrink-0 text-ink-2">{visitLength(t.duration)}</span>
								</span>
								<span className="row-start-1 col-start-2 text-right font-display text-[22px] leading-none text-ink tabular-nums sm:row-auto sm:col-auto">
									{formatFee(t.price, currency)}
								</span>
							</button>
						</li>
					);
				})}
			</ul>

			<p className="mt-6 text-[13.5px] text-ink-2">
				Not sure what you need?{' '}
				<Link href="/smile-check" className="text-lagoon underline decoration-lagoon/30 underline-offset-4 hover:decoration-lagoon">
					Tap the tooth that bothers you
				</Link>{' '}
				and we&rsquo;ll suggest a visit. {siteConfig.emergency.short}
			</p>
		</div>
	);
}
