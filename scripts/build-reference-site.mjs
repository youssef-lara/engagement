/** Reuse the approved Canva composition without substituting its lettering.
 * The immutable source and extracted asset manifest are the build inputs.
 * Run: node scripts/build-reference-site.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
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
  '<h2>Reception by boat</h2><p>Revana Wedding Venue. Kindly follow this location if you wish to arrive to the venue by boat.</p>',
  '<h2>Reception by car</h2><p>Revana Wedding Venue. Kindly follow this location if you wish to arrive to the venue by car.</p>',
  '<h2>Dress Code</h2><p>Formal dresses for ladies. Formal suits for men.</p>',
  '<h2>RSVP</h2><p>Let us know you’re coming! We’re so excited to celebrate this special moment with you! Kindly submit your RSVP by September 15th, 2026. With love, Youssef and Lara.</p>',
];
const form = readFileSync(new URL('assets/templates/rsvp-form.html',root),'utf8');
let imageIndex = 0;
const scenes = [...source.matchAll(/<section\b[\s\S]*?<\/section>/g)].map(([html], sceneIndex) => {
  html = html.replace(/<img\b[^>]*>/g, tag => {
    const asset = manifest.elements[imageIndex++];
    if (asset.sceneIndex !== sceneIndex) throw new Error('Source/manifest order mismatch');
    tag = tag.replace(/src="[^"]*"/, `src="${asset.assetPath}"`)
      .replace(/loading="[^"]*"/, `loading="${sceneIndex === 0 ? 'eager' : 'lazy'}"`);
    // The accessible transcript supplies words that Canva exported as glyph images.
    if (asset.contentClassification === 'text-fragment') tag = tag.replace(/alt="[^"]*"/, 'alt="" aria-hidden="true"');
    if (/border/.test(asset.label || '') && asset.rendered.heightPercent > 65) {
      // Tile tall edge art at its natural proportions rather than elongating flowers.
      tag = tag.replace('<img', '<span').replace(/\s(?:src|alt|loading|decoding)="[^"]*"/g, '')
        .replace('class="', 'aria-hidden="true" class="frame-border ')
        .replace('style="', `style="background-image:url('${asset.assetPath}');`)
        .replace(/\/?>$/, '></span>');
    }
    return tag;
  });
  html = html.replace(/<section /, `<section data-scene="${slugs[sceneIndex]}" `);
  html = html.replace(/loading="eager"(?=[^>]*src="https:)/g, 'loading="lazy"');
  if (sceneIndex === 8) {
    const flowers = manifest.elements.filter(asset => asset.sceneIndex === 8 && ['559','560','561','562'].includes(asset.dataRoot))
      .map(asset => `<img class="rsvp-floral rsvp-floral--${asset.dataRoot}" src="${asset.assetPath}" alt="" aria-hidden="true" loading="lazy" decoding="async">`).join('');
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
<link rel="icon" href="data:,">
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
