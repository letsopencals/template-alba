# Alba Kids — "Tooth Town: a pop-up storybook"

The kids pages (`app/(kids)`, `components/kids`, `lib/kids`) are a children's picture book about Pip
and Tooth Town, printed on a risograph and cut from paper. Everything is drawn by hand in SVG and CSS;
there are no raster illustrations. Only the clinicians' portraits are photos, mounted in paper frames.

## Palette: riso inks on paper

Riso prints are flat inks overlapping on uncoated paper. Where two inks cross, they multiply.

| Token | Ink | Hex | Use |
|---|---|---|---|
| `--r-paper` | natural paper | `#f6efe0` | page |
| `--r-paper-2` | cream stock | `#fbf7ee` | cards, pages of the book |
| `--r-kraft` | kraft board | `#dcc7a1` | covers, backs, the board-game board |
| `--r-ink` | Federal Blue | `#2f4170` | text, outlines of cut shapes (never a hard 2px outline) |
| `--r-pink` | Fluorescent Pink | `#ff48b0` | fills, overprints (never text on paper: contrast) |
| `--r-teal` | Teal | `#00838a` | fills, links, secondary text |
| `--r-sun` | Sunflower | `#ffb511` | fills, highlights |
| `--r-blue` | Medium Blue | `#3c7dc4` | fills |
| `--r-green` | Green | `#00a95c` | fills |
| `--r-orange` | Orange | `#ff6c2f` | fills |

Overprints use `mix-blend-mode: multiply` so pink over teal makes a deep violet the way a riso does.
Shading is **halftone dots** (`.r-halftone`, radial-gradient patterns), not gradients.

## Type

- Display: **Caveat Brush** (hand-lettered brush). Headlines are printed twice, blue then pink offset by
  a few pixels with `multiply` (`RisoTitle`), the classic riso misregistration.
- Body: **Atkinson Hyperlegible** (designed for low-vision readers; also friendly for new readers).
- Neither is used by any other template (checked with grep across `templates/*`). No rounded-chunky faces.

## Paper technique

- **Grain**: one fixed, multiply-blended noise layer over the whole kids page (`.r-grain`, an SVG
  `feTurbulence` data URI), plus an SVG filter `#r-paper` for big cut shapes.
- **Torn edges**: `TornEdge` draws a deterministic jagged edge (seeded PRNG, rounded coordinates so SSR
  and the client match) between chapters, like pages torn from a pad.
- **Depth**: real soft shadows (`drop-shadow` with blur), stacked paper layers, split pins and washi tape.
  No hard offset shadows, no ink outlines on boxes.

## Pip, a cut-paper puppet

Pip is assembled from paper pieces: a tooth body, a pink cape, arms and legs joined to the body with brass
**split pins**. Animation rotates the limbs around their pins (a wave, a cheer, a scrub), like a puppet on
a stick. Poses: idle, wave, cheer, brush, point. Moods: happy, grin, wow, calm, wink, brave.

## Motion

- **Pop-up layers**: buildings, cards, dioramas and the leaflet fold up off the page (`rotateX` from ~82° about the
  bottom edge, with a little overshoot) or unfold (`rotateY`) **once**, the first time they scroll into view.
  `layout/popup-observer.tsx` adds `.r-anim` to the kids root after hydration and `.r-in` to each `.r-popup`,
  `.r-popup-late`, `.r-unfold`, `.r-slide` as it enters (stagger with `--d`). This is deliberately not
  scroll-linked: a page captured or printed without scrolling must never show folded scenery.
- Pip's limbs wiggle on their split pins; the rubber stamps thump down once.
- Without JS nothing is hidden (the start state needs `.r-anim`); under `prefers-reduced-motion: reduce` the
  CSS ignores both classes and every element is simply in place. No framer-motion, no imports from
  `components/motion`.

## Colour by chapter

Each chapter is printed on its own wash: cover paper, the road on a green field (`--r-field`), first visit
sunflower (`--r-wash-sun`), Sugar Bug Scrub pink, Tooth Heroes blue, rooms peach, grown-ups plain cream.
`InkBlobs` puts two overlapping ink discs in a corner; they are `isolate`d so the inks multiply with each other,
not with the wash (which turns muddy).

## Structure

- **Navigation**: index **tabs** stick out of the right edge of the page on desktop (one coloured paper tab
  per chapter, the current one pulled out further), and run along the bottom edge on phones. The top bar
  is only the "Alba Kids" label, the grown-ups' site, and "Book a visit".
- **Rhythm**: a book. Cover → Chapter 1 the board game → Chapter 2 the fold-out first visit →
  Chapter 3 Sugar Bug Scrub → Chapter 4 the Tooth Heroes scrapbook → Chapter 5 three rooms (pop-up
  dioramas) → "For grown-ups" (the calm back pages: lined notes, a printed price card, FAQ) → The End.
- **Services as a board game**: the store's children's-dentistry products are the stops on a winding
  path from START to FINISH. Each stop has its building, a paper price tag, the length, the age options
  and the branches, and a Book button.
- **Tooth Quest** is a choose-your-path storybook: every answer fills a blank in the story ("Once upon a
  time, Maya, who was 3 to 6…") and the ending is the visit to book.
- **Booking hand-off**: every Book link goes to the shared `/book` with `for=child`,
  `dept=childrens-dentistry`, `service`, `clinic`, `comfort`, `nickname` (`kidsBookHref`).
- **After the visit**: a riso-printed **certificate of bravery** with a ribbon rosette (prints on its own),
  and a **Tooth Town passport** in My Smile, where each visit is a rubber-stamp mark.

## How this differs from every other template

| | Other templates | Alba Kids |
|---|---|---|
| Navigation | a top bar with links and a pill CTA | book index tabs on the page edge |
| Section rhythm | eyebrow → heading → card grid, repeated | chapters of a picture book, torn pages, pop-up layers |
| Look | rounded cards, 2px ink outlines, hard offset "sticker" shadows (Fluently), clay/3D renders, glass, editorial photos | cut paper + risograph: flat inks that multiply, halftone, grain, torn edges, split pins, washi tape |
| Type | Fredoka, Fraunces, Bodoni, Archivo… | Caveat Brush (misregistered) + Atkinson Hyperlegible |
| Motion | fade-up reveals, parallax, marquees, count-ups (framer) | CSS scroll-driven paper folding up; puppet joints |
| Services | a grid of cards | a board-game path |
| Questionnaire | a stepper with chips | a story the parent completes |
| Brushing | a timer with quadrants | Sugar Bug Scrub: clean the bugs off with your finger |
| Keepsakes | a sticker grid | a passport with rubber-stamp marks; a riso certificate with a rosette |
