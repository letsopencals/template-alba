import { ChartRail } from '@/components/layout/chart-rail';
import { Colophon } from '@/components/layout/colophon';
import { ViewTransitions } from '@/components/light/view-transitions';
import { getClinics } from '@/lib/server-data';
import { studioMeta } from '@/lib/site-config';

/*
 * The adult Alba chrome: the chart rail (desktop) / top bar + dock (phones),
 * the page, and the colophon. Content sits right of the 76px rail on desktop.
 * Alba Kids (app/(kids)) brings its own chrome.
 */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
	const clinics = (await getClinics()).filter((c) => c.type === 'physical');
	const studios = clinics.map((c, i) => ({ slug: c.slug, title: c.title, area: studioMeta(c.slug, i).area, addressLines: c.addressLines }));
	return (
		<ViewTransitions>
			<a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[80] focus:bg-enamel focus:px-4 focus:py-2">
				Skip to content
			</a>
			<ChartRail studios={studios} />
			<div className="lg:pl-[76px]">
				<main id="main" className="min-h-[70svh]">
					{children}
				</main>
				<Colophon studios={studios} />
			</div>
		</ViewTransitions>
	);
}
