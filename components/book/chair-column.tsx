'use client';

import { clsx } from 'clsx';
import { Face } from './face';
import { trackScale, type TrackLane } from './chair-track';

/**
 * Phones: the chair-time track turned upright. A slim column on the planner's
 * edge where minutes run downwards; each block is a button into its editor.
 * Only the lane being planned is drawn here (held visits are listed under the
 * plan on phones).
 */
export function ChairColumn({ lane, className }: { lane: TrackLane; className?: string }) {
	const scale = trackScale([lane]);
	const px = 3.2; // px per minute
	return (
		<div className={clsx('relative w-[58px] shrink-0 border-r border-line-2', className)} style={{ height: scale * px + 24 }}>
			<span className="t-anno absolute left-1 top-0 text-[8.5px] text-ink-3">0′</span>
			<div
				aria-hidden
				className="absolute inset-x-0 bottom-0 top-5"
				style={{ backgroundImage: `repeating-linear-gradient(180deg, var(--color-line) 0 1px, transparent 1px ${15 * px}px)` }}
			/>
			{lane.ghost ? (
				<button
					type="button"
					onClick={lane.ghost.onClick}
					className="vblock-ghost t-anno !left-1.5 !right-1.5 text-[9px]"
					style={{ top: 20 + lane.ghost.offset * px, height: lane.ghost.minutes * px, bottom: 'auto' }}
					aria-label={lane.ghost.label}
				>
					+
				</button>
			) : null}
			{lane.blocks.map((b) => (
				<button
					key={`${b.key}:${b.title}:${b.state}`}
					type="button"
					onClick={b.onClick}
					aria-label={b.label}
					className="vblock !left-1.5 !right-1.5 !flex-col !justify-start !gap-1 !px-1 !pt-1.5"
					data-kind={b.kind}
					data-state={b.state}
					data-gleam="on"
					style={{ top: 20 + b.offset * px, height: Math.max(44, b.minutes * px - 4), bottom: 'auto', width: 'auto' }}
				>
					{b.face ? <Face name={b.face.name} src={b.face.src} className="h-9 w-9 shrink-0 rounded-[4px] text-[12px]" sizes="36px" /> : null}
					<span className="t-anno !text-[9px] !text-current">{b.minutes}′</span>
				</button>
			))}
		</div>
	);
}
