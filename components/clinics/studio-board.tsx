'use client';

import Link from 'next/link';
import { useMemo, useRef } from 'react';
import { useNextFree } from '@/hooks/use-next-free';
import { useInView } from '@/hooks/use-in-view';
import { bookHref } from '@/lib/catalog';
import { NextFreeLabel } from './next-free-label';

/**
 * A studio's departure board: the next free start for a few headline
 * treatments at this studio (one cached read each, loaded in view), each row
 * deep-linking into /book with the studio and treatment set.
 */
export interface BoardRow {
	label: string;
	variantId: string;
	variantSlug: string;
}

export function StudioBoard({ rows, locationId, clinic, className }: { rows: BoardRow[]; locationId: string; clinic: string; className?: string }) {
	const ref = useRef<HTMLDivElement>(null);
	const inView = useInView(ref);
	const pairs = useMemo(() => rows.map((r) => ({ variantId: r.variantId, locationId })), [rows, locationId]);
	const free = useNextFree(pairs, inView);
	return (
		<div ref={ref} className={className}>
			<div className="flex items-center justify-between border-b border-line-light pb-3">
				<p className="t-anno">Next free chair</p>
				<p className="t-anno flex items-center gap-2">
					<span className="status-light" aria-hidden /> Live
				</p>
			</div>
			<ul>
				{rows.map((r) => (
					<li key={r.variantId}>
						<Link href={bookHref({ service: r.variantSlug, clinic })} className="group flex items-baseline gap-3 border-b border-line-light py-3.5">
							<span className="text-[15px] group-hover:text-mint">{r.label}</span>
							<span className="leader" aria-hidden />
							<NextFreeLabel at={free ? free[`${r.variantId}:${locationId}`] : undefined} className="text-[13px] text-mint" />
						</Link>
					</li>
				))}
			</ul>
		</div>
	);
}
