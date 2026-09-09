# Engagement Website — Preserved Source Baseline

Captured: 2026-08-30  
Reference viewport: 390 × 844 CSS pixels  
Source file: `../lara_youssef_engagement_v25.html`  
Source SHA-256: `d52e5e9bff033f26fffb1e7d116594a5da424188ac25b7d3bc582a78ee4f434e`

This document is the comparison baseline for rebuilding the invitation. It records the source structure, visual sequence, text, typography roles, maps, links, and active animation behavior before any refactor.

The original source file must remain unchanged until the rebuilt English and Arabic routes have been compared against this package.

## 1. Capture method

The accepted baseline was captured with a scripted Playwright browser session, not manual coordinate scrolling.

- Each scene was targeted by its stable selector (`.scene-0` through `.scene-8`).
- The browser viewport was explicitly set before capture.
- Each scene was scrolled into view by Playwright.
- Scene entrance animations were given deterministic settling times before capture.
- The closed-envelope state was captured in a fresh page load at an early animation timestamp.
- The open-envelope state was captured after the full envelope sequence settled.
- Desktop and mobile-landscape captures record the source's fixed-width behavior.
- Every saved image was opened and visually inspected after capture.

The source uses external Google Maps and Google Fonts. Map labels and countdown values may differ on a later capture even when the implementation is unchanged.

## 2. Accepted screenshot set

| # | State | Dimensions | Evidence |
|---|---|---:|---|
| 1 | Opening, settled | 390 × 597 | [01-opening.png](../output/playwright/baseline/01-opening.png) |
| 2 | Invitation, closed envelope | 390 × 595 | [02-invitation-closed.png](../output/playwright/baseline/02-invitation-closed.png) |
| 3 | Invitation, open envelope | 390 × 597 | [03-invitation-open.png](../output/playwright/baseline/03-invitation-open.png) |
| 4 | Celebration | 390 × 597 | [04-celebration.png](../output/playwright/baseline/04-celebration.png) |
| 5 | Date and countdown | 390 × 597 | [05-date.png](../output/playwright/baseline/05-date.png) |
| 6 | Ceremony | 390 × 598 | [06-ceremony.png](../output/playwright/baseline/06-ceremony.png) |
| 7 | Reception by boat | 390 × 597 | [07-reception-boat.png](../output/playwright/baseline/07-reception-boat.png) |
| 8 | Reception by car | 390 × 597 | [08-reception-car.png](../output/playwright/baseline/08-reception-car.png) |
| 9 | Dress code | 390 × 597 | [09-dress-code.png](../output/playwright/baseline/09-dress-code.png) |
| 10 | RSVP | 390 × 597 | [10-rsvp.png](../output/playwright/baseline/10-rsvp.png) |
| 11 | Current desktop viewport | 1280 × 720 | [11-desktop-viewport.png](../output/playwright/baseline/11-desktop-viewport.png) |
| 12 | Current mobile-landscape viewport | 844 × 390 | [12-landscape-viewport.png](../output/playwright/baseline/12-landscape-viewport.png) |

### Capture hashes

```text
d4a1253bf37392eadc8359ceeb91e79df80d135fa7a9d9e1c5e17bcb4afa78a9  01-opening.png
526f05b28a61ddba61644d6d50a02d769590a363e89567b5787230c753f74afa  02-invitation-closed.png
a1c30dda8ded317b8d2519c49fd628e515b5c49f38eadc7013eb095e897b14aa  03-invitation-open.png
befacb6cc1fc7d7ed140608db5a6c0b7916ef1945ab380b6b9814d8a15874639  04-celebration.png
bab3f60bf9caf1dfc6af445acf470092abb21df2945f241a4a69daa0560fa9f7  05-date.png
9bef4963f04d2450c67b7ae822cdda9d5efc2a062d1c71b0ec63970e9801e36b  06-ceremony.png
4165f8068c842dd26c0e6968d8d868031f040eaae757c66d87a2e33ed878132d  07-reception-boat.png
0b04df6a2a87f6f5b7e42660f161f72a21d2ccf1a2a1c38a699ebba483b53f58  08-reception-car.png
bda440c4930b4b479ef352bcd44114f0980717bb73db053063b48c017b5a81ad  09-dress-code.png
479d6ccfd690f0e3913ebbca225f8dc0a0bffc314061cdae63acfb536891b00a  10-rsvp.png
67982a0c3b483bdcbbfbc8ae16121dd5aae8c26aa74128cad6c7fc61f6dfcc8f  11-desktop-viewport.png
02ff152e0633c1ddb789d9fde1ae41605d3ce6077a348db0e9c0fc7ce7b6c4cb  12-landscape-viewport.png
```

