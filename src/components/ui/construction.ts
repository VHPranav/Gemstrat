// ---------------------------------------------------------------------------
// construction
// The hero intro's 2D stage, drawn on BlastScene's line canvas: hairline
// construction guides glide in one after another along the straight edges of
// the Gemstrat wordmark, then every letter traces itself where they cross.
// The other letters and the guides then fade, leaving the S (the "mark"),
// which BlastScene turns into the 3D logo on the same timeline.
// ---------------------------------------------------------------------------

type P = { x: number; y: number };

export interface ConstructionInput {
  /** The wordmark's letters other than the mark: screen-space polygons to
   *  trace (outlines and holes, curves finely sampled) and the letter's truly
   *  straight segments, which the guides run along. `small` letters (the
   *  tagline) get no guides. */
  letters: { polys: P[][]; edges: [P, P][]; small: boolean }[];
  /** The mark (the S that becomes the 3D logo), screen-space polygons */
  mark: P[][];
}

// Guides: one starts every GUIDE_STAGGER seconds, in a shuffled order
const GUIDE_FIRST = 0.2;
const GUIDE_STAGGER = 0.07;
const GUIDE_DUR = 1.1; // + up to GUIDE_DUR_VARY, to cross the screen
const GUIDE_DUR_VARY = 0.25;
const MAX_GUIDES = 30; // the wordmark's longest straight edges
const MIN_EDGE = 16; // px: shorter straight segments get no guide
const TAIL = 140; // px of the bright comet tail behind each guide's head
const LINE_WIDTH = 0.6;
const LETTER_STAGGER = 0.08; // s between letters starting to trace

// Timeline, in seconds from the start of the construction
export const CONSTRUCT = {
  outlineStart: 2.2, // the letters trace themselves, left to right
  outlineDur: 1.0,
  othersFadeStart: 3.75, // everything but the mark fades away
  othersFadeDur: 0.8,
  to3dStart: 4.2, // the mark turns 3D: swings round into the logo's place
  to3dDur: 1.9,
  solidStart: 5.0, // material and light fill the wireframe
  solidDur: 1.3,
  end: 6.4,
};

