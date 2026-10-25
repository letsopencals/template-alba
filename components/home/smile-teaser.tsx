'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { siteConfig } from '@/lib/site-config';
import { useInView } from '@/hooks/use-in-view';
import { useReducedMotion } from '@/components/light/use-reduced-motion';
import { buttonClasses, ButtonInner } from '@/components/ui/button';
import { ArchChart } from '@/components/smile/arch-chart';

/*
 * Smile Check teaser: the chart "reads itself" — a soft light passes tooth by
 * tooth around both arches while the plate is on screen (static under reduced
 * motion) — next to the promise and the way in.
 */
const SWEEP = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28, 38, 37, 36, 35, 34, 33, 32, 31, 41, 42, 43, 44, 45, 46, 47, 48];

export function SmileTeaser() {
	const ref = useRef<HTMLDivElement>(null);
	const inView = useInView(ref, '0px');
	const reduce = useReducedMotion();
	const [step, setStep] = useState(0);
	useEffect(() => {
		if (!inView || reduce) return;
		const id = window.setInterval(() => setStep((s) => (s + 1) % SWEEP.length), 140);
		return () => window.clearInterval(id);
	}, [inView, reduce]);
	const hint = reduce ? [11, 21, 12, 22] : [SWEEP[step]!, SWEEP[(step + SWEEP.length - 1) % SWEEP.length]!, SWEEP[(step + SWEEP.length - 2) % SWEEP.length]!];
	const cfg = siteConfig.smileCheck;

	return (
		<div ref={ref} className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
			<div className="chart-paper order-2 rounded-[6px] border border-line bg-enamel/40 px-6 py-6 lg:order-1">
				<div className="flex justify-between">
					<p className="t-anno">Chart · 32 teeth</p>
					<p className="t-anno">FDI</p>
				</div>
				<div className="mx-auto mt-2 max-w-[340px]">
					<ArchChart hint={hint} label="A dental chart of 32 teeth" />
				</div>
			</div>
			<div className="order-1 lg:order-2">
				<p className="t-anno">01 · {cfg.eyebrow}</p>
				<h2 className="t-xl mt-4">
					{cfg.lead} <em>{cfg.accent}</em>
				</h2>
				<p className="t-lede mt-6 max-w-[42ch]">{cfg.body}</p>
				<ol className="mt-8 grid gap-0 border-t border-line">
					{['Tap the teeth on your mind', 'Say what’s going on', 'Set the comfort dial'].map((t, i) => (
						<li key={t} className="flex items-baseline gap-4 border-b border-line py-3 text-[15px]">
							<span className="t-num text-[11px] text-brass">{String(i + 1).padStart(2, '0')}</span>
							{t}
						</li>
					))}
				</ol>
				<Link href="/smile-check" className={buttonClasses({ variant: 'solid', size: 'lg', className: 'mt-8' })}>
					<ButtonInner size="lg">Start Smile Check</ButtonInner>
				</Link>
			</div>
		</div>
	);
}
