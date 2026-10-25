'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useNow } from '@/hooks/use-now';
import { buttonClasses, ButtonInner } from '@/components/ui/button';
import { StickerBook } from '@/components/kids/sticker-book';
import { AppointmentCard } from '@/components/confirmation/appointment-card';
import { cardFromCare } from '@/components/confirmation/card-model';
import { EmptyState, LoadError } from '@/components/account/empty-state';
import { OverviewSkeleton } from '@/components/account/skeletons';
import { useCareRecord, useFilteredCare, usePersonFilter } from '@/components/account/use-care';
import { bookHref, forPerson, isUpcoming, nextVisit, personKey } from '@/components/account/care-utils';
import { RecallRing, ringsOf } from '@/components/account/smile/recall-ring';
import { HistoryTimeline } from '@/components/account/smile/history-timeline';
import { siteConfig } from '@/lib/site-config';
import type { CareVisit } from '@/components/account/care-types';

/**
 * My Smile: the recall ring (when each clock comes round), the next visit as
 * its appointment card, the history down one rule, and for children a stamp
 * passport of their visits.
 */
export function OverviewView() {
	const now = useNow();
	const nowMs = now?.getTime() ?? null;
	const { visits, all, people, person, isLoading, error } = useFilteredCare();
	const { mutate } = useCareRecord();
	const { hrefWith } = usePersonFilter();

	// The ring is per patient: the chosen one, else the account holder.
	const ringPerson = person ?? people[0]?.key ?? null;
	const ringPersonMeta = people.find((p) => p.key === ringPerson);
	const rings = useMemo(() => (nowMs ? ringsOf(forPerson(all, ringPerson), nowMs, ringPersonMeta?.relation === 'child') : []), [all, ringPerson, ringPersonMeta, nowMs]);
	const next = useMemo(() => (nowMs ? nextVisit(visits, nowMs) : null), [visits, nowMs]);
	const children = people.filter((p) => p.relation === 'child' && (!person || p.key === person));

	if (error && !all.length) return <LoadError what="your record" onRetry={() => void mutate()} />;
	if (isLoading || !nowMs) return <OverviewSkeleton />;
	if (!all.length) {
		return <EmptyState title="Your record starts with a visit." body="Book a check-up for yourself or someone in your family and it appears here, with when the next one is due." href="/book" cta="Open the chair planner" />;
	}

	const ringBook = (book: string) => bookHref(book, { forChild: ringPersonMeta?.relation === 'child' });
	return (
		<div className="space-y-20">
			<div className="grid gap-14 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] xl:items-start">
				<div>
					<p className="t-anno mb-6">{ringPersonMeta && ringPersonMeta.relation !== 'self' ? `${ringPersonMeta.label}’s clock` : 'Your clock'}</p>
					<RecallRing rings={rings} bookHrefFor={ringBook} />
				</div>
				<div>
					<p className="t-anno mb-6">Next visit</p>
					{next ? (
						<>
							<AppointmentCard visit={cardFromCare(next)} label={next.patient.visitFor === 'child' ? 'Appointment' : 'Your next appointment'} />
							<div className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
								<Link href={hrefWith(`/account/appointments/${next.id}`)} className="link-hair text-[14px] text-ink">
									Change or cancel
								</Link>
								<Link href={hrefWith(`/account/appointments/${next.id}`)} className="link-hair text-[14px] text-ink">
									What you told us
								</Link>
							</div>
						</>
					) : (
						<div className="porcelain-card flex aspect-[85/55] flex-col items-start justify-end p-8">
							<p className="t-anno">Nothing booked</p>
							<p className="t-md mt-2 text-ink">The card&rsquo;s blank for now.</p>
							<Link href="/book" className={buttonClasses({ className: 'mt-6' })}>
								<ButtonInner>Plan a visit</ButtonInner>
							</Link>
						</div>
					)}
				</div>
			</div>

			<div className="grid gap-14 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
				<section aria-labelledby="history-title">
					<div className="mb-4 flex items-baseline justify-between gap-4">
						<h2 id="history-title" className="t-sm text-ink">
							History
						</h2>
						<Link href={hrefWith('/account/appointments')} className="t-anno !text-lagoon hover:!text-ink">
							All visits →
						</Link>
					</div>
					<HistoryTimeline visits={visits} nowMs={nowMs} hrefFor={(id) => hrefWith(`/account/appointments/${id}`)} showPerson={!person && people.length > 1} limit={8} />
				</section>

				<div className="space-y-12">
					{children.map((child) => (
						<section key={child.key} aria-label={`${child.label}’s stamp passport`}>
							<StickerBook visits={passportVisits(all, child.key, nowMs)} timeZone={siteConfig.timezone} bookHref={bookHref('kids-check-up-junior', { forChild: true })} />
						</section>
					))}
					<section className="enamel p-6">
						<p className="t-anno">Questions about your care</p>
						<p className="mt-3 text-[14.5px] leading-relaxed text-ink-2">
							Call the patient line on{' '}
							<a href={siteConfig.contact.phoneHref} className="link-hair text-ink">
								{siteConfig.contact.phone}
							</a>{' '}
							or email{' '}
							<a href={`mailto:${siteConfig.contact.email}`} className="link-hair text-ink">
								{siteConfig.contact.email}
							</a>
							.
						</p>
						<p className="mt-3 text-[12.5px] leading-relaxed text-ink-3">{siteConfig.emergency.short}</p>
					</section>
				</div>
			</div>
		</div>
	);
}

function passportVisits(all: CareVisit[], key: string, nowMs: number) {
	return all
		.filter((v) => personKey(v) === key)
		.map((v) => ({
			id: v.id,
			title: v.product.title,
			startsAt: v.from,
			status: (v.status === 'canceled' ? 'cancelled' : isUpcoming(v, nowMs) ? 'upcoming' : 'done') as 'upcoming' | 'done' | 'cancelled',
			childName: v.patient.nickname ?? v.patient.name,
			clinicTitle: (v.place?.title ?? siteConfig.name).replace(/^Alba\s+/i, ''),
		}));
}
