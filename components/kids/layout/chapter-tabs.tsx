'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { INK } from '@/components/kids/paper';
import { kidsCopy } from '@/lib/kids/kids-config';

/**
 * The book's index tabs: coloured paper tabs on the right page edge (desktop)
 * or along the bottom edge (phones). The chapter in view is pulled out.
 */
export function ChapterTabs() {
	const [current, setCurrent] = useState<string>('cover');
	const onBook = usePathname() === '/kids';

	useEffect(() => {
		const els = kidsCopy.chapters.map((c) => document.getElementById(c.id)).filter((e): e is HTMLElement => !!e);
		if (els.length === 0 || typeof IntersectionObserver === 'undefined') return;
		const io = new IntersectionObserver(
			(entries) => {
				const seen = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
				if (seen) setCurrent(seen.target.id);
			},
			{ rootMargin: '-35% 0px -55% 0px', threshold: [0, 0.01, 0.25] },
		);
		els.forEach((e) => io.observe(e));
		return () => io.disconnect();
	}, [onBook]);

	if (!onBook) return null;

	return (
		<nav
			aria-label="Chapters"
			className="r-tabs fixed z-50 max-xl:inset-x-0 max-xl:bottom-0 max-xl:flex max-xl:justify-center xl:top-1/2 xl:right-0 xl:-translate-y-1/2"
		>
			<ul className="r-noscrollbar flex gap-1 max-xl:overflow-x-auto max-xl:px-2 xl:flex-col xl:gap-1.5">
				{kidsCopy.chapters.map((c) => (
					<li key={c.id} className="shrink-0">
						<a
							href={`#${c.id}`}
							aria-current={current === c.id ? 'true' : undefined}
							data-tone={c.tone}
							style={{ ['--tab' as string]: c.tone === 'pink' ? '#d62b8a' : INK[c.tone] }}
							className="r-focus text-sm"
						>
							<span className="r-brush grid size-7 place-items-center rounded-full bg-white/25 text-lg leading-none">{c.n}</span>
							<span className="whitespace-nowrap max-xl:text-[0.8rem]">{c.label}</span>
						</a>
					</li>
				))}
			</ul>
		</nav>
	);
}
