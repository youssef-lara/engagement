# Engagement invitation

Static, bilingual engagement-invitation website for GitHub Pages.

## Routes

- English: `/`
- Arabic: `/ar/`

Both pages share files from `assets/`. The preserved single-file source remains in `lara_youssef_engagement_v25.html` until the rebuild has been visually compared against it.

## Local preview

From the repository root, run:

```sh
python3 -m http.server 4173
```

Then open `http://127.0.0.1:4173/` and `http://127.0.0.1:4173/ar/`.

See `IMPLEMENTATION_REFERENCE.md` for the implementation sequence and preservation rules.

## Artwork and loading

Opening artwork loads first; later scenes and maps load as
they approach the viewport. Original animation timings are retained. All font
families are self-hosted with their licenses, with no change to their type roles.

Only the original website artwork is used. Image generation is not permitted for
this project. Original transparency is preserved, without CSS masks or recreated
outlines. Native-size lossless WebP copies remain available; 43 small images also
have code-only 2× variants with gentle sharpening for high-density displays.
The oversized seal and envelope are downscaled to appropriate delivery sizes.

Rebuild delivery copies with `node scripts/optimize-assets.mjs` (ImageMagick required),
then run `node scripts/link-original-art.mjs` to update both routes. The originals
also serve as image-error and JavaScript-disabled fallbacks. Future enhancements
must use non-generative processing of the original files, not invented details.
See `assets/images/refined/README.md` for enhancement settings, rebuilding, and the
`--original-only` switch. Refinement improves rendering, not missing source detail.

`scripts/vendor-fonts.mjs` refreshes the existing font download; it requires network
access, but the website itself needs no build system or font CDN.

## RSVP service

The custom bilingual form posts to a small Cloudflare Worker at `worker/`. The Worker authenticates to Google with a private service-account secret and appends responses to the private `RSVP Responses` tab in Google Sheets. See `RSVP_OPERATIONS.md` for deployment and maintenance instructions.

## English portrait edition

The English route uses one 390:844 iPhone page ratio at every viewport size,
centered and capped at 430 CSS pixels on larger screens. Each page retains the
original v25 lettering and central composition, with floral edges extended into
the taller frame. The RSVP artwork opens the existing form in an accessible dialog.
The Arabic route continues to use its existing styles and scripts.

`node scripts/build-reference-site.mjs` rebuilds `index.html`,
`assets/css/reference-source.css`, and `assets/css/reference-frame.css` from the
preserved Canva HTML and extracted asset manifest. Edit layout in
`assets/css/portrait-site.css`, interactions in `assets/js/portrait-site.js`, and
the reply form markup in `assets/templates/rsvp-form.html`. The RSVP transport
remains in `assets/js/rsvp.js`.
