import Link from 'next/link';
import { Pip } from '@/components/kids/pip';
import { kidsBookHref } from '@/lib/kids/kids-config';

/** The kids top bar: a paper label with the name, the grown-ups' site and "Book". */
export function BookHeader() {
	return (
		<header className="relative z-40 px-4 pt-3 sm:px-6">
			<div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
				<Link href="/kids" className="r-focus group flex items-center gap-2" aria-label="Alba Kids, Tooth Town home">
					<span className="r-paper r-cut flex items-center gap-2 rounded-[3px] py-1 pr-4 pl-1.5" style={{ transform: 'rotate(-1.5deg)' }}>
						<Pip size={34} animated={false} pose="wave" />
						<span className="leading-none">
							<span className="r-brush block text-[1.65rem] text-(--r-ink)">Alba Kids</span>
							<span className="block text-[0.68rem] font-bold tracking-[0.16em] text-(--r-teal) uppercase">Tooth Town</span>
						</span>
					</span>
				</Link>
				<nav aria-label="Alba" className="flex items-center gap-2 sm:gap-5">
					<Link href="/" className="r-quiet text-sm max-sm:hidden">
						Grown-ups’ site
					</Link>
					<Link href="/kids/quest" className="r-quiet text-sm max-md:hidden">
						Tooth Quest
					</Link>
					<Link href={kidsBookHref({})} className="r-tag r-tag-pink text-sm">
						Book a visit
					</Link>
				</nav>
			</div>
		</header>
	);
}
