import type { Metadata } from 'next';
import { getCatalog } from '@/lib/catalog-server';
import { getStudios } from '@/lib/studios-server';
import { siteConfig } from '@/lib/site-config';
import { PlateHead } from '@/components/ui/plate-head';
import { SmileCheck } from '@/components/smile/smile-check';

/** Catalogue, studios and team re-read from the store every 5 minutes (ISR). */
export const revalidate = 300;

export const metadata: Metadata = {
	title: 'Smile Check',
	description: 'Tap the teeth on your mind, tell us what’s going on and how you feel about the dentist. We’ll suggest the right visit, the studio with the soonest chair, and book it in a minute.',
};

export default async function SmileCheckPage() {
	const [catalog, { studios }] = await Promise.all([getCatalog(), getStudios()]);
	const cfg = siteConfig.smileCheck;
	return (
		<section className="frame pb-24 pt-10 lg:pt-16">
			<PlateHead
				as="h1"
				index="01"
				size="xl"
				title={
					<>
						{cfg.lead} <em>{cfg.accent}</em>
					</>
				}
				anno={<>About 30 seconds<br />Not a diagnosis</>}
				lede={cfg.body}
			/>
			<div className="mt-8 lg:mt-12">
				<SmileCheck treatments={catalog.treatments} studios={studios.map((s) => ({ id: s.id, slug: s.slug, short: s.short }))} currency={catalog.currency} />
			</div>
		</section>
	);
}
