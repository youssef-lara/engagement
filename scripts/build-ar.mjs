/**
 * Generates ar/index.html from index.html.
 *
 * The Arabic route is the same Canva composition as the English one: identical
 * artwork, identical layer geometry, identical data-root values (several CSS
 * rules key off them). Only the lettering changes, because every English word on
 * the page is either traced outline artwork or live text in a Latin-only font
 * subset.
 *
 * The composition is deliberately NOT mirrored. The map snapshots, the calendar
 * grid and the dress/suit photographs all have text and imagery baked into them,
 * so flipping the page would flip those too. Instead the artwork stays put and
 * the text is laid out right-to-left inside it. Where the source has an icon
 * leading a line, the Arabic row puts that icon on the right, which is the side
 * a reader of Arabic starts from.
 *
 * Every substitution asserts its own match count, so if index.html is edited in
 * a way that moves one of these slots the build fails loudly instead of quietly
 * shipping an English string on the Arabic page.
 *
 * Usage: node scripts/build-ar.mjs
 */

import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const SRC = path.join(ROOT, 'index.html');
const OUT = path.join(ROOT, 'ar', 'index.html');
const COPY = path.join(ROOT, 'scripts', 'ar-copy.json');

/* Copy is hand-edited, so stray leading or trailing spaces are normalised on the
   way in. A centred line is laid out with `white-space: pre`-like nowrap, so an
   invisible leading space would push the words off centre by half its width. */
const trimDeep = (value) =>
  typeof value === 'string' ? value.replace(/\s+/g, ' ').trim()
  : Array.isArray(value) ? value.map(trimDeep)
  : value && typeof value === 'object'
    ? Object.fromEntries(Object.entries(value).map(([k, v]) => [k, trimDeep(v)]))
    : value;

const copy = trimDeep(JSON.parse(fs.readFileSync(COPY, 'utf8')));
let html = fs.readFileSync(SRC, 'utf8');

/* The scene box is 502.1245 x 767.625, so one percent of its height is this many
   cqw. Percentages taken from the source geometry convert straight across. */
const VH_TO_CQW = 767.625 / 502.1245 / 100;
const pctHeightToCqw = (pct) => +(pct * VH_TO_CQW * 100).toFixed(4);

const applied = [];
let failures = 0;

/**
 * Replace exactly `expected` occurrences of `pattern`, or record a failure.
 * The replacement is a plain string, so `$1` and `$2` refer to capture groups.
 * Nothing substituted in here contains a literal dollar sign, and the build
 * asserts that none survives into the output.
 */
function sub(label, pattern, replacement, expected = 1) {
  const flags = pattern.flags.includes('g') ? pattern.flags : pattern.flags + 'g';
  const rx = new RegExp(pattern.source, flags);
  const hits = html.match(rx);
  const count = hits ? hits.length : 0;
  if (count !== expected) {
    console.error(`  FAIL  ${label}: matched ${count}, expected ${expected}`);
    failures++;
    return;
  }
  html = html.replace(rx, replacement);
  applied.push(label);
}

/** Match a whole self-closing <img> by its data-root. */
const imgByRoot = (root) => new RegExp(`<img\\b[^>]*\\bdata-root="${root}"[^>]*/>`);
/** Match a whole <span class="... letters"> element by its data-letters key. */
const lettersSpan = (key) =>
  new RegExp(`<span[^>]*\\bdata-letters="${key}"[^>]*>[\\s\\S]*?</span\\s*>`);

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/* ------------------------------------------------------------------ helpers */

/** A centred single line of Arabic lettering. */
function centredLine({ key, text, centerX, midY, font, boxW = 70, boxH = 5, delay, z, cls = 'ar-line' }) {
  const left = +(centerX - boxW / 2).toFixed(4);
  const top = +(midY - boxH / 2).toFixed(4);
  return (
    `<span\n            aria-hidden="true"\n            class="el pop ${cls}"\n` +
    `            data-ar="${key}"\n            style="\n` +
    `              left: ${left}%;\n              top: ${top}%;\n` +
    `              width: ${boxW}%;\n              height: ${boxH}%;\n` +
    `              font-size: ${font}cqw;\n` +
    `              justify-content: center;\n` +
    `              --delay: ${delay};\n              --z: ${z};\n            "\n` +
    `            >${esc(text)}</span\n          >`
  );
}

/** A script title / name set in the calligraphic face. */
function scriptTitle({ key, text, centerX, midY, font, boxW = 80, boxH = 14, delay, z, anim = 'fade-up', extra = '' }) {
  const left = +(centerX - boxW / 2).toFixed(4);
  const top = +(midY - boxH / 2).toFixed(4);
  return (
    `<span\n            aria-hidden="true"\n            class="el ${anim} ar-title"\n` +
    `            data-ar="${key}"\n            style="\n` +
    `              left: ${left}%;\n              top: ${top}%;\n` +
    `              width: ${boxW}%;\n              height: ${boxH}%;\n` +
    `              font-size: ${font}cqw;\n${extra}` +
    `              --delay: ${delay};\n              --z: ${z};\n            "\n` +
    `            >${esc(text)}</span\n          >`
  );
}

/* The two inline icons, copied from the source so the Arabic rows draw exactly
   the same marks. Square in the source, so they keep their aspect ratio here. */
