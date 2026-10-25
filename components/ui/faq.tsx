import { clsx } from 'clsx';

/*
 * Questions as a ruled list of native <details> (keyboard and screen readers
 * for free). The marker is a mono "+" that turns to "−".
 */
export function Faq({ items, className }: { items: { q: string; a: string }[]; className?: string }) {
	return (
		<div className={clsx('border-t border-line', className)}>
			{items.map((f, i) => (
				<details key={f.q} className="group border-b border-line">
					<summary className="flex cursor-pointer list-none items-baseline gap-4 py-5 [&::-webkit-details-marker]:hidden">
						<span className="t-num text-[11px] text-brass">Q{String(i + 1).padStart(2, '0')}</span>
						<span className="t-sm flex-1 text-[1.35rem] group-open:text-lagoon-3">{f.q}</span>
						<span aria-hidden className="t-num text-[16px] text-ink-3 group-open:hidden">+</span>
						<span aria-hidden className="t-num hidden text-[16px] text-lagoon-3 group-open:inline">−</span>
					</summary>
					<p className="max-w-[64ch] pb-6 pl-[calc(11px*3+1rem)] text-[15px] leading-relaxed text-ink-2">{f.a}</p>
				</details>
			))}
		</div>
	);
}
