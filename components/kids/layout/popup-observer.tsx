'use client';

import { useEffect } from 'react';

const SELECTOR = '.r-popup, .r-popup-late, .r-unfold, .r-slide';

/**
 * Pops the storybook's paper layers up once, the first time each one scrolls
 * into view: adds `.r-anim` to the kids root (which arms the hidden start state)
 * and `.r-in` to each element as it enters. Without JS, nothing is hidden;
 * under reduced motion the CSS ignores both classes.
 */
export function PopupObserver({ rootId }: { rootId: string }) {
	useEffect(() => {
		const root = document.getElementById(rootId);
		if (!root || typeof IntersectionObserver === 'undefined') return;
		const io = new IntersectionObserver(
			(entries) => {
				for (const e of entries) {
					if (!e.isIntersecting) continue;
					e.target.classList.add('r-in');
					io.unobserve(e.target);
				}
			},
			{ rootMargin: '0px 0px -12% 0px', threshold: 0.05 },
		);
		const watch = (scope: ParentNode) => scope.querySelectorAll(SELECTOR).forEach((el) => !el.classList.contains('r-in') && io.observe(el));
		watch(root);
		const mo = new MutationObserver((records) => {
			for (const r of records) r.addedNodes.forEach((n) => n instanceof HTMLElement && (n.matches(SELECTOR) ? io.observe(n) : watch(n)));
		});
		mo.observe(root, { childList: true, subtree: true });
		root.classList.add('r-anim');
		return () => {
			io.disconnect();
			mo.disconnect();
		};
	}, [rootId]);
	return null;
}