const CALENDAR_ICON = `<svg
                aria-hidden="true"
                class="ar-icon ar-icon--calendar"
                focusable="false"
                viewBox="0 0 23 23"
              >
                <g fill="none" stroke="#000">
                  <rect x="1" y="3" width="21" height="19" rx="1.3" stroke-width="2" />
                  <path d="M1 6.9H22" stroke-width="1.9" />
                  <path
                    d="M5.5 0.85V4.4M11.2 0.85V4.4M16.9 0.85V4.4"
                    stroke-width="1.7"
                    stroke-linecap="round"
                  />
                </g>
                <g fill="#000">
                  <rect x="4.11" y="10.68" width="2.47" height="2.47" rx="0.45" />
                  <rect x="8.22" y="10.68" width="2.47" height="2.47" rx="0.45" />
                  <rect x="12.33" y="10.68" width="2.47" height="2.47" rx="0.45" />
                  <rect x="16.43" y="10.68" width="2.47" height="2.47" rx="0.45" />
                  <rect x="4.11" y="15.61" width="2.47" height="2.47" rx="0.45" />
                  <rect x="8.22" y="15.61" width="2.47" height="2.47" rx="0.45" />
                  <rect x="12.33" y="15.61" width="2.47" height="2.47" rx="0.45" />
                  <rect x="16.43" y="15.61" width="2.47" height="2.47" rx="0.45" />
                </g>
              </svg>`;

const CLOCK_ICON = `<svg
                aria-hidden="true"
                class="ar-icon ar-icon--clock"
                focusable="false"
                viewBox="0 0 21 21"
                fill="none"
                stroke="#000"
              >
                <circle cx="10.5" cy="10.5" r="9.5" stroke-width="2" />
                <path
                  d="M10.5 3.2V10.5L14.5 13.8"
                  stroke-width="1.6"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>`;

/* The church mark is three raster pieces (a body and two grey eaves) that only
   line up at fixed offsets. Tracing them failed before, so they are kept as
   artwork and re-nested inside a box of the group's own proportions, with each
   piece placed by the percentage it occupied in the source group. */
const CHURCH_ICON = `<span aria-hidden="true" class="ar-icon ar-icon--church">
                <img
                  alt=""
                  decoding="async"
                  loading="lazy"
                  src="assets/images/optimized/text-fragment-root-271-785c6081.webp"
                  style="left: 0%; top: 0%; width: 100%; height: 100%"
                /><img
                  alt=""
                  decoding="async"
                  loading="lazy"
                  src="assets/images/optimized/text-fragment-root-272-1c08c219.webp"
                  style="left: 69.176%; top: 52.239%; width: 24.545%; height: 20.907%"
                /><img
                  alt=""
                  decoding="async"
                  loading="lazy"
                  src="assets/images/optimized/text-fragment-root-273-7e0830db.webp"
                  style="left: 6.494%; top: 52.467%; width: 24.672%; height: 20.6%"
                />
              </span>`;

/* ------------------------------------------------------ Arabic calendar grid */

/* The source calendar is one raster with English weekday names and Latin
   numerals baked in, so the Arabic route rebuilds it as live text. The cell
   geometry is measured from the artwork itself: the seven weekday labels are all
   three letters, so their ink centres give a clean linear fit for the columns
   (centre_i = 4.1325 + 15.3539 i, within 0.19% at every column), and the six row
   centres come from the horizontal ink bands. Percentages are of the calendar
   box, which the artwork filled exactly.
   The hand-drawn ring around the first is the one part that is not type. It is
   lifted out of the artwork as its own layer, keeping every stroke, by taking all
   ink that is not a digit-shaped component. */
const CAL_SLOT = (n) => +(4.1325 + 15.3539 * n).toFixed(4);
/* An Arabic week reads right to left, so Sunday takes the rightmost column and
   Saturday the leftmost. This is the one place the composition is mirrored, and
   it is mirrored because it is type rather than artwork. */
const CAL_COL = (dayIndex) => CAL_SLOT(6 - dayIndex);
const CAL_ROW = [2.66, 24.12, 42.21, 60.67, 78.81, 97.3];
/* Measured size of the extracted ring, as a fraction of the calendar box. Its
   column follows the mirrored grid rather than the position it had in the
   English artwork. */
const CAL_RING = { width: 18.5884, height: 21.3956, top: 12.7542 };
/* 1 October 2026 is a Thursday. */
const CAL_FIRST_WEEKDAY = 4;
const CAL_DAYS_IN_MONTH = 31;
const CAL_RING_LEFT = +(CAL_COL(CAL_FIRST_WEEKDAY) - CAL_RING.width / 2).toFixed(4);

const toArabicDigits = (n) =>
  String(n).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[+d]);

function calendarMarkup() {
  const cells = [];
  copy.date.calendarDays.forEach((label, i) => {
    cells.push(
      `            <span class="ar-cal__day" style="left: ${CAL_COL(i)}%; top: ${CAL_ROW[0]}%"\n` +
      `              >${esc(label)}</span\n            >`
    );
  });
  for (let day = 1; day <= CAL_DAYS_IN_MONTH; day++) {
    const slot = CAL_FIRST_WEEKDAY + day - 1;
    const col = slot % 7;
    const row = Math.floor(slot / 7) + 1;
    cells.push(
      `            <span class="ar-cal__num" style="left: ${CAL_COL(col)}%; top: ${CAL_ROW[row]}%"\n` +
      `              >${toArabicDigits(day)}</span\n            >`
    );
  }
  const oval =
    `            <img\n              alt=""\n              class="ar-cal__ring"\n              decoding="async"\n              loading="lazy"\n` +
    `              src="assets/images/optimized/calendar-oval.webp"\n` +
    `              srcset="\n` +
    `                assets/images/optimized/calendar-oval.webp    1x,\n` +
    `                assets/images/optimized/calendar-oval-2x.webp 2x,\n` +
    `                assets/images/optimized/calendar-oval-3x.webp 3x\n` +
    `              "\n` +
    `              style="\n                left: ${CAL_RING_LEFT}%;\n                top: ${CAL_RING.top}%;\n` +
    `                width: ${CAL_RING.width}%;\n                height: ${CAL_RING.height}%;\n              "\n            />`;
  return (
    `<div\n            aria-hidden="true"\n            class="el pop ar-cal"\n            data-root="142"\n            data-calendar="grid"\n            style="\n` +
    `              left: 23.725391%;\n              top: 35.179938%;\n` +
    `              width: 52.945736%;\n              height: 20.20711%;\n` +
    `              --delay: 0.155s;\n              --z: 142;\n            "\n          >\n` +
    oval + '\n' + cells.join('\n') + `\n          </div>`
  );
}

