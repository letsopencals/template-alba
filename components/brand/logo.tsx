import { useId } from 'react';
import { clsx } from 'clsx';

/*
 * The Alba mark: a tooth outline with the sun rising inside it (public/mark.svg,
 * drawn by hand). `tone` swaps the lagoon strokes for enamel on dark plates; the
 * sun stays brass. The wordmark is the geometric "alba" from public/logo.svg.
 */
export function AlbaMark({ className, tone = 'ink', title }: { className?: string; tone?: 'ink' | 'light'; title?: string }) {
	const clip = useId();
	const stroke = tone === 'light' ? '#FCFBF8' : '#0D3B3E';
	return (
		<svg viewBox="26 14 68 94" className={clsx('h-8 w-auto', className)} role={title ? 'img' : undefined} aria-hidden={title ? undefined : true} aria-label={title}>
			<path
				d="M30,40 C30,21 46,17 53,24 C56.5,27 63.5,27 67,24 C74,17 90,21 90,40 C90,58 84,67 82,81 C80,95 76,103 71,103 C65,103 66,87 60,87 C54,87 55,103 49,103 C44,103 40,95 38,81 C36,67 30,58 30,40 Z"
				fill="none"
				stroke={stroke}
				strokeWidth="6.5"
				strokeLinejoin="round"
			/>
			<clipPath id={clip}>
				<rect x="0" y="0" width="120" height="62" />
			</clipPath>
			<circle cx="60" cy="62" r="13" fill="#C29A5B" clipPath={`url(#${clip})`} />
			<line x1="42" y1="62" x2="78" y2="62" stroke={stroke} strokeWidth="4.5" strokeLinecap="round" />
			<g stroke="#C29A5B" strokeWidth="3.6" strokeLinecap="round">
				<line x1="60" y1="35" x2="60" y2="41" />
				<line x1="44" y1="44" x2="48.5" y2="48" />
				<line x1="76" y1="44" x2="71.5" y2="48" />
			</g>
		</svg>
	);
}

export function AlbaWordmark({ className, tone = 'ink' }: { className?: string; tone?: 'ink' | 'light' }) {
	const stroke = tone === 'light' ? '#FCFBF8' : '#0D3B3E';
	return (
		<svg viewBox="-1 29 154 76" className={clsx('h-5 w-auto', className)} aria-hidden>
			<g fill="none" stroke={stroke} strokeWidth="8.5">
				<circle cx="20" cy="80" r="16" />
				<line x1="36" y1="62" x2="36" y2="100" />
				<line x1="56" y1="34" x2="56" y2="100" />
				<line x1="76" y1="34" x2="76" y2="100" />
				<circle cx="92" cy="80" r="16" />
				<circle cx="128" cy="80" r="16" />
				<line x1="144" y1="62" x2="144" y2="100" />
			</g>
		</svg>
	);
}

/** Mark + wordmark + "dental" in mono. */
export function AlbaLogo({ className, tone = 'ink' }: { className?: string; tone?: 'ink' | 'light' }) {
	return (
		<span className={clsx('inline-flex items-center gap-2.5', className)} aria-label="Alba Dental" role="img">
			<AlbaMark tone={tone} className="h-8" />
			<span className="flex items-end gap-2">
				<AlbaWordmark tone={tone} className="h-[19px]" />
				<span className={clsx('t-anno !text-[9px] leading-none', tone === 'light' ? '!text-enamel/60' : '')}>dental</span>
			</span>
		</span>
	);
}
