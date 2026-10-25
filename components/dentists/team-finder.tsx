'use client';

import { useMemo, useState } from 'react';
import { Chip } from '@/components/ui/chip';
import type { PublicClinician } from '@/lib/clinicians';
import { ContactSheet } from './contact-sheet';

/*
 * The team with three filters set as chart rows (studio, speciality,
 * language). Filters are client state; the full list renders on the server
 * first, so there is no loading state.
 */
export function TeamFinder({
	clinicians,
	studios,
	departments,
}: {
	clinicians: PublicClinician[];
	studios: { id: string; short: string }[];
	departments: { slug: string; short: string }[];
}) {
	const [studio, setStudio] = useState<string | null>(null);
	const [dept, setDept] = useState<string | null>(null);
	const [lang, setLang] = useState<string | null>(null);

	const languages = useMemo(() => {
		const count = new Map<string, number>();
		for (const c of clinicians) for (const l of c.languages) if (l !== 'English') count.set(l, (count.get(l) ?? 0) + 1);
		return [...count.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([l]) => l);
	}, [clinicians]);

	const shown = clinicians.filter(
		(c) =>
			(!studio || (studio === 'video' ? c.video : c.clinics.some((k) => k.id === studio))) &&
			(!dept || c.departments.includes(dept)) &&
			(!lang || c.languages.includes(lang)),
	);

	return (
		<div>
			<div className="grid border-t border-line">
				<FilterRow code="A" label="Studio">
					<Chip size="sm" selected={!studio} onClick={() => setStudio(null)}>
						All
					</Chip>
					{studios.map((s) => (
						<Chip key={s.id} size="sm" selected={studio === s.id} onClick={() => setStudio(studio === s.id ? null : s.id)}>
							{s.short}
						</Chip>
					))}
					<Chip size="sm" selected={studio === 'video'} onClick={() => setStudio(studio === 'video' ? null : 'video')}>
						Video
					</Chip>
				</FilterRow>
				<FilterRow code="B" label="Speciality">
					<Chip size="sm" selected={!dept} onClick={() => setDept(null)}>
						All
					</Chip>
					{departments.map((d) => (
						<Chip key={d.slug} size="sm" selected={dept === d.slug} onClick={() => setDept(dept === d.slug ? null : d.slug)}>
							{d.short}
						</Chip>
					))}
				</FilterRow>
				<FilterRow code="C" label="Also speaks">
					<Chip size="sm" selected={!lang} onClick={() => setLang(null)}>
						Any
					</Chip>
					{languages.map((l) => (
						<Chip key={l} size="sm" selected={lang === l} onClick={() => setLang(lang === l ? null : l)}>
							{l}
						</Chip>
					))}
				</FilterRow>
			</div>
			<p className="t-anno mb-4 mt-8" aria-live="polite">
				{shown.length} of {clinicians.length} clinicians
			</p>
			{shown.length ? (
				<ContactSheet clinicians={shown} cols="wide" />
			) : (
				<p className="border-y border-line py-10 text-center text-ink-2">Nobody matches all three. Try fewer filters.</p>
			)}
		</div>
	);
}

function FilterRow({ code, label, children }: { code: string; label: string; children: React.ReactNode }) {
	return (
		<div className="grid gap-3 border-b border-line py-4 lg:grid-cols-[120px_160px_1fr] lg:items-center">
			<span className="t-num hidden text-[11px] text-brass lg:block">{code}</span>
			<span className="t-anno">{label}</span>
			<div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0">{children}</div>
		</div>
	);
}
