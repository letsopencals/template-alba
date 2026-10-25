'use client';

import Link from 'next/link';
import { clsx } from 'clsx';
import type { ReactNode } from 'react';

/*
 * The Alba Line: the studios drawn as stations on one transit line, west to
 * east, the line bending with each studio's latitude (north up) like a river
 * map. Data-driven: any number of studios with lat/lng. Desktop is horizontal
 * (SVG line + HTML labels so stations are real links/buttons); phones get the
 * same line running down the left of a list. Optional per-station `note`
 * (e.g. the next free time) and `status` (open/soon/closed light).
 *
 * Reused by /book as the branch picker: pass `selected` + `onSelect`.
 */
export interface LineStation {
	slug: string;
	title: string;
	/** "W1 · Marylebone" */
	area?: string;
	lat?: number | null;
	lng?: number | null;
	kids?: boolean;
	href?: string;
	note?: ReactNode;
	status?: 'open' | 'soon' | 'closed' | null;
	disabled?: boolean;
}

interface AlbaLineProps {
	stations: LineStation[];
	selected?: string | null;
	onSelect?: (slug: string) => void;
	tone?: 'light' | 'dark';
	/** Show the dashed "Video · anywhere" spur at the east end. */
	video?: { label: string; note?: ReactNode; href?: string; onSelect?: () => void; selected?: boolean } | null;
	className?: string;
	/** Accessible name for the group. */
	label?: string;
}

const W = 1000;
const H = 150;
const PAD = 70;

function layout(stations: LineStation[], spur: boolean) {
	const withPos = [...stations].sort((a, b) => (a.lng ?? 0) - (b.lng ?? 0));
	const lats = withPos.map((s) => s.lat).filter((l): l is number => typeof l === 'number');
	const minLat = Math.min(...lats);
	const maxLat = Math.max(...lats);
	const span = maxLat - minLat || 1;
	const n = withPos.length;
	return withPos.map((s, i) => {
		const right = spur ? 170 : PAD;
		const x = n === 1 ? W / 2 : PAD + (i * (W - PAD - right)) / (n - 1);
		const y = typeof s.lat === 'number' ? 30 + ((maxLat - s.lat) / span) * (H - 60) : H / 2;
		return { s, x: Math.round(x), y: Math.round(y) };
	});
}

/** Smooth path through points (Catmull-Rom → cubic Bézier), rounded for hydration. */
function smooth(points: { x: number; y: number }[]): string {
	if (points.length < 2) return '';
	const r = (n: number) => Math.round(n * 10) / 10;
	let d = `M ${points[0]!.x} ${points[0]!.y}`;
	for (let i = 0; i < points.length - 1; i++) {
		const p0 = points[i - 1] ?? points[i]!;
		const p1 = points[i]!;
		const p2 = points[i + 1]!;
		const p3 = points[i + 2] ?? p2;
		const c1x = p1.x + (p2.x - p0.x) / 6;
		const c1y = p1.y + (p2.y - p0.y) / 6;
		const c2x = p2.x - (p3.x - p1.x) / 6;
		const c2y = p2.y - (p3.y - p1.y) / 6;
		d += ` C ${r(c1x)} ${r(c1y)} ${r(c2x)} ${r(c2y)} ${p2.x} ${p2.y}`;
	}
	return d;
}

