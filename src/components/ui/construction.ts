// ---------------------------------------------------------------------------
// construction
// The hero intro's 2D stage, drawn on BlastScene's line canvas: hairline
// construction guides glide in one after another, each along an edge of the
// logo, then the flat logo outline traces itself where they cross. BlastScene
// takes over from there (wireframe → solid 3D) on the same timeline.
// ---------------------------------------------------------------------------

type P = { x: number; y: number };

// Guides: one starts every GUIDE_STAGGER seconds, in a shuffled order
const GUIDE_FIRST = 0.2;
const GUIDE_STAGGER = 0.13;
const GUIDE_DUR = 1.1; // + up to GUIDE_DUR_VARY, to cross the screen
const GUIDE_DUR_VARY = 0.25;
const TAIL = 140; // px of the bright comet tail behind each guide's head
const LINE_WIDTH = 0.6;

// Timeline, in seconds from the start of the construction
export const CONSTRUCT = {
  outlineStart: 2.5, // the flat logo traces itself
  outlineDur: 1.0,
  to3dStart: 3.9, // the flat logo tilts into 3D as a wireframe
  to3dDur: 1.6,
  solidStart: 4.6, // material and light fill the wireframe
  solidDur: 1.3,
  fadeStart: 3.8, // guides and the flat outline fade out
  fadeDur: 1.5,
  end: 6.0,
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

export function createConstruction(outline: P[][], w: number, h: number) {
  const rand = mulberry32(7);
  const lines: Omit<Guide, 'start' | 'dur'>[] = [];
  const seen = new Set<string>();

  // Every edge of the logo, extended across the whole screen (edges that lie
  // on the same line become one guide)
  outline.forEach((poly) =>
    poly.forEach((p, i) => {
      const q = poly[(i + 1) % poly.length];
      const len = Math.hypot(q.x - p.x, q.y - p.y) || 1;
      const dx = (q.x - p.x) / len;
      const dy = (q.y - p.y) / len;
      let ang = Math.atan2(dy, dx);
      if (ang < 0) ang += Math.PI;
      if (ang >= Math.PI - 1e-3) ang -= Math.PI;
      const nx = -Math.sin(ang);
      const ny = Math.cos(ang);
      const key = `${Math.round(ang * 60)}:${Math.round((p.x * nx + p.y * ny) / 3)}`;
      if (seen.has(key)) return;
      seen.add(key);
      const seg = clipLine(p, dx, dy, w, h, 40);
      if (!seg) return;
      const [a, b] = rand() > 0.5 ? seg : [seg[1], seg[0]];
      lines.push({ a, b, nx, ny, slide: (rand() > 0.5 ? 1 : -1) * (30 + rand() * 40) });
    })
  );

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

  function stroke(ctx: CanvasRenderingContext2D, path: () => void, alpha: number, width = LINE_WIDTH) {
    // Soft halo, then the hairline core
    ctx.globalAlpha = alpha * 0.1;
    ctx.lineWidth = width * 4;
    ctx.strokeStyle = 'rgb(170,190,255)';
    ctx.beginPath();
    path();
    ctx.stroke();
    ctx.globalAlpha = alpha;
    ctx.lineWidth = width;
    ctx.strokeStyle = 'rgb(235,240,255)';
    ctx.beginPath();
    path();
    ctx.stroke();
  }

  function draw(ctx: CanvasRenderingContext2D, t: number) {
    const fade = 1 - easeOutCubic(ramp(t, CONSTRUCT.fadeStart, CONSTRUCT.fadeDur));
    if (fade <= 0) return;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';

    // Once the logo starts tracing, the guides step back so it reads first
    const focus = 1 - 0.55 * easeInOutCubic(ramp(t, CONSTRUCT.outlineStart, 0.8));

    // Guides: a comet glides across the screen, easing in and out, drawing
    // the line behind it as the line drifts sideways into place; once there it
    // settles to a faint hairline
    for (const g of guides) {
      const k = ramp(t, g.start, g.dur);
      if (k <= 0) continue;
      const e = easeInOutCubic(k);
      const off = g.slide * (1 - easeOutCubic(ramp(t, g.start, g.dur * 1.3)));
      const ox = g.nx * off;
      const oy = g.ny * off;
      const ax = g.a.x + ox;
      const ay = g.a.y + oy;
      const hx = ax + (g.b.x - g.a.x) * e;
      const hy = ay + (g.b.y - g.a.y) * e;
      const settle = easeOutCubic(ramp(t, g.start + g.dur * 0.7, 0.8));
      const alpha = (0.5 - 0.32 * settle) * focus * fade;
      stroke(ctx, () => {
        ctx.moveTo(ax, ay);
        ctx.lineTo(hx, hy);
      }, alpha);

      if (k < 1) {
        // Comet tail: a bright fade along the last stretch behind the head
        const len = Math.hypot(g.b.x - g.a.x, g.b.y - g.a.y) || 1;
        const tail = Math.min(TAIL, len * e);
        const tx = hx - ((g.b.x - g.a.x) / len) * tail;
        const ty = hy - ((g.b.y - g.a.y) / len) * tail;
        const glow = Math.sin(Math.PI * k); // brightest mid-flight
        const grad = ctx.createLinearGradient(tx, ty, hx, hy);
        grad.addColorStop(0, 'rgba(235,240,255,0)');
        grad.addColorStop(1, `rgba(255,255,255,${0.85 * glow * fade})`);
        ctx.globalAlpha = 1;
        ctx.strokeStyle = grad;
        ctx.lineWidth = LINE_WIDTH * 1.6;
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(hx, hy);
        ctx.stroke();
      }
    }

    // The flat logo traces itself, piece by piece, then fills faintly; it
    // hands over to the 3D wireframe as that tilts away
    const outlineFade = 1 - easeInOutCubic(ramp(t, CONSTRUCT.to3dStart + 0.1, 0.7));
    outline.forEach((poly, i) => {
      const k = easeInOutCubic(ramp(t, CONSTRUCT.outlineStart + i * 0.14, CONSTRUCT.outlineDur));
      if (k <= 0 || outlineFade <= 0) return;
      let len = 0;
      poly.forEach((p, j) => {
        const q = poly[(j + 1) % poly.length];
        len += Math.hypot(q.x - p.x, q.y - p.y);
      });
      const path = () => {
        ctx.moveTo(poly[0].x, poly[0].y);
        for (let j = 1; j <= poly.length; j++) ctx.lineTo(poly[j % poly.length].x, poly[j % poly.length].y);
      };
      ctx.setLineDash([len * k, len]);
      stroke(ctx, path, 0.9 * outlineFade, LINE_WIDTH * 1.5);
      ctx.setLineDash([]);
      const fill = easeInOutCubic(ramp(t, CONSTRUCT.outlineStart + 0.7, 0.8)) * outlineFade;
      if (fill > 0) {
        ctx.globalAlpha = 0.05 * fill;
        ctx.fillStyle = 'rgb(200,215,255)';
        ctx.beginPath();
        path();
        ctx.fill();
      }
    });

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
