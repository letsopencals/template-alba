/**
 * Teeth as data and as SVG paths: the FDI chart that Alba's motifs are drawn
 * from (footer chart strip, Smile Check arch, the treatment index markers).
 * Pure and isomorphic. Coordinates are rounded so server and client render the
 * same strings (no hydration drift).
 */

export type ToothType = 'incisor' | 'lateral' | 'canine' | 'premolar' | 'molar';

export interface Tooth {
	/** FDI number, e.g. 11 (upper right central incisor), 36 (lower left first molar). */
	fdi: number;
	quadrant: 1 | 2 | 3 | 4;
	/** 1 (central incisor) … 8 (third molar). */
	position: number;
	type: ToothType;
	upper: boolean;
	name: string;
}

const TYPE_BY_POSITION: ToothType[] = ['incisor', 'lateral', 'canine', 'premolar', 'premolar', 'molar', 'molar', 'molar'];
const NAME_BY_POSITION = ['central incisor', 'lateral incisor', 'canine', 'first premolar', 'second premolar', 'first molar', 'second molar', 'wisdom tooth'];
const SIDE = { 1: 'upper right', 2: 'upper left', 3: 'lower left', 4: 'lower right' } as const;

export function tooth(fdi: number): Tooth {
	const quadrant = Math.floor(fdi / 10) as 1 | 2 | 3 | 4;
	const position = fdi % 10;
	return { fdi, quadrant, position, type: TYPE_BY_POSITION[position - 1]!, upper: quadrant <= 2, name: `${SIDE[quadrant]} ${NAME_BY_POSITION[position - 1]}` };
}

/** The upper arch as the patient faces you on a chart: 18 … 11 | 21 … 28. */
export const UPPER_CHART = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
/** The lower arch on a chart: 48 … 41 | 31 … 38. */
export const LOWER_CHART = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

/** Front teeth (incisors + canines) vs back teeth (premolars + molars). */
export function isFront(fdi: number): boolean {
	return fdi % 10 <= 3;
}

const r = (n: number) => Math.round(n * 10) / 10;

/** Relative width of each tooth type on a front-view chart. */
export const FRONT_WIDTH: Record<ToothType, number> = { incisor: 1, lateral: 0.82, canine: 0.9, premolar: 0.86, molar: 1.18 };

/**
 * A front-view tooth silhouette (crown + roots), crown edge at `y + ch`,
 * roots growing up to `y - rh` (upper). For lower teeth, flip with a
 * `scale(1,-1)` transform.
 */
