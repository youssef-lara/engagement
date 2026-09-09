# Engagement Invitation Website — Implementation Reference

Last updated: 2026-09-04

**Current artwork decision (supersedes the generative experiments below):** use
the original website images only. Do not use image generation. Non-generative,
code-based processing is allowed, with original content and transparency preserved.

This document is the durable reference for the engagement invitation website implementation. Use it to keep the visual design, responsive behavior, bilingual routes, RSVP flow, animation behavior, and deployment setup consistent across separate implementation steps.

The current source of truth is `lara_youssef_engagement_v25.html`. Do not remove or overwrite it until the rebuilt version has been visually compared against it.

## 1. Project outcome

Build a simple, modular, easily editable engagement invitation website that:

- Preserves the current visual identity, elements, scene order, and animations.
- Replaces all meaningful text embedded in image fragments with selectable, readable HTML text.
- Preserves the different typefaces and typographic treatments used by the original design, including text that is currently exported as image fragments.
- Works well in mobile portrait, mobile landscape, tablet, laptop, and desktop layouts.
- Publishes English at `/engagement/` and Arabic at `/engagement/ar/` without a visible language switch.
- Provides an on-page RSVP form for a guest's name, attendance confirmation, and optional message to the couple.
- Deploys to GitHub Pages under the active GitHub.com account on every push to `main`.
- Avoids unnecessary frameworks, build systems, and production-grade complexity.

## 2. Confirmed deployment target

- Active GitHub.com account: `youssefg7`.
- Planned repository: `engagement`.
- The repository did not exist at the time of the audit.
- The current local folder was not a Git repository at the time of the audit.
- Planned English URL: `https://youssefg7.github.io/engagement/`.
- Planned Arabic URL: `https://youssefg7.github.io/engagement/ar/`.
- Deployment source: a GitHub Actions workflow triggered by every push to `main`.
- GitHub Pages must use GitHub Actions as its publishing source.

## 3. Current implementation audit

### 3.1 Source structure

- One HTML file, approximately 13 MB uncompressed and 9.1 MiB when gzipped.
- Nine fixed portrait scenes.
- Each scene uses an aspect ratio based on a 502.1245 × 767.625 Canva composition.
- The full site is constrained to approximately 502 px on wider screens.
- Desktop therefore renders as a narrow portrait strip centered in a large empty background.
- The layout relies heavily on absolutely positioned elements and percentage coordinates.
- The CSS contains multiple historical override generations and 62 keyframe declarations.

### 3.2 Image count clarification

The source contains 614 `<img>` elements, including 607 PNG references, but this does not represent 607 conventional images.

- 515 elements render as tiny fragments, primarily individual letters, punctuation, and small Canva-export pieces.
- 99 elements render at a size resembling a normal illustration, photograph, floral layer, envelope component, or other meaningful visual asset.
- There are 288 unique embedded image payloads.
- The remaining 326 references repeat a payload already present elsewhere.
- Some payloads are reused up to 21 times.
- None of the current rendered images are permanently hidden using `display: none`.
- Many images start with `opacity: 0` and become visible only when their scene receives the `play` class.

Image-fragment breakdown from the audit:

| Scene | Total image elements | Tiny fragments | Larger assets |
|---|---:|---:|---:|
| Opening | 19 | 0 | 19 |
| Invitation | 20 | 0 | 20 |
| Celebration | 69 | 60 | 9 |
| Date | 70 | 62 | 8 |
| Ceremony | 53 | 44 | 9 |
| Reception — boat | 89 | 82 | 7 |
| Reception — car | 132 | 125 | 7 |
| Dress code | 29 | 21 | 8 |
| RSVP | 133 | 121 | 12 |
| **Total** | **614** | **515** | **99** |

Implementation consequence: do not plan to manually preserve 607 meaningful image files. Replace the text fragments with live text, retain the visual layers, and deduplicate repeated assets where practical.

### 3.3 Existing live behavior

- An `IntersectionObserver` adds `play` once when a scene enters the viewport.
- The observer threshold is currently `0.18`, with a vertical root margin.
- The first scene is explicitly played on the first animation frame.
- General entrances use fade, fade-up, left, right, top, bottom, scale, pop, collage, and hero animation classes.
- The sailboat crosses the opening scene over approximately 5.4 seconds.
- Six hummingbirds enter and then continue subtle looping flight/orbit motion.
- The second scene has a custom closed-envelope-to-open-envelope sequence.
- The countdown targets `2026-10-01T19:00:00+03:00`.
- A reduced-motion media query disables or simplifies motion.
- The current RSVP control is an invisible hotspot linking to a Google Form.

### 3.4 Current scene health

1. **Opening:** visually strong in portrait; must become responsive without losing the floral border, oval, birds, Nile artwork, or crossing boat.
2. **Invitation:** distinctive envelope sequence; some invitation copy is live text, but the composition remains small and several titles are rasterized.
3. **Celebration:** understandable in portrait; essentially all copy is image-based.
4. **Date:** calendar and countdown hierarchy work; most labels and date artwork are still image-based.
5. **Ceremony:** map is usable; labels and supporting copy need live text.
6. **Reception by boat:** map and illustration are useful; instructions are split into many image glyphs.
7. **Reception by car:** same issue as boat, with especially high image-fragment count.
8. **Dress code:** visual examples are clear; headings and labels need live text.
9. **RSVP:** the visual card is clear, but the CTA is only an invisible external-form hotspot.

