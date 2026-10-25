'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { createPortal } from 'react-dom';
import { clsx } from 'clsx';
import { NAV, BOOK_HREF, isActive } from '@/lib/nav';
import { siteConfig } from '@/lib/site-config';
import { AlbaLogo } from '@/components/brand/logo';
import { buttonClasses, ButtonInner } from '@/components/ui/button';
import { useModalOverlay, useMounted } from '@/components/ui/use-overlay';
import { useNow } from '@/hooks/use-now';
import { openLine, studioOpenState, todaysHours } from '@/lib/studio-status';

export interface IndexStudio {
	slug: string;
	title: string;
	area: string;
}

/*
 * The Index: Alba's full menu. A dark plate that opens like an aperture (a
 * horizontal slit widening to the full screen), with the sections set as a
 * numbered typographic index on the left and the studios' live status on the
 * right. Escape, the close key and any link close it.
 */
export function IndexMenu({ open, onClose, studios, pathname }: { open: boolean; onClose(): void; studios: IndexStudio[]; pathname: string }) {
	const mounted = useMounted();
	const panelRef = useRef<HTMLDivElement>(null);
	const now = useNow(60_000);
	useModalOverlay(open, onClose, panelRef);

	// Close when the route changes underneath (e.g. browser back).
	const lastPath = useRef(pathname);
	useEffect(() => {
		if (lastPath.current !== pathname && open) onClose();
		lastPath.current = pathname;
	}, [pathname, open, onClose]);

	if (!mounted) return null;
	return createPortal(
		<div
			ref={panelRef}
			role="dialog"
			aria-modal="true"
			aria-label="Index"
			aria-hidden={!open}
			tabIndex={-1}
			data-chrome
			className={clsx(
				'plate-dark fixed inset-0 z-[70] overflow-y-auto outline-none transition-[clip-path,visibility] duration-[620ms] ease-[var(--ease-light)] motion-reduce:transition-none',
				open ? 'visible [clip-path:inset(0_0_0_0)]' : 'invisible [clip-path:inset(50%_0_50%_0)]',
			)}
		>
			<div aria-hidden className="chart-paper-light pointer-events-none absolute inset-0 opacity-60" />
			<div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[60vh] bg-[radial-gradient(55%_60%_at_30%_0%,rgba(191,238,221,0.18),transparent_70%)]" />

			<div className="frame relative flex min-h-full flex-col py-5 lg:py-8">
				<div className="flex items-center justify-between">
					<Link href="/" onClick={onClose} aria-label="Alba Dental, home">
						<AlbaLogo tone="light" />
					</Link>
					<button
						type="button"
						onClick={onClose}
						className="flex h-11 items-center gap-3 rounded-[4px] border border-line-light px-4 text-enamel transition-colors hover:border-mint"
					>
						<span className="t-anno !text-enamel/80">Close</span>
						<svg aria-hidden viewBox="0 0 14 14" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.4">
							<path d="M1 1l12 12M13 1 1 13" />
						</svg>
					</button>
				</div>

				<div className="mt-10 grid flex-1 gap-14 lg:mt-14 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-20">
					<nav aria-label="Sections">
						<ol className="border-t border-line-light">
							{NAV.map((item, i) => {
								const active = isActive(pathname, item.href);
								return (
									<li key={item.href} className="border-b border-line-light" style={{ transitionDelay: open ? `${120 + i * 45}ms` : '0ms' }}>
										<Link
											href={item.href}
											onClick={onClose}
											aria-current={active ? 'page' : undefined}
											className="group grid grid-cols-[44px_1fr] items-baseline gap-x-4 py-3.5 sm:grid-cols-[64px_1fr_auto] lg:py-4"
										>
											<span className={clsx('t-num text-[12px]', active ? 'text-mint' : 'text-enamel/45')}>{item.n}</span>
											<span
												className={clsx(
													't-display text-[2.6rem] leading-none transition-[color,letter-spacing] duration-300 sm:text-[3.6rem] lg:text-[4.4rem]',
													active ? 'text-mint' : 'text-enamel group-hover:text-mint',
												)}
											>
												{item.label}
											</span>
											<span className="t-anno col-start-2 mt-1 sm:col-start-3 sm:mt-0">{item.note}</span>
										</Link>
									</li>
								);
							})}
						</ol>
						<Link href={BOOK_HREF} onClick={onClose} className={buttonClasses({ variant: 'light', size: 'lg', className: 'mt-8' })}>
							<ButtonInner size="lg" variant="light">
								Book a visit
							</ButtonInner>
						</Link>
					</nav>

					<aside className="grid content-start gap-10">
						<div>
							<p className="t-anno">Studios today</p>
							<ul className="mt-4 border-t border-line-light">
								{studios.map((s) => {
									const line = now ? openLine(studioOpenState(s.slug, now)) : null;
									return (
										<li key={s.slug} className="border-b border-line-light">
											<Link href={`/clinics/${s.slug}`} onClick={onClose} className="flex items-center gap-3 py-3 transition-colors hover:text-mint">
												<span className="status-light" data-state={line?.tone ?? 'closed'} aria-hidden />
												<span className="flex-1 text-[15px]">{s.title.replace(/^Alba\s+/, '')}</span>
												<span className="t-num text-[11px] text-enamel/55">{now ? todaysHours(s.slug, now) : '—'}</span>
											</Link>
										</li>
									);
								})}
							</ul>
						</div>
						<div className="grid gap-1.5">
							<p className="t-anno">Patient line</p>
							<a href={siteConfig.contact.phoneHref} className="t-md text-enamel hover:text-mint">
								{siteConfig.contact.phone}
							</a>
							<a href={`mailto:${siteConfig.contact.email}`} className="text-enamel/70 hover:text-mint">
								{siteConfig.contact.email}
							</a>
						</div>
						<p className="max-w-sm border-l border-signal pl-4 text-[13.5px] text-enamel/70">{siteConfig.emergency.short}</p>
					</aside>
				</div>
			</div>
		</div>,
		document.body,
	);
}
