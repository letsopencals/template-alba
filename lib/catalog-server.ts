import { cache } from 'react';
import { getCollections, getDepartmentIndex, getProducts, getStoreSettings } from '@/lib/server-data';
import { toDepartments, toGroups, toTreatments, type Department, type Treatment, type TreatmentGroup } from '@/lib/catalog';

export interface Catalog {
	treatments: Treatment[];
	groups: TreatmentGroup[];
	departments: Department[];
	currency: string;
}

/**
 * Server-only: the treatment catalogue for RSC pages (home, Smile Check,
 * treatments, studios, dentists, /book). Request-deduped. Never import from a
 * 'use client' file.
 */
export const getCatalog = cache(async (): Promise<Catalog> => {
	const [products, collections, index, settings] = await Promise.all([getProducts(), getCollections(), getDepartmentIndex(), getStoreSettings()]);
	const treatments = toTreatments(products, index);
	return { treatments, groups: toGroups(treatments), departments: toDepartments(collections, treatments), currency: settings?.currency ?? 'GBP' };
});