/**
 * A row of [icon][text]. In DOM order the icon comes first; because the row is
 * right-to-left it lands on the right, where an Arabic line begins.
 * `align` is 'center' (row centred on centerX) or 'right' (row's right edge at
 * rightEdge), mirroring whichever way the source row was aligned.
 */
function iconRow({ key, text, icon, font, midY, boxH = 6, delay, z, align, centerX, rightEdge, boxW = 70 }) {
  const left = align === 'right'
    ? +(rightEdge - boxW).toFixed(4)
    : +(centerX - boxW / 2).toFixed(4);
  const justify = align === 'right' ? 'flex-start' : 'center';
  const top = +(midY - boxH / 2).toFixed(4);
  return (
    `<span\n            aria-hidden="true"\n            class="el pop ar-row"\n` +
    `            data-ar="${key}"\n            style="\n` +
    `              left: ${left}%;\n              top: ${top}%;\n` +
    `              width: ${boxW}%;\n              height: ${boxH}%;\n` +
    `              font-size: ${font}cqw;\n` +
    `              justify-content: ${justify};\n` +
    `              --delay: ${delay};\n              --z: ${z};\n            "\n` +
    `            >${icon}<span class="ar-row__text">${esc(text)}</span></span\n          >`
  );
}

/* ------------------------------------------------------------------- <head> */

sub('html element', /<html lang="en" dir="ltr">/, `<html lang="${copy.head.lang}" dir="${copy.head.dir}">`);

sub('title', /<title>Youssef &amp; Lara — Engagement<\/title>/, `<title>${esc(copy.head.title)}</title>`);

sub(
  'meta description',
  /<meta\n      name="description"\n      content="The engagement invitation for Youssef and Lara on October 1, 2026\."\n    \/>/,
  `<meta\n      name="description"\n      content="${esc(copy.head.description)}"\n    />`
);

sub('hreflang en', /<link rel="alternate" hreflang="en" href="\.\/" \/>/, '<link rel="alternate" hreflang="en" href="../" />');
sub('hreflang ar', /<link rel="alternate" hreflang="ar" href="\.\/ar\/" \/>/, '<link rel="alternate" hreflang="ar" href="./" />');
sub(
  'canonical',
  /<link rel="canonical" href="https:\/\/youssefg7\.github\.io\/engagement\/" \/>/,
  `<link rel="canonical" href="${copy.head.canonical}" />`
);

sub('og:locale', /<meta property="og:locale" content="en" \/>/, `<meta property="og:locale" content="${copy.head.ogLocale}" />`);
sub(
  'og:url',
  /<meta property="og:url" content="https:\/\/youssefg7\.github\.io\/engagement\/" \/>/,
  `<meta property="og:url" content="${copy.head.canonical}" />`
);
sub(
  'og:title',
  /<meta property="og:title" content="Youssef &amp; Lara are getting engaged" \/>/,
  `<meta property="og:title" content="${esc(copy.head.ogTitle)}" />`
);
sub(
  'og:description',
  /<meta\n      property="og:description"\n      content="1 October 2026 · St\. Anthony Church, Maadi, then Revana Wedding Venue\. Kindly reply by 15 September\."\n    \/>/,
  `<meta\n      property="og:description"\n      content="${esc(copy.head.ogDescription)}"\n    />`
);
sub(
  'og:image:alt',
  /<meta\n      property="og:image:alt"\n      content="Youssef and Lara written in script inside a pink oval frame, surrounded by watercolour flowers and hummingbirds"\n    \/>/,
  `<meta\n      property="og:image:alt"\n      content="${esc(copy.head.ogImageAlt)}"\n    />`
);
sub(
  'apple web app title',
  /<meta name="apple-mobile-web-app-title" content="Youssef &amp; Lara" \/>/,
  `<meta name="apple-mobile-web-app-title" content="${esc(copy.head.appleTitle)}" />`
);

/* Arabic faces and the RTL text layer load after the shared portrait CSS. */
sub(
  'stylesheets',
  /<link rel="stylesheet" href="assets\/css\/portrait-site\.css" \/>/,
  '<link rel="stylesheet" href="assets/css/portrait-site.css" />\n' +
  '    <link rel="stylesheet" href="assets/css/fonts-portrait-ar.css" />\n' +
  '    <link rel="stylesheet" href="assets/css/portrait-ar.css" />'
);

sub('body language', /<body data-language="en">/, '<body data-language="ar">');
sub('skip link', /<a class="skip-link" href="#main-content">Skip to invitation<\/a>/, `<a class="skip-link" href="#main-content">${esc(copy.skipLink)}</a>`);

/* --------------------------------------------------------------- scene 0 */

sub('scene label opening', /aria-label="Opening"/, `aria-label="${esc(copy.opening.sceneLabel)}"`);

/* The strapline arcs over the top of the oval, so it is set on a curved path
   rather than as a straight line. The box matches the source raster exactly. */
