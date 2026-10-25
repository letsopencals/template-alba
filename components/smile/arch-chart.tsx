'use client';

import { memo, useId, type KeyboardEvent } from 'react';
import { clsx } from 'clsx';
import { archLayout, fissurePath, occlusalPath, type ArchTooth } from '@/lib/teeth';

/*
 * The 32-tooth chart (FDI numbering), top-down, as a dentist draws it: the upper
 * arch above, the lower below, the patient's right on the viewer's left. Every
 * tooth is a toggle (keyboard: Tab, Enter/Space); the gums are a separate
 * toggle drawn as a soft band behind each arch. Static when `onToggle` is
 * omitted (the home teaser). Coordinates are computed once at module scope.
 */
const UPPER = archLayout(true, 26, 0);
const LOWER = archLayout(false, 26, 266);
const TEETH = [...UPPER, ...LOWER];

function gumPath(teeth: ArchTooth[]): string {
	// A smooth band through the tooth centres, from one back molar to the other.
	const left = teeth.filter((t) => t.cx < 200).sort((a, b) => a.position - b.position).reverse();
	const right = teeth.filter((t) => t.cx >= 200).sort((a, b) => a.position - b.position);
	const pts = [...left, ...right];
	return pts.map((t, i) => `${i === 0 ? 'M' : 'L'} ${t.cx} ${t.cy}`).join(' ');
}
const GUM_UPPER = gumPath(UPPER);
const GUM_LOWER = gumPath(LOWER);

function labelPos(t: ArchTooth): { x: number; y: number } {
	const centre = t.upper ? { x: 200, y: 190 } : { x: 200, y: 340 };
	const dx = t.cx - centre.x;
	const dy = t.cy - centre.y;
	const len = Math.hypot(dx, dy) || 1;
	const d = Math.max(t.w, t.h) / 2 + 13;
	return { x: Math.round((t.cx + (dx / len) * d) * 10) / 10, y: Math.round((t.cy + (dy / len) * d + 3.5) * 10) / 10 };
}

interface ArchChartProps {
	selected?: number[];
	onToggle?: (fdi: number) => void;
	gums?: boolean;
	onGums?: () => void;
	/** Light up these teeth softly (e.g. "front teeth" preset), without selecting. */
	hint?: number[];
	tone?: 'light' | 'dark';
	numbers?: boolean;
	className?: string;
	label?: string;
}

