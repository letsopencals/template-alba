'use client';

import { useState } from 'react';
import Image from 'next/image';
import { clsx } from 'clsx';

/*
 * A clinician portrait in Alba's frame: a hairline box with a mono caption
 * strip. A missing or broken photo falls back to the initials set large in
 * the display serif on chart paper (designed, not an error state).
 */
export function Portrait({
	src,
	name,
	className,
	sizes = '240px',
	priority,
	caption,
}: {
	src: string | null | undefined;
	name: string;
	className?: string;
	sizes?: string;
	priority?: boolean;
	caption?: string;
}) {
	const [failed, setFailed] = useState(false);
	const initials = name
		.replace(/^Dr\s+/, '')
		.split(/\s+/)
		.map((w) => w[0])
		.filter(Boolean)
		.slice(0, 2)
		.join('');
	return (
		<div className={clsx('relative overflow-hidden bg-porcelain-2', className)}>
			{src && !failed ? (
				<Image src={src} alt={`Portrait of ${name}`} fill sizes={sizes} priority={priority} className="object-cover" onError={() => setFailed(true)} />
			) : (
				<div className="chart-paper absolute inset-0 flex items-center justify-center" role="img" aria-label={name}>
					<span className="t-display text-[clamp(2.5rem,7vw,4.5rem)] text-lagoon-3">{initials}</span>
				</div>
			)}
			{caption ? <span className="t-anno absolute bottom-0 left-0 right-0 bg-enamel/85 px-2 py-1 !text-[9px] backdrop-blur-sm">{caption}</span> : null}
		</div>
	);
}
