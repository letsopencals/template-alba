'use client';

import { SafeImage } from '@/components/ui/safe-image';
import type { DentalBooking } from '@/hooks/use-dental-booking';
import type { PublicClinician } from '@/lib/clinicians';

/**
 * 03 · Who's in the chair: tall portrait strips that open out on hover or
 * focus. "First available" is a strip of light; it lets the first free
 * clinician take the time.
 */
export function ClinicianEditor({ flow }: { flow: DentalBooking }) {
	if (!flow.location) {
		return <p className="py-8 text-[15px] text-ink-2">Pick a studio on the line and its team appears here.</p>;
	}
	const people = flow.candidates;
	return (
		<div>
			<p className="mb-5 text-[15px] text-ink-2">
				{people.length} {people.length === 1 ? 'clinician does' : 'clinicians do'} this visit at {flow.location.title.replace(/^Alba\s+/i, '')}. Anyone you choose, the time list follows them.
			</p>
			<div className="flex gap-2 max-sm:flex-col" role="group" aria-label="Clinicians">
				<button type="button" aria-pressed={flow.staffPick === 'any'} onClick={() => flow.chooseClinician('any')} className="strip strip-light max-sm:!h-[120px] max-sm:!flex-none">
					<span className="absolute inset-x-0 top-0 flex h-full flex-col justify-between p-4 text-left text-porcelain">
						<span className="t-anno text-mint-2">Any chair</span>
						<span>
							<span className="block font-display text-[28px] leading-[1.05]">First available</span>
							<span className="mt-1 block text-[13px] text-porcelain/75">The soonest time with anyone on the team.</span>
						</span>
					</span>
				</button>
				{people.map((c) => (
					<Strip key={c.id} c={c} on={flow.staffPick === c.id} onPick={() => flow.chooseClinician(c.id)} />
				))}
			</div>
		</div>
	);
}

function Strip({ c, on, onPick }: { c: PublicClinician; on: boolean; onPick: () => void }) {
	return (
		<button type="button" aria-pressed={on} onClick={onPick} className="strip max-sm:!h-[120px] max-sm:!flex-none" aria-label={`${c.name}, ${c.title}`}>
			<span aria-hidden className="absolute inset-0 flex items-center justify-center font-display text-[42px] text-lagoon/40">
				{c.firstName[0]}
				{c.lastName[0]}
			</span>
			<SafeImage src={c.imageUrl} alt="" fill sizes="(max-width: 640px) 100vw, 320px" className="object-cover object-[50%_20%] max-sm:object-[50%_25%]" />
			<span className="strip-caption text-left">
				<span className="block truncate text-[15px] font-medium">{c.name}</span>
				<span className="t-anno mt-1 block truncate text-mint-2">{c.title}</span>
				{c.languages.length > 1 ? <span className="mt-1 block truncate text-[12px] text-porcelain/70">Speaks {c.languages.join(', ')}</span> : null}
			</span>
		</button>
	);
}
