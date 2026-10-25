'use client';

import { IntakeField } from '@/components/booking/intake-field';
import { isRequiredFor, VISIT_FOR_LABEL, type VisitFor } from '@/lib/intake';
import { siteConfig } from '@/lib/site-config';
import type { DentalBooking } from '@/hooks/use-dental-booking';
import { ComfortDial } from './comfort-dial';

const WHO: VisitFor[] = ['self', 'child', 'other'];

/**
 * 06 · Patient: who it's for (a three-way switch), the comfort dial, then the
 * store's other questions (name, date of birth, a child's nickname, last
 * clean, anything to tell us). Laid out like the top of a record card.
 */
export function PatientEditor({ flow }: { flow: DentalBooking }) {
	const gentle = (flow.comfortFace ?? 0) >= 4;
	const child = flow.visitFor === 'child';
	return (
		<div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-14">
			<div className="space-y-10">
				{flow.visitForAsked ? (
					<div>
						<p className="t-anno mb-3 text-ink-3">PT · Visit for</p>
						<div className="switch" role="group" aria-label="Who is this visit for?">
							{WHO.map((w) => (
								<button key={w} type="button" aria-pressed={flow.visitFor === w} onClick={() => flow.setVisitFor(w)}>
									{VISIT_FOR_LABEL[w]}
								</button>
							))}
						</div>
					</div>
				) : null}

				{flow.comfortAsked ? (
					<div>
						<p className="t-anno mb-1 text-ink-3">PT · Comfort</p>
						<p className="mb-4 text-[15px] text-ink">{child ? 'How do they feel about the dentist?' : 'How do you feel about the dentist?'}</p>
						<ComfortDial value={flow.comfortFace} onChange={flow.setComfortFace} />
						{gentle ? (
							<div className="swap-in mt-6 border-l-2 border-mint-3 pl-4">
								<p className="font-display text-[22px] text-lagoon">{siteConfig.smileCheck.gentle.title}</p>
								<ul className="mt-2 space-y-1 text-[14px] text-ink-2">
									{siteConfig.smileCheck.gentle.points.map((p) => (
										<li key={p}>— {p}</li>
									))}
								</ul>
							</div>
						) : null}
					</div>
				) : null}
			</div>

			<div>
				{flow.noteQuestions.length ? <p className="t-anno mb-5 text-ink-3">PT · Details</p> : null}
				<div className="space-y-7">
				{flow.noteQuestions.map((q) => (
					<IntakeField
						key={q.id}
						question={q}
						value={flow.answers[q.id] ?? ''}
						required={isRequiredFor(q, flow.visitFor)}
						error={flow.showErrors ? (flow.fieldErrors[q.id] ?? null) : null}
						forChild={child}
						onChange={flow.setAnswer}
					/>
				))}
				</div>
			</div>
		</div>
	);
}
