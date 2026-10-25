import type { ReactNode } from 'react';
import { Pip, type PipMood, type PipPose } from '@/components/kids/pip';
import { ChapterMark, InkBlobs, PaperStar, RisoTitle, TornEdge } from '@/components/kids/paper';
import { kidsCopy } from '@/lib/kids/kids-config';

/*
 * Chapter two: the first visit as a fold-out (concertina) leaflet. Four
 * panels with alternating fold shading that unfold as they scroll in; on
 * phones they become pages you swipe through.
 */

type Scene = (typeof kidsCopy.story.pages)[number]['scene'];

const SH = { filter: 'drop-shadow(0 3px 2.5px rgb(47 65 112 / .28))' };

function HelloScene() {
	return (
		<svg viewBox="0 0 220 150" className="absolute inset-0 size-full" aria-hidden>
			<rect x={0} y={112} width={220} height={38} fill="var(--r-teal)" opacity={0.85} className="r-multiply" />
			<g style={SH}>
				<path d="M20 112V74H140V112Z" fill="var(--r-orange)" />
				<path d="M14 74H146V66H14Z" fill="#fffdf7" />
			</g>
			{/* the passport on the desk */}
			<g transform="rotate(-8 70 58)" style={SH}>
				<rect x={52} y={44} width={34} height={24} rx={2} fill="var(--r-blue)" />
				<path d="M69 50C66 50 64 52 64 55C64 59 67 62 69 63C71 62 74 59 74 55C74 52 72 50 69 50Z" fill="var(--r-sun)" />
			</g>
			<circle cx={180} cy={30} r={16} fill="var(--r-sun)" className="r-multiply" />
		</svg>
	);
}

function ChairScene() {
	return (
		<svg viewBox="0 0 220 150" className="absolute inset-0 size-full" aria-hidden>
			<rect x={0} y={122} width={220} height={28} fill="var(--r-blue)" opacity={0.75} className="r-multiply" />
			<g style={SH}>
				<path d="M40 122H120V114H40Z" fill="var(--r-ink)" />
				<path d="M74 114V92H86V114Z" fill="var(--r-ink)" />
				<path d="M30 92Q30 78 46 78H130Q146 78 150 64L158 40Q162 30 170 34Q176 38 174 48L164 80Q158 96 140 96H44Q30 96 30 92Z" fill="var(--r-teal)" />
			</g>
			{/* arrows: up up up */}
			{[0, 1, 2].map((i) => (
				<path key={i} d={`M${22 + i * 10} ${70 - i * 14}l6-8 6 8`} fill="none" stroke="var(--r-pink)" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
			))}
			{/* the big light, wearing sunglasses */}
			<g style={SH}>
				<path d="M196 0V24" stroke="var(--r-ink)" strokeWidth={3} />
				<ellipse cx={196} cy={30} rx={18} ry={9} fill="var(--r-sun)" />
			</g>
		</svg>
	);
}

function CountScene() {
	return (
		<svg viewBox="0 0 220 150" className="absolute inset-0 size-full" aria-hidden>
			<rect x={0} y={118} width={220} height={32} fill="var(--r-green)" opacity={0.8} className="r-multiply" />
			{/* a row of teeth, numbered with dots */}
			{[0, 1, 2, 3, 4].map((i) => (
				<g key={i} style={SH} transform={`translate(${18 + i * 26} ${30 + (i % 2) * 6})`}>
					<path d="M2 8C2 0 10 -1 12 4C14 -1 22 0 22 8C22 16 20 22 18 26C17 30 14 30 13 24C12 30 9 30 8 26C5 22 2 16 2 8Z" fill="#fffdf7" />
					<text x={12} y={14} textAnchor="middle" fontSize={9} fontWeight={700} fill="var(--r-pink)">
						{i + 1}
					</text>
				</g>
			))}
			{/* Mr Mirror */}
			<g transform="rotate(24 180 70)" style={SH}>
				<rect x={176} y={70} width={8} height={50} rx={4} fill="var(--r-pink)" />
				<circle cx={180} cy={64} r={16} fill="#d8ecf3" stroke="var(--r-ink)" strokeWidth={3} />
				<circle cx={175} cy={60} r={2.2} fill="var(--r-ink)" />
				<circle cx={185} cy={60} r={2.2} fill="var(--r-ink)" />
				<path d="M174 68Q180 73 186 68" fill="none" stroke="var(--r-ink)" strokeWidth={2} strokeLinecap="round" />
			</g>
		</svg>
	);
}

