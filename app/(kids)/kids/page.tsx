import type { Metadata } from 'next';
import { Cover } from '@/components/kids/book/cover';
import { TownRoad } from '@/components/kids/book/town-road';
import { FirstVisitFold } from '@/components/kids/book/first-visit-fold';
import { SugarBugScrub } from '@/components/kids/book/sugar-bug-scrub';
import { HeroesScrapbook } from '@/components/kids/book/heroes-scrapbook';
import { RoomDioramas } from '@/components/kids/book/room-dioramas';
import { GrownUps } from '@/components/kids/book/grown-ups';
import { getKidsWorld } from '@/lib/kids/kids-data';
import { kidsPrice } from '@/lib/kids/format';

export const metadata: Metadata = {
	title: { absolute: 'Alba Kids — Pip and the Tooth Town adventure' },
	alternates: { canonical: '/kids' },
};

export const revalidate = 300;

/** Alba Kids: a pop-up picture book. See components/kids/DESIGN-KIDS.md. */
export default async function KidsPage() {
	const world = await getKidsWorld();
	const paid = world.services.map((s) => s.fromPrice).filter((p) => p > 0);
	const fromPrice = paid.length > 0 ? kidsPrice(Math.min(...paid), world.currency) : null;

	return (
		<>
			<Cover fromPrice={fromPrice} />
			<TownRoad services={world.services} currency={world.currency} />
			<FirstVisitFold />
			<SugarBugScrub />
			<HeroesScrapbook heroes={world.heroes} />
			<RoomDioramas branches={world.branches} />
			<GrownUps services={world.services} currency={world.currency} />
		</>
	);
}
