import { clsx } from 'clsx';
import { FRONT_WIDTH, frontToothPath, tooth, UPPER_CHART } from '@/lib/teeth';

/*
 * The chart strip: the upper arch drawn as a dental chart (front view, roots
 * up) with FDI numbers under each tooth and the midline marked. Alba's
 * signature rule; used in the footer, on plate edges and in the reminder card.
 * `highlight` lights teeth (FDI numbers) in mint.
 */
export function ToothStrip({ className, tone = 'dark', highlight = [], numbers = true }: { className?: string; tone?: 'dark' | 'light'; highlight?: number[]; numbers?: boolean }) {
	const unit = 40;
	const gap = 6;
	let x = 0;
	const items = UPPER_CHART.map((fdi) => {
		const t = tooth(fdi);
		const w = FRONT_WIDTH[t.type] * unit;
		const item = { fdi, t, x, w };
		x += w + gap;
		return item;
	});
	const width = x - gap;
	const ch = 34;
	const rh = 44;
	const top = rh + 4;
	const height = top + ch + (numbers ? 26 : 6);
	const stroke = tone === 'dark' ? 'rgba(252,251,248,0.55)' : 'rgba(13,29,31,0.45)';
	const fill = tone === 'dark' ? 'rgba(252,251,248,0.04)' : '#fcfbf8';
	const mid = items[8]!.x - gap / 2;
	return (
		<svg viewBox={`-2 0 ${width + 4} ${height}`} className={clsx('block w-full', className)} aria-hidden preserveAspectRatio="xMidYMid meet">
			<line x1={mid} x2={mid} y1={0} y2={height} stroke={tone === 'dark' ? '#a9844a' : '#a9844a'} strokeWidth={1} strokeDasharray="3 4" />
			{items.map(({ fdi, t, x: tx, w }) => {
				const lit = highlight.includes(fdi);
				return (
					<g key={fdi}>
						<path
							d={frontToothPath(t.type, tx, w, top, ch, rh)}
							fill={lit ? '#bfeedd' : fill}
							stroke={lit ? '#2f8a6c' : stroke}
							strokeWidth={1.1}
							strokeLinejoin="round"
						/>
						{numbers ? (
							<text
								x={tx + w / 2}
								y={top + ch + 20}
								textAnchor="middle"
								fontFamily="var(--font-mono)"
								fontSize={10}
								letterSpacing={0.5}
								fill={lit ? (tone === 'dark' ? '#bfeedd' : '#2f8a6c') : tone === 'dark' ? 'rgba(252,251,248,0.45)' : 'rgba(13,29,31,0.45)'}
							>
								{fdi}
							</text>
						) : null}
					</g>
				);
			})}
		</svg>
	);
}