## 3. Global source behavior

- Document language: English (`lang="en"`).
- Page title: `Youssef & Lara — Engagement`.
- Outer background: `#eee9e5`.
- Site background: white.
- Source site width: `min(100vw, 502.1245px)`.
- Source scene ratio: `502.1245 / 767.625`.
- Source scene height at 390 px wide: approximately 596.21 px.
- Scene count: 9.
- Image element count: 614.
- Data-root image count: 604.
- Embedded iframe count: 3.
- Explicit HTML anchor count: 1.

The large image count is real but does **not** mean the page contains 614 conventional photos. The exported design splits lettering, decorative shapes, people, plants, and other artwork into hundreds of small transparent image fragments; the car and RSVP scenes alone contain 132 and 133 image elements. Most fragments become visible as their scene plays. Some animation layers start at zero opacity, and the invitation contains mutually timed closed/open envelope layers, but the count is primarily export fragmentation rather than a hidden image library.

- Horizontal overflow is suppressed.
- Smooth scrolling is enabled unless reduced motion is requested.
- The desktop-only scroll hint hides after the user scrolls more than 100 px.
- At widths up to 502.1245 px, the scroll hint is not displayed.

### Animation activation

- JavaScript adds a `motion` class to the document root.
- An `IntersectionObserver` adds `play` to a scene once it intersects.
- Observer threshold: `0.18`.
- Observer root margin: `8% 0px -8% 0px`.
- A scene is unobserved after it receives `play`; entrances do not replay on normal scrolling.
- The first scene is explicitly played on the next animation frame.
- General animated elements start hidden until their scene receives `play`.

### General entrance timing

- Duration: `0.72s`.
- Easing: `cubic-bezier(0.2, 0.78, 0.2, 1)`.
- Fill mode: `both`.
- Most later scenes cycle delays from `0.050s` through `0.645s` in `0.035s` increments.
- General animation classes: `fade`, `fade-up`, `from-left`, `from-right`, `from-top`, `from-bottom`, `scale-in`, `pop`, `collage-left`, `collage-right`, `hero-rise`, and `hero-pop`.

### Reduced motion

The source has a `prefers-reduced-motion: reduce` branch that:

- Disables smooth scrolling.
- Forces normal scene elements visible.
- Removes general entrance animation and transforms.
- Stops bird movement.
- Shows the open-envelope composition without its normal sequence.

Preserve a functionally equivalent fallback.

## 4. Scene-by-scene baseline

### Scene 1 — Opening

Selector: `.scene-0`  
Region label: `Opening`  
Images: 19 total; 13 data-root images plus 6 hummingbirds.

Visible content:

- Dense watercolor floral frame on all sides.
- Six hummingbirds oriented toward the center oval.
- Curved text: `WE'RE GETTING ENGAGED`.
- Central names: `Youssef` and `Lara`.
- Pink ampersand and heart accents.
- Pink double-line oval.
- Nile, palm trees, mountains, and sailboat artwork at the bottom.

Motion inventory:

- `from-top`: 1.
- `from-left`: 2.
- `from-right`: 1.
- `from-bottom`: 1.
- `hero-rise`: 4.
- `hero-pop`: 3.
- Long boat motion: 1.
- Continuous bird motion: 6.

Opening-specific delays range from `0s` to `1.04s`.

Boat contract:

