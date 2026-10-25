'use client';

import { useMemo, useRef } from 'react';
import { AlbaLine, type LineStation } from './alba-line';
import { NextFreeLabel } from './next-free-label';
import { useNextFree } from '@/hooks/use-next-free';
import { useInView } from '@/hooks/use-in-view';
import { useNow } from '@/hooks/use-now';
import { studioOpenState } from '@/lib/studio-status';
import type { Studio, VideoStudio } from '@/lib/studios-server';

/**
 * The Alba Line with live annotations: each station's open/closed light and
 * its next free check-up (one cached availability read per studio, loaded when
 * the line scrolls into view). Stations link to the studio pages.
 */
export function LineBoard({ studios, video, tone = 'light', className, selected }: { studios: Studio[]; video: VideoStudio | null; tone?: 'light' | 'dark'; className?: string; selected?: string }) {
	const ref = useRef<HTMLDivElement>(null);
	const inView = useInView(ref);
	const now = useNow(60_000);
	const pairs = useMemo(() => studios.filter((s) => s.probe.checkup).map((s) => ({ variantId: s.probe.checkup!, locationId: s.id })), [studios]);
	const free = useNextFree(pairs, inView);

	const stations: LineStation[] = studios.map((s) => {
		const state = now ? studioOpenState(s.slug, now) : null;
		return {
			slug: s.slug,
			title: s.title,
			area: s.area,
			lat: s.lat,
			lng: s.lng,
			kids: s.kids,
			href: `/clinics/${s.slug}`,
			status: state ? (state.kind === 'open' ? 'open' : state.kind === 'later' ? 'soon' : 'closed') : null,
			note: s.probe.checkup ? (
				<span className="inline-flex items-baseline gap-1.5">
					<span className="t-anno !text-[9px]">Next</span>
					<NextFreeLabel at={free ? free[`${s.probe.checkup}:${s.id}`] : undefined} className="text-[12px]" />
				</span>
			) : null,
		};
	});

	return (
		<div ref={ref} className={className}>
			<AlbaLine
				stations={stations}
				selected={selected}
				tone={tone}
				video={video ? { label: 'Alba Video', note: 'Free 20-min consults', href: '/treatments/video-consultations' } : null}
			/>
		</div>
	);
}
