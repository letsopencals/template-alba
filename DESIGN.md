# Alba Dental: design contract — "Light & precision"

Alba is a London dental group that wants to feel like the best-lit room you've ever sat in: porcelain and
enamel surfaces, deep lagoon teal, a cool mint light, brass hairlines, and the quiet exactness of a dental
chart. The site borrows its grammar from that chart — numbered teeth, quadrants, a midline, annotations in
a technical mono — and its motion from light: a gleam passing over enamel, an aperture opening, an
over-exposed photo settling into its true exposure.

## How this differs from every other template

These four decisions are what make Alba its own system. Keep them.

| | Alba | Not this (used by sibling templates) |
|---|---|---|
| **Navigation model** | A fixed **chart rail** on the left (desktop): the mark, an *Index* key, sections as numbers 01–06 whose labels slide out of the rail, visits, sign-in, and a tall vertical **Book** tab. The full menu is the **Index**: a dark plate that opens like an aperture, sections set as a huge numbered typographic list with live studio status beside it. Phones get a slim top bar and a **bottom dock** around a raised Book key. | A top header with centred links and a pill CTA; a drawer menu. |
| **Section rhythm** | Full-width **plates** separated by hairlines, each with a heading row `[index] [title] … [mono annotation]`, brass registration crosses, chart-paper dot grids, asymmetric grids, and dark plates for "instrument" moments (live board, Index, colophon). Lists are **typographic indexes** (numbered rows with leaders), not card grids. | Eyebrow pill → H2 → three cards; alternating image/text bands; marquees. |
| **Booking interaction** | The **Chair planner** (`/book`, built by the booking agent): the visit is laid out as blocks on a horizontal chair-time timeline whose width is minutes; the hygienist "straight after" snaps on as a second block; branches are chosen on **the Alba Line** (a transit diagram), times on a day **light strip**, the clinician from a "who's in the chair" face row. The timeline is the summary. Checkout is one **patient-record sheet**. | A step accordion with a sticky summary card. |
| **Confirmation artifact** | The **appointment card**: a porcelain card with a tooth-chart stamp that flips — front: when / where / who; back: before you come and getting there — plus "pencil in your six-month check-up". My Smile is built around a **recall ring**. | A ticket with a perforation; a "next visit" ticket in the account. |

## Palette (`app/globals.css` `@theme`)

| Token | Hex | Use |
|---|---|---|
| `porcelain` / `porcelain-2` / `bone` | #f3f1eb / #e9e6dd / #ddd8cb | page, bands, image wells |
| `enamel` | #fcfbf8 | cards, fields, light text on dark |
| `ink` `ink-2` `ink-3` `ink-4` | #0d1d1f … #9ca5a2 | text ramp (teal-black) |
| `lagoon` `lagoon-2` `lagoon-3` | #0d3b3e / #145a5e / #1f7a7c | the action colour; outlined accents (`lagoon-3`) |
| `night` | #061a1c | dark plates (`.plate-dark`) |
| `lagoon-wash` | #dde9e6 | selected rows, soft fills |
| `mint` `mint-2` `mint-3` | #bfeedd / #8fdcc0 / #2f8a6c | light: availability, open now, highlights on dark |
| `brass` `brass-2` | #a9844a / #d8c39b | hairlines, numerals, crosses, stamps — never a button fill |
| `signal` / `signal-wash` | #c4512f / #f6e1d8 | pain, emergency, destructive |
| `line` `line-2` `line-light` | 10% / 20% ink, 16% enamel | hairlines |

One action colour: lagoon (on dark plates, enamel/mint). Brass is jewellery. Mint is light, not decoration.

## Type

- **Instrument Serif** (display, 400, roman only) — headlines, numerals in big moments, the Index. The accent word
  (`<em>`) is **drawn, not inked**: an outline (`-webkit-text-stroke`) in `lagoon-3` (`mint` on dark plates), like the
  teeth on the chart; small sizes (`.t-md`, `.t-sm`) use solid `lagoon-3`. **No italics anywhere** — italic accents are
  a sibling-template tell (Clarity, HAAR). Hover states change colour, never style.