sub(
  'opening strapline',
  imgByRoot(5),
  `<svg
            aria-hidden="true"
            class="el hero-rise ar-strapline"
            data-root="5"
            focusable="false"
            viewBox="0 0 346 104"
            preserveAspectRatio="none"
            style="
              left: 37.288362%;
              top: 25.669695%;
              width: 31.931722%;
              height: 6.036489%;
              --delay: 0.32s;
              --z: 5;
            "
          >
            <path id="ar-strapline-curve" d="M 6 112 Q 173 -54 340 112" fill="none"></path>
            <text dy="0">
              <textPath href="#ar-strapline-curve" startOffset="50%" text-anchor="middle">${esc(copy.opening.strapline)}</textPath>
            </text>
          </svg>`
);

sub(
  'opening name youssef',
  imgByRoot(12),
  scriptTitle({
    key: 'youssef', text: copy.opening.youssef,
    centerX: 53.0102, midY: 38.1382, font: 11.4, boxW: 60, boxH: 15,
    delay: '0.47s', z: 12, anim: 'hero-rise',
  })
);

sub(
  'opening name lara',
  imgByRoot(4),
  scriptTitle({
    key: 'lara', text: copy.opening.lara,
    centerX: 52.0455, midY: 53.3314, font: 11.4, boxW: 60, boxH: 15,
    delay: '0.66s', z: 4, anim: 'hero-rise',
  })
);

/* The watercolour ampersand is a Latin mark; Arabic joins names with a waw. It
   keeps the artwork's own pink so the oval still reads as one piece. */
sub(
  'opening connector',
  imgByRoot(7),
  scriptTitle({
    key: 'connector', text: copy.opening.connector,
    centerX: 53.5770, midY: 45.1040, font: 7.6, boxW: 20, boxH: 7,
    delay: '0.58s', z: 7, anim: 'hero-pop', extra: '              color: #ee9fac;\n',
  })
);

sub(
  'opening hidden copy',
  /<div class="visually-hidden">\n            <h1>Youssef and Lara<\/h1>\n            <p>We’re getting engaged\.<\/p>\n          <\/div>/,
  `<div class="visually-hidden">\n            <h1>${esc(copy.opening.hiddenHeading)}</h1>\n            <p>${esc(copy.opening.hiddenBody)}</p>\n          </div>`
);

/* --------------------------------------------------------------- scene 1 */

sub('scene label invitation', /aria-label="Invitation"/, `aria-label="${esc(copy.invitation.sceneLabel)}"`);

sub('card youssef', /(\n              class="card-youssef"[\s\S]*?>\n              )Youssef George(\n)/, `$1${esc(copy.invitation.cardYoussef)}$2`);
sub('card and', /(\n              class="card-and-v25"[\s\S]*?>\n              )and(\n)/, `$1${esc(copy.invitation.cardAnd)}$2`);
sub('card lara', /(\n              class="card-lara"[\s\S]*?>\n              )Lara Sameeh(\n)/, `$1${esc(copy.invitation.cardLara)}$2`);
sub(
  'card request',
  /Request the pleasure<br \/>of your presence<br \/>at their Engagement/,
  copy.invitation.cardRequest.map(esc).join('<br />')
);
sub('card date', /(\n              class="card-date-v25"[\s\S]*?>\n              )01\.10\.2026(\n)/, `$1${esc(copy.invitation.cardDate)}$2`);
sub('card church', /(\n              class="card-church-v25"[\s\S]*?>\n              )St\. Anthony Church, Maadi(\n)/, `$1${esc(copy.invitation.cardChurch)}$2`);
sub('card venue', /(\n              class="card-venue-v25"[\s\S]*?>\n              )Revana Wedding Venue(\n)/, `$1${esc(copy.invitation.cardVenue)}$2`);

/* The source hides this live text and shows an orange raster of the same words.
   Arabic has no such raster, so portrait-ar.css flips it: the raster is hidden
   and this text is shown, reusing the animation the raster had. */
sub(
  'orange couple title',
  /<div class="orange-couple-title">\n            <div>Youssef &amp;<\/div>\n            <div>Lara<\/div>\n          <\/div>/,
  `<div class="orange-couple-title">\n            <div>${esc(copy.invitation.orangeTitle[0])}</div>\n            <div>${esc(copy.invitation.orangeTitle[1])}</div>\n          </div>`
);

/* The source raster of the same words is no longer shown, so it is dropped
   rather than downloaded and hidden. */
sub(
  'exact orange title removed',
  /\s*<img\n            alt=""\n            aria-hidden="true"\n            class="exact-orange-title"\n[\s\S]*?\/>/,
  ''
);

/* The closed envelope carries "You're Invited!" as script artwork. Set as live
   text on two lines, the way the artwork stacks it, keeping the class the
   envelope choreography animates. */
sub(
  'envelope lettering',
  /<img\n                alt=""\n                aria-hidden="true"\n                class="actual-envelope-text env-paper-piece"\n                src="assets\/images\/optimized\/youre-invited-lettering-b248092f\.webp"\n              \/>/,
  `<p\n                aria-hidden="true"\n                class="actual-envelope-text env-paper-piece ar-envelope-text"\n              >${esc(copy.invitation.envelopeLettering[0])}<br />${esc(copy.invitation.envelopeLettering[1])}</p>`
);

sub('alt envelope paper', /alt="You're invited envelope"/, `alt="${esc(copy.invitation.altEnvelope)}"`);
sub('alt wax seal', /alt="Wax seal"/, `alt="${esc(copy.invitation.altSeal)}"`);
sub('alt hummingbird', /alt="Hummingbird"/, `alt="${esc(copy.opening.altBird)}"`, 6);

sub('replay button label', /<span class="visually-hidden">Play the envelope opening again<\/span>/, `<span class="visually-hidden">${esc(copy.invitation.replayLabel)}</span>`);
sub('invitation hidden heading', /<h2>You’re invited!<\/h2>/, `<h2>${esc(copy.invitation.hiddenHeading)}</h2>`);