## 4. Non-negotiable preservation rules

### 4.1 Scene order

Preserve this exact narrative order:

1. Opening
2. Envelope invitation
3. Adults-only celebration note
4. Date and countdown
5. Ceremony
6. Reception arrival by boat
7. Reception arrival by car
8. Dress code
9. RSVP

Responsive layouts may reposition content inside a scene, but they must not reorder or combine the nine scenes without explicit approval.

### 4.2 Visual identity

Preserve:

- Floral border and corner arrangements.
- Pink, coral/orange, cream, white, black, and watercolor palette.
- Hummingbirds and their inward-facing orientation.
- Nile/palm-tree artwork.
- Sailboat and car illustrations.
- Envelope, wax seal, card, photographs, lace, flowers, and their reveal sequence.
- Calendar, countdown, church and venue maps.
- Dress-code figures.
- RSVP lace-card treatment.

Artwork can be resized, regrouped, or placed inside a new responsive art stage, but should not be visually replaced with generic icons, emoji, CSS drawings, or unrelated illustrations.

### 4.3 Animation contract

Preserve the perceived sequence and character of the current animations:

- First-scene floral and hero entrances.
- Hummingbird entrance plus continuous gentle motion.
- Sailboat crossing direction and long-duration movement.
- Closed-envelope reveal, paper/text transition, seal timing, flap opening, photos/flowers rise, and invitation-card reveal.
- Per-scene directional entrances and staggered delays.
- Play-once behavior when a scene enters the viewport.
- Reduced-motion fallback.

Do not place responsive positioning and animation transforms on the same DOM element. Use a wrapper pattern:

- Outer wrapper: responsive position, grid placement, rotation anchor, and dimensions.
- Inner element: animation opacity and transform.

This prevents a media-query transform from overwriting an animation transform or vice versa.

### 4.4 Typography preservation contract

Replacing image text with live text must not flatten the website into one generic font.

For every text object currently exported as an image fragment, preserve or recreate its original typographic role as closely as practical:

- Font family or closest visually matching web font.
- Script, serif, sans-serif, condensed, or handwritten character.
- Font weight and stroke contrast.
- Font style.
- Uppercase/lowercase treatment.
- Letter spacing.
- Line height.
- Original line breaks where they contribute to the composition.
- Text color.
- Text alignment.
- Rotation and placement where visually intentional.
- Relative size and hierarchy compared with surrounding text.

Do not assign all converted text to a single script font or a single body font.

Expected English typography roles include at least:

1. **Couple-name display script:** elegant, high-contrast script used for Youssef and Lara. The current live invitation work uses `Ballet`; preserve this role unless comparison shows another font is a closer match.
2. **Section-heading calligraphy:** black handwritten/calligraphic headings such as Celebration, Date, Ceremony, Reception, Dress Code, and RSVP. Preserve the source character; this does not have to be the same font as the couple names.
3. **Invitation supporting serif:** refined serif copy for formal invitation wording, currently represented with `Cormorant Garamond` in the live card.
4. **Informational sans-serif:** clear uppercase or regular sans-serif for directions, venue labels, ceremony time, dress-code labels, and RSVP details.
5. **Countdown display:** heavy condensed numerals, currently using an Impact/Arial Narrow style.
6. **Small labels:** compact uppercase sans-serif with deliberate tracking.
7. **Accent handwriting:** informal handwritten text where the design uses a lighter personal-note style.

Before replacing a rasterized text group:

1. Capture or inspect the original at a useful scale.
2. Record its typographic role and visible characteristics.
3. Match it to an existing project font or choose the closest appropriate web font.
4. Compare live text and source side by side.
5. Adjust size, weight, tracking, line height, rotation, and placement.

If the exact Canva font cannot be identified or licensed for web use, use the closest visually compatible web font and document the substitution. Do not silently replace it with the site body font.

Arabic typography should preserve the same hierarchy rather than mechanically reusing Latin fonts:

- An Arabic display/calligraphic face for names and major headings.
- A readable Arabic text face for details and formal wording.
- A clear Arabic-compatible sans-serif for directions, labels, and form controls.
- RTL-aware alignment and spacing.
- Adequate line height for Arabic letterforms and diacritics.

## 5. Proposed modular file structure

Keep the implementation static and lightweight:

```text
engagement/
├── index.html
├── ar/
│   └── index.html
├── assets/
│   ├── css/
│   │   └── site.css
│   ├── js/
│   │   └── site.js
│   ├── fonts/                  # only if fonts are self-hosted later
│   └── images/
│       ├── README.md
│       ├── manifest.json
│       ├── elements.csv
│       ├── shared/
│       ├── opening/
│       ├── invitation/
│       ├── celebration/
│       ├── date/
│       ├── ceremony/
│       ├── reception-boat/
│       ├── reception-car/
│       ├── dress-code/
│       └── rsvp/
├── scripts/
│   └── extract-assets.mjs
├── .github/
│   └── workflows/
│       └── pages.yml
├── .nojekyll
└── IMPLEMENTATION_REFERENCE.md
```

