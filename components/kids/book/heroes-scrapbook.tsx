import { ChapterMark, INK, InkBlobs, PaperStar, RisoTitle, Tape, TornEdge, seeded } from '@/components/kids/paper';
import { HeroPhoto } from '@/components/kids/book/hero-photo';
import { TONE_ORDER, kidsCopy } from '@/lib/kids/kids-config';
import type { KidsHero } from '@/lib/kids/kids-data';

/*
 * Chapter four: the Tooth Heroes pasted into a two-page scrapbook spread.
 * Cut-outs of different sizes, tilted and overlapping: some taped-in torn
 * portraits, some mounted photos with corner mounts, each with a note.
 */

function tornFrame(seed: number): string {
	const rand = seeded(seed);
	const pts: string[] = [];
	const j = () => Math.round(rand() * 2.6 * 10) / 10;
	for (let x = 0; x <= 100; x += 7) pts.push(`${Math.min(100, x)}% ${j()}%`);
	for (let y = 0; y <= 100; y += 7) pts.push(`${100 - j()}% ${Math.min(100, y)}%`);
	for (let x = 100; x >= 0; x -= 7) pts.push(`${Math.max(0, x)}% ${100 - j()}%`);
	for (let y = 100; y >= 0; y -= 7) pts.push(`${j()}% ${Math.max(0, y)}%`);
	return `polygon(${pts.join(', ')})`;
}

/** Size, tilt and nudge per position on a page: deliberately uneven. */
const SLOTS = [
	{ w: 'w-[58%]', rot: -3, cls: 'z-[6]' },
	{ w: 'w-[40%]', rot: 4, cls: 'ml-[1%] mt-[14%] z-[5]' },
	{ w: 'w-[44%]', rot: 2.5, cls: '-mt-[4%] ml-[2%] z-[4]' },
	{ w: 'w-[50%]', rot: -2, cls: 'ml-[1%] mt-[8%] z-[3]' },
	{ w: 'w-[50%]', rot: -4, cls: '-mt-[2%] z-[2]' },
	{ w: 'w-[42%]', rot: 3.5, cls: 'ml-[2%] mt-[12%] z-[1]' },
];

function TornCut({ hero, i }: { hero: KidsHero; i: number }) {
	const ink = INK[TONE_ORDER[i % TONE_ORDER.length]!]!;
	return (
		<div className="relative">
			<div className="relative aspect-[4/5]" style={{ clipPath: tornFrame(i * 31 + 5), background: ink }}>
				<span className="absolute inset-[5%]" style={{ clipPath: tornFrame(i * 31 + 9) }}>
					<HeroPhoto src={hero.imageUrl} name={hero.name} ink={ink} className="size-full" />
				</span>
			</div>
			<Tape className="-top-2.5 left-1/2 -translate-x-1/2" tone={INK[TONE_ORDER[(i + 2) % TONE_ORDER.length]!]} style={{ transform: 'rotate(-4deg)' }} />
		</div>
	);
}

function MountedPhoto({ hero, i }: { hero: KidsHero; i: number }) {
	const ink = INK[TONE_ORDER[i % TONE_ORDER.length]!]!;
	const corner = 'absolute size-5 bg-(--r-ink)/85';
	return (
		<div className="relative bg-[#fffdf6] p-[6%] pb-[4%] shadow-[0_2px_3px_rgb(47_65_112/.2),0_10px_18px_-10px_rgb(47_65_112/.45)]">
			<HeroPhoto src={hero.imageUrl} name={hero.name} ink={ink} className="aspect-square w-full" />
			<span aria-hidden className={`${corner} top-1 left-1`} style={{ clipPath: 'polygon(0 0,100% 0,0 100%)' }} />
			<span aria-hidden className={`${corner} top-1 right-1`} style={{ clipPath: 'polygon(0 0,100% 0,100% 100%)' }} />
			<span aria-hidden className={`${corner} bottom-1 left-1`} style={{ clipPath: 'polygon(0 0,0 100%,100% 100%)' }} />
			<span aria-hidden className={`${corner} right-1 bottom-1`} style={{ clipPath: 'polygon(100% 0,0 100%,100% 100%)' }} />
		</div>
	);
}

