'use client';

import { useEffect, useRef } from 'react';
import { useReducedMotion } from '@/components/light/use-reduced-motion';
import { siteConfig } from '@/lib/site-config';

/*
 * First light: the reception film, full-bleed, opening like an aperture as it
 * scrolls in, with the four promises set across the bottom like a chart
 * legend. The video plays muted and loops; with reduced motion only the poster
 * shows.
 */
export function LightPlate() {
	const ref = useRef<HTMLVideoElement>(null);
	const reduce = useReducedMotion();
	useEffect(() => {
		const v = ref.current;
		if (!v) return;
		if (reduce) {
			v.pause();
			return;
		}
		v.muted = true;
		void v.play().catch(() => {});
	}, [reduce]);
	return (
		<section className="plate-dark relative" aria-label="Inside Alba">
			<div className="aperture relative h-[78svh] min-h-[460px] overflow-hidden bg-night">
				<video
					ref={ref}
					className="develop absolute inset-0 h-full w-full object-cover"
					src="/videos/hero.mp4"
					poster="/videos/hero-poster.jpg"
					muted
					loop
					playsInline
					preload="metadata"
					aria-hidden
				/>
				<div aria-hidden className="absolute inset-0 bg-[linear-gradient(to_top,rgba(6,26,28,0.85),rgba(6,26,28,0.1)_45%,rgba(6,26,28,0)_70%)]" />
				<div className="frame absolute inset-x-0 top-0 flex items-center justify-between pt-6">
					<p className="t-anno !text-enamel/75">Alba Marylebone · 08:00 · first light</p>
					<p className="t-anno hidden !text-enamel/75 sm:block">Plate 02</p>
				</div>
				<div className="frame absolute inset-x-0 bottom-0 pb-8 lg:pb-12">
					<p className="t-xl max-w-[16ch] text-enamel">
						Light rooms. <em>Unhurried</em> hands.
					</p>
					<ol className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-white/20 pt-5 lg:grid-cols-4">
						{siteConfig.trust.map((t, i) => (
							<li key={t.title} className="text-enamel">
								<span className="t-num text-[10.5px] text-mint">{String(i + 1).padStart(2, '0')}</span>
								<p className="mt-1.5 text-[15px] font-medium">{t.title}</p>
								<p className="mt-1 hidden text-[13px] leading-snug text-enamel/70 sm:block">{t.body}</p>
							</li>
						))}
					</ol>
				</div>
			</div>
		</section>
	);
}
