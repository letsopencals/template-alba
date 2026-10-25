'use client';

import { useCallback } from 'react';
import { Pip } from '@/components/kids/pip';
import { RisoTitle } from '@/components/kids/paper';
import { kidsThemeClass } from '@/lib/kids/fonts';
import { kidsDate } from '@/lib/kids/format';
import './riso.css';

export interface BraveryCertificateProps {
	/** "Patient name" answer (or null). */
	childName: string | null;
	/** "Child nickname" answer; preferred on the certificate when set. */
	nickname: string | null;
	/** e.g. "Kids check-up". */
	visitTitle: string;
	/** e.g. "Alba Clapham". */
	clinicTitle: string | null;
	/** e.g. "Dr Amara Okafor". */
	clinicianName: string | null;
	/** ISO UTC. */
	startsAt: string;
	/** IANA, e.g. Europe/London. */
	timeZone: string;
}

/** A ribbon rosette printed in two riso inks. */
function Rosette() {
	const petals = Array.from({ length: 28 }, (_, i) => {
		const a = (i / 28) * Math.PI * 2;
		const r = i % 2 ? 46 : 54;
		return `${Math.round((60 + Math.cos(a) * r) * 10) / 10},${Math.round((58 + Math.sin(a) * r) * 10) / 10}`;
	}).join(' ');
	return (
		<svg viewBox="0 0 120 170" className="h-auto w-full" aria-hidden>
			<path d="M38 92L22 166L42 152L52 170L62 100Z" fill="var(--r-teal)" className="r-multiply" />
			<path d="M82 92L98 166L78 152L68 170L58 100Z" fill="var(--r-pink)" className="r-multiply" />
			<polygon points={petals} fill="var(--r-sun)" className="r-multiply" />
			<polygon points={petals} fill="var(--r-pink)" opacity={0.55} transform="translate(2.5 2)" className="r-multiply" />
			<circle cx={60} cy={58} r={34} fill="#fffaf0" />
			<circle cx={60} cy={58} r={30} fill="none" stroke="var(--r-pink)" strokeWidth={1.5} strokeDasharray="3 3" />
			<path d="M60 36l6.5 13.2 14.5 2.1-10.5 10.2 2.5 14.5L60 69.2 47 76l2.5-14.5L39 51.3l14.5-2.1z" fill="var(--r-teal)" className="r-multiply" />
		</svg>
	);
}

/**
 * A printable Certificate of Bravery for a child's visit, risograph style.
 * Mounted on the thank-you page for child visits. "Print certificate" prints
 * only the certificate (see the print rules in riso.css).
 */
export function BraveryCertificate({ childName, nickname, visitTitle, clinicTitle, clinicianName, startsAt, timeZone }: BraveryCertificateProps) {
	const name = nickname?.trim() || childName?.trim() || 'Our Tooth Town hero';
	const day = kidsDate(startsAt, timeZone);

	const print = useCallback(() => {
		const root = document.documentElement;
		root.classList.add('r-printing-cert');
		const done = () => {
			root.classList.remove('r-printing-cert');
			window.removeEventListener('afterprint', done);
		};
		window.addEventListener('afterprint', done);
		window.print();
	}, []);

	return (
		<div className={kidsThemeClass} style={{ background: 'transparent' }}>
			<div className="r-cert r-paper relative mx-auto aspect-[297/210] w-full max-w-[860px] overflow-hidden rounded-[3px] shadow-[0_2px_2px_rgb(47_65_112/.12),0_20px_40px_-18px_rgb(47_65_112/.45)]">
				{/* misregistered double frame */}
				<div aria-hidden className="absolute inset-[3.2%] rounded-[2px] border-[3px] border-(--r-teal) r-multiply" />
				<div aria-hidden className="absolute inset-[3.2%] translate-x-[3px] translate-y-[2px] rounded-[2px] border-[3px] border-(--r-pink) opacity-80 r-multiply" />
				<div aria-hidden className="r-halftone absolute -right-[8%] -bottom-[14%] size-[38%] rounded-full" style={{ ['--dot' as string]: 'var(--r-sun)' }} />
				<div className="absolute inset-[7%] grid grid-cols-[22%_1fr] items-center gap-[4%]">
					<div className="flex flex-col items-center">
						<Rosette />
					</div>
					<div className="min-w-0">
						<p className="text-[clamp(0.55rem,1.4vw,0.8rem)] font-bold tracking-[0.22em] text-(--r-teal) uppercase">Alba Kids · Tooth Town</p>
						<RisoTitle as="p" className="mt-[1%] text-[clamp(1.8rem,6vw,3.6rem)] leading-[0.9]">
							Certificate of Bravery
						</RisoTitle>
						<p className="mt-[3%] text-[clamp(0.7rem,1.7vw,1rem)] text-(--r-ink-soft)">proudly awarded to</p>
						<p className="r-brush border-b-2 border-dotted border-(--r-ink)/40 pb-[1%] text-[clamp(2rem,7vw,4.2rem)] leading-[1] text-[#d62b8a]">{name}</p>
						<p className="mt-[3%] text-[clamp(0.7rem,1.7vw,1.05rem)] leading-snug">
							for being brave at <span className="font-bold">{visitTitle}</span>
							{clinicTitle ? (
								<>
									{' '}
									at <span className="font-bold">{clinicTitle}</span>
								</>
							) : null}{' '}
							on <span className="font-bold">{day}</span>.
						</p>
						<div className="mt-[4%] flex items-end justify-between gap-4">
							<div className="min-w-0">
								<p className="r-brush text-[clamp(1.1rem,3vw,1.9rem)] leading-none">{clinicianName ?? 'The Alba Kids team'}</p>
								<p className="mt-1 border-t-2 border-(--r-ink)/40 pt-1 text-[clamp(0.55rem,1.3vw,0.78rem)] text-(--r-ink-soft)">Signed, your Tooth Hero</p>
							</div>
						</div>
					</div>
				</div>
				<div className="absolute right-[5%] bottom-[6%] w-[15%]">
					<Pip size={140} pose="cheer" mood="grin" animated={false} className="h-auto w-full" />
				</div>
			</div>
			<div className="r-cert-noprint mt-4 flex flex-wrap items-center justify-center gap-4">
				<button type="button" onClick={print} className="r-tag r-tag-pink">
					Print certificate
				</button>
				<p className="text-sm text-(--r-ink-soft)">Or choose “Save as PDF” in the print dialog.</p>
			</div>
		</div>
	);
}
