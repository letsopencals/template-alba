import Link from 'next/link';
import { ChapterMark, INK, InkBlobs, RisoTitle, TornEdge } from '@/components/kids/paper';
import { kidsBookHref, kidsCopy, type BuildingTone } from '@/lib/kids/kids-config';
import type { KidsBranch } from '@/lib/kids/kids-data';

/*
 * Chapter five: each kids room as a pop-up diorama, an open paper box with
 * its theme cut out and standing inside.
 */

const SH = { filter: 'drop-shadow(0 3px 2.5px rgb(47 65 112 / .3))' };

function Box({ tone }: { tone: string }) {
	return (
		<g>
			{/* back wall, side walls, floor */}
			<path d="M40 20H200V120H40Z" fill="#fffaf0" />
			<path d="M40 20H200V120H40Z" fill={tone} opacity={0.18} className="r-multiply" />
			<path d="M10 4L40 20V120L10 146Z" fill={tone} opacity={0.55} className="r-multiply" />
			<path d="M230 4L200 20V120L230 146Z" fill={tone} opacity={0.4} className="r-multiply" />
			<path d="M10 146L40 120H200L230 146Z" fill={tone} opacity={0.75} className="r-multiply" />
		</g>
	);
}

function CloudTheme() {
	return (
		<g>
			{(
				[
					[62, 38],
					[120, 30],
					[176, 44],
					[90, 62],
					[156, 66],
				] as const
			).map(([x, y], i) => (
				<path key={i} d={`M${x} ${y - 6}L${x + 2} ${y - 2}L${x + 6} ${y}L${x + 2} ${y + 2}L${x} ${y + 6}L${x - 2} ${y + 2}L${x - 6} ${y}L${x - 2} ${y - 2}Z`} fill="var(--r-sun)" />
			))}
			<g style={SH}>
				<path d="M70 110c-8 0-10-8-5-11 1-8 10-11 16-7 4-7 15-7 18 1 7-2 12 4 10 9 5 2 4 8-1 8z" fill="#fff" />
				<path d="M140 104h36v16h-36z" fill="var(--r-blue)" />
				<path d="M136 104h44v-4h-44z" fill="var(--r-pink)" />
			</g>
		</g>
	);
}

function GardenTheme() {
	return (
		<g>
			<g style={SH}>
				{/* the reading nook in a giant tooth */}
				<path d="M86 120C82 86 90 46 116 46C128 46 132 54 134 58C136 54 140 46 152 46C178 46 186 86 182 120Z" fill="#fff" />
				<path d="M112 120V96Q134 80 156 96V120Z" fill="var(--r-green)" opacity={0.85} />
			</g>
			{[54, 196].map((x) => (
				<g key={x} style={SH}>
					<path d={`M${x} 120V96`} stroke="var(--r-green)" strokeWidth={3} />
					<ellipse cx={x - 6} cy={98} rx={8} ry={4} fill="var(--r-green)" transform={`rotate(-30 ${x - 6} 98)`} />
					<ellipse cx={x + 6} cy={92} rx={8} ry={4} fill="var(--r-green)" transform={`rotate(30 ${x + 6} 92)`} />
					<circle cx={x} cy={86} r={6} fill="var(--r-pink)" />
				</g>
			))}
		</g>
	);
}

function RocketTheme() {
	return (
		<g>
			<circle cx={70} cy={42} r={12} fill="var(--r-sun)" className="r-multiply" />
			<circle cx={182} cy={36} r={6} fill="var(--r-blue)" className="r-multiply" />
			<g style={SH} transform="rotate(18 124 76)">
				<path d="M124 30C140 44 144 70 140 96H108C104 70 108 44 124 30Z" fill="#fff" />
				<circle cx={124} cy={62} r={8} fill="var(--r-blue)" stroke="var(--r-ink)" strokeWidth={2} />
				<path d="M108 82L96 100H110ZM140 82L152 100H138Z" fill="var(--r-pink)" />
				<path d="M112 96Q124 120 136 96Z" fill="var(--r-orange)" />
			</g>
		</g>
	);
}

function SunTheme() {
	return (
		<g style={SH}>
			<circle cx={120} cy={64} r={20} fill="var(--r-sun)" />
			<path d="M80 120h80v-16H80z" fill="var(--r-teal)" />
		</g>
	);
}

const THEMES: Record<string, () => React.ReactNode> = {
	marylebone: CloudTheme,
	'notting-hill': GardenTheme,
	clapham: RocketTheme,
};

export function RoomDioramas({ branches }: { branches: KidsBranch[] }) {
	const t = kidsCopy.rooms;
	if (branches.length === 0) return null;
	return (
		<section id="rooms" aria-labelledby="rooms-title" className="relative scroll-mt-4">
			<TornEdge color="var(--r-wash-peach)" seed={53} />
			<div className="relative overflow-hidden bg-(--r-wash-peach) px-4 pt-10 pb-20 sm:px-6">
				<InkBlobs a="var(--r-green)" b="var(--r-blue)" className="-top-16 right-[-4%] max-md:hidden" size={230} />
				<div className="relative mx-auto max-w-6xl">
					<div className="max-w-2xl">
						<ChapterMark n={5} label={t.label} tone="#d4531c" />
						<RisoTitle id="rooms-title" className="mt-3 text-[clamp(2.8rem,7vw,4.8rem)] leading-[0.9]" second="var(--r-green)">
							{t.title}
						</RisoTitle>
						<p className="mt-4 text-lg leading-relaxed">{t.lead}</p>
					</div>
					<ul className="mt-12 grid gap-8 md:grid-cols-3 md:gap-6">
						{branches.map((b, i) => {
							const ink = INK[b.tone as BuildingTone] ?? 'var(--r-teal)';
							const Theme = THEMES[b.slug] ?? SunTheme;
							return (
								<li key={b.slug} className={`r-popup-late ${i % 3 === 1 ? 'md:mt-14' : i % 3 === 2 ? 'md:mt-6' : ''}`} style={{ ['--d' as string]: `${i * 140}ms` }}>
									<article className="r-paper r-cut flex h-full flex-col rounded-[3px] p-4 pb-6" style={{ transform: `rotate(${[-1.5, 1.2, -0.8][i % 3]}deg)` }}>
										<svg viewBox="0 0 240 150" className="w-full" role="img" aria-label={`${b.nickname}, a pop-up picture of the room`}>
											<Box tone={ink} />
											<Theme />
										</svg>
										<div className="px-2">
											<RisoTitle as="h3" className="mt-3 text-[2.1rem] leading-none" second={ink}>
												{b.nickname}
											</RisoTitle>
											<p className="mt-1 font-bold">{b.title}</p>
											{b.addressLines.length > 0 ? <p className="text-sm text-(--r-ink-soft)">{b.addressLines.join(', ')}</p> : null}
											<ul className="mt-4 space-y-2">
												{b.features.map((f) => (
													<li key={f} className="flex gap-2.5">
														<svg aria-hidden viewBox="0 0 20 20" className="mt-0.5 size-5 shrink-0">
															<path d="M3 11l4 4 10-11" fill="none" stroke={ink} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" className="r-multiply" />
														</svg>
														<span>{f}</span>
													</li>
												))}
											</ul>
										</div>
										<div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 px-2 pt-6">
											<Link href={kidsBookHref({ clinic: b.slug })} className="r-tag text-sm">
												Book here
											</Link>
											<Link href={`/clinics/${b.slug}`} className="r-quiet text-sm">
												Branch details
											</Link>
										</div>
									</article>
								</li>
							);
						})}
					</ul>
				</div>
			</div>
		</section>
	);
}
