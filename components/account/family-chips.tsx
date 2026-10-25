'use client';

import { usePersonFilter } from '@/components/account/use-care';
import type { CarePerson } from '@/components/account/care-utils';

/** "Everyone · You · Oscar": filters the whole record through `?for=`. A segmented switch. */
export function FamilyChips({ people, active }: { people: CarePerson[]; active: string | null }) {
	const { setPerson } = usePersonFilter();
	if (people.length < 2) return null;
	return (
		<div role="group" aria-label="Whose record" className="switch no-scrollbar max-w-full overflow-x-auto">
			<button type="button" aria-pressed={active === null} onClick={() => setPerson(null)}>
				Everyone
			</button>
			{people.map((p) => (
				<button key={p.key} type="button" aria-pressed={active === p.key} onClick={() => setPerson(p.key)}>
					{p.relation === 'self' ? 'You' : p.label}
					{p.relation === 'child' ? <span className="sr-only"> (child)</span> : null}
				</button>
			))}
		</div>
	);
}
