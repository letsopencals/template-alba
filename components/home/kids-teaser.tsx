import Link from 'next/link';
import { siteConfig } from '@/lib/site-config';
import { KindGlyph } from '@/components/ui/icon';

/*
 * The door to Alba Kids. The adult site doesn't imitate the storybook; it
 * shows a page of it peeling up at the corner — a paper sheet in a warmer
 * stock, slightly rotated, with a folded corner — and lets the click do the rest.
 */
export function KidsTeaser({ studios }: { studios: string[] }) {
	const k = siteConfig.kidsTeaser;
	return (
		<Link href="/kids" className="group relative grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
			<div>
				<p className="t-anno">05 · {k.eyebrow}</p>
				<h2 className="t-xl mt-4">
					{k.lead} <em>{k.accent}</em>
				</h2>
				<p className="t-lede mt-6 max-w-[44ch]">{k.body}</p>
				<p className="t-anno mt-6">Kids rooms · {studios.join(' · ')}</p>
				<span className="link-hair mt-8 inline-flex items-center gap-2 text-[16px]">
					{k.cta} <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
				</span>
			</div>
			<div className="relative mx-auto w-full max-w-[460px] [perspective:1200px]">
				{/* a page from another book */}
				<div className="relative aspect-[4/5] rotate-[-3deg] transition-transform duration-700 ease-[var(--ease-light)] group-hover:rotate-[-1deg] group-hover:[transform:rotateY(-8deg)_rotate(-1deg)]">
					<div className="absolute inset-0 rounded-[3px] bg-[#fbf1df] shadow-[0_30px_60px_-30px_rgba(13,29,31,0.45),0_2px_4px_rgba(13,29,31,0.08)] [clip-path:polygon(0_0,100%_0,100%_84%,84%_100%,0_100%)]">
						<div aria-hidden className="absolute inset-0 opacity-[0.35] [background-image:radial-gradient(rgba(120,80,40,0.25)_0.6px,transparent_0.7px)] [background-size:5px_5px]" />
						<div className="absolute inset-0 flex flex-col items-center justify-center gap-5 p-10 text-center">
							<KindGlyph kind="kids" className="h-28 w-28 text-[#e2587e] transition-transform duration-700 group-hover:-rotate-6 group-hover:scale-105" />
							<p className="t-anno !text-[#9a6a3a]">Chapter one</p>
							<p className="t-lg text-[#3a2a1c]">Welcome to Tooth Town</p>
						</div>
					</div>
					{/* folded corner */}
					<div aria-hidden className="absolute bottom-0 right-0 h-[16%] w-[16%] bg-[linear-gradient(135deg,#efe0c4_0%,#e2cfab_50%,transparent_50%)] shadow-[-4px_-4px_10px_-6px_rgba(13,29,31,0.25)] transition-[width,height] duration-500 group-hover:h-[22%] group-hover:w-[22%]" />
				</div>
			</div>
		</Link>
	);
}
