import Link from 'next/link';
import { BuildingArt } from '@/components/kids/buildings';
import { ChapterMark, INK, InkBlobs, PaperCloud, RisoTitle, Tape, TornEdge } from '@/components/kids/paper';
import { Balloon, Bridge, Bus, Tree } from '@/components/kids/scenery';
import { kidsMinutes, kidsPrice } from '@/lib/kids/format';
import { kidsBookHref, kidsCopy } from '@/lib/kids/kids-config';
import type { KidsService } from '@/lib/kids/kids-data';

/*
 * Chapter one: the store's kids visits as stops on a board-game road through
 * Tooth Town. Desktop: the road snakes left and right through equal-height
 * rows (one SVG path behind them). Phones: a straight road down the left edge.
 */

const ROW = 100;

/** The winding road through n rows, in a 100 × (n·ROW) box. */
function roadPath(n: number): string {
	let d = `M50 0 C50 ${ROW * 0.25} 22 ${ROW * 0.25} 22 ${ROW * 0.5}`;
	for (let i = 1; i < n; i++) {
		const x0 = i % 2 ? 22 : 78;
		const x1 = i % 2 ? 78 : 22;
		const y0 = ROW * (i - 0.5);
		const y1 = ROW * (i + 0.5);
		d += ` C${x0} ${y0 + ROW * 0.5} ${x1} ${y1 - ROW * 0.5} ${x1} ${y1}`;
	}
	const last = (n - 1) % 2 ? 78 : 22;
	d += ` C${last} ${ROW * (n - 0.25)} 50 ${ROW * (n - 0.25)} 50 ${ROW * n}`;
	return d;
}

/** The row boundary the river runs along (the road crosses it at x = 50). */
function riverRow(n: number): number {
	return Math.max(1, Math.floor(n / 2));
}

/** A wavy river across the board at a row boundary. */
function riverPath(n: number): string {
	const y = riverRow(n) * ROW;
	return `M-2 ${y - 18} C20 ${y - 30} 30 ${y + 10} 50 ${y} S80 ${y - 22} 102 ${y - 6}`;
}

function PriceTag({ price, from, currency }: { price: number; from: boolean; currency: string }) {
	return (
		<span className="relative inline-flex flex-col items-center" style={{ transform: 'rotate(6deg)' }}>
			<svg aria-hidden viewBox="0 0 40 26" className="h-5 w-8 overflow-visible">
				<path d="M20 0C12 6 26 14 20 26" fill="none" stroke="var(--r-ink)" strokeWidth={1.2} />
			</svg>
			<span
				className="r-cut -mt-1 flex min-w-[4.6rem] flex-col items-center bg-(--r-sun) px-3 pt-3 pb-2 text-center"
				style={{ clipPath: 'polygon(18% 0, 82% 0, 100% 16%, 100% 100%, 0 100%, 0 16%)' }}
			>
				<span aria-hidden className="mb-1 size-2 rounded-full bg-(--r-paper) shadow-[inset_0_1px_2px_rgb(0_0_0/.35)]" />
				{from && price > 0 ? <span className="text-[0.65rem] font-bold tracking-wider uppercase">from</span> : null}
				<span className="r-brush text-[1.75rem] leading-none">{kidsPrice(price, currency)}</span>
			</span>
		</span>
	);
}