- **Hanken Grotesk** — all UI and body text.
- **Martian Mono** — chart annotations (`.t-anno`: 10.5px, uppercase, 0.08em), numbers (`.t-num`), codes
  (FDI numbers, postcodes, times on boards).
- Scale classes: `.t-mega` (hero), `.t-xl`, `.t-lg`, `.t-md`, `.t-sm`, `.t-lede`, `.t-anno`, `.t-num`.

Banned here because sibling templates use them: Fraunces, Figtree, Geist (+ Mono), Fredoka, DM Sans, Bodoni Moda,
Inter / Inter Tight, Archivo, IBM Plex Mono, Space Grotesk.

## Shape and surfaces

- Radii are instrument-precise: 2px (tags), 4px (buttons, chips, fields), 6px (panels). The only big curves are
  teeth, the arch, the recall ring and the appointment card (`.porcelain-card`, 18px).
- Buttons are **keys**, not pills: `components/ui/button.tsx` — a body plus an optional key cell (arrow or a mono
  code) behind a hairline. Variants `solid | line | light | signal | text`.
- `.enamel` (hairline panel), `.enamel-lift` (soft shadow), `.porcelain-card` (the appointment card material),
  `.chart-paper` (dot grid), `.lamp` (mint light from above), `.image-well` (photo placeholder).
- Structure: `.frame` (gutters), `.plate`, `.plate-dark`, `.plate-head`, `.cross` (registration cross), `.hair`,
  `.hair-brass`, `.leader` (dotted price leader).

## Motifs

- **The chart**: teeth drawn from `lib/teeth.ts` (FDI numbering, front-view silhouettes, the top-down arch).
  `ToothStrip` (the upper arch as a chart with FDI numbers and a brass midline) closes every page.
- **The mark**: a tooth with the sun rising inside it (`components/brand/logo.tsx`).
- **Registration crosses** at plate corners; **dotted leaders** in price lists; **status lights** (`.status-light`).
- **The Alba Line**: studios as stations on a transit line (home, /clinics, /book).

## Motion: light, not movement

`components/light/*` and CSS only. No fade-up reveals, parallax, marquees, magnetic buttons, count-ups, smooth-scroll
libraries, curtains or page-wipe overlays.

- `.gleam` — a band of light sweeps once across an element as it scrolls into view (scroll-driven
  `animation-timeline: view()`); `.gleam-hover` on hover.
- `.aperture` — an image opens from a horizontal slit like a lens iris, scroll-driven.
- `.develop` — an over-exposed, desaturated image settles into its exposure, scroll-driven.
- `.rule-draw` — a hairline draws itself; `.dial-in` — a number column turns in like a lens ring.
- `Flap` — live-board values turn over like a split-flap when they change.
- `usePointerLight(ref)` — writes `--lx/--ly` so a highlight follows the pointer (the porcelain tooth).
- **View transitions**: `ViewTransitions` (site layout) + `LightLink` + `vtName(prefix, key)`: shared elements
  morph between pages (treatment index row → treatment page) and the page "re-exposes" (brightness/saturation)
  instead of fading.
- Everything is progressive: without support or with `prefers-reduced-motion`, content is simply visible and
  still. Use `useReducedMotion` from `components/light/use-reduced-motion` (hydration-safe).

## Voice

Calm, exact, British English. Say the price, the time and the person. "Point at the tooth. We'll find the chair."
No exclamation marks on the adult site (Alba Kids has its own voice). Never diagnose; Smile Check *suggests a
visit*.

## Alba Kids

The kids pages (`app/(kids)`) are a different book on purpose: a cut-paper, risograph storybook with its own fonts and
palette (`components/kids/DESIGN-KIDS.md`). The adult site only *points* to it (the kids teaser), it doesn't copy it.
