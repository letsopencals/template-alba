import type { ReactNode } from 'react';
import type { Building } from '@/lib/kids/kids-config';

/*
 * Tooth Town's buildings, one per kind of kids visit, cut from paper: flat ink
 * shapes with soft shadows, a halftone shade and a little sign-free detail.
 * Server-safe SVG. 160×140 box; the ground line is at y=128.
 */

const SH = { filter: 'drop-shadow(0 3px 2.5px rgb(47 65 112 / .3))' };

function Ground({ tone }: { tone: string }) {
	return (
		<g>
			<ellipse cx={80} cy={130} rx={70} ry={8} fill="var(--r-ink)" opacity={0.12} />
			<path d="M10 128Q40 118 80 122Q120 118 150 128L150 136L10 136Z" fill={tone} opacity={0.9} className="r-multiply" />
		</g>
	);
}

function Dots({ d, color = 'var(--r-blue)', opacity = 0.35 }: { d: string; color?: string; opacity?: number }) {
	return (
		<path
			d={d}
			fill="none"
			stroke={color}
			strokeWidth={3}
			strokeDasharray="0.1 5"
			strokeLinecap="round"
			opacity={opacity}
			className="r-multiply"
		/>
	);
}

function Window({ x, y, w = 14, h = 16 }: { x: number; y: number; w?: number; h?: number }) {
	return (
		<g>
			<rect x={x} y={y} width={w} height={h} rx={w / 2} fill="var(--r-ink)" />
			<rect x={x + 2.5} y={y + 2.5} width={w - 5} height={h - 4} rx={(w - 5) / 2} fill="var(--r-sun)" />
		</g>
	);
}

function Flag({ x, y, tone }: { x: number; y: number; tone: string }) {
	return (
		<g>
			<path d={`M${x} ${y}L${x} ${y - 22}`} stroke="var(--r-ink)" strokeWidth={2} />
			<path d={`M${x} ${y - 22}L${x + 16} ${y - 17}L${x} ${y - 12}Z`} fill={tone} />
		</g>
	);
}

/** Check-up Castle. */
function Castle() {
	return (
		<g>
			<Ground tone="var(--r-green)" />
			<g style={SH}>
				<path d="M28 128V62H50V128Z" fill="var(--r-blue)" />
				<path d="M110 128V62H132V128Z" fill="var(--r-blue)" />
				<path d="M26 62h6v-7h5v7h4v-7h5v7h6v-9H26z" fill="var(--r-blue)" />
				<path d="M108 62h6v-7h5v7h4v-7h5v7h6v-9h-26z" fill="var(--r-blue)" />
				<path d="M48 128V44H112V128Z" fill="#fffdf7" />
				<path d="M46 44h8v-8h7v8h6v-8h7v8h6v-8h7v8h6v-8h7v8h8v-11H46z" fill="#fffdf7" />
			</g>
			<Dots d="M100 50V124M106 50V124" />
			<path d="M70 128V100Q80 88 90 100V128Z" fill="var(--r-pink)" />
			{/* a big tooth over the gate */}
			<path d="M70 62C70 54 78 52 80 57C82 52 90 54 90 62C90 70 88 76 86 82C85 86 82 86 81 80C80 86 76 86 75 82C72 76 70 70 70 62Z" fill="#fff" stroke="var(--r-teal)" strokeWidth={2} />
			<Window x={33} y={78} />
			<Window x={115} y={78} />
			<Flag x={80} y={33} tone="var(--r-pink)" />
		</g>
	);
}

/** The Sparkle Wash. */
function Wash() {
	return (
		<g>
			<Ground tone="var(--r-teal)" />
			<g style={SH}>
				<path d="M22 128V70Q80 26 138 70V128Z" fill="var(--r-pink)" />
				<path d="M40 128V82Q80 52 120 82V128Z" fill="#fffdf7" />
			</g>
			<Dots d="M28 76Q80 36 132 76" color="#fff" opacity={0.7} />
			{[0, 1, 2, 3, 4].map((i) => (
				<rect key={i} x={50 + i * 13} y={84} width={7} height={40} rx={3.5} fill={i % 2 ? 'var(--r-blue)' : 'var(--r-teal)'} opacity={0.85} className="r-multiply" />
			))}
			{([
				[34, 46, 7],
				[24, 30, 5],
				[132, 40, 8],
				[144, 24, 5],
				[120, 22, 4],
			] as const).map(([cx, cy, r]) => (
				<circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} fill="#fff" stroke="var(--r-blue)" strokeWidth={1.5} opacity={0.95} />
			))}
		</g>
	);
}

/** Shield Station (sealants). */
function Shield() {
	return (
		<g>
			<Ground tone="var(--r-sun)" />
			<g style={SH}>
				<path d="M30 128V74H130V128Z" fill="var(--r-sun)" />
				<path d="M24 76L80 40L136 76Z" fill="var(--r-orange)" />
			</g>
			<Dots d="M36 80H124M36 86H124" color="var(--r-orange)" />
			<path d="M80 84L100 92V106C100 116 90 122 80 126C70 122 60 116 60 106V92Z" fill="#fffdf7" style={SH} />
			<path d="M80 92L93 97V106C93 112 87 116 80 119C73 116 67 112 67 106V97Z" fill="var(--r-teal)" />
			<path d="M73 105L78 110L88 99" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
			<Window x={38} y={90} />
			<Window x={108} y={90} />
		</g>
	);
}