function Stop({ s, i, currency }: { s: KidsService; i: number; currency: string }) {
	const ink = INK[s.tone] ?? 'var(--r-teal)';
	const left = i % 2 === 0;
	const multi = s.options.length > 1;
	return (
		<li className={`relative grid items-center gap-x-8 gap-y-3 pl-16 md:pl-0 ${left ? 'md:grid-cols-[44%_1fr]' : 'md:grid-cols-[1fr_44%]'}`}>
			{/* the square on the road + its building, popping up off the board */}
			<div className={`relative flex flex-col items-center md:py-4 ${left ? '' : 'md:order-2'}`}>
				<div className="r-popup relative w-[min(300px,72vw)] md:w-[96%] md:max-w-[360px]" style={{ ['--d' as string]: '120ms' }}>
					<BuildingArt role={s.role} />
					<Tree className="absolute bottom-[4%] left-[-6%] max-md:hidden" size={58} tone={i % 2 ? 'var(--r-green)' : 'var(--r-teal)'} />
					<Tree className="absolute right-[-4%] bottom-[2%] max-md:hidden" size={44} round={false} tone="var(--r-green)" />
				</div>
				<div
					aria-hidden
					className="r-cut absolute top-6 left-[-3.6rem] grid size-12 place-items-center rounded-[6px] text-white md:static md:mt-[-0.6rem] md:size-16"
					style={{ background: ink, transform: `rotate(${left ? -6 : 5}deg)` }}
				>
					<span className="r-brush text-3xl leading-none md:text-[2.4rem]">{i + 1}</span>
				</div>
			</div>
			{/* the card */}
			<article className={`r-slide relative ${left ? '' : 'md:order-1'}`} style={{ ['--slide-rot' as string]: left ? '2deg' : '-2deg' }}>
				<div className="r-paper r-cut r-lift relative rounded-[3px] p-5 sm:p-7" style={{ ['--lift-rot' as string]: left ? '0.6deg' : '-0.6deg' }}>
					<Tape className="-top-3 left-8" tone={ink} />
					<div className="flex items-start justify-between gap-4">
						<div className="min-w-0">
							<RisoTitle as="p" className="text-[2rem] leading-none sm:text-[2.4rem]" second={ink}>
								{s.place}
							</RisoTitle>
							<h3 className="mt-2 text-lg font-bold">{s.title}</h3>
						</div>
						<PriceTag price={s.fromPrice} from={multi} currency={currency} />
					</div>
					<p className="mt-3 text-[1.02rem] leading-relaxed text-(--r-ink-soft)">{s.kidLine}</p>
					{multi ? (
						<ul className="mt-4 space-y-1.5" aria-label={`${s.title} options`}>
							{s.options.map((o) => (
								<li key={o.slug}>
									<Link href={kidsBookHref({ service: o.slug, clinic: s.branches.length === 1 ? s.branches[0]?.slug : undefined })} className="r-focus group flex items-baseline gap-2 font-bold">
										<span className="group-hover:text-(--r-teal)">{o.label || s.title}</span>
										<span aria-hidden className="mb-1 flex-1 border-b-2 border-dotted border-(--r-ink)/30" />
										<span className="tabular-nums">{kidsPrice(o.price, currency)}</span>
										<span className="text-sm font-normal text-(--r-ink-soft)">· {kidsMinutes(o.minutes)}</span>
									</Link>
								</li>
							))}
						</ul>
					) : null}
					<p className="mt-4 text-sm text-(--r-ink-soft)">
						<span className="font-bold text-(--r-ink)">{kidsMinutes(s.minutes)}</span>
						{s.branches.length > 0 ? <> · at {s.branches.map((b) => b.title.replace(/^Alba\s+/, '')).join(', ')}</> : null}
					</p>
					<div className="mt-5">
						<Link href={kidsBookHref({ service: s.options[0]?.slug, clinic: s.branches.length === 1 ? s.branches[0]?.slug : undefined })} className="r-tag text-sm" style={{ ['--tag' as string]: s.tone === 'sun' ? 'var(--r-ink)' : s.tone === 'pink' ? '#d62b8a' : ink }}>
							Book {s.place}
						</Link>
					</div>
				</div>
			</article>
		</li>
	);
}

