// Rebuild browser delivery copies; original artwork is always retained.
// PNG artwork becomes lossless WebP at its native size, two oversized exports
// are reduced to the size they are actually displayed at, and the one SVG that
// carries embedded rasters is rasterised rather than shipped as 2.3 MB of
// base64. Animated GIFs are left alone: the saving is small and animated WebP
// would put the six hummingbirds at risk for no real gain.
//
// Requires ImageMagick, and librsvg (rsvg-convert) for the SVG.
// Run: node scripts/optimize-assets.mjs
import { readFileSync, mkdirSync, statSync, existsSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';

const root = resolve(import.meta.dirname, '..');
const optimized = resolve(root, 'assets/images/optimized');

// Every route and stylesheet that can name an image, so a copy is never missed.
const documents = ['index.html', 'ar/index.html'];
const stylesheets = ['assets/css/site.css', 'assets/css/portrait-site.css', 'assets/css/composition.css'];

const sources = new Set();
for (const file of documents) {
  if (!existsSync(resolve(root, file))) continue;
  const html = readFileSync(resolve(root, file), 'utf8');
  for (const match of html.matchAll(/(?:src|data-src|data-fallback)="\.{0,2}\/?(assets\/images\/[^" ]+\.(?:png|svg))"/g)) {
    sources.add(match[1]);
  }
}
for (const file of stylesheets) {
  if (!existsSync(resolve(root, file))) continue;
  const css = readFileSync(resolve(root, file), 'utf8');
  for (const match of css.matchAll(/\.\.\/images\/([^" )]+\.(?:png|svg))/g)) sources.add(`assets/images/${match[1]}`);
}
// Referenced from the reply card's border-image and background in either route.
sources.add('assets/images/rsvp/rsvp-lace-frame-8f2dca09.png');
sources.add('assets/images/rsvp/rsvp-card-background-eefcd42d.png');

// Displayed far smaller than they were exported.
const resizes = [
  ['wax-seal-', ['-resize', '384x384>']],
  ['closed-envelope-paper-', ['-resize', '1728x1728>']],
];

mkdirSync(optimized, { recursive: true });
let before = 0;
let after = 0;
let count = 0;
const missing = [];

for (const source of [...sources].sort()) {
  const input = resolve(root, source);
  if (!existsSync(input)) {
    missing.push(source);
    continue;
  }
  const output = resolve(optimized, basename(source).replace(/\.(?:png|svg)$/, '.webp'));

  if (source.endsWith('.svg')) {
    // The lettering SVG is a stack of embedded rasters, so a vector copy buys
    // nothing. Rasterise at twice its intrinsic size, which is four times the
    // width it is displayed at, then encode losslessly.
    // Read the intrinsic size from the markup: ImageMagick has no SVG
    // delegate here and would try to open the embedded rasters instead.
    const header = readFileSync(input, 'utf8').slice(0, 400);
    const width = Number(header.match(/\swidth="(\d+(?:\.\d+)?)"/)?.[1]);
    const height = Number(header.match(/\sheight="(\d+(?:\.\d+)?)"/)?.[1]);
    if (!width || !height) throw new Error(`No intrinsic size in ${source}`);
    const temporary = resolve(optimized, `${basename(source, '.svg')}.tmp.png`);
    execFileSync('rsvg-convert', ['-w', String(Math.round(width * 2)), '-h', String(Math.round(height * 2)), input, '-o', temporary]);
    execFileSync('magick', [temporary, '-define', 'webp:lossless=true', output]);
    execFileSync('rm', [temporary]);
  } else {
    const resize = resizes.find(([token]) => source.includes(token))?.[1] ?? [];
    execFileSync('magick', [input, ...resize, '-define', 'webp:lossless=true', output]);
  }

  before += statSync(input).size;
  after += statSync(output).size;
  count += 1;
}

console.log(`${count} delivery copies: ${before} → ${after} bytes (${Math.round((1 - after / before) * 100)}% smaller)`);
if (missing.length) console.log(`skipped ${missing.length} missing source(s): ${missing.join(', ')}`);
