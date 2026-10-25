import { clsx } from 'clsx';
import { SafeImage } from '@/components/ui/safe-image';

function initials(name: string): string {
	const parts = name.replace(/^Dr\.?\s+/i, '').split(/\s+/).filter(Boolean);
	return (parts[0]?.[0] ?? '') + (parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '');
}

/**
 * A clinician's face for the planner, the record and the appointment card.
 * The initials sit underneath, so a missing portrait (or one that fails to
 * load) still shows who it is.
 */
export function Face({ name, src, className, sizes = '64px' }: { name: string; src: string | null | undefined; className?: string; sizes?: string }) {
	return (
		<span className={clsx('relative block overflow-hidden bg-lagoon-wash', className)}>
			<span aria-hidden className="absolute inset-0 flex items-center justify-center font-display text-[1.1em] text-lagoon">
				{initials(name)}
			</span>
			<SafeImage src={src} alt="" fill sizes={sizes} className="object-cover object-top" />
		</span>
	);
}
