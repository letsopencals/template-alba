import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PreviewScreens } from '@/components/preview/preview-screens';
import { PREVIEW_SCREENS, type PreviewScreen } from '@/components/preview/screens';

export const metadata: Metadata = { title: 'Preview', robots: { index: false, follow: false } };

/**
 * /preview/<screen>: the screens behind a finished booking over fixtures, for
 * design work and screenshots: confirmation, confirmation-kids,
 * confirmation-guest, checkout, account. Available in development, or in
 * production when ALBA_PREVIEW=1.
 */
export default async function PreviewPage({ params }: { params: Promise<{ screen: string }> }) {
	if (process.env.NODE_ENV === 'production' && process.env.ALBA_PREVIEW !== '1') notFound();
	const { screen } = await params;
	if (!PREVIEW_SCREENS.includes(screen as PreviewScreen)) notFound();
	return <PreviewScreens screen={screen as PreviewScreen} />;
}
