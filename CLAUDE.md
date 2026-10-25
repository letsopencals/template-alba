# Template conventions

This is a Next.js 15 (App Router) / React 19 storefront template built on
`@opencals/storefront-sdk`. These conventions keep the template fast and
maintainable. They apply to every template in `templates/` — this file is meant
to be copied across them (only the template name / branding differs).

## Data fetching

**RSC-first.** Read data on the server and pass it down. Do NOT fetch cacheable
data in a `useEffect` on the client.

- Server reads go through `lib/server-data.ts` — `React.cache()`-wrapped helpers
  (`getStoreSettings`, `getProducts`, `getProduct`) that call the SDK directly.
  `React.cache` dedupes calls within a request. Never import `lib/server-data.ts`
  from a `'use client'` file.
- `app/layout.tsx` is an async Server Component: it fetches store settings once
  and seeds `<Providers initialSettings={...}>`. `SettingsProvider` takes the
  value as a prop — it does not fetch.
- Read-only pages (e.g. `app/services/page.tsx`) are async Server Components that
  fetch with `lib/server-data.ts` and hand the result to a small `'use client'`
  child as `initialProducts` / `initialProduct`.

**Client reads use SWR, seeded with server data.** For data that genuinely needs
to live on the client (filtering, availability, add-ons, cart), use `useSWR`
against the template's own `/api/*` routes, with `fallbackData` set to the
server-rendered value so there's no loading flash on first paint.

- Shared fetcher: `lib/fetcher.ts`.
- Build the SWR key from its inputs and pass `null` when not ready (e.g. no date
  picked yet) so nothing fetches prematurely. Multiple SWR hooks run in parallel
  — never chain fetches through sequential `useEffect`s.
- `revalidateOnFocus: false` unless you specifically want refocus revalidation.

The `/api/*` routes stay: they are the client/SWR data source and call the SDK
server-side via the `@/lib/opencals` side-effect import.

## Components & files

**Pages compose; components implement.** A `page.tsx` should be: data fetching
(RSC) + layout/composition + wiring. Presentational blocks and interactive
widgets live in `components/`.

- Guideline: any `page.tsx` over ~150 lines, or one that defines a section /
  widget component, gets decomposed into `components/`.
- Group `components/` by route/domain: `components/booking/`, `components/account/`,
  `components/services/`, `components/home/`; shared primitives in `components/ui/`.
  Co-locate a route's private components under a matching subfolder
  (e.g. `components/account/appointment-detail/`).

**Never define a component inside another component** — it remounts on every
parent render. Define at module scope (or a separate file). Module-scope sibling
helpers below a page are fine.

**Use the shared UI primitives — don't hand-style buttons/inputs inline.**
- `components/ui/button.tsx` — `<Button variant size fullWidth cell>` and, for links,
  `<Link className={buttonClasses({ variant, size })}><ButtonInner variant size>…</ButtonInner></Link>`.
  Alba buttons are **instrument keys, not pills**: a 4px-radius body plus an optional key cell on
  the right (arrow by default, or a mono code like `01`; `cell={false}` hides it). Variants
  `solid` (lagoon, the one action colour), `line`, `light` (on dark plates), `signal`
  (emergency/destructive), `text` (brass-hairline link). Sizes `sm|md|lg`. Pass only layout classes
  via `className`.
- `components/ui/input.tsx` — `<Input>`, `<Textarea>` (`.field`) and `<FieldRow>` (mono label,
  optional code, hint/error; render prop gives `{ id, describedBy, invalid }`).
- `components/ui/chip.tsx` — `<Chip selected code tone size>` toggles and `<Tag>` labels (rectangular).
- `components/ui/icon.tsx` — `<Icon name>` (16-grid hairline set) and `<KindGlyph kind>` (a tooth per
  department).
- `components/ui/plate-head.tsx` (the `[index] [title] … [annotation]` heading row with registration
  crosses) and `components/ui/faq.tsx` (native `<details>` list).
