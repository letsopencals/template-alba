import Link from 'next/link';
import { clsx } from 'clsx';
import { bookHref, formatFee, visitLength, type TreatmentGroup } from '@/lib/catalog';

/*
 * A price list set like an index: treatment, its options as indented sub-rows,
 * length in mono, a dotted leader and the fee, and a book key at the end of
 * each row. `clinic` pre-selects a studio in the booking link.
 */
export function PriceIndex({ groups, currency, clinic, className, dense }: { groups: TreatmentGroup[]; currency: string; clinic?: string; className?: string; dense?: boolean }) {
	return (
		<ul className={clsx('border-t border-line', className)}>
			{groups.map((g) => {
				const multi = g.variants.length > 1;
				return (
					<li key={g.slug} className="border-b border-line">
						{multi ? (
							<div className={clsx('flex items-baseline gap-3', dense ? 'pt-3' : 'pt-5')}>
								<h3 className="t-sm text-[1.3rem]">{g.title}</h3>
								<span className="t-anno">{g.variants.length} options</span>
							</div>
						) : null}
						<ul className={clsx(multi && 'pb-2')}>
							{g.variants.map((t) => (
								<li key={t.id}>
									<Link
										href={bookHref({ service: t.slug, clinic })}
										className={clsx('group grid grid-cols-[1fr_auto] items-baseline gap-x-4 gap-y-1 sm:flex', dense ? 'py-2.5' : 'py-3.5', multi && 'pl-4 sm:pl-6')}
									>
										<span className={clsx('min-w-0', multi ? 'text-[15px] text-ink' : 't-sm text-[1.3rem]')}>
											{multi ? <span className="mr-2 text-ink-4">—</span> : null}
											<span className="group-hover:text-lagoon-3">{t.title}</span>
										</span>
										<span className="t-num order-3 text-[11px] text-ink-3 sm:order-none">{visitLength(t.duration)}</span>
										<span className="leader hidden sm:block" aria-hidden />
										<span className={clsx('tabular text-[16px] sm:order-none', t.price === 0 && 'text-mint-3')}>{formatFee(t.price, currency)}</span>
										<span aria-hidden className="t-anno order-4 hidden w-14 text-right !text-lagoon opacity-0 transition-opacity group-hover:opacity-100 sm:block">
											Book →
										</span>
									</Link>
								</li>
							))}
						</ul>
					</li>
				);
			})}
		</ul>
	);
}
