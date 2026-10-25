import Link from 'next/link';
import { siteConfig } from '@/lib/site-config';
import { NAV, BOOK_HREF } from '@/lib/nav';
import { AlbaLogo } from '@/components/brand/logo';
import { ToothStrip } from '@/components/brand/tooth-strip';
import { buttonClasses, ButtonInner } from '@/components/ui/button';

export interface ColophonStudio {
	slug: string;
	title: string;
	addressLines: string[];
}

/*
 * The colophon (footer): a dark plate that ends every page with the chart
 * strip, the studios set like an address book, the index and the small print.
 */
export function Colophon({ studios }: { studios: ColophonStudio[] }) {
	const year = new Date().getFullYear();
	return (
		<footer data-chrome className="plate-dark relative overflow-hidden pb-24 lg:pb-0">
			<div aria-hidden className="chart-paper-light pointer-events-none absolute inset-0 opacity-50" />
			<div className="frame relative pt-16 lg:pt-24">
				<div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
					<p className="t-xl max-w-[14ch] text-enamel">
						{siteConfig.closing.lead} <em>{siteConfig.closing.accent}</em>
					</p>
					<div className="grid gap-3 sm:flex sm:items-center">
						<Link href={BOOK_HREF} className={buttonClasses({ variant: 'light', size: 'lg' })}>
							<ButtonInner variant="light" size="lg">
								Book a visit
							</ButtonInner>
						</Link>
						<Link href="/smile-check" className={buttonClasses({ variant: 'line', size: 'lg', className: '!border-line-light !bg-transparent !text-enamel hover:!border-mint' })}>
							<ButtonInner variant="line" size="lg" cell={<span className="t-num text-[10px]">01</span>}>
								Not sure? Smile Check
							</ButtonInner>
						</Link>
					</div>
				</div>

				<div className="mt-14 lg:mt-20">
					<ToothStrip className="mx-auto max-w-[1100px] opacity-90" />
				</div>

				<div className="mt-14 grid gap-12 border-t border-line-light pt-10 md:grid-cols-2 lg:grid-cols-[1.3fr_0.8fr_0.9fr]">
					<div>
						<p className="t-anno">Studios</p>
						<ul className="mt-4 grid gap-x-8 gap-y-5 sm:grid-cols-2">
							{studios.map((s) => (
								<li key={s.slug}>
									<Link href={`/clinics/${s.slug}`} className="group block">
										<span className="t-sm text-[1.3rem] text-enamel group-hover:text-mint">{s.title.replace(/^Alba\s+/, '')}</span>
										<span className="mt-1 block text-[13px] leading-snug text-enamel/55">{s.addressLines.join(', ')}</span>
									</Link>
								</li>
							))}
						</ul>
					</div>
					<div>
						<p className="t-anno">Index</p>
						<ul className="mt-4 grid gap-2">
							{NAV.map((n) => (
								<li key={n.href}>
									<Link href={n.href} className="group flex items-baseline gap-3 text-[15px] text-enamel/85 hover:text-mint">
										<span className="t-num text-[10.5px] text-enamel/40">{n.n}</span>
										{n.label}
									</Link>
								</li>
							))}
						</ul>
					</div>
					<div className="grid content-start gap-6">
						<div>
							<p className="t-anno">Patient line</p>
							<a href={siteConfig.contact.phoneHref} className="mt-2 block text-[1.15rem] text-enamel hover:text-mint">
								{siteConfig.contact.phone}
							</a>
							<a href={`mailto:${siteConfig.contact.email}`} className="text-[14px] text-enamel/65 hover:text-mint">
								{siteConfig.contact.email}
							</a>
						</div>
						<p className="border-l border-signal pl-3 text-[13px] leading-relaxed text-enamel/65">{siteConfig.emergency.short}</p>
						<div className="flex gap-4">
							{siteConfig.footer.socials.map((s) => (
								<a key={s.label} href={s.href} target="_blank" rel="noreferrer" className="t-anno hover:!text-mint">
									{s.label}
								</a>
							))}
						</div>
					</div>
				</div>

				<div className="mt-14 flex flex-col gap-4 border-t border-line-light py-6 sm:flex-row sm:items-center sm:justify-between">
					<AlbaLogo tone="light" />
					<p className="t-anno">
						© {year} {siteConfig.name} · GDC-registered practice · Booking by{' '}
						<a href="https://opencals.com" className="hover:!text-mint">
							Opencals
						</a>
					</p>
				</div>
			</div>
		</footer>
	);
}
