import type { Metadata } from 'next';
import { QuestStory } from '@/components/kids/quest/quest-story';
import { RisoTitle } from '@/components/kids/paper';
import { getKidsWorld } from '@/lib/kids/kids-data';
import { kidsCopy } from '@/lib/kids/kids-config';

export const metadata: Metadata = {
	title: { absolute: 'Tooth Quest — Find the right kids visit | Alba Kids' },
	description: 'Five quick choices for parents write a little story, and the last page tells you which children’s dental visit to book at Alba Kids in London.',
	alternates: { canonical: '/kids/quest' },
};

export const revalidate = 300;

export default async function ToothQuestPage() {
	const world = await getKidsWorld();
	const services = world.services.map(({ role, title, place, kidLine, options, branches }) => ({ role, title, place, kidLine, options, branches }));
	const branches = world.branches.map((b) => ({
		slug: b.slug,
		title: b.title,
		nickname: b.nickname,
		area: b.addressLines.at(-1)?.split(',').pop()?.trim() ?? null,
	}));
	const q = kidsCopy.quest;

	return (
		<div className="relative">
			<div className="mx-auto max-w-3xl px-4 pt-8 pb-10 text-center sm:px-6 sm:pt-12">
				<p className="text-sm font-bold tracking-[0.18em] text-(--r-teal) uppercase">{q.label}</p>
				<RisoTitle as="h1" className="mt-2 text-[clamp(2.8rem,8vw,4.6rem)] leading-[0.9]" second="var(--r-teal)">
					{q.title}
				</RisoTitle>
				<p className="mt-4 text-lg leading-relaxed text-(--r-ink-soft)">{q.lead}</p>
			</div>
			<QuestStory services={services} branches={branches} currency={world.currency} phone={kidsCopy.contact.phone} phoneHref={kidsCopy.contact.phoneHref} />
		</div>
	);
}
