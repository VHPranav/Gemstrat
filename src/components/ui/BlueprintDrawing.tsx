'use client';

import { useEffect, useRef } from 'react';
import { blueprintGuides, guideHandoff, type BlueprintData } from '@/lib/blueprintGuides';

export type { BlueprintData };

// ---------------------------------------------------------------------------
// BlueprintDrawing
// An architect's elevation that builds itself as `progress` runs 0 → 4, one
// stage per step of the Approach:
//   0–1 Diagnose  thin construction lines run across the sheet (on the
//                 Approach page they arrive from the hero's skeleton S, see
//                 SkeletonMorph)
//   1–2 Design    the building's straight edges and outline draw in, from
//                 the ground up
//   2–3 Deliver   the shaded drawing soaks in from the top, in blots, like
//                 ink into paper
//   3–4 Sustain   the construction lines step back; a crosshair reads out
//                 where the pointer is
// Scrolling back runs it in reverse (the ink drains up the way it came).
// The lines come from scripts/trace-blueprint.py, in the image's own pixels,
// so they always land on the drawing.
// ---------------------------------------------------------------------------

interface Props {
  data: BlueprintData;
  src: string;
  progress: React.RefObject<number>;
  label: string;
}

const MASK_W = 384;
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const ease = (t: number) => t * t * (3 - 2 * t);

// Value noise for the ink's blots
function makeNoise(seed: number) {
  const hash = (x: number, y: number) => {
    const s = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453;
    return s - Math.floor(s);
  };
  return (x: number, y: number) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const xf = x - xi;
    const yf = y - yi;
    const u = xf * xf * (3 - 2 * xf);
    const v = yf * yf * (3 - 2 * yf);
    const a = hash(xi, yi);
    const b = hash(xi + 1, yi);
    const c = hash(xi, yi + 1);
    const d = hash(xi + 1, yi + 1);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  };
}

