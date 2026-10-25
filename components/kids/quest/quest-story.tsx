'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Pip, type PipMood } from '@/components/kids/pip';
import { BuildingArt } from '@/components/kids/buildings';
import { RisoTitle, Tape } from '@/components/kids/paper';
import { kidsMinutes, kidsPrice } from '@/lib/kids/format';
import { kidsBookHref } from '@/lib/kids/kids-config';
import { AGE_LABEL, EMPTY_ANSWERS, FEELINGS, recommend, type Age, type Hurting, type QuestAnswers, type QuestService } from '@/lib/kids/quest';

/*
 * Tooth Quest as a choose-your-path storybook. The left page is the story so
 * far, with every answer written into its blank; the right page asks "which
 * way?" with paper signposts. The last page is the visit to book.
 */

export interface QuestBranch {
	slug: string;
	title: string;
	nickname: string;
	area: string | null;
}

const STEPS = 5;

const FEEL_STORY: Record<number, string> = {
	1: 'they couldn’t wait',
	2: 'they were pretty happy',
	3: 'they weren’t quite sure',
	4: 'they were a bit worried',
	5: 'they were very scared',
};

const HURT: { value: Hurting; label: string; story: string }[] = [
	{ value: 'no', label: 'Nothing hurts', story: 'nothing hurt at all' },
	{ value: 'wobbly', label: 'A wobbly tooth', story: 'one tooth was wobbly' },
	{ value: 'toothache', label: 'Toothache', story: 'one tooth was aching' },
	{ value: 'bump', label: 'A bump or a knock', story: 'they had bumped a tooth' },
];

const SIGN_INKS = ['var(--r-teal)', '#d62b8a', 'var(--r-blue)', '#00804a', '#d4531c'];

function Blank({ value }: { value: string | null }) {
	return value ? (
		<span className="r-brush px-0.5 text-[1.45em] leading-none text-[#d62b8a]">{value}</span>
	) : (
		<span aria-label="blank" className="mx-1 inline-block w-24 border-b-2 border-dotted border-(--r-ink)/40 align-baseline" />
	);
}

/** A cut-paper signpost button pointing the way. */
function Sign({ onClick, children, i, selected, sub }: { onClick: () => void; children: ReactNode; i: number; selected: boolean; sub?: ReactNode }) {
	return (
		<button
			type="button"
			onClick={onClick}
			aria-pressed={selected}
			className="r-focus group relative flex min-h-14 w-full items-center gap-3 py-3 pr-10 pl-5 text-left font-bold text-white transition-transform duration-200 hover:translate-x-1.5"
			style={{
				background: SIGN_INKS[i % SIGN_INKS.length],
				clipPath: 'polygon(0 0, calc(100% - 1.6rem) 0, 100% 50%, calc(100% - 1.6rem) 100%, 0 100%)',
				transform: `rotate(${i % 2 ? 0.8 : -0.8}deg)`,
				filter: 'drop-shadow(0 4px 5px rgb(47 65 112 / .28))',
			}}
		>
			{selected ? <span aria-hidden className="absolute inset-y-0 left-0 w-2 bg-(--r-sun)" /> : null}
			<span className="flex-1">
				<span className="block text-[1.05rem]">{children}</span>
				{sub ? <span className="block text-sm font-normal text-white/85">{sub}</span> : null}
			</span>
			<span aria-hidden className="text-xl">→</span>
		</button>
	);
}

