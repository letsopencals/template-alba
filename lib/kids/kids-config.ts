/**
 * Alba Kids presentation: copy, illustrations and the mapping from the store's
 * children's-dentistry products to Tooth Town buildings. Names, prices, lengths,
 * clinicians and branches all come from the store — nothing here is bookable.
 * Client-safe (no SDK calls).
 */

/** The collection whose products make up Tooth Town. */
export const KIDS_COLLECTION = 'childrens-dentistry';

export type BuildingTone = 'pink' | 'teal' | 'sun' | 'blue' | 'green' | 'orange';

export interface Building {
	/** Tooth Town name for the service, e.g. "Check-up Castle". */
	place: string;
	/** One line a parent can read aloud. */
	kidLine: string;
	tone: BuildingTone;
	/** Which "Tooth Quest" role this service plays (see `recommend` in lib/kids/quest.ts). */
	role: 'first-visit' | 'check-up' | 'clean' | 'sealants' | 'orthodontic' | 'tour' | 'other';
}

/**
 * Keyed by any variant slug of the product group (a group's first match wins),
 * with a keyword fallback so a renamed store still gets sensible buildings.
 */
export const BUILDINGS: Record<string, Building> = {
	'happy-visit': {
		place: 'Little Steps Garden',
		kidLine: 'A first hello for under-3s: a ride in the chair, a peek with the mirror, a story on the rug.',
		tone: 'green',
		role: 'first-visit',
	},
	'kids-check-up-little': {
		place: 'Check-up Castle',
		kidLine: 'We count every tooth, check they are growing happily and teach one brushing trick.',
		tone: 'blue',
		role: 'check-up',
	},
	'kids-sparkle-clean': {
		place: 'The Sparkle Wash',
		kidLine: 'Tickly bubbles and a strawberry polish with our kids hygienists. Teeth come out shiny.',
		tone: 'pink',
		role: 'clean',
	},
	'fissure-sealants': {
		place: 'Shield Station',
		kidLine: 'A thin, invisible shield painted on back teeth so sugar bugs slide right off. No needles.',
		tone: 'sun',
		role: 'sealants',
	},
	'orthodontic-first-look': {
		place: 'Smile Observatory',
		kidLine: 'From age 7, a specialist looks at how teeth and jaws are lining up. Just looking, no braces today.',
		tone: 'teal',
		role: 'orthodontic',
	},
	'tooth-town-tour': {
		place: 'The Welcome Room',
		kidLine: 'Fifteen minutes to explore: press the chair buttons, meet the team, pick a sticker. Nothing else.',
		tone: 'orange',
		role: 'tour',
	},
};

const KEYWORDS: [RegExp, string][] = [
	[/happy|first visit|baby|toddler/i, 'happy-visit'],
	[/check/i, 'kids-check-up-little'],
	[/clean|hygien|sparkle|polish/i, 'kids-sparkle-clean'],
	[/seal/i, 'fissure-sealants'],
	[/ortho|brace|align/i, 'orthodontic-first-look'],
	[/tour|welcome/i, 'tooth-town-tour'],
];

const FALLBACK: Building = {
	place: 'Tooth Town',
	kidLine: 'One of our gentle kids visits.',
	tone: 'blue',
	role: 'other',
};

export function buildingFor(variantSlugs: string[], title: string): Building {
	for (const slug of variantSlugs) if (BUILDINGS[slug]) return BUILDINGS[slug];
	for (const [re, key] of KEYWORDS) if (re.test(title) && BUILDINGS[key]) return BUILDINGS[key];
	return FALLBACK;
}

export const TONE_ORDER: [BuildingTone, ...BuildingTone[]] = ['teal', 'pink', 'blue', 'sun', 'green', 'orange'];

/** Tooth Heroes: the clinicians on kids visits. Keyed by staff slug; anyone else gets a rotating fallback. */
export interface HeroProfile {
	/** Hero name, e.g. "Captain Calm". */
	alias: string;
	role: string;
	superpower: string;
	funFact: string;
}

