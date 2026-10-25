import type { Comfort } from '@/lib/kids/kids-config';
import type { PipMood } from '@/components/kids/pip';

/*
 * Tooth Quest: five questions for parents → a kids visit. Pure functions over
 * the store's kids services (client-safe; the page passes the services in).
 */

export type Age = 'under3' | '3to6' | '7to12' | '13to17';
export type Hurting = 'no' | 'wobbly' | 'toothache' | 'bump';

export interface QuestAnswers {
	nickname: string;
	age: Age | null;
	firstVisit: boolean | null;
	/** 1 (can't wait) … 5 (very scared). */
	feeling: number | null;
	hurting: Hurting | null;
	/** Location slug or 'any'. */
	branch: string | null;
}

export const EMPTY_ANSWERS: QuestAnswers = { nickname: '', age: null, firstVisit: null, feeling: null, hurting: null, branch: null };

/** The bits of a KidsService the quest needs. */
export interface QuestService {
	role: 'first-visit' | 'check-up' | 'clean' | 'sealants' | 'orthodontic' | 'tour' | 'other';
	title: string;
	place: string;
	kidLine: string;
	options: { slug: string; label: string; price: number; minutes: number }[];
	branches: { slug: string; title: string }[];
}

export interface Pick {
	service: QuestService;
	option: QuestService['options'][number];
	why: string;
}

export interface Recommendation {
	main: Pick;
	extras: Pick[];
	pipSays: string;
	pipMood: PipMood;
	comfort: Comfort;
	/** Set when something hurts: show "call us" next to the booking. */
	urgent: boolean;
}

export const AGE_LABEL: Record<Age, string> = { under3: 'Under 3', '3to6': '3 to 6', '7to12': '7 to 12', '13to17': '13 to 17' };
const AGE_YEARS: Record<Age, number> = { under3: 2, '3to6': 5, '7to12': 9, '13to17': 15 };

export const FEELINGS: { value: number; face: 'grin' | 'happy' | 'calm' | 'wow' | 'brave'; label: string }[] = [
	{ value: 1, face: 'grin', label: 'Can’t wait!' },
	{ value: 2, face: 'happy', label: 'Pretty happy' },
	{ value: 3, face: 'calm', label: 'Not sure' },
	{ value: 4, face: 'wow', label: 'A bit worried' },
	{ value: 5, face: 'brave', label: 'Very scared' },
];

export function comfortOf(feeling: number | null): Comfort {
	if (!feeling || feeling <= 2) return 'relaxed';
	return feeling >= 5 ? 'anxious' : 'nervous';
}

/** The option whose label range ("Ages 3–6") contains the child's age; else the first. */
function optionForAge(service: QuestService, age: Age | null): QuestService['options'][number] | undefined {
	if (age) {
		const years = AGE_YEARS[age];
		for (const o of service.options) {
			const m = o.label.match(/(\d+)\D+(\d+)/);
			if (m && years >= Number(m[1]) && years <= Number(m[2])) return o;
		}
	}
	return service.options[0];
}

function pick(services: QuestService[], role: QuestService['role'], age: Age | null, why: string, branch: string | null): Pick | null {
	const atBranch = (s: QuestService) => !branch || branch === 'any' || s.branches.length === 0 || s.branches.some((b) => b.slug === branch);
	const service = services.find((s) => s.role === role && atBranch(s)) ?? services.find((s) => s.role === role);
	const option = service ? optionForAge(service, age) : undefined;
	return service && option ? { service, option, why } : null;
}

export function recommend(a: QuestAnswers, services: QuestService[]): Recommendation | null {
	const name = a.nickname.trim() || 'your little one';
	const age = a.age;
	const years = age ? AGE_YEARS[age] : 6;
	const comfort = comfortOf(a.feeling);
	const urgent = a.hurting === 'toothache' || a.hurting === 'bump';
	const nervous = (a.feeling ?? 1) >= 4;

	let main: Pick | null = null;
	let pipSays = '';
	if (urgent) {
		main = pick(services, 'check-up', age, 'Something hurts, so a dentist should look soon. Pick the earliest time you see.', a.branch);
		pipSays = `Poor ${name}! Let’s get that tooth looked at soon.`;
	} else if (age === 'under3') {
		main = pick(services, 'first-visit', age, 'Made for under-3s: a gentle look, a ride in the chair and lots of praise. Free.', a.branch);
		pipSays = `A first visit! I’ll save ${name} the shiniest sticker.`;
	} else if (a.firstVisit && nervous) {
		main = pick(services, 'tour', age, 'A visit with nothing to do except explore. Meeting us first makes the check-up easy.', a.branch);
		pipSays = `No rush, ${name}. Come and see Tooth Town first!`;
	} else {
		main = pick(services, 'check-up', age, a.firstVisit ? 'The perfect first proper check-up, at a pace set by your child.' : 'Time for the regular check-up: every six months keeps teeth happy.', a.branch);
		pipSays = nervous ? `We’ll go slowly, ${name}. Promise.` : `Check-up Castle it is, ${name}!`;
	}
	main ??= pick(services, 'check-up', age, 'Our everyday kids visit.', a.branch) ?? pick(services, 'first-visit', age, 'A gentle first visit.', a.branch);
	if (!main) {
		const any = services[0];
		const option = any?.options[0];
		if (!any || !option) return null;
		main = { service: any, option, why: 'One of our kids visits.' };
	}

	const extras: Pick[] = [];
	const add = (p: Pick | null) => {
		if (p && p.service !== main!.service && !extras.some((e) => e.service === p.service)) extras.push(p);
	};
	if (main.service.role === 'tour') add(pick(services, 'check-up', age, 'Book the check-up for after the tour, or another day.', a.branch));
	if (!urgent && years >= 3 && !a.firstVisit) add(pick(services, 'clean', age, 'Make it one trip: a Sparkle Clean straight after.', a.branch));
	if (!urgent && years >= 6 && years <= 14 && !a.firstVisit) add(pick(services, 'sealants', age, 'Back teeth arrive around 6 and 12. Sealants keep them safe.', a.branch));
	if (years >= 7) add(pick(services, 'orthodontic', age, 'From 7, a free look at how the teeth are lining up.', a.branch));

	const pipMood: PipMood = urgent ? 'brave' : nervous ? 'calm' : 'grin';
	return { main, extras: extras.slice(0, 2), pipSays, pipMood, comfort, urgent };
}
