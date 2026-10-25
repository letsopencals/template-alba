'use client';

import { useId } from 'react';
import { clsx } from 'clsx';

/*
 * How you feel about the dentist, as an instrument dial: a semicircular gauge
 * from "Totally relaxed" to "Very anxious", a needle, five ticks. The control
 * is a native range input laid over it (keyboard + screen readers for free).
 */
export interface ComfortStop {
	value: number;
	label: string;
}

export function ComfortDial({ value, onChange, stops, tone = 'light' }: { value: number | null; onChange: (v: number) => void; stops: ComfortStop[]; tone?: 'light' | 'dark' }) {
	const id = useId();
	const min = stops[0]?.value ?? 1;
	const max = stops[stops.length - 1]?.value ?? 5;
	const v = value ?? Math.round((min + max) / 2);
	const t = (v - min) / (max - min || 1);
	const angle = -90 + t * 180;
	const current = stops.find((s) => s.value === v);
	const dark = tone === 'dark';
	const R = 120;
	const arc = (a0: number, a1: number) => {
		const p = (a: number) => [150 + R * Math.cos(((a - 180) * Math.PI) / 180), 150 + R * Math.sin(((a - 180) * Math.PI) / 180)].map((n) => Math.round(n * 10) / 10);
		const [x0, y0] = p(a0);
		const [x1, y1] = p(a1);
		return `M ${x0} ${y0} A ${R} ${R} 0 0 1 ${x1} ${y1}`;
	};
	return (
		<div className="relative">
			<svg viewBox="0 0 300 170" className="block w-full" aria-hidden>
				<path d={arc(0, 180)} fill="none" stroke={dark ? 'rgba(252,251,248,0.14)' : 'rgba(13,29,31,0.1)'} strokeWidth="18" strokeLinecap="butt" />
				<path d={arc(0, Math.max(0.5, t * 180))} fill="none" stroke={t > 0.7 ? '#c4512f' : t > 0.4 ? '#a9844a' : '#2f8a6c'} strokeWidth="18" opacity={value == null ? 0.25 : 0.9} />
				{stops.map((s, i) => {
					const a = (i / (stops.length - 1)) * 180;
					const rad = ((a - 180) * Math.PI) / 180;
					const x0 = Math.round((150 + (R - 16) * Math.cos(rad)) * 10) / 10;
					const y0 = Math.round((150 + (R - 16) * Math.sin(rad)) * 10) / 10;
					const x1 = Math.round((150 + (R - 26) * Math.cos(rad)) * 10) / 10;
					const y1 = Math.round((150 + (R - 26) * Math.sin(rad)) * 10) / 10;
					return <line key={s.value} x1={x0} y1={y0} x2={x1} y2={y1} stroke={dark ? 'rgba(252,251,248,0.5)' : 'rgba(13,29,31,0.4)'} strokeWidth="1.2" />;
				})}
				<g transform={`rotate(${Math.round(angle * 10) / 10} 150 150)`} className="transition-transform duration-500 ease-[var(--ease-light)]" style={{ transformBox: 'view-box' }}>
					<line x1="150" y1="150" x2="150" y2="48" stroke={dark ? '#fcfbf8' : '#0d3b3e'} strokeWidth="2.5" strokeLinecap="round" opacity={value == null ? 0.35 : 1} />
				</g>
				<circle cx="150" cy="150" r="9" fill={dark ? '#fcfbf8' : '#0d3b3e'} />
				<circle cx="150" cy="150" r="3" fill="#a9844a" />
				<text x="22" y="166" fontFamily="var(--font-mono)" fontSize="9" fill={dark ? 'rgba(252,251,248,0.5)' : 'rgba(13,29,31,0.5)'}>
					CALM
				</text>
				<text x="278" y="166" textAnchor="end" fontFamily="var(--font-mono)" fontSize="9" fill={dark ? 'rgba(252,251,248,0.5)' : 'rgba(13,29,31,0.5)'}>
					ANXIOUS
				</text>
			</svg>
			<label htmlFor={id} className="sr-only">
				How do you feel about visiting the dentist?
			</label>
			<input
				id={id}
				type="range"
				min={min}
				max={max}
				step={1}
				value={v}
				aria-valuetext={current?.label}
				onChange={(e) => onChange(Number(e.target.value))}
				onPointerDown={() => value == null && onChange(v)}
				className="absolute inset-x-[6%] bottom-0 top-[10%] w-[88%] cursor-pointer opacity-0"
			/>
			<p className={clsx('t-md -mt-1 text-center', value == null && 'opacity-40')}>{current?.label ?? 'Slide to answer'}</p>
		</div>
	);
}