export function AlbaLine({ stations, selected, onSelect, tone = 'light', video, className, label = 'Alba studios' }: AlbaLineProps) {
	const pts = layout(stations, !!video);
	const path = smooth(pts);
	const dark = tone === 'dark';
	const lineColor = dark ? '#bfeedd' : '#0d3b3e';
	const last = pts[pts.length - 1];

	return (
		<div className={clsx('relative', className)} role="group" aria-label={label}>
			{/* Desktop: horizontal line */}
			<div className="relative hidden md:block">
				<svg viewBox={`0 0 ${W} ${H + 10}`} className="block w-full overflow-visible" aria-hidden>
					<path d={path} fill="none" stroke={lineColor} strokeWidth={7} strokeLinecap="round" opacity={dark ? 0.9 : 1} />
					<path d={path} fill="none" stroke={dark ? '#061a1c' : '#f3f1eb'} strokeWidth={1.2} strokeLinecap="round" strokeDasharray="1 9" opacity={0.7} />
					{video && last ? (
						<>
							<path d={`M ${last.x} ${last.y} C ${last.x + 50} ${last.y} ${last.x + 60} ${H / 2} ${W - 40} ${H / 2}`} fill="none" stroke={lineColor} strokeWidth={3} strokeDasharray="5 6" opacity={0.6} />
							<rect x={W - 52} y={H / 2 - 9} width={24} height={18} rx={3} fill={dark ? '#061a1c' : '#fcfbf8'} stroke={lineColor} strokeWidth={2.5} />
							<path d={`M ${W - 28} ${H / 2 - 4} l 8 -4 v 16 l -8 -4`} fill={lineColor} opacity={0.8} />
						</>
					) : null}
					{pts.map(({ s, x, y }) => {
						const on = selected === s.slug;
						return (
							<g key={s.slug}>
								{on ? <circle cx={x} cy={y} r={22} fill={dark ? 'rgba(191,238,221,0.18)' : 'rgba(31,122,124,0.14)'} /> : null}
								<circle cx={x} cy={y} r={on ? 12 : 10} fill={on ? (dark ? '#bfeedd' : '#0d3b3e') : dark ? '#061a1c' : '#fcfbf8'} stroke={lineColor} strokeWidth={4} />
								{s.kids ? <circle cx={x + 15} cy={y - 13} r={4} fill="#a9844a" /> : null}
							</g>
						);
					})}
				</svg>
				<ol className="pointer-events-none absolute inset-0">
					{pts.map(({ s, x, y }) => {
						const on = selected === s.slug;
						const below = y < H / 2 + 8;
						return (
							<li
								key={s.slug}
								className="pointer-events-auto absolute w-[17%] -translate-x-1/2"
								style={{ left: `${(x / W) * 100}%`, top: below ? `${((y + 26) / (H + 10)) * 100}%` : undefined, bottom: below ? undefined : `${((H + 10 - y + 26) / (H + 10)) * 100}%` }}
							>
								<StationLabel s={s} on={on} dark={dark} onSelect={onSelect} align="center" />
							</li>
						);
					})}
					{video && last ? (
						<li className="pointer-events-auto absolute right-0 w-[15%] text-center" style={{ bottom: `${((H + 10 - (H / 2 - 20)) / (H + 10)) * 100}%` }}>
							<VideoLabel video={video} dark={dark} />
						</li>
					) : null}
				</ol>
			</div>

			{/* Phones: vertical line */}
			<ol className="relative md:hidden">
				<span aria-hidden className={clsx('absolute bottom-6 left-[11px] top-6 w-[5px] rounded-full', dark ? 'bg-mint/80' : 'bg-lagoon')} />
				{pts.map(({ s }) => {
					const on = selected === s.slug;
					return (
						<li key={s.slug} className="relative flex items-start gap-4 py-3">
							<span
								aria-hidden
								className={clsx(
									'relative z-[1] mt-1 h-[27px] w-[27px] shrink-0 rounded-full border-[4px]',
									dark ? 'border-mint' : 'border-lagoon',
									on ? (dark ? 'bg-mint' : 'bg-lagoon') : dark ? 'bg-night' : 'bg-enamel',
								)}
							/>
							<StationLabel s={s} on={on} dark={dark} onSelect={onSelect} align="left" />
						</li>
					);
				})}
				{video ? (
					<li className="relative flex items-start gap-4 py-3">
						<span aria-hidden className={clsx('relative z-[1] mt-1 h-[27px] w-[27px] shrink-0 rounded-full border-[3px] border-dashed', dark ? 'border-mint bg-night' : 'border-lagoon bg-porcelain')} />
						<VideoLabel video={video} dark={dark} />
					</li>
				) : null}
			</ol>
		</div>
	);
}

function StationLabel({ s, on, dark, onSelect, align }: { s: LineStation; on: boolean; dark: boolean; onSelect?: (slug: string) => void; align: 'center' | 'left' }) {
	const body = (
		<>
			<span className={clsx('t-sm block text-[1.35rem] leading-tight transition-colors', on ? (dark ? 'text-mint' : 'text-lagoon-3') : '')}>{s.title.replace(/^Alba\s+/, '')}</span>
			{s.area ? <span className="t-anno mt-1 block">{s.area}</span> : null}
			{s.note || s.status ? (
				<span className={clsx('mt-2 flex items-center gap-2 text-[13px]', align === 'center' && 'justify-center', dark ? 'text-enamel/80' : 'text-ink-2')}>
					{s.status ? <span className="status-light" data-state={s.status} aria-hidden /> : null}
					{s.note}
				</span>
			) : null}
			{s.kids ? <span className={clsx('t-anno mt-1.5 block !text-brass', align === 'center' ? '' : '')}>● Kids room</span> : null}
		</>
	);
	const cls = clsx('block rounded-[4px] px-2 py-1 outline-none focus-visible:ring-2 focus-visible:ring-lagoon-3', align === 'center' ? 'text-center' : 'text-left', s.disabled && 'opacity-45');
	if (onSelect) {
		return (
			<button type="button" disabled={s.disabled} aria-pressed={on} onClick={() => onSelect(s.slug)} className={clsx(cls, 'w-full')}>
				{body}
			</button>
		);
	}
	if (s.href) {
		return (
			<Link href={s.href} className={clsx(cls, '')}>
				{body}
			</Link>
		);
	}
	return <div className={cls}>{body}</div>;
}

function VideoLabel({ video, dark }: { video: NonNullable<AlbaLineProps['video']>; dark: boolean }) {
	const body = (
		<>
			<span className={clsx('t-sm block text-[1.2rem] leading-tight', video.selected && (dark ? 'text-mint' : 'text-lagoon-3'))}>{video.label}</span>
			<span className="t-anno mt-1 block">Anywhere · video</span>
			{video.note ? <span className={clsx('mt-1.5 block text-[13px]', dark ? 'text-enamel/75' : 'text-ink-2')}>{video.note}</span> : null}
		</>
	);
	if (video.onSelect)
		return (
			<button type="button" aria-pressed={!!video.selected} onClick={video.onSelect} className="block rounded-[4px] px-2 py-1 text-left">
				{body}
			</button>
		);
	if (video.href)
		return (
			<Link href={video.href} className="block px-2 py-1">
				{body}
			</Link>
		);
	return <div className="px-2 py-1">{body}</div>;
}
