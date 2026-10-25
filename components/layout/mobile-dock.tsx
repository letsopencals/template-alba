'use client';

import Link from 'next/link';
import { clsx } from 'clsx';
import { NAV, BOOK_HREF, isActive } from '@/lib/nav';

/*
 * Phone navigation: a bottom dock of four sections around a raised Book key.
 * Hidden on /book and /checkout, which bring their own bottom bars.
 */
const HIDE_ON = ['/book', '/checkout'];

export function MobileDock({ pathname }: { pathname: string }) {
	if (HIDE_ON.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return null;
	const items = NAV.filter((n) => n.dock);
	const left = items.slice(0, 2);
	const right = items.slice(2, 4);
	return (
		<nav
			data-chrome
			aria-label="Quick"
			className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-porcelain/92 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
		>
			<ul className="grid grid-cols-5 items-stretch">
				{left.map((n) => (
					<DockItem key={n.href} n={n.n} label={n.dock!} href={n.href} active={isActive(pathname, n.href)} />
				))}
				<li className="flex items-center justify-center">
					<Link
						href={BOOK_HREF}
						className="gleam-hover -mt-5 flex h-[58px] w-[58px] flex-col items-center justify-center gap-0.5 rounded-[6px] bg-lagoon text-enamel shadow-[0_14px_28px_-12px_rgba(6,26,28,0.7)]"
					>
						<svg aria-hidden viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
							<path d="M8 3v10M3 8h10" />
						</svg>
						<span className="text-[11px] font-medium">Book</span>
					</Link>
				</li>
				{right.map((n) => (
					<DockItem key={n.href} n={n.n} label={n.dock!} href={n.href} active={isActive(pathname, n.href)} />
				))}
			</ul>
		</nav>
	);
}

function DockItem({ n, label, href, active }: { n: string; label: string; href: string; active: boolean }) {
	return (
		<li>
			<Link
				href={href}
				aria-current={active ? 'page' : undefined}
				className={clsx('relative flex h-[60px] flex-col items-center justify-center gap-1', active ? 'text-lagoon' : 'text-ink-3')}
			>
				<span aria-hidden className={clsx('absolute inset-x-5 top-0 h-[2px]', active ? 'bg-lagoon' : 'bg-transparent')} />
				<span className="t-num text-[10px]">{n}</span>
				<span className="text-[11.5px] font-medium">{label}</span>
			</Link>
		</li>
	);
}
