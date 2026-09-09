/** Reuse the approved Canva composition without substituting its lettering.
 * The immutable source and extracted asset manifest are the build inputs.
 * Run: node scripts/build-reference-site.mjs
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { basename } from 'node:path';
const source = readFileSync(new URL('../lara_youssef_engagement_v25.html', import.meta.url), 'utf8');
const manifest = JSON.parse(readFileSync(new URL('../assets/images/manifest.json', import.meta.url)));
const root = new URL('../', import.meta.url);
const slugs = ['opening','invitation','celebration','date','ceremony','reception-boat','reception-car','dress-code','rsvp'];
const descriptions = [
  '<h1>Youssef and Lara</h1><p>We’re getting engaged.</p>',
  '<h2>You’re invited!</h2>',
  '<h2>The Celebration</h2><p>A night out for the grown-ups, sweet dreams for the little ones. Babysitters on duty. Dancing shoes on. Adults only, please!</p>',
  '<h2>Date</h2><p>October 1st, 2026.</p>',
  '<h2>Ceremony</h2><p>St. Anthony Church, Maadi. 7 PM, Main Church.</p>',
  '<h2>Reception by boat</h2><p>Revana Wedding Venue. Kindly follow this location if you wish to arrive at the venue by boat.</p>',
  '<h2>Reception by car</h2><p>Revana Wedding Venue. Kindly follow this location if you wish to arrive at the venue by car.</p>',
  '<h2>Dress Code</h2><p>Formal dresses for ladies. Formal suits for men.</p>',
  '<h2>RSVP</h2><p>Let us know you’re coming! We’re so excited to celebrate this special moment with you! Kindly submit your RSVP by September 15th, 2026. With love, Youssef and Lara.</p>',
];
const form = readFileSync(new URL('assets/templates/rsvp-form.html',root),'utf8');
/** Prefer the WebP delivery copy built by scripts/optimize-assets.mjs. The
 * originals stay in the repository and remain the source of truth; animated
 * GIFs have no delivery copy and are served as they are. */
const delivery = assetPath => {
  if (assetPath.endsWith('.gif')) return assetPath;
  const copy = `assets/images/optimized/${basename(assetPath).replace(/\.(?:png|svg)$/, '.webp')}`;
  return existsSync(new URL(copy, root)) ? copy : assetPath;
};