export function frontToothPath(type: ToothType, x: number, w: number, y: number, ch: number, rh: number): string {
	const a = x + w * 0.1;
	const f = x + w * 0.9;
	const m = x + w / 2;
	const yc = y; // cervical line
	const ye = y + ch; // incisal / occlusal edge
	const crown = (() => {
		switch (type) {
			case 'canine':
				return `L ${r(x + w * 0.04)} ${r(y + ch * 0.62)} Q ${r(x + w * 0.2)} ${r(ye)} ${r(m)} ${r(ye + ch * 0.1)} Q ${r(x + w * 0.8)} ${r(ye)} ${r(x + w * 0.96)} ${r(y + ch * 0.62)}`;
			case 'premolar':
				return `L ${r(x + w * 0.04)} ${r(y + ch * 0.66)} Q ${r(x + w * 0.12)} ${r(ye)} ${r(m)} ${r(ye + ch * 0.04)} Q ${r(x + w * 0.88)} ${r(ye)} ${r(x + w * 0.96)} ${r(y + ch * 0.66)}`;
			case 'molar':
				return `L ${r(x + w * 0.03)} ${r(y + ch * 0.7)} Q ${r(x + w * 0.06)} ${r(ye)} ${r(x + w * 0.28)} ${r(ye)} Q ${r(m)} ${r(ye - ch * 0.12)} ${r(x + w * 0.72)} ${r(ye)} Q ${r(x + w * 0.94)} ${r(ye)} ${r(x + w * 0.97)} ${r(y + ch * 0.7)}`;
			default:
				return `L ${r(x + w * 0.03)} ${r(y + ch * 0.8)} Q ${r(x + w * 0.05)} ${r(ye)} ${r(x + w * 0.24)} ${r(ye)} L ${r(x + w * 0.76)} ${r(ye)} Q ${r(x + w * 0.95)} ${r(ye)} ${r(x + w * 0.97)} ${r(y + ch * 0.8)}`;
		}
	})();
	const root =
		type === 'molar'
			? `C ${r(f)} ${r(yc - rh * 0.55)} ${r(x + w * 0.82)} ${r(yc - rh)} ${r(x + w * 0.74)} ${r(yc - rh)} C ${r(x + w * 0.62)} ${r(yc - rh)} ${r(x + w * 0.6)} ${r(yc - rh * 0.4)} ${r(m)} ${r(yc - rh * 0.34)} C ${r(x + w * 0.4)} ${r(yc - rh * 0.4)} ${r(x + w * 0.38)} ${r(yc - rh)} ${r(x + w * 0.26)} ${r(yc - rh)} C ${r(x + w * 0.18)} ${r(yc - rh)} ${r(a)} ${r(yc - rh * 0.55)} ${r(a)} ${r(yc)}`
			: `C ${r(f)} ${r(yc - rh * 0.55)} ${r(m + w * 0.14)} ${r(yc - rh)} ${r(m)} ${r(yc - rh)} C ${r(m - w * 0.14)} ${r(yc - rh)} ${r(a)} ${r(yc - rh * 0.55)} ${r(a)} ${r(yc)}`;
	return `M ${r(a)} ${r(yc)} ${crown} L ${r(f)} ${r(yc)} ${root} Z`;
}

/** Occlusal outline size (relative) for the top-down arch. */
export const OCCLUSAL_SIZE: Record<ToothType, [number, number]> = {
	incisor: [1, 0.62],
	lateral: [0.8, 0.58],
	canine: [0.86, 0.8],
	premolar: [0.86, 0.96],
	molar: [1.18, 1.16],
};

export interface ArchTooth extends Tooth {
	/** Centre in the arch's coordinate space. */
	cx: number;
	cy: number;
	/** Rotation (deg) so the tooth follows the curve. */
	angle: number;
	w: number;
	h: number;
}

/**
 * Lay one arch (16 teeth) along a U curve, top-down, as on a dental chart:
 * the upper arch opens downward (incisors at the top), the lower arch opens
 * upward (incisors at the bottom). The patient's right is on the viewer's left.
 * Units: a 400-wide box; the upper arch spans y 30…~300 from `offsetY`, the
 * lower arch mirrors it.
 */
export function archLayout(upper: boolean, _unit = 26, offsetY = 0): ArchTooth[] {
	const order = upper ? [11, 12, 13, 14, 15, 16, 17, 18] : [41, 42, 43, 44, 45, 46, 47, 48];
	const mirror = upper ? [21, 22, 23, 24, 25, 26, 27, 28] : [31, 32, 33, 34, 35, 36, 37, 38];
	const RX = 152;
	const RY = 196;
	const A = Math.PI * 0.55;
	// Sample the half-arch and measure it, so teeth are placed by arc length and touch.
	const N = 240;
	const pts: { x: number; y: number; len: number }[] = [];
	let len = 0;
	for (let i = 0; i <= N; i++) {
		const ang = (i / N) * A;
		const x = Math.sin(ang) * RX;
		const y = (1 - Math.cos(ang)) * RY;
		if (i > 0) len += Math.hypot(x - pts[i - 1]!.x, y - pts[i - 1]!.y);
		pts.push({ x, y, len });
	}
	const at = (l: number) => {
		const j = Math.max(1, pts.findIndex((p) => p.len >= l));
		const p0 = pts[j - 1]!;
		const p1 = pts[j] ?? p0;
		const f = p1.len > p0.len ? (l - p0.len) / (p1.len - p0.len) : 0;
		return { x: p0.x + (p1.x - p0.x) * f, y: p0.y + (p1.y - p0.y) * f, tangent: (Math.atan2(p1.y - p0.y, p1.x - p0.x) * 180) / Math.PI };
	};
	const widths = order.map((f) => OCCLUSAL_SIZE[tooth(f).type][0]);
	const total = widths.reduce((acc, w) => acc + w, 0);
	const unit = (len * 0.985) / total;
	const out: ArchTooth[] = [];
	let acc = 0;
	for (let i = 0; i < order.length; i++) {
		const wRel = widths[i]!;
		const { x, y, tangent } = at((acc + wRel / 2) * unit);
		acc += wRel;
		const type = tooth(order[i]!).type;
		const [sw, sh] = OCCLUSAL_SIZE[type];
		const cy = upper ? offsetY + 30 + y : offsetY + 30 + RY * (1 - Math.cos(A)) - y;
		for (const [fdi, sx] of [
			[order[i]!, -1],
			[mirror[i]!, 1],
		] as const) {
			out.push({
				...tooth(fdi),
				cx: r(200 + sx * x),
				cy: r(cy),
				angle: r(upper ? sx * tangent : -sx * tangent),
				w: r(sw * unit * 0.94),
				h: r(sh * unit * 0.94),
			});
		}
	}
	return out;
}