- Animation: `boatLeft`.
- Duration: `5.4s`.
- Delay: `1.04s`.
- Easing: `cubic-bezier(0.28, 0.05, 0.16, 1)`.
- Fill: `forwards`.
- Perceived motion: the boat enters from the right side of its anchor and travels left across the Nile artwork with very slight vertical and rotational variation.

Bird contract:

- Entrance: `birdEnter`, `0.58s`.
- Loop: `birdOrbitV15`, approximately `3.5s–3.9s` depending on the bird.
- First bird reference delay: `0.1s`; orbit begins at `0.68s`.
- Loop easing: `ease-in-out`.
- Loop count: infinite.
- Left-side birds are mirrored to face right; right-side birds face left.

General health: strong visual signature and motion; essential text is rasterized and absent from the accessibility tree.

### Scene 2 — Invitation envelope

Selector: `.scene-1.envelope-scene`  
Region label: `Invitation`  
Images: 20 total; 16 data-root images plus envelope paper, envelope text, seal, and orange couple-title artwork.

Closed state:

- Cream envelope rotated slightly counter-clockwise.
- Handwritten `You're Invited!` lettering centered above the wax seal.
- Red/burgundy circular wax seal.
- Floral framing remains visible behind the envelope.

Open state:

- Orange `Youssef & Lara` heading.
- Pink lace invitation card rotated counter-clockwise.
- Two black-and-white photographs.
- White calla lilies.
- Pink/orange bouquet with trailing greenery.
- Open cream envelope base.

Live card copy currently present in the DOM:

```text
Youssef George
and
Lara Sameeh
Request the pleasure of your
presence at their Engagement
01.10.2026
St. Anthony Church, Zahraa El Maadi
Revana Wedding Venue
```

Final computed envelope timing contract:

| Part | Active animation | Duration | Delay | Easing |
|---|---|---:|---:|---|
| Paper entrance | `finalEnvIn2` | 0.15s | 0s | ease-out |
| Paper opens/fades | `finalPaperOpen2` | 0.34s | 1.42s | cubic-bezier(0.28, 0.05, 0.18, 1) |
| Envelope lettering entrance | `finalEnvIn2` | 0.15s | 0s | ease-out |
| Envelope lettering exits | `finalTextOpen2` | 0.26s | 1.42s | ease-in |
| Seal entrance | `finalSealIn2` | 0.15s | 0.02s | cubic-bezier(0.2, 0.82, 0.2, 1) |
| Seal exit | `finalSealOut2` | 0.24s | 1.76s | ease-in |
| Open envelope anchor | `finalOpenAnchor2` | 0.38s | 1.60s | cubic-bezier(0.18, 0.84, 0.22, 1) |
| Back flap | `finalFlapOpen2` | 0.34s | 1.62s | cubic-bezier(0.16, 0.88, 0.22, 1) |
| Envelope front | `finalFrontIn2` | 0.24s | 1.73s | ease-out |
| Photos rise | `finalPhotosRise2` | 0.33s | 1.77s | cubic-bezier(0.16, 0.9, 0.22, 1) |
| Flowers rise | `finalPhotosRise2` | 0.33s | 1.80s | cubic-bezier(0.16, 0.9, 0.22, 1) |
| Card rises | `finalCardRise2` | 0.39s | 1.83s | cubic-bezier(0.16, 0.9, 0.22, 1) |
| Orange title enters | `exactOrangeInV23` | 0.45s | 1.92s | ease-out |

General health: signature interaction is preserved by two accepted states and exact active timings. Card text is live but very small; orange heading and envelope lettering remain rasterized.

### Scene 3 — Celebration

Selector: `.scene-2`  
Region label: `Celebration`  
Images: 69.

Source copy:

```text
The Celebration

A NIGHT OUT FOR THE GROWN-UPS,
SWEET DREAMS FOR THE LITTLE
ONES.

BABYSITTERS ON DUTY

DANCING SHOES ON

ADULTS ONLY, PLEASE!
```

Visual content: floral frame and sleeping-child illustration.

Motion inventory:

- `fade-up`: 3.
- `from-left`: 2.
- `from-right`: 2.
- `pop`: 61.
- `scale-in`: 1.