/* --------------------------------------------------------------- scene 3 */

sub('scene label date', /aria-label="Date"/, `aria-label="${esc(copy.date.sceneLabel)}"`);

sub(
  'date title',
  /<img[^>]*\bdata-title="date"[^>]*\/>/,
  scriptTitle({
    key: 'date-title', text: copy.date.title,
    centerX: 49.7847, midY: 22.7532, font: 10.6, boxW: 70, boxH: 15,
    delay: '0.47s', z: 208,
  })
);

sub(
  'calendar heading',
  lettersSpan('calendar-heading'),
  centredLine({
    key: 'calendar-heading', text: copy.date.calendarHeading,
    centerX: 50.6195, midY: 31.4100, font: 3.5, boxW: 60, boxH: 4.2,
    delay: '0.435s', z: 207,
  })
);

/* One Arabic date line replaces the source's three separate runs
   (OCTOBER 1 / ST / 2026); Arabic writes no ordinal suffix. The calendar mark
   moves to the right-hand end of the row. */
sub(
  'date row',
  lettersSpan('date'),
  iconRow({
    key: 'date-line', text: copy.date.dateLine, icon: CALENDAR_ICON,
    font: 3.5, midY: 60.9500, boxH: 5.4, delay: '0.61s', z: 199,
    align: 'center', centerX: 47.5634, boxW: 60,
  })
);
sub('date calendar icon removed', /\s*<svg\b[^>]*\bdata-icon="calendar"[^>]*>[\s\S]*?<\/svg>/, '');

sub('calendar grid', /<img\b[^>]*\bdata-calendar="grid"[^>]*\/>/, calendarMarkup());

sub('countdown aria', /aria-label="Countdown to the engagement"/, `aria-label="${esc(copy.date.countdownLabel)}"`);
/* The placeholder shows before the first tick, so it is written in the same
   numerals the script will replace it with. */
sub('countdown placeholders', /(<div class="num" id="cd[DHMS]">)--(<\/div>)/, '$1٠٠$2', 4);
sub('countdown days', /<div class="lab">DAYS<\/div>/, `<div class="lab">${esc(copy.date.countdownUnits.days)}</div>`);
sub('countdown hours', /<div class="lab">HOURS<\/div>/, `<div class="lab">${esc(copy.date.countdownUnits.hours)}</div>`);
sub('countdown minutes', /<div class="lab">MINUTES<\/div>/, `<div class="lab">${esc(copy.date.countdownUnits.minutes)}</div>`);
sub('countdown seconds', /<div class="lab">SECONDS<\/div>/, `<div class="lab">${esc(copy.date.countdownUnits.seconds)}</div>`);

sub(
  'date hidden copy',
  /<h2>Date<\/h2>\n            <p>Thursday 1 October 2026\.<\/p>/,
  `<h2>${esc(copy.date.hiddenHeading)}</h2>\n            <p>${esc(copy.date.hiddenBody)}</p>`
);

/* --------------------------------------------------------------- scene 4 */

sub('scene label ceremony', /aria-label="Ceremony"/, `aria-label="${esc(copy.ceremony.sceneLabel)}"`);

sub(
  'ceremony title',
  /<img[^>]*\bdata-title="ceremony"[^>]*\/>/,
  scriptTitle({
    key: 'ceremony-title', text: copy.ceremony.title,
    centerX: 52.7471, midY: 24.1063, font: 9.6, boxW: 70, boxH: 13,
    delay: '0.26s', z: 263,
  })
);

/* The source left-aligns both information rows under the map. Mirrored, they
   right-align on the map's right edge, each led by its own mark. */
sub(
  'ceremony venue row',
  lettersSpan('ceremony-venue'),
  iconRow({
    key: 'ceremony-venue', text: copy.ceremony.venue, icon: CHURCH_ICON,
    font: 3.3, midY: 68.0528, boxH: 8.2, delay: '0.575s', z: 257,
    align: 'right', rightEdge: 84.4, boxW: 66,
  })
);
sub(
  'ceremony time row',
  lettersSpan('ceremony-hour'),
  iconRow({
    key: 'ceremony-time', text: copy.ceremony.time, icon: CLOCK_ICON,
    font: 3.3, midY: 72.0282, boxH: 5.4, delay: '0.085s', z: 215,
    align: 'right', rightEdge: 84.4, boxW: 66,
  })
);
sub('ceremony meridiem removed', new RegExp(`\\s*${lettersSpan('ceremony-meridiem').source}`), '');
sub('ceremony hall removed', new RegExp(`\\s*${lettersSpan('ceremony-hall').source}`), '');
sub('ceremony hall2 removed', new RegExp(`\\s*${lettersSpan('ceremony-hall-2').source}`), '');
sub('ceremony clock icon removed', /\s*<svg\b[^>]*\bdata-icon="clock"[^>]*>[\s\S]*?<\/svg>/, '');
/* The three church pieces now live inside the venue row. */
sub('church piece 271 removed', new RegExp(`\\s*${imgByRoot(271).source}`), '');
sub('church piece 272 removed', new RegExp(`\\s*${imgByRoot(272).source}`), '');
sub('church piece 273 removed', new RegExp(`\\s*${imgByRoot(273).source}`), '');

sub('ceremony map title', /title="Ceremony church — Google Map"/, `title="${esc(copy.ceremony.mapTitle)}"`);
sub(
  'ceremony map link',
  /<span class="visually-hidden">Open St\. Anthony Church, Maadi in Google Maps<\/span>/,
  `<span class="visually-hidden">${esc(copy.ceremony.mapLink)}</span>`
);
sub(
  'ceremony hidden copy',
  /<h2>Ceremony<\/h2>\n            <p>St\. Anthony Church, Maadi\. 7 PM, Main Church\.<\/p>/,
  `<h2>${esc(copy.ceremony.hiddenHeading)}</h2>\n            <p>${esc(copy.ceremony.hiddenBody)}</p>`
);

