/**
 * Site configuration: the curated copy and practice knowledge that has no API
 * equivalent. Edit this file to rebrand the template.
 *
 * Everything live (treatments, prices, durations, clinicians, studios, opening
 * hours, availability) comes from the Opencals API. This file adds only what a
 * booking API can't know: how people describe what's wrong (Smile Check), how to
 * prepare, recall intervals, clinician titles and bios, studio photography and
 * the editorial copy. Every map is keyed by an API slug and every entry is
 * optional: a treatment, clinician or studio without an entry still renders.
 */

/** Collection slugs the template gives special meaning to. */
export type DepartmentKind = 'general' | 'hygiene' | 'cosmetic' | 'orthodontics' | 'implants' | 'emergency' | 'kids' | 'video';

export interface DepartmentContent {
	kind: DepartmentKind;
	/** Short display name used in nav and chips. */
	short: string;
	/** Numeral shown in the treatment index ("01"). */
	index: string;
	image: string;
	tagline: string;
	intro: string;
	/** What it helps with, in plain words. */
	treats: string[];
	faqs: { q: string; a: string }[];
}

export interface Prep {
	/** "Before you come" checklist. */
	bring: string[];
	/** One tip shown on the appointment card. */
	tip: string;
	/** Arrive this many minutes before (in-studio visits). */
	arriveEarly: number;
}

export interface Recall {
	/** Services that count as "done" for this recall. */
	services: string[];
	months: number;
	label: string;
	/** Service to book when due. */
	book: string;
}

export interface ClinicianProfile {
	/** "Dr" for dentists; hygienists have none. */
	honorific?: string;
	title: string;
	bio: string;
	languages?: string[];
	focus?: string[];
	/** GDC-style qualifications line, e.g. "BDS (Lond), MJDF RCS". */
	qualifications?: string;
}

export interface StudioMeta {
	image: string;
	image2: string;
	tagline: string;
	/** Getting there: tube, bus, parking. */
	note: string;
	/** Neighbourhood line, e.g. "W1 · Harley Street quarter". */
	area: string;
	/** Has an Alba Kids room (presentation only; the API decides what's bookable). */
	kidsRoom?: boolean;
	/** IANA zone the studio keeps its hours in. */
	timezone?: string;
}

export interface SmileArea {
	id: 'front' | 'back' | 'gums' | 'whole';
	label: string;
	hint: string;
}

export interface SmileConcern {
	id: string;
	label: string;
	/** Areas this concern is offered for. */
	areas: SmileArea['id'][];
	/** Recommended variant slugs, best first. */
	services: string[];
	/** One line on why we suggest it. */
	why: string;
	urgent?: boolean;
}

