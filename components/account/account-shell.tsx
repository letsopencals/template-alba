'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { FamilyChips } from '@/components/account/family-chips';
import { ShellSkeleton } from '@/components/account/skeletons';
import { useFilteredCare, usePersonFilter } from '@/components/account/use-care';
import { useProfile } from '@/components/account/use-profile';
import '@/components/book/controls.css';
import './smile/smile.css';

const NAV = [
	{ href: '/account', code: '01', label: 'My Smile', exact: true },
	{ href: '/account/appointments', code: '02', label: 'Visits', exact: false },
	{ href: '/account/orders', code: '03', label: 'Fees', exact: false },
	{ href: '/account/settings', code: '04', label: 'Settings', exact: false },
] as const;

function Name() {
	const { profile } = useProfile();
	const { data: session } = useSession();
	const first = profile?.firstName || session?.customer?.firstName || '';
	return (
		<h1 className="t-xl text-ink">
			{first ? (
				<>
					{first}&rsquo;s <em>smile.</em>
				</>
			) : (
				<>
					My <em>smile.</em>
				</>
			)}
		</h1>
	);
}

function Nav() {
	const pathname = usePathname();
	const { hrefWith } = usePersonFilter();
	return (
		<nav aria-label="My Smile" className="smile-tabs no-scrollbar overflow-x-auto">
			{NAV.map((n) => {
				const active = n.exact ? pathname === n.href : pathname.startsWith(n.href);
				return (
					<Link key={n.href} href={hrefWith(n.href)} aria-current={active ? 'page' : undefined} className="shrink-0 text-[14.5px] text-ink-2 hover:text-ink">
						<span className="t-anno mr-2 !text-ink-4">{n.code}</span>
						{n.label}
					</Link>
				);
			})}
			<span className="flex-1" />
			<button type="button" onClick={() => void signOut({ callbackUrl: '/' })} className="t-anno shrink-0 py-3 hover:!text-signal">
				Sign out
			</button>
		</nav>
	);
}

function Shell({ children }: { children: React.ReactNode }) {
	const { people, person } = useFilteredCare();
	return (
		<section className="frame min-h-[100svh] pt-24 pb-28 sm:pt-28">
			<header>
				<p className="t-anno">My Smile · your record at Alba</p>
				<div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
					<Name />
					<FamilyChips people={people} active={person} />
				</div>
				<div className="mt-10">
					<Nav />
				</div>
			</header>
			<div className="mt-10 min-w-0">{children}</div>
		</section>
	);
}

/** The My Smile frame: the name, the family switch, a numbered tab index. */
export function AccountShell({ children }: { children: React.ReactNode }) {
	return (
		<Suspense fallback={<ShellSkeleton />}>
			<Shell>{children}</Shell>
		</Suspense>
	);
}
