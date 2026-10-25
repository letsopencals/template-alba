'use client';

import { clsx } from 'clsx';
import { Button } from '@/components/ui/button';
import { useHydrated } from '@/hooks/use-hydrated';
import { computeAddOnLineTotal } from '@/lib/format';
import { formatFee } from '@/lib/catalog';
import { timeLabel } from '@/lib/when';
import type { DentalBooking } from '@/hooks/use-dental-booking';
import { Face } from './face';

/**
 * 05 · Extras. Each add-on hangs a tab on the visit block as you switch it on.
 * After a check-up, the hygienist straight after snaps on as a second block
 * (a second appointment in the same cart).
 */
export function ExtrasEditor({ flow, currency }: { flow: DentalBooking; currency: string }) {
	const hydrated = useHydrated();
	const slot = flow.hygieneSlot;
	const addOns = flow.addOns;

	if (!flow.selected) return <p className="py-8 text-[15px] text-ink-2">Pick a time first; what can be added depends on it.</p>;

	return (
		<div className="space-y-10">
			{flow.hygieneHere && flow.hygiene ? (
				<section aria-label="Hygienist straight after">
					<p className="t-anno mb-3 text-ink-3">Snap on</p>
					{slot ? (
						<button
							type="button"
							aria-pressed={flow.hygieneAfter}
							onClick={() => flow.setHygieneAfter(!flow.hygieneAfter)}
							className={clsx(
								'grid w-full grid-cols-[auto_1fr_auto] items-center gap-4 rounded-[6px] border-[1.5px] p-3 text-left transition-colors sm:p-4',
								flow.hygieneAfter ? 'border-mint-3 bg-mint' : 'border-dashed border-line-2 hover:border-lagoon',
							)}
						>
							{slot.clinician ? <Face name={slot.clinician.name} src={slot.clinician.imageUrl} className="h-16 w-12 rounded-[4px] text-[14px]" sizes="48px" /> : <span />}
							<span className="min-w-0">
								<span className="block text-[16px] text-ink">The hygienist, straight after</span>
								<span className="mt-1 block text-[14px] text-ink-2">
									{flow.hygiene.groupTitle}
									{flow.hygiene.option ? ` · ${flow.hygiene.option}` : ''} with {slot.clinician?.name ?? 'a hygienist'} at{' '}
									<span className="tabular-nums text-ink">{hydrated ? timeLabel(slot.at, flow.timeZone) : '…'}</span>. Same chair, no second trip.
								</span>
							</span>
							<span className="t-anno whitespace-nowrap text-ink">{flow.hygieneAfter ? 'On the track ✓' : `+ ${formatFee(flow.hygiene.price, currency)}`}</span>
						</button>
					) : (
						<p className="text-[14px] text-ink-2">No hygienist is free straight after this time. You can add a hygiene visit afterwards.</p>
					)}
				</section>
			) : null}

			<section aria-label="Add-ons">
				<p className="t-anno mb-1 text-ink-3">Add to this visit</p>
				{addOns.addOnsLoading ? (
					<div className="mt-3 space-y-2" aria-busy="true">
						<div className="h-14 animate-pulse rounded-[4px] bg-porcelain-2" />
						<div className="h-14 animate-pulse rounded-[4px] bg-porcelain-2" />
					</div>
				) : addOns.availableAddOns.length === 0 ? (
					<p className="mt-2 text-[14px] text-ink-2">Nothing to add to this visit.</p>
				) : (
					<ul>
						{addOns.availableAddOns.map((a) => {
							const qty = addOns.selectedAddOns.get(a.id) ?? 0;
							const on = qty > 0;
							return (
								<li key={a.id}>
									<button type="button" aria-pressed={on} onClick={() => addOns.updateQuantity(a.id, on ? 0 : 1)} className="row-btn grid-cols-[auto_1fr_auto] items-center gap-4 px-1 py-4 sm:px-3">
										<span
											aria-hidden
											className={clsx('flex h-5 w-5 items-center justify-center rounded-[3px] border-[1.5px] text-[12px] transition-colors', on ? 'border-brass bg-brass text-enamel' : 'border-line-2')}
										>
											{on ? '✓' : ''}
										</span>
										<span className="min-w-0">
											<span className="block text-[16px] text-ink">{a.title}</span>
											{a.description ? <span className="mt-0.5 line-clamp-2 block text-[13.5px] text-ink-2">{a.description}</span> : null}
										</span>
										<span className="font-display text-[20px] tabular-nums text-ink">+{formatFee(computeAddOnLineTotal(a, 1, 1), currency)}</span>
									</button>
								</li>
							);
						})}
					</ul>
				)}
			</section>

			<Button type="button" onClick={flow.continueFromExtras}>
				{Array.from(addOns.selectedAddOns.values()).some((q) => q > 0) || flow.withHygiene ? 'That’s everything' : 'Nothing to add'}
			</Button>
		</div>
	);
}
