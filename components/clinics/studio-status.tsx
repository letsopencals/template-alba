'use client';

import { clsx } from 'clsx';
import { useNow } from '@/hooks/use-now';
import { openLine, studioOpenState, todaysHours } from '@/lib/studio-status';

/** "● Open until 19:00 · 08:00–19:00 today" in the studio's clock; neutral until hydrated. */
export function StudioStatus({ slug, className, showHours = true }: { slug: string; className?: string; showHours?: boolean }) {
	const now = useNow(60_000);
	const line = now ? openLine(studioOpenState(slug, now)) : null;
	return (
		<span className={clsx('inline-flex items-center gap-2 text-[13px]', className)}>
			<span className="status-light" data-state={line?.tone ?? 'closed'} aria-hidden />
			<span>{line?.text ?? 'Opening hours'}</span>
			{showHours && now && todaysHours(slug, now) !== 'Closed' ? <span className="t-num text-[11px] opacity-60">· {todaysHours(slug, now)} today</span> : null}
		</span>
	);
}
