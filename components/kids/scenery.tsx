import type { CSSProperties } from 'react';

/*
 * Tooth Town scenery cut from paper: trees, a double-decker bus, a bridge and
 * the happy-air balloon. Decorative SVG, positioned by the caller.
 */

const SH = { filter: 'drop-shadow(0 3px 2.5px rgb(47 65 112 / .3))' };

export function Tree({ className = '', style, tone = 'var(--r-green)', size = 70, round = true }: { className?: string; style?: CSSProperties; tone?: string; size?: number; round?: boolean }) {
	return (
		<svg aria-hidden viewBox="0 0 60 80" width={size} height={Math.round((size * 80) / 60)} className={className} style={style}>
			<g style={SH}>
				<rect x={27} y={44} width={6} height={34} rx={2} fill="#8a5a2b" />
				{round ? <circle cx={30} cy={30} r={24} fill={tone} /> : <path d="M30 2L56 54H4Z" fill={tone} />}
			</g>
			{round ? <circle cx={38} cy={36} r={14} fill="var(--r-blue)" opacity={0.35} className="r-multiply" /> : <path d="M30 2L56 54H34Z" fill="var(--r-blue)" opacity={0.3} className="r-multiply" />}
		</svg>
	);
}

export function Bus({ className = '', style, size = 130 }: { className?: string; style?: CSSProperties; size?: number }) {
	return (
		<svg aria-hidden viewBox="0 0 130 90" width={size} height={Math.round((size * 90) / 130)} className={className} style={style}>
			<g style={SH}>
				<rect x={6} y={8} width={118} height={66} rx={10} fill="#e8322b" />
				<rect x={6} y={40} width={118} height={4} fill="#b8231e" />
			</g>
			{[0, 1, 2, 3, 4].map((k) => (
				<rect key={`u${k}`} x={14 + k * 21} y={16} width={16} height={16} rx={3} fill="#cfe7f7" />
			))}
			{[0, 1, 2, 3].map((k) => (
				<rect key={`d${k}`} x={14 + k * 21} y={50} width={16} height={14} rx={3} fill="#cfe7f7" />
			))}
			<rect x={100} y={50} width={16} height={22} rx={2} fill="var(--r-sun)" />
			<g style={SH}>
				<circle cx={32} cy={76} r={9} fill="var(--r-ink)" />
				<circle cx={100} cy={76} r={9} fill="var(--r-ink)" />
			</g>
			<circle cx={32} cy={76} r={3.5} fill="#d9d9d9" />
			<circle cx={100} cy={76} r={3.5} fill="#d9d9d9" />
			<rect x={6} y={28} width={118} height={6} fill="var(--r-pink)" opacity={0.45} className="r-multiply" />
		</svg>
	);
}

export function Bridge({ className = '', style, width = 110 }: { className?: string; style?: CSSProperties; width?: number }) {
	return (
		<svg aria-hidden viewBox="0 0 110 50" width={width} height={Math.round((width * 50) / 110)} className={className} style={style}>
			<g style={SH}>
				<path d="M2 30Q55 0 108 30V40Q55 12 2 40Z" fill="var(--r-orange)" />
				{[16, 32, 48, 62, 78, 94].map((x) => (
					<rect key={x} x={x - 2} y={14 + Math.abs(55 - x) * 0.22} width={4} height={14} fill="var(--r-orange)" />
				))}
				<path d="M2 16Q55 -12 108 16" fill="none" stroke="var(--r-orange)" strokeWidth={4} />
			</g>
		</svg>
	);
}

export function Balloon({ className = '', style, size = 70 }: { className?: string; style?: CSSProperties; size?: number }) {
	return (
		<svg aria-hidden viewBox="0 0 60 90" width={size} height={Math.round((size * 90) / 60)} className={className} style={style}>
			<g style={SH}>
				<path d="M30 4C14 4 4 16 4 30C4 46 20 56 26 64H34C40 56 56 46 56 30C56 16 46 4 30 4Z" fill="var(--r-pink)" />
				<path d="M30 4C24 14 22 40 26 64H34C38 40 36 14 30 4Z" fill="var(--r-sun)" className="r-multiply" />
				<rect x={23} y={72} width={14} height={12} rx={2} fill="#8a5a2b" />
			</g>
			<path d="M26 64L24 72M34 64L36 72" stroke="var(--r-ink)" strokeWidth={1.2} />
		</svg>
	);
}
