import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getDepartmentIndex } from '@/lib/server-data';
import { ThankYouView } from '@/components/confirmation/thank-you-view';

export const metadata: Metadata = {
	title: 'Your appointment card',
	robots: { index: false, follow: false },
};

export default async function ThankYouPage() {
	const departments = await getDepartmentIndex().catch(() => ({}));
	return (
		<Suspense fallback={<div className="min-h-screen" aria-busy="true" />}>
			<ThankYouView departments={departments} />
		</Suspense>
	);
}
