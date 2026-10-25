'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, type AnchorHTMLAttributes, type MouseEvent, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

/*
 * Same-document View Transitions for Next's client navigation.
 *
 * `LightLink` wraps `router.push` in `document.startViewTransition`, and the
 * provider resolves the transition once the new pathname has committed, so
 * elements that share a `view-transition-name` (`vtName` in ./vt-name, usable
 * from server components) morph between
 * pages: a treatment row's numeral and photo become the treatment page's
 * header. Browsers without the API, modified clicks and reduced motion get a
 * plain Next navigation.
 */

type Resolver = (() => void) | null;

interface Ctx {
	navigate(href: string): void;
}

const TransitionContext = createContext<Ctx | null>(null);

type DocWithVT = Document & { startViewTransition?: (cb: () => Promise<void> | void) => { finished: Promise<void> } };

function reduced(): boolean {
	return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function ViewTransitions({ children }: { children: ReactNode }) {
	const router = useRouter();
	const pathname = usePathname();
	const pending = useRef<Resolver>(null);

	// The new route has rendered: let the browser capture the "after" state.
	useEffect(() => {
		pending.current?.();
		pending.current = null;
	}, [pathname]);

	const navigate = useCallback(
		(href: string) => {
			const doc = document as DocWithVT;
			const samePath = new URL(href, window.location.href).pathname === window.location.pathname;
			if (!doc.startViewTransition || reduced() || samePath) {
				router.push(href);
				return;
			}
			doc.startViewTransition(
				() =>
					new Promise<void>((resolve) => {
						pending.current = resolve;
						router.push(href);
						// Never hold the page hostage if the route errors or is slow.
						window.setTimeout(resolve, 1600);
					}),
			);
		},
		[router],
	);

	const value = useMemo(() => ({ navigate }), [navigate]);
	return <TransitionContext.Provider value={value}>{children}</TransitionContext.Provider>;
}

/** Navigate with a view transition from code (e.g. after a chooser). */
export function useLightNavigate(): (href: string) => void {
	const ctx = useContext(TransitionContext);
	const router = useRouter();
	return ctx?.navigate ?? ((href: string) => router.push(href));
}

type LightLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & { href: string; prefetch?: boolean };

/** `next/link` that morphs shared elements between pages. */
export function LightLink({ href, onClick, prefetch, ...props }: LightLinkProps) {
	const ctx = useContext(TransitionContext);
	const handle = (e: MouseEvent<HTMLAnchorElement>) => {
		onClick?.(e);
		if (e.defaultPrevented || !ctx) return;
		if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
		if (props.target && props.target !== '_self') return;
		e.preventDefault();
		ctx.navigate(href);
	};
	return <Link href={href} prefetch={prefetch} onClick={handle} {...props} />;
}