The two HTML files intentionally keep their meaningful text in the document for clarity and accessibility. They share CSS, JavaScript, and images. Avoid adding a framework or build step solely to eliminate this small amount of structural duplication.

## 6. Semantic scene structure

Each scene should contain:

- A semantic `<section>` with a useful accessible label or heading.
- A content wrapper responsible for width and responsive layout.
- An art stage for positioned decorative elements.
- A copy layer containing real headings, paragraphs, dates, addresses, directions, and controls.
- Animation wrappers that preserve the current motion classes and delays.

Essential information must remain understandable if decorative images do not load.

Decorative images use empty alternative text. Meaningful photos or illustrations receive concise alternative text only when their meaning is not already conveyed by adjacent copy.

## 7. Responsive design specification

### 7.1 Shared principles

- Do not constrain the entire site to 502 px.
- Do not retain a fixed portrait aspect ratio on every full section.
- Use `clamp()` for typography and spacing.
- Use CSS grid/flex layout at the scene level.
- Use absolute positioning only inside bounded art stages where layered composition requires it.
- Avoid horizontal overflow at every supported width.
- Use modern viewport units carefully (`svh` where useful) to avoid mobile-browser chrome issues.

### 7.2 Mobile portrait

- Retain the current full-width, art-led feeling.
- Stack art and copy vertically where necessary.
- Allow scenes to grow with their text rather than shrinking copy to preserve an arbitrary canvas ratio.
- Maintain comfortable readable type sizes and touch targets.
- Keep maps wide enough to interact with.

### 7.3 Mobile landscape

- Prefer compact two-column arrangements: copy on one side, art or map on the other.
- Avoid forcing users through nine oversized portrait canvases while holding the phone sideways.
- Use section heights that fit the content; a scene can target `100svh` but must be allowed to grow.
- Keep animated artwork inside a contained stage so it cannot overlap navigation or copy.

### 7.4 Tablet and desktop

- Use a centered content width of roughly 1100–1200 px, subject to visual comparison.
- Use alternating editorial layouts while preserving scene order.
- Opening and invitation remain centered, art-led signature scenes.
- Date, maps, directions, dress code, and RSVP can use clearer text/art columns.
- Use available horizontal space rather than enlarging the original portrait strip.
- Keep decorative florals at the outer edges without making the main copy excessively narrow.

## 8. English and Arabic routes

### 8.1 Route behavior

- English entry: `index.html` at `/engagement/`.
- Arabic entry: `ar/index.html` at `/engagement/ar/`.
- No visible language toggle or switch.
- Add appropriate invisible metadata using `hreflang="en"` and `hreflang="ar"`.
- Use `lang="en"` and `dir="ltr"` for English.
- Use `lang="ar"` and `dir="rtl"` for Arabic.

### 8.2 Path rules

- English HTML references shared files through `assets/...`.
- Arabic HTML references shared files through `../assets/...`.
- CSS image paths remain relative to the CSS file.
- Do not hard-code `/engagement/` into every asset URL; relative paths preserve local preview and future custom-domain compatibility.

### 8.3 Arabic content dependencies

Confirm before final Arabic implementation:

- Preferred Arabic spelling of both full names.
- Arabic tone: formal, warm, or a mix.
- Official Arabic/English rendering of St. Anthony Church.
- Official Arabic/English rendering of Revana Wedding Venue.
- Boat and car direction wording.
- Adults-only wording.
- Whether dates should use Western or Arabic-Indic numerals.

For navigation clarity, official venue names may appear in Arabic followed by English.

## 9. RSVP specification

### 9.1 Recommended approach

Keep the custom bilingual HTML form and submit it with browser `fetch` to a small Cloudflare Worker. The Worker validates the request and writes directly to a private Google Sheet through a service account. This preserves the invitation's own controls and inline states without embedding provider UI or exposing Google credentials in GitHub Pages.

Required fields:

- Full name.
- Attendance: attending or unable to attend.

Optional field:

- Message for the couple.

### 9.2 Form behavior

- All inputs have visible localized labels and native browser validation.
- Attendance is a clearly labeled radio group.
- The submit button is keyboard accessible and disabled while a request is running.
- Show localized ready, submitting, success, validation-error, and network-error states inline.
- Include language, submission time, page URL, submission ID, and a honeypot in each request.
- Do not place guest names or messages in the repository, localStorage, URL query strings, analytics, or public static files.
- Keep a localized link to the existing Google Form while the Worker endpoint is unavailable.

### 9.3 Required setup dependency

Before enabling the live endpoint:

- Create a Google service account and share only the RSVP spreadsheet with its `client_email` as Editor.
- Store the complete service-account JSON locally in ignored `.env` and remotely as the Cloudflare Worker secret `SERVICE_ACCOUNT_KEY`.
- Deploy `worker/src/index.js` and set its HTTPS `/rsvp` URL in `assets/js/rsvp-config.js`.
- Keep Google credentials, Cloudflare credentials, and guest data private.
- Verify one English and one Arabic submission reaches the `RSVP Responses` tab before considering the migration complete.

