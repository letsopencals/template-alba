'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import type { OrderDetailResponse } from '@opencals/storefront-sdk';
import { BraveryCertificate } from '@/components/kids/bravery-certificate';
import type { CareRecord } from '@/components/account/care-types';
import { useHydrated } from '@/hooks/use-hydrated';
import { icsHref, ICS_FILENAME } from '@/lib/calendar';
import { siteConfig } from '@/lib/site-config';
import { AppointmentCard } from './appointment-card';
import { calendarEventOf, cardsFromOrder, cardsFromSnapshot, recallOf, type CardVisit, type DepartmentIndex } from './card-model';
import { readSnapshot } from './snapshot';
import { CardStack } from './card-stack';
import { RecallPlate } from './recall-plate';

// Guests can't read the order (the route needs a session): resolve to null, don't throw.
async function quiet<T>(url: string): Promise<T | null> {
	try {
		const res = await fetch(url);
		return res.ok ? ((await res.json()) as T) : null;
	} catch {
		return null;
	}
}
const SWR_OPTIONS = { revalidateOnFocus: false, revalidateIfStale: false, shouldRetryOnError: false } as const;

/** /thank-you?orderId=: the appointment card(s), what to do next, the 6-month recall. */
export function ThankYouView({ departments }: { departments: DepartmentIndex }) {
	const orderId = useSearchParams().get('orderId');
	const { status } = useSession();
	const authed = status === 'authenticated';
	const { data: order, isLoading } = useSWR(orderId ? `/api/account/orders/${orderId}` : null, quiet<OrderDetailResponse>, SWR_OPTIONS);
	// Who each visit is for lives in the care record (answers); only signed-in patients have one.
	const { data: record } = useSWR(authed ? '/api/account/care-record' : null, quiet<CareRecord>, SWR_OPTIONS);
	const hydrated = useHydrated();

	const cards = useMemo(() => {
		const fromOrder = cardsFromOrder(order, departments);
		const list = fromOrder.length ? fromOrder : hydrated ? cardsFromSnapshot(readSnapshot(), departments) : [];
		const byId = new Map((record?.visits ?? []).map((v) => [v.id, v]));
		// Earliest visit first: the card stack, "See you …" and the recall all key off cards[0].
		return list
			.map((c) => {
				const v = byId.get(c.id);
				return v ? { ...c, patientName: v.patient.name, nickname: v.patient.nickname, kids: c.kids || v.patient.visitFor === 'child' } : c;
			})
			.sort((a, b) => a.from - b.from);
	}, [order, departments, record, hydrated]);

	const loading = isLoading || status === 'loading' || !hydrated;
	return (
		<section className="frame pt-24 pb-28 sm:pt-28">
			<div className="mx-auto max-w-[1180px]">
				{loading ? (
					<div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]" aria-busy="true" aria-label="Writing your appointment card">
						<div className="h-48 animate-pulse rounded-[6px] bg-porcelain-2" />
						<div className="aspect-[85/55] animate-pulse rounded-[18px] bg-porcelain-2" />
					</div>
				) : cards.length === 0 ? (
					<NoCard orderName={order?.name ?? null} />
				) : (
					<Confirmed cards={cards} orderName={order?.name ?? null} authed={authed} />
				)}
			</div>
		</section>
	);
}

const dayKey = (ms: number) => new Intl.DateTimeFormat('en-CA', { timeZone: siteConfig.timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(ms);
/** "today", "tomorrow", "Thursday", or "on 14 November" further out. */
function whenWords(ms: number): string {
	const now = Date.now();
	if (dayKey(ms) === dayKey(now)) return 'today';
	if (dayKey(ms) === dayKey(now + 86_400_000)) return 'tomorrow';
	const o: Intl.DateTimeFormatOptions = ms - now < 6 * 86_400_000 ? { weekday: 'long' } : { day: 'numeric', month: 'long' };
	return (ms - now < 6 * 86_400_000 ? '' : 'on ') + new Intl.DateTimeFormat('en-GB', { timeZone: siteConfig.timezone, ...o }).format(ms);
}

export function Confirmed({ cards, orderName, authed }: { cards: CardVisit[]; orderName: string | null; authed: boolean }) {
	const [index, setIndex] = useState(0);
	const current = cards[Math.min(index, cards.length - 1)]!;
	const first = cards[0]!;
	const recall = recallOf(first);
	const kidsCards = cards.filter((c) => c.kids);

	return (
		<>
			<div className="grid gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.25fr)] lg:items-center lg:gap-16">
				<div>
					<p className="t-anno flex items-center gap-2">
						<span className="status-light" aria-hidden /> Booked{orderName ? ` · Ref ${orderName}` : ''}
					</p>
					<h1 className="t-xl mt-5 text-ink">
						See you <em>{whenWords(first.from)}.</em>
					</h1>
					<p className="t-lede mt-6 max-w-[40ch]">
						{cards.length > 1 ? `${cards.length} visits are booked. ` : ''}Your confirmation is in your inbox, and we&rsquo;ll remind you the day before. Turn the card over for what to bring.
					</p>

					<div className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
						<a href={icsHref(cards.map(calendarEventOf))} download={ICS_FILENAME} className="link-hair text-[14.5px] text-ink">
							Add {cards.length > 1 ? `all ${cards.length}` : 'it'} to your calendar
						</a>
						{current.directionsHref ? (
							<a href={current.directionsHref} target="_blank" rel="noreferrer" className="link-hair text-[14.5px] text-ink">
								Directions to {current.studioTitle}
							</a>
						) : null}
						<Link href={authed ? '/account' : '/auth/sign-in?callbackUrl=/account'} className="link-hair text-[14.5px] text-ink">
							{authed ? 'Open My Smile' : 'Sign in to My Smile'}
						</Link>
					</div>
				</div>

				<CardStack count={cards.length} index={index} onIndex={setIndex}>
					<AppointmentCard key={current.id} visit={current} label={cards.length > 1 ? `Appointment ${index + 1} of ${cards.length}` : undefined} />
				</CardStack>
			</div>

			<RecallPlate recall={recall} studio={first.video ? null : first.studioTitle} className="mt-20" />

			{kidsCards.map((c) => (
				<div key={c.id} className="mt-16 border-t border-line pt-12">
					<p className="t-anno mb-6">For the bravest patient</p>
					<BraveryCertificate
						childName={c.patientName}
						nickname={c.nickname}
						visitTitle={c.title}
						clinicTitle={c.studioTitle ?? siteConfig.name}
						clinicianName={c.clinicianName}
						startsAt={new Date(c.from).toISOString()}
						timeZone={siteConfig.timezone}
					/>
				</div>
			))}
		</>
	);
}

export function NoCard({ orderName }: { orderName: string | null }) {
	return (
		<div className="mx-auto max-w-[640px] py-10 text-center">
			<p className="t-anno">Booked{orderName ? ` · Ref ${orderName}` : ''}</p>
			<h1 className="t-lg mt-5 text-ink">
				You&rsquo;re <em>booked.</em>
			</h1>
			<p className="t-lede mx-auto mt-5 max-w-[44ch]">Your appointment card is in your inbox. Sign in with the same email to see it in My Smile and change it if you need to.</p>
			<Link href="/auth/sign-in?callbackUrl=/account" className="link-hair mt-8 inline-block text-lagoon">
				Sign in to My Smile
			</Link>
		</div>
	);
}
