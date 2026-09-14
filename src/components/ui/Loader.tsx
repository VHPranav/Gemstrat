'use client';

import React, { useEffect, useRef, useState } from 'react';

interface Point {
  x: number;
  y: number;
}

interface Particle {
  startX: number;
  startY: number;
  textX: number;
  textY: number;
  fillX: number;
  fillY: number;
  seed: boolean;
  delay: number;
  moveDelay: number;
  curveX: number;
  curveY: number;
}

const DURATIONS = {
  formText: 1600, // scatter -> "GEMSTRAT" (slower dot travel)
  holdText: 400, // pause once formed
  toFillMove: 900, // text -> video-box grid (slower dot travel)
  toFillGrow: 450, // once in the grid, dots grow to fill the box solid
  crossfade: 700, // reveal real page underneath
};
// Total ≈ 4.05s

function sampleTextPoints(
  text: string,
  width: number,
  height: number,
  fontSize: number,
  step: number
): Point[] {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return [];

  ctx.fillStyle = '#fff';
  ctx.font = `700 ${fontSize}px Arial, Helvetica, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, width / 2, height / 2);

  const { data } = ctx.getImageData(0, 0, width, height);
  const points: Point[] = [];
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const alpha = data[(y * width + x) * 4 + 3];
      if (alpha > 128) points.push({ x, y });
    }
  }
  return points;
}

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export default function Loader() {
  const [visible, setVisible] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const squareRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      setVisible(false);
      return;
    }

    const totalDuration =
      DURATIONS.formText +
      DURATIONS.holdText +
      DURATIONS.toFillMove +
      DURATIONS.toFillGrow +
      DURATIONS.crossfade;

    // Safety net: never let a stuck/broken animation trap the site behind a black screen
    const safety = setTimeout(() => setVisible(false), totalDuration + 2000);

    document.body.style.overflow = 'hidden';

    let rafId: number | null = null;

    try {
      const canvas = canvasRef.current;
      const square = squareRef.current;
      if (!canvas || !square) throw new Error('Loader refs missing');

      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('2D context unavailable');

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.scale(dpr, dpr);

      // 1. Sample the "GEMSTRAT" wordmark into a dot-matrix point cloud
      const fontSize = Math.max(64, Math.min(w * 0.12, 190));
      // Larger step relative to stroke width = fewer rows of dots across each letter (2 instead of 3)
      const step = Math.max(6, Math.round(fontSize / 15));
      const rawTextPoints = sampleTextPoints('GEMSTRAT', w, h, fontSize, step);

      // 2. The square-fill grid must be an exact side*side count so every cell gets a dot
      // (no ragged last row) — pad or trim the text-point pool to match that exact count.
      const side = Math.max(8, Math.round(Math.sqrt(rawTextPoints.length)));
      const gridCount = side * side;

      let textPoints = rawTextPoints;
      if (gridCount > rawTextPoints.length) {
        const extra = Array.from({ length: gridCount - rawTextPoints.length }, () => {
          const src = rawTextPoints[Math.floor(Math.random() * rawTextPoints.length)];
          return { x: src.x, y: src.y };
        });
        textPoints = [...rawTextPoints, ...extra];
      } else if (gridCount < rawTextPoints.length) {
        textPoints = [...rawTextPoints].sort(() => Math.random() - 0.5).slice(0, gridCount);
      }

      const squareRect = square.getBoundingClientRect();
      const fillPoints: Point[] = [];
      for (let r = 0; r < side; r++) {
        for (let c = 0; c < side; c++) {
          fillPoints.push({
            x: squareRect.left + ((c + 0.5) / side) * squareRect.width,
            y: squareRect.top + ((r + 0.5) / side) * squareRect.height,
          });
        }
      }
      const fillRadius = Math.max((squareRect.width / side) * 0.62, 2);
      const DOT_RADIUS = 0.9;

      // 3. Particles: a handful start scattered (seeds); the rest fade in later to "join" the word
      const seedCount = Math.min(40, Math.max(12, Math.floor(textPoints.length * 0.15)));
      const order = [...textPoints.keys()].sort(() => Math.random() - 0.5);

      const particles: Particle[] = textPoints.map((pt, i) => {
        const isSeed = order.indexOf(i) < seedCount;
        const fillX = fillPoints[i].x;
        const fillY = fillPoints[i].y;

        // Random bow off the straight line to the grid point, so dots don't
        // all travel in perfect uniform lockstep — each takes its own curved path
        const dx = fillX - pt.x;
        const dy = fillY - pt.y;
        const dist = Math.hypot(dx, dy) || 1;
        const bow = (Math.random() - 0.5) * dist * 0.7;

        return {
          startX: Math.random() * w,
          startY: Math.random() * h,
          textX: pt.x,
          textY: pt.y,
          fillX,
          fillY,
          seed: isSeed,
          delay: isSeed ? 0 : Math.random() * (DURATIONS.formText * 0.55),
          moveDelay: Math.random() * (DURATIONS.toFillMove * 0.45),
          curveX: (-dy / dist) * bow,
          curveY: (dx / dist) * bow,
        };
      });

      let startTime: number | null = null;
      const formEnd = DURATIONS.formText;
      const holdEnd = formEnd + DURATIONS.holdText;
      const moveEnd = holdEnd + DURATIONS.toFillMove;
      const growEnd = moveEnd + DURATIONS.toFillGrow;
      const fadeEnd = growEnd + DURATIONS.crossfade;

      const draw = (now: number) => {
        if (startTime === null) startTime = now;
        const elapsed = now - startTime;

        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = '#ffffff';

        for (const p of particles) {
          let x: number;
          let y: number;
          let radius: number;
          let opacity: number;

          if (elapsed < formEnd) {
            if (p.seed) {
              const t = easeOutCubic(Math.min(elapsed / formEnd, 1));
              x = p.startX + (p.textX - p.startX) * t;
              y = p.startY + (p.textY - p.startY) * t;
              opacity = 1;
            } else {
              const local = Math.max(0, elapsed - p.delay);
              const dur = formEnd - p.delay || 1;
              x = p.textX;
              y = p.textY;
              opacity = Math.min(local / dur, 1);
            }
            radius = DOT_RADIUS;
          } else if (elapsed < holdEnd) {
            x = p.textX;
            y = p.textY;
            opacity = 1;
            radius = DOT_RADIUS;
          } else if (elapsed < moveEnd) {
            // Travel to the video-box grid position — each dot has its own start
            // delay and its own curved path, so the group doesn't move in lockstep
            const localElapsed = Math.max(0, elapsed - holdEnd - p.moveDelay);
            const localDur = Math.max(1, DURATIONS.toFillMove - p.moveDelay);
            const t = easeInOutCubic(Math.min(localElapsed / localDur, 1));
            const mt = 1 - t;
            const midX = (p.textX + p.fillX) / 2 + p.curveX;
            const midY = (p.textY + p.fillY) / 2 + p.curveY;
            x = mt * mt * p.textX + 2 * mt * t * midX + t * t * p.fillX;
            y = mt * mt * p.textY + 2 * mt * t * midY + t * t * p.fillY;
            radius = DOT_RADIUS;
            opacity = 1;
          } else if (elapsed < growEnd) {
            // Now in place — grow to fill the box solid
            const t = easeInOutCubic(Math.min((elapsed - moveEnd) / DURATIONS.toFillGrow, 1));
            x = p.fillX;
            y = p.fillY;
            radius = DOT_RADIUS + (fillRadius - DOT_RADIUS) * t;
            opacity = 1;
          } else {
            x = p.fillX;
            y = p.fillY;
            radius = fillRadius;
            opacity = 1;
          }

          ctx.globalAlpha = opacity;
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;

        if (elapsed >= growEnd && overlayRef.current) {
          const fadeT = easeInOutCubic(Math.min((elapsed - growEnd) / DURATIONS.crossfade, 1));
          overlayRef.current.style.opacity = String(1 - fadeT);
          overlayRef.current.style.transform = `scale(${1 + fadeT * 0.04})`;
        }

        if (elapsed < fadeEnd) {
          rafId = requestAnimationFrame(draw);
        } else {
          setVisible(false);
        }
      };

      rafId = requestAnimationFrame(draw);
    } catch {
      setVisible(false);
    }

    return () => {
      clearTimeout(safety);
      if (rafId !== null) cancelAnimationFrame(rafId);
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    if (!visible) {
      document.body.style.overflow = '';
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <>
      {/* Zero-JS safety net: if scripts never run, don't leave the site behind a black screen */}
      <noscript>
        <style>{'.gemstrat-loader { display: none !important; }'}</style>
      </noscript>
      <div
        ref={overlayRef}
        className="gemstrat-loader fixed inset-0 z-[100] bg-[#090909] flex items-center justify-center will-change-[opacity,transform]"
        aria-hidden="true"
      >
        <canvas ref={canvasRef} className="absolute inset-0" />
        {/* Invisible reference box: matches the Hero video frame's exact size/position */}
        <div ref={squareRef} className="w-[clamp(200px,26vw,420px)] aspect-square" />
      </div>
    </>
  );
}