/* ------------------------------------------------------------ scenes 5 & 6 */

for (const [scene, deck, roots] of [
  ['reception-boat', copy.receptionBoat, { title: 349, venueZ: 377, d1: 305, d2: 336, mode: 344 }],
  ['reception-car', copy.receptionCar, { title: 516, venueZ: 515, d1: 410, d2: 441, mode: 448 }],
]) {
  const boat = scene === 'reception-boat';
  const p = boat ? 'boat' : 'car';
  const label = boat ? 'Reception by boat' : 'Reception by car';

  sub(`scene label ${scene}`, new RegExp(`aria-label="${label}"`), `aria-label="${esc(deck.sceneLabel)}"`);

  sub(
    `${scene} title`,
    new RegExp(`<img[^>]*\\bdata-title="${scene}"[^>]*/>`),
    scriptTitle({
      key: `${p}-title`, text: deck.title,
      centerX: 49.4440, midY: boat ? 9.3967 : 14.3764, font: 10.6, boxW: 70, boxH: 15,
      delay: boat ? '0.33s' : '0.575s', z: roots.title, anim: 'from-top',
    })
  );

  sub(
    `${scene} venue`,
    lettersSpan(`${p}-venue`),
    centredLine({
      key: `${p}-venue`, text: deck.venue,
      centerX: 50.0590, midY: boat ? 17.5560 : 22.5357, font: 3.3, boxW: 60, boxH: 4.2,
      delay: boat ? '0.645s' : '0.575s', z: roots.venueZ,
    })
  );
  /* The English artwork sets these directions as three runs. Arabic says the
     same thing in two, so the block is re-centred on the middle of the three
     lines it replaces: the text keeps the vertical mass the design gave it
     instead of riding up and leaving a hole above the artwork below. */
  const midYs = boat ? [58.1957, 61.1906, 64.1855] : [60.2256, 63.2205, 66.2154];
  const blockCentre = midYs[1];
  const lineGap = midYs[1] - midYs[0];
  const twoLineMidY = [blockCentre - lineGap / 2, blockCentre + lineGap / 2];

  sub(
    `${scene} directions 1`,
    lettersSpan(`${p}-directions-1`),
    centredLine({
      key: `${p}-directions-1`, text: deck.directions[0],
      centerX: 50.2898, midY: +twoLineMidY[0].toFixed(4), font: 3.3, boxW: 80, boxH: 4.2,
      delay: boat ? '0.085s' : '0.12s', z: roots.d1,
    })
  );
  sub(
    `${scene} directions 2`,
    lettersSpan(`${p}-directions-2`),
    centredLine({
      key: `${p}-directions-2`, text: deck.directions[1],
      centerX: 49.6430, midY: +twoLineMidY[1].toFixed(4), font: 3.3, boxW: 80, boxH: 4.2,
      delay: boat ? '0.365s' : '0.4s', z: roots.d2,
    })
  );
  /* The third English run carried only the travel mode, which is now the tail of
     the second Arabic line. */
  sub(`${scene} mode run removed`, new RegExp(`\\s*${lettersSpan(`${p}-mode`).source}`), '');

  sub(`${scene} map title`, new RegExp(`title="${label} — Google Map"`), `title="${esc(deck.mapTitle)}"`);
}

sub(
  'boat map link',
  /<span class="visually-hidden">Open the boat arrival point for Revana Wedding Venue in Google Maps<\/span>/,
  `<span class="visually-hidden">${esc(copy.receptionBoat.mapLink)}</span>`
);
sub(
  'car map link',
  /<span class="visually-hidden">Open the car route to Revana Wedding Venue in Google Maps<\/span>/,
  `<span class="visually-hidden">${esc(copy.receptionCar.mapLink)}</span>`
);
sub(
  'boat hidden copy',
  /<h2>Reception by boat<\/h2>\n            <p>\n              Revana Wedding Venue\. Kindly follow this location if you wish to\n              arrive at the venue by boat\.\n            <\/p>/,
  `<h2>${esc(copy.receptionBoat.hiddenHeading)}</h2>\n            <p>${esc(copy.receptionBoat.hiddenBody)}</p>`
);
sub(
  'car hidden copy',
  /<h2>Reception by car<\/h2>\n            <p>\n              Revana Wedding Venue\. Kindly follow this location if you wish to\n              arrive at the venue by car\.\n            <\/p>/,
  `<h2>${esc(copy.receptionCar.hiddenHeading)}</h2>\n            <p>${esc(copy.receptionCar.hiddenBody)}</p>`
);

/* --------------------------------------------------------------- scene 7 */

sub('scene label dress', /aria-label="Dress code"/, `aria-label="${esc(copy.dressCode.sceneLabel)}"`);

/* Reading right to left, the first word takes the source's right-hand slot. The
   longer word takes the wider slot, which is the one on the left. */
sub(
  'dress title first word',
  /<img[^>]*\bdata-title="code"[^>]*\/>/,
  scriptTitle({
    key: 'dress-title-1', text: copy.dressCode.titleFirst,
    centerX: 59.82, midY: 13.2253, font: 9.6, boxW: 34, boxH: 12,
    delay: '0.295s', z: 554, anim: 'from-top',
  })
);
sub(
  'dress title second word',
  /<img[^>]*\bdata-title="dress"[^>]*\/>/,
  scriptTitle({
    key: 'dress-title-2', text: copy.dressCode.titleSecond,
    centerX: 39.89, midY: 13.6781, font: 9.6, boxW: 44, boxH: 12,
    delay: '0.12s', z: 548, anim: 'from-top',
  })
);

