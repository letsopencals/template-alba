import type { Metadata, Viewport } from 'next';
import { Instrument_Serif, Hanken_Grotesk, Martian_Mono } from 'next/font/google';
import { Providers } from '@/components/providers';
import { siteConfig } from '@/lib/site-config';
import { getStoreSettings } from '@/lib/server-data';
import './globals.css';

const instrument = Instrument_Serif({
	subsets: ['latin'],
	weight: '400',
	variable: '--font-serif-alba',
	display: 'swap',
});
const hanken = Hanken_Grotesk({ subsets: ['latin'], variable: '--font-sans-alba', display: 'swap' });
const martian = Martian_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-mono-alba', display: 'swap' });

export const viewport: Viewport = {
	themeColor: '#f3f1eb',
};

const title = `${siteConfig.name} — ${siteConfig.tagline}`;

export const metadata: Metadata = {
	title: {
		default: title,
		template: `%s | ${siteConfig.name}`,
	},
	description: siteConfig.description,
	metadataBase: new URL(siteConfig.url),
	openGraph: {
		title,
		description: siteConfig.description,
		siteName: siteConfig.name,
		locale: 'en_GB',
		type: 'website',
	},
	twitter: {
		card: 'summary_large_image',
		title,
		description: siteConfig.description,
	},
	robots: {
		index: true,
		follow: true,
	},
};

/*
 * Root layout: html, body, fonts, providers and JSON-LD only. The adult site's
 * header/footer live in app/(site)/layout.tsx; Alba Kids has its own chrome in
 * app/(kids)/layout.tsx. Both share the providers (session, settings, cart).
 */
export default async function RootLayout({ children }: { children: React.ReactNode }) {
	const initialSettings = await getStoreSettings();

	return (
		<html lang="en-GB" className={`${instrument.variable} ${hanken.variable} ${martian.variable}`} suppressHydrationWarning>
			<body>
				{/* Allow parent frames to control scrolling via postMessage */}
				<script
					dangerouslySetInnerHTML={{
						__html: `window.addEventListener("message",function(e){if(e.data&&e.data.type==="scrollTo"&&e.data.id){var el=document.getElementById(e.data.id);if(el){var top=el.getBoundingClientRect().top+window.scrollY;window.scrollTo({top:top,behavior:"smooth"})}}if(e.data&&e.data.type==="scrollTop"){window.scrollTo({top:0,behavior:"smooth"})}});`,
					}}
				/>
				<Providers initialSettings={initialSettings}>{children}</Providers>
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify({
							'@context': 'https://schema.org',
							'@type': 'Dentist',
							name: siteConfig.name,
							description: siteConfig.description,
							url: siteConfig.url,
							telephone: siteConfig.contact.phone,
							email: siteConfig.contact.email,
							priceRange: '££',
							address: {
								'@type': 'PostalAddress',
								streetAddress: siteConfig.contact.address.street,
								addressLocality: siteConfig.contact.address.locality,
								addressRegion: siteConfig.contact.address.region,
								postalCode: siteConfig.contact.address.postalCode,
								addressCountry: siteConfig.contact.address.country,
							},
						}),
					}}
				/>
			</body>
		</html>
	);
}
