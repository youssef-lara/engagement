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

The English route uses the original 502.1245:767.625 Canva page ratio at every viewport size,
centered and capped at 430 CSS pixels on larger screens. Each page retains the
original v25 lettering, artwork, and floral framing, rests on the paper colour
with a small gap and a soft shadow, and snaps its own top to the top of the
viewport as the reader scrolls. The final RSVP page displays the existing form
directly in a lace-paper card, under the source's own hand-drawn RSVP lettering
and handwritten note, with the original floral corners. This page grows to fit the
form; the other eight pages retain the source aspect ratio.
The Arabic route continues to use its existing styles and scripts.

Guest-facing details worth knowing when editing:

- Every venue line is an anchor onto Google Maps, so directions work without
  JavaScript and without the embed.
- The three map embeds keep their address in `data-src` until their page comes
  into view, which keeps about 1.3 MB of Google's scripts off the first screen.
- The invitation card's wording uses the invitation's deep rose rather than white,
  which is the only way it reaches a readable contrast on that pink.
- A successful reply reveals the event summary and `assets/engagement.ics`. The
  four-hour duration in that file is an assumption.
- `python3 scripts/build-social-assets.py` composes the link-preview card and the
  icons from the opening artwork, using the manifest's own coordinates.
- `node scripts/subset-fonts.mjs` writes `assets/css/fonts-portrait.css` with only
  the families this route names; `assets/css/fonts.css` stays as the full cache
  for the Arabic route.

The invitation collage bakes each layer's tilt into its PNG, so swapping a
photograph means rebuilding that file at the same canvas size and tilted
quadrilateral. `python3 scripts/fit-invitation-photos.py` does that for the two
couple photographs from the originals kept beside them, leaving the collage's
positions, overlaps and CSS untouched.

`node scripts/build-reference-site.mjs` rebuilds `index.html`,
`assets/css/reference-source.css`, and `assets/css/reference-frame.css` from the
preserved Canva HTML and extracted asset manifest. Edit layout in
`assets/css/portrait-site.css`, interactions in `assets/js/portrait-site.js`, and
the reply form markup in `assets/templates/rsvp-form.html`. The RSVP transport
remains in `assets/js/rsvp.js`.
