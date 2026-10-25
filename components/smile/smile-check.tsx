'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { clsx } from 'clsx';
import { siteConfig, type SmileArea } from '@/lib/site-config';
import { bookHref, formatFee, visitLength, type Treatment } from '@/lib/catalog';
import { isFront, tooth } from '@/lib/teeth';
import { useNextFree } from '@/hooks/use-next-free';
import { Chip } from '@/components/ui/chip';
import { buttonClasses, ButtonInner } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { NextFreeLabel } from '@/components/clinics/next-free-label';
import { ArchChart } from './arch-chart';
import { ComfortDial } from './comfort-dial';

/*
 * Smile Check: tap where (teeth on the chart, the gums, or a whole-smile
 * preset), say what's going on, set the comfort dial, and get a visit, the
 * studio with the soonest chair and a pre-filled booking link. The right-hand
 * "chart note" fills in as you answer, like a clinician's note.
 */
export interface SmileStudio {
	id: string;
	slug: string;
	short: string;
}

const FRONT = [13, 12, 11, 21, 22, 23, 43, 42, 41, 31, 32, 33];
const BACK = [18, 17, 16, 15, 14, 24, 25, 26, 27, 28, 48, 47, 46, 45, 44, 34, 35, 36, 37, 38];

type Preset = 'front' | 'back' | 'whole' | null;

function comfortParam(v: number | null): 'relaxed' | 'nervous' | 'anxious' | null {
	if (v == null) return null;
	return v <= 2 ? 'relaxed' : v <= 4 ? 'nervous' : 'anxious';
}

