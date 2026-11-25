'use client';

import { useEffect, useRef, type RefObject } from 'react';
import type { Service } from '@/data/redesign/content';
import { clamp, ease, isLite, isStill, mix, pinned, reveal, span, words } from './serviceMotion';
import css from './service.module.css';

// ---------------------------------------------------------------------------
// Dot scenes for the Intelligence practice, in the same language as its hero
// (a field of points of light, a ripple on click):
//   DotMatrixApproach  How we work as a dot-matrix board: each step's key word
//                      lights up in dots, then shimmers into the next
//   DotPicture         a photo drawn as a dot field that lights up in a
//                      scattered order (used for the case result)
// ---------------------------------------------------------------------------

/** A repeatable pseudo-random number in [0, 1) */
const rand = (seed: number) => {
  const v = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return v - Math.floor(v);
};

interface Grid { cols: number; rows: number; cell: number; ratio: number; w: number; h: number }

/** Sizes the canvas to its box and returns the dot grid that fills it */
function fitGrid(canvas: HTMLCanvasElement): Grid {
  const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  canvas.width = Math.round(w * ratio);
  canvas.height = Math.round(h * ratio);
  const cell = w < 700 ? 9 : Math.max(10, Math.round(w / 128));
  return { cols: Math.ceil(w / cell), rows: Math.ceil(h / cell), cell, ratio, w, h };
}

/** Brightness (0–1) of an image, one value per cell, fitted like object-fit: cover */
function sampleImage(image: HTMLImageElement, cols: number, rows: number) {
  const c = document.createElement('canvas');
  c.width = cols;
  c.height = rows;
  const x = c.getContext('2d', { willReadFrequently: true })!;
  const scale = Math.max(cols / image.naturalWidth, rows / image.naturalHeight);
  const dw = image.naturalWidth * scale, dh = image.naturalHeight * scale;
  x.drawImage(image, (cols - dw) / 2, (rows - dh) / 2, dw, dh);
  const d = x.getImageData(0, 0, cols, rows).data;
  const out = new Float32Array(cols * rows);
  for (let i = 0; i < out.length; i++) out[i] = (d[i * 4] * .299 + d[i * 4 + 1] * .587 + d[i * 4 + 2] * .114) / 255;
  return out;
}

/** Which cells a word covers (0–1), set large in a band of the grid */
function sampleWord(word: string, cols: number, rows: number, band: { top: number; bottom: number }, font: string) {
  const c = document.createElement('canvas');
  c.width = cols;
  c.height = rows;
  const x = c.getContext('2d', { willReadFrequently: true })!;
  const height = (band.bottom - band.top) * rows;
  let size = height * .9;
  x.font = `400 ${size}px ${font}`;
  const fit = x.measureText(word).width;
  if (fit > cols * .9) size *= cols * .9 / fit;
  x.font = `400 ${size}px ${font}`;
  x.textAlign = 'center';
  x.textBaseline = 'middle';
  x.fillStyle = '#fff';
  x.fillText(word, cols / 2, (band.top + band.bottom) / 2 * rows);
  const d = x.getImageData(0, 0, cols, rows).data;
  const out = new Float32Array(cols * rows);
  for (let i = 0; i < out.length; i++) out[i] = d[i * 4 + 3] / 255;
  return out;
}

/**
 * Runs `draw` every animation frame while the element is on screen, and
 * sends a ripple from wherever the element is clicked.
 */
function useDotCanvas(ref: RefObject<HTMLElement | null>, draw: (el: HTMLElement, time: number, ripple: { at: number; x: number; y: number }) => void) {
  const latest = useRef(draw);
  useEffect(() => { latest.current = draw; });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ripple = { at: -10, x: 0, y: 0 };
    const canvas = el.querySelector('canvas');
    const click = (e: PointerEvent) => {
      if (e.button !== 0 || !canvas) return;
      const box = canvas.getBoundingClientRect();
      Object.assign(ripple, { at: performance.now() / 1000, x: e.clientX - box.left, y: e.clientY - box.top });
    };
    el.addEventListener('pointerdown', click);
    let frame = 0;
    let visible = false;
    const loop = (time: number) => {
      latest.current(el, time / 1000, ripple);
      if (visible) frame = requestAnimationFrame(loop);
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      cancelAnimationFrame(frame);
      if (visible) frame = requestAnimationFrame(loop);
    });
    observer.observe(el);
    return () => { observer.disconnect(); cancelAnimationFrame(frame); el.removeEventListener('pointerdown', click); };
  }, [ref]);
}

