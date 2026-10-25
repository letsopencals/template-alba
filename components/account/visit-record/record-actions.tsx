'use client';

import Link from 'next/link';
import { Button, buttonClasses, ButtonInner } from '@/components/ui/button';
import { icsHref, ICS_FILENAME, googleCalendarHref } from '@/lib/calendar';
import { formatGap, type ChangePolicy } from '@/components/account/appointment-detail/policy';
import { bookHref, toCalendarEvent } from '@/components/account/care-utils';
import type { CareVisit } from '@/components/account/care-types';

/** Change / cancel / calendar for booked visits; book again for past ones. */
export function RecordActions({
	visit,
	upcoming,
	policy,
	onReschedule,
	onCancel,
}: {
	visit: CareVisit;
	upcoming: boolean;
	policy: ChangePolicy;
	onReschedule: () => void;
	onCancel: () => void;
}) {
	const again = bookHref(visit.product.slug, { staff: visit.clinician?.slug, forChild: visit.patient.visitFor === 'child' });

	if (!upcoming) {
		return (
			<section aria-label="Next steps" className="border-y border-line py-6">
				<p className="t-anno">{visit.status === 'canceled' ? 'Still need it?' : 'Coming back?'}</p>
				<p className="mt-2 text-[14.5px] text-ink-2">
					{visit.clinician ? `Same visit with ${visit.clinician.firstName || visit.clinician.name}, at a time that suits you.` : 'The same visit, at a time that suits you.'}
				</p>
				<Link href={again} className={buttonClasses({ className: 'mt-5' })}>
					<ButtonInner>{visit.status === 'canceled' ? 'Book it again' : 'Book a follow-up'}</ButtonInner>
				</Link>
			</section>
		);
	}

	const event = toCalendarEvent(visit);
	const locked = visit.status === 'scheduled' && (!policy.canReschedule || !policy.canCancel);
	return (
		<section aria-label="Manage this visit" className="border-y border-line py-6">
			<p className="t-anno">Manage</p>
			<div className="mt-4 flex flex-wrap gap-3">
				{policy.canReschedule ? <Button onClick={onReschedule}>Move it</Button> : null}
				<a href={icsHref([event])} download={ICS_FILENAME} className={buttonClasses({ variant: 'line' })}>
					<ButtonInner variant="line" cell={false}>
						Add to calendar
					</ButtonInner>
				</a>
			</div>
			<div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2">
				<a href={googleCalendarHref(event)} target="_blank" rel="noopener noreferrer" className="link-hair text-[13.5px] text-ink-2">
					Google Calendar
				</a>
				{policy.canCancel ? (
					<button type="button" onClick={onCancel} className="link-hair text-[13.5px] text-ink-2 hover:text-signal">
						Cancel this visit
					</button>
				) : null}
			</div>
			{locked ? (
				<p className="mt-5 border-t border-line pt-4 text-[12.5px] leading-relaxed text-ink-3">
					{policy.canReschedule || policy.canCancel ? null : 'Online changes have closed for this visit. '}
					{!policy.canCancel && policy.cancelGap ? `Cancellations close ${formatGap(policy.cancelGap)} before the start. ` : null}
					{!policy.canReschedule && policy.rescheduleGap ? `Moves close ${formatGap(policy.rescheduleGap)} before. ` : null}
					Call the patient line if something has come up.
				</p>
			) : null}
		</section>
	);
}
