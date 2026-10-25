import Link from 'next/link';
import { siteConfig } from '@/lib/site-config';
import { BOOK_HREF } from '@/lib/nav';
import { buttonClasses, ButtonInner } from '@/components/ui/button';
import type { Studio } from '@/lib/studios-server';
import { PorcelainTooth, type ToothNote } from './porcelain-tooth';
import { LiveLine } from './live-line';

/*
 * Home hero: the statement on the left in the display serif, the porcelain
 * tooth on the right lit by the pointer, chart annotations around it, one live
 * line underneath. No photo, no video: the object is the brand.
 */
export function Hero({ studios, clinicians, treatments }: { studios: Studio[]; clinicians: number; treatments: number }) {
	const h = siteConfig.hero;
	const notes: ToothNote[] = [
		{ label: 'FDI 11 → 48', value: '32 teeth, one chart. Tap yours in Smile Check.', at: [0.08, 0.3], side: 'left' },
		{ label: `${studios.length} studios`, value: 'Across London, plus video.', at: [0.93, 0.26], side: 'right' },
		{ label: `${clinicians} clinicians`, value: 'Dentists, hygienists, specialists.', at: [0.86, 0.66], side: 'right', dy: -10 },
		{ label: `${treatments} treatments`, value: 'Every price written down before you book.', at: [0.2, 0.72], side: 'left' },
	];
	return (
		<section className="relative overflow-hidden">
			<div aria-hidden className="chart-paper pointer-events-none absolute inset-0 opacity-50 [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
			<div aria-hidden className="lamp pointer-events-none absolute inset-x-0 top-0 h-[70%]" />
			<div className="frame relative grid min-h-[calc(100svh-56px)] items-center gap-6 pb-10 pt-8 lg:min-h-[100svh] lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-0 lg:py-12">
				<div className="relative z-[1] order-2 lg:order-1">
					<p className="t-anno">{h.eyebrow}</p>
					<h1 className="t-mega mt-5">
						{h.lead} <em>{h.accent}</em>
					</h1>
					<p className="t-lede mt-7 max-w-[44ch]">{h.body}</p>
					<div className="mt-9 flex flex-wrap gap-3">
						<Link href={BOOK_HREF} className={buttonClasses({ variant: 'solid', size: 'lg' })}>
							<ButtonInner size="lg">Book a visit</ButtonInner>
						</Link>
						<Link href="/smile-check" className={buttonClasses({ variant: 'line', size: 'lg' })}>
							<ButtonInner variant="line" size="lg" cell={<span className="t-num text-[10px]">01</span>}>
								Not sure? Smile Check
							</ButtonInner>
						</Link>
					</div>
					<div className="mt-10 border-t border-line pt-4">
						<LiveLine studios={studios} />
					</div>
				</div>
				<div className="relative order-1 mx-auto w-[62%] max-w-[300px] sm:max-w-[360px] lg:order-2 lg:w-[62%] lg:max-w-[400px] xl:-translate-x-[8%]">
					<PorcelainTooth notes={notes} />
				</div>
			</div>
		</section>
	);
}
