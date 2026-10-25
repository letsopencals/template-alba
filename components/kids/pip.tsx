import { useId, type CSSProperties } from 'react';
import { SplitPin } from '@/components/kids/paper';
import './riso.css';

/*
 * Pip, Tooth Town's mascot: a cut-paper puppet. A paper tooth with a pink cape,
 * and paper-strip arms joined to the body with brass split pins. Poses set the
 * arm angles; animation wiggles the limbs around their pins (CSS, off under
 * reduced motion). Server-safe.
 */

export type PipPose = 'idle' | 'wave' | 'cheer' | 'brush' | 'point';
export type PipMood = 'happy' | 'grin' | 'wow' | 'calm' | 'wink' | 'brave';

/** Arm base angles (deg, 0 = hanging down) and wiggle range per pose. */
const POSES: Record<PipPose, { left: number; right: number; leftWiggle: [number, number]; rightWiggle: [number, number]; fast?: boolean }> = {
	idle: { left: 22, right: -22, leftWiggle: [-4, 4], rightWiggle: [-4, 4] },
	wave: { left: 22, right: -150, leftWiggle: [-3, 3], rightWiggle: [-16, 14] },
	cheer: { left: 152, right: -152, leftWiggle: [-12, 10], rightWiggle: [-10, 12] },
	brush: { left: 22, right: -112, leftWiggle: [-3, 3], rightWiggle: [-7, 7], fast: true },
	point: { left: 22, right: -92, leftWiggle: [-3, 3], rightWiggle: [-3, 5] },
};

const BODY =
	'M58 52C56 26 82 18 100 32C118 18 144 26 142 52C141 78 136 104 130 126C126 146 124 172 114 184C107 192 101 182 100 166C99 182 93 192 86 184C76 172 74 146 70 126C64 104 59 78 58 52Z';
const CAPE = 'M66 60C82 66 118 66 134 60C150 96 160 140 166 176C140 184 118 170 100 178C82 170 60 184 34 176C40 140 50 96 66 60Z';

function Arm({ x, y, angle, wiggle, animated, fast, delay, brush }: { x: number; y: number; angle: number; wiggle: [number, number]; animated: boolean; fast?: boolean; delay: string; brush?: boolean }) {
	const style = {
		transformOrigin: `${x}px ${y}px`,
		['--w-a' as string]: `${wiggle[0]}deg`,
		['--w-b' as string]: `${wiggle[1]}deg`,
		animationDelay: delay,
	} as CSSProperties;
	return (
		<g transform={`rotate(${angle} ${x} ${y})`}>
			<g className={animated ? (fast ? 'r-pin-wiggle-fast' : 'r-pin-wiggle') : undefined} style={style}>
				<rect x={x - 7} y={y - 5} width={14} height={50} rx={7} fill="#fffdf7" style={{ filter: 'drop-shadow(0 2px 1.5px rgb(47 65 112 / .3))' }} />
				<circle cx={x} cy={y + 47} r={9} fill="#fffdf7" style={{ filter: 'drop-shadow(0 2px 1.5px rgb(47 65 112 / .3))' }} />
				{brush ? (
					<g>
						<rect x={x - 4} y={y + 40} width={8} height={46} rx={3} fill="var(--r-teal)" />
						<rect x={x - 9} y={y + 76} width={18} height={12} rx={2} fill="#fff" stroke="var(--r-blue)" strokeWidth={1.2} />
						<ellipse cx={x} cy={y + 92} rx={8} ry={4} fill="var(--r-pink)" opacity={0.85} className="r-multiply" />
					</g>
				) : null}
				<SplitPin x={x} y={y} r={4} />
			</g>
		</g>
	);
}

function Mouth({ mood }: { mood: PipMood }) {
	switch (mood) {
		case 'grin':
			return (
				<g>
					<path d="M85 106Q100 128 115 106Z" fill="var(--r-ink)" />
					<path d="M92 114Q100 122 108 114Q100 111 92 114Z" fill="var(--r-pink)" />
				</g>
			);
		case 'wow':
			return <ellipse cx={100} cy={113} rx={5.5} ry={7} fill="var(--r-ink)" />;
		case 'calm':
			return <path d="M91 110Q100 116 109 110" fill="none" stroke="var(--r-ink)" strokeWidth={3} strokeLinecap="round" />;
		case 'brave':
			return <path d="M87 108Q100 120 113 108" fill="none" stroke="var(--r-ink)" strokeWidth={3.4} strokeLinecap="round" />;
		default:
			return <path d="M87 107Q100 121 113 107" fill="none" stroke="var(--r-ink)" strokeWidth={3.4} strokeLinecap="round" />;
	}
}