interface Guide {
  a: P; // clipped to the screen (plus a margin), in draw order
  b: P;
  nx: number; // unit normal, for the slide-in
  ny: number;
  slide: number; // px the line drifts across while it draws
  start: number;
  dur: number;
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const ramp = (t: number, start: number, dur: number) => clamp01((t - start) / dur);

// Clip the infinite line through p along unit d to the rectangle
function clipLine(p: P, dx: number, dy: number, w: number, h: number, margin: number): [P, P] | null {
  let t0 = -Infinity;
  let t1 = Infinity;
  const slab = (pos: number, d: number, lo: number, hi: number) => {
    if (Math.abs(d) < 1e-9) return pos >= lo && pos <= hi;
    let a = (lo - pos) / d;
    let b = (hi - pos) / d;
    if (a > b) [a, b] = [b, a];
    t0 = Math.max(t0, a);
    t1 = Math.min(t1, b);
    return t0 <= t1;
  };
  if (!slab(p.x, dx, -margin, w + margin) || !slab(p.y, dy, -margin, h + margin)) return null;
  return [
    { x: p.x + dx * t0, y: p.y + dy * t0 },
    { x: p.x + dx * t1, y: p.y + dy * t1 },
  ];
}

const perimeter = (poly: P[]) =>
  poly.reduce((len, p, j) => {
    const q = poly[(j + 1) % poly.length];
    return len + Math.hypot(q.x - p.x, q.y - p.y);
  }, 0);

export function createConstruction({ letters, mark }: ConstructionInput, w: number, h: number) {
  const rand = mulberry32(7);

  // Every straight segment long enough, as an infinite line (curves never
  // get guides); segments on the same line become one guide, keeping the
  // longest
  const lineMap = new Map<string, { p: P; dx: number; dy: number; nx: number; ny: number; len: number }>();
  const markEdges = mark.flatMap((poly) => poly.map((p, i): [P, P] => [p, poly[(i + 1) % poly.length]]));
  [...letters.filter((l) => !l.small).map((l) => l.edges), markEdges].forEach((edges) =>
    edges.forEach(([p, q]) => {
      const len = Math.hypot(q.x - p.x, q.y - p.y);
      if (len < MIN_EDGE) return;
      const dx = (q.x - p.x) / len;
      const dy = (q.y - p.y) / len;
      let ang = Math.atan2(dy, dx);
      if (ang < 0) ang += Math.PI;
      if (ang >= Math.PI - 1e-3) ang -= Math.PI;
      const nx = -Math.sin(ang);
      const ny = Math.cos(ang);
      const key = `${Math.round(ang * 60)}:${Math.round((p.x * nx + p.y * ny) / 3)}`;
      const prev = lineMap.get(key);
      if (!prev || len > prev.len) lineMap.set(key, { p, dx, dy, nx, ny, len });
    }),
  );
  const lines = [...lineMap.values()]
    .sort((m, n) => n.len - m.len)
    .slice(0, MAX_GUIDES)
    .flatMap((l) => {
      const seg = clipLine(l.p, l.dx, l.dy, w, h, 40);
      if (!seg) return [];
      const [a, b] = rand() > 0.5 ? seg : [seg[1], seg[0]];
      return [{ a, b, nx: l.nx, ny: l.ny, slide: (rand() > 0.5 ? 1 : -1) * (30 + rand() * 40) }];
    });

  // One at a time, in a shuffled order, so directions alternate
  for (let i = lines.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [lines[i], lines[j]] = [lines[j], lines[i]];
  }
  const guides: Guide[] = lines.map((l, i) => ({
    ...l,
    start: GUIDE_FIRST + i * GUIDE_STAGGER,
    dur: GUIDE_DUR + rand() * GUIDE_DUR_VARY,
  }));

  // Letters (and the mark) trace left to right
  const minX = (polys: P[][]) => Math.min(...polys.flat().map((p) => p.x));
  const traced = [
    ...letters.map((l) => ({ polys: l.polys, isMark: false, small: l.small })),
    { polys: mark, isMark: true, small: false },
  ]
    .sort((m, n) => minX(m.polys) - minX(n.polys))
    .map((t, i) => ({ ...t, start: CONSTRUCT.outlineStart + i * LETTER_STAGGER, lens: t.polys.map(perimeter) }));

  function stroke(ctx: CanvasRenderingContext2D, path: () => void, alpha: number, width = LINE_WIDTH) {
    // Soft halo, then the hairline core
    ctx.globalAlpha = alpha * 0.1;
    ctx.lineWidth = width * 4;
    ctx.strokeStyle = 'rgb(190,190,190)';
    ctx.beginPath();
    path();
    ctx.stroke();
    ctx.globalAlpha = alpha;
    ctx.lineWidth = width;
    ctx.strokeStyle = 'rgb(240,240,240)';
    ctx.beginPath();
    path();
    ctx.stroke();
  }

  function draw(ctx: CanvasRenderingContext2D, t: number) {
    // Everything but the mark fades away; the mark's own outline hands over
    // to the 3D wireframe as that swings round
    const othersFade = 1 - easeInOutCubic(ramp(t, CONSTRUCT.othersFadeStart, CONSTRUCT.othersFadeDur));
    const markFade = 1 - easeInOutCubic(ramp(t, CONSTRUCT.to3dStart + 0.1, 0.6));
    if (othersFade <= 0 && markFade <= 0) return;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';

    // Once the letters start tracing, the guides step back so they read first
    const focus = 1 - 0.55 * easeInOutCubic(ramp(t, CONSTRUCT.outlineStart, 0.8));

    // Guides: a comet glides across the screen, easing in and out, drawing
    // the line behind it as the line drifts sideways into place; once there it
    // settles to a faint hairline
    if (othersFade > 0) {
      for (const g of guides) {
        const k = ramp(t, g.start, g.dur);
        if (k <= 0) continue;
        const e = easeInOutCubic(k);
        const off = g.slide * (1 - easeOutCubic(ramp(t, g.start, g.dur * 1.3)));
        const ax = g.a.x + g.nx * off;
        const ay = g.a.y + g.ny * off;
        const hx = ax + (g.b.x - g.a.x) * e;
        const hy = ay + (g.b.y - g.a.y) * e;
        const settle = easeOutCubic(ramp(t, g.start + g.dur * 0.7, 0.8));
        const alpha = (0.5 - 0.32 * settle) * focus * othersFade;
        stroke(
          ctx,
          () => {
            ctx.moveTo(ax, ay);
            ctx.lineTo(hx, hy);
          },
          alpha,
        );

        if (k < 1) {
          // Comet tail: a bright fade along the last stretch behind the head
          const len = Math.hypot(g.b.x - g.a.x, g.b.y - g.a.y) || 1;
          const tail = Math.min(TAIL, len * e);
          const tx = hx - ((g.b.x - g.a.x) / len) * tail;
          const ty = hy - ((g.b.y - g.a.y) / len) * tail;
          const glow = Math.sin(Math.PI * k); // brightest mid-flight
          const grad = ctx.createLinearGradient(tx, ty, hx, hy);
          grad.addColorStop(0, 'rgba(240,240,240,0)');
          grad.addColorStop(1, `rgba(255,255,255,${0.85 * glow * othersFade})`);
          ctx.globalAlpha = 1;
          ctx.strokeStyle = grad;
          ctx.lineWidth = LINE_WIDTH * 1.6;
          ctx.beginPath();
          ctx.moveTo(tx, ty);
          ctx.lineTo(hx, hy);
          ctx.stroke();
        }
      }
    }

    // The letters trace themselves, then fill faintly
    for (const letter of traced) {
      const fade = letter.isMark ? markFade : othersFade;
      const k = easeInOutCubic(ramp(t, letter.start, CONSTRUCT.outlineDur));
      if (k <= 0 || fade <= 0) continue;
      const fill = easeInOutCubic(ramp(t, letter.start + 0.7, 0.8)) * fade;
      letter.polys.forEach((poly, i) => {
        const len = letter.lens[i];
        const path = () => {
          ctx.moveTo(poly[0].x, poly[0].y);
          for (let j = 1; j <= poly.length; j++) ctx.lineTo(poly[j % poly.length].x, poly[j % poly.length].y);
        };
        ctx.setLineDash([len * k, len]);
        stroke(ctx, path, 0.9 * fade, LINE_WIDTH * (letter.small ? 1 : 1.5));
        ctx.setLineDash([]);
        if (fill > 0) {
          ctx.globalAlpha = 0.05 * fill;
          ctx.fillStyle = 'rgb(215,215,215)';
          ctx.beginPath();
          path();
          ctx.fill();
        }
      });
    }

    ctx.restore();
  }

  return { draw };
}

// Small seeded PRNG, so the construction plays the same way every visit
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
