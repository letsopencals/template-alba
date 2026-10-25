'use client';

import { useSyncExternalStore } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

function subscribe(onChange: () => void) {
	const mq = window.matchMedia(QUERY);
	mq.addEventListener('change', onChange);
	return () => mq.removeEventListener('change', onChange);
}

/**
 * Hydration-safe reduced-motion flag: false on the server and while hydrating,
 * then the visitor's setting. Use this, never framer-motion's hook.
 */
export function useReducedMotion(): boolean {
	return useSyncExternalStore(
		subscribe,
		() => window.matchMedia(QUERY).matches,
		() => false,
	);
}
