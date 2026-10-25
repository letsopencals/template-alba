'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { Pip, type PipMood, type PipPose } from '@/components/kids/pip';
import { ChapterMark, InkBlobs, RisoTitle, TornEdge } from '@/components/kids/paper';
import { kidsCopy } from '@/lib/kids/kids-config';

/*
 * Chapter three: Sugar Bug Scrub. A big open mouth with sixteen teeth and a
 * sugar bug on each. Two minutes, thirty seconds per corner (top left → top
 * right → bottom right → bottom left): only the corner being brushed is awake,
 * and the child scrubs its bugs off with a finger or the mouse. Keyboard: Tab
 * to a tooth, Space to scrub.
 */

const TOTAL_MS = 120_000;
const PHASE_MS = 30_000;
const TEETH = 16;
/** Pixels of scrubbing (in SVG units) to clean one tooth. */
const SCRUB_PER_TOOTH = 260;

/** Tooth i → quadrant 0 top-left, 1 top-right, 2 bottom-right, 3 bottom-left. */
const quadrantOf = (i: number) => (i < 8 ? (i < 4 ? 0 : 1) : i < 12 ? 3 : 2);

interface ToothGeo {
	x: number;
	y: number;
	w: number;
	h: number;
	top: boolean;
}

/** Front view of an open mouth: 8 top teeth hanging down, 8 bottom teeth standing up. */
const GEO: ToothGeo[] = (() => {
	const out: ToothGeo[] = [];
	for (let row = 0; row < 2; row++) {
		for (let k = 0; k < 8; k++) {
			const cx = 128 + k * 49.2;
			const off = Math.abs(cx - 300) / 172; // 0 centre … 1 sides
			const w = Math.round(46 - off * 8);
			const h = Math.round(row === 0 ? 74 - off * 22 : 62 - off * 18);
			const curve = Math.round(off * off * 34);
			const y = row === 0 ? 132 + curve : 318 - curve - h;
			out.push({ x: Math.round(cx - w / 2), y, w, h, top: row === 0 });
		}
	}
	return out;
})();

function toothPath(g: ToothGeo): string {
	const { x, y, w, h, top } = g;
	const r = Math.min(14, w / 3);
	return top
		? `M${x} ${y}H${x + w}V${y + h - r}Q${x + w} ${y + h} ${x + w - r} ${y + h}H${x + r}Q${x} ${y + h} ${x} ${y + h - r}Z`
		: `M${x} ${y + h}H${x + w}V${y + r}Q${x + w} ${y} ${x + w - r} ${y}H${x + r}Q${x} ${y} ${x} ${y + r}Z`;
}

const BUG_INKS = ['#00a95c', '#ff6c2f', '#3c7dc4', '#ff48b0'];

function Bug({ cx, cy, ink, asleep, running }: { cx: number; cy: number; ink: string; asleep: boolean; running: boolean }) {
	return (
		<g transform={`translate(${cx} ${cy}) scale(1.35) translate(${-cx} ${-cy})`}>
		<g className={running && !asleep ? 'r-shiver' : undefined} style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
			<g stroke="var(--r-ink)" strokeWidth={2} strokeLinecap="round">
				<path d={`M${cx - 9} ${cy + 4}l-6 5M${cx + 9} ${cy + 4}l6 5M${cx - 10} ${cy - 1}l-7 -1M${cx + 10} ${cy - 1}l7 -1`} />
				<path d={`M${cx - 4} ${cy - 10}l-3 -7M${cx + 4} ${cy - 10}l3 -7`} />
			</g>
			<ellipse cx={cx} cy={cy} rx={12} ry={10} fill={ink} />
			{asleep ? (
				<g fill="none" stroke="var(--r-ink)" strokeWidth={2} strokeLinecap="round">
					<path d={`M${cx - 7} ${cy - 1}q3 3 6 0M${cx + 1} ${cy - 1}q3 3 6 0`} />
				</g>
			) : (
				<g>
					<circle cx={cx - 4} cy={cy - 2} r={3.2} fill="#fff" />
					<circle cx={cx + 4} cy={cy - 2} r={3.2} fill="#fff" />
					<circle cx={cx - 3.4} cy={cy - 1.6} r={1.5} fill="var(--r-ink)" />
					<circle cx={cx + 4.6} cy={cy - 1.6} r={1.5} fill="var(--r-ink)" />
					<path d={`M${cx - 4} ${cy + 4}q4 3 8 0`} fill="none" stroke="var(--r-ink)" strokeWidth={1.6} strokeLinecap="round" />
				</g>
			)}
		</g>
		</g>
	);
}

