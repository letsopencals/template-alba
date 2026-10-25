'use client';

import { useState } from 'react';

/**
 * A clinician's portrait for the scrapbook. When the store has no photo (or it
 * fails to load) it becomes a cut-paper silhouette with their initials.
 */
export function HeroPhoto({ src, name, ink, className = '' }: { src: string | null; name: string; ink: string; className?: string }) {
	const [failed, setFailed] = useState(false);
	const initials = name
		.replace(/^Dr\s+/, '')
		.split(/\s+/)
		.map((p) => p[0])
		.join('')
		.slice(0, 2);
	if (!src || failed) {
		return (
			<span className={`relative block overflow-hidden ${className}`} style={{ background: ink }} role="img" aria-label={`${name} (no photo yet)`}>
				<svg viewBox="0 0 100 125" className="absolute inset-0 size-full" aria-hidden preserveAspectRatio="xMidYMax slice">
					<circle cx={50} cy={50} r={22} fill="#fffaf0" opacity={0.92} />
					<path d="M12 125C12 94 30 80 50 80C70 80 88 94 88 125Z" fill="#fffaf0" opacity={0.92} />
				</svg>
				<span className="r-brush absolute inset-x-0 top-[31%] text-center text-[2.1rem] leading-none" style={{ color: ink }}>
					{initials}
				</span>
			</span>
		);
	}
	return (
		// eslint-disable-next-line @next/next/no-img-element -- store-hosted portrait inside a paper frame
		<img src={src} alt="" loading="lazy" decoding="async" onError={() => setFailed(true)} className={`block object-cover ${className}`} />
	);
}
