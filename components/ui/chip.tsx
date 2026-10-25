import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { clsx } from 'clsx';

/*
 * Selectable chip: a small rectangular key with an optional mono code.
 * Selected = lagoon fill. Use for filters, concerns, days, options.
 * `tone="dark"` for dark plates.
 */
export interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	selected?: boolean;
	code?: ReactNode;
	tone?: 'light' | 'dark';
	size?: 'sm' | 'md';
}

export const Chip = forwardRef<HTMLButtonElement, ChipProps>(function Chip({ selected, code, tone = 'light', size = 'md', className, children, type = 'button', ...props }, ref) {
	return (
		<button
			ref={ref}
			type={type}
			aria-pressed={selected}
			className={clsx(
				'inline-flex items-center gap-2 rounded-[4px] border transition-[background-color,border-color,color] duration-150 disabled:opacity-40',
				size === 'sm' ? 'h-8 px-2.5 text-[12.5px]' : 'h-10 px-3.5 text-[14px]',
				tone === 'light'
					? selected
						? 'border-lagoon bg-lagoon text-enamel'
						: 'border-line-2 bg-enamel/60 text-ink hover:border-lagoon'
					: selected
						? 'border-mint bg-mint text-night'
						: 'border-line-light text-enamel hover:border-mint',
				className,
			)}
			{...props}
		>
			{code != null ? <span className={clsx('t-num text-[10.5px]', selected ? 'opacity-70' : tone === 'light' ? 'text-brass' : 'text-mint')}>{code}</span> : null}
			{children}
		</button>
	);
});

/** Non-interactive tag in the same shape (status, speciality, language). */
export function Tag({ children, tone = 'plain', className }: { children: ReactNode; tone?: 'plain' | 'mint' | 'brass' | 'signal' | 'dark'; className?: string }) {
	return (
		<span
			className={clsx(
				't-anno inline-flex h-6 items-center gap-1.5 rounded-[3px] px-2 !text-[10px]',
				tone === 'plain' && 'border border-line-2 !text-ink-2',
				tone === 'mint' && 'bg-mint !text-night',
				tone === 'brass' && 'border border-brass/50 !text-brass',
				tone === 'signal' && 'bg-signal-wash !text-signal',
				tone === 'dark' && 'border border-line-light !text-enamel/80',
				className,
			)}
		>
			{children}
		</span>
	);
}