export const ArchChart = memo(function ArchChart({ selected = [], onToggle, gums = false, onGums, hint = [], tone = 'light', numbers = true, className, label = 'Dental chart' }: ArchChartProps) {
	const gid = useId().replace(/:/g, '');
	const interactive = !!onToggle;
	const dark = tone === 'dark';
	const onKey = (e: KeyboardEvent, fn: () => void) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			fn();
		}
	};
	return (
		<svg viewBox="0 -14 400 576" className={clsx('block h-auto w-full select-none', className)} role={interactive ? 'group' : 'img'} aria-label={label}>
			<defs>
				<linearGradient id={`${gid}-enamel`} x1="0" y1="0" x2="0.6" y2="1">
					<stop offset="0" stopColor="#ffffff" />
					<stop offset="0.6" stopColor="#f3f0e8" />
					<stop offset="1" stopColor="#e2ddd0" />
				</linearGradient>
				<linearGradient id={`${gid}-on`} x1="0" y1="0" x2="0.6" y2="1">
					<stop offset="0" stopColor="#1f7a7c" />
					<stop offset="1" stopColor="#0d3b3e" />
				</linearGradient>
			</defs>

			{/* midline + quadrant labels */}
			<line x1="200" x2="200" y1="4" y2="552" stroke="#a9844a" strokeWidth="1" strokeDasharray="3 5" />
			<line x1="10" x2="390" y1="278" y2="278" stroke={dark ? 'rgba(252,251,248,0.18)' : 'rgba(13,29,31,0.14)'} strokeWidth="1" />
			{numbers
				? (
						[
							['Q1 · upper right', 8, 270, 'start'],
							['Q2 · upper left', 392, 270, 'end'],
							['Q4 · lower right', 8, 293, 'start'],
							['Q3 · lower left', 392, 293, 'end'],
						] as const
					).map(([t, x, y, a]) => (
						<text key={t} x={x} y={y} textAnchor={a} fontFamily="var(--font-mono)" fontSize="8.5" letterSpacing="0.6" fill={dark ? 'rgba(252,251,248,0.45)' : 'rgba(13,29,31,0.45)'}>
							{t.toUpperCase()}
						</text>
					))
				: null}

			{/* gums */}
			{[GUM_UPPER, GUM_LOWER].map((d, i) => (
				<path
					key={i}
					d={d}
					fill="none"
					stroke={gums ? (dark ? 'rgba(191,238,221,0.4)' : 'rgba(196,81,47,0.22)') : dark ? 'rgba(252,251,248,0.06)' : 'rgba(196,81,47,0.08)'}
					strokeWidth="50"
					strokeLinecap="round"
					strokeLinejoin="round"
					className={clsx(onGums && 'cursor-pointer transition-[stroke] duration-200', onGums && !gums && 'hover:stroke-[rgba(196,81,47,0.16)]')}
					onClick={onGums}
					role={onGums ? 'button' : undefined}
					tabIndex={onGums ? 0 : undefined}
					aria-pressed={onGums ? gums : undefined}
					aria-label={onGums ? `${i === 0 ? 'Upper' : 'Lower'} gums` : undefined}
					onKeyDown={onGums ? (e) => onKey(e, onGums) : undefined}
				/>
			))}

			{TEETH.map((t) => {
				const on = selected.includes(t.fdi);
				const hinted = !on && hint.includes(t.fdi);
				const fiss = fissurePath(t.type, t.w, t.h);
				const lp = labelPos(t);
				return (
					<g key={t.fdi}>
						<g
							transform={`translate(${t.cx} ${t.cy}) rotate(${t.angle})`}
							className={clsx(interactive && 'group cursor-pointer outline-none')}
							role={interactive ? 'button' : undefined}
							tabIndex={interactive ? 0 : undefined}
							aria-pressed={interactive ? on : undefined}
							aria-label={interactive ? `Tooth ${t.fdi}, ${t.name}` : undefined}
							onClick={interactive ? () => onToggle!(t.fdi) : undefined}
							onKeyDown={interactive ? (e) => onKey(e, () => onToggle!(t.fdi)) : undefined}
						>
							{on ? <path d={occlusalPath(t.type, t.w + 10, t.h + 10)} fill="rgba(191,238,221,0.55)" /> : null}
							<path
								d={occlusalPath(t.type, t.w, t.h)}
								fill={on ? `url(#${gid}-on)` : hinted ? '#dff4ea' : `url(#${gid}-enamel)`}
								stroke={on ? '#0d3b3e' : dark ? 'rgba(252,251,248,0.5)' : 'rgba(13,29,31,0.35)'}
								strokeWidth="1.1"
								className={clsx('transition-[fill,stroke] duration-200', interactive && !on && 'group-hover:fill-[#e6f6ef] group-focus-visible:stroke-[#1f7a7c] group-focus-visible:[stroke-width:2.5]')}
							/>
							{fiss ? <path d={fiss} fill="none" stroke={on ? 'rgba(191,238,221,0.7)' : 'rgba(13,29,31,0.18)'} strokeWidth="1" strokeLinecap="round" /> : null}
						</g>
						{numbers ? (
							<text
								x={lp.x}
								y={lp.y}
								textAnchor="middle"
								fontFamily="var(--font-mono)"
								fontSize="8.5"
								fill={on ? (dark ? '#bfeedd' : '#1f7a7c') : dark ? 'rgba(252,251,248,0.4)' : 'rgba(13,29,31,0.4)'}
								aria-hidden
							>
								{t.fdi}
							</text>
						) : null}
					</g>
				);
			})}
		</svg>
	);
});