export const siteConfig = {
	name: 'Alba Dental',
	shortName: 'Alba',
	tagline: 'Dentistry at first light.',
	description:
		'Alba Dental: five London studios and video consultations. Check-ups, hygiene, whitening, aligners, implants and same-day emergencies, plus Alba Kids for little smiles. Real prices, real times, booked in a minute.',
	url: 'https://example.com',
	founded: 2014,
	timezone: 'Europe/London',

	logo: { text: 'alba', accent: 'dental' },

	/** Shown on every booking surface and in the footer. Not a diagnosis tool. */
	emergency: {
		short: 'Swelling that affects breathing or swallowing, or heavy bleeding? Call 999.',
		long: 'If swelling is spreading to your eye or neck, or affects your breathing or swallowing, or bleeding won’t stop, call 999 or go to A&E now. For toothache, a broken tooth or a lost filling, book an emergency appointment: we keep same-day slots at every studio.',
		phone: '999',
	},

	contact: {
		phone: '+44 20 7946 0180',
		phoneHref: 'tel:+442079460180',
		email: 'hello@albadental.co.uk',
		/** Head office (JSON-LD). Studio addresses come from the API. */
		address: { street: '41 Wimpole Street', locality: 'London', region: 'Greater London', postalCode: 'W1G 8AE', country: 'GB' },
		/** Patient line, shown in My Smile and on the appointment card. */
		careLine: '+44 20 7946 0181',
		/**
		 * Default opening hours, parsed by `lib/opening-hours.ts` for "Open now"
		 * chips. Studios with their own hours are listed in `studioHours`.
		 */
		hours: 'Mon — Fri: 8:00 — 19:00\nSat: 9:00 — 15:00',
	},

	/** Opening hours per studio slug (mirrors the seeded location schedules). */
	studioHours: {
		marylebone: 'Mon — Fri: 8:00 — 19:00\nSat: 9:00 — 15:00',
		shoreditch: 'Mon — Wed: 9:00 — 18:00\nThu: 9:00 — 20:30\nFri: 9:00 — 18:00\nSat: 10:00 — 16:00',
		'notting-hill': 'Mon — Fri: 8:30 — 18:00\nSat: 9:00 — 13:00',
		'canary-wharf': 'Mon — Fri: 7:30 — 19:00',
		clapham: 'Mon — Fri: 8:30 — 18:00\nSat: 8:30 — 13:00',
		online: 'Mon — Fri: 8:00 — 20:00',
	} as Record<string, string>,

	/** Home: hero */
	hero: {
		eyebrow: 'Five London studios · Video consults · Since 2014',
		/** Rendered as: {lead} <em>{accent}</em> */
		lead: 'A calmer kind of',
		accent: 'dentist.',
		body: 'Unhurried check-ups, hygiene that leaves you gleaming, and specialists for everything else. Prices up front, real times, and a team that goes at your pace.',
		image: 'hero/hero-1.jpg',
		imageAlt: 'The Alba Marylebone reception in morning light',
		portrait: 'hero/hero-2.jpg',
		portraitAlt: 'A patient smiling in an Alba treatment chair',
		video: 'videos/hero.mp4',
		poster: 'hero/hero-video.jpg',
	},

	/** Collection slug → template meaning + copy. */
	departments: {
		'general-dentistry': {
			kind: 'general',
			short: 'General',
			index: '01',
			image: 'services/general-dentistry.jpg',
			tagline: 'Check-ups, fillings and everything in between.',
			intro: 'Your dentist looks at the whole picture: teeth, gums, bite and the soft tissues of your mouth. We explain what we see on a screen next to you, and nothing happens without a plan you have agreed to.',
			treats: ['Six-monthly check-ups', 'Toothache and sensitivity', 'Chipped or broken teeth', 'Tooth-coloured fillings', 'Root canal assessment', 'Mouth-cancer screening'],
			faqs: [
				{ q: 'How often should I have a check-up?', a: 'Most people every six months; some every twelve. Your dentist will tell you which suits you, and My Smile reminds you when it’s due.' },
				{ q: 'Do you take X-rays every time?', a: 'No. Only when they help us see something we can’t otherwise, usually every one to two years. Ours are digital and very low-dose.' },
				{ q: 'I haven’t been for years. Is that a problem?', a: 'Not at all. Book a New Patient Exam: it’s longer, there’s no judgement, and we start with a conversation.' },
			],
		},
		hygiene: {
			kind: 'hygiene',
			short: 'Hygiene',
			index: '02',
			image: 'services/hygiene.jpg',
			tagline: 'The clean that makes everything else easier.',
			intro: 'Our hygienists remove what brushing can’t reach, polish away stains and teach you the two or three changes that make the biggest difference. Choose a standard clean, a longer deep clean, or AirFlow guided biofilm therapy: warm, gentle and remarkably thorough.',
			treats: ['Plaque and tartar', 'Bleeding gums', 'Coffee, tea and wine stains', 'Bad breath', 'Before whitening or aligners'],
			faqs: [
				{ q: 'What is AirFlow GBT?', a: 'Guided biofilm therapy uses warm water, air and a fine powder instead of scraping. Most people find it more comfortable, and it reaches further.' },
				{ q: 'Does a clean hurt?', a: 'It shouldn’t. Tell your hygienist if anything is sensitive; we can numb the area or switch technique.' },
			],
		},
		cosmetic: {
			kind: 'cosmetic',
			short: 'Cosmetic',
			index: '03',
			image: 'services/cosmetic.jpg',
			tagline: 'Brighter, smoother, still unmistakably you.',
			intro: 'Whitening, bonding and smile design with dentists who prefer a light touch. We photograph and scan first, show you the result before we start, and never suggest more than you need.',
			treats: ['Yellowing or uneven colour', 'Chips and worn edges', 'Small gaps', 'A smile you’d like to refresh'],
			faqs: [
				{ q: 'Is whitening safe?', a: 'Yes, when it’s planned by a dentist. We check your teeth and gums first and use professional gels at legal concentrations.' },
				{ q: 'How long does bonding last?', a: 'Typically five to seven years with good care. It can be polished and repaired.' },
			],
		},
		orthodontics: {
			kind: 'orthodontics',
			short: 'Aligners',
			index: '04',
			image: 'services/orthodontics.jpg',
			tagline: 'Straighter teeth, planned by specialists.',
			intro: 'Clear aligners and retainers with specialist orthodontists. Your free consultation includes a 3D scan, so you see your projected result on screen before you decide.',
			treats: ['Crowded or crooked teeth', 'Gaps', 'Teeth that moved after braces', 'Bite problems'],
			faqs: [
				{ q: 'Is the consultation really free?', a: 'Yes, including the 3D scan. You leave with a plan and a price, and no obligation.' },
				{ q: 'How long does treatment take?', a: 'Usually six to eighteen months. Your orthodontist will give you a realistic estimate at the consultation.' },
			],
		},
		implants: {
			kind: 'implants',
			short: 'Implants',
			index: '05',
			image: 'services/implants.jpg',
			tagline: 'Replacing teeth, planned in 3D.',
			intro: 'One missing tooth or several: our implant surgeon plans every case with a 3D scan and talks you through every option, implant or not, with prices in writing.',
			treats: ['A missing tooth', 'Loose dentures', 'A tooth that can’t be saved'],
			faqs: [
				{ q: 'Am I too old for implants?', a: 'Age is rarely the deciding factor. Bone, gum health and general health matter more, and we check all three at the consultation.' },
			],
		},
		emergency: {
			kind: 'emergency',
			short: 'Emergency',
			index: '06',
			image: 'services/emergency.jpg',
			tagline: 'Same-day help when something hurts.',
			intro: 'We keep emergency slots open at every studio, every weekday, with the most at Canary Wharf from 7:30. We’ll get you comfortable first and plan the rest after.',
			treats: ['Toothache', 'A broken or knocked tooth', 'A lost filling or crown', 'Swelling', 'Pain after treatment'],
			faqs: [
				{ q: 'What counts as an emergency?', a: 'Anything painful or broken. If swelling affects your breathing or swallowing, call 999 instead.' },
				{ q: 'Not sure if it can wait?', a: 'Book an Emergency Video Triage: a dentist looks on video in fifteen minutes and tells you what to do next.' },
			],
		},
		'childrens-dentistry': {
			kind: 'kids',
			short: 'Alba Kids',
			index: '07',
			image: 'services/childrens-dentistry.jpg',
			tagline: 'Little smiles, big welcome.',
			intro: 'Kids rooms at Marylebone, Notting Hill and Clapham, paediatric dentists who speak fluent five-year-old, and Pip, our very brave tooth.',
			treats: ['First visits from the first tooth', 'Check-ups and cleans', 'Fissure sealants', 'Early orthodontic advice', 'Nervous children'],
			faqs: [
				{ q: 'When should my child first visit?', a: 'When the first tooth appears, or by their first birthday. The First Happy Visit is free.' },
			],
		},
		'video-consultations': {
			kind: 'video',
			short: 'Video',
			index: '08',
			image: 'services/video-consultations.jpg',
			tagline: 'A dentist on your screen in minutes.',
			intro: 'Talk through whitening, aligners or a worry, or find out whether that toothache can wait. Same dentists, no travel, and a written follow-up after.',
			treats: ['Cosmetic questions', 'Is this an emergency?', 'Second opinions', 'Aligner check-ins'],
			faqs: [
				{ q: 'What do I need?', a: 'A phone or laptop with a camera, somewhere bright, and a mirror if you can.' },
			],
		},
	} as Record<string, DepartmentContent>,

	/** Collection slugs with special handling. */
	collections: {
		kids: 'childrens-dentistry',
		video: 'video-consultations',
		emergency: 'emergency',
	},

	/** Plain-English notes per variant slug (treatment pages, composer). */
	serviceNotes: {
		'new-patient-exam': 'Our longest first visit: a full exam, a gum check and a proper conversation about what you want.',
		'check-up': 'Teeth, gums and soft tissues checked, with a plan if anything needs attention.',
		'hygiene-clean': 'Scale and polish, 30 minutes.',
		'deep-clean': 'More time for build-up and gums, 45 minutes.',
		'airflow-gbt': 'Warm air, water and powder instead of scraping. The most comfortable clean we do.',
		'whitening-consultation': 'Free. We check your teeth and show you a realistic shade.',
		'clear-aligner-consultation': 'Free, with a 3D scan and a projected result on screen.',
		'emergency-appointment': 'Same day, at any studio. Pain relief first.',
		'smile-video-consult': 'Free, 20 minutes on video.',
		'emergency-video-triage': 'Fifteen minutes to find out what to do next.',
	} as Record<string, string>,

	/** The questionnaire on /smile-check. */
	smileCheck: {
		eyebrow: 'Smile Check',
		lead: 'Point at the tooth.',
		accent: 'We’ll find the chair.',
		body: 'Tap the teeth on your mind on a real dental chart, say what’s going on and how you feel about the dentist. We’ll suggest the visit, the studio and the soonest time. About thirty seconds.',
		areas: [
			{ id: 'front', label: 'Front teeth', hint: 'The ones people see' },
			{ id: 'back', label: 'Back teeth', hint: 'Where you chew' },
			{ id: 'gums', label: 'Gums', hint: 'Bleeding, receding, sore' },
			{ id: 'whole', label: 'My whole smile', hint: 'Check-up, colour, straightness' },
		] satisfies SmileArea[],
		concerns: [
			{ id: 'pain', label: 'It hurts', areas: ['front', 'back', 'gums'], services: ['emergency-appointment', 'emergency-video-triage'], why: 'Pain deserves a same-day look. We keep emergency slots at every studio.', urgent: true },
			{ id: 'broken', label: 'Chipped or broken', areas: ['front', 'back'], services: ['emergency-appointment', 'composite-bonding-consultation'], why: 'A dentist can smooth or repair it, often in the same visit.', urgent: true },
			{ id: 'sensitive', label: 'Sensitive to hot or cold', areas: ['front', 'back', 'gums'], services: ['check-up', 'new-patient-exam'], why: 'Sensitivity has a handful of causes. A check-up finds which, and the fix is usually simple.' },
			{ id: 'colour', label: 'Colour or stains', areas: ['front', 'whole'], services: ['whitening-consultation', 'airflow-gbt'], why: 'Start with a free whitening consultation; often an AirFlow clean does half the work.' },
			{ id: 'gaps', label: 'Crooked or gaps', areas: ['front', 'whole'], services: ['clear-aligner-consultation', 'composite-bonding-consultation'], why: 'A free aligner consultation includes a 3D scan, so you see the result first.' },
			{ id: 'missing', label: 'A missing tooth', areas: ['front', 'back'], services: ['implant-consultation'], why: 'Our implant surgeon plans every option in 3D, implant or not.' },
			{ id: 'bleeding', label: 'Bleeding when I brush', areas: ['gums', 'whole'], services: ['deep-clean', 'hygiene-clean'], why: 'Usually gum inflammation, and very treatable. A longer hygiene visit is the place to start.' },
			{ id: 'breath', label: 'Bad breath', areas: ['gums', 'whole'], services: ['airflow-gbt', 'hygiene-clean'], why: 'Mostly bacteria in places brushing misses. A thorough clean fixes most of it.' },
			{ id: 'due', label: 'I’m just due a check-up', areas: ['whole', 'front', 'back', 'gums'], services: ['check-up', 'hygiene-clean'], why: 'A check-up, and the hygienist straight after if you like.' },
			{ id: 'new', label: 'I’m new / it’s been years', areas: ['whole'], services: ['new-patient-exam'], why: 'Our longest first visit, with no judgement and plenty of time to talk.' },
		] satisfies SmileConcern[],
		comfort: [
			{ value: 1, face: 'calm', label: 'Totally relaxed', answer: 'Relaxed' },
			{ value: 2, face: 'fine', label: 'Fine, really', answer: 'Relaxed' },
			{ value: 3, face: 'meh', label: 'A bit uneasy', answer: 'A little nervous' },
			{ value: 4, face: 'worried', label: 'Nervous', answer: 'A little nervous' },
			{ value: 5, face: 'scared', label: 'Very anxious', answer: 'Very anxious, please go gently' },
		],
		/** Shown when comfort ≥ 4. */
		gentle: {
			title: 'We’ll go gently.',
			points: ['Longer appointment, no rush', 'A stop signal you control', 'Happy air (nitrous oxide) if you’d like it', 'We explain before we touch anything'],
		},
	},

	/** "Before you come", per collection slug. */
	prep: {
		'general-dentistry': { bring: ['A list of any medicines you take', 'Your previous dentist’s details, if you have them', 'Any questions you’d like to ask'], tip: 'Brush as normal before you come; no need to do anything special.', arriveEarly: 10 },
		hygiene: { bring: ['Your toothbrush, if you’d like tips on technique', 'A list of any medicines you take'], tip: 'Skip the coffee just before: your teeth will thank you after the polish.', arriveEarly: 5 },
		cosmetic: { bring: ['Photos of smiles you like', 'Any questions about cost and aftercare'], tip: 'We’ll take photos, so come as you are; no lipstick is easiest.', arriveEarly: 10 },
		orthodontics: { bring: ['Your current retainer or aligners, if you have them', 'Old orthodontic records, if any'], tip: 'The 3D scan takes about two minutes and nothing goes in your mouth but a small wand.', arriveEarly: 10 },
		implants: { bring: ['A list of any medicines you take', 'Any recent X-rays or scans'], tip: 'Plan for 45 unhurried minutes: we’ll talk through every option.', arriveEarly: 15 },
		emergency: { bring: ['A list of any medicines you take', 'The broken piece of tooth or crown, if you have it'], tip: 'If you have pain, take your usual painkiller as directed on the pack.', arriveEarly: 5 },
		'childrens-dentistry': { bring: ['Their favourite toy (Pip likes company)', 'Their red book or vaccination record for first visits'], tip: 'Tell them it’s a visit to count their teeth. We’ll do the rest.', arriveEarly: 10 },
	} as Record<string, Prep>,
	defaultPrep: { bring: ['A list of any medicines you take'], tip: 'Arrive a few minutes early so you can settle in.', arriveEarly: 10 } satisfies Prep,
	videoPrep: { bring: ['A bright spot, ideally facing a window', 'Your phone or laptop, charged', 'A mirror, so you can show us'], tip: 'Your link opens 10 minutes before. Test your camera now.', arriveEarly: 0 } satisfies Prep,

	/** My Smile recall reminders: when something becomes "due". */
	recalls: [
		{ services: ['check-up', 'new-patient-exam'], months: 6, label: 'Check-up', book: 'check-up' },
		{ services: ['hygiene-clean', 'deep-clean', 'airflow-gbt'], months: 6, label: 'Hygiene visit', book: 'hygiene-clean' },
		{ services: ['kids-check-up-little', 'kids-check-up-junior', 'kids-check-up-teen', 'happy-visit'], months: 6, label: 'Kids check-up', book: 'kids-check-up-junior' },
		{ services: ['retainer-check'], months: 12, label: 'Retainer check', book: 'retainer-check' },
	] satisfies Recall[],

	/** Curated clinician profiles by staff slug. */
	clinicians: {
		'helena-whitmore': { honorific: 'Dr', title: 'Clinical Director', bio: 'Helena founded Alba’s Marylebone studio and still sees patients four days a week. Known for complex restorative work and for being the dentist nervous patients ask for by name.', languages: ['English', 'French'], focus: ['Restorative', 'Nervous patients'], qualifications: 'BDS (Lond), MJDF RCS (Eng)' },
		'rohan-mehta': { honorific: 'Dr', title: 'Dentist', bio: 'Prevention first: Rohan would rather spend ten minutes on how you brush than an hour on a filling. Also runs many of our video consultations.', languages: ['English', 'Hindi', 'Gujarati'], focus: ['Prevention', 'Video consults'], qualifications: 'BDS (Birm)' },
		'sofia-almeida': { honorific: 'Dr', title: 'Specialist Orthodontist', bio: 'Sofia plans clear aligner treatment for teenagers and adults, and leads Orthodontic First Look visits for children from seven.', languages: ['English', 'Portuguese', 'Spanish'], focus: ['Clear aligners', 'Teens'], qualifications: 'DDS, MSc Orth, MOrth RCS (Ed)' },
		'daniel-kessler': { honorific: 'Dr', title: 'Implant Surgeon', bio: 'Daniel plans every implant in 3D and will happily tell you when you don’t need one. From single teeth to full arches.', languages: ['English', 'German'], focus: ['Implants', '3D planning'], qualifications: 'Dr med dent, MSc Implant Dentistry' },
		'aisha-rahman': { honorific: 'Dr', title: 'Endodontist', bio: 'Root canals under the microscope, done calmly and usually in one visit. Aisha’s patients often say it was easier than a filling.', languages: ['English', 'Bengali', 'Arabic'], focus: ['Root canals', 'Microscope dentistry'], qualifications: 'BDS, MClinDent Endo' },
		'freya-lindqvist': { honorific: 'Dr', title: 'Paediatric Dentist', bio: 'Freya sees the youngest Alba Kids, from first teeth to first wobbly ones, and runs the Tooth Town tours.', languages: ['English', 'Swedish'], focus: ['First visits', 'Toddlers'], qualifications: 'DDS, MSc Paed Dent' },
		'grace-liu': { title: 'Dental Hygienist', bio: 'Grace brought AirFlow guided biofilm therapy to Alba and is a quiet evangelist for interdental brushes.', languages: ['English', 'Mandarin'], focus: ['AirFlow GBT', 'Kids hygiene'] },
		'ella-morgan': { title: 'Dental Hygienist', bio: 'Gentle deep cleans and gum care. Ella will find the one habit worth changing and leave the rest.', languages: ['English', 'Welsh'], focus: ['Gum health', 'Deep cleans'] },
		'marcus-bell': { honorific: 'Dr', title: 'Cosmetic Dentist', bio: 'Bonding and whitening that looks like nothing was done. Marcus works from Shoreditch and on video.', languages: ['English'], focus: ['Bonding', 'Whitening'], qualifications: 'BDS (Lond), PGCert Aesthetic Dent' },
		'yuki-tanabe': { honorific: 'Dr', title: 'Cosmetic Dentist', bio: 'Smile design with a light touch: Yuki prefers no-prep and minimal-prep options and shows you the result before starting.', languages: ['English', 'Japanese'], focus: ['Smile design', 'Veneers'], qualifications: 'DDS, MSc Aesthetic Dent' },
		'kwame-asante': { honorific: 'Dr', title: 'Dentist', bio: 'Late-evening check-ups on Thursdays at Shoreditch, and fillings you barely notice.', languages: ['English', 'Twi'], focus: ['Check-ups', 'Fillings'], qualifications: 'BDS (Sheff)' },
		'priya-nair': { title: 'Dental Hygienist', bio: 'Stain removal before whitening, and the best brushing lesson in east London.', languages: ['English', 'Malayalam'], focus: ['Stain removal'] },
		'matteo-bianchi': { honorific: 'Dr', title: 'Specialist Orthodontist', bio: 'Aligners and fixed braces for every age, at Shoreditch and Clapham.', languages: ['English', 'Italian'], focus: ['Aligners', 'Braces'], qualifications: 'DDS, MOrth RCS (Eng)' },
		'isabel-navarro': { honorific: 'Dr', title: 'Dentist', bio: 'Family dentistry in Notting Hill: often three generations of the same family in one afternoon.', languages: ['English', 'Spanish'], focus: ['Family dentistry'], qualifications: 'DDS, MJDF' },
		'tom-fairweather': { honorific: 'Dr', title: 'Dentist', bio: 'Restorative and emergency care, explained with drawings on the back of an appointment card.', languages: ['English'], focus: ['Restorative', 'Emergencies'], qualifications: 'BDS (Bris)' },
		'chiara-rossi': { honorific: 'Dr', title: 'Paediatric Dentist', bio: 'Chiara has a gift with anxious children and a drawer full of stickers. Notting Hill and Clapham.', languages: ['English', 'Italian'], focus: ['Anxious children', 'Sealants'], qualifications: 'DDS, MSc Paed Dent' },
		'noor-haddad': { honorific: 'Dr', title: 'Paediatric Dentist', bio: 'Early orthodontic guidance and growing smiles, in three languages.', languages: ['English', 'Arabic', 'French'], focus: ['Early guidance'], qualifications: 'BDS, DClinDent Paed' },
		'hannah-clarke': { title: 'Dental Hygienist', bio: 'Kids sparkle cleans and adult hygiene at Notting Hill. Famous for the egg-timer brushing challenge.', languages: ['English'], focus: ['Kids sparkle cleans'] },
		'james-oconnell': { honorific: 'Dr', title: 'Emergency Lead', bio: 'James runs the 7:30 emergency list at Canary Wharf. Pain relief first, plan second.', languages: ['English', 'Irish'], focus: ['Same-day emergencies'], qualifications: 'BDentSc (Dub)' },
		'elena-petrova': { honorific: 'Dr', title: 'Dentist', bio: 'Early-morning check-ups so you’re at your desk by nine.', languages: ['English', 'Russian', 'Bulgarian'], focus: ['Early check-ups'], qualifications: 'DDS, MJDF' },
		'arjun-kapoor': { honorific: 'Dr', title: 'Dentist', bio: 'Emergency triage and video consultations; calm voice, clear next steps.', languages: ['English', 'Hindi', 'Punjabi'], focus: ['Emergency triage', 'Video consults'], qualifications: 'BDS (KCL)' },
		'zara-ahmed': { title: 'Dental Hygienist', bio: '7:30 hygiene before work at Canary Wharf, with the early-bird rate.', languages: ['English', 'Urdu'], focus: ['Early hygiene'] },
		'olivia-hart': { honorific: 'Dr', title: 'Dentist', bio: 'Family check-ups at Clapham, Saturdays included.', languages: ['English'], focus: ['Family check-ups'], qualifications: 'BDS (Leeds)' },
		'ben-adeyemi': { honorific: 'Dr', title: 'Dentist', bio: 'Fillings and emergency care at Clapham, with a famously steady hand.', languages: ['English', 'Yoruba'], focus: ['Fillings', 'Emergencies'], qualifications: 'BDS (Lond)' },
		'mei-chen': { honorific: 'Dr', title: 'Paediatric Dentist', bio: 'Toddlers and first visits at Clapham. Mei counts teeth in English and Cantonese.', languages: ['English', 'Cantonese'], focus: ['Toddlers', 'First visits'], qualifications: 'BDS, MPaedDent RCS' },
		'sam-patel': { title: 'Dental Hygienist', bio: 'Kids hygiene and fluoride at Clapham, and adult cleans in between.', languages: ['English', 'Gujarati'], focus: ['Kids hygiene', 'Fluoride'] },
	} as Record<string, ClinicianProfile>,

	/** Fallback title by collection slug. */
	clinicianRoles: {
		'general-dentistry': 'Dentist',
		hygiene: 'Dental Hygienist',
		cosmetic: 'Cosmetic Dentist',
		orthodontics: 'Orthodontist',
		implants: 'Implant Surgeon',
		emergency: 'Dentist',
		'childrens-dentistry': 'Paediatric Dentist',
		'video-consultations': 'Dentist',
	} as Record<string, string>,

	/** Home: "Meet the team" order. */
	featuredClinicians: ['helena-whitmore', 'sofia-almeida', 'grace-liu', 'daniel-kessler', 'chiara-rossi', 'marcus-bell', 'james-oconnell', 'aisha-rahman'],

	/** Studio photography and copy, matched to API locations by slug (positional fallback). */
	studios: {
		marylebone: { image: 'locations/marylebone-1.jpg', image2: 'locations/marylebone-2.jpg', tagline: 'The flagship, in a Georgian townhouse', note: 'Bond Street or Regent’s Park, 6 min walk · Step-free entrance', area: 'W1 · Harley Street quarter', kidsRoom: true },
		shoreditch: { image: 'locations/shoreditch-1.jpg', image2: 'locations/shoreditch-2.jpg', tagline: 'A warehouse studio, open late on Thursdays', note: 'Old Street, 5 min walk · Bike racks outside', area: 'EC2 · Shoreditch' },
		'notting-hill': { image: 'locations/notting-hill-1.jpg', image2: 'locations/notting-hill-2.jpg', tagline: 'The family practice on Westbourne Grove', note: 'Notting Hill Gate or Royal Oak, 8 min walk · Buggy parking', area: 'W2 · Notting Hill', kidsRoom: true },
		'canary-wharf': { image: 'locations/canary-wharf-1.jpg', image2: 'locations/canary-wharf-2.jpg', tagline: 'Twenty floors up, open from 7:30', note: 'Canary Wharf (Elizabeth & Jubilee), 3 min walk', area: 'E14 · Canary Wharf' },
		clapham: { image: 'locations/clapham-1.jpg', image2: 'locations/clapham-2.jpg', tagline: 'On the High Street, Saturday mornings too', note: 'Clapham Common or Clapham North, 4 min walk · Buggy parking', area: 'SW4 · Clapham', kidsRoom: true },
	} as Record<string, StudioMeta>,
	studioImages: ['locations/marylebone-1.jpg', 'locations/shoreditch-1.jpg', 'locations/notting-hill-1.jpg', 'locations/canary-wharf-1.jpg', 'locations/clapham-1.jpg'],

	/** Home: how a visit works */
	journey: {
		eyebrow: 'How a visit works',
		lead: 'Booked in a minute.',
		accent: 'Looked after for years.',
		steps: [
			{ n: '01', title: 'Choose, with prices', body: 'Every treatment priced up front. Real times at every studio, or the soonest anywhere in London.' },
			{ n: '02', title: 'Tell us how you feel', body: 'Nervous? Say so when you book. Your dentist reads it before you arrive and plans the pace around you.' },
			{ n: '03', title: 'Arrive to a calm room', body: 'Your appointment card has directions, what to bring and a tip from your dentist. Tea is on us.' },
			{ n: '04', title: 'We remember for you', body: 'My Smile keeps every visit for your whole family and taps you on the shoulder when a check-up is due.' },
		],
	},

	/** Patient words (home) */
	testimonials: [
		{ quote: 'I hadn’t been to a dentist in nine years. I ticked “very anxious”, and Dr Whitmore had read it before I sat down. We just talked for the first ten minutes.', author: 'Laura M.', context: 'New Patient Exam · Marylebone' },
		{ quote: 'Booked a 7:30 emergency slot from the bus, was out by 8:15 with no pain. Canary Wharf is a lifesaver.', author: 'Tom R.', context: 'Emergency · Canary Wharf' },
		{ quote: 'My son asked when he can go back to see Pip. I did not think I’d ever hear that sentence.', author: 'Amira K.', context: 'Alba Kids · Notting Hill' },
		{ quote: 'The AirFlow clean is the first one I’ve ever enjoyed. Warm, quick, and my teeth have never felt like this.', author: 'Jess T.', context: 'AirFlow GBT · Shoreditch' },
	],

	/** Trust markers (home + checkout reassurance) */
	trust: [
		{ icon: 'shield', title: 'GDC-registered team', body: 'Every dentist and hygienist is registered with the General Dental Council.' },
		{ icon: 'clock', title: 'Unhurried by design', body: 'Thirty minutes for a check-up, never ten.' },
		{ icon: 'card', title: 'Prices up front', body: 'What you see when you book is what you pay.' },
		{ icon: 'heart', title: 'Nervous? Good to know', body: 'Tell us when you book and we plan the pace around you.' },
	],

	/** Home FAQ */
	faqs: [
		{ q: 'Do I need to register as a patient first?', a: 'No. Book any visit online; if you’re new, a New Patient Exam is the best place to start.' },
		{ q: 'Can I book for my child or partner?', a: 'Yes. Choose who the visit is for when you book. Everything stays together in My Smile.' },
		{ q: 'Do you see NHS patients?', a: 'Alba is a private practice. Our prices are on every treatment, and many dental insurance plans reimburse them.' },
		{ q: 'How do I reschedule or cancel?', a: 'From My Smile, up to 24 hours before your visit. No phone calls, no fees.' },
		{ q: 'What if it’s urgent?', a: 'Book an emergency appointment: same-day slots at every studio. If swelling affects breathing or swallowing, call 999.' },
	],

	/** Home: kids teaser band */
	kidsTeaser: {
		eyebrow: 'Alba Kids',
		lead: 'Little smiles have',
		accent: 'their own town.',
		body: 'Kids rooms at three studios, paediatric dentists who speak fluent five-year-old, and Pip, the bravest tooth in London.',
		cta: 'Visit Tooth Town',
	},

	/** Final CTA */
	closing: {
		lead: 'Your next smile starts',
		accent: 'tomorrow morning.',
		body: 'Real times at five studios, booked in a minute.',
	},

	footer: {
		blurb: 'A calmer kind of dentist. Five London studios and video consultations, since 2014.',
		socials: [
			{ label: 'Instagram', href: 'https://instagram.com' },
			{ label: 'TikTok', href: 'https://tiktok.com' },
		],
		columns: [
			{
				title: 'Treatments',
				links: [
					{ label: 'All treatments & prices', href: '/treatments' },
					{ label: 'Hygiene', href: '/treatments/hygiene' },
					{ label: 'Whitening & bonding', href: '/treatments/cosmetic' },
					{ label: 'Clear aligners', href: '/treatments/orthodontics' },
					{ label: 'Emergency', href: '/treatments/emergency' },
				],
			},
			{
				title: 'Alba',
				links: [
					{ label: 'Smile Check', href: '/smile-check' },
					{ label: 'Studios', href: '/clinics' },
					{ label: 'Our dentists', href: '/dentists' },
					{ label: 'Alba Kids', href: '/kids' },
					{ label: 'My Smile', href: '/account' },
				],
			},
		],
	},
};

export type SiteConfig = typeof siteConfig;

/** Prep for a collection slug, or the default. */
export function prepFor(department: string | null | undefined, video = false): Prep {
	if (video) return siteConfig.videoPrep;
	return (department && siteConfig.prep[department]) || siteConfig.defaultPrep;
}

/** The studio's photography for an API location (by slug, else by index). */
export function studioMeta(slug: string | null | undefined, index = 0): StudioMeta {
	const meta = slug ? siteConfig.studios[slug] : undefined;
	return (
		meta ?? {
			image: siteConfig.studioImages[index % siteConfig.studioImages.length]!,
			image2: siteConfig.studioImages[(index + 1) % siteConfig.studioImages.length]!,
			tagline: '',
			note: '',
			area: '',
		}
	);
}

/** @deprecated name kept for shared code; use `studioMeta`. */
export const clinicMeta = studioMeta;

/** Display name with honorific: "Dr Helena Whitmore". */
export function clinicianDisplayName(slug: string, firstName: string, lastName: string): string {
	const h = siteConfig.clinicians[slug]?.honorific;
	return [h, firstName, lastName].filter(Boolean).join(' ');
}