General health: composition is clear in portrait; all meaningful copy is rasterized.

### Scene 4 — Date and countdown

Selector: `.scene-3`  
Region label: `Date`  
Images: 70.

Source copy and labels:

```text
Date
OCTOBER 2026
SUN MON TUE WED THU FRI SAT
OCTOBER 1ST 2026
DAYS HOURS MINUTES SECONDS
```

Calendar behavior:

- October 2026 calendar is displayed.
- October 1 is circled.

Countdown behavior:

- Accessible label: `Countdown to the engagement`.
- Target: `2026-10-01T19:00:00+03:00`.
- Updates every 1000 ms.
- Values are clamped at zero after the target time.
- Screenshot values are time-dependent and are not part of the visual fidelity contract.

Motion inventory:

- `fade`: 1.
- `fade-up`: 1.
- `from-left`: 2.
- `from-right`: 2.
- `pop`: 64.

General health: hierarchy is strong; countdown is live text, while the heading, calendar, and date label are rasterized.

### Scene 5 — Ceremony

Selector: `.scene-4`  
Region label: `Ceremony`  
Images: 53.  
Map iframes: 1.

Source copy:

```text
Ceremony
ST. ANTHONY CHURCH, ZAHRAA EL MAADI
7 PM, MAIN CHURCH
```

Map:

- Title: `Ceremony church — Google Map`.
- Query: `The Great St. Antony Church, Zahraa El Maadi, Cairo, Egypt`.
- Source: `https://www.google.com/maps?q=The%20Great%20St.%20Antony%20Church%2C%20Zahraa%20El%20Maadi%2C%20Cairo%2C%20Egypt&output=embed`.
- Position: left `22.30%`, top `32.80%`, width `62.35%`, height `30.85%`.

Motion inventory:

- `fade-up`: 1.
- `from-left`: 2.
- `from-right`: 2.
- `pop`: 47.
- `scale-in`: 1.

General health: map and visual hierarchy are useful; source copy is image-based. Google controls and labels are external and may vary.

### Scene 6 — Reception by boat

Selector: `.scene-5`  
Region label: `Reception by boat`  
Images: 89.  
Map iframes: 1.

Source copy:

```text
Reception
REVANA WEDDING VENUE
KINDLY FOLLOW THIS LOCATION IF
YOU WISH TO ARRIVE TO THE VENUE
BY BOAT
```

Map:

- Title: `Reception by boat — Google Map`.
- Query: `Revana wedding venue by boat, Maadi Al Khabiri Ash Sharqeyah, Maadi, Egypt`.
- Source: `https://www.google.com/maps?q=Revana%20wedding%20venue%20by%20boat%2C%20Maadi%20Al%20Khabiri%20Ash%20Sharqeyah%2C%20Maadi%2C%20Egypt&output=embed`.
- Position: left `19.72%`, top `20.05%`, width `60.76%`, height `34.00%`.

Visual content: floral sides and the Nile/palm-tree landscape at the bottom.

Motion inventory:

- `from-bottom`: 1.
- `from-left`: 1.
- `from-right`: 1.
- `from-top`: 9.
- `pop`: 75.
- `scale-in`: 2.

General health: route distinction is visually clear; almost all text is split into raster fragments.

### Scene 7 — Reception by car

Selector: `.scene-6`  
Region label: `Reception by car`  
Images: 132.  
Map iframes: 1.

Source copy:

```text
Reception
REVANA WEDDING VENUE
KINDLY FOLLOW THIS LOCATION IF
YOU WISH TO ARRIVE TO THE VENUE
BY CAR
```

Map:

- Title: `Reception by car — Google Map`.
- Query: `Revana Wedding on the Nile, Manil Shihah, Abu El Numrus, Giza Governorate, Egypt`.
- Source: `https://www.google.com/maps?q=Revana%20Wedding%20on%20the%20Nile%2C%20Manil%20Shihah%2C%20Abu%20El%20Numrus%2C%20Giza%20Governorate%2C%20Egypt&output=embed`.
- Position: left `19.72%`, top `25.25%`, width `62.55%`, height `30.85%`.

