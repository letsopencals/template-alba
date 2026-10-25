/**
 * The site index: what the chart rail, the full-screen index and the mobile
 * dock show. Numbered like a chart; `note` is the mono annotation in the index.
 */
export interface NavItem {
	n: string;
	label: string;
	href: string;
	note: string;
	/** Short label for the mobile dock (omit to keep it out of the dock). */
	dock?: string;
}

export const NAV: NavItem[] = [
	{ n: '01', label: 'Smile Check', href: '/smile-check', note: 'Tap a tooth · 30 seconds', dock: 'Check' },
	{ n: '02', label: 'Treatments', href: '/treatments', note: 'Every price, in writing', dock: 'Treatments' },
	{ n: '03', label: 'Clinics', href: '/clinics', note: 'Five studios + video', dock: 'Clinics' },
	{ n: '04', label: 'Dentists', href: '/dentists', note: 'The whole team' },
	{ n: '05', label: 'Alba Kids', href: '/kids', note: 'Tooth Town, for little smiles' },
	{ n: '06', label: 'My Smile', href: '/account', note: 'Visits, recalls, family', dock: 'My Smile' },
];

export const BOOK_HREF = '/book';

/** Is `href` the current section? (`/treatments/hygiene` belongs to 02). */
export function isActive(pathname: string, href: string): boolean {
	if (href === '/') return pathname === '/';
	return pathname === href || pathname.startsWith(`${href}/`);
}
