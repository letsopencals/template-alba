import { clsx } from 'clsx';

type Tone = 'error' | 'success' | 'info';

const TONES: Record<Tone, string> = {
	error: 'border-signal/30 bg-signal-wash text-signal',
	success: 'border-mint-2/40 bg-mint text-mint-3',
	info: 'border-lagoon/20 bg-lagoon-wash text-lagoon',
};

const DOT: Record<Tone, string> = {
	error: 'bg-signal',
	success: 'bg-mint-3',
	info: 'bg-lagoon',
};

/** Quiet inline message (form errors, "a fresh code is on its way"). */
export function Notice({ tone = 'error', className, children }: { tone?: Tone; className?: string; children: React.ReactNode }) {
	return (
		<div
			role={tone === 'error' ? 'alert' : 'status'}
			className={clsx('flex items-start gap-3 rounded-[4px] border px-4 py-3 text-sm leading-relaxed', TONES[tone], className)}
		>
			<span aria-hidden className={clsx('mt-[0.45rem] size-1.5 shrink-0 rounded-full', DOT[tone])} />
			<div className="min-w-0">{children}</div>
		</div>
	);
}

/** Field label used across auth and settings forms. */
export const FIELD_LABEL = 'mb-2 block text-[13px] font-semibold text-ink';
/** Override for `components/ui/form.tsx` labels (their default is legacy). */
export const FORM_LABEL = 'mb-2 block text-[13px] font-semibold normal-case tracking-normal text-ink';
/** Override for `components/ui/form.tsx` messages. */
export const FORM_MESSAGE = 'mt-1.5 text-[13px] text-signal';
/** Quiet underlined text action. */
export const TEXT_LINK =
	'link-hair self-start text-sm font-medium text-lagoon transition-colors hover:text-lagoon disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lagoon rounded-sm';

/** Placeholder lines while an auth step loads (no spinners). */
export function AuthSkeleton() {
	return (
		<div className="space-y-4" aria-busy="true" aria-label="Loading">
			<div className="h-4 w-24 animate-pulse rounded-full bg-bone/70" />
			<div className="h-12 animate-pulse rounded-[4px] bg-porcelain-2" />
			<div className="h-14 animate-pulse rounded-full bg-porcelain-2" />
		</div>
	);
}

/** A status light while a link or email is being checked. */
export function Working({ label }: { label: string }) {
	return (
		<div role="status" className="flex items-center gap-3 text-[14px] text-ink-2">
			<span aria-hidden className="status-light animate-pulse" />
			{label}
		</div>
	);
}