export function SmileCheck({ treatments, studios, currency }: { treatments: Treatment[]; studios: SmileStudio[]; currency: string }) {
	const cfg = siteConfig.smileCheck;
	const [teeth, setTeeth] = useState<number[]>([]);
	const [gums, setGums] = useState(false);
	const [preset, setPreset] = useState<Preset>(null);
	const [concernId, setConcernId] = useState<string | null>(null);
	const [comfort, setComfort] = useState<number | null>(null);
	const [pickedStudio, setPickedStudio] = useState<string | null>(null);

	const toggleTooth = (fdi: number) => {
		setPreset(null);
		setTeeth((list) => (list.includes(fdi) ? list.filter((x) => x !== fdi) : [...list, fdi]));
	};
	const choosePreset = (p: Exclude<Preset, null>) => {
		if (preset === p) {
			setPreset(null);
			setTeeth([]);
			return;
		}
		setPreset(p);
		setTeeth(p === 'front' ? FRONT : p === 'back' ? BACK : []);
		if (p === 'whole') setGums(false);
	};

	const areas = useMemo(() => {
		const a = new Set<SmileArea['id']>();
		if (preset === 'whole') a.add('whole');
		if (teeth.some(isFront)) a.add('front');
		if (teeth.some((t) => !isFront(t))) a.add('back');
		if (gums) a.add('gums');
		return a;
	}, [teeth, gums, preset]);
	const whereDone = areas.size > 0;

	const concerns = cfg.concerns.filter((c) => !whereDone || c.areas.some((x) => areas.has(x)));
	const concern = cfg.concerns.find((c) => c.id === concernId) ?? null;

	const bySlug = useMemo(() => new Map(treatments.map((t) => [t.slug, t])), [treatments]);
	const recs = (concern?.services ?? []).map((s) => bySlug.get(s)).filter((t): t is Treatment => !!t);
	const rec = recs[0] ?? null;
	const alt = recs[1] ?? null;
	const ready = !!(whereDone && concern && comfort != null && rec);

	// Soonest chair for the recommendation: one cached read per studio offering it.
	const places = useMemo(() => (rec ? (rec.studios.length ? rec.studios : rec.online ? [rec.online] : []) : []), [rec]);
	const pairs = useMemo(() => places.map((p) => ({ variantId: rec!.id, locationId: p.id })), [places, rec]);
	const free = useNextFree(pairs, ready);
	const ranked = places
		.map((p) => ({ p, at: free?.[`${rec!.id}:${p.id}`] }))
		.sort((a, b) => (a.at ?? Infinity) - (b.at ?? Infinity));
	const soonest = ranked.find((r) => r.at != null)?.p.slug ?? null;
	const studioSlug = pickedStudio && places.some((p) => p.slug === pickedStudio) ? pickedStudio : soonest;
	const studioName = (slug: string) => studios.find((s) => s.slug === slug)?.short ?? (slug === rec?.online?.slug ? 'Video' : slug);

	const whereText =
		preset === 'whole'
			? 'Whole smile'
			: [
					teeth.length ? (preset === 'front' ? 'Front teeth' : preset === 'back' ? 'Back teeth' : teeth.length <= 3 ? teeth.map((t) => `${tooth(t).name} (${t})`).join(', ') : `${teeth.length} teeth`) : null,
					gums ? 'gums' : null,
				]
					.filter(Boolean)
					.join(' + ');
	const whereLabel = whereText ? whereText.charAt(0).toUpperCase() + whereText.slice(1) : '';
	const concernText = concern ? `${concern.label}${whereText ? ` · ${whereText}` : ''}` : null;
	const comfortStop = cfg.comfort.find((c) => c.value === comfort);
	const href = rec ? bookHref({ service: rec.slug, clinic: studioSlug, comfort: comfortParam(comfort), concern: concernText }) : '/book';

	const reset = () => {
		setTeeth([]);
		setGums(false);
		setPreset(null);
		setConcernId(null);
		setComfort(null);
		setPickedStudio(null);
	};

	return (
		<div className="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)] lg:gap-14">
			{/* The chart */}
			<div className="relative">
				<div className="chart-paper relative rounded-[6px] border border-line bg-enamel/50 px-4 pb-6 pt-5 sm:px-8">
					<div className="flex items-center justify-between">
						<p className="t-anno">Chart · tap the teeth</p>
						<p className="t-anno">{teeth.length ? `${teeth.length} selected` : 'FDI'}</p>
					</div>
					<div className="mx-auto mt-2 max-w-[400px]">
						<ArchChart selected={teeth} onToggle={toggleTooth} gums={gums} onGums={() => { setGums((g) => !g); if (preset === 'whole') setPreset(null); }} label="Your teeth: tap the ones on your mind" />
					</div>
					<div className="mt-4 flex flex-wrap justify-center gap-2">
						<Chip size="sm" selected={preset === 'front'} onClick={() => choosePreset('front')}>
							Front teeth
						</Chip>
						<Chip size="sm" selected={preset === 'back'} onClick={() => choosePreset('back')}>
							Back teeth
						</Chip>
						<Chip size="sm" selected={gums} onClick={() => { setGums((g) => !g); if (preset === 'whole') setPreset(null); }}>
							Gums
						</Chip>
						<Chip size="sm" selected={preset === 'whole'} onClick={() => choosePreset('whole')}>
							My whole smile
						</Chip>
					</div>
				</div>
				<p className="t-anno mt-3">Patient&rsquo;s right is on the left, as on your dentist&rsquo;s chart.</p>
			</div>

			{/* The chart note */}
			<div className="enamel-lift self-start lg:sticky lg:top-8">
				<div className="flex items-center justify-between border-b border-line px-5 py-3.5 sm:px-6">
					<p className="t-anno">Chart note</p>
					<button type="button" onClick={reset} className="t-anno inline-flex items-center gap-1.5 hover:!text-ink">
						<Icon name="refresh" className="h-3 w-3" /> Start again
					</button>
				</div>

				<NoteRow code="01" title="Where" done={whereDone} value={whereLabel || null} placeholder="Tap the chart, or choose a preset." />

				<NoteRow code="02" title="What’s going on" done={!!concern} active={whereDone && !concern} value={concern?.label ?? null} placeholder={whereDone ? undefined : 'After you’ve shown us where.'}>
					{whereDone ? (
						<div className="mt-3 flex flex-wrap gap-2">
							{concerns.map((c) => (
								<Chip key={c.id} size="sm" selected={concernId === c.id} onClick={() => setConcernId(concernId === c.id ? null : c.id)} className={c.urgent ? 'data-[u]:border-signal' : undefined}>
									{c.urgent ? <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-signal" /> : null}
									{c.label}
								</Chip>
							))}
						</div>
					) : null}
				</NoteRow>

				<NoteRow code="03" title="How you feel about the dentist" done={comfort != null} active={!!concern && comfort == null} value={concern ? null : (comfortStop?.label ?? null)}>
					{concern ? (
						<div className="mx-auto mt-2 max-w-[300px]">
							<ComfortDial value={comfort} onChange={setComfort} stops={cfg.comfort.map((c) => ({ value: c.value, label: c.label }))} />
						</div>
					) : null}
				</NoteRow>

				{/* 04 Suggestion */}
				<div className={clsx('px-5 py-5 sm:px-6', ready ? 'bg-night text-enamel' : '')}>
					<div className="flex items-baseline gap-3">
						<span className={clsx('t-num text-[11px]', ready ? 'text-mint' : 'text-brass')}>04</span>
						<p className={clsx('t-anno', ready && '!text-mint')}>Our suggestion</p>
					</div>
					{ready && rec ? (
						<div className="mt-4">
							{concern?.urgent ? (
								<p className="mb-4 border-l-2 border-signal pl-3 text-[13px] text-enamel/80">{siteConfig.emergency.short}</p>
							) : null}
							<p className="t-lg text-enamel">{rec.groupTitle !== rec.title && rec.option ? `${rec.groupTitle}, ${rec.title.toLowerCase()}` : rec.title}</p>
							<p className="mt-2 flex items-center gap-3 text-[14px] text-enamel/75">
								<span className="t-num">{visitLength(rec.duration)}</span>
								<span aria-hidden>·</span>
								<span className="tabular">{formatFee(rec.price, currency)}</span>
							</p>
							<p className="mt-3 max-w-[44ch] text-[14.5px] leading-relaxed text-enamel/80">{concern?.why}</p>

							{places.length > 1 ? (
								<div className="mt-5">
									<p className="t-anno">Soonest chair</p>
									<ul className="mt-2 border-t border-line-light">
										{ranked.map(({ p, at }) => (
											<li key={p.id}>
												<button
													type="button"
													onClick={() => setPickedStudio(p.slug)}
													aria-pressed={studioSlug === p.slug}
													className={clsx('flex w-full items-baseline gap-3 border-b border-line-light py-2.5 text-left text-[14px]', studioSlug === p.slug ? 'text-mint' : 'text-enamel/85 hover:text-enamel')}
												>
													<span className={clsx('h-2 w-2 shrink-0 rounded-full border', studioSlug === p.slug ? 'border-mint bg-mint' : 'border-enamel/50')} aria-hidden />
													<span>{studioName(p.slug)}</span>
													{p.slug === soonest ? <span className="t-anno !text-[9px] !text-mint">Soonest</span> : null}
													<span className="leader" aria-hidden />
													<NextFreeLabel at={at} className="text-[12px]" />
												</button>
											</li>
										))}
									</ul>
								</div>
							) : null}

							{comfort != null && comfort >= 4 ? (
								<div className="mt-5 rounded-[4px] border border-line-light p-4">
									<p className="t-sm text-[1.2rem] text-mint">{cfg.gentle.title}</p>
									<ul className="mt-2 grid gap-1 text-[13.5px] text-enamel/80">
										{cfg.gentle.points.map((p) => (
											<li key={p} className="flex gap-2">
												<span aria-hidden className="text-mint">—</span>
												{p}
											</li>
										))}
									</ul>
								</div>
							) : null}

							<div className="mt-6 grid gap-3">
								<Link href={href} className={buttonClasses({ variant: 'light', size: 'lg', fullWidth: true })}>
									<ButtonInner variant="light" size="lg">
										{studioSlug ? `Book at ${studioName(studioSlug)}` : 'Book this visit'}
									</ButtonInner>
								</Link>
								{alt ? (
									<Link href={bookHref({ service: alt.slug, clinic: studioSlug, comfort: comfortParam(comfort), concern: concernText })} className="link-hair justify-self-start text-[13.5px] text-enamel/80">
										Or: {alt.title} · {formatFee(alt.price, currency)}
									</Link>
								) : null}
								<p className="t-anno !text-enamel/45">A suggestion, not a diagnosis. Your dentist will confirm at the visit.</p>
							</div>
						</div>
					) : (
						<p className="mt-3 text-[14px] text-ink-3">Answer the three notes above and we&rsquo;ll suggest the visit, the studio and the soonest time.</p>
					)}
				</div>
			</div>
		</div>
	);
}

function NoteRow({
	code,
	title,
	done,
	active,
	value,
	placeholder,
	children,
}: {
	code: string;
	title: string;
	done: boolean;
	active?: boolean;
	value: string | null;
	placeholder?: string;
	children?: React.ReactNode;
}) {
	return (
		<div className={clsx('border-b border-line px-5 py-4 sm:px-6', active && 'bg-lagoon-wash/50')}>
			<div className="flex items-baseline gap-3">
				<span className="t-num text-[11px] text-brass">{code}</span>
				<p className="t-anno !text-ink-2">{title}</p>
				{done ? <Icon name="check" className="ml-auto h-3.5 w-3.5 text-mint-3" /> : null}
			</div>
			{value ? <p className="t-sm mt-2 text-[1.3rem]">{value}</p> : placeholder ? <p className="mt-2 text-[13.5px] text-ink-3">{placeholder}</p> : null}
			{children}
		</div>
	);
}