export function QuestStory({ services, branches, currency, phone, phoneHref }: { services: QuestService[]; branches: QuestBranch[]; currency: string; phone: string; phoneHref: string }) {
	const [a, setA] = useState<QuestAnswers>(EMPTY_ANSWERS);
	const [step, setStep] = useState(0);
	const headRef = useRef<HTMLHeadingElement>(null);
	const endRef = useRef<HTMLDivElement>(null);
	const first = useRef(true);

	useEffect(() => {
		if (first.current) {
			first.current = false;
			return;
		}
		(headRef.current ?? endRef.current)?.focus();
	}, [step]);

	const set = <K extends keyof QuestAnswers>(k: K, v: QuestAnswers[K], next = true) => {
		setA((prev) => ({ ...prev, [k]: v }));
		if (next) setStep((s) => Math.min(STEPS, s + 1));
	};

	const result = useMemo(() => (step >= STEPS ? recommend(a, services) : null), [step, a, services]);
	const name = a.nickname.trim() || null;
	const branch = branches.find((b) => b.slug === a.branch);

	const mood: PipMood = step >= STEPS ? (result?.pipMood ?? 'grin') : a.feeling && a.feeling >= 4 ? 'calm' : step === 0 ? 'happy' : 'grin';

	const story = (
		<div className="space-y-3 text-[1.12rem] leading-[2.1rem]">
			<p>
				Once upon a time, there was a child called <Blank value={name ?? (step > 0 ? 'a little hero' : null)} />, who was{' '}
				<Blank value={a.age ? AGE_LABEL[a.age].toLowerCase() : null} /> years old.
			</p>
			{step >= 1 ? (
				<p>
					It was <Blank value={a.firstVisit === null ? null : a.firstVisit ? 'their very first visit' : 'not their first visit'} /> to a dentist.
				</p>
			) : null}
			{step >= 2 ? (
				<p>
					About the dentist, <Blank value={a.feeling ? FEEL_STORY[a.feeling]! : null} />.
				</p>
			) : null}
			{step >= 3 ? (
				<p>
					And their teeth? <Blank value={a.hurting ? HURT.find((h) => h.value === a.hurting)!.story : null} />.
				</p>
			) : null}
			{step >= 4 ? (
				<p>
					The nearest kids room was <Blank value={a.branch === 'any' ? 'any of them' : (branch?.nickname ?? null)} />.
				</p>
			) : null}
		</div>
	);

	const question = (() => {
		switch (step) {
			case 0:
				return {
					title: 'Who is the story about?',
					body: (
						<div>
							<label className="block text-sm font-bold" htmlFor="quest-name">
								Their name or nickname <span className="font-normal text-(--r-ink-soft)">(optional)</span>
							</label>
							<input
								id="quest-name"
								value={a.nickname}
								onChange={(e) => set('nickname', e.target.value.slice(0, 40), false)}
								autoComplete="off"
								placeholder="e.g. Maya"
								className="r-focus r-lined mt-2 block h-12 w-full rounded-[2px] border-0 px-3 pl-12 text-lg shadow-[inset_0_1px_3px_rgb(47_65_112/.2)] outline-none"
							/>
							<p className="mt-6 text-sm font-bold">How old are they?</p>
							<div className="mt-3 space-y-3">
								{(Object.keys(AGE_LABEL) as Age[]).map((k, i) => (
									<Sign key={k} i={i} selected={a.age === k} onClick={() => set('age', k)}>
										{AGE_LABEL[k]}
									</Sign>
								))}
							</div>
						</div>
					),
				};
			case 1:
				return {
					title: 'Have they seen a dentist before?',
					body: (
						<div className="space-y-3">
							<Sign i={0} selected={a.firstVisit === true} onClick={() => set('firstVisit', true)} sub="We’ll make it gentle and fun">
								This is their first time
							</Sign>
							<Sign i={1} selected={a.firstVisit === false} onClick={() => set('firstVisit', false)} sub="Here or somewhere else">
								They’ve been before
							</Sign>
						</div>
					),
				};
			case 2:
				return {
					title: 'How do they feel about the dentist?',
					body: (
						<div className="grid grid-cols-5 gap-2">
							{FEELINGS.map((f) => (
								<button
									key={f.value}
									type="button"
									aria-pressed={a.feeling === f.value}
									onClick={() => set('feeling', f.value)}
									className={`r-focus r-paper flex flex-col items-center gap-1 rounded-[3px] px-1 pt-2 pb-3 text-center text-[0.78rem] font-bold leading-tight transition-transform hover:-translate-y-1 ${a.feeling === f.value ? 'shadow-[0_0_0_3px_var(--r-pink)]' : 'r-cut'}`}
								>
									<Pip size={52} mood={f.face} pose={f.value >= 4 ? 'idle' : 'wave'} animated={false} cape={false} />
									{f.label}
								</button>
							))}
						</div>
					),
				};
			case 3:
				return {
					title: 'Is anything hurting?',
					body: (
						<div className="space-y-3">
							{HURT.map((h, i) => (
								<Sign key={h.value} i={i} selected={a.hurting === h.value} onClick={() => set('hurting', h.value)}>
									{h.label}
								</Sign>
							))}
						</div>
					),
				};
			case 4:
				return {
					title: 'Which kids room is nearest?',
					body: (
						<div className="space-y-3">
							{branches.map((b, i) => (
								<Sign key={b.slug} i={i} selected={a.branch === b.slug} onClick={() => set('branch', b.slug)} sub={[b.title, b.area].filter(Boolean).join(' · ')}>
									{b.nickname}
								</Sign>
							))}
							<Sign i={branches.length} selected={a.branch === 'any'} onClick={() => set('branch', 'any')}>
								Any of them is fine
							</Sign>
						</div>
					),
				};
			default:
				return null;
		}
	})();

	const restart = () => {
		setA(EMPTY_ANSWERS);
		setStep(0);
	};

	return (
		<div className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
			{/* the open book */}
			<div className="relative grid overflow-hidden rounded-[6px] bg-(--r-paper-2) shadow-[0_2px_2px_rgb(47_65_112/.12),0_30px_60px_-24px_rgb(47_65_112/.5)] lg:grid-cols-2">
				<div aria-hidden className="pointer-events-none absolute inset-y-0 left-1/2 w-16 -translate-x-1/2 bg-[linear-gradient(90deg,transparent,rgb(47_65_112/.12)_45%,rgb(47_65_112/.18)_50%,rgb(47_65_112/.12)_55%,transparent)] max-lg:hidden" />
				{/* left page: the story so far */}
				<div className="r-paper relative flex flex-col p-6 sm:p-10">
					<p className="text-xs font-bold tracking-[0.18em] text-(--r-ink-soft) uppercase">The story so far</p>
					<div className="mt-4 flex-1">{story}</div>
					<div className="mt-6 flex items-end gap-3">
						<Pip size={84} pose={step >= STEPS ? 'cheer' : 'point'} mood={mood} />
						<p className="mb-6 text-sm text-(--r-ink-soft) italic">{step >= STEPS ? 'What a story!' : 'Pip is listening…'}</p>
					</div>
				</div>

				{/* right page: which way? / the ending */}
				<div className="relative p-6 sm:p-10">
					{question ? (
						<>
							<div className="flex items-center justify-between gap-3">
								<p className="text-xs font-bold tracking-[0.18em] text-(--r-teal) uppercase">
									Page {step + 1} of {STEPS}
								</p>
								{step > 0 ? (
									<button type="button" onClick={() => setStep((s) => Math.max(0, s - 1))} className="r-quiet text-sm">
										← Turn back
									</button>
								) : null}
							</div>
							<h2 ref={headRef} tabIndex={-1} className="r-brush mt-2 text-[2.4rem] leading-[0.95] outline-none sm:text-[2.8rem]">
								{question.title}
							</h2>
							<div className="mt-6">{question.body}</div>
						</>
					) : result ? (
						<div>
							<p className="text-xs font-bold tracking-[0.18em] text-(--r-teal) uppercase">The last page</p>
							<div ref={endRef} tabIndex={-1} className="mt-1 outline-none">
								<RisoTitle as="h2" className="text-[2.4rem] leading-[0.95] sm:text-[2.9rem]">
									{`So off they went to ${result.main.service.place}!`}
								</RisoTitle>
							</div>
							<p className="r-brush mt-2 text-2xl text-[#d62b8a]">“{result.pipSays}”</p>
							<div className="r-paper r-cut relative mt-6 grid grid-cols-[96px_1fr] items-center gap-4 rounded-[3px] p-4 sm:grid-cols-[120px_1fr]">
								<Tape className="-top-3 left-6" tone="var(--r-sun)" />
								<BuildingArt role={result.main.service.role} />
								<div>
									<p className="font-bold">{result.main.service.title}</p>
									{result.main.option.label ? <p className="text-sm text-(--r-ink-soft)">{result.main.option.label}</p> : null}
									<p className="mt-1 text-sm">
										<span className="r-brush text-2xl leading-none">{kidsPrice(result.main.option.price, currency)}</span> · {kidsMinutes(result.main.option.minutes)}
									</p>
								</div>
							</div>
							<p className="mt-4 leading-relaxed text-(--r-ink-soft)">{result.main.why}</p>
							{result.urgent ? (
								<p className="mt-4 rounded-[3px] border-2 border-dashed border-(--r-orange) bg-[#fff1e8] p-3 text-sm">
									<span className="font-bold">Hurting today?</span> Call us on{' '}
									<a href={phoneHref} className="r-quiet">
										{phone}
									</a>{' '}
									and we’ll find the soonest time.
								</p>
							) : null}
							<div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
								<Link
									href={kidsBookHref({
										service: result.main.option.slug,
										clinic: a.branch && a.branch !== 'any' ? a.branch : undefined,
										comfort: result.comfort,
										nickname: name ?? undefined,
									})}
									className="r-tag r-tag-pink"
								>
									Book {result.main.service.place}
								</Link>
								<button type="button" onClick={restart} className="r-quiet">
									Write a new story
								</button>
							</div>
							{result.extras.length > 0 ? (
								<div className="mt-8">
									<p className="text-xs font-bold tracking-[0.18em] text-(--r-ink-soft) uppercase">Also worth a stop</p>
									<ul className="mt-3 space-y-3">
										{result.extras.map((e) => (
											<li key={e.option.slug} className="flex items-center gap-3">
												<span className="w-14 shrink-0">
													<BuildingArt role={e.service.role} />
												</span>
												<span className="min-w-0 flex-1 text-sm">
													<Link
														href={kidsBookHref({ service: e.option.slug, clinic: a.branch && a.branch !== 'any' ? a.branch : undefined, comfort: result.comfort, nickname: name ?? undefined })}
														className="r-quiet"
													>
														{e.service.place}: {e.service.title}
													</Link>
													<span className="block text-(--r-ink-soft)">
														{kidsPrice(e.option.price, currency)} · {e.why}
													</span>
												</span>
											</li>
										))}
									</ul>
								</div>
							) : null}
						</div>
					) : (
						<p>
							We couldn’t find a kids visit to suggest. Call{' '}
							<a href={phoneHref} className="r-quiet">
								{phone}
							</a>
							.
						</p>
					)}
				</div>
			</div>
		</div>
	);
}