type Status = 'idle' | 'running' | 'paused' | 'done';

function fmt(ms: number): string {
	const s = Math.max(0, Math.ceil(ms / 1000));
	return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

const CONFETTI = Array.from({ length: 36 }, (_, i) => {
	const r = (n: number) => ((Math.sin(i * 12.9898 + n * 78.233) * 43758.5453) % 1 + 1) % 1;
	return {
		left: Math.round(r(1) * 100),
		cx: `${Math.round((r(2) - 0.5) * 200)}px`,
		cr: `${Math.round(360 + r(3) * 540)}deg`,
		cd: `${(2.2 + r(4) * 1.6).toFixed(2)}s`,
		cdelay: `${(r(5) * 0.6).toFixed(2)}s`,
		color: BUG_INKS[i % 4],
		w: 6 + Math.round(r(6) * 8),
		h: 10 + Math.round(r(7) * 8),
	};
});

export function SugarBugScrub() {
	const t = kidsCopy.scrub;
	const [status, setStatus] = useState<Status>('idle');
	const [elapsed, setElapsed] = useState(0);
	const [dirt, setDirt] = useState<number[]>(() => Array(TEETH).fill(1));
	const base = useRef<{ start: number; before: number } | null>(null);
	const svgRef = useRef<SVGSVGElement>(null);
	const last = useRef<{ x: number; y: number } | null>(null);
	const down = useRef(false);

	const phase = status === 'idle' ? -1 : Math.min(3, Math.floor(elapsed / PHASE_MS));
	const remaining = TOTAL_MS - elapsed;

	useEffect(() => {
		if (status !== 'running') return;
		base.current = { start: performance.now(), before: elapsed };
		const id = window.setInterval(() => {
			const b = base.current;
			if (!b) return;
			const now = Math.min(TOTAL_MS, b.before + performance.now() - b.start);
			setElapsed(now);
			if (now >= TOTAL_MS) setStatus('done');
		}, 200);
		return () => window.clearInterval(id);
		// eslint-disable-next-line react-hooks/exhaustive-deps -- restart the clock only on status changes
	}, [status]);

	const start = useCallback(() => {
		if (status === 'done' || status === 'idle') {
			setElapsed(0);
			setDirt(Array(TEETH).fill(1));
		}
		setStatus('running');
	}, [status]);

	const scrub = useCallback(
		(tooth: number, amount: number) => {
			if (status !== 'running' || quadrantOf(tooth) !== phase) return;
			setDirt((d) => {
				if (d[tooth]! <= 0) return d;
				const next = d.slice();
				next[tooth] = Math.max(0, d[tooth]! - amount);
				return next;
			});
		},
		[status, phase],
	);

	const toothAt = (clientX: number, clientY: number): number | null => {
		const el = document.elementFromPoint(clientX, clientY)?.closest('[data-tooth]');
		const n = el ? Number(el.getAttribute('data-tooth')) : NaN;
		return Number.isFinite(n) ? n : null;
	};

	const onPointerDown = (e: PointerEvent<SVGSVGElement>) => {
		if (status === 'idle' || status === 'paused') start();
		down.current = true;
		last.current = { x: e.clientX, y: e.clientY };
		e.currentTarget.setPointerCapture?.(e.pointerId);
	};
	const onPointerMove = (e: PointerEvent<SVGSVGElement>) => {
		if (!down.current || !last.current) return;
		const svg = svgRef.current;
		const scale = svg ? 600 / svg.getBoundingClientRect().width : 1;
		const dist = Math.hypot(e.clientX - last.current.x, e.clientY - last.current.y) * scale;
		last.current = { x: e.clientX, y: e.clientY };
		const tooth = toothAt(e.clientX, e.clientY);
		if (tooth !== null) scrub(tooth, dist / SCRUB_PER_TOOTH);
	};
	const onPointerUp = () => {
		down.current = false;
		last.current = null;
	};
	const onToothKey = (i: number) => (e: KeyboardEvent<SVGGElement>) => {
		if (e.key === ' ' || e.key === 'Enter') {
			e.preventDefault();
			scrub(i, 0.25);
		}
	};

	const quadrantClean = phase >= 0 && dirt.every((d, i) => quadrantOf(i) !== phase || d <= 0);
	const cleaned = dirt.filter((d) => d <= 0).length;

	const pip: { pose: PipPose; mood: PipMood; says: string } = useMemo(() => {
		if (status === 'idle') return { pose: 'brush', mood: 'happy', says: 'Ready? Press start and scrub!' };
		if (status === 'paused') return { pose: 'idle', mood: 'calm', says: 'Paused. Back when you are!' };
		if (status === 'done')
			return { pose: 'cheer', mood: 'grin', says: cleaned === TEETH ? t.done : `Two minutes! ${TEETH - cleaned} bugs hid. Get them tomorrow!` };
		if (quadrantClean) return { pose: 'cheer', mood: 'grin', says: 'All gone here! Little circles until the bell.' };
		return { pose: 'brush', mood: 'brave', says: `${t.quadrants[phase] ?? ''}: ${t.cheers[phase] ?? ''}` };
	}, [status, phase, quadrantClean, cleaned, t]);

	return (
		<section id="scrub" aria-labelledby="scrub-title" className="relative scroll-mt-4">
			<TornEdge color="var(--r-wash-pink)" seed={29} />
			<div className="relative overflow-hidden bg-(--r-wash-pink) px-4 pt-10 pb-20 sm:px-6">
				<InkBlobs a="var(--r-teal)" b="var(--r-sun)" className="bottom-[-12%] left-[-8%] max-md:hidden" size={260} />
				<div className="relative mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
					<div>
						<ChapterMark n={3} label={t.label} tone="#d62b8a" />
						<RisoTitle id="scrub-title" className="mt-3 text-[clamp(2.8rem,7vw,4.8rem)] leading-[0.9]" second="var(--r-teal)">
							{t.title}
						</RisoTitle>
						<p className="mt-4 text-lg leading-relaxed">{t.lead}</p>

						{/* the timer: a paper dial split into four corners */}
						<div className="mt-7 flex items-center gap-5">
							<div className="relative size-28 shrink-0">
								<svg viewBox="0 0 100 100" className="size-full -rotate-90" aria-hidden>
									<circle cx={50} cy={50} r={44} fill="var(--r-paper-2)" style={{ filter: 'drop-shadow(0 3px 3px rgb(47 65 112 / .3))' }} />
									{[0, 1, 2, 3].map((q) => {
										const done = Math.min(1, Math.max(0, (elapsed - q * PHASE_MS) / PHASE_MS));
										const len = (Math.PI * 2 * 36) / 4;
										return (
											<g key={q}>
												<circle cx={50} cy={50} r={36} fill="none" stroke="var(--r-ink)" strokeOpacity={0.12} strokeWidth={12} strokeDasharray={`${(len - 3).toFixed(2)} ${(Math.PI * 2 * 36 - len + 3).toFixed(2)}`} strokeDashoffset={(-q * len).toFixed(2)} />
												<circle cx={50} cy={50} r={36} fill="none" stroke={BUG_INKS[q]} strokeWidth={12} strokeDasharray={`${Math.max(0, done * (len - 3)).toFixed(2)} 999`} strokeDashoffset={(-q * len).toFixed(2)} className="r-multiply" />
											</g>
										);
									})}
								</svg>
								<p className="r-brush absolute inset-0 grid place-items-center text-[2rem] tabular-nums" aria-hidden>
									{fmt(remaining)}
								</p>
							</div>
							<div className="flex flex-col items-start gap-2">
								{status === 'running' ? (
									<button type="button" onClick={() => setStatus('paused')} className="r-tag r-tag-ink">
										Pause
									</button>
								) : (
									<button type="button" onClick={start} className="r-tag r-tag-pink">
										{status === 'idle' ? 'Start brushing' : status === 'paused' ? 'Keep going' : 'Play again'}
									</button>
								)}
								{status !== 'idle' ? (
									<button
										type="button"
										onClick={() => {
											setStatus('idle');
											setElapsed(0);
											setDirt(Array(TEETH).fill(1));
										}}
										className="r-quiet text-sm"
									>
										Start over
									</button>
								) : null}
							</div>
						</div>
						<p className="mt-4 text-sm text-(--r-ink-soft)">{t.keyboard}</p>
						<p className="sr-only" aria-live="polite">
							{status === 'running' ? `${t.quadrants[phase] ?? ''}. ${cleaned} of ${TEETH} teeth clean.` : status === 'done' ? pip.says : ''}
						</p>
					</div>

					<div className="relative">
						{/* Pip and what he says */}
						<div className="absolute -top-6 right-0 z-10 flex items-end gap-2 sm:-top-10">
							<p className="r-paper r-cut mb-10 max-w-[13rem] rounded-[3px] px-3 py-2 text-sm font-bold" style={{ transform: 'rotate(-2deg)' }}>
								{pip.says}
							</p>
							<Pip size={92} pose={pip.pose} mood={pip.mood} />
						</div>
						<svg
							ref={svgRef}
							viewBox="0 0 600 440"
							className="relative w-full touch-none select-none"
							style={{ cursor: status === 'running' ? 'grab' : 'pointer' }}
							onPointerDown={onPointerDown}
							onPointerMove={onPointerMove}
							onPointerUp={onPointerUp}
							onPointerCancel={onPointerUp}
							role="group"
							aria-label="An open mouth with sixteen teeth and a sugar bug on each"
						>
							{/* lips */}
							<path d="M40 222C40 120 170 62 300 62C430 62 560 120 560 222C560 330 430 392 300 392C170 392 40 330 40 222Z" fill="#ff7cbf" style={{ filter: 'drop-shadow(0 8px 10px rgb(47 65 112 / .3))' }} />
							<path d="M70 222C70 142 180 96 300 96C420 96 530 142 530 222C530 306 420 360 300 360C180 360 70 306 70 222Z" fill="#7a2348" />
							<ellipse cx={300} cy={300} rx={120} ry={34} fill="#d4547f" />
							{/* gums */}
							<path d="M92 170C150 112 450 112 508 170L508 134C450 100 150 100 92 134Z" fill="#ff9dcb" />
							<path d="M92 274C150 334 450 334 508 274L508 312C450 348 150 348 92 312Z" fill="#ff9dcb" />
							{GEO.map((g, i) => {
								const q = quadrantOf(i);
								const active = status === 'running' && q === phase;
								const asleep = status !== 'running' || q !== phase;
								const d = dirt[i]!;
								const gone = d <= 0;
								const bx = g.x + g.w / 2;
								const by = g.top ? g.y + g.h - 18 : g.y + 18;
								return (
									<g
										key={i}
										data-tooth={i}
										tabIndex={active ? 0 : -1}
										role="button"
										aria-label={`Tooth ${i + 1}, ${t.quadrants[q]}, ${gone ? 'clean' : asleep ? 'sugar bug asleep' : 'sugar bug'}`}
										aria-disabled={!active}
										onKeyDown={onToothKey(i)}
										className="r-focus outline-none"
										style={{ opacity: status === 'running' && !active ? 0.55 : 1, transition: 'opacity 300ms' }}
									>
										<path d={toothPath(g)} fill="#fffdf7" stroke={active ? 'var(--r-sun)' : 'transparent'} strokeWidth={4} />
										{/* plaque */}
										<path d={toothPath(g)} fill="#e7c64a" opacity={d * 0.3} className="r-multiply" />
										{gone ? (
											<path d={`M${bx} ${by - 9}l2.5 6.5 6.5 2.5-6.5 2.5-2.5 6.5-2.5-6.5-6.5-2.5 6.5-2.5z`} fill="var(--r-sun)" />
										) : (
											<Bug cx={bx} cy={by} ink={BUG_INKS[i % 4]!} asleep={asleep} running={status === 'running'} />
										)}
									</g>
								);
							})}
						</svg>
						{status === 'running' ? (
							<p className="mt-1 text-center text-sm font-bold" aria-hidden>
								Brushing: <span className="text-(--r-teal)">{t.quadrants[phase]}</span> · {cleaned}/{TEETH} clean
							</p>
						) : null}

						{status === 'done' ? (
							<div className="pointer-events-none absolute inset-0 grid place-items-center">
								<div className="r-stamp-in r-stamped grid size-48 place-items-center rounded-full border-[6px] border-double border-(--r-pink) text-center text-(--r-pink)" style={{ ['--stamp-rot' as string]: '-10deg', background: 'rgb(255 255 255 / .55)' }}>
									<span className="r-brush text-5xl leading-none">Sparkling!</span>
								</div>
							</div>
						) : null}
					</div>
				</div>
				{status === 'done' ? (
					<div aria-hidden className="pointer-events-none fixed inset-0 z-[55] overflow-hidden">
						{CONFETTI.map((c, i) => (
							<span
								key={i}
								className="r-confetti-bit absolute top-0 block"
								style={{
									left: `${c.left}%`,
									width: c.w,
									height: c.h,
									background: c.color,
									transform: 'translate3d(0,-10vh,0)',
									['--cx' as string]: c.cx,
									['--cr' as string]: c.cr,
									['--cd' as string]: c.cd,
									['--cdelay' as string]: c.cdelay,
								}}
							/>
						))}
					</div>
				) : null}
			</div>
		</section>
	);
}
