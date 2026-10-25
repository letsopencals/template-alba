import type { MetadataRoute } from 'next';
import { getCatalog } from '@/lib/catalog-server';
import { getClinicians, getClinics } from '@/lib/server-data';
import { siteConfig } from '@/lib/site-config';

export const revalidate = 3600;

type Entry = MetadataRoute.Sitemap[number];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const base = siteConfig.url;
	const now = new Date();
	const page = (path: string, priority: number, changeFrequency: Entry['changeFrequency'] = 'weekly'): Entry => ({
		url: `${base}${path}`,
		lastModified: now,
		changeFrequency,
		priority,
	});

	const staticRoutes = [
		page('', 1),
		page('/smile-check', 0.9),
		page('/treatments', 0.9),
		page('/clinics', 0.8),
		page('/dentists', 0.8),
		page('/kids', 0.8),
		page('/kids/quest', 0.7),
		page('/book', 0.7),
	];

	// Both helpers swallow API errors and return empty lists.
	const [{ departments }, clinicians, clinics] = await Promise.all([getCatalog(), getClinicians(), getClinics()]);
	const departmentSlugs = departments.length ? departments.map((d) => d.slug) : Object.keys(siteConfig.departments);

	return [
		...staticRoutes,
		...departmentSlugs.map((slug) => page(`/treatments/${slug}`, 0.8)),
		...clinics.filter((c) => c.type === 'physical').map((c) => page(`/clinics/${c.slug}`, 0.7, 'monthly')),
		...clinicians.map((c) => page(`/dentists/${c.slug}`, c.curated ? 0.7 : 0.5, 'monthly')),
	];
}
