'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { clsx } from 'clsx';
import { LightLink } from '@/components/light/view-transitions';
import { vtName } from '@/components/light/vt-name';
import { formatFee } from '@/lib/catalog';

/*
 * Treatments as a typographic index: one numbered row per department, the
 * title in the display serif, a tagline, the "from" price on a leader. On
 * desktop a photo follows the pointer down the list and swaps with an aperture
 * as you move between rows. Numerals and titles carry view-transition names so
 * they morph into the department page.
 */
export interface IndexRow {
	slug: string;
	index: string;
	title: string;
	tagline: string;
	image: string;
	fromPrice: number | null;
	freeConsult: boolean;
	count: number;
}

export function TreatmentIndex({ rows, currency }: { rows: IndexRow[]; currency: string }) {
	const listRef = useRef<HTMLOListElement>(null);
	const floatRef = useRef<HTMLDivElement>(null);
	const [active, setActive] = useState<string | null>(null);
	const [enabled, setEnabled] = useState(false);

	useEffect(() => {
		const fine = window.matchMedia('(pointer: fine) and (min-width: 1024px)').matches;
		const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		setEnabled(fine && !reduce);
	}, []);

	useEffect(() => {
		if (!enabled) return;
		const list = listRef.current;
		const float = floatRef.current;
		if (!list || !float) return;
		let frame = 0;
		let tx = 0;
		let ty = 0;
		let x = 0;
		let y = 0;
		const loop = () => {
			x += (tx - x) * 0.16;
			y += (ty - y) * 0.16;
			float.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
			frame = Math.abs(tx - x) + Math.abs(ty - y) > 0.5 ? requestAnimationFrame(loop) : 0;
		};
		const onMove = (e: PointerEvent) => {
			const r = list.getBoundingClientRect();
			tx = e.clientX - r.left + 28;
			ty = e.clientY - r.top - 120;
			if (!frame) frame = requestAnimationFrame(loop);
		};
		list.addEventListener('pointermove', onMove);
		return () => {
			list.removeEventListener('pointermove', onMove);
			if (frame) cancelAnimationFrame(frame);
		};
	}, [enabled]);

	const activeRow = rows.find((r) => r.slug === active);

	return (
		<div className="relative">
			<ol ref={listRef} className="relative border-t border-line" onPointerLeave={() => setActive(null)}>
				{rows.map((r) => (
					<li key={r.slug} className="border-b border-line">
						<LightLink
							href={`/treatments/${r.slug}`}
							onPointerEnter={() => setActive(r.slug)}
							onFocus={() => setActive(r.slug)}
							className="group grid grid-cols-[44px_1fr_auto] items-baseline gap-x-4 py-5 sm:grid-cols-[72px_minmax(0,1fr)_minmax(0,0.9fr)_auto] lg:grid-cols-[120px_minmax(0,1.1fr)_minmax(0,1fr)_auto] lg:py-7"
						>
							<span className="t-num text-[12px] text-brass" style={vtName('dept-n', r.slug)}>
								{r.index}
							</span>
							<span className="t-lg transition-[color] duration-300 group-hover:text-lagoon-3" style={vtName('dept-t', r.slug)}>
								{r.title}
							</span>
							<span className="col-span-2 col-start-2 mt-1 text-[14.5px] text-ink-2 sm:col-span-1 sm:col-start-auto sm:mt-0">{r.tagline}</span>
							<span className="row-start-1 col-start-3 flex items-baseline gap-2 whitespace-nowrap sm:row-auto sm:col-auto">
								<span className="t-anno hidden sm:inline">{r.count} · from</span>
								<span className="tabular text-[17px]">{r.fromPrice != null ? formatFee(r.fromPrice, currency) : r.freeConsult ? 'Free' : ''}</span>
							</span>
						</LightLink>
					</li>
				))}
			</ol>
			{enabled ? (
				<div ref={floatRef} aria-hidden className="pointer-events-none absolute left-0 top-0 z-10 hidden w-[300px] lg:block" style={{ transform: 'translate3d(0,0,0)' }}>
					<div
						className={clsx(
							'relative aspect-[4/3] overflow-hidden rounded-[4px] shadow-[var(--shadow-lift)] transition-[clip-path,opacity] duration-500 ease-[var(--ease-light)]',
							activeRow ? 'opacity-100 [clip-path:inset(0_0_0_0)]' : 'opacity-0 [clip-path:inset(48%_10%_48%_10%)]',
						)}
					>
						{rows.map((r) => (
							<Image
								key={r.slug}
								src={r.image}
								alt=""
								fill
								sizes="300px"
								className={clsx('object-cover transition-opacity duration-300', r.slug === active ? 'opacity-100' : 'opacity-0')}
							/>
						))}
						<span className="t-anno absolute bottom-2 left-2 bg-enamel/90 px-1.5 py-0.5 !text-[9px]">{activeRow ? `${activeRow.index} · ${activeRow.title}` : ''}</span>
					</div>
				</div>
			) : null}
		</div>
	);
}