/** Draws one frame of dots: `value(i)` (0–1) sets each dot's size and light */
function paintDots(context: CanvasRenderingContext2D, g: Grid, time: number, ripple: { at: number; x: number; y: number },
  value: (i: number) => number, jitter: (i: number) => number, dim = 1) {
  context.setTransform(g.ratio, 0, 0, g.ratio, 0, 0);
  context.clearRect(0, 0, g.w, g.h);
  const since = time - ripple.at;
  const front = since * 760;
  const size = 22 * Math.exp(-since * 1.6);
  for (let row = 0; row < g.rows; row++) {
    for (let col = 0; col < g.cols; col++) {
      const i = row * g.cols + col;
      const v = value(i);
      const phase = rand(i) * Math.PI * 2;
      let x = col * g.cell + g.cell / 2;
      let y = row * g.cell + g.cell / 2;
      const j = jitter(i);
      if (j > .001) { x += Math.sin(time * 3 + phase * 3) * j; y += Math.cos(time * 2.6 + phase * 5) * j; }
      if (size > .3) {
        const dx = x - ripple.x, dy = y - ripple.y;
        const r = Math.hypot(dx, dy) || 1;
        const wave = Math.exp(-((r - front) ** 2) / (2 * 70 * 70)) * Math.sin((r - front) / 24);
        x += dx / r * wave * size;
        y += dy / r * wave * size;
      }
      const twinkle = .8 + .2 * Math.sin(time * 2.2 + phase);
      const alpha = (.07 + v * .9) * twinkle * dim;
      if (alpha < .02) continue;
      context.fillStyle = `rgba(255,255,255,${alpha.toFixed(3)})`;
      // A square (the same block as the pixel wipes), sized by brightness
      const half = Math.max(.6, (.12 + v ** 1.3 * .32) * g.cell);
      context.fillRect(x - half, y - half, half * 2, half * 2);
    }
  }
}