The existing public Google Form remains the temporary fallback: <https://forms.gle/daqf2ug4TypLtKwH8>. Owner operating instructions are in [`RSVP_OPERATIONS.md`](RSVP_OPERATIONS.md).

## 10. GitHub Pages deployment specification

Create `.github/workflows/pages.yml` with:

- Trigger on every push to `main`.
- Optional `workflow_dispatch` trigger.
- `contents: read`, `pages: write`, and `id-token: write` permissions.
- Checkout step.
- GitHub Pages configuration step.
- Static artifact upload step.
- Pages deployment step.
- `github-pages` deployment environment.
- Concurrency configured so an older in-progress deployment does not override a newer commit.

Use the current official major versions at implementation time for:

- `actions/checkout`
- `actions/configure-pages`
- `actions/upload-pages-artifact`
- `actions/deploy-pages`

Add `.nojekyll` so the static directory is served directly.

Do not place RSVP secrets, private guest data, or credentials in workflow files. The Worker URL is public routing data; Google service-account credentials, Cloudflare credentials, and submissions are private.

## 11. Ordered implementation tasks

### Task 1 — Preserve the baseline

Status: **Complete (2026-08-30).** The preserved specification is in [`baseline/BASELINE.md`](baseline/BASELINE.md), with accepted automated captures in [`output/playwright/baseline/`](output/playwright/baseline/).

- Keep the original HTML unchanged.
- Record the active scene order, text, maps, links, animation classes, and timing.
- Capture representative source states, including the opened invitation envelope.
- Create a font/typography mapping as text fragments are identified.

Completion condition: the source behavior can be compared against the rebuild without relying on memory.

### Task 2 — Initialize repository and modular structure

