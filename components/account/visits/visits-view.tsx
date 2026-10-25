'use client';

import { useMemo, useState } from 'react';
import { useNow } from '@/hooks/use-now';
import { EmptyState, LoadError } from '@/components/account/empty-state';
import { ListSkeleton } from '@/components/account/skeletons';
import { useCareRecord, useFilteredCare, usePersonFilter } from '@/components/account/use-care';
import { isUpcoming } from '@/components/account/care-utils';
import { HistoryTimeline } from '@/components/account/smile/history-timeline';

type StatusFilter = 'all' | 'upcoming' | 'past' | 'canceled';
const FILTERS: { key: StatusFilter; label: string }[] = [
	{ key: 'all', label: 'All' },
	{ key: 'upcoming', label: 'Booked' },
	{ key: 'past', label: 'Seen' },
	{ key: 'canceled', label: 'Cancelled' },
];

/** Every visit down the history rule, filtered by status. */
export function VisitsView() {
	const now = useNow();
	const nowMs = now?.getTime() ?? null;
	const { visits, all, people, person, isLoading, error, truncated } = useFilteredCare();
	const { mutate } = useCareRecord();
	const { hrefWith } = usePersonFilter();
	const [status, setStatus] = useState<StatusFilter>('all');

	const shown = useMemo(() => {
		if (!nowMs) return [];
		return visits.filter((v) => {
			if (status === 'all') return true;
			if (status === 'canceled') return v.status === 'canceled';
			if (status === 'upcoming') return isUpcoming(v, nowMs);
			return v.status !== 'canceled' && !isUpcoming(v, nowMs);
		});
	}, [visits, status, nowMs]);

	if (error && !all.length) return <LoadError what="your visits" onRetry={() => void mutate()} />;
	if (isLoading || !nowMs) return <ListSkeleton />;
	if (!all.length) return <EmptyState title="No visits yet." body="Every visit lands here, booked ones above today's mark and past ones below, with notes and receipts." href="/book" cta="Open the chair planner" />;

	return (
		<div className="max-w-[860px]">
			<div className="switch mb-8" role="group" aria-label="Show">
				{FILTERS.map((f) => (
					<button key={f.key} type="button" aria-pressed={status === f.key} onClick={() => setStatus(f.key)}>
						{f.label}
					</button>
				))}
			</div>
			{shown.length ? (
				<HistoryTimeline visits={shown} nowMs={nowMs} hrefFor={(id) => hrefWith(`/account/appointments/${id}`)} showPerson={!person && people.length > 1} />
			) : (
				<p className="border-y border-line py-8 text-center text-[14px] text-ink-2">Nothing here with this filter.</p>
			)}
			{truncated ? <p className="t-anno mt-10 text-center">Your 30 most recent visits. For older records, call the patient line.</p> : null}
		</div>
	);
}
