'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { clsx } from 'clsx';
import { AlbaMark } from '@/components/brand/logo';
import { NAV, BOOK_HREF, isActive } from '@/lib/nav';
import { useCart } from '@/contexts/cart-context';
import { useHydrated } from '@/hooks/use-hydrated';
import { CartDrawer } from '@/components/cart/cart-drawer';
import { IndexMenu, type IndexStudio } from './index-menu';
import { MobileDock } from './mobile-dock';

/*
 * The chart rail: Alba's navigation model. On desktop a slim fixed column on
 * the left (mark, Index, numbered sections with labels that slide out on hover,
 * visits, the vertical Book tab). On phones: a slim top bar and a bottom dock.
 * The full menu is the typographic Index (index-menu.tsx).
 */
export function ChartRail({ studios }: { studios: IndexStudio[] }) {
	const pathname = usePathname();
	const [indexOpen, setIndexOpen] = useState(false);
	const [cartOpen, setCartOpen] = useState(false);
	const { cart } = useCart();
	const hydrated = useHydrated();
	const { status } = useSession();
	const visits = hydrated ? (cart?.items?.length ?? 0) : 0;
	const signedIn = hydrated && status === 'authenticated';

	return (
		<>
			{/* Desktop rail */}
			<nav
				data-chrome
				aria-label="Site"
				className="fixed inset-y-0 left-0 z-40 hidden w-[76px] flex-col items-center border-r border-line bg-porcelain/90 backdrop-blur-md lg:flex"
			>
				<Link href="/" aria-label="Alba Dental, home" className="flex h-[76px] w-full items-center justify-center border-b border-line">
					<AlbaMark className="h-9" />
				</Link>
				<button
					type="button"
					onClick={() => setIndexOpen(true)}
					aria-haspopup="dialog"
					aria-expanded={indexOpen}
					className="group flex h-[60px] w-full flex-col items-center justify-center gap-1.5 border-b border-line text-ink transition-colors hover:bg-enamel"
				>
					<span aria-hidden className="flex flex-col gap-[3px]">
						<span className="block h-px w-5 bg-current" />
						<span className="block h-px w-3.5 bg-current transition-[width] duration-300 group-hover:w-5" />
						<span className="block h-px w-5 bg-current" />
					</span>
					<span className="t-anno !text-[8.5px] !text-ink-2">Index</span>
				</button>

				<ol className="flex w-full flex-1 flex-col items-stretch py-4">
					{NAV.map((item) => {
						const active = isActive(pathname, item.href);
						return (
							<li key={item.href} className="relative">
								<Link
									href={item.href}
									aria-current={active ? 'page' : undefined}
									className={clsx(
										'group/rail relative flex h-12 items-center justify-center outline-none',
										active ? 'text-lagoon' : 'text-ink-3 hover:text-ink focus-visible:text-ink',
									)}
								>
									<span aria-hidden className={clsx('absolute left-0 top-2 bottom-2 w-[2px] transition-colors', active ? 'bg-lagoon' : 'bg-transparent')} />
									<span className="t-num text-[12px]">{item.n}</span>
									{/* Label slides out of the rail on hover/focus. */}
									<span
										className="pointer-events-none absolute left-[calc(100%+1px)] top-1/2 flex h-12 -translate-y-1/2 items-center whitespace-nowrap border border-l-0 border-line bg-enamel pl-4 pr-5 opacity-0 shadow-[var(--shadow-enamel)] transition-[clip-path,opacity] duration-300 ease-[var(--ease-light)] [clip-path:inset(0_100%_0_0)] group-hover/rail:opacity-100 group-hover/rail:[clip-path:inset(0_0_0_0)] group-focus-visible/rail:opacity-100 group-focus-visible/rail:[clip-path:inset(0_0_0_0)]"
									>
										<span className="t-sm text-[1.35rem] text-ink">{item.label}</span>
										<span className="t-anno ml-3">{item.note}</span>
									</span>
								</Link>
							</li>
						);
					})}
				</ol>

				<div className="flex w-full flex-col items-stretch border-t border-line">
					<button
						type="button"
						onClick={() => setCartOpen(true)}
						aria-label={visits ? `Your visits, ${visits} held` : 'Your visits'}
						className="relative flex h-14 items-center justify-center text-ink-2 transition-colors hover:bg-enamel hover:text-ink"
					>
						<VisitsIcon />
						{visits ? (
							<span className="t-num absolute right-3.5 top-2.5 flex h-4 min-w-4 items-center justify-center rounded-[2px] bg-mint px-1 text-[9.5px] text-night">{visits}</span>
						) : null}
					</button>
					<Link
						href={signedIn ? '/account' : '/auth/sign-in'}
						aria-label={signedIn ? 'My Smile' : 'Sign in'}
						className="flex h-14 items-center justify-center border-t border-line text-ink-2 transition-colors hover:bg-enamel hover:text-ink"
					>
						<PersonIcon filled={signedIn} />
					</Link>
					<Link
						href={BOOK_HREF}
						className="gleam-hover group flex h-[150px] flex-col items-center justify-between bg-lagoon py-5 text-enamel transition-colors hover:bg-lagoon-2"
					>
						<span className="t-anno !text-[8.5px] !text-mint">Book</span>
						<span className="t-sm text-[1.35rem] [writing-mode:vertical-rl] rotate-180 whitespace-nowrap">Book a visit</span>
						<svg aria-hidden viewBox="0 0 16 16" className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-y-0.5" fill="none" stroke="currentColor" strokeWidth="1.4">
							<path d="M8 2v11M4 9l4 4 4-4" />
						</svg>
					</Link>
				</div>
			</nav>

			{/* Phone top bar */}
			<header data-chrome className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-line bg-porcelain/90 px-4 backdrop-blur-md lg:hidden">
				<Link href="/" aria-label="Alba Dental, home" className="flex items-center gap-2">
					<AlbaMark className="h-7" />
					<span className="t-sm text-[1.3rem]">Alba</span>
				</Link>
				<div className="flex items-center gap-1">
					<button type="button" onClick={() => setCartOpen(true)} aria-label={visits ? `Your visits, ${visits} held` : 'Your visits'} className="relative flex h-10 w-10 items-center justify-center text-ink-2">
						<VisitsIcon />
						{visits ? <span className="t-num absolute right-1 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-[2px] bg-mint px-1 text-[9.5px] text-night">{visits}</span> : null}
					</button>
					<button type="button" onClick={() => setIndexOpen(true)} aria-haspopup="dialog" aria-expanded={indexOpen} className="flex h-10 items-center gap-2 px-2 text-ink">
						<span className="t-anno !text-ink-2">Index</span>
						<span aria-hidden className="flex flex-col gap-[3px]">
							<span className="block h-px w-4 bg-current" />
							<span className="block h-px w-4 bg-current" />
						</span>
					</button>
				</div>
			</header>

			<MobileDock pathname={pathname} />
			<IndexMenu open={indexOpen} onClose={() => setIndexOpen(false)} studios={studios} pathname={pathname} />
			<CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
		</>
	);
}

function VisitsIcon() {
	return (
		<svg aria-hidden viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.4">
			<rect x="4" y="5" width="16" height="15" rx="1.5" />
			<path d="M8 3v4M16 3v4M4 10h16" />
		</svg>
	);
}

function PersonIcon({ filled }: { filled: boolean }) {
	return (
		<svg aria-hidden viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.4">
			<circle cx="12" cy="8.5" r="3.5" />
			<path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5" fill="none" />
		</svg>
	);
}