Visual content: floral frame, dotted route, airplane marker, and pink car.

Motion inventory:

- `from-bottom`: 7.
- `from-left`: 2.
- `from-right`: 2.
- `from-top`: 2.
- `pop`: 118.
- `scale-in`: 1.

General health: route distinction is visually clear; this scene has the largest concentration of glyph-like image fragments.

### Scene 8 — Dress code

Selector: `.scene-7`  
Region label: `Dress code`  
Images: 29.

Source copy:

```text
Dress Code
FOR LADIES
FOR MEN
```

Visual content:

- Floral frame.
- Large group of colorful formal dresses.
- Row of men in light and colorful suits.

Motion inventory:

- `from-left`: 1.
- `from-right`: 2.
- `from-top`: 3.
- `pop`: 21.
- `scale-in`: 2.

General health: visual guidance is immediately understandable; labels are rasterized.

### Scene 9 — RSVP

Selector: `.scene-8`  
Region label: `RSVP`  
Images: 133.  
Links: 1.

Source copy:

```text
RSVP

Let us know you're
coming!

WE'RE SO EXCITED TO CELEBRATE
THIS SPECIAL MOMENT WITH YOU!

KINDLY SUBMIT YOUR RSVP BY
[15.09.2026].

WITH LOVE,
Youssef & Lara

RSVP
```

Current interaction:

- An invisible absolute-positioned anchor covers the visual RSVP button.
- Accessible label: `Open RSVP form`.
- URL: `https://forms.gle/daqf2ug4TypLtKwH8`.
- Opens in a new tab.
- Focus-visible style: 3 px coral translucent outline with 2 px offset.

Motion inventory:

- `fade-up`: 3.
- `from-left`: 2.
- `from-right`: 2.
- `pop`: 124.
- `scale-in`: 2.

General health: the invitation to respond is clear visually, but the visible button is an image and the actual control is an invisible hotspot.

## 5. Typography map

This map is a preservation contract. Rasterized text must be converted to live text without collapsing distinct source typography into one generic family.

| Role | Source examples | Source characteristics | Current known implementation | Preservation requirement |
|---|---|---|---|---|
| Opening strapline | `WE'RE GETTING ENGAGED` | Small uppercase serif following an arc; moderate tracking | Raster image | Preserve serif, arc, tracking, and size relationship to names |
| Opening couple names | `Youssef`, `Lara` | Formal dark script with pronounced capitals and long swashes | Raster image | Preserve as a dedicated hero-name script; do not reuse body or section-heading font automatically |
| Opening ampersand/accent | `&` and pink ornaments | Pink decorative display treatment | Raster image | Preserve color and distinct accent role |
| Envelope message | `You're Invited!` | Loose black handwritten calligraphy, stacked and slightly irregular | Raster image | Use a distinct handwritten/calligraphic role; do not replace with the formal couple-name font without comparison |
| Open-scene orange names | `Youssef & Lara` | Warm orange connected script, large and informal | Raster image (`exact-orange-title`) | Preserve orange color, loose connected rhythm, and difference from the card lettering |
| Invitation-card names | Full couple names and `and` | Delicate high-contrast script | Live `Ballet`, cursive fallbacks | Preserve `Ballet` role unless side-by-side comparison identifies a closer licensed web font |
| Invitation-card date | `01.10.2026` | Matching script display | Live `Ballet` | Keep associated with the card-name display family |
| Invitation-card formal copy | Request, church, and venue | Fine formal serif, small size | Live `Cormorant Garamond`, Georgia fallback | Preserve serif character and improve legibility without changing its formal role |
| Main scene headings | Celebration, Date, Ceremony, Reception, Dress Code | Black high-contrast calligraphic display with sweeping capitals | Raster fragments | Preserve as a dedicated section-heading family; visually appears related across these scenes |
| RSVP heading | `RSVP` | Thin monoline decorative lettering, more geometric and restrained than other headings | Raster fragments | Preserve separately from the main calligraphic section-heading family |
| Informational body | Adults-only note, directions, venues, ceremony details | Clean uppercase sans-serif; centered; moderate tracking | Raster fragments | Use a clear live sans-serif with matching weight, case, line breaks, and tracking |
| Bold emphasis | `ADULTS ONLY, PLEASE!` | Heavy uppercase sans-serif | Raster fragments | Preserve strong weight contrast within the informational family |
| Calendar details | Month, weekdays, dates | Compact clean sans-serif | Raster fragments | Keep highly legible and visually quieter than the Date heading |
| Countdown numerals | Days/hours/minutes/seconds | Heavy condensed black numerals | Live `Impact`, `Arial Narrow`, Arial fallback; weight 900 | Preserve condensed display character and colon rhythm |
| Countdown labels | Unit names | Very small bold uppercase sans-serif | Live Arial-family styling | Preserve unit hierarchy and tracking while keeping readable minimum size |
| RSVP personal note | `Let us know you're coming!` | Casual black handwritten script distinct from large headings | Raster fragments | Preserve as its own friendly handwritten role |
| RSVP button | `RSVP` | Bold coral/pink uppercase sans-serif | Raster fragment with invisible link overlay | Recreate as live button text using matching weight and color |
| Map UI | Google Maps controls and labels | External Google Maps typography | Rendered by iframe | Do not attempt to restyle; only preserve iframe placement and title |

