'use client';

import { useEffect, useRef } from 'react';
import type { BlueprintData } from '@/lib/blueprintGuides';

// ---------------------------------------------------------------------------
// StatueBuild
// The Statue of Liberty, built from the ground up in five bands as
// `progress` runs 0 → 5, one band per focus area, each drawn the way that
// discipline works:
//
//   0  Enterprise Architecture  stone base   construction lines grow in
//   1  AI & Automation          pedestal     points of light stream in and
//                                            settle like data
//   2  360° Branding            lower robe   the silhouette, traced in one
//                                            continuous stroke
//   3  Neo Marketing & Digital  torso        a halftone of dots resolves
//   4  Advertising              arm & torch  the torch ignites; its light
//                                            floods down the whole figure
//
// As each band finishes, the shaded drawing (the ink) settles into it, so the
// five techniques end as one finished figure. Everything follows the scroll,
// so scrolling back takes it apart again. Lines and outline come from
// scripts/trace-blueprint.py, in the image's own pixels.
// ---------------------------------------------------------------------------

interface Props {
  data: BlueprintData;
  src: string;
  progress: React.RefObject<number>;
  label: string;
}

// Band edges, as shares of the height from the torch (0) to the ground (1)
const EDGES = [1, 0.82, 0.48, 0.3, 0.14, 0];
const INK = 0.85; // the finished drawing's brightness
const SAMPLE = 4; // the ink is sampled at 1/4 size for the dots

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const ease = (t: number) => -(Math.cos(Math.PI * clamp01(t)) - 1) / 2;
const easeOut = (t: number) => 1 - Math.pow(1 - clamp01(t), 3);

