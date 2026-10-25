import type { Metadata, Viewport } from 'next';
import { BookHeader } from '@/components/kids/layout/book-header';
import { BookFooter } from '@/components/kids/layout/book-footer';
import { ChapterTabs } from '@/components/kids/layout/chapter-tabs';
import { PopupObserver } from '@/components/kids/layout/popup-observer';
import { kidsThemeClass } from '@/lib/kids/fonts';
import { getKidsWorld } from '@/lib/kids/kids-data';
import '@/components/kids/riso.css';

export const metadata: Metadata = {
	title: { absolute: 'Alba Kids — Children’s dentistry in Tooth Town' },
	description:
		'Gentle children’s dentistry in London: first visits, kids check-ups, sparkle cleans and sealants in our family branches. Parents stay in the room, and every visit earns a stamp in the Tooth Town passport.',
};

export const viewport: Viewport = {
	themeColor: '#f6efe0',
};

// Alba Kids is a picture book: its own chrome, type and inks (scoped under .riso).
export default async function KidsLayout({ children }: { children: React.ReactNode }) {
	const world = await getKidsWorld();
	return (
		<div id="alba-kids" className={`${kidsThemeClass} r-grain flex min-h-screen flex-col overflow-x-clip`}>
			<PopupObserver rootId="alba-kids" />
			<a href="#kids-main" className="r-tag r-tag-ink sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[70]">
				Skip to the story
			</a>
			<BookHeader />
			<main id="kids-main" className="flex-1">
				{children}
			</main>
			<ChapterTabs />
			<BookFooter branches={world.branches.map((b) => ({ slug: b.slug, title: b.title }))} />
		</div>
	);
}