export function TownRoad({ services, currency }: { services: KidsService[]; currency: string }) {
	const t = kidsCopy.town;
	const n = Math.max(services.length, 1);
	return (
		<section id="town" aria-labelledby="town-title" className="relative scroll-mt-4">
			<TornEdge color="var(--r-field)" seed={3} />
			<div className="relative overflow-hidden bg-(--r-field) px-4 pt-10 pb-20 sm:px-6">
				<div aria-hidden className="r-halftone pointer-events-none absolute top-[18%] left-[-8%] size-[420px] rounded-full opacity-40" style={{ ['--dot' as string]: 'var(--r-green)' }} />
				<div aria-hidden className="r-halftone pointer-events-none absolute right-[-10%] bottom-[12%] size-[520px] rounded-full opacity-35" style={{ ['--dot' as string]: 'var(--r-teal)' }} />
				<InkBlobs a="var(--r-sun)" b="var(--r-pink)" className="-top-10 right-[-4%] max-md:hidden" size={230} />
				<PaperCloud className="absolute top-[6%] left-[46%] max-md:hidden" width={130} />
				<PaperCloud className="absolute top-[22%] right-[6%] max-md:hidden" width={90} fill="#ffe1ef" />
				<div className="relative mx-auto max-w-6xl">
					<div className="max-w-2xl">
						<ChapterMark n={1} label={t.label} tone="#00804a" />
						<RisoTitle id="town-title" className="mt-3 text-[clamp(2.8rem,7vw,4.8rem)] leading-[0.9]" second="var(--r-teal)">
							{t.title}
						</RisoTitle>
						<p className="mt-4 text-lg leading-relaxed">{t.lead}</p>
					</div>

					{services.length === 0 ? (
						<p className="r-paper mt-10 rounded-[3px] p-6">Tooth Town is being built. Call us to book a kids visit.</p>
					) : (
						<div className="relative mt-12">
							{/* START flag */}
							<div className="relative z-10 mb-4 flex md:justify-center">
								<p className="r-cut inline-flex items-center gap-2 rounded-[3px] bg-(--r-ink) px-4 py-2 font-bold text-white" style={{ transform: 'rotate(-2deg)' }}>
									<span className="r-brush text-2xl leading-none text-(--r-sun)">Start</span>
									{t.start.replace(/^Start here: /, '')}
								</p>
							</div>

							<div className="relative">
								{/* road: desktop snake, with a river crossing under a bridge */}
								<svg aria-hidden viewBox={`0 0 100 ${n * ROW}`} preserveAspectRatio="none" className="pointer-events-none absolute inset-0 size-full max-md:hidden">
									{n > 2 ? (
										<>
											<path d={riverPath(n)} fill="none" stroke="var(--r-blue)" strokeWidth={46} vectorEffect="non-scaling-stroke" opacity={0.75} className="r-multiply" />
											<path d={riverPath(n)} fill="none" stroke="#fff" strokeWidth={2} strokeDasharray="10 16" vectorEffect="non-scaling-stroke" opacity={0.7} />
										</>
									) : null}
									<path d={roadPath(n)} fill="none" stroke="#b79b6c" strokeWidth={66} vectorEffect="non-scaling-stroke" strokeLinecap="round" />
									<path d={roadPath(n)} fill="none" stroke="#f3e6c6" strokeWidth={56} vectorEffect="non-scaling-stroke" strokeLinecap="round" />
									<path d={roadPath(n)} fill="none" stroke="var(--r-pink)" strokeWidth={4} strokeDasharray="14 14" vectorEffect="non-scaling-stroke" opacity={0.85} />
								</svg>
								{n > 2 ? (
									<Bridge className="pointer-events-none absolute -translate-x-1/2 -translate-y-[62%] max-md:hidden" style={{ left: '50%', top: `${(riverRow(n) / n) * 100}%` }} width={120} />
								) : null}
								<Balloon className="r-bob pointer-events-none absolute top-[30%] left-[44%] max-md:hidden" size={62} />
								{/* road: phone, straight down the left */}
								<div aria-hidden className="pointer-events-none absolute top-0 bottom-0 left-4 w-9 rounded-full bg-[#efe3c8] shadow-[0_0_0_4px_#b79b6c] md:hidden">
									<div className="absolute inset-y-2 left-1/2 -translate-x-1/2 border-l-[3px] border-dashed border-(--r-pink)/80" />
								</div>
								<ol className="relative grid gap-12 md:auto-rows-fr md:gap-0">
									{services.map((s, i) => (
										<Stop key={s.key} s={s} i={i} currency={currency} />
									))}
								</ol>
							</div>

							{/* FINISH */}
							<div className="relative z-10 mt-6 flex md:justify-center">
								<Bus className="pointer-events-none absolute bottom-[-14px] left-[4%] max-md:hidden" size={150} />
								<Tree className="pointer-events-none absolute right-[8%] bottom-[-10px] max-md:hidden" size={64} />
								<Tree className="pointer-events-none absolute right-[3%] bottom-[-6px] max-md:hidden" size={48} round={false} tone="var(--r-teal)" />
								<p className="r-cut inline-flex items-center gap-3 rounded-[3px] bg-(--r-paper-2) px-4 py-2 font-bold" style={{ transform: 'rotate(1.5deg)' }}>
									<svg aria-hidden viewBox="0 0 24 24" className="size-7">
										<path d="M5 22V3" stroke="var(--r-ink)" strokeWidth={2} />
										<path d="M5 3h14v9H5z" fill="#fff" />
										<path d="M5 3h3.5v3H5zM12 3h3.5v3H12zM8.5 6H12v3H8.5zM15.5 6H19v3h-3.5zM5 9h3.5v3H5zM12 9h3.5v3H12z" fill="var(--r-ink)" />
									</svg>
									<span className="r-brush text-2xl leading-none text-(--r-pink)">Finish</span>
									{t.finish.replace(/^Finish: /, '')}
								</p>
							</div>
						</div>
					)}
				</div>
			</div>
		</section>
	);
}
