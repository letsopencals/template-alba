import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { clsx } from 'clsx';

/*
 * Alba buttons are instrument keys, not pills: a precise 4px-radius body with
 * an optional "key cell" on the right (an arrow or a mono annotation) divided
 * by a hairline. Variants:
 *   solid  – lagoon fill, the one action colour
 *   line   – hairline outline on porcelain
 *   light  – enamel on dark plates
 *   signal – pain / emergency / destructive
 *   text   – an underlined link with the brass hairline
 */
export type ButtonVariant = 'solid' | 'line' | 'light' | 'signal' | 'text';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonStyleOptions {
	variant?: ButtonVariant;
	size?: ButtonSize;
	fullWidth?: boolean;
	className?: string;
}

const BASE =
	'group/btn relative inline-flex select-none items-stretch overflow-hidden rounded-[4px] font-medium tracking-[0.005em] transition-[background-color,color,border-color,box-shadow] duration-200 disabled:pointer-events-none disabled:opacity-40 aria-disabled:pointer-events-none aria-disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lagoon-3';

const VARIANTS: Record<ButtonVariant, string> = {
	solid: 'bg-lagoon text-enamel hover:bg-lagoon-2 shadow-[0_1px_0_rgba(255,255,255,0.12)_inset,0_10px_24px_-14px_rgba(6,26,28,0.8)]',
	line: 'border border-line-2 bg-enamel/40 text-ink hover:border-lagoon hover:bg-enamel',
	light: 'bg-enamel text-lagoon hover:bg-mint',
	signal: 'bg-signal text-enamel hover:brightness-110',
	text: 'link-hair rounded-none px-0 text-ink hover:text-lagoon',
};

const SIZES: Record<ButtonSize, string> = {
	sm: 'h-9 text-[13px]',
	md: 'h-11 text-[14px]',
	lg: 'h-14 text-[15px]',
};
const PAD: Record<ButtonSize, string> = { sm: 'px-3.5', md: 'px-5', lg: 'px-6' };
const CELL: Record<ButtonSize, string> = { sm: 'w-9', md: 'w-11', lg: 'w-14' };

export function buttonClasses({ variant = 'solid', size = 'md', fullWidth, className }: ButtonStyleOptions = {}) {
	return clsx(BASE, VARIANTS[variant], variant === 'text' ? 'h-auto items-center' : SIZES[size], fullWidth && 'w-full', className);
}

/** The inside of a button: label, and an optional key cell (arrow by default). */
export function ButtonInner({ children, cell, size = 'md', variant = 'solid' }: { children: ReactNode; cell?: ReactNode | false; size?: ButtonSize; variant?: ButtonVariant }) {
	if (variant === 'text') {
		return (
			<span className="inline-flex items-center gap-1.5">
				{children}
				{cell === false ? null : (cell ?? <Arrow />)}
			</span>
		);
	}
	return (
		<>
			<span className={clsx('flex flex-1 items-center justify-center gap-2 whitespace-nowrap', PAD[size], cell !== false && 'justify-start')}>{children}</span>
			{cell === false ? null : (
				<span
					aria-hidden
					className={clsx(
						'flex shrink-0 items-center justify-center border-l',
						CELL[size],
						variant === 'solid' || variant === 'signal' ? 'border-white/15' : 'border-line',
					)}
				>
					<span className="transition-transform duration-300 ease-[var(--ease-light)] group-hover/btn:translate-x-0.5">{cell ?? <Arrow />}</span>
				</span>
			)}
		</>
	);
}

export function Arrow({ className }: { className?: string }) {
	return (
		<svg aria-hidden viewBox="0 0 16 16" className={clsx('h-3.5 w-3.5', className)} fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="square">
			<path d="M2 8h11M9 4l4 4-4 4" />
		</svg>
	);
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, Omit<ButtonStyleOptions, 'className'> {
	/** Right-hand key cell. Defaults to an arrow; `false` hides it. */
	cell?: ReactNode | false;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
	{ variant = 'solid', size = 'md', fullWidth, cell, className, type = 'button', children, ...props },
	ref,
) {
	return (
		<button ref={ref} type={type} className={buttonClasses({ variant, size, fullWidth, className })} {...props}>
			<ButtonInner cell={cell} size={size} variant={variant}>
				{children}
			</ButtonInner>
		</button>
	);
});