function Eyes({ mood, animated }: { mood: PipMood; animated: boolean }) {
	if (mood === 'calm') {
		return (
			<g fill="none" stroke="var(--r-ink)" strokeWidth={3} strokeLinecap="round">
				<path d="M80 93Q86 98 92 93" />
				<path d="M108 93Q114 98 120 93" />
			</g>
		);
	}
	const blink = animated ? 'r-blink' : undefined;
	const big = mood === 'wow';
	return (
		<g>
			<g className={blink}>
				<ellipse cx={86} cy={92} rx={big ? 6 : 5} ry={big ? 8.5 : 7} fill="var(--r-ink)" />
				<circle cx={87.8} cy={89.2} r={1.9} fill="#fff" />
			</g>
			{mood === 'wink' ? (
				<path d="M108 93Q114 87 120 93" fill="none" stroke="var(--r-ink)" strokeWidth={3} strokeLinecap="round" />
			) : (
				<g className={blink}>
					<ellipse cx={114} cy={92} rx={big ? 6 : 5} ry={big ? 8.5 : 7} fill="var(--r-ink)" />
					<circle cx={115.8} cy={89.2} r={1.9} fill="#fff" />
				</g>
			)}
			{mood === 'brave' ? (
				<g stroke="var(--r-ink)" strokeWidth={3} strokeLinecap="round">
					<path d="M79 80L92 83" />
					<path d="M121 80L108 83" />
				</g>
			) : null}
		</g>
	);
}

export interface PipProps {
	pose?: PipPose;
	mood?: PipMood;
	/** Rendered width in px (height follows). */
	size?: number;
	/** Show the pink cape (default true). */
	cape?: boolean;
	animated?: boolean;
	/** Accessible name; omit for a decorative Pip. */
	title?: string;
	className?: string;
}

export function Pip({ pose = 'idle', mood = 'happy', size = 180, cape = true, animated = true, title, className = '' }: PipProps) {
	const id = useId().replace(/:/g, '');
	const p = POSES[pose];
	return (
		<svg
			viewBox="0 0 200 230"
			width={size}
			height={Math.round((size * 230) / 200)}
			className={`overflow-visible ${className}`}
			role={title ? 'img' : undefined}
			aria-label={title}
			aria-hidden={title ? undefined : true}
		>
			<defs>
				<clipPath id={`pip-body-${id}`}>
					<path d={BODY} />
				</clipPath>
				<pattern id={`pip-dots-${id}`} width={6} height={6} patternUnits="userSpaceOnUse">
					<circle cx={3} cy={3} r={1.3} fill="var(--r-blue)" />
				</pattern>
			</defs>
			<ellipse cx={100} cy={214} rx={52} ry={7} fill="var(--r-ink)" opacity={0.14} />
			<g className={animated ? 'r-bob' : undefined}>
				{cape ? (
					<g
						className={animated ? 'r-pin-wiggle' : undefined}
						style={{ transformOrigin: '100px 60px', ['--w-a' as string]: '-2.5deg', ['--w-b' as string]: '2.5deg' } as CSSProperties}
					>
						<path d={CAPE} fill="var(--r-pink)" style={{ filter: 'drop-shadow(0 3px 2px rgb(47 65 112 / .3))' }} />
						<path d={CAPE} fill={`url(#pip-dots-${id})`} opacity={0.25} className="r-multiply" />
					</g>
				) : null}
				<Arm x={63} y={104} angle={p.left} wiggle={p.leftWiggle} animated={animated} delay="-0.6s" />
				<path d={BODY} fill="#fffdf7" style={{ filter: 'drop-shadow(0 4px 3px rgb(47 65 112 / .32))' }} />
				<g clipPath={`url(#pip-body-${id})`}>
					<path d="M128 30C150 70 146 150 116 196L160 196L160 20Z" fill={`url(#pip-dots-${id})`} opacity={0.45} className="r-multiply" />
					<path d="M70 40C74 34 82 31 88 33" fill="none" stroke="#fff" strokeWidth={5} strokeLinecap="round" />
				</g>
				{cape ? (
					<g>
						<path d="M66 60Q100 74 134 60L130 70Q100 82 70 70Z" fill="var(--r-pink)" />
						<SplitPin x={70} y={66} r={4.5} />
						<SplitPin x={130} y={66} r={4.5} />
					</g>
				) : null}
				<circle cx={77} cy={104} r={6.5} fill="var(--r-pink)" opacity={0.55} className="r-multiply" />
				<circle cx={123} cy={104} r={6.5} fill="var(--r-pink)" opacity={0.55} className="r-multiply" />
				<Eyes mood={mood} animated={animated} />
				<Mouth mood={mood} />
				<Arm x={137} y={104} angle={p.right} wiggle={p.rightWiggle} animated={animated} fast={p.fast} delay="0s" brush={pose === 'brush'} />
			</g>
		</svg>
	);
}

/** A small decorative Pip in a paper roundel (booking cards, chips). */
export function PipBadge({ size = 40, pose = 'idle' }: { size?: number; pose?: PipPose }) {
	return (
		<span
			aria-hidden
			className="riso inline-grid shrink-0 place-items-center overflow-hidden rounded-full"
			style={{ width: size, height: size, background: '#ffe1ef', boxShadow: '0 2px 4px rgb(47 65 112 / .25)' }}
		>
			<Pip size={Math.round(size * 0.86)} pose={pose} animated={false} />
		</span>
	);
}
