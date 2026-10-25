'use client';

import { useMemo } from 'react';
import { useHydrated } from '@/hooks/use-hydrated';
import { Confirmed } from '@/components/confirmation/thank-you-view';
import { AppointmentCard } from '@/components/confirmation/appointment-card';
import { cardFromCare } from '@/components/confirmation/card-model';
import { ChairTrack } from '@/components/book/chair-track';
import { Row } from '@/components/checkout/checkout-view';
import { RecallRing, ringsOf } from '@/components/account/smile/recall-ring';
import { HistoryTimeline } from '@/components/account/smile/history-timeline';
import { StickerBook } from '@/components/kids/sticker-book';
import { isUpcoming, personKey } from '@/components/account/care-utils';
import { siteConfig } from '@/lib/site-config';
import { previewCards, previewCareVisits, previewLanes } from './fixtures';
import type { PreviewScreen } from './screens';
import '@/components/checkout/record.css';
import '@/components/book/controls.css';
import '@/components/account/smile/smile.css';


/** The screens behind a finished booking, over fixtures (no store calls). */
export function PreviewScreens({ screen }: { screen: PreviewScreen }) {
	const hydrated = useHydrated();
	if (!hydrated) return <div className="min-h-screen" aria-busy="true" />;
	return <Screen screen={screen} />;
}

function Screen({ screen }: { screen: PreviewScreen }) {
	const now = useMemo(() => Date.now(), []);
	const cards = useMemo(() => previewCards(now), [now]);
	if (screen === 'checkout') return <CheckoutPreview now={now} />;
	if (screen === 'account') return <AccountPreview now={now} />;
	return (
		<section className="frame pt-24 pb-28 sm:pt-28">
			<div className="mx-auto max-w-[1180px]">
				<Confirmed cards={screen === 'confirmation-kids' ? cards.kids : cards.adult} orderName="#A5013" authed={screen !== 'confirmation-guest'} />
			</div>
		</section>
	);
}

function CheckoutPreview({ now }: { now: number }) {
	return (
		<section className="frame pt-24 pb-24 sm:pt-28">
			<div className="mx-auto max-w-[880px]">
				<p className="t-anno">Patient record</p>
				<h1 className="t-lg mt-3 mb-10 text-ink">
					Nearly <em>yours.</em>
				</h1>
				<article className="record" aria-label="Patient record">
					<header className="record-head">
						<span className="font-display text-[22px] leading-none">{siteConfig.name}</span>
						<span className="t-anno">Ref · ART-RY &nbsp; Held for 13:42</span>
					</header>
					<Row code="VS" n="01" title="2 visits">
						<ChairTrack lanes={previewLanes(now)} compact className="rounded-[4px]" />
					</Row>
					<Row code="PT" n="02" title="Contact">
						<p className="text-[15px] text-ink">
							<span className="font-display text-[22px]">Charlotte Davies</span>
							<span className="ml-3 text-ink-2">charlotte@example.com · 07700 900123</span>
						</p>
					</Row>
					<Row code="PY" n="03" title="Payment">
						{['Card', 'Pay at the studio'].map((m, i) => (
							<label key={m} className="method">
								<input type="radio" name="pv-method" defaultChecked={i === 1} className="sr-only" />
								<span className="tick" aria-hidden>
									✓
								</span>
								<span className="text-[16px] text-ink">{m}</span>
								<span />
							</label>
						))}
						<div className="mt-6 sign-line">
							<span>Charlotte Davies</span>
						</div>
						<p className="t-anno mt-1.5">Patient or guardian · I&rsquo;ve read the 24-hour change policy</p>
					</Row>
					<Row code="Σ" n="04" title="Fees">
						<dl className="ml-auto max-w-[320px] space-y-2 text-[14px]">
							<div className="flex items-baseline gap-2">
								<dt className="text-ink-2">Subtotal</dt>
								<span className="leader" aria-hidden />
								<dd className="t-num">£175.00</dd>
							</div>
							<div className="flex items-baseline gap-2 border-t border-line pt-3">
								<dt className="t-anno !text-ink">Total</dt>
								<span className="leader" aria-hidden />
								<dd className="font-display text-[30px] leading-none">£175.00</dd>
							</div>
						</dl>
					</Row>
				</article>
			</div>
		</section>
	);
}

function AccountPreview({ now }: { now: number }) {
	const visits = useMemo(() => previewCareVisits(now), [now]);
	const mine = visits.filter((v) => v.patient.visitFor === 'self');
	const next = visits.filter((v) => isUpcoming(v, now)).sort((a, b) => a.from.localeCompare(b.from))[0]!;
	const oscar = visits.filter((v) => personKey(v) !== 'me');
	return (
		<section className="frame pt-24 pb-28 sm:pt-28">
			<p className="t-anno">My Smile · your record at Alba</p>
			<h1 className="t-xl mt-4 text-ink">
				Charlotte&rsquo;s <em>smile.</em>
			</h1>
			<div className="mt-16 grid gap-14 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] xl:items-start">
				<div>
					<p className="t-anno mb-6">Your clock</p>
					<RecallRing rings={ringsOf(mine, now, false)} bookHrefFor={(b) => `/book?service=${b}`} />
				</div>
				<div>
					<p className="t-anno mb-6">Next visit</p>
					<AppointmentCard visit={cardFromCare(next)} />
				</div>
			</div>
			<div className="mt-20 grid gap-14 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
				<HistoryTimeline visits={visits} nowMs={now} hrefFor={() => '#'} showPerson />
				<StickerBook
					visits={oscar.map((v) => ({
						id: v.id,
						title: v.product.title,
						startsAt: v.from,
						status: isUpcoming(v, now) ? 'upcoming' : 'done',
						childName: 'Ozzie',
						clinicTitle: 'Marylebone',
					}))}
					timeZone={siteConfig.timezone}
					bookHref="/book?service=kids-check-up-junior&for=child"
				/>
			</div>
		</section>
	);
}
