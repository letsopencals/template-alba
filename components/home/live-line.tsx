'use client';

import { useMemo } from 'react';
import { useNow } from '@/hooks/use-now';
import { useNextFree } from '@/hooks/use-next-free';
import { studioOpenState } from '@/lib/studio-status';
import { NextFreeLabel } from '@/components/clinics/next-free-label';
import type { Studio } from '@/lib/studios-server';

/**
 * The hero's one live sentence: how many studios are open right now and the
 * soonest check-up anywhere. Shares its availability reads (same SWR key) with
 * the Today board further down.
 */
export function LiveLine({ studios }: { studios: Studio[] }) {
	const now = useNow(60_000);
	const pairs = useMemo(() => studios.filter((s) => s.probe.checkup).map((s) => ({ variantId: s.probe.checkup!, locationId: s.id })), [studios]);
	const free = useNextFree(pairs, true);
	const open = now ? studios.filter((s) => studioOpenState(s.slug, now).kind === 'open').length : null;
	let soonest: { at: number; studio: string } | null = null;
	if (free)
		for (const s of studios) {
			const at = s.probe.checkup ? free[`${s.probe.checkup}:${s.id}`] : null;
			if (at != null && (!soonest || at < soonest.at)) soonest = { at, studio: s.short };
		}
	return (
		<p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13.5px] text-ink-2">
			<span className="status-light" data-state={open ? 'open' : 'closed'} aria-hidden />
			<span>{open == null ? 'Five studios across London' : open ? `${open} of ${studios.length} studios open now` : 'All studios closed right now'}</span>
			<span aria-hidden className="hidden text-ink-4 sm:inline">/</span>
			<span className="flex basis-full flex-wrap items-baseline gap-x-2 sm:basis-auto">
				<span className="t-anno">Next check-up</span>
				<NextFreeLabel at={free ? (soonest?.at ?? null) : undefined} className="text-[12.5px] text-ink" />
				{soonest ? <span className="text-ink-3">at {soonest.studio}</span> : null}
			</span>
		</p>
	);
}
