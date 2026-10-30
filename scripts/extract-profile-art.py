"""Extract original monochrome artwork, without lettering, from the brand PDF.

Usage: python extract-profile-art.py /path/to/profile.pdf
Requires pdfplumber, pypdf, pypdfium2 and Pillow. No tracing or simplification.
"""
import argparse
import json
from pathlib import Path
from xml.sax.saxutils import escape

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public/images/abstract'


def color(value):
    if value is None:
        return '#000'
    if isinstance(value, (float, int)):
        value = [value] * 3
    if len(value) == 4:
        c, m, y, k = value
        value = [1 - min(1, v * (1 - k) + k) for v in (c, m, y)]
    return 'rgb(' + ','.join(str(round(v * 255)) for v in value[:3]) + ')'


def svg(objects, box, name):
    x, y, right, bottom = box
    parts = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{x} {y} {right-x} {bottom-y}">',
             f'<title>{escape(name)}</title>',
             f'<rect x="{x}" y="{y}" width="{right-x}" height="{bottom-y}" fill="white"/>']
    groups = []
    for obj in objects:
        path = obj.get('path')
        if not path:
            pts = obj.get('pts', [])
            path = [('m' if i == 0 else 'l', pt) for i, pt in enumerate(pts)]
            if obj['object_type'] == 'rect':
                path.append(('h',))
        commands = []
        current = (0, 0)
        start = current
        for command, *points in path:
            # PDF's abbreviated cubic operators are not SVG commands.
            if command == 'v':
                command, points = 'c', [current, *points]
            elif command == 'y':
                command, points = 'c', [*points, points[-1]]
            commands.append(('z' if command == 'h' else command.upper()) + ' '.join(
                f'{p[0]:.4f},{p[1]:.4f}' for p in points))
            if command == 'm':
                start = points[0]
            current = start if command == 'h' else points[-1]
        fill = color(obj.get('non_stroking_color')) if obj['fill'] else 'none'
        stroke = color(obj.get('stroking_color')) if obj['stroke'] else 'none'
        style = (fill, stroke, obj['linewidth'] or 0.25, 'evenodd' if obj.get('evenodd') else 'nonzero')
        # pdfplumber separates compound subpaths. Rejoin matching adjacent
        # fills so reverse-wound holes stay holes instead of becoming solids.
        if groups and groups[-1][0] == style and fill != 'none':
            groups[-1][1].extend(commands)
        else:
            groups.append((style, commands))
    for (fill, stroke, width, rule), commands in groups:
        parts.append(f'<path d="{" ".join(commands)}" fill="{fill}" stroke="{stroke}" stroke-width="{width}" fill-rule="{rule}"/>')
    return '\n'.join(parts + ['</svg>'])


def shading_image(source, page_number, box, target):
    """Preserve PDF gradient meshes; remove lettering and other painted paths."""
    from pypdf import PdfReader, PdfWriter
    from pypdf.generic import ContentStream, NameObject
    import pypdfium2 as pdfium
    import tempfile

    reader = PdfReader(source)
    page = reader.pages[page_number - 1]
    paint = {b'S', b's', b'f', b'F', b'f*', b'B', b'B*', b'b', b'b*'}

    def clean(stream):
        content = ContentStream(stream, reader)
        content.operations = [(args if op not in paint else [], b'n' if op in paint else op)
                              for args, op in content.operations]
        return content

    page[NameObject('/Contents')] = clean(page.get_contents())
    writer = PdfWriter()
    writer.add_page(page)
    with tempfile.TemporaryDirectory() as tmp:
        pdf = Path(tmp) / 'mesh.pdf'
        writer.write(pdf)
        doc = pdfium.PdfDocument(str(pdf))
        image = doc[0].render(scale=3).to_pil()
        image.crop(tuple(round(v * 3) for v in box)).convert('RGB').save(target, lossless=True)


def main():
    import pdfplumber
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('pdf')
    args = parser.parse_args()
    OUT.mkdir(parents=True, exist_ok=True)
    pdf = pdfplumber.open(args.pdf)
    specs = [
        ('angular-convergence', 'Angular convergence', 3, (0, 0, 651.968, 580), 'Nested corners converge into two precise junctions.', lambda p: p.curves[:22]),
        ('contour-ribbon', 'Contour ribbon', 4, (190, 0, 651.968, 765.354), 'A continuous ribbon shaped by sweeping contours.', lambda p: p.curves[:39]),
        ('interlocking-loops', 'Interlocking loops', 5, (50, 185, 605, 345), 'Layered loops interlock across a horizontal axis.', lambda p: [c for c in p.curves + p.rects if c['top'] >= 185 and c['bottom'] <= 345]),
        ('contour-sculpture', 'Contour sculpture', 6, (50, 100, 575, 685), 'Fine contours fold into a sculptural surface.', None),
        ('wire-figure', 'Wire figure', 7, (400, 135, 607, 630), 'An angular figure composed of connected facets.', lambda p: p.curves[258:1705]),
        ('folded-surface', 'Folded surface', 7, (50, 515, 280, 705), 'A softly shaded surface with an open, folded centre.', None),
        ('wave-bands', 'Wave bands', 9, (0, 240, 651.968, 555), 'Parallel bands bend into an undulating landscape.', lambda p: p.curves[:33]),
        ('profile-flow', 'Profile flow', 10, (345, 69, 635, 640), 'Alternating bands form a flowing human profile.', lambda p: p.curves[66:100]),
        ('radial-framework', 'Radial framework', 11, (52, 173, 600, 402), 'An architectural framework opens around a central void.', lambda p: region(p, (51, 172, 601, 403))),
        ('vanishing-grid', 'Vanishing grid', 11, (52, 590, 600, 695), 'An intricate field of lines converges on the horizon.', lambda p: region(p, (51, 588, 601, 696))),
        ('geometric-lattice', 'Geometric lattice', 14, (230, 65, 605, 550), 'An interwoven lattice of angular geometric forms.', lambda p: p.curves[102:319]),
    ]
    manifest = []
    for i, (slug, name, page, box, description, select) in enumerate(specs, 1):
        extension = 'svg' if select else 'webp'
        target = OUT / f'{slug}.{extension}'
        if select:
            objects = select(pdf.pages[page - 1])
            target.write_text(svg(objects, box, name))
        else:
            shading_image(args.pdf, page, box, target)
        manifest.append(dict(id=f'{i:02}', slug=slug, name=name, page=page,
                             description=description, src=f'/images/abstract/{slug}.{extension}',
                             width=box[2]-box[0], height=box[3]-box[1], format=extension))
        print(f'{i:02} {name}: {target.name}', flush=True)
    (ROOT / 'src/data/abstract/artworks.json').write_text(json.dumps(manifest, indent=2) + '\n')


def region(page, box):
    x, y, right, bottom = box
    return [o for o in page.curves + page.lines + page.rects
            if o['x0'] >= x and o['x1'] <= right and o['top'] >= y and o['bottom'] <= bottom]


if __name__ == '__main__':
    main()
