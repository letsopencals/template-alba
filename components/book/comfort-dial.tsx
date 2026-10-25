'use client';

import { useId, useRef } from 'react';

const LINES: Record<number, string> = {
	1: 'Totally relaxed. Chat away.',
	2: 'Fine, mostly.',
	3: 'A little nervous.',
	4: 'Nervous. Please explain as you go.',
	5: 'Very anxious. Please go gently.',
};

/** Detent i (1–5) sits along a half circle from 180° (left) to 0° (right). */
function point(i: number, r: number): { x: number; y: number } {
	const a = Math.PI - ((i - 1) / 4) * Math.PI;
	return { x: Math.round((100 + r * Math.cos(a)) * 100) / 100, y: Math.round((100 - r * Math.sin(a)) * 100) / 100 };
}

/**
 * How do you feel about the dentist? A five-detent dial (a radio group:
 * arrows move, the needle follows). The answer reaches the clinician as the
 * store's "Comfort level" question.
 */
export function ComfortDial({ value, onChange }: { value: number | null; onChange: (n: number) => void }) {
	const id = useId();
	const refs = useRef<(HTMLButtonElement | null)[]>([]);
	const v = value ?? 0;
	const needle = v ? point(v, 62) : null;

	const move = (to: number) => {
		const n = Math.min(5, Math.max(1, to));
		onChange(n);
		refs.current[n - 1]?.focus();
	};

	return (
		<div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-8">
			<div className="relative w-[240px] shrink-0">
				<svg viewBox="0 0 200 112" className="w-full" aria-hidden>
					<defs>
						<linearGradient id={`${id}-arc`} x1="0" x2="1">
							<stop offset="0" stopColor="var(--color-mint-2)" />
							<stop offset="0.6" stopColor="var(--color-brass-2)" />
							<stop offset="1" stopColor="var(--color-brass-2)" />
						</linearGradient>
					</defs>
					<path d="M 18 100 A 82 82 0 0 1 182 100" fill="none" stroke={`url(#${id}-arc)`} strokeWidth="14" strokeLinecap="round" />
					{[1, 2, 3, 4, 5].map((i) => {
						const p = point(i, 82);
						return <circle key={i} className="dial-detent" cx={p.x} cy={p.y} r={v === i ? 6 : 3} fill={v === i ? 'var(--color-ink)' : 'var(--color-enamel)'} />;
					})}
					{needle ? (
						<line x1="100" y1="100" x2={needle.x} y2={needle.y} stroke="var(--color-ink)" strokeWidth="2.5" strokeLinecap="round" style={{ transition: 'all 0.35s var(--ease-light)' }} />
					) : null}
					<circle cx="100" cy="100" r="7" fill="var(--color-ink)" />
				</svg>
				<div role="radiogroup" aria-label="How do you feel about the dentist?" className="absolute inset-0">
					{[1, 2, 3, 4, 5].map((i) => {
						const p = point(i, 82);
						return (
							<button
								key={i}
								ref={(el) => {
									refs.current[i - 1] = el;
								}}
								type="button"
								role="radio"
								aria-checked={v === i}
								aria-label={LINES[i]}
								tabIndex={v ? (v === i ? 0 : -1) : i === 1 ? 0 : -1}
								onClick={() => onChange(i)}
								onKeyDown={(e) => {
									if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
										e.preventDefault();
										move((v || 0) + 1);
									} else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
										e.preventDefault();
										move((v || 2) - 1);
									}
								}}
								className="absolute h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full"
								style={{ left: `${p.x / 2}%`, top: `${(p.y / 112) * 100}%` }}
							/>
						);
					})}
				</div>
				<div className="t-anno mt-1 flex justify-between text-[9px] text-ink-3" aria-hidden>
					<span>Relaxed</span>
					<span>Anxious</span>
				</div>
			</div>
			<p className="font-display text-[26px] leading-tight text-ink" aria-live="polite">
				{v ? LINES[v] : <span className="text-ink-3">Turn the dial. It helps us plan your time.</span>}
			</p>
		</div>
	);
}