/** Height of one arch drawn by `archLayout` (for stacking upper over lower). */
export const ARCH_HEIGHT = Math.round(30 + 196 * (1 - Math.cos(Math.PI * 0.55)) + 30);

/** A rounded occlusal (top-down) tooth outline centred at 0,0. */
export function occlusalPath(type: ToothType, w: number, h: number): string {
	const hw = w / 2;
	const hh = h / 2;
	if (type === 'incisor' || type === 'lateral') {
		// A flat blade, slightly curved.
		return `M ${r(-hw)} ${r(-hh * 0.2)} Q ${r(-hw)} ${r(-hh)} 0 ${r(-hh)} Q ${r(hw)} ${r(-hh)} ${r(hw)} ${r(-hh * 0.2)} Q ${r(hw * 0.9)} ${r(hh)} 0 ${r(hh)} Q ${r(-hw * 0.9)} ${r(hh)} ${r(-hw)} ${r(-hh * 0.2)} Z`;
	}
	if (type === 'canine') {
		return `M 0 ${r(-hh)} Q ${r(hw)} ${r(-hh * 0.7)} ${r(hw)} 0 Q ${r(hw)} ${r(hh)} 0 ${r(hh)} Q ${r(-hw)} ${r(hh)} ${r(-hw)} 0 Q ${r(-hw)} ${r(-hh * 0.7)} 0 ${r(-hh)} Z`;
	}
	// Premolars and molars: a soft rounded square.
	const k = type === 'molar' ? 0.42 : 0.5;
	return `M ${r(-hw + hw * k)} ${r(-hh)} L ${r(hw - hw * k)} ${r(-hh)} Q ${r(hw)} ${r(-hh)} ${r(hw)} ${r(-hh + hh * k)} L ${r(hw)} ${r(hh - hh * k)} Q ${r(hw)} ${r(hh)} ${r(hw - hw * k)} ${r(hh)} L ${r(-hw + hw * k)} ${r(hh)} Q ${r(-hw)} ${r(hh)} ${r(-hw)} ${r(hh - hh * k)} L ${r(-hw)} ${r(-hh + hh * k)} Q ${r(-hw)} ${r(-hh)} ${r(-hw + hw * k)} ${r(-hh)} Z`;
}

/** Fissure lines for a molar/premolar occlusal surface (decoration). */
export function fissurePath(type: ToothType, w: number, h: number): string | null {
	if (type === 'molar') return `M ${r(-w * 0.22)} ${r(-h * 0.05)} L ${r(w * 0.22)} ${r(h * 0.05)} M ${r(-w * 0.05)} ${r(-h * 0.24)} L ${r(w * 0.05)} ${r(h * 0.24)}`;
	if (type === 'premolar') return `M ${r(-w * 0.2)} 0 L ${r(w * 0.2)} 0`;
	return null;
}
