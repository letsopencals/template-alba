import { clsx } from 'clsx';
import type { DepartmentKind } from '@/lib/site-config';

/*
 * Alba's icon set: 16-unit grid, 1.3 hairline strokes, square caps — drawn to
 * sit next to the mono annotations. `Icon` for UI symbols; `KindGlyph` for a
 * department (a tooth drawn for what that department does).
 */
export type IconName =
	| 'pin'
	| 'video'
	| 'clock'
	| 'calendar'
	| 'phone'
	| 'mail'
	| 'card'
	| 'shield'
	| 'person'
	| 'people'
	| 'check'
	| 'plus'
	| 'minus'
	| 'close'
	| 'arrow-right'
	| 'arrow-left'
	| 'arrow-up-right'
	| 'search'
	| 'globe'
	| 'train'
	| 'chair'
	| 'note'
	| 'star'
	| 'locate'
	| 'alert'
	| 'download'
	| 'print'
	| 'refresh';

const PATHS: Record<IconName, string> = {
	pin: 'M8 14.5s5-4.6 5-8.3A5 5 0 0 0 3 6.2c0 3.7 5 8.3 5 8.3Z M8 8.2a1.9 1.9 0 1 0 0-3.8 1.9 1.9 0 0 0 0 3.8Z',
	video: 'M1.5 4h9v8h-9z M10.5 7l4-2.3v6.6l-4-2.3',
	clock: 'M8 14.5a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13Z M8 4.5V8l2.5 1.5',
	calendar: 'M2 3.5h12v11H2z M2 7h12 M5 1.5v3 M11 1.5v3',
	phone: 'M3 1.5h3l1.2 3.3-1.8 1.1a8 8 0 0 0 4.7 4.7l1.1-1.8 3.3 1.2v3A1.5 1.5 0 0 1 13 14.5 11.5 11.5 0 0 1 1.5 3 1.5 1.5 0 0 1 3 1.5Z',
	mail: 'M1.5 3.5h13v9h-13z M1.5 4l6.5 5 6.5-5',
	card: 'M1.5 3.5h13v9h-13z M1.5 6.5h13 M4 10h3',
	shield: 'M8 1.5 13.5 3.5v4.2c0 3.2-2.3 5.6-5.5 6.8-3.2-1.2-5.5-3.6-5.5-6.8V3.5Z M5.5 8l1.8 1.8L10.8 6',
	person: 'M8 7.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z M2 14.5c.7-3 3-4.5 6-4.5s5.3 1.5 6 4.5',
	people: 'M6 7a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z M1 14c.6-2.6 2.4-4 5-4s4.4 1.4 5 4 M11 2.3a2.5 2.5 0 0 1 0 4.4 M12.5 10.3c1.3.5 2.2 1.7 2.5 3.7',
	check: 'M2.5 8.5 6 12l7.5-8',
	plus: 'M8 2.5v11 M2.5 8h11',
	minus: 'M2.5 8h11',
	close: 'M3 3l10 10 M13 3 3 13',
	'arrow-right': 'M2 8h11 M9 4l4 4-4 4',
	'arrow-left': 'M14 8H3 M7 4 3 8l4 4',
	'arrow-up-right': 'M4 12l8-8 M5 4h7v7',
	search: 'M7 12.5a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11Z M11 11l3.5 3.5',
	globe: 'M8 14.5a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13Z M1.5 8h13 M8 1.5c2 2 2.6 4.3 2.6 6.5S10 12.5 8 14.5C6 12.5 5.4 10.2 5.4 8S6 3.5 8 1.5Z',
	train: 'M3.5 1.5h9v9h-9z M3.5 7h9 M5.5 13l-1.5 2 M10.5 13l1.5 2 M5.5 10.5v2.5h5v-2.5',
	chair: 'M3 2v6.5h8.5l2.5 3 M3 8.5 5 14 M8.5 8.5v5.5 M2 14h10',
	note: 'M3 1.5h7l3 3v10H3z M10 1.5v3h3 M5.5 8h5 M5.5 11h3.5',
	star: 'M8 1.5l1.9 4.1 4.4.5-3.3 3 .9 4.4L8 11.3l-3.9 2.2.9-4.4-3.3-3 4.4-.5Z',
	locate: 'M8 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z M8 1v2.5 M8 12.5V15 M1 8h2.5 M12.5 8H15',
	alert: 'M8 1.5 15 14H1Z M8 6v4 M8 11.8v.4',
	download: 'M8 1.5v9 M4.5 7 8 10.5 11.5 7 M2 14.5h12',
	print: 'M4 5.5V1.5h8v4 M2 5.5h12v6h-2 M4 11.5H2 M4 9.5h8v5H4z',
	refresh: 'M13.5 8a5.5 5.5 0 1 1-1.6-3.9 M13.5 1.5v3.5H10',
};

export function Icon({ name, className, title }: { name: IconName; className?: string; title?: string }) {
	return (
		<svg viewBox="0 0 16 16" className={clsx('h-4 w-4 shrink-0', className)} fill="none" stroke="currentColor" strokeWidth={1.3} strokeLinecap="square" strokeLinejoin="miter" role={title ? 'img' : undefined} aria-hidden={title ? undefined : true} aria-label={title}>
			<path d={PATHS[name]} />
		</svg>
	);
}

/* A tooth per department, on a 32-unit grid. */
const TOOTH = 'M9 7c0-3 3-4 5-2.6 1.2.8 2.8.8 4 0C20 3 23 4 23 7c0 3.5-1.4 5.4-1.8 8.2-.4 3-1.2 5.3-2.3 5.3-1.4 0-1.2-3.6-2.9-3.6s-1.5 3.6-2.9 3.6c-1.1 0-1.9-2.3-2.3-5.3C10.4 12.4 9 10.5 9 7Z';

const GLYPH_EXTRA: Record<DepartmentKind, string> = {
	general: 'M5 26h22 M9 23h2 M15 23h2 M21 23h2',
	hygiene: 'M25 3v4 M23 5h4 M6 4v3 M4.5 5.5h3 M7 26c4-2 14-2 18 0',
	cosmetic: 'M24 4l1 2 2 1-2 1-1 2-1-2-2-1 2-1Z M12 9.5c1-1.3 2.5-1.8 4-1.6',
	orthodontics: 'M6 12h20 M13.5 10.5h2v3h-2z M17 10.5h2v3h-2z M8 10.5h2v3H8z M22.5 10.5h2v3h-2z',
	implants: 'M14.5 21v8 M17.5 21v8 M13.5 23h5 M13.5 25.5h5 M14 28h4',
	emergency: 'M17.5 5l-2.5 5 3 1.5-2.5 5',
	kids: 'M24.5 20l1 2.2 2.3.3-1.7 1.6.4 2.3-2-1.1-2 1.1.4-2.3-1.7-1.6 2.3-.3Z M13 10a.6.6 0 1 0 0 .1 M19 10a.6.6 0 1 0 0 .1 M13.5 13c1.3 1 3.7 1 5 0',
	video: 'M4 24h24v5H4z M12 29h8',
};

export function KindGlyph({ kind, className }: { kind: DepartmentKind | null | undefined; className?: string }) {
	const k = kind ?? 'general';
	return (
		<svg viewBox="0 0 32 32" className={clsx('h-8 w-8 shrink-0', className)} fill="none" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
			<path d={TOOTH} />
			<path d={GLYPH_EXTRA[k]} />
		</svg>
	);
}
