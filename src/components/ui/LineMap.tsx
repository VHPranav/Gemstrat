'use client';

import { useEffect, useRef } from 'react';
import world from '@/data/worldDots.json';

// ---------------------------------------------------------------------------
// LineMap
// The world as faint dots, with Gemstrat's five cities joined by thin arcs.
// Driven by `progress` (0 → 1, from the scroll):
//   0 → 0.3    the dots sweep in from the left
//   0.25 → 0.9 the arcs draw one after another, each led by a bright point;
//              as an arc lands, its city pulses and its label comes in
// Once drawn, small points of light keep travelling along the arcs.
// The dots come from src/data/worldDots.json (made once with the dotted-map
// package; it isn't shipped). Labels are HTML, laid over by the caller via
// `onCity` so they can hold live times.
// ---------------------------------------------------------------------------

export interface MapCity {
  name: string;
  x: number; // map units (world.w × world.h)
  y: number;
}

export const MAP_W = world.w;
export const MAP_H = world.h;
export const MAP_CITIES: MapCity[] = world.pins;

// The arcs, as pairs of cities, in drawing order
const ARCS: [string, string][] = [
  ['Toronto', 'New York'],
  ['New York', 'Dubai'],
  ['Dubai', 'Mumbai'],
  ['Dubai', 'Nairobi'],
];
const DOTS_END = 0.3;
const ARCS_AT = 0.25;
const ARCS_END = 0.9;

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const ease = (t: number) => -(Math.cos(Math.PI * clamp01(t)) - 1) / 2;

/** When each city lands (0 → 1 of progress): when the first arc into it ends */
export function cityLandsAt(name: string) {
  const span = (ARCS_END - ARCS_AT) / ARCS.length;
  const i = ARCS.findIndex(([a, b]) => a === name || b === name);
  if (i < 0) return ARCS_END;
  const [a] = ARCS[i];
  return ARCS_AT + span * (a === name ? i : i + 1);
}

interface Props {
  progress: React.RefObject<number>;
}

export default function LineMap({ progress }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const byName = new Map(MAP_CITIES.map((c) => [c.name, c]));

    // Each arc as points along a curve that lifts northwards
    const arcs = ARCS.map(([a, b]) => {
      const p = byName.get(a)!;
      const q = byName.get(b)!;
      const dist = Math.hypot(q.x - p.x, q.y - p.y);
      const cx = (p.x + q.x) / 2;
      const cy = (p.y + q.y) / 2 - dist * 0.32;
      const pts: [number, number][] = [];
      for (let i = 0; i <= 64; i++) {
        const t = i / 64;
        const u = 1 - t;
        pts.push([u * u * p.x + 2 * u * t * cx + t * t * q.x, u * u * p.y + 2 * u * t * cy + t * t * q.y]);
      }
      return { pts, to: q };
    });

    // The dots, drawn once per size onto a layer
    const layer = document.createElement('canvas');
    let W = 0;
    let H = 0;
    let dpr = 1;
    let s = 1; // px per map unit
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.clientWidth;
      H = canvas.clientHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      s = W / MAP_W;
      layer.width = canvas.width;
      layer.height = canvas.height;
      const l = layer.getContext('2d')!;
      l.setTransform(dpr, 0, 0, dpr, 0, 0);
      l.fillStyle = 'rgba(255,255,255,0.2)';
      const r = Math.max(0.6, s * 0.22);
      l.beginPath();
      for (const [x, y] of world.dots) {
        l.moveTo(x * s + r, y * s);
        l.arc(x * s, y * s, r, 0, Math.PI * 2);
      }
      l.fill();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    let raf = 0;
    let visible = false;
    let shown = 0;
    let vel = 0;
    let last = performance.now();
    const start = last;

    const frame = (now: number) => {
      raf = 0;
      if (!visible) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const t = (now - start) / 1000;
      // Softened, so it glides between scroll ticks
      const target = clamp01(progress.current ?? 0);
      if (reduced) shown = target;
      else {
        const k = 60;
        vel += ((target - shown) * k - vel * 2 * Math.sqrt(k)) * dt;
        shown += vel * dt;
      }
      const p = shown;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Dots: a soft-edged sweep from the left
      const sweep = reduced ? 1 : ease(p / DOTS_END);
      if (sweep > 0) {
        ctx.drawImage(layer, 0, 0);
        const edge = sweep * 1.25 * canvas.width;
        const g = ctx.createLinearGradient(edge - canvas.width * 0.25, 0, edge, 0);
        g.addColorStop(0, 'rgba(0,0,0,1)');
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.globalCompositeOperation = 'destination-in';
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = 'source-over';
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.lineCap = 'round';
      const span = (ARCS_END - ARCS_AT) / arcs.length;
      arcs.forEach((arc, i) => {
        const f = reduced ? clamp01((p - ARCS_AT) / (ARCS_END - ARCS_AT)) : ease((p - ARCS_AT - span * i) / span);
        if (f <= 0) return;
        const n = Math.max(1, Math.round(f * (arc.pts.length - 1)));
        // The arc so far
        ctx.strokeStyle = 'rgba(255,255,255,0.45)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        arc.pts.slice(0, n + 1).forEach(([x, y], k) => (k ? ctx.lineTo(x * s, y * s) : ctx.moveTo(x * s, y * s)));
        ctx.stroke();
        // Its bright head while drawing
        if (f < 1) {
          const [hx, hy] = arc.pts[n];
          const glow = ctx.createRadialGradient(hx * s, hy * s, 0, hx * s, hy * s, 10);
          glow.addColorStop(0, 'rgba(255,255,255,0.9)');
          glow.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.fillStyle = glow;
          ctx.fillRect(hx * s - 10, hy * s - 10, 20, 20);
        } else if (!reduced) {
          // Drawn: a point of light keeps travelling along it
          const k = ((t * 0.22 + i * 0.37) % 1) * (arc.pts.length - 1);
          const [lx, ly] = arc.pts[Math.floor(k)];
          const light = ctx.createRadialGradient(lx * s, ly * s, 0, lx * s, ly * s, 6);
          light.addColorStop(0, 'rgba(255,255,255,0.7)');
          light.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.fillStyle = light;
          ctx.fillRect(lx * s - 6, ly * s - 6, 12, 12);
        }
      });

      // Cities: a dot, a ring that pulses as it lands, then breathes
      for (const c of MAP_CITIES) {
        const at = cityLandsAt(c.name);
        const k = clamp01((p - at) / 0.04);
        if (k <= 0) continue;
        const x = c.x * s;
        const y = c.y * s;
        ctx.fillStyle = `rgba(255,255,255,${0.95 * k})`;
        ctx.beginPath();
        ctx.arc(x, y, 2.4, 0, Math.PI * 2);
        ctx.fill();
        const landPulse = clamp01((p - at) / 0.08);
        const breathe = reduced ? 0 : (t * 0.6 + c.x * 0.05) % 1;
        const ring = landPulse < 1 ? landPulse : breathe;
        ctx.strokeStyle = `rgba(255,255,255,${0.5 * (1 - ring) * k})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x, y, 3 + ring * 14, 0, Math.PI * 2);
        ctx.stroke();
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
  }, [progress]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" aria-hidden="true" />;
}
