'use client';

import { memo } from 'react';

/**
 * A value that turns over like a split-flap board when it changes (the
 * "Today at Alba" live board). Re-keying restarts the `.flap` keyframe; the
 * CSS disables it under reduced motion.
 */
export const Flap = memo(function Flap({ value, className }: { value: string; className?: string }) {
	return (
		<span key={value} className={`flap ${className ?? ''}`}>
			{value}
		</span>
	);
});