### Fonts currently requested by the source

- `Ballet` from Google Fonts.
- `Cormorant Garamond` weights 400 and 500 from Google Fonts.
- `Great Vibes` from Google Fonts; earlier invitation rules reference it, but final active invitation names/date use `Ballet`.
- `Arial`, `Helvetica`, and generic sans-serif fallbacks.
- `Impact` and `Arial Narrow` for countdown numerals.
- `Georgia` as the invitation serif fallback.
- `Brush Script MT` and `Segoe Script` remain in superseded fallback declarations.

The exact Canva fonts behind rasterized headings and body fragments are not encoded in the DOM. During live-text conversion, identify or visually match each role from the accepted screenshots and record any substitution in this table.

## 6. Accessibility and interaction baseline

Confirmed strengths:

- All nine scenes are exposed as labeled regions.
- The date countdown has an accessible label and live text.
- The invitation card's main copy is live text.
- Map iframes have descriptive titles.
- The RSVP hotspot has an accessible label and a visible focus outline when keyboard-focused.
- Reduced-motion behavior exists.

Confirmed risks:

- Most essential copy exists only as raster fragments and is absent from the accessibility tree.
- Decorative and meaningful art are not consistently distinguished through alternative text.
- The RSVP visual button is not the actual control; an invisible overlay receives interaction.
- Very small invitation text is difficult to read even when live.
- Fixed portrait scenes do not reflow for landscape or desktop.
- The browser console reports a missing local `favicon.ico`; no other source-page error was found during the accepted captures.

Screenshot evidence cannot establish full keyboard, screen-reader, zoom, contrast, or WCAG compliance. Those require implementation-level checks later.

## 7. Fixed-width behavior to preserve as evidence, not as a target

The desktop and landscape captures intentionally document current weaknesses:

- At 1280 × 720, the site remains approximately 502 px wide and centered, with large beige margins.
- At 844 × 390, the page still presents the top of a tall portrait scene rather than reflowing horizontally.
- The source scroll hint appears on both wide layouts.

The responsive rebuild should preserve the artwork and hierarchy, not these fixed-width limitations.

## 8. Comparison rules for later tasks

For every rebuilt scene:

1. Use the matching numbered screenshot from this package.
2. Render the rebuilt scene at the same viewport and state.
3. Compare artwork, typography, spacing, color, cropping, layering, and visible animation end state.
4. For the envelope, compare both the closed and open states and retain the timing contract above.
5. Confirm every source text item exists as live text while retaining its mapped typography role.
6. Confirm responsive layout changes do not reorder scenes or overwrite animation transforms.
7. Treat Google Map label differences and countdown-number differences as dynamic external/time-dependent content.

Task 1 is complete when this document, all accepted screenshots, the source checksum, and the typography map are present and the original HTML checksum remains unchanged.
