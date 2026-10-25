import Link from 'next/link';
import { FdiStamp } from '@/components/confirmation/appointment-card';
import { siteConfig } from '@/lib/site-config';

export interface AuthShellProps {
	/** Small line above the title ("My Smile"). */
	eyebrow?: string;
	/** Display headline; put the emotional word in <em>. */
	title: React.ReactNode;
	intro?: React.ReactNode;
	children: React.ReactNode;
	/** Line under the form ("New here? Create an account"). */
	footer?: React.ReactNode;
}

/**
 * Every auth page is the front desk: a night plate with the studio stamp and
 * what My Smile keeps on the left, the form on porcelain on the right. On
 * phones the plate shrinks to a band above the form.
 */
export function AuthShell({ eyebrow = 'My Smile', title, intro, children, footer }: AuthShellProps) {
	return (
		<section className="min-h-[100svh] lg:grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)]">
			<aside className="plate-dark chart-paper-light relative flex flex-col justify-between overflow-hidden px-6 pt-24 pb-8 lg:sticky lg:top-0 lg:h-[100svh] lg:px-14 lg:pt-28 lg:pb-12">
				<div className="lamp pointer-events-none absolute inset-x-0 top-0 h-2/3" aria-hidden />
				<p className="t-anno relative">Front desk · {siteConfig.name}</p>
				<div className="relative my-8 flex items-center gap-8 lg:my-0 lg:flex-col lg:items-start">
					<FdiStamp studio="My Smile" className="w-24 shrink-0 opacity-90 lg:w-56" />
					<ul className="space-y-2 text-[14px] text-enamel/75 max-sm:hidden lg:text-[15px]">
						<li>Every visit, for everyone in your family</li>
						<li>When your next check-up and clean are due</li>
						<li>Move or cancel up to 24 hours before</li>
					</ul>
				</div>
				<p className="t-anno relative max-lg:hidden">
					Patient line ·{' '}
					<a href={siteConfig.contact.phoneHref} className="!text-enamel underline-offset-4 hover:underline">
						{siteConfig.contact.phone}
					</a>
				</p>
			</aside>

			<div className="frame flex flex-col py-14 lg:min-h-[100svh] lg:justify-center lg:py-28">
				<div className="mx-auto w-full max-w-[440px]">
					<p className="t-anno">{eyebrow}</p>
					<h1 className="t-lg mt-4 text-ink">{title}</h1>
					{intro ? <div className="mt-4 max-w-[40ch] text-[15px] text-ink-2">{intro}</div> : null}
					<div className="mt-9">{children}</div>
					{footer ? <div className="mt-10 border-t border-line pt-6 text-center text-[14px] text-ink-2">{footer}</div> : null}
					<p className="mt-8 text-center text-[12.5px] leading-relaxed text-ink-3">
						Trouble signing in? Call{' '}
						<a href={siteConfig.contact.phoneHref} className="tabular text-ink-2 underline-offset-4 hover:text-lagoon hover:underline">
							{siteConfig.contact.phone}
						</a>
						. {siteConfig.emergency.short}
					</p>
				</div>
			</div>
		</section>
	);
}

/** Underlined inline link used in auth footers. */
export function AuthLink({ href, children }: { href: string; children: React.ReactNode }) {
	return (
		<Link href={href} className="link-hair font-medium text-lagoon">
			{children}
		</Link>
	);
}
