'use client';

import { useRef } from 'react';
import { clsx } from 'clsx';
import { usePointerLight } from '@/components/light/use-pointer-light';

/*
 * The hero object: a large porcelain tooth (the Alba mark's silhouette) lit by
 * the pointer. The body is a CSS mask of the tooth path filled with a radial
 * "enamel" gradient whose centre follows --lx/--ly, with a specular highlight
 * and a rim; the brass sun rises behind it once on load (static under reduced
 * motion). Chart annotations with leader lines sit around it on desktop.
 */
const TOOTH_PATH =
	'M30,40 C30,21 46,17 53,24 C56.5,27 63.5,27 67,24 C74,17 90,21 90,40 C90,58 84,67 82,81 C80,95 76,103 71,103 C65,103 66,87 60,87 C54,87 55,103 49,103 C44,103 40,95 38,81 C36,67 30,58 30,40 Z';
const MASK = `url("data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='26 14 68 94'><path d='${TOOTH_PATH}' fill='black'/></svg>`)}")`;

export interface ToothNote {
	label: string;
	value: string;
	/** Anchor on the tooth (0–1) and label side. */
	at: [number, number];
	side: 'left' | 'right';
	/** Label offset from the anchor, in % of the box. */
	dy?: number;
}

export function PorcelainTooth({ notes, className }: { notes: ToothNote[]; className?: string }) {
	const ref = useRef<HTMLDivElement>(null);
	usePointerLight(ref, { track: 'window' });
	return (
		<div ref={ref} className={clsx('porcelain-stage relative', className)} style={{ ['--lx' as string]: 0.38, ['--ly' as string]: 0.28 }}>
			{/* the sun rising behind */}
			<div aria-hidden className="absolute left-1/2 top-[-22%] aspect-square w-[120%] -translate-x-1/2 overflow-hidden [mask-image:linear-gradient(to_bottom,black_55%,transparent_75%)]">
				<div className="sun-rise absolute inset-[18%] rounded-full bg-[radial-gradient(circle,rgba(236,212,162,0.95)_0%,rgba(214,178,116,0.55)_26%,rgba(214,178,116,0.18)_48%,rgba(214,178,116,0)_70%)]" />
			</div>
			{/* soft floor shadow */}
			<div aria-hidden className="absolute bottom-[1%] left-1/2 h-[6%] w-[58%] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgba(13,59,62,0.28),transparent)] blur-[6px]" />
			{/* the tooth */}
			<div className="relative mx-auto aspect-[68/94] w-full max-w-[460px]">
				<div
					aria-hidden
					className="absolute inset-0"
					style={{
						WebkitMaskImage: MASK,
						maskImage: MASK,
						WebkitMaskSize: '100% 100%',
						maskSize: '100% 100%',
						background:
							'radial-gradient(circle at calc(var(--lx) * 100%) calc(var(--ly) * 100%), #ffffff 0%, #fdfcf8 14%, #f1ede3 38%, #ddd6c6 66%, #c7bfac 92%)',
						transition: 'background-position 200ms',
					}}
				>
					{/* specular highlight + cool rim light */}
					<div
						className="absolute inset-0 mix-blend-screen"
						style={{ background: 'radial-gradient(18% 12% at calc(var(--lx) * 100% - 4%) calc(var(--ly) * 100% - 3%), rgba(255,255,255,0.95), rgba(255,255,255,0) 70%)' }}
					/>
					<div className="absolute inset-0" style={{ background: 'linear-gradient(115deg, rgba(191,238,221,0) 55%, rgba(191,238,221,0.35) 100%)' }} />
					<div className="gleam absolute inset-0" />
				</div>
				<svg viewBox="26 14 68 94" className="absolute inset-0 h-full w-full" aria-hidden>
					<path d={TOOTH_PATH} fill="none" stroke="rgba(13,29,31,0.22)" strokeWidth="0.35" />
					<path d="M38 41 C 44 38, 52 39, 56 44" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="0.8" strokeLinecap="round" />
				</svg>
				{/* chart annotations */}
				{notes.map((n, i) => (
					<div
						key={i}
						className={clsx('pointer-events-none absolute hidden xl:block', n.side === 'left' ? 'right-[calc(100%-var(--ax))]' : 'left-[var(--ax)]')}
						style={{ ['--ax' as string]: `${n.at[0] * 100}%`, top: `${n.at[1] * 100}%` }}
					>
						<span className="absolute top-0 h-[7px] w-[7px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-brass bg-enamel" style={n.side === 'left' ? { right: -3.5 } : { left: 3.5 }} />
						<div className={clsx('flex items-center gap-2', n.side === 'left' ? 'flex-row-reverse' : '')} style={{ transform: `translateY(${n.dy ?? 0}%)` }}>
							<span className="h-px w-10 bg-brass/70" />
							<div className={clsx('w-[136px]', n.side === 'left' ? 'text-right' : '')}>
								<p className="t-anno !text-[9.5px]">{n.label}</p>
								<p className="text-[13px] leading-snug text-ink-2">{n.value}</p>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