sub(
  'dress ladies',
  lettersSpan('dress-ladies'),
  centredLine({
    key: 'dress-ladies', text: copy.dressCode.ladies,
    centerX: 50.2171, midY: 21.1024, font: 3.3, boxW: 60, boxH: 4.2,
    delay: '0.225s', z: 540,
  })
);
sub(
  'dress men',
  lettersSpan('dress-men'),
  centredLine({
    key: 'dress-men', text: copy.dressCode.men,
    centerX: 50.0109, midY: 67.7521, font: 3.3, boxW: 60, boxH: 4.2,
    delay: '0.54s', z: 547,
  })
);

sub(
  'dress hidden copy',
  /<h2>Dress Code<\/h2>\n            <p>Formal dresses for ladies\. Formal suits for men\.<\/p>/,
  `<h2>${esc(copy.dressCode.hiddenHeading)}</h2>\n            <p>${esc(copy.dressCode.hiddenBody)}</p>`
);

/* --------------------------------------------------------------- scene 8 */

sub('reply title', /<h2 class="visually-hidden" id="reply-title">RSVP<\/h2>/, `<h2 class="visually-hidden" id="reply-title">${esc(copy.rsvp.sceneLabel)}</h2>`);

sub(
  'rsvp heading word',
  /<p aria-hidden="true" class="rsvp-heading">\n            <img\n              alt=""\n              class="rsvp-heading__word"\n              decoding="async"\n              loading="lazy"\n              src="assets\/images\/rsvp\/rsvp-heading-word\.svg"\n            \/>\n          <\/p>/,
  `<p aria-hidden="true" class="rsvp-heading">\n            <span class="rsvp-heading__word ar-title">${esc(copy.rsvp.heading)}</span>\n          </p>`
);

sub(
  'reply note word',
  /<img\n              alt="Let us know you’re coming!"\n              class="reply-note"\n              decoding="async"\n              loading="lazy"\n              src="assets\/images\/rsvp\/reply-note-word\.svg"\n            \/>/,
  `<p class="reply-note ar-title">${esc(copy.rsvp.note)}</p>`
);

sub(
  'reply excited',
  /<p class="reply-excited">\n              We’re so excited to celebrate this special moment with you!\n            <\/p>/,
  `<p class="reply-excited">${esc(copy.rsvp.excited)}</p>`
);
sub(
  'reply deadline',
  /<p class="reply-deadline">\n              Kindly reply by\n              <time datetime="2026-09-15">15\.09\.2026<\/time>\.\n            <\/p>/,
  `<p class="reply-deadline">\n              ${esc(copy.rsvp.deadlineBefore)}\n              <time datetime="2026-09-15">${esc(copy.rsvp.deadlineDate)}</time>.\n            </p>`
);

sub('form legend', /<legend class="visually-hidden">RSVP details<\/legend>/, `<legend class="visually-hidden">${esc(copy.rsvp.formLegend)}</legend>`);
sub('name label', /<label for="full-name">Full name<\/label\n                  >/, `<label for="full-name">${esc(copy.rsvp.nameLabel)}</label\n                  >`);
sub('attend legend', /<legend>Will you attend\?<\/legend>/, `<legend>${esc(copy.rsvp.attendLegend)}</legend>`);
/* The submitted values stay English so the existing sheet keeps one vocabulary. */
sub('choice yes', /<span>Joyfully attending<\/span>/, `<span>${esc(copy.rsvp.choiceYes)}</span>`);
sub('choice no', /<span>Unable to attend<\/span>/, `<span>${esc(copy.rsvp.choiceNo)}</span>`);
sub('message label', /<label for="message">Optional note<\/label\n                  >/, `<label for="message">${esc(copy.rsvp.messageLabel)}</label\n                  >`);
sub('honeypot label', /<label for="website">Website<\/label\n                  >/, `<label for="website">${esc(copy.rsvp.honeypotLabel)}</label\n                  >`);
sub('language field', /<input name="language" type="hidden" value="en" \/>/, '<input name="language" type="hidden" value="ar" />');
sub(
  'submit button',
  /<button class="button" type="submit" data-rsvp-submit disabled>\n                  Submit RSVP\n                <\/button>/,
  `<button class="button" type="submit" data-rsvp-submit disabled>\n                  ${esc(copy.rsvp.submit)}\n                </button>`
);
sub('form status', /                Preparing the reply form…\n/, `                ${esc(copy.rsvp.statusPreparing)}\n`);
sub(
  'backup paragraph',
  /                Until online replies are connected, please\n                <a\n                  href="https:\/\/forms\.gle\/daqf2ug4TypLtKwH8"\n                  rel="external"\n                  target="_blank"\n                  >use the RSVP form<\/a\n                >\./,
  `                ${esc(copy.rsvp.backupBefore)}\n                <a\n                  href="https://forms.gle/daqf2ug4TypLtKwH8"\n                  rel="external"\n                  target="_blank"\n                  >${esc(copy.rsvp.backupLink)}</a\n                >.`
);
sub(
  'noscript backup',
  /                  JavaScript is required for on-page replies\. Please\n                  <a\n                    href="https:\/\/forms\.gle\/daqf2ug4TypLtKwH8"\n                    rel="external"\n                    target="_blank"\n                    >use the RSVP form<\/a\n                  >\./,
  `                  ${esc(copy.rsvp.noscriptBefore)}\n                  <a\n                    href="https://forms.gle/daqf2ug4TypLtKwH8"\n                    rel="external"\n                    target="_blank"\n                    >${esc(copy.rsvp.backupLink)}</a\n                  >.`
);
sub('add to calendar', /              Add to calendar<\/a\n            >/, `              ${esc(copy.rsvp.addToCalendar)}</a\n            >`);

