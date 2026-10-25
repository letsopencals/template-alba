'use client';

import { useEffect, type RefObject } from 'react';

/**
 * Writes the pointer position inside `ref` to CSS variables `--lx` / `--ly`
 * (0–1) on that element, rAF-throttled. CSS uses them to place highlights
 * (the porcelain tooth's specular light, the treatment index preview). With
 * reduced motion or a coarse pointer the variables keep their CSS defaults.
 */
export function usePointerLight(ref: RefObject<HTMLElement | null>, { track = 'element' }: { track?: 'element' | 'window' } = {}) {
	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		if (!window.matchMedia('(pointer: fine)').matches) return;
		let frame = 0;
		let x = 0.5;
		let y = 0.35;
		const apply = () => {
			frame = 0;
			el.style.setProperty('--lx', x.toFixed(3));
			el.style.setProperty('--ly', y.toFixed(3));
		};
		const onMove = (e: PointerEvent) => {
			const r = el.getBoundingClientRect();
			x = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
			y = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
			if (!frame) frame = requestAnimationFrame(apply);
		};
		const target: HTMLElement | Window = track === 'window' ? window : el;
		target.addEventListener('pointermove', onMove as EventListener, { passive: true });
		return () => {
			target.removeEventListener('pointermove', onMove as EventListener);
			if (frame) cancelAnimationFrame(frame);
		};
	}, [ref, track]);
}