// ---------------------------------------------------------------------------
// How we work: a dot-matrix board
// ---------------------------------------------------------------------------
export function DotMatrixApproach({ steps, keywords }: { steps: Service['steps']; keywords: string[] }) {
  const root = useRef<HTMLElement>(null);
  const n = steps.length;
  const board = useRef<{ g: Grid; masks: Float32Array[]; delay: Float32Array } | null>(null);

  // Lay out each key word on the dot grid (once fonts are ready, and on resize)
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const canvas = el.querySelector('canvas')!;
    const build = () => {
      if (!canvas.clientWidth || !canvas.clientHeight) return;
      const g = fitGrid(canvas);
      const font = getComputedStyle(el).fontFamily;
      const narrow = g.w < 760;
      const band = narrow ? { top: .2, bottom: .42 } : { top: .14, bottom: .56 };
      const masks = keywords.slice(0, n).map(word => sampleWord(word, g.cols, g.rows, band, font));
      const delay = new Float32Array(g.cols * g.rows).map((_, i) => rand(i + 7) * .45);
      board.current = { g, masks, delay };
    };
    document.fonts.ready.then(build);
    const resize = new ResizeObserver(build);
    resize.observe(canvas);
    return () => resize.disconnect();
  }, [keywords, n]);

  useDotCanvas(root, (el, time, ripple) => {
    const still = isStill();
    const t = still ? 0 : pinned(el);
    // Hold on each word, then shimmer across to the next
    const u = span(t, .04, .92) * (n - 1 + .5);
    const k = Math.min(n - 1, Math.floor(u));
    const local = u - k;
    const change = k < n - 1 ? span(local, .62, 1) : 0;
    const at = still ? 0 : k + ease(change);

    const canvas = el.querySelector('canvas')!;
    const context = canvas.getContext('2d');
    const b = board.current;
    if (context && b && !isLite()) {
      const from = b.masks[k] ?? b.masks[0];
      const to = b.masks[Math.min(n - 1, k + 1)] ?? from;
      paintDots(context, b.g, time, ripple,
        i => {
          // Each dot changes at its own moment, so the word shimmers across
          const m = clamp((change - b.delay[i]) / .5);
          return mix(from[i], to[i], ease(m));
        },
        i => {
          const m = clamp((change - b.delay[i]) / .5);
          const moving = Math.abs(from[i] - to[i]) * 4 * m * (1 - m);
          return moving * b.g.cell * 1.6;
        });
    }

    // The step's words along the foot of the screen
    el.querySelectorAll<HTMLElement>('[data-step-copy]').forEach((copy, i) => {
      const amount = still ? 1 : clamp(1 - Math.abs(at - i) * 2.4);
      copy.style.visibility = amount > 0 ? 'visible' : 'hidden';
      reveal([...copy.querySelectorAll<HTMLElement>('[data-w]')], amount, still);
    });
    const counter = el.querySelector<HTMLElement>('[data-step-count]');
    if (counter) counter.textContent = String(Math.round(at) + 1).padStart(2, '0');
  });

  return <section className={css.dotBoard} ref={root} id="approach" style={{ height: `${(n + 1) * 100}svh` }}>
    <div className={css.dotBoardStage}>
      <canvas className={css.dotCanvas} aria-hidden="true" />
      <p className={css.stepMeta}><span>How we work</span><span><b data-step-count>01</b> / {String(n).padStart(2, '0')}</span></p>
      {steps.map((step, i) => <div className={css.networkCopy} data-step-copy key={step.title}>
        <h3>{words(`${String(i + 1).padStart(2, '0')} · ${step.title}`)}</h3>
        <p>{words(step.body)}</p>
      </div>)}
    </div>
  </section>;
}

// ---------------------------------------------------------------------------
// A photo as a dot field, lighting up in a scattered order as `progress` grows
// ---------------------------------------------------------------------------
export function DotPicture({ src, progress, dim = 1 }: { src: string; progress: () => number; dim?: number }) {
  const root = useRef<HTMLDivElement>(null);
  const picture = useRef<{ g: Grid; light: Float32Array; delay: Float32Array } | null>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const canvas = el.querySelector('canvas')!;
    const image = new window.Image();
    const build = () => {
      // Not until the photo has loaded and the canvas has a size (it has none while hidden)
      if (!image.naturalWidth || !canvas.clientWidth || !canvas.clientHeight) return;
      const g = fitGrid(canvas);
      picture.current = { g, light: sampleImage(image, g.cols, g.rows), delay: new Float32Array(g.cols * g.rows).map((_, i) => rand(i + 3) * .7) };
    };
    image.onload = build;
    image.src = src;
    const resize = new ResizeObserver(build);
    resize.observe(canvas);
    return () => { resize.disconnect(); image.onload = null; };
  }, [src]);

  useDotCanvas(root, (el, time, ripple) => {
    const canvas = el.querySelector('canvas')!;
    const context = canvas.getContext('2d');
    const p = picture.current;
    if (!context || !p || isLite()) return;
    const shown = isStill() ? 1 : progress();
    paintDots(context, p.g, time, ripple,
      i => p.light[i] * ease(clamp((shown - p.delay[i]) / .3)),
      i => { const m = clamp((shown - p.delay[i]) / .3); return (1 - m) * m * 4 * p.g.cell * 1.2; },
      dim);
  });

  return <div className={css.dotPicture} ref={root}><canvas className={css.dotCanvas} aria-hidden="true" /></div>;
}