sub(
  'confirmed summary',
  /<dt>When<\/dt>\n                <dd>\n                  <time datetime="2026-10-01T19:00\+03:00"\n                    >Thursday 1 October 2026, 7 PM<\/time\n                  >\n                <\/dd>\n                <dt>Ceremony<\/dt>\n                <dd>St\. Anthony Church, Maadi<\/dd>\n                <dt>Reception<\/dt>\n                <dd>Revana Wedding Venue<\/dd>/,
  `<dt>${esc(copy.rsvp.confirmed[0].term)}</dt>\n                <dd>\n                  <time datetime="2026-10-01T19:00+03:00"\n                    >${esc(copy.rsvp.confirmed[0].value)}</time\n                  >\n                </dd>\n                <dt>${esc(copy.rsvp.confirmed[1].term)}</dt>\n                <dd>${esc(copy.rsvp.confirmed[1].value)}</dd>\n                <dt>${esc(copy.rsvp.confirmed[2].term)}</dt>\n                <dd>${esc(copy.rsvp.confirmed[2].value)}</dd>`
);

sub(
  'reply signoff',
  /<p class="reply-signoff">With love,<br \/>Youssef &amp; Lara<\/p>/,
  `<p class="reply-signoff">${esc(copy.rsvp.signoff[0])}<br />${esc(copy.rsvp.signoff[1])}</p>`
);
sub(
  'no-script reply',
  /        To reply,\n        <a href="https:\/\/forms\.gle\/daqf2ug4TypLtKwH8">open the RSVP form<\/a>\.\n/,
  `        ${esc(copy.rsvp.noScriptReplyBefore)}\n        <a href="https://forms.gle/daqf2ug4TypLtKwH8">${esc(copy.rsvp.noScriptReplyLink)}</a>.\n`
);

/* ------------------------------------------------------- relative paths */

/* ar/index.html sits one level down, so every same-origin asset reference gains
   a parent segment. Done last so the substitutions above could quote the
   original paths verbatim. */
html = html.replace(/\.\/assets\//g, 'assets/');
html = html.replace(/href="\.\/favicon\.ico"/g, 'href="\u0000FAVICON\u0000"');
const before = (html.match(/(?<!\.\.\/)\bassets\//g) || []).length;
html = html.replace(/(?<!\.\.\/)\bassets\//g, '../assets/');
html = html.replace(/href="\u0000FAVICON\u0000"/g, 'href="../favicon.ico"');
console.log(`  paths   rewrote ${before} asset references to ../assets/`);

/* --------------------------------------------------------------- output */

if (failures) {
  console.error(`\n${failures} substitution(s) failed. ar/index.html not written.`);
  process.exit(1);
}

/* An unresolved capture reference means a replacement was applied as a literal
   and has eaten the markup around it. */
const dangling = html.match(/\$\d/g);
if (dangling) {
  console.error(`\n${dangling.length} unresolved capture reference(s) in the output. ar/index.html not written.`);
  process.exit(1);
}

/* The four countdown cells are written by id, so losing one is silent at build
   time and throws in the browser. */
for (const id of ['cdD', 'cdH', 'cdM', 'cdS']) {
  if (!html.includes(`id="${id}"`)) {
    console.error(`\nCountdown cell ${id} is missing from the output. ar/index.html not written.`);
    process.exit(1);
  }
}

/* Nothing English should survive in visible copy. Checked against the generated
   file rather than trusted, since a missed slot is the whole failure mode. */
const bodyOnly = html.slice(html.indexOf('<body'));
const withoutUrls = bodyOnly
  .replace(/<!--[\s\S]*?-->/g, '')
  .replace(/(?:src|href|data-src|srcset|style|class|id|name|for|type|value|datetime|rel|target|autocomplete)="[^"]*"/g, '')
  .replace(/<svg[\s\S]*?<\/svg>/g, '');
const latin = [...withoutUrls.matchAll(/[A-Za-z]{3,}/g)].map((m) => m[0]);
const allowed = new Set(['aria', 'hidden', 'true', 'false', 'div', 'span', 'img', 'time', 'form', 'input', 'button', 'label', 'legend', 'fieldset', 'noscript', 'textarea', 'main', 'section', 'body', 'html', 'head', 'link', 'meta', 'title', 'script', 'style', 'iframe', 'dl', 'dt', 'dd', 'br', 'lazy', 'async', 'eager', 'polite', 'status', 'post', 'text', 'radio', 'submit', 'external', 'blank', 'download', 'disabled', 'required', 'tabindex', 'minlength', 'maxlength', 'decoding', 'loading', 'allowfullscreen', 'referrerpolicy', 'downgrade', 'referrer', 'when', 'no', 'UTF', 'charset', 'accept', 'method', 'describedby', 'labelledby', 'label', 'role', 'live', 'data', 'rsvp', 'fields', 'confirmed', 'backup', 'honey', 'website', 'full', 'message', 'language', 'submitted', 'page', 'url', 'submission', 'focusable', 'viewBox', 'preserveAspectRatio', 'fill', 'stroke', 'none', 'width', 'height', 'path', 'rect', 'circle', 'svg', 'defs', 'text', 'textPath', 'startOffset', 'anchor', 'middle', 'dy']);
const leaks = [...new Set(latin)].filter((w) => !allowed.has(w));

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, html, 'utf8');

console.log(`\n  ${applied.length} substitutions applied`);
console.log(`  wrote ${path.relative(ROOT, OUT)} (${html.length} bytes)`);
if (leaks.length) {
  console.log(`\n  Latin words left in body copy (review): ${leaks.join(', ')}`);
}