export const HEROES: Record<string, HeroProfile> = {
	'freya-lindqvist': {
		alias: 'The Toddler Whisperer',
		role: 'Paediatric dentist',
		superpower: 'Can check a tooth while singing the whole of "Wheels on the Bus".',
		funFact: 'Grew up on an island in Sweden and still swims in the sea in winter.',
	},
	'chiara-rossi': {
		alias: 'Captain Calm',
		role: 'Paediatric dentist',
		superpower: 'Turns the bravest worries into giggles in under a minute.',
		funFact: 'Makes the best pizza in Clapham (her words, but we agree).',
	},
	'noor-haddad': {
		alias: 'The Smile Detective',
		role: 'Paediatric dentist',
		superpower: 'Spots how a smile is growing long before anyone else does.',
		funFact: 'Speaks three languages and knows the word for "tooth" in eleven.',
	},
	'mei-chen': {
		alias: 'Professor Bubbles',
		role: 'Paediatric dentist',
		superpower: 'Blows the biggest bubble in Tooth Town. Ask her.',
		funFact: 'Has a cat called Molar. Really.',
	},
	'grace-liu': {
		alias: 'The Sparkle Maker',
		role: 'Kids hygienist',
		superpower: 'Polishes teeth so shiny you can see your face in them (nearly).',
		funFact: 'Plays the cello on Sunday mornings.',
	},
	'ella-morgan': {
		alias: 'Gentle Giant',
		role: 'Kids hygienist',
		superpower: 'The softest hands in London, according to a five-year-old.',
		funFact: 'Can say "toothbrush" in Welsh: brws dannedd.',
	},
	'hannah-clarke': {
		alias: 'The Bubble Captain',
		role: 'Kids hygienist',
		superpower: 'Runs the Sparkle Wash. Strawberry polish is her idea.',
		funFact: 'Has run four marathons dressed as a banana.',
	},
	'sam-patel': {
		alias: 'Fluoride Flash',
		role: 'Kids hygienist',
		superpower: 'Paints on fluoride faster than you can say "tickles".',
		funFact: 'Keeps a sticker collection of more than 2,000 stickers.',
	},
	'sofia-almeida': {
		alias: 'The Star Gazer',
		role: 'Specialist orthodontist',
		superpower: 'Sees where every tooth is heading, years ahead.',
		funFact: 'Learned to surf in Portugal before she learned to ride a bike.',
	},
	'matteo-bianchi': {
		alias: 'Mr Line-Up',
		role: 'Specialist orthodontist',
		superpower: 'Can line up anything: teeth, toy cars, the queue for stickers.',
		funFact: 'Builds giant Lego cities with his twins.',
	},
};

const FALLBACK_HEROES: Omit<HeroProfile, 'role'>[] = [
	{ alias: 'Tooth Hero', superpower: 'Makes every visit feel like an adventure.', funFact: 'Has a favourite sticker. Ask which one.' },
	{ alias: 'Smile Ranger', superpower: 'Never, ever in a hurry.', funFact: 'Brushes for two whole minutes, every time.' },
];

export function toneAt(i: number): BuildingTone {
	return TONE_ORDER[i % TONE_ORDER.length] ?? TONE_ORDER[0];
}

export function heroFor(slug: string, index: number): HeroProfile {
	return HEROES[slug] ?? { ...FALLBACK_HEROES[index % FALLBACK_HEROES.length]!, role: 'Alba Kids team' };
}

/** What each kids room is like. Keyed by location slug; unknown branches get a friendly default. */
export const KIDS_ROOMS: Record<string, { nickname: string; features: string[]; tone: BuildingTone }> = {
	marylebone: {
		nickname: 'The Cloud Room',
		features: ['A ceiling full of glow-in-the-dark stars', 'Sunglasses for the big light', 'Saturday mornings'],
		tone: 'blue',
	},
	'notting-hill': {
		nickname: 'The Garden Room',
		features: ['A reading nook in a giant tooth', 'Buggy parking by the door', 'Hello in Arabic, French and Italian'],
		tone: 'green',
	},
	clapham: {
		nickname: 'The Rocket Room',
		features: ['A chair that "takes off" (slowly)', 'Ceiling TV with cartoons', 'Saturday 08:30 starts'],
		tone: 'pink',
	},
};

export const DEFAULT_ROOM = { nickname: 'Kids room', features: ['A play corner', 'Stickers for everyone'], tone: 'sun' as BuildingTone };

