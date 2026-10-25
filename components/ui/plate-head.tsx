import { clsx } from 'clsx';
import type { ReactNode } from 'react';

/*
 * The heading row of a plate: [index] [title] … [annotation], with brass
 * registration crosses on the top corners and a hairline above. `as` sets the
 * heading level.
 */
export function PlateHead({
	index,
	title,
	anno,
	lede,
	as: Tag = 'h2',
	className,
	children,
	size = 'lg',
	id,
}: {
	index?: string;
	title: ReactNode;
	anno?: ReactNode;
	lede?: ReactNode;
	as?: 'h1' | 'h2' | 'h3';
	className?: string;
	children?: ReactNode;
	size?: 'xl' | 'lg' | 'md';
	id?: string;
}) {
	return (
		<div className={clsx('relative', className)}>
			<span aria-hidden className="cross -left-[5px] -top-[5px]" />
			<span aria-hidden className="cross -right-[5px] -top-[5px]" />
			<div className="plate-head">
				<span className="t-num text-[12px] text-brass">{index ?? ''}</span>
				<div className="min-w-0">
					<Tag id={id} className={clsx(size === 'xl' ? 't-xl' : size === 'lg' ? 't-lg' : 't-md', 'text-balance')}>
						{title}
					</Tag>
					{lede ? <p className="t-lede mt-5 max-w-[56ch]">{lede}</p> : null}
				</div>
				{anno ? <div className="t-anno lg:max-w-[22ch] lg:text-right">{anno}</div> : null}
			</div>
			{children}
		</div>
	);
}
