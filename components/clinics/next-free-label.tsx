'use client';

import { useHydrated } from '@/hooks/use-hydrated';
import { nextFreeLabel } from '@/lib/when';
import { siteConfig } from '@/lib/site-config';
import { Flap } from '@/components/light/flap';

/** A next-free value from `useNextFree`: "Today 16:15" (flaps when it changes), "—" when none, "· · ·" while loading. */
export function NextFreeLabel({ at, className }: { at: number | null | undefined; className?: string }) {
	const hydrated = useHydrated();
	if (!hydrated || at === undefined) return <span className={`t-num tracking-[0.3em] opacity-40 ${className ?? ''}`}>···</span>;
	if (at === null) return <span className={`t-num opacity-50 ${className ?? ''}`}>—</span>;
	return <Flap value={nextFreeLabel(at, siteConfig.timezone)} className={`t-num ${className ?? ''}`} />;
}