export const kidsCopy = {
	brand: 'Alba Kids',
	townName: 'Tooth Town',
	contact: { phone: '+44 20 7946 0180', phoneHref: 'tel:+442079460180', email: 'kids@albadental.co.uk' },
	/** The book's chapters: the index tabs on the page edge. */
	chapters: [
		{ id: 'cover', n: '★', label: 'Cover', tone: 'pink' },
		{ id: 'town', n: '1', label: 'The town', tone: 'green' },
		{ id: 'first-visit', n: '2', label: 'First visit', tone: 'sun' },
		{ id: 'scrub', n: '3', label: 'Bug scrub', tone: 'pink' },
		{ id: 'heroes', n: '4', label: 'Heroes', tone: 'blue' },
		{ id: 'rooms', n: '5', label: 'Rooms', tone: 'orange' },
		{ id: 'grown-ups', n: 'G', label: 'Grown-ups', tone: 'green' },
	],
	cover: {
		series: 'An Alba Kids picture book',
		title: ['Pip and the', 'Tooth Town', 'adventure'],
		byline: 'Children’s dentistry in London · ages 0 to 17',
		lead: 'Gentle children’s dentists, a grown-up in the room the whole time, and a stamp in your Tooth Town passport after every visit.',
		pipSays: 'Hello! I’m Pip. Turn the page!',
		open: 'Open the book',
	},
	town: {
		label: 'Chapter one',
		title: 'The road through Tooth Town',
		lead: 'Every stop on the road is a kids visit. The sign tells you what happens there, how long it takes and what it costs.',
		start: 'Start here: say hello',
		finish: 'Finish: a stamp in your passport!',
	},
	story: {
		label: 'Chapter two',
		title: 'Your very first visit',
		lead: 'Read it together before you come. Knowing the plan is the best cure for butterflies.',
		pages: [
			{ scene: 'hello', title: 'Say hello', text: 'You walk in with your grown-up, and the front desk gives you your very own Tooth Town passport.' },
			{ scene: 'chair', title: 'Ride the chair', text: 'Up, up, up goes the chair! Pop on the cool sunglasses so the big light isn’t too bright.' },
			{ scene: 'count', title: 'Count your teeth', text: 'Mr Mirror helps us count. You can hold him too. Want a break? Just raise your hand.' },
			{ scene: 'stamp', title: 'Get your stamp', text: 'A stamp in your passport, and a brand-new toothbrush to take home.' },
		],
	},
	scrub: {
		label: 'Chapter three',
		title: 'Sugar Bug Scrub',
		lead: 'The sugar bugs have moved in! Scrub them off with your finger (or a mouse) while the two-minute timer runs. Thirty seconds for each corner of the mouth.',
		quadrants: ['Top left', 'Top right', 'Bottom right', 'Bottom left'],
		cheers: ['Little circles, gentle!', 'Don’t forget the back ones!', 'Halfway! Keep going!', 'Nearly there!'],
		done: 'Two whole minutes! Every sugar bug has run away.',
		keyboard: 'Using a keyboard? Tab to a tooth and press Space to scrub it.',
	},
	heroes: {
		label: 'Chapter four',
		title: 'The Tooth Heroes',
		lead: 'Children’s dentists, kids hygienists and orthodontists who chose to work with children. Every one of them has a secret superpower.',
	},
	rooms: {
		label: 'Chapter five',
		title: 'Three rooms built for small people',
		lead: 'Kids visits happen in our family branches. Each has its own room, its own theme and its own stamp.',
	},
	parents: {
		label: 'For grown-ups',
		title: 'The back pages',
		lead: 'The serious bit, short and clear.',
		promises: [
			{ title: 'You stay in the room', text: 'Always, for every age. Hold a hand, sit on the chair together, whatever helps.' },
			{ title: 'Tell, show, do', text: 'We say what we will do, show it on a finger, then do it. No surprises, ever.' },
			{ title: 'Prices before you book', text: 'Every visit has its price on it. Nothing is added in the room without asking you first.' },
			{ title: 'Happy air if it helps', text: 'Gentle nitrous oxide for anxious children or longer treatments, only with your consent.' },
		],
		priceCard: 'Price card',
		faqs: [
			{ q: 'When should my child first see a dentist?', a: 'When the first tooth appears, or by their first birthday. The first visit for under-3s is mostly about getting comfortable.' },
			{ q: 'Can siblings come in together?', a: 'Yes. Book a visit for each child back to back at the same branch and we’ll see them together if they prefer.' },
			{ q: 'What if my child is very nervous?', a: 'Book the Tooth Town tour first, and tell us in the booking form. We slow everything down and never do anything a child isn’t ready for.' },
			{ q: 'Do you see children with additional needs?', a: 'Yes. Tell us what helps (quiet times, longer slots, a first visit without treatment) and we will plan around it.' },
			{ q: 'Can I change or cancel the visit?', a: 'Up to 24 hours before, from your account or the link in your confirmation email.' },
		],
	},
	end: {
		title: 'The End',
		lead: '(of the book, not of the adventure)',
	},
	quest: {
		label: 'Tooth Quest',
		title: 'Write the story, find the visit',
		lead: 'Five quick choices for grown-ups. Each one fills in a line of the story, and the last page tells you which visit to book.',
	},
} as const;

/** The /book deep link for a kids visit. */
export function kidsBookHref(params: { service?: string; clinic?: string; comfort?: Comfort; nickname?: string }): string {
	const q = new URLSearchParams({ for: 'child', dept: KIDS_COLLECTION });
	if (params.service) q.set('service', params.service);
	if (params.clinic) q.set('clinic', params.clinic);
	if (params.comfort) q.set('comfort', params.comfort);
	if (params.nickname) q.set('nickname', params.nickname);
	return `/book?${q.toString()}`;
}

export type Comfort = 'relaxed' | 'nervous' | 'anxious';