- Overlays: `components/ui/sheet.tsx` (mobile bottom sheet) and `components/ui/dialog.tsx` (centred
  modal). Both portal to `document.body`, lock page scroll, trap focus and close on Escape. Don't
  hand-roll modals.

**Hooks are single-concern.** Split multi-purpose hooks so each has one
responsibility and independent dependencies (see `hooks/use-checkout-questions.ts`,
`hooks/use-payment-providers.ts`, `hooks/use-cart-expiry.ts`, split out of the
chair planner / cart context). A large hook may remain as a thin orchestrator that
composes the smaller ones (`hooks/use-dental-booking.ts`).

## Design & motion

- **`DESIGN.md` is the design contract** ("Light & precision": palette, type, motifs, motion, and the
  table "How this differs from every other template"). Read it before touching UI.
- **Uniqueness is a requirement.** This template must not share visual vocabulary with any sibling in
  `templates/`. Banned here: the fonts Fraunces, Figtree, Geist / Geist Mono, Fredoka, DM Sans, Bodoni
  Moda, Inter / Inter Tight, Archivo, IBM Plex Mono, Space Grotesk; fade-up / text-mask reveals,
  parallax, marquees, magnetic buttons, count-up numbers, Lenis or any smooth-scroll library,
  curtain / page-wipe transitions, scroll-progress bars; eyebrow-pill → H2 → three-card sections; pill
  buttons; **italic accent words** (the accent `<em>` is an outline, see DESIGN.md) and italic hover
  states; step-accordion checkout with a sticky summary; ticket-style confirmations.
- **Type:** Instrument Serif (display, roman only), Hanken Grotesk (UI/body), Martian Mono
  (annotations: `.t-anno`, numerals: `.t-num`), loaded with `next/font` in `app/layout.tsx`.
- **Motion is light, not movement:** `components/light/*` + CSS in `app/globals.css` — `.gleam`
  (scroll-driven light sweep), `.aperture`, `.develop`, `.rule-draw`, `.dial-in`, `<Flap>` (split-flap
  values), `usePointerLight` (`--lx/--ly`), and same-document **View Transitions** (`ViewTransitions`
  provider in the site layout, `<LightLink>`, `vtName()` from `components/light/vt-name.ts`, which is
  server-safe). Everything is progressive: with reduced motion or no support the content is visible
  and still. Use `useReducedMotion` from `components/light/use-reduced-motion` (hydration-safe).
- **Custom CSS classes go in `@layer components`** in `app/globals.css`.
  Unlayered CSS beats every Tailwind utility.
- **Grids that hold wide content:** `grid-cols-1` below the breakpoint and
  `min-w-0` on children, or a horizontal ribbon will widen the page.
- **Hydration:** anything that depends on the visitor's clock, timezone or locale
  (open-now lights, the London clock, next-free times) renders a neutral value on the server and the
  live value after `useHydrated()` / `useNow()`. Studio status uses the studio's own clock
  (`lib/studio-status.ts`, `wallClock`). SVG coordinates are rounded (`lib/teeth.ts`) so server and
  client strings match.

## Layout and ownership

- **Route groups.** `app/layout.tsx` is html/body/fonts/providers/JSON-LD only. The adult site lives in
  `app/(site)` (`layout.tsx`: the **chart rail** on desktop — a fixed 76px left column — the phone top
  bar + bottom dock, the Index menu, the cart drawer, the colophon). **Alba Kids** lives in
  `app/(kids)` with its own layout, fonts and palette (`components/kids/**`, `lib/kids/**`,
  `components/kids/DESIGN-KIDS.md`); it shares providers, `/book`, checkout and the account.
- There is no top header on desktop: each page starts with its own first plate inside `.frame`.
- The mobile dock hides on `/book` and `/checkout` (they bring their own bottom bars).
- **Data for pages:** `lib/catalog-server.ts` (`getCatalog`: treatments, groups, departments) and
  `lib/studios-server.ts` (`getStudios`: studios with photography, kids flag, departments, clinicians
  and availability probes; the video location; public clinicians). Pages revalidate every 300 s.