function StampScene() {
	return (
		<svg viewBox="0 0 220 150" className="absolute inset-0 size-full" aria-hidden>
			<rect x={0} y={120} width={220} height={30} fill="var(--r-pink)" opacity={0.7} className="r-multiply" />
			{/* open passport */}
			<g style={SH} transform="rotate(-4 70 80)">
				<path d="M14 54H70V112H14Z" fill="#fffdf7" />
				<path d="M70 54H126V112H70Z" fill="#fbf2df" />
				<path d="M70 54V112" stroke="var(--r-ink)" strokeOpacity={0.3} />
				<g transform="rotate(-14 98 82)">
					<circle cx={98} cy={82} r={17} fill="none" stroke="var(--r-pink)" strokeWidth={3} strokeDasharray="5 2" />
					<path d="M90 82l6 6 10-12" fill="none" stroke="var(--r-pink)" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" />
				</g>
			</g>
			{/* toothbrush */}
			<g transform="rotate(-30 170 70)" style={SH}>
				<rect x={164} y={40} width={10} height={70} rx={5} fill="var(--r-sun)" />
				<rect x={162} y={30} width={14} height={14} rx={2} fill="#fff" stroke="var(--r-blue)" strokeWidth={1.5} />
			</g>
		</svg>
	);
}

const SCENES: Record<Scene, { art: () => ReactNode; pose: PipPose; mood: PipMood; tint: string; pip: string }> = {
	hello: { art: HelloScene, pose: 'wave', mood: 'grin', tint: '#fff4d6', pip: 'right-[6%] bottom-[10%]' },
	chair: { art: ChairScene, pose: 'cheer', mood: 'wow', tint: '#e6f2ff', pip: 'left-[30%] bottom-[30%]' },
	count: { art: CountScene, pose: 'point', mood: 'happy', tint: '#e6f7ee', pip: 'left-[6%] bottom-[8%]' },
	stamp: { art: StampScene, pose: 'cheer', mood: 'grin', tint: '#ffe6f2', pip: 'right-[4%] bottom-[12%]' },
};

export function FirstVisitFold() {
	const t = kidsCopy.story;
	return (
		<section id="first-visit" aria-labelledby="first-visit-title" className="relative scroll-mt-4">
			<TornEdge color="var(--r-wash-sun)" seed={17} />
			<div className="relative overflow-hidden bg-(--r-wash-sun) px-4 pt-10 pb-20 sm:px-6">
				<InkBlobs a="var(--r-orange)" b="var(--r-pink)" className="-top-20 right-[-5%] max-md:hidden" size={240} />
				<div className="relative mx-auto max-w-6xl">
					<div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
						<div className="max-w-2xl">
							<ChapterMark n={2} label={t.label} tone="#c98a00" />
							<RisoTitle id="first-visit-title" className="mt-3 text-[clamp(2.8rem,7vw,4.8rem)] leading-[0.9]" second="var(--r-sun)">
								{t.title}
							</RisoTitle>
							<p className="mt-4 text-lg leading-relaxed">{t.lead}</p>
						</div>
						<p className="text-sm font-bold text-(--r-ink-soft) md:hidden">Swipe to turn the pages →</p>
					</div>

					<ol className="r-noscrollbar mt-10 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-4 md:grid md:grid-cols-4 md:gap-0 md:overflow-visible md:pb-0">
						{t.pages.map((p, i) => {
							const s = SCENES[p.scene];
							const Art = s.art;
							const even = i % 2 === 0;
							return (
								<li
									key={p.scene}
									className="r-unfold w-[80vw] max-w-[340px] shrink-0 snap-center md:w-auto md:max-w-none"
									style={{ ['--unfold-from' as string]: even ? '-62deg' : '62deg', ['--unfold-origin' as string]: even ? '100% 50%' : '0% 50%' }}
								>
									<div
										className="relative h-full overflow-hidden bg-(--r-paper-2) shadow-[0_1px_1px_rgb(47_65_112/.12),0_10px_22px_-12px_rgb(47_65_112/.4)] max-md:rounded-[3px]"
										style={{
											backgroundImage: even
												? 'linear-gradient(90deg, rgb(47 65 112 / .02), rgb(47 65 112 / .1))'
												: 'linear-gradient(90deg, rgb(255 255 255 / .5), rgb(47 65 112 / .02))',
										}}
									>
										<div className="relative aspect-[22/15] overflow-hidden" style={{ background: s.tint }}>
											<Art />
											<div className={`absolute ${s.pip}`}>
												<Pip size={78} pose={s.pose} mood={s.mood} />
											</div>
										</div>
										<div className="p-5 pb-7">
											<p className="flex items-center gap-2 text-xs font-bold tracking-[0.16em] text-(--r-ink-soft) uppercase">
												Page {i + 1}
												{i === t.pages.length - 1 ? <PaperStar size={14} fill="var(--r-pink)" /> : null}
											</p>
											<h3 className="r-brush mt-1 text-[2.1rem] leading-none">{p.title}</h3>
											<p className="mt-2 leading-relaxed text-(--r-ink-soft)">{p.text}</p>
										</div>
									</div>
								</li>
							);
						})}
					</ol>
				</div>
			</div>
		</section>
	);
}