/** Smile Observatory (orthodontic first look). */
function Observatory() {
	return (
		<g>
			<Ground tone="var(--r-blue)" />
			<g style={SH}>
				<path d="M36 128V82H124V128Z" fill="#fffdf7" />
				<path d="M34 84Q34 34 80 34Q126 34 126 84Z" fill="var(--r-teal)" />
			</g>
			<path d="M76 36H84V84H76Z" fill="var(--r-ink)" opacity={0.8} />
			<g style={SH}>
				<rect x={84} y={18} width={44} height={14} rx={6} transform="rotate(-24 84 30)" fill="var(--r-pink)" />
			</g>
			<Dots d="M44 72Q48 46 70 40" color="#fff" opacity={0.6} />
			<path d="M64 128V104Q80 92 96 104V128Z" fill="var(--r-blue)" />
			{([
				[22, 26],
				[140, 14],
				[34, 52],
				[148, 48],
			] as const).map(([x, y]) => (
				<path key={`${x}-${y}`} d={`M${x} ${y - 6}L${x + 2} ${y - 2}L${x + 6} ${y}L${x + 2} ${y + 2}L${x} ${y + 6}L${x - 2} ${y + 2}L${x - 6} ${y}L${x - 2} ${y - 2}Z`} fill="var(--r-sun)" />
			))}
		</g>
	);
}

/** Little Steps Garden (first visit). */
function Garden() {
	return (
		<g>
			<Ground tone="var(--r-green)" />
			<g style={SH}>
				<path d="M44 128V76H116V128Z" fill="#fffdf7" />
				<path d="M38 80L80 48L122 80Z" fill="var(--r-green)" />
			</g>
			<path d="M70 128V104Q80 96 90 104V128Z" fill="var(--r-orange)" />
			<Window x={52} y={90} />
			<Window x={94} y={90} />
			{([
				[22, 'var(--r-pink)'],
				[34, 'var(--r-sun)'],
				[128, 'var(--r-pink)'],
				[140, 'var(--r-sun)'],
			] as const).map(([x, c]) => (
				<g key={String(x)}>
					<path d={`M${x} 128V108`} stroke="var(--r-green)" strokeWidth={2.5} />
					<circle cx={Number(x)} cy={104} r={6} fill={String(c)} style={SH} />
					<circle cx={Number(x)} cy={104} r={2.2} fill="#fff" />
				</g>
			))}
			<path d="M80 30C80 22 88 20 90 25C92 20 100 22 100 30C100 38 96 44 94 46C92 42 88 42 86 46C84 44 80 38 80 30Z" fill="#fff" stroke="var(--r-pink)" strokeWidth={2} transform="translate(-10 0)" />
		</g>
	);
}

/** The Welcome Room (tour). */
function Welcome() {
	return (
		<g>
			<Ground tone="var(--r-orange)" />
			<g style={SH}>
				<path d="M30 128V68H130V128Z" fill="var(--r-orange)" />
				<path d="M24 70Q80 36 136 70Z" fill="var(--r-sun)" />
			</g>
			<Dots d="M40 74H120" color="#fff" opacity={0.7} />
			<path d="M64 128V92H96V128Z" fill="#fffdf7" />
			<circle cx={90} cy={112} r={2.2} fill="var(--r-ink)" />
			{/* bunting */}
			<path d="M30 70Q80 92 130 70" fill="none" stroke="var(--r-ink)" strokeWidth={1.2} />
			{[42, 58, 74, 90, 106, 120].map((x, i) => (
				<path key={x} d={`M${x - 5} ${73 + Math.round(Math.sin((i / 5) * Math.PI) * 9)}L${x + 5} ${73 + Math.round(Math.sin((i / 5) * Math.PI) * 9)}L${x} ${83 + Math.round(Math.sin((i / 5) * Math.PI) * 9)}Z`} fill={i % 2 ? 'var(--r-pink)' : 'var(--r-teal)'} />
			))}
			<Window x={38} y={92} />
			<Window x={108} y={92} />
		</g>
	);
}

/** A plain Tooth Town house for anything else. */
function House() {
	return (
		<g>
			<Ground tone="var(--r-teal)" />
			<g style={SH}>
				<path d="M40 128V74H120V128Z" fill="#fffdf7" />
				<path d="M32 78L80 42L128 78Z" fill="var(--r-blue)" />
			</g>
			<path d="M70 128V100H90V128Z" fill="var(--r-pink)" />
			<Window x={48} y={88} />
			<Window x={98} y={88} />
		</g>
	);
}

const SCENES: Record<Building['role'], () => ReactNode> = {
	'check-up': Castle,
	clean: Wash,
	sealants: Shield,
	orthodontic: Observatory,
	'first-visit': Garden,
	tour: Welcome,
	other: House,
};

export function BuildingArt({ role, className = '', title }: { role: Building['role']; className?: string; title?: string }) {
	const Scene = SCENES[role] ?? House;
	return (
		<svg viewBox="0 0 160 140" className={`overflow-visible ${className}`} role={title ? 'img' : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
			<Scene />
		</svg>
	);
}