Status: **Complete (2026-08-30).** Git uses `main`, the public repository is [`youssefg7/engagement`](https://github.com/youssefg7/engagement), the modular static structure is present, and both language routes load locally with their relative shared-asset paths.

- Initialize Git with `main`.
- Create the `youssefg7/engagement` repository.
- Add the planned folders and shared static files.
- Establish `index.html` and `ar/index.html` entry points.

Completion condition: both routes load locally using relative assets.

### Task 3 — Extract and classify assets

Status: **Complete (2026-08-30).** The reproducible extractor in [`scripts/extract-assets.mjs`](scripts/extract-assets.mjs) decoded all 614 references into 288 unique physical files, removed 326 duplicate file copies, grouped scene-specific and shared assets, and recorded every source element in [`assets/images/manifest.json`](assets/images/manifest.json) and [`assets/images/elements.csv`](assets/images/elements.csv).

- Extract embedded data-URI visuals into named asset files.
- Group files by scene.
- Classify each element as text fragment, meaningful artwork, decorative artwork, repeated payload, or obsolete layer.
- Remove text fragments only after their live-text replacements exist.
- Reuse the same physical asset file for duplicate payloads.

Completion condition: the site no longer depends on hundreds of anonymous embedded image fragments.

### Task 4 — Rebuild the semantic scene skeleton

Status: **Complete (2026-08-30).** Both routes now share the same nine-scene semantic structure in the original order. Essential invitation copy, calendar/countdown, venue details, map embeds, dress-code labels, and RSVP field labels are live DOM content. Automated viewport captures are stored in [`output/playwright/task-4/`](output/playwright/task-4/). The temporary Arabic-route placeholders created here were replaced by the completed Arabic implementation in Task 8.

- Recreate all nine sections using art stages and live-copy layers.
- Preserve the original scene order.
- Add semantic headings, paragraphs, dates, addresses, map controls, and form labels.

Completion condition: all essential information is present as real DOM text.

### Task 5 — Convert image text while preserving typography

Status: **Complete (2026-08-31).** Every meaningful text role now uses live, selectable DOM text with a dedicated font treatment. The final mapping keeps the source’s distinct formal scripts, scene calligraphy, invitation serif, informational sans, condensed countdown, RSVP monogram, and personal-note hand. Automated comparison and image-disabled captures are stored in [`output/playwright/task-5/`](output/playwright/task-5/). Complementary Arabic font roles were completed in Task 8.

| Live role | Implemented family | Source relationship |
|---|---|---|
| Opening strapline | `Cormorant Garamond` 600 | Preserves the tracked uppercase serif and recreates the source arc as live SVG text |
| Opening names and signature | `Great Vibes` | Closest available web substitution for the source’s formal, restrained name script |
| Opening ampersand | `Ballet` | Keeps the pink accent distinct from the hero-name script |
| Closed-envelope message | `Mrs Saint Delafield` | Loose handwritten substitution reserved for the closed-envelope state |
| Open-scene orange names | `Qwigley` | Connected, informal orange display distinct from both hero and card lettering |
| Invitation-card names and date | `Ballet` | Retains the official source web font |
| Invitation formal copy | `Cormorant Garamond` 500 | Retains the known source family with a readable minimum size |
| Main scene headings | `Italianno` | Closest tested web substitution for the source’s thin, sweeping calligraphy |
| RSVP heading | `Italiana` | Restrained high-contrast substitute for the separate geometric RSVP lettering |
| Informational copy, calendar, labels, and button | `Montserrat` 400–800 | Web-safe substitute for the source’s compact Arial-like uppercase sans role |
| Countdown numerals | `Anton` | Portable condensed-display substitute for the source’s `Impact`/`Arial Narrow` stack |
| RSVP personal note | `Caveat` 400 | Friendly handwritten role kept separate from large display scripts |

- Replace every meaningful text fragment with live text.
- Preserve each original font role and typographic treatment.
- Maintain intentional differences between couple names, calligraphic headings, formal invitation serif, informational sans-serif, countdown numerals, labels, and personal-note handwriting.
- Compare the source and live text visually at useful zoom levels.
- Record any font substitutions.

Completion condition: disabling images leaves all essential content readable, while the rendered page still reflects the original typographic identity.

### Task 6 — Implement responsive layouts

Status: **Complete (2026-09-01).** The rebuilt site now uses content-driven scene heights and four responsive layout modes: portrait-first mobile, compact short landscape, paired tablet spreads, and constrained desktop/wide-desktop spreads. The nine-scene order and all existing `data-motion` hooks remain unchanged. Final automated captures are stored in [`output/playwright/task-6/`](output/playwright/task-6/).

| Layout mode | CSS condition | Implemented treatment |
|---|---|---|
| Mobile portrait | Base styles from 320 px | Stacked copy and art with full-width floral framing and content-driven height |
| Short landscape | 640 px and wider, landscape, up to 544 px tall | Compact horizontal spreads, reduced stage gaps, landscape-safe invitation card, and two-column date/dress-code content |
| Tablet | 704 px and wider | Alternating copy/art editorial spreads, paired date and dress-code groups, and a two-column RSVP paper |
| Laptop/desktop | 1024 px and wider | Near-viewport-height scenes with bounded art, map, dress-code, and RSVP dimensions |
| Wide desktop | 1440 px and wider | Wider bounded content canvas without stretching artwork beyond its useful scale |

Verification covered 320 × 568, 390 × 844, 667 × 375, 844 × 390, 768 × 1024, 1366 × 768, and 1920 × 1080. Every target reported a document width equal to its viewport, no clipped visible headings/copy/forms, and no browser console errors. Both `/` and `/ar/` retain nine scenes; Task 8 subsequently completed the Arabic copy and RTL treatment.

- Add portrait, landscape, tablet, and desktop arrangements.
- Allow text to determine section height.
- Contain positioned art within responsive stages.
- Ensure maps, form controls, and live copy remain usable at each width.

Completion condition: no horizontal overflow, clipped text, unreadably small copy, or narrow desktop portrait strip.

### Task 7 — Preserve and consolidate animation behavior

Status: **Complete (2026-09-01).** The source motion contract now lives in the shared stylesheet and script. JavaScript opts the page into motion, observes each scene with the source `0.18` threshold and `8% 0 -8%` root margin, adds `play` once, and then unobserves that scene. Without JavaScript—or when reduced motion is requested—the invitation remains fully visible in its stable open state.

- The opening restores six positioned hummingbirds while reusing one deduplicated GIF file. Their source delays (`0.10s`–`0.50s`), `0.58s` entrances, individual `3.5s`–`3.9s` infinite orbits, and inward-facing orientations are preserved.
- The sailboat retains its `5.4s` crossing, `1.04s` delay, source easing, and four-point path across the Nile artwork.
- The invitation restores the closed-envelope paper and live handwritten label, holds the closed state for `1.42s`, and then follows the preserved paper, label, seal, open-envelope, photo, card, and orange-title timing contract through the settled open state.
- Semantic copy and art groups use restrained directional entrances matching their placement: opposing left/right entrances for paired spreads, top/bottom entrances for dress code, and a dedicated RSVP paper entrance.
- Responsive positioning remains in layout rules. Motion uses existing `data-motion` hooks and leaf artwork, with individual translate/scale/rotate properties for grouped entrances so it does not replace responsive geometry.
- Reduced-motion emulation reports no motion opt-in class, no boat animation, visible birds and live content, a hidden closed-paper overlay, and the stable open invitation card.

Automated captures are stored in [`output/playwright/task-7/`](output/playwright/task-7/): opening played, invitation closed at `300ms`, invitation open at `2500ms`, and the reduced-motion opening. Browser verification also confirmed play-once persistence, correct computed animation names/durations/delays, zero console errors, and no horizontal overflow or clipped live copy at 320 × 568, 844 × 390, and 1366 × 768 on the shared English/Arabic implementation.

- Move current active motion into the shared script and stylesheet.
- Preserve IntersectionObserver play-once behavior.
- Preserve birds, boat, envelope, directional entrances, delays, and reduced motion.
- Remove historical overridden animation declarations only after visual comparison proves the final behavior.

Completion condition: the rebuilt sequence matches the perceived source sequence without transform conflicts.

### Task 8 — Add Arabic content and RTL behavior

Status: **Complete (2026-09-01).** `/ar/` now contains complete Arabic metadata, navigation, invitation copy, calendar, Arabic-Indic countdown, venue instructions, map titles, dress-code labels, image descriptions, RSVP copy, form labels, and fallback messaging. The temporary nested English language/direction override and pending-copy marker were removed.

| Arabic role | Implemented family | Use |
|---|---|---|
| Calligraphic display | `Aref Ruqaa Ink` | Couple names, scene headings, envelope message, invitation names/date, RSVP note and signature |
| Formal prose | `Noto Naskh Arabic` | Invitation details, supporting copy, venue text, and personal sign-off |
| Utility and data | `Noto Kufi Arabic` | Strapline, rules, calendar, countdown, dress-code labels, form labels, controls, and buttons |

- Responsive grids mirror copy/art placement through RTL flow while maps, photographs, florals, the Nile, and the boat path retain their intended orientation.
- Directional entrances mirror the resulting RTL grid placement instead of mechanically flipping every animation.
- The shared countdown script localizes the Arabic route with Arabic-Indic digits and an Arabic accessibility label while preserving Western numerals and English announcements on `/`.
- Reduced-motion behavior remains the same in both languages, showing the stable open invitation without entrance animation.
- The RSVP scene was fully translated here and its custom controls remain shared by the provider integration in Task 9.

Final captures are stored in [`output/playwright/task-8/`](output/playwright/task-8/). Automated checks covered 320 × 568, 390 × 844, 667 × 375, 844 × 390, 768 × 1024, 1366 × 768, and 1920 × 1080 with no horizontal overflow, clipped visible copy, or console errors. Browser checks also confirmed all three Arabic web fonts loaded, no visible English copy remained, motion directions matched RTL placement, and both language routes retained nine scenes.

- Insert approved Arabic copy.
- Apply Arabic font roles and RTL layouts.
- Mirror alignment where appropriate without blindly mirroring maps or artwork.
- Keep official navigation names unambiguous.

Completion condition: `/ar/` is complete, readable, and visually equivalent in hierarchy rather than a literal left/right copy of English.

### Task 9 — Add RSVP submission

Status: **Complete (migrated to Cloudflare Worker + Google Sheets 2026-09-01).** The custom bilingual form submits through a small Vanilla JS handler to a Cloudflare Worker, preserving the invitation's visual design with no provider UI. The Worker authenticates with a private Google service-account secret and appends responses to the private `RSVP Responses` tab. Both routes provide native validation, localized ready/submitting/success/failure states, submission locking, a honeypot, language and diagnostic metadata, and the existing Google Form fallback. The deployed endpoint passed direct CORS and Sheets-write verification before the public route was switched. Public English and Arabic browser submissions then showed their localized success states with no console errors, and both exact rows were confirmed through a private Sheets API read. See [`RSVP_OPERATIONS.md`](RSVP_OPERATIONS.md).

- Select a submission provider after comparing hosted forms, Google Sheets-based approaches, and small serverless endpoints, then connect the on-page form.
- Add validation and submission states.
- Add the language field and honeypot.
- Verify both English and Arabic submissions privately reach the correct destination.

Completion condition: a guest can submit name, attendance, and optional message from either route.

### Task 10 — Configure GitHub Pages

Status: **Complete (2026-08-30).** The workflow in [`.github/workflows/pages.yml`](.github/workflows/pages.yml) deploys the static site on every push to `main`; GitHub Pages uses the workflow source with HTTPS enforced, and the English and Arabic URLs were verified after the first successful deployment.

- Add the Pages workflow and `.nojekyll`.
- Create/configure the GitHub repository.
- Enable GitHub Actions as the Pages source.
- Push `main` and verify deployment.

Completion condition: every subsequent push to `main` automatically publishes the latest site.

### Task 11 — Final visual and interaction review

Status: **Complete (reference-composition correction 2026-09-01; iPhone viewport refinement 2026-09-03).** The first rebuilt layout used generic full-viewport editorial grids, which changed the source's scene geometry, visual order, and animation grouping. The correction pass restored the source's percentage anchors for extracted artwork, kept all meaningful text live, and retained a taller RSVP scene for the added form. The follow-up pass used the supplied 1206 × 2622 iPhone 17 Pro captures as primary evidence. Those captures exposed that the old 502.1245 × 767.625 aspect-ratio lock ended each scene before Safari's usable viewport, revealed part of the following scene, and made supporting type unnecessarily small.

Portrait scenes now extend the preserved composition to `100svh`, fill the usable phone viewport, and snap gently at scene boundaries. Decorative anchors and animation layers retain their original order, but live typography uses readable minimum sizes rather than scaling only from width. Short landscape viewports continue to use the reference ratio and vertical scrolling so artwork is not cropped or squeezed. RSVP intentionally remains taller than a short screen, allowing the form and touch controls to stay readable.

- Invitation photographs, lace card, envelope layers, lilies, bouquet, and florals now share one collage stage and follow the preserved closed/open timing.
- Date, ceremony, boat, and car content now follows the original title → map/calendar → supporting details order.
- Missing floral side layers, the car route, and the source-positioned Nile/boat artwork have been restored.
- English and Arabic use the same art anchors while retaining their distinct live-text font roles.

Reference-composition captures are stored in [`output/playwright/task-11/reference-pass/`](output/playwright/task-11/reference-pass/), and the iPhone refinement captures are in [`output/playwright/task-11-iphone/`](output/playwright/task-11-iphone/). The latest scripted matrix covers both routes at 320 × 568, 360 × 800, 390 × 844, 393 × 852, 402 × 760, 402 × 874, 412 × 915, 430 × 932, 844 × 390, 768 × 1024, and 1440 × 900. All combinations retain nine scenes, zero horizontal overflow, no clipped essential content, no broken local images, and no console errors. Focused checks also verify the closed and open envelope states, reduced-motion open state, completed boat crossing, continuing bird orbit, live countdown updates, three maps, enabled/focusable RSVP fields, loaded web fonts, and selectable invitation text in both languages.

- Review all nine scenes in both languages.
- Check mobile portrait, mobile landscape, tablet, laptop, and wide desktop.
- Verify envelope, birds, boat, entrance animations, countdown, maps, and RSVP.
- Check reduced-motion behavior.
- Confirm text remains sharp and selectable.
- Check keyboard focus and visible controls.

Completion condition: the site is ready to share and the original source can remain archived as a reference rather than the deployed implementation.

## 12. Verification approach

The project does not require a production-grade automated test suite. Use focused manual and command-line verification during each implementation step.

Local preview:

```sh
python3 -m http.server 4173
```

Minimum viewport review targets:

- 390 × 844 mobile portrait.
- 844 × 390 mobile landscape.
- 768 × 1024 tablet portrait.
- 1024 × 768 tablet/compact desktop.
- 1440 × 900 desktop.

At each representative viewport verify:

- No horizontal overflow.
- Essential copy is visible and selectable.
- Original font roles remain distinct.
- No text overlaps florals, maps, or controls.
- Maps remain usable.
- Animation transforms do not displace responsive layout wrappers.
- Section order remains unchanged.
- English and Arabic routes resolve correctly.

Deployment verification:

- Confirm the GitHub Actions run succeeds after a push to `main`.
- Confirm both public URLs return successfully.
- Confirm assets load using project-site relative paths.
- Confirm the deployed RSVP endpoint works without exposing private information.

## 13. Risks and decisions to revisit

- **Exact source fonts:** Some Canva text may not expose its original font name. Match visually and document substitutions.
- **Arabic wording:** The implemented translation is complete; family-preferred phrasing or spelling can still be edited without structural changes.
- **RSVP privacy:** Guest data must stay outside the public repository.
- **Spam:** A public form endpoint can attract spam; the custom form includes a honeypot, while provider-side limits and filtering should also be monitored.
- **External maps:** Embedded maps depend on Google and may display their own language/UI depending on the guest's environment.
- **Fonts:** The same Google Fonts families and weights are now self-hosted, with licenses, to avoid the external font request chain.
- **Historical CSS:** The source includes many override generations. Consolidate only after active behavior is identified.
- **Asset extraction:** Do not discard a small fragment merely because of its dimensions until it is confirmed to be text or an obsolete layer.
- **Performance:** Extracting and deduplicating assets should reduce the current 13 MB monolithic document and allow browser caching.

## 14. Content facts currently encoded in the source

- Couple: Youssef George and Lara Sameeh.
- Event date: 1 October 2026.
- Countdown target: 1 October 2026 at 7:00 PM, Cairo time (`+03:00`).
- Ceremony: St. Anthony Church, Zahraa El Maadi.
- Ceremony time shown: 7 PM.
- Reception: Revana Wedding Venue.
- Separate arrival directions are shown for boat and car.
- Celebration is adults only.
- Dress-code guidance is separated for ladies and men.
- RSVP artwork currently requests submission by 15 September 2026.
- Existing fallback Google Form URL: `https://forms.gle/daqf2ug4TypLtKwH8`.

Verify these facts with the couple before final publication, particularly official venue naming, event time, and RSVP deadline.

## 15. Definition of done

The project is complete when:

- The English and Arabic routes are publicly accessible at the planned URLs.
- Every push to `main` redeploys through GitHub Actions.
- All meaningful copy is live, sharp, selectable text.
- The varied fonts and typographic roles from the original image text are visibly preserved.
- The nine scenes retain their order, artwork, and animation character.
- Mobile portrait, mobile landscape, tablet, and desktop layouts are usable and intentional.
- RSVP submissions capture name, attendance, and optional message privately.
- The site remains simple enough to edit directly through HTML, CSS, JavaScript, and organized assets.

## 16. Loading and artwork refinement — 2026-09-03

Implemented a performance pass without changing scene geometry, font roles,
choreography, durations, or scene order:

- Opening artwork has priority. Later images use deferred sources, warmed about
  60% of a viewport ahead, after the opening is ready.
- Scene entrances wait for images and transparency masks to decode (with a
  five-second ceiling so network failure cannot hide usable copy indefinitely).
- Maps and the RSVP paper background no longer download on initial entry.
- 56 PNG delivery copies use lossless WebP; oversized wax-seal and envelope files
  are resized for their display sizes. Originals remain as fallbacks. This step
  reduced those delivery copies from 5,477,662 to 3,027,336 bytes (45%).
- Fonts are local WOFF2 files with the same families, styles, weights, and Unicode
  subsets. Their OFL licenses are included. No third-party font script was added.
- 16 artwork groups have selected generative replacements, reused across matching
  layers. The user approved small detail changes. Original alpha silhouettes keep
  cutouts clear; see `assets/images/enhanced/manifest.json` for exact prompts and
  mappings. Original photographs and animated GIFs are unchanged. Not every
  decorative asset was regenerated.
- All originals and selected generation sources are retained for editing and
  rollback; archive size is not the same as what a visitor downloads.

Verification: English and Arabic at 320×568, 402×718, 844×390, and 1440×900;
all nine scenes entered, no broken images or horizontal document overflow, and
all three maps received their sources on approach. Also checked JavaScript-off
artwork, reduced-motion/direct RSVP navigation, and forced replacement-image
failure falling back to originals. No real RSVP submission was sent in this pass.

Indicative mobile Lighthouse comparison: prior public site 6,472,022 transferred
bytes / 110 requests / FCP 5.5s / LCP 9.6s / score 58; optimized local preview
1,888,934 bytes / 52 requests / FCP 2.4s / LCP 8.6s / score 71. Different hosting
conditions mean this is not a controlled speed guarantee. Intentional decorative
entrance delays still influence LCP. Asset sizes and deferred initial map loading
are independently verified. Recheck on the deployed site and a real phone.

### Follow-up: embedded transparency and floral clarity

The screenshot exposed a real integration defect: classless dress-code images did
not receive their CSS masks, so their white canvases obscured the floral artwork.
Applying the old masks also clipped the regenerated figures because the outlines
were no longer identical. The couple approved standard image processing to fix it.

- All 18 selected regenerated artwork groups now export actual transparent
  `*-alpha.webp` files. No CSS mask or separate mask request is required.
- Clothing and regenerated florals use high-resolution background extraction;
  native generated alpha is preserved where available. Sensitive soft-edged
  artwork retains the original alpha, baked into the image. Original photo and
  paper backgrounds remain intentional, not removed indiscriminately.
- The still-original 106px-wide dress-code border and 165px-wide corner were
  regenerated; their exports are now 424×2656 and 825×1835 respectively. These
  assets are also shared by the car-reception scene. The men's and women's
  delivery images are now 1750×580 and 1305×1630.
- Export builds verify real transparency. High-density mobile (402×718 at 3×)
  and desktop (1440×1000 at 2×) checks cover both languages, with no CSS masks,
  missing dress-code images, or horizontal overflow. A contrasting-background
  inspection verifies that white shirts remain intact while background is clear.
- The historical source images and legacy exports remain available for rollback.
  Animation CSS, fonts, scene order, and layout coordinates are unchanged.

### Rollback to original artwork — current decision

The couple rejected the appearance of generated artwork. Both routes now use only
original assets, delivered through the existing lossless WebP optimization pipeline.
All generated replacements, their masks/exports, and the scripts that linked them
were removed from the active project; they remain recoverable in Git history.
The unchanged original images remain the visual source of truth.

Local fonts, image decoding before entrances, deferred images/maps, transparency,
RSVP, layouts, and animation choreography are retained. No sharpening, upscaling,
or synthesized detail is applied in this rollback. Tiny source images retain their
original resolution limits. Future enhancements must be code-based, non-generative,
and preserve the original content; never reintroduce the generated alternatives.

Rollback verification: all 52 non-resized PNG delivery copies compare pixel-for-pixel
equal to their originals; the two intentional delivery-size exceptions remain the
seal and envelope. Both routes passed all-nine-scene checks at 402×718, 844×390,
and 1440×1000, with no missing images, generated-image requests, or horizontal overflow.

### Code-only refinement — 2026-09-04

Implemented the requested non-generative enhancement using original PNG inputs:
43 small artwork files now have 2× Mitchell-resampled, lightly sharpened variants.
Only RGB is sharpened; original alpha is resampled and encoded losslessly. All 43
alpha outputs matched the same resize without sharpening byte-for-byte. There is
no AI model, new drawing, invented detail, recoloring, or background extraction.

Native-size lossless originals remain the 1× `src`/`srcset` option. The browser may
select 2× variants for high-density screens. Offscreen variants use `data-srcset`
and load only with the approaching scene. Image-error fallback clears `srcset`
before restoring the original PNG. Layout coordinates, fonts and animations remain
unchanged; GIFs, photos, paper and seals were excluded from sharpening.

The selected set grows from 2,788,190 to 4,070,704 bytes only when all 2× variants
are fetched, spread across scrolling scenes, rather than at startup. Each variant
has a size budget. The visual gain is modest edge definition/smoother scaling,
not recovered detail. Settings and provenance are in `scripts/refine-original-art.mjs`
and `assets/images/refined/manifest.json`. Run
`node scripts/link-original-art.mjs --original-only` to disable variants without
deleting original or refined files.

Checks: all nine scenes load in both languages at 1× and 3× pixel density, with no
broken images or horizontal overflow. Fresh 1× sessions request zero refined files;
3× sessions select all 43 as their scenes approach. Initial maps remain deferred.
Forced refined-image failures correctly clear `srcset` and recover original PNGs.
Landscape (844×390) and desktop (1440×1000) checks also passed in both languages:
all nine scenes, no broken images, and no horizontal overflow.