// A fixed pseudo-random number for i, k (same on every visit)
const seeded = (i: number, k: number) => {
  const x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

export default function StatueBuild({ data, src, progress, label }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const { w, h } = data;

    // --- Bands, in image px (y from top) --------------------------------------
    const outline = data.outline[0] ?? [];
    let top = Infinity;
    let torch: [number, number] = [w / 2, 0];
    for (const [x, y] of outline) {
      if (y < top) {
        top = y;
        torch = [x, y];
      }
    }
    const ground = data.ground[1];
    const yAt = (f: number) => top + (ground - top) * f;
    // bands[k] = [yTop, yBottom]; band 0 is the base, so it runs to below the ground line
    const bands = [0, 1, 2, 3, 4].map((k) => [yAt(EDGES[k + 1]), k === 0 ? ground + 6 : yAt(EDGES[k])] as [number, number]);
    const inBand = (k: number, y: number) => y >= bands[k][0] && y <= bands[k][1];

    // --- Band 0: the straight lines in the base ---------------------------
    const baseLines = data.lines
      .filter((l) => inBand(0, (l[1] + l[3]) / 2))
      .map((l, i) => ({ l, order: clamp01((1 - ((l[1] + l[3]) / 2 - bands[0][0]) / (bands[0][1] - bands[0][0])) * 0.8 + seeded(i, 9) * 0.2) }));

    // --- Band 2: the outline's sides through the robe, each drawn upward --
    const robe: [number, number][][] = [];
    let run: [number, number][] = [];
    for (const p of [...outline, outline[0]]) {
      if (p && inBand(2, p[1])) run.push([p[0], p[1]]);
      else if (run.length) {
        robe.push(run);
        run = [];
      }
    }
    if (run.length) robe.push(run);
    const robePaths = robe
      .filter((r) => r.length > 1)
      .map((r) => {
        const pts = r[0][1] < r[r.length - 1][1] ? [...r].reverse() : r; // from the bottom up
        const cum = [0];
        for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
        return { pts, cum, len: cum[cum.length - 1] };
      });

    // --- The ink, and dots sampled from it ----------------------------------
    const img = new Image();
    img.decoding = 'async';
    img.src = `${src}?v=${data.v}`;
    let particles: { x: number; y: number; sx: number; sy: number; d: number }[] = [];
    let halftone: { x: number; y: number; r: number; d: number }[] = [];
    let ready = false;
    img.onload = () => {
      const sw = Math.round(w / SAMPLE);
      const sh = Math.round(h / SAMPLE);
      const off = document.createElement('canvas');
      off.width = sw;
      off.height = sh;
      const octx = off.getContext('2d', { willReadFrequently: true })!;
      octx.drawImage(img, 0, 0, sw, sh);
      const a = octx.getImageData(0, 0, sw, sh).data;
      const alphaAt = (x: number, y: number) => a[(Math.min(sh - 1, Math.round(y / SAMPLE)) * sw + Math.min(sw - 1, Math.round(x / SAMPLE))) * 4 + 3] / 255;

      // Band 1: points of light where the ink is, streaming in from the right
      particles = [];
      let i = 0;
      for (let y = bands[1][0]; y < bands[1][1]; y += 7) {
        for (let x = 0; x < w; x += 7) {
          if (alphaAt(x, y) < 0.3) continue;
          const up = (y - bands[1][0]) / (bands[1][1] - bands[1][0]);
          particles.push({
            x,
            y,
            sx: w + 40 + seeded(i, 1) * 260,
            sy: y + (seeded(i, 2) - 0.5) * 260,
            d: (1 - up) * 0.45 + seeded(i, 3) * 0.15,
          });
          i++;
        }
      }
      // Band 3: a halftone, each dot as big as the ink is dark there
      halftone = [];
      const cell = 11;
      i = 0;
      for (let y = bands[3][0]; y < bands[3][1]; y += cell) {
        for (let x = (Math.floor(y / cell) % 2) * (cell / 2); x < w; x += cell) {
          const al = alphaAt(x, y);
          if (al < 0.08) continue;
          halftone.push({ x, y, r: cell * 0.5 * Math.sqrt(al), d: seeded(i, 4) * 0.5 });
          i++;
        }
      }
      ready = true;
    };

    // --- Size -------------------------------------------------------------
    let cw = 0;
    let ch = 0;
    let dpr = 1;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      cw = canvas.clientWidth;
      ch = canvas.clientHeight;
      canvas.width = Math.round(cw * dpr);
      canvas.height = Math.round(ch * dpr);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    // --- Frame ------------------------------------------------------------
    let shown = 0;
    let vel = 0;
    let raf = 0;
    let visible = false;
    let last = performance.now();
    const start = last;

    const frame = (now: number) => {
      raf = 0;
      if (!visible) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const t = (now - start) / 1000;
      // A critically damped spring on the scroll: silky, no overshoot
      const target = Math.min(5, Math.max(0, progress.current ?? 0));
      if (reduced) shown = target;
      else {
        const k = 30;
        vel += ((target - shown) * k - vel * 2 * Math.sqrt(k)) * dt;
        shown += vel * dt;
      }
      const p = shown;
      const f = (k: number) => clamp01(p - k); // each band's own 0 → 1
      const s = cw / w; // css px per image px
      const X = (x: number) => x * s;
      const Y = (y: number) => y * s;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cw, ch);
      ctx.lineCap = 'round';

      // The ink, settled into a band
      const ink = (k: number, alpha: number) => {
        if (!ready || alpha <= 0.002) return;
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, Y(bands[k][0]), cw, Y(bands[k][1] - bands[k][0]));
        ctx.clip();
        ctx.globalAlpha = alpha;
        ctx.drawImage(img, 0, 0, cw, ch);
        ctx.restore();
      };

      // 0 · Base: construction lines grow in, then the ink settles
      {
        const k = f(0);
        if (k > 0) {
          const settle = ease((k - 0.6) / 0.4);
          ctx.lineWidth = 1;
          for (const { l, order } of baseLines) {
            const g = ease((k - order * 0.45) / 0.4);
            if (g <= 0) continue;
            ctx.strokeStyle = `rgba(255,255,255,${(0.8 - 0.5 * settle).toFixed(3)})`;
            ctx.beginPath();
            if (l[0] === l[2]) {
              const foot = Math.max(l[1], l[3]);
              ctx.moveTo(X(l[0]), Y(foot));
              ctx.lineTo(X(l[0]), Y(foot - Math.abs(l[3] - l[1]) * g));
            } else {
              const mid = (l[0] + l[2]) / 2;
              const half = Math.abs(l[2] - l[0]) / 2;
              ctx.moveTo(X(mid - half * g), Y(l[1]));
              ctx.lineTo(X(mid + half * g), Y(l[1]));
            }
            ctx.stroke();
          }
          // The ground line, run out from the middle
          const gl = ease(k / 0.5);
          ctx.strokeStyle = 'rgba(255,255,255,0.4)';
          ctx.beginPath();
          ctx.moveTo(X(w / 2 - (w / 2) * gl), Y(ground));
          ctx.lineTo(X(w / 2 + (w / 2) * gl), Y(ground));
          ctx.stroke();
          ink(0, INK * settle);
        }
      }

      // 1 · Pedestal: points of light stream in from the right and settle
      {
        const k = f(1);
        if (k > 0 && ready) {
          const settle = ease((k - 0.7) / 0.3);
          ctx.fillStyle = `rgba(255,255,255,${(0.85 * (1 - settle)).toFixed(3)})`;
          const size = Math.max(1, s * 2.4);
          for (const q of particles) {
            const m = easeOut((k - q.d) / 0.4);
            if (m <= 0) continue;
            ctx.fillRect(X(q.sx + (q.x - q.sx) * m) - size / 2, Y(q.sy + (q.y - q.sy) * m) - size / 2, size, size);
          }
          ink(1, INK * settle);
        }
      }

      // 2 · Robe: its sides traced upward in one stroke each, a bright pen
      //     point leading; then the ink settles
      {
        const k = f(2);
        if (k > 0) {
          const draw = ease(k / 0.65);
          const settle = ease((k - 0.6) / 0.4);
          ctx.lineWidth = 1.25;
          ctx.strokeStyle = `rgba(255,255,255,${(0.9 - 0.55 * settle).toFixed(3)})`;
          for (const path of robePaths) {
            const upto = path.len * draw;
            ctx.beginPath();
            ctx.moveTo(X(path.pts[0][0]), Y(path.pts[0][1]));
            let hx = path.pts[0][0];
            let hy = path.pts[0][1];
            for (let i = 1; i < path.pts.length; i++) {
              if (path.cum[i] <= upto) {
                [hx, hy] = path.pts[i];
                ctx.lineTo(X(hx), Y(hy));
              } else {
                const u = (upto - path.cum[i - 1]) / (path.cum[i] - path.cum[i - 1]);
                hx = path.pts[i - 1][0] + (path.pts[i][0] - path.pts[i - 1][0]) * u;
                hy = path.pts[i - 1][1] + (path.pts[i][1] - path.pts[i - 1][1]) * u;
                ctx.lineTo(X(hx), Y(hy));
                break;
              }
            }
            ctx.stroke();
            if (draw < 1) {
              const glow = ctx.createRadialGradient(X(hx), Y(hy), 0, X(hx), Y(hy), 9);
              glow.addColorStop(0, 'rgba(255,255,255,0.9)');
              glow.addColorStop(1, 'rgba(255,255,255,0)');
              ctx.fillStyle = glow;
              ctx.fillRect(X(hx) - 9, Y(hy) - 9, 18, 18);
            }
          }
          ink(2, INK * settle);
        }
      }

      // 3 · Torso: a halftone of dots grows in, then gives way to the ink
      {
        const k = f(3);
        if (k > 0 && ready) {
          const settle = ease((k - 0.65) / 0.35);
          ctx.fillStyle = `rgba(255,255,255,${(0.9 * (1 - settle * 0.85)).toFixed(3)})`;
          ctx.beginPath();
          for (const d of halftone) {
            const g = easeOut((k - d.d) / 0.35);
            if (g <= 0) continue;
            const r = Math.max(0.3, d.r * g * s);
            ctx.moveTo(X(d.x) + r, Y(d.y));
            ctx.arc(X(d.x), Y(d.y), r, 0, Math.PI * 2);
          }
          ctx.fill();
          ink(3, INK * settle);
        }
      }

      // 4 · Arm and torch: the torch ignites, its light spreads up the arm,
      //     then floods down the whole figure
      {
        const k = f(4);
        if (k > 0) {
          const [tx, ty] = torch;
          // The ink in this band, opening out from the torch
          if (ready) {
            const reach = ease(k / 0.6) * (bands[4][1] - bands[4][0]) * 2.2;
            ctx.save();
            ctx.beginPath();
            ctx.arc(X(tx), Y(ty), Math.max(0.1, Y(reach)), 0, Math.PI * 2);
            ctx.clip();
            ink(4, INK);
            ctx.restore();
          }
          // The flame: a glow that flickers once lit
          const lit = ease(k / 0.25);
          const flicker = reduced ? 1 : 0.85 + 0.15 * Math.sin(t * 9) * Math.sin(t * 5.3 + 1);
          const rad = Y(70) * (0.6 + 0.4 * lit);
          const flame = ctx.createRadialGradient(X(tx), Y(ty + 14), 0, X(tx), Y(ty + 14), rad);
          flame.addColorStop(0, `rgba(255,255,255,${(0.75 * lit * flicker).toFixed(3)})`);
          flame.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.fillStyle = flame;
          ctx.fillRect(X(tx) - rad, Y(ty + 14) - rad, rad * 2, rad * 2);

          // The flood: a band of light sweeps from the torch to the ground
          const flood = clamp01((k - 0.55) / 0.45);
          if (flood > 0 && flood < 1 && ready) {
            const front = top + (ground - top) * ease(flood);
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            ctx.beginPath();
            ctx.rect(0, Y(front - 120), cw, Y(140));
            ctx.clip();
            ctx.globalAlpha = 0.6 * Math.sin(Math.PI * flood);
            ctx.drawImage(img, 0, 0, cw, ch);
            ctx.restore();
          }
        }
      }

      raf = requestAnimationFrame(frame);
    };

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !raf) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    });
    io.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
    };
  }, [data, src, progress]);

  return (
    <div className="relative w-full" style={{ aspectRatio: `${data.w} / ${data.h}` }} role="img" aria-label={label}>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
}
