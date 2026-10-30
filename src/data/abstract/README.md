# Abstract artwork library

Preview route: `/abstract-lines`. The numbers, names and slugs in
`artworks.json` are stable references for future page designs.

Use the shared component to place a particular artwork:

```tsx
import AbstractArtwork from '@/components/abstract/AbstractArtwork';

<AbstractArtwork name="contour-ribbon" className="h-full w-full object-contain invert" />
```

Assets retain the profile's original black-on-white appearance. Apply `invert`
for white-on-black. Preserve their aspect ratios; use a wrapper for intentional
cropping. SVG paths are extracted from the source PDF, not traced from a bitmap.
The two shaded mesh pieces, `contour-sculpture` and `folded-surface`, are
high-resolution lossless WebP renders of the original PDF gradient meshes.
They are reference artwork, not reconstructed 3D models or individual animated
strokes. The gallery uses a reveal mask without deforming the artwork.

`AnimatedAbstractArtwork` adds staggered line construction for 01 and 02,
and radial construction for 09. SVG masks reveal the original artwork and
finish on its exact appearance. Each plays once on entering view, pauses
offscreen, and offers a replay control. Reduced motion shows the static art.

To regenerate from the original profile:

```sh
python3 scripts/extract-profile-art.py '/path/to/Gemstrat - Profile .pdf'
```

The extraction script requires `pdfplumber`, `pypdf`, `pypdfium2`, and `Pillow`.
The PDF is an authoring input; it is not required to build or run the website.
