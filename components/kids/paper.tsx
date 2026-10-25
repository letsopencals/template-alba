import type { CSSProperties, ReactNode } from 'react';

/*
 * Cut-paper + riso primitives for Alba Kids. Server-safe (no hooks). Every
 * "random" shape comes from a seeded generator and rounded coordinates, so the
 * server and the browser draw the same path.
 */

/** Small deterministic PRNG (mulberry32). */
export function seeded(seed: number): () => number {
	let a = seed >>> 0;
	return () => {
		a = (a + 0x6d2b79f5) >>> 0;
		let t = a;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

const r1 = (n: number) => Math.round(n * 10) / 10;

/** A jagged "torn paper" edge path across a 1000-wide box of `height`. */
export function tornPath(seed: number, height = 40, flip = false): string {
	const rand = seeded(seed);
	const pts: string[] = [];
	let x = 0;
	while (x < 1000) {
		const y = height * 0.35 + rand() * height * 0.5;
		pts.push(`${r1(x)},${r1(flip ? height - y : y)}`);
		x += 6 + rand() * 18;
	}
	pts.push(`1000,${r1(flip ? height * 0.4 : height * 0.6)}`);
	return flip ? `M0,0 L${pts.join(' L')} L1000,0 Z` : `M0,${height} L${pts.join(' L')} L1000,${height} Z`;
}

/**
 * The torn top edge of the next page: draw it at the top of a section with the
 * section's own colour; it overlaps the section above.
 */
export function TornEdge({ color, seed = 7, height = 34, flip = false, className = '' }: { color: string; seed?: number; height?: number; flip?: boolean; className?: string }) {
	return (
		<svg
			aria-hidden
			viewBox={`0 0 1000 ${height}`}
			preserveAspectRatio="none"
			className={`pointer-events-none block h-[22px] w-full sm:h-[34px] ${className}`}
			style={{ filter: 'drop-shadow(0 -3px 3px rgb(47 65 112 / 0.16))' }}
		>
			<path d={tornPath(seed, height, flip)} fill={color} />
		</svg>
	);
}

/** A headline printed twice: ink, then a misregistered second colour, multiplied. */
export function RisoTitle({
	children,
	as: Tag = 'h2',
	className = '',
	ink = 'var(--r-ink)',
	second = 'var(--r-pink)',
	offset = [3, 2],
	id,
}: {
	children: ReactNode;
	as?: 'h1' | 'h2' | 'h3' | 'p';
	className?: string;
	ink?: string;
	second?: string;
	offset?: [number, number];
	id?: string;
}) {
	return (
		<Tag id={id} className={`r-brush isolate ${className}`}>
			<span className="relative block">
				<span className="relative z-[1] block r-multiply" style={{ color: ink }}>
					{children}
				</span>
				<span
					aria-hidden
					className="r-multiply pointer-events-none absolute inset-0 z-[2] block select-none"
					style={{ color: second, transform: `translate(${offset[0]}px, ${offset[1]}px)`, opacity: 0.85 }}
				>
					{children}
				</span>
			</span>
		</Tag>
	);
}

/** A brass split pin, the joint of every paper puppet. Use inside an <svg>. */
export function SplitPin({ x, y, r = 4.2 }: { x: number; y: number; r?: number }) {
	return (
		<g aria-hidden>
			<circle cx={x} cy={y} r={r} fill="#c9a24a" />
			<circle cx={x - r * 0.3} cy={y - r * 0.3} r={r * 0.35} fill="#f3df9d" />
			<path d={`M${x - r * 0.55},${y + r * 0.1} L${x + r * 0.55},${y + r * 0.1}`} stroke="#8a6a22" strokeWidth={r * 0.28} strokeLinecap="round" />
		</g>
	);
}

/** A strip of washi tape, absolutely positioned by the caller. */
export function Tape({ tone = 'var(--r-sun)', className = '', style }: { tone?: string; className?: string; style?: CSSProperties }) {
	return <span aria-hidden className={`r-tape ${className}`} style={{ ['--tape' as string]: tone, ...style }} />;
}

/** "Chapter 2" lettering above a chapter title. */
export function ChapterMark({ n, label, tone = 'var(--r-teal)' }: { n: number | string; label: string; tone?: string }) {
	return (
		<p className="flex items-center gap-3 text-sm font-bold tracking-[0.14em] uppercase" style={{ color: tone }}>
			<span className="r-brush grid size-11 place-items-center rounded-full text-[1.7rem] leading-none tracking-normal text-white normal-case" style={{ background: tone }}>
				{n}
			</span>
			{label}
		</p>
	);
}

/** Soft paper cloud, for scenery. */
export function PaperCloud({ className = '', fill = '#fff', width = 120, style }: { className?: string; fill?: string; width?: number; style?: CSSProperties }) {
	return (
		<svg aria-hidden viewBox="0 0 120 56" width={width} className={className} style={{ filter: 'drop-shadow(0 4px 4px rgb(47 65 112 / 0.18))', ...style }}>
			<path d="M14 50c-9 0-13-8-9-14 3-5 9-6 13-4 1-9 9-15 18-13 4-9 15-13 25-9 8 3 12 9 13 15 6-4 16-3 21 3 5 5 4 12 2 14 7 1 12 5 11 8H14z" fill={fill} />
		</svg>
	);
}

/** A five-point paper star. */
export function PaperStar({ className = '', fill = 'var(--r-sun)', size = 22, style }: { className?: string; fill?: string; size?: number; style?: CSSProperties }) {
	return (
		<svg aria-hidden viewBox="0 0 24 24" width={size} height={size} className={className} style={style}>
			<path d="M12 1.8l3 6.4 7 .8-5.2 4.8 1.4 6.9L12 17.2l-6.2 3.5 1.4-6.9L2 9l7-.8z" fill={fill} className="r-multiply" />
		</svg>
	);
}

/**
 * Two big overlapping ink circles, multiplied like a riso overprint (pink over
 * teal prints violet). Decorative; position with `className`.
 */
export function InkBlobs({ a = 'var(--r-pink)', b = 'var(--r-teal)', className = '', size = 260 }: { a?: string; b?: string; className?: string; size?: number }) {
	return (
		<div aria-hidden className={`pointer-events-none absolute isolate ${className}`} style={{ width: size * 1.55, height: size }}>
			<span className="absolute top-0 left-0 rounded-full opacity-90" style={{ width: size, height: size, background: a }} />
			<span className="r-multiply absolute top-[18%] right-0 rounded-full opacity-90" style={{ width: size * 0.82, height: size * 0.82, background: b }} />
			<span className="r-halftone absolute top-[30%] left-[20%] rounded-full" style={{ width: size * 0.7, height: size * 0.7, ['--dot' as string]: 'var(--r-sun)' }} />
		</div>
	);
}

/** Map a building/branch tone name to its riso ink. */
export const INK: Record<string, string> = {
	pink: 'var(--r-pink)',
	teal: 'var(--r-teal)',
	sun: 'var(--r-sun)',
	blue: 'var(--r-blue)',
	green: 'var(--r-green)',
	orange: 'var(--r-orange)',
};
