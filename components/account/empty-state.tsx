import Link from 'next/link';
import { buttonClasses, ButtonInner } from '@/components/ui/button';

/** A blank record line with one next step. */
export function EmptyState({ title, body, href, cta }: { title: string; body: string; href?: string; cta?: string }) {
	return (
		<div className="enamel chart-paper px-6 py-12 text-center sm:px-10">
			<p className="t-anno">Nothing on file</p>
			<h3 className="t-md mt-4 text-ink">{title}</h3>
			<p className="mx-auto mt-3 max-w-[42ch] text-[14.5px] leading-relaxed text-ink-2">{body}</p>
			{href && cta ? (
				<Link href={href} className={buttonClasses({ className: 'mt-7' })}>
					<ButtonInner>{cta}</ButtonInner>
				</Link>
			) : null}
		</div>
	);
}

/** Inline failure with a retry, for SWR errors. */
export function LoadError({ what, onRetry }: { what: string; onRetry: () => void }) {
	return (
		<div role="alert" className="border-l-2 border-signal bg-signal-wash px-5 py-4 text-[14px] text-ink">
			We couldn&rsquo;t load {what} just now.{' '}
			<button type="button" onClick={onRetry} className="font-medium text-signal underline underline-offset-4">
				Try again
			</button>
		</div>
	);
}
