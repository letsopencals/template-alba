'use client';

import { useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { clsx } from 'clsx';
import type { CheckoutQuestionResponse } from '@opencals/storefront-sdk';
import { Button, ButtonInner, buttonClasses } from '@/components/ui/button';
import { useCart } from '@/contexts/cart-context';
import { toCartLine } from '@/components/cart/cart-line';
import { useHydrated } from '@/hooks/use-hydrated';
import { STEP, useDentalBooking, type BookInitial, type DentalBooking, type StepIndex, type StudioLite } from '@/hooks/use-dental-booking';
import { VISIT_FOR_LABEL } from '@/lib/intake';
import { formatFee, type Department, type Treatment } from '@/lib/catalog';
import { dayLabel, timeLabel } from '@/lib/when';
import type { PublicClinician } from '@/lib/clinicians';
import { ChairTrack, type TrackBlock, type TrackLane } from './chair-track';
import { ChairColumn } from './chair-column';
import { TreatmentEditor } from './treatment-editor';
import { StudioEditor } from './studio-editor';
import { ClinicianEditor } from './clinician-editor';
import { TimeEditor } from './time-editor';
import { ExtrasEditor } from './extras-editor';
import { PatientEditor } from './patient-editor';
import './controls.css';
import './planner.css';

export interface PlannerProps {
	treatments: Treatment[];
	departments: Department[];
	clinicians: PublicClinician[];
	studios: StudioLite[];
	online: StudioLite | null;
	currency: string;
	timeZone: string;
	initial: BookInitial;
	initialQuestions: { slug: string; questions: CheckoutQuestionResponse[] } | null;
}

const PARTS: { step: StepIndex; code: string; name: string }[] = [
	{ step: STEP.treatment, code: '01', name: 'Treatment' },
	{ step: STEP.studio, code: '02', name: 'Studio' },
	{ step: STEP.clinician, code: '03', name: 'Clinician' },
	{ step: STEP.time, code: '04', name: 'Time' },
	{ step: STEP.extras, code: '05', name: 'Extras' },
	{ step: STEP.about, code: '06', name: 'Patient' },
];

const short = (title: string | null | undefined) => (title ? title.replace(/^Alba\s+/i, '') : null);
const minutesOf = (seconds: number) => Math.round(seconds / 60);
const tabOf = (title: string) => title.split(/[\s·(]/)[0]!.slice(0, 12);

/** /book: the Chair planner. The track at the top is the visit; the editor below changes one part of it. */
export function Planner(props: PlannerProps) {
	const flow = useDentalBooking(props);
	const hydrated = useHydrated();
	const { cart } = useCart();
	const { currency } = props;

	// Bring the editor into view when the patient jumps to it from the track.
	const editorRef = useRef<HTMLDivElement>(null);
	const firstPaint = useRef(true);
	useEffect(() => {
		if (firstPaint.current) {
			firstPaint.current = false;
			return;
		}
		const el = editorRef.current;
		if (!el) return;
		const top = el.getBoundingClientRect().top;
		if (top < 0 || top > window.innerHeight * 0.6) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}, [flow.open]);

	const planLane = usePlanLane(flow, hydrated);
	const heldLanes = useCartLanes(cart?.items ?? [], props.timeZone, hydrated);
	const lanes = flow.held ? heldLanes : [...heldLanes, planLane];

	return (
		<section className="pt-24 pb-36 sm:pt-28 lg:pb-24">
			<header className="mx-auto flex max-w-[1440px] flex-col gap-6 px-5 sm:px-8 md:flex-row md:items-end md:justify-between lg:px-12">
				<div>
					<p className="t-anno text-ink-3">Chair planner · real times at five London studios</p>
					<h1 className="t-xl mt-4 text-ink">
						{flow.isKids ? (
							<>
								A visit to <em>Tooth Town.</em>
							</>
						) : flow.held ? (
							<>
								Pencilled <em>in.</em>
							</>
						) : (
							<>
								Plan your <em>visit.</em>
							</>
						)}
					</h1>
				</div>
				<Totals flow={flow} currency={currency} className="max-md:hidden" />
			</header>

			{/* The track stays in view while the editor below changes it. */}
			<div className="sticky top-0 z-20 mt-10 max-md:hidden">
				<ChairTrack lanes={lanes} />
			</div>

			<PlanIndex flow={flow} hydrated={hydrated} />

			<div ref={editorRef} className="mx-auto mt-2 flex max-w-[1440px] scroll-mt-24 gap-4 md:scroll-mt-[260px] px-5 sm:px-8 lg:px-12">
				{!flow.held ? <ChairColumn lane={planLane} className="md:hidden" /> : null}
				<div className="min-w-0 flex-1 pt-8">
					{flow.error ? (
						<p role="alert" className="mb-6 border-l-2 border-signal bg-signal-wash px-4 py-3 text-[14px] text-ink">
							{flow.error.message}
						</p>
					) : null}
					{flow.held ? (
						<HeldPanel flow={flow} lanes={heldLanes} />
					) : (
						<div key={flow.open} className="swap-in">
							<EditorFor flow={flow} departments={props.departments} currency={currency} />
						</div>
					)}
				</div>
			</div>

			<MobileBar flow={flow} currency={currency} />
		</section>
	);
}

function EditorFor({ flow, departments, currency }: { flow: DentalBooking; departments: Department[]; currency: string }) {
	switch (flow.open) {
		case STEP.treatment:
			return <TreatmentEditor flow={flow} departments={departments} currency={currency} />;
		case STEP.studio:
			return <StudioEditor flow={flow} />;
		case STEP.clinician:
			return <ClinicianEditor flow={flow} />;
		case STEP.time:
			return <TimeEditor flow={flow} />;
		case STEP.extras:
			return <ExtrasEditor flow={flow} currency={currency} />;
		default:
			return <PatientEditor flow={flow} />;
	}
}

/** The lane being planned, built from the hook's live choices. */
function usePlanLane(flow: DentalBooking, hydrated: boolean): TrackLane {
	const t = flow.treatment;
	const sel = flow.selected;
	const tabs = flow.addOns.availableAddOns.filter((a) => (flow.addOns.selectedAddOns.get(a.id) ?? 0) > 0).map((a) => tabOf(a.title));
	const face = flow.finalClinician ?? (flow.staffPick && flow.staffPick !== 'any' ? flow.cliniciansById.get(flow.staffPick) : null);
	const blocks: TrackBlock[] = [];
	if (t) {
		blocks.push({
			key: 'plan',
			kind: 'treatment',
			title: `${t.groupTitle}${t.option ? ` · ${t.option}` : ''}`,
			minutes: minutesOf(t.duration),
			offset: 0,
			face: face ? { name: face.name, src: face.imageUrl } : null,
			tabs,
			state: 'plan',
			label: `Treatment: ${t.title}. Change`,
			onClick: () => flow.setOpen(STEP.treatment),
		});
		if (flow.withHygiene && flow.hygiene && flow.hygieneSlot && sel) {
			blocks.push({
				key: 'hygiene',
				kind: 'hygiene',
				title: flow.hygiene.groupTitle,
				minutes: minutesOf(flow.hygiene.duration),
				offset: Math.round((flow.hygieneSlot.at - sel.at) / 60_000),
				face: flow.hygieneSlot.clinician ? { name: flow.hygieneSlot.clinician.name, src: flow.hygieneSlot.clinician.imageUrl } : null,
				state: 'plan',
				label: 'Hygienist straight after. Change',
				onClick: () => flow.setOpen(STEP.extras),
			});
		}
	}
	let ghost: TrackLane['ghost'] = null;
	if (!t) ghost = { label: 'Choose a treatment', minutes: 45, offset: 0, onClick: () => flow.setOpen(STEP.treatment) };
	else if (sel && flow.hygieneSlot && flow.hygiene && !flow.withHygiene) {
		const end = minutesOf(t.duration);
		ghost = { label: 'Hygienist after?', minutes: minutesOf(flow.hygiene.duration), offset: end + 5, onClick: () => flow.setOpen(STEP.extras) };
	}
	return {
		key: 'plan',
		station: flow.isVideo ? 'Video' : short(flow.location?.title),
		when: sel && hydrated ? timeLabel(sel.at, flow.timeZone) : null,
		whenSub: sel && hydrated ? dayLabel(sel.at, flow.timeZone) : null,
		patient: t ? (flow.visitFor === 'self' ? 'You' : VISIT_FOR_LABEL[flow.visitFor]) : null,
		blocks,
		ghost,
		onStation: () => flow.setOpen(STEP.studio),
		onWhen: () => flow.setOpen(STEP.time),
		onPatient: () => flow.setOpen(STEP.about),
	};
}

/** Visits already pencilled into the cart, one lane each (a hygienist straight after joins its check-up's lane). */
export function useCartLanes(items: Parameters<typeof toCartLine>[0][], timeZone: string, hydrated: boolean): TrackLane[] {
	return useMemo(() => {
		const lines = items
			.map(toCartLine)
			.filter((l) => l.from && l.to)
			.sort((a, b) => Date.parse(a.from!) - Date.parse(b.from!));
		const lanes: (TrackLane & { start: number; end: number; place: string | null })[] = [];
		for (const l of lines) {
			const from = Date.parse(l.from!);
			const to = Date.parse(l.to!);
			const prev = lanes[lanes.length - 1];
			const block: TrackBlock = {
				key: l.id,
				kind: 'treatment',
				title: `${l.title}${l.option ? ` · ${l.option}` : ''}`,
				minutes: Math.round((to - from) / 60_000),
				offset: 0,
				face: l.clinicianName ? { name: l.clinicianName, src: l.clinicianImage } : null,
				tabs: l.addOns.map((a) => tabOf(a.title)),
				state: 'held',
				label: `${l.title}, pencilled in`,
			};
			if (prev && prev.place === l.locationTitle && from >= prev.end && from - prev.end <= 15 * 60_000) {
				prev.blocks.push({ ...block, kind: 'hygiene', offset: Math.round((from - prev.start) / 60_000) });
				prev.end = to;
				continue;
			}
			lanes.push({
				key: l.id,
				start: from,
				end: to,
				place: l.locationTitle,
				station: l.video ? 'Video' : short(l.locationTitle),
				when: hydrated ? timeLabel(from, timeZone) : null,
				whenSub: hydrated ? dayLabel(from, timeZone) : null,
				patient: l.patientName,
				blocks: [block],
			});
		}
		return lanes;
	}, [items, timeZone, hydrated]);
}

function PlanIndex({ flow, hydrated }: { flow: DentalBooking; hydrated: boolean }) {
	const values: Record<number, string | null> = {
		0: flow.treatment ? flow.treatment.title : null,
		1: flow.isVideo ? 'Video' : short(flow.location?.title),
		2: flow.staffPick === 'any' ? 'First available' : flow.finalClinician?.name ?? (flow.staffPick ? (flow.cliniciansById.get(flow.staffPick)?.name ?? null) : null),
		3: flow.selected && hydrated ? `${dayLabel(flow.selected.at, flow.timeZone)} ${timeLabel(flow.selected.at, flow.timeZone)}` : null,
		4: flow.done[3] && flow.done[4] ? (flow.withHygiene || flow.addOns.addOnsTotal > 0 ? 'Added' : 'None') : null,
		5: flow.treatment ? VISIT_FOR_LABEL[flow.visitFor] : null,
	};
	if (flow.held) return null;
	return (
		<nav aria-label="Plan" className="plan-index relative mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
			<ol className="no-scrollbar -mx-5 flex overflow-x-auto border-b border-line px-5 sm:mx-0 sm:px-0">
				{PARTS.map((p) => {
					const on = flow.open === p.step;
					const filled = !!values[p.step] && p.step !== STEP.about;
					return (
						<li key={p.code} className="shrink-0 md:flex-1">
							<button
								type="button"
								aria-current={on ? 'step' : undefined}
								onClick={() => flow.setOpen(p.step)}
								className={clsx('-mb-px flex w-full flex-col items-start gap-1 border-b-2 px-3 py-3 text-left transition-colors', on ? '' : 'border-transparent text-ink-2 hover:text-ink')}
							>
								<span className="t-anno flex items-center gap-2">
									<span aria-hidden className={clsx('inline-block h-2 w-2 rounded-full border', filled ? 'border-mint-3 bg-mint-2' : 'border-line-2')} />
									{p.code} {p.name}
								</span>
								<span className="max-w-[18ch] truncate text-[13px]">{values[p.step] ?? '—'}</span>
							</button>
						</li>
					);
				})}
			</ol>
		</nav>
	);
}

function Totals({ flow, currency, className }: { flow: DentalBooking; currency: string; className?: string }) {
	return (
		<div className={clsx('flex items-end gap-6', className)}>
			<div className="text-right">
				<p className="t-anno text-ink-3">{flow.held ? 'Pencilled in' : 'Total today'}</p>
				<p className="font-display text-[44px] leading-none tabular-nums text-ink">{flow.treatment ? formatFee(flow.total, currency) : '—'}</p>
			</div>
			{flow.held ? null : <ReserveButton flow={flow} />}
		</div>
	);
}

function ReserveButton({ flow, className }: { flow: DentalBooking; className?: string }) {
	const missing = flow.missing[0];
	return (
		<div className={clsx('flex flex-col items-end gap-1.5', className)}>
			<Button type="button" size="lg" onClick={() => void flow.reserve()} disabled={flow.booking || flow.held} aria-describedby={missing ? 'reserve-missing' : undefined}>
				{flow.booking ? 'Pencilling in…' : 'Pencil it in'}
			</Button>
			{missing ? (
				<span id="reserve-missing" className="t-anno text-[9.5px] text-ink-3">
					Still needed: {missing}
				</span>
			) : null}
		</div>
	);
}

function countdown(seconds: number | null): string | null {
	if (seconds == null || seconds <= 0) return null;
	const m = Math.floor(seconds / 60);
	const s = seconds % 60;
	return `${m}:${String(s).padStart(2, '0')}`;
}

function HeldPanel({ flow, lanes }: { flow: DentalBooking; lanes: TrackLane[] }) {
	const left = countdown(flow.timeRemaining);
	return (
		<div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
			<div>
				<p className="t-anno text-brass">Pencilled in{left ? ` · held for ${left}` : ''}</p>
				<p className="mt-3 max-w-[46ch] font-display text-[30px] leading-tight text-ink">
					{lanes.length > 1 ? `${lanes.length} visits are held for you.` : 'Your chair is held for you.'} Finish on the patient record and it&rsquo;s yours.
				</p>
				{/* Phones don't show the track; list what's held. */}
				<ul className="mt-6 space-y-3 md:hidden">
					{lanes.map((l) => (
						<li key={l.key} className="border-l-2 border-brass pl-3">
							<p className="text-[15px] text-ink">{l.blocks.map((b) => b.title).join(' + ')}</p>
							<p className="t-anno mt-1 text-ink-2">
								{l.whenSub} {l.when} · {l.station}
							</p>
						</li>
					))}
				</ul>
			</div>
			<div className="flex flex-col items-start gap-4 lg:items-end">
				<Link href="/checkout" className={buttonClasses({ size: 'lg' })}>
					<ButtonInner size="lg">To the patient record</ButtonInner>
				</Link>
				<div className="flex flex-wrap gap-x-6 gap-y-2">
					<button type="button" onClick={flow.bookAnother} className="t-anno text-lagoon underline-offset-4 hover:underline">
						+ Another patient or visit
					</button>
					<button type="button" onClick={() => void flow.changeVisit()} disabled={flow.releasing} className="t-anno text-ink-2 underline-offset-4 hover:underline disabled:opacity-50">
						{flow.releasing ? 'Releasing…' : 'Change this visit'}
					</button>
				</div>
			</div>
		</div>
	);
}

function MobileBar({ flow, currency }: { flow: DentalBooking; currency: string }) {
	return (
		<div className="fixed inset-x-0 bottom-0 z-30 border-t border-line-2 bg-porcelain/95 px-5 py-3 backdrop-blur md:hidden">
			<div className="flex items-center justify-between gap-4">
				<div>
					<p className="t-anno text-[9px] text-ink-3">{flow.held ? 'Pencilled in' : 'Total today'}</p>
					<p className="font-display text-[28px] leading-none tabular-nums text-ink">{flow.treatment ? formatFee(flow.total, currency) : '—'}</p>
				</div>
				{flow.held ? (
					<Link href="/checkout" className={buttonClasses({})}>
						<ButtonInner>Patient record</ButtonInner>
					</Link>
				) : (
					<Button type="button" onClick={() => void flow.reserve()} disabled={flow.booking}>
						{flow.booking ? 'Pencilling…' : 'Pencil it in'}
					</Button>
				)}
			</div>
		</div>
	);
}
