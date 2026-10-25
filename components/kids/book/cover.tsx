import Link from 'next/link';
import { Pip } from '@/components/kids/pip';
import { BuildingArt } from '@/components/kids/buildings';
import { InkBlobs, PaperCloud, PaperStar, RisoTitle, Tape } from '@/components/kids/paper';
import { Balloon, Tree } from '@/components/kids/scenery';
import { kidsBookHref, kidsCopy } from '@/lib/kids/kids-config';

/**
 * The cover of the picture book (the kids hero): a cloth-bound kraft cover with
 * the title printed in two inks, Pip popping out, and a bookplate beside it with
 * the lead and the ways in.
 */
export function Cover({ fromPrice }: { fromPrice: string | null }) {
	const c = kidsCopy.cover;
	return (
		<section id="cover" aria-labelledby="cover-title" className="relative scroll-mt-4 px-4 pt-6 pb-16 sm:px-6 sm:pt-10 lg:pb-24">
			<div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-14">
				{/* The book */}
				<div className="relative mx-auto w-full max-w-[540px]" style={{ transform: 'rotate(-1.2deg)' }}>
					{/* page block behind the cover */}
					<div aria-hidden className="absolute inset-y-2 right-[-10px] left-4 rounded-r-[10px] bg-[#fffaf0] shadow-[0_1px_0_#e6dccb,0_3px_0_#fffaf0,0_4px_0_#e6dccb,0_6px_0_#fffaf0,0_7px_0_#e6dccb]" />
					<div className="r-kraft relative aspect-[4/5] overflow-hidden rounded-r-[12px] rounded-l-[4px] shadow-[0_2px_2px_rgb(47_65_112/.15),0_28px_50px_-18px_rgb(47_65_112/.55)]">
						{/* cloth spine with stitches */}
						<div aria-hidden className="absolute inset-y-0 left-0 w-[8%] bg-(--r-teal)">
							<div className="absolute inset-y-3 right-[22%] border-r-2 border-dashed border-white/50" />
						</div>
						{/* printed panel: sky, title, and a layered paper town filling the lower half */}
						<div className="absolute inset-y-[5%] right-[5%] left-[13%] overflow-hidden rounded-[3px] bg-[#dcebfa]">
							<div aria-hidden className="r-halftone-fine absolute inset-x-0 top-0 h-[45%] opacity-50 [mask-image:linear-gradient(180deg,#000,transparent)]" />
							<div aria-hidden className="r-halftone absolute top-[-8%] right-[-12%] aspect-square w-[58%] rounded-full" style={{ ['--dot' as string]: 'var(--r-pink)' }} />
							<div aria-hidden className="r-multiply absolute top-[4%] right-[6%] aspect-square w-[30%] rounded-full bg-(--r-sun)" />
							<PaperCloud className="absolute top-[33%] left-[-5%]" width={120} />
							<PaperCloud className="absolute top-[24%] right-[26%]" width={74} fill="#ffe1ef" />
							<Balloon className="r-bob absolute top-[36%] right-[8%]" size={40} />
							<p className="relative px-[7%] pt-[7%] text-[0.7rem] font-bold tracking-[0.2em] text-(--r-teal) uppercase sm:text-xs">{c.series}</p>
							<RisoTitle as="h1" id="cover-title" className="relative px-[7%] pt-1 text-[clamp(2.6rem,9.5vw,4.6rem)] leading-[0.86]">
								<span className="block">{c.title[0]}</span>
								<span className="block text-[1.18em]">{c.title[1]}</span>
								<span className="block text-[0.82em]">{c.title[2]}</span>
							</RisoTitle>
							{/* the town, in paper layers */}
							<div aria-hidden className="absolute inset-x-0 bottom-0 h-[52%]">
								<svg viewBox="0 0 400 200" preserveAspectRatio="none" className="absolute inset-0 size-full">
									<path d="M0 70Q70 30 150 58T300 44T400 52V200H0Z" fill="var(--r-blue)" opacity={0.7} className="r-multiply" />
									<path d="M0 104Q110 70 210 96T400 84V200H0Z" fill="var(--r-green)" />
									<path d="M0 104Q110 70 210 96T400 84V200H0Z" fill="var(--r-sun)" opacity={0.25} className="r-multiply" />
									<path d="M0 150Q120 120 240 146T400 136V200H0Z" fill="var(--r-teal)" />
									<path d="M150 200C170 170 220 160 230 130C238 112 260 104 280 100" fill="none" stroke="#f3e6c6" strokeWidth={14} strokeLinecap="round" />
									<path d="M150 200C170 170 220 160 230 130C238 112 260 104 280 100" fill="none" stroke="var(--r-pink)" strokeWidth={1.6} strokeDasharray="5 6" />
								</svg>
								<div className="r-popup absolute bottom-[50%] left-[2%] w-[32%]" style={{ ['--d' as string]: '200ms' }}>
									<BuildingArt role="check-up" />
								</div>
								<div className="r-popup absolute bottom-[54%] left-[34%] w-[20%]" style={{ ['--d' as string]: '320ms' }}>
									<BuildingArt role="orthodontic" />
								</div>
								<div className="r-popup absolute bottom-[56%] right-[4%] w-[20%]" style={{ ['--d' as string]: '420ms' }}>
									<BuildingArt role="tour" />
								</div>
								<div className="r-popup absolute bottom-[20%] left-[22%] w-[24%]" style={{ ['--d' as string]: '520ms' }}>
									<BuildingArt role="clean" />
								</div>
								<Tree className="absolute bottom-[30%] left-[0%]" size={34} />
								<Tree className="absolute bottom-[44%] left-[54%]" size={26} round={false} />
								<Tree className="absolute bottom-[14%] left-[48%]" size={30} tone="var(--r-sun)" />
							</div>
							<div className="r-popup absolute right-[1%] bottom-[2%]" style={{ ['--d' as string]: '650ms' }}>
								<Pip size={170} pose="wave" mood="grin" title="Pip the tooth, waving hello" className="h-auto w-[clamp(110px,28vw,170px)]" />
							</div>
						</div>
						<PaperStar className="absolute top-[3%] left-[14%]" size={20} fill="var(--r-pink)" />
					</div>
					{/* Pip's note */}
					<div className="r-paper r-cut absolute -top-4 right-[-26px] max-w-[11rem] rounded-[2px] px-3 py-2 text-sm font-bold max-sm:hidden" style={{ transform: 'rotate(4deg)' }}>
						<Tape className="-top-3 left-1/2 -translate-x-1/2" tone="var(--r-pink)" style={{ width: '3.6rem' }} />
						<span className="r-brush text-xl leading-tight text-(--r-ink)">{c.pipSays}</span>
					</div>
				</div>

				{/* The bookplate */}
				<div className="relative">
					<InkBlobs className="-top-16 -right-10 max-lg:hidden" size={200} />
					<div className="r-paper r-cut relative rounded-[4px] p-6 sm:p-9">
						<div aria-hidden className="pointer-events-none absolute inset-2.5 rounded-[2px] border-2 border-dashed border-(--r-pink)/60" />
						<p className="r-brush text-2xl text-(--r-teal)">Ex libris</p>
						<p className="mt-1 flex items-end gap-3 text-sm text-(--r-ink-soft)">
							<span className="shrink-0">This book belongs to</span>
							<span className="mb-1 h-px flex-1 border-b-2 border-dotted border-(--r-ink)/40" />
						</p>
						<p className="mt-6 text-lg leading-relaxed sm:text-xl">{c.lead}</p>
						<p className="mt-3 text-sm font-bold text-(--r-ink-soft)">
							{c.byline}
							{fromPrice ? <> · visits from {fromPrice}</> : null}
						</p>
						<div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
							<a href="#town" className="r-tag">
								{c.open}
								<span aria-hidden>↓</span>
							</a>
							<Link href={kidsBookHref({})} className="r-tag r-tag-pink">
								Book a kids visit
							</Link>
							<Link href="/kids/quest" className="r-quiet">
								Not sure which? Take the Tooth Quest
							</Link>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
