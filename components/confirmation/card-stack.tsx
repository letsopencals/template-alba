'use client';

import type { ReactNode } from 'react';

const BEHIND = [
	{ transform: 'translate(14px, 12px) rotate(2.6deg)', opacity: 0.85 },
	{ transform: 'translate(26px, 22px) rotate(5deg)', opacity: 0.6 },
];

/** Several appointment cards as a fanned stack; the arrows deal the next one to the top. */
export function CardStack({ count, index, onIndex, children }: { count: number; index: number; onIndex: (i: number) => void; children: ReactNode }) {
	const behind = BEHIND.slice(0, Math.max(0, count - 1));
	return (
		<div>
			<div className="appt-stack">
				{behind.map((b, i) => (
					<div key={i} aria-hidden className="appt-behind porcelain-card" style={{ transform: b.transform, opacity: b.opacity, zIndex: -1 - i }} />
				))}
				<div className="relative">{children}</div>
			</div>
			{count > 1 ? (
				<div className="mt-8 flex items-center justify-center gap-5">
					<button type="button" onClick={() => onIndex((index - 1 + count) % count)} className="t-anno !text-ink hover:!text-lagoon" aria-label="Previous appointment card">
						←
					</button>
					<span className="t-anno tabular-nums" aria-live="polite">
						{index + 1} / {count}
					</span>
					<button type="button" onClick={() => onIndex((index + 1) % count)} className="t-anno !text-ink hover:!text-lagoon" aria-label="Next appointment card">
						→
					</button>
				</div>
			) : null}
		</div>
	);
}