let imageIndex = 0;
const scenes = [...source.matchAll(/<section\b[\s\S]*?<\/section>/g)].map(([html], sceneIndex) => {
  html = html.replace(/<img\b[^>]*>/g, tag => {
    const asset = manifest.elements[imageIndex++];
    if (asset.sceneIndex !== sceneIndex) throw new Error('Source/manifest order mismatch');
    tag = tag.replace(/src="[^"]*"/, `src="${delivery(asset.assetPath)}"`)
      .replace(/loading="[^"]*"/, `loading="${sceneIndex === 0 ? 'eager' : 'lazy'}"`);
    // The accessible transcript supplies words that Canva exported as glyph images.
    if (asset.contentClassification === 'text-fragment') tag = tag.replace(/alt="[^"]*"/, 'alt="" aria-hidden="true"');
    if (/border/.test(asset.label || '') && asset.rendered.heightPercent > 65) {
      // Tile tall edge art at its natural proportions rather than elongating flowers.
      tag = tag.replace('<img', '<span').replace(/\s(?:src|alt|loading|decoding)="[^"]*"/g, '')
        .replace('class="', 'aria-hidden="true" class="frame-border ')
        .replace('style="', `style="background-image:url('${delivery(asset.assetPath)}');`)
        .replace(/\/?>$/, '></span>');
    }
    return tag;
  });
  html = html.replace(/<section /, `<section data-scene="${slugs[sceneIndex]}" `);
  html = html.replace(/loading="eager"(?=[^>]*src="https:)/g, 'loading="lazy"');
  if (sceneIndex === 8) {
    const flowers = manifest.elements.filter(asset => asset.sceneIndex === 8 && ['559','560','561','562'].includes(asset.dataRoot))
      .map(asset => `<img class="rsvp-floral rsvp-floral--${asset.dataRoot}" src="${delivery(asset.assetPath)}" alt="" aria-hidden="true" loading="lazy" decoding="async">`).join('');
    return `<div class="phone-page rsvp-page" id="rsvp">
<section class="scene rsvp-scene" data-scene="rsvp" aria-labelledby="reply-title">
${flowers}
<div class="rsvp-paper">
<h2 id="reply-title">RSVP</h2>
<p class="reply-note">Let us know you’re coming!</p>
<p class="reply-deadline">Kindly reply by <time datetime="2026-09-15">15.09.2026</time>.</p>
${form}
</div>
</section></div>`;
  }
  return `<div class="phone-page" id="${slugs[sceneIndex]}">${html.replace('</section>', `<div class="visually-hidden">${descriptions[sceneIndex]}</div></section>`)}</div>`;
});
if (imageIndex !== manifest.elements.length) throw new Error('Unmapped source images');
const css = source.match(/<style[^>]*>([\s\S]*?)<\/style>/)[1].replace(/@import\s+url\([^;]+;/g, '');
writeFileSync(new URL('assets/css/reference-source.css', root), '/* Generated from the preserved v25 source. Edit portrait-site.css for layout. */\n'+css);
writeFileSync(new URL('index.html',root), `<!doctype html>
<html lang="en" dir="ltr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Youssef &amp; Lara — Engagement</title>
<meta name="description" content="The engagement invitation for Youssef and Lara on October 1, 2026.">
<link rel="alternate" hreflang="en" href="./"><link rel="alternate" hreflang="ar" href="./ar/">
<link rel="canonical" href="https://youssefg7.github.io/engagement/">
<meta name="theme-color" content="#eee9e5">
<!-- The invitation is shared as a pasted link, so it carries its own preview
     card. og:image must be absolute; update these four URLs together if the
     site ever moves to its own domain. -->
<meta property="og:type" content="website">
<meta property="og:site_name" content="Youssef &amp; Lara">
<meta property="og:locale" content="en">
<meta property="og:url" content="https://youssefg7.github.io/engagement/">
<meta property="og:title" content="Youssef &amp; Lara are getting engaged">
<meta property="og:description" content="1 October 2026 · St. Anthony Church, Maadi, then Revana Wedding Venue. Kindly reply by 15 September.">
<meta property="og:image" content="https://youssefg7.github.io/engagement/assets/images/social/og-invitation.jpg">
<meta property="og:image:type" content="image/jpeg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Youssef and Lara written in script inside a pink oval frame, surrounded by watercolour flowers and hummingbirds">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="./favicon.ico" sizes="any">
<link rel="apple-touch-icon" href="./assets/images/social/apple-touch-icon.png">
<meta name="apple-mobile-web-app-title" content="Youssef &amp; Lara">
<link rel="stylesheet" href="assets/css/fonts.css">
<link rel="stylesheet" href="assets/css/reference-source.css">
<link rel="stylesheet" href="assets/css/portrait-site.css">
<script src="assets/js/portrait-site.js" defer></script>
<script src="assets/js/rsvp-config.js" defer></script>
<script src="assets/js/rsvp.js" defer></script>
</head>
<body data-language="en">
<a class="skip-link" href="#main-content">Skip to invitation</a>
<main class="site" id="main-content">${scenes.join('\n')}</main>
<noscript><p class="no-script-reply">To reply, <a href="https://forms.gle/daqf2ug4TypLtKwH8">open the RSVP form</a>.</p></noscript>
</body></html>\n`);

// Move only floral corners into the extra phone height. Lettering and collage
// layers stay together on the unchanged source artboard, preserving their scale.
const floralRules = [];
for (const asset of manifest.elements) {
  if (!asset.dataRoot || asset.dataRoot === '258') continue; // map, mislabeled in the export
  if (!/floral|border|spray|corner/.test(asset.label || '') && asset.dataRoot !== '214') continue;
  const {topPercent:y, heightPercent:h} = asset.rendered;
  const sideBorder = h > 65;
  const shift = sideBorder || y < 10 ? -1 : 1;
  floralRules.push(`.scene-${asset.sceneIndex} [data-root="${asset.dataRoot}"] { top: calc(${y}% ${shift<0?'-':'+'} var(--frame-extension)) !important;${sideBorder ? ` height: calc(${h}% + 2 * var(--frame-extension)) !important;` : ''} }`);
}
writeFileSync(new URL('assets/css/reference-frame.css',root), '/* Generated botanical edge anchors for the taller phone page. */\n'+floralRules.join('\n')+'\n');
