'use client';

import { clsx } from 'clsx';
import { Face } from './face';
import './planner.css';

/**
 * The chair-time track: the visit drawn to scale. One lane per patient visit,
 * each treatment a block whose width is its minutes, add-ons as tabs on its top
 * edge, a hygienist straight after as a second block. It is both the summary
 * and the navigation of the planner: every part is a button that focuses the
 * editor for that choice. Read-only (no handlers) on the patient record.
 */

export interface TrackBlock {
	key: string;
	kind: 'treatment' | 'hygiene';
	title: string;
	/** Visit length in minutes (sets the width). */
	minutes: number;
	/** Minutes from the lane's start (sets the left edge). */
	offset: number;
	face?: { name: string; src: string | null } | null;
	tabs?: string[];
	state: 'plan' | 'held';
	label: string;
	onClick?: () => void;
}

export interface TrackLane {
	key: string;
	/** Studio, e.g. "Marylebone" (the station). */
	station: string | null;
	/** Big numerals: "09:30". */
	when: string | null;
	/** "Thu 30 Oct". */
	whenSub?: string | null;
	patient?: string | null;
	blocks: TrackBlock[];
	ghost?: { label: string; minutes: number; offset: number; onClick?: () => void } | null;
	onStation?: () => void;
	onWhen?: () => void;
	onPatient?: () => void;
}

function pct(n: number, scale: number): string {
	return `${(n / scale) * 100}%`;
}

/** The lane length in minutes: everything on the track plus air, in quarters, at least 90. */
export function trackScale(lanes: TrackLane[]): number {
	let end = 0;
	for (const l of lanes) {
		for (const b of l.blocks) end = Math.max(end, b.offset + b.minutes);
		if (l.ghost) end = Math.max(end, l.ghost.offset + l.ghost.minutes);
	}
	return Math.max(90, Math.ceil((end + 15) / 15) * 15);
}

function Maybe({ onClick, className, label, style, children }: { onClick?: () => void; className?: string; label?: string; style?: React.CSSProperties; children: React.ReactNode }) {
	if (!onClick)
		return (
			<div className={className} style={style}>
				{children}
			</div>
		);
	return (
		<button type="button" onClick={onClick} className={clsx('text-left', className)} aria-label={label} style={style}>
			{children}
		</button>
	);
}

function Block({ b, scale, compact }: { b: TrackBlock; scale: number; compact: boolean }) {
	const narrow = b.minutes / scale < (compact ? 0.3 : 0.18);
	const body = (
		<>
			{b.face && !narrow ? <Face name={b.face.name} src={b.face.src} className="vblock-face text-[15px]" sizes="44px" /> : null}
			<span className="min-w-0">
				<span className="block truncate text-[14px] font-medium leading-tight">{b.title}</span>
				<span className="t-anno mt-1 block !text-current opacity-75">
					{b.minutes}′{b.face && !narrow && !compact ? ` · ${b.face.name}` : ''}
				</span>
			</span>
		</>
	);
	const style = { left: pct(b.offset, scale), width: pct(b.minutes, scale) };
	return (
		<>
			{b.tabs && b.tabs.length ? (
				<span className="vblock-tabs" style={{ left: `calc(${pct(b.offset, scale)} + 10px)` }} aria-hidden>
					{b.tabs.map((t) => (
						<span key={t} className="vblock-tab">
							{t}
						</span>
					))}
				</span>
			) : null}
			{b.onClick ? (
				<button key={`${b.key}:${b.title}:${b.state}`} type="button" onClick={b.onClick} aria-label={b.label} className="vblock" data-kind={b.kind} data-state={b.state} data-gleam="on" style={style}>
					{body}
				</button>
			) : (
				<div key={`${b.key}:${b.title}:${b.state}`} className="vblock" data-kind={b.kind} data-state={b.state} data-gleam="on" style={style} aria-label={b.label} role="img">
					{body}
				</div>
			)}
		</>
	);
}

/** Desktop / tablet: horizontal lanes under a minute ruler. */
export function ChairTrack({ lanes, compact = false, className }: { lanes: TrackLane[]; compact?: boolean; className?: string }) {
	const scale = trackScale(lanes);
	const labels: number[] = [];
	for (let m = 0; m <= scale; m += 15) labels.push(m);
	return (
		<div className={clsx('track', className)}>
			<div className={clsx('grid', compact ? 'grid-cols-[150px_1fr]' : 'grid-cols-[230px_1fr]')}>
				<div className="t-anno flex items-end border-r border-line px-4 pb-1.5 text-ink-3">Chair time</div>
				<div className="track-ruler mx-4" style={{ ['--ticks' as string]: scale / 5 }} aria-hidden>
					{labels.map((m) => (
						<span key={m} className="track-ruler-label t-anno" style={{ left: pct(m, scale) }}>
							{m}′
						</span>
					))}
				</div>
				{lanes.map((lane) => (
					<LaneRow key={lane.key} lane={lane} scale={scale} compact={compact} />
				))}
			</div>
		</div>
	);
}

function LaneRow({ lane, scale, compact }: { lane: TrackLane; scale: number; compact: boolean }) {
	return (
		<>
			<div className={clsx('flex min-w-0 flex-col justify-center gap-1 border-t border-r border-line px-4', compact ? 'py-2' : 'py-3')}>
				<Maybe onClick={lane.onStation} label="Change studio" className="group min-w-0">
					<span className="t-anno block text-ink-3">Station</span>
					<span className={clsx('block truncate text-[14px] text-ink', lane.onStation && 'group-hover:text-lagoon')}>{lane.station ?? '—'}</span>
				</Maybe>
				<Maybe onClick={lane.onWhen} label="Change time" className="group flex items-baseline gap-2">
					<span className={clsx('font-display leading-none text-ink tabular-nums', compact ? 'text-[26px]' : 'text-[38px]', lane.onWhen && 'group-hover:text-lagoon')}>
						{lane.when ?? '--:--'}
					</span>
					{lane.whenSub ? <span className="t-anno text-ink-2">{lane.whenSub}</span> : null}
				</Maybe>
				{lane.patient ? (
					<Maybe onClick={lane.onPatient} label="Change who the visit is for" className="t-anno self-start rounded-[3px] bg-porcelain-2 px-1.5 py-0.5 text-ink-2 hover:text-lagoon">
						For · {lane.patient}
					</Maybe>
				) : null}
			</div>
			<div className={clsx('relative mx-4 border-t border-line', compact ? 'h-[72px]' : 'h-[96px]')}>
				<div className="track-lane absolute inset-0 !h-auto" style={{ ['--quarters' as string]: scale / 15 }} aria-hidden />
				{lane.ghost ? (
					<Maybe
						onClick={lane.ghost.onClick}
						className="vblock-ghost t-anno"
						style={{ left: pct(lane.ghost.offset, scale), width: pct(lane.ghost.minutes, scale) }}
					>
						<span aria-hidden>+</span>
						{lane.ghost.label}
					</Maybe>
				) : null}
				{lane.blocks.map((b) => (
					<Block key={b.key} b={b} scale={scale} compact={compact} />
				))}
			</div>
		</>
	);
}