export default function BlueprintDrawing({ data, src, progress, label }: Props) {
  const boxRef = useRef<HTMLDivElement>(null);
  const guideRefs = useRef<(SVGLineElement | null)[]>([]);
  const lineRefs = useRef<(SVGLineElement | null)[]>([]);
  const outlineRefs = useRef<(SVGPolygonElement | null)[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const crossRef = useRef<HTMLDivElement>(null);
  const readoutRef = useRef<HTMLSpanElement>(null);

  const { w, h } = data;
  const guideLines = blueprintGuides(data);
  const groundY = data.ground[1];
  // Straight edges draw from the ground up, with a little shuffle
  const lineOrder = data.lines.map((l, i) => clamp01((1 - Math.max(l[1], l[3]) / groundY) * 0.85 + ((i * 0.618) % 1) * 0.15));

  useEffect(() => {
    const box = boxRef.current;
    const canvas = canvasRef.current;
    if (!box || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // When each pixel of the ink's mask gets its turn: mostly top to bottom,
    // broken up by blotchy noise at three sizes and a little grain
    const mw = MASK_W;
    const mh = Math.round((MASK_W * h) / w);
    const field = new Float32Array(mw * mh);
    const noise = makeNoise(3.1);
    for (let y = 0; y < mh; y++)
      for (let x = 0; x < mw; x++) {
        const blot = noise(x / 40, y / 40) * 0.55 + noise(x / 16, y / 16) * 0.3 + noise(x / 6, y / 6) * 0.15;
        field[y * mw + x] = (y / mh) * 0.62 + blot * 0.32 + Math.random() * 0.06;
      }
    const mask = document.createElement('canvas');
    mask.width = mw;
    mask.height = mh;
    const mctx = mask.getContext('2d')!;
    const maskData = mctx.createImageData(mw, mh);

    const img = new Image();
    img.decoding = 'async';
    img.src = `${src}?v=${data.v}`;
    let imgReady = false;
    img.onload = () => {
      imgReady = true;
      lastInk = -1;
    };

    let cw = 0;
    let ch = 0;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cw = canvas.width = Math.round(canvas.clientWidth * dpr);
      ch = canvas.height = Math.round(canvas.clientHeight * dpr);
      lastInk = -1;
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // The ink's front: T runs a little past both ends so it starts and
    // finishes clean
    let lastInk = -1;
    const drawInk = (t: number) => {
      if (!imgReady || !cw) return;
      if (Math.abs(t - lastInk) < 0.0005) return;
      lastInk = t;
      ctx.clearRect(0, 0, cw, ch);
      if (t <= 0) return;
      const T = -0.06 + t * 1.14;
      const px = maskData.data;
      for (let i = 0; i < field.length; i++) {
        const a = clamp01((T - field[i]) / 0.05);
        px[i * 4 + 3] = a * 255;
      }
      mctx.putImageData(maskData, 0, 0);
      ctx.globalCompositeOperation = 'source-over';
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(mask, 0, 0, cw, ch);
      ctx.globalCompositeOperation = 'source-in';
      ctx.drawImage(img, 0, 0, cw, ch);
      ctx.globalCompositeOperation = 'source-over';
    };

    // Crosshair, once the drawing is finished
    let crossOn = false;
    const onMove = (e: PointerEvent) => {
      const cross = crossRef.current;
      if (!cross) return;
      const r = box.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      const inside = x >= 0 && y >= 0 && x <= r.width && y <= r.height;
      cross.style.opacity = crossOn && inside ? '1' : '0';
      cross.style.setProperty('--x', `${x}px`);
      cross.style.setProperty('--y', `${y}px`);
      if (readoutRef.current) {
        const ix = String(Math.round((x / r.width) * w)).padStart(4, '0');
        const iy = String(Math.round((y / r.height) * h)).padStart(4, '0');
        readoutRef.current.textContent = `x ${ix} · y ${iy}`;
      }
    };
    const onLeave = () => {
      if (crossRef.current) crossRef.current.style.opacity = '0';
    };
    box.addEventListener('pointermove', onMove);
    box.addEventListener('pointerleave', onLeave);

    // A critically damped spring on the scroll position: silky, no overshoot
    let shown = 0;
    let vel = 0;
    let last = performance.now();
    let lastShown = -1;
    let lastReveal = -1;
    let raf = 0;
    let visible = false;

    const render = (p: number) => {
      const diag = clamp01(p);
      const design = clamp01(p - 1);
      const deliver = clamp01(p - 2);
      const sustain = clamp01(p - 3);

      // Construction lines: handed over by the skeleton S (full length, as
      // it lands), or drawn across during Diagnose; then they step back
      const handed = guideHandoff.active;
      guideLines.forEach((g, i) => {
        const el = guideRefs.current[i];
        if (!el) return;
        const f = handed ? 1 : ease(clamp01((diag - g.order * 0.5) / 0.5));
        const shown = handed ? guideHandoff.reveal : f > 0 ? 1 : 0;
        el.setAttribute('x2', String(g.x1 + (g.x2 - g.x1) * f));
        el.setAttribute('y2', String(g.y1 + (g.y2 - g.y1) * f));
        el.style.opacity = String(shown * (0.32 - sustain * 0.22));
      });

      // Straight edges: verticals grow from their foot, horizontals from
      // their middle
      data.lines.forEach((l, i) => {
        const el = lineRefs.current[i];
        if (!el) return;
        const f = ease(clamp01((design - lineOrder[i] * 0.6) / 0.4));
        if (l[0] === l[2]) {
          const foot = Math.max(l[1], l[3]);
          const len = Math.abs(l[3] - l[1]);
          el.setAttribute('y1', String(foot));
          el.setAttribute('y2', String(foot - len * f));
        } else {
          const mid = (l[0] + l[2]) / 2;
          const half = Math.abs(l[2] - l[0]) / 2;
          el.setAttribute('x1', String(mid - half * f));
          el.setAttribute('x2', String(mid + half * f));
        }
        el.style.opacity = String(f > 0 ? 0.9 - deliver * 0.35 - sustain * 0.3 : 0);
      });

      // Outline: one stroke around the whole silhouette
      outlineRefs.current.forEach((el) => {
        if (!el) return;
        const f = ease(clamp01((design - 0.1) / 0.85));
        el.style.strokeDashoffset = String(1 - f);
        el.style.opacity = String(f > 0 ? 0.9 - deliver * 0.3 - sustain * 0.3 : 0);
      });

      // The ink soaking in
      drawInk(deliver);

      crossOn = sustain > 0.2;
      if (!crossOn && crossRef.current) crossRef.current.style.opacity = '0';
    };

    const frame = (now: number) => {
      raf = 0;
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      const target = Math.min(4, Math.max(0, progress.current ?? 0));
      const k = 30;
      vel += ((target - shown) * k - vel * 2 * Math.sqrt(k)) * dt;
      shown += vel * dt;
      if (Math.abs(shown - lastShown) > 0.0002 || lastInk < 0 || guideHandoff.reveal !== lastReveal) {
        lastShown = shown;
        lastReveal = guideHandoff.reveal;
        render(shown);
      }
      if (visible) raf = requestAnimationFrame(frame);
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !raf) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    });
    io.observe(box);
    resize();

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      box.removeEventListener('pointermove', onMove);
      box.removeEventListener('pointerleave', onLeave);
    };
    // The drawing's data is static for the life of the component
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress, src]);

  return (
    <div ref={boxRef} data-blueprint-box className="relative w-full" style={{ aspectRatio: `${w} / ${h}` }}>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" aria-hidden="true" />
      <svg
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full overflow-visible"
        role="img"
        aria-label={label}
      >
        <g stroke="#fff" fill="none" strokeLinecap="round" vectorEffect="non-scaling-stroke">
          {guideLines.map((g, i) => (
            <line
              key={`g${i}`}
              ref={(el) => {
                guideRefs.current[i] = el;
              }}
              x1={g.x1}
              y1={g.y1}
              x2={g.x1}
              y2={g.y1}
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
              style={{ opacity: 0 }}
            />
          ))}
          {data.outline.map((pts, i) => (
            <polygon
              key={`o${i}`}
              ref={(el) => {
                outlineRefs.current[i] = el;
              }}
              points={pts.map((p) => p.join(',')).join(' ')}
              pathLength={1}
              strokeDasharray="1"
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
              style={{ strokeDashoffset: 1, opacity: 0 }}
            />
          ))}
          {data.lines.map((l, i) => (
            <line
              key={`l${i}`}
              ref={(el) => {
                lineRefs.current[i] = el;
              }}
              x1={l[0]}
              y1={l[1]}
              x2={l[0]}
              y2={l[1]}
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
              style={{ opacity: 0 }}
            />
          ))}
        </g>
      </svg>

      {/* Crosshair */}
      <div
        ref={crossRef}
        className="absolute inset-0 pointer-events-none transition-opacity duration-300"
        style={{ opacity: 0 }}
        aria-hidden="true"
      >
        <div className="absolute left-0 right-0 h-px bg-white/35" style={{ top: 'var(--y)' }} />
        <div className="absolute top-0 bottom-0 w-px bg-white/35" style={{ left: 'var(--x)' }} />
        <span
          ref={readoutRef}
          className="absolute font-sans text-[10px] uppercase tracking-[0.08em] text-white/70 whitespace-nowrap"
          style={{ left: 'calc(var(--x) + 8px)', top: 'calc(var(--y) + 8px)' }}
        />
      </div>
    </div>
  );
}