- **Availability** (perf rule): `/api/availability/studio?variant&location` returns every clinician's
  free windows for the whole horizon, cached 60 s per clinician (`lib/availability-server.ts`).
  Clients derive day strips, times and "next free" from it (`lib/slots.ts`,
  `hooks/use-studio-availability.ts`, `hooks/use-next-free.ts`, loaded in view with
  `hooks/use-in-view.ts`). Never fetch per day or per cell.
- **`/book` deep links** (`bookHref` in `lib/catalog.ts`): `service` (variant or group slug), `for`
  (self|child|other), `dept` (collection), `clinic` (location slug; alias `practice`), `staff` (staff
  slug), `comfort` (relaxed|nervous|anxious), `nickname`, `concern`. Smile Check, the kids quest,
  treatment/studio/clinician pages all link this way.

## Dental intake (checkout questions)

- Pre-visit questions are the store's checkout questions. `lib/intake.ts` maps their stable
  `internalName` to meaning: `Visit for`, `Patient name`, `Patient DOB`, `Dental last cleaning`,
  `Comfort level`, `Smile concern`, `Child nickname` (kids services only), `Dental photo`. Match on
  `intakeKey(q)`, never on the visible title.
- Unknown questions render generically by `type`; a store without these questions books every visit
  for "Myself". Nothing may hard-require them.
- Answers travel **per visit** in `AppointmentService.create` (`checkoutQuestionAnswers` as
  `{ questionId, question, answer }`, with `fileIds` for uploads via `/api/uploads/presign`), not at
  checkout — each visit in a family cart keeps its own patient, comfort level and notes.
- Appointment detail answers carry only `questionId` + question text; use
  `patientOf(answers, keyMapOf(questions))` to recover who a visit was for.

## Data exposure

- Everything sent to the browser (RSC props and `/api/*` JSON) goes through
  `lib/public-payload.ts` (`publicPayload`, `publicProduct`) or a public-safe
  mapper (`lib/clinicians.ts`, `PublicClinic` in `lib/server-data.ts`). Never pass
  raw SDK staff, customer or appointment objects through; `internalNote` must
  never reach the client.

## Re-render hygiene

- **Memoize context provider values** with `useMemo` — an inline `value={{...}}`
  object makes every consumer re-render on each provider render. All contexts here
  (`settings`, `location`, `timezone`, `cart`, `checkout`) follow this.
- Hoist static objects (framer-motion `initial`/`animate`/`transition`, default
  non-primitive props) to module-level `const`s instead of recreating them inline.
- `React.memo` leaf components that take stable props and render often
  (e.g. `components/light/flap.tsx`).
- Prefer a ternary (`cond ? <x/> : null`) over `cond && <x/>` for conditional
  rendering, to avoid accidentally rendering `0`/`''`.

## Bundle

- Load heavy / below-the-fold components with `next/dynamic`. Stripe is loaded
  this way in the checkout payment step (`ssr: false`) so it isn't in the initial
  bundle.
- Import directly from module paths; avoid barrel/index re-export files that pull
  in more than you use.

## Verifying changes

- `npm run build` must pass. In the route summary, read-only pages should be `○` (static) or `ƒ`
  (dynamic) Server Components — not shipped as pure client pages.
- Don't run `next build` or a second `next dev` in this directory while another dev server is running
  here (shared `.next`): use an rsync copy with its own `.next` and a symlinked `node_modules`.
- Smoke test: home paints with no spinner and the Today board fills in; the Index menu opens and
  closes on Escape; Smile Check (tap teeth → concern → comfort dial) suggests a visit and the soonest
  studio; studio pages show hours and the next free chair; the chair planner books into the cart;
  checkout completes to the appointment card; My Smile shows the visit, the recall ring and (for
  children) the stamp passport; `/kids` works on a phone.