function Cutting({ hero, i, slot }: { hero: KidsHero; i: number; slot: (typeof SLOTS)[number] }) {
	const ink = INK[TONE_ORDER[i % TONE_ORDER.length]!]!;
	const torn = i % 2 === 0;
	return (
		<li className={`r-slide relative min-w-[150px] ${slot.w} ${slot.cls}`} style={{ ['--slide-rot' as string]: `${slot.rot}deg`, ['--d' as string]: `${(i % 6) * 80}ms` }}>
			<article className="r-lift" style={{ transform: `rotate(${slot.rot}deg)`, ['--lift-rot' as string]: '0deg' }}>
				{torn ? <TornCut hero={hero} i={i} /> : <MountedPhoto hero={hero} i={i} />}
				<div
					className="r-paper relative -mt-[10%] ml-[10%] w-[90%] rounded-[2px] px-3.5 pt-3 pb-3.5 shadow-[0_2px_3px_rgb(47_65_112/.18),0_8px_16px_-8px_rgb(47_65_112/.4)]"
					style={{ transform: `rotate(${-slot.rot * 0.7}deg)` }}
				>
					<RisoTitle as="h3" className="text-[clamp(1.35rem,2.3vw,1.8rem)] leading-none" second={ink}>
						{hero.alias}
					</RisoTitle>
					<p className="mt-1 text-sm font-bold">{hero.name}</p>
					<p className="text-xs text-(--r-ink-soft)">
						{hero.role}
						{hero.branches.length > 0 ? <> · {hero.branches.map((b) => b.replace(/^Alba\s+/, '')).join(', ')}</> : null}
					</p>
					<p className="mt-2 text-[0.85rem] leading-snug">
						<span className="font-bold" style={{ color: ink === 'var(--r-sun)' ? '#9a6a00' : ink }}>
							Superpower:
						</span>{' '}
						{hero.superpower}
					</p>
					<p className="mt-1.5 text-xs leading-snug text-(--r-ink-soft)">
						<span className="r-brush text-base text-(--r-teal)">Psst! </span>
						{hero.funFact}
					</p>
				</div>
			</article>
		</li>
	);
}

function Page({ heroes, offset, side }: { heroes: KidsHero[]; offset: number; side: 'left' | 'right' }) {
	return (
		<div
			className={`r-paper relative px-4 pt-8 pb-14 sm:px-8 ${side === 'left' ? 'xl:rounded-l-[6px]' : 'xl:rounded-r-[6px]'} max-xl:rounded-[6px]`}
			style={{ boxShadow: '0 2px 2px rgb(47 65 112 / .12), 0 24px 40px -22px rgb(47 65 112 / .5)' }}
		>
			<div
				aria-hidden
				className={`pointer-events-none absolute inset-y-0 w-14 max-xl:hidden ${side === 'left' ? 'right-0 bg-[linear-gradient(90deg,transparent,rgb(47_65_112/.14))]' : 'left-0 bg-[linear-gradient(270deg,transparent,rgb(47_65_112/.14))]'}`}
			/>
			<ul className="relative flex flex-wrap items-start justify-center">
				{heroes.map((h, k) => (
					<Cutting key={h.slug} hero={h} i={offset + k} slot={SLOTS[k % SLOTS.length]!} />
				))}
			</ul>
			{side === 'right' ? (
				<div aria-hidden className="absolute right-6 bottom-4 grid size-24 rotate-[-12deg] place-items-center rounded-full border-4 border-double border-(--r-pink) text-center text-(--r-pink) r-multiply">
					<span className="r-brush text-xl leading-none">
						Tooth
						<br />
						Heroes
					</span>
				</div>
			) : (
				<PaperStar className="absolute bottom-6 left-6" size={30} fill="var(--r-pink)" />
			)}
		</div>
	);
}

export function HeroesScrapbook({ heroes }: { heroes: KidsHero[] }) {
	const t = kidsCopy.heroes;
	if (heroes.length === 0) return null;
	const half = Math.ceil(heroes.length / 2);
	return (
		<section id="heroes" aria-labelledby="heroes-title" className="relative scroll-mt-4">
			<TornEdge color="var(--r-wash-blue)" seed={41} />
			<div className="relative overflow-hidden bg-(--r-wash-blue) px-4 pt-10 pb-20 sm:px-6">
				<InkBlobs a="var(--r-blue)" b="var(--r-pink)" className="-top-16 right-[-6%]" />
				<div className="relative mx-auto max-w-6xl">
					<div className="max-w-2xl">
						<ChapterMark n={4} label={t.label} tone="var(--r-blue)" />
						<RisoTitle id="heroes-title" className="mt-3 text-[clamp(2.8rem,7vw,4.8rem)] leading-[0.9]" second="var(--r-pink)">
							{t.title}
						</RisoTitle>
						<p className="mt-4 text-lg leading-relaxed">{t.lead}</p>
					</div>
					<div className="mt-12 grid gap-8 xl:grid-cols-2 xl:gap-0">
						<Page heroes={heroes.slice(0, half)} offset={0} side="left" />
						<Page heroes={heroes.slice(half)} offset={half} side="right" />
					</div>
				</div>
			</div>
		</section>
	);
}
