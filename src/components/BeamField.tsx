'use client';

import React, { useEffect, useId, useMemo, useRef } from 'react';

export type BeamFamily =
  | 'diagonal'
  | 'ribbon'
  | 'vertical'
  | 'cross'
  | 'drift'
  | 'orbit'
  | 'wave'
  | 'burst';

export type BeamTheme = 'inkBold' | 'inkSoft' | 'inkWarm' | 'paperSoft';

interface BeamFieldProps {
  id?: string;
  family: BeamFamily;
  theme: BeamTheme;
  count: number;
  w: number;
  h: number;
  seed?: number;
  strokeWidth?: number;
  strokeWidthAnim?: number;
  comet?: number;
  durMin?: number;
  durMax?: number;
  stagger?: number;
  staticOpacity?: number;
  className?: string;
}

function seededRnd(seed: number) {
  let s = seed;
  return function () {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

const FAMILIES: Record<
  BeamFamily,
  (i: number, n: number, w: number, h: number, rnd: () => number) => string
> = {
  diagonal: (i, n, w, h, rnd) => {
    const t = n > 1 ? i / (n - 1) : 0;
    const xOff = -0.35 * w + t * 1.25 * w;
    const bow = 50 + rnd() * 50;
    return `M ${xOff.toFixed(1)} ${(h * 1.15).toFixed(1)} C ${(xOff + w * 0.18).toFixed(1)} ${(h * 0.45 - bow).toFixed(1)}, ${(xOff + w * 0.42).toFixed(1)} ${(-h * 0.1).toFixed(1)}, ${(xOff + w * 0.62).toFixed(1)} ${(-h * 0.3).toFixed(1)}`;
  },
  ribbon: (i, n, w, h, rnd) => {
    const y0 = (h / (n + 1)) * (i + 1) + (rnd() - 0.5) * 18;
    const amp = 26 + rnd() * 36;
    return `M -30 ${y0.toFixed(1)} C ${(w * 0.28).toFixed(1)} ${(y0 - amp).toFixed(1)}, ${(w * 0.46).toFixed(1)} ${(y0 + amp).toFixed(1)}, ${(w * 0.72).toFixed(1)} ${(y0 - amp * 0.5).toFixed(1)} S ${(w + 30).toFixed(1)} ${(y0 + amp * 0.4).toFixed(1)}, ${(w + 60).toFixed(1)} ${y0.toFixed(1)}`;
  },
  vertical: (i, n, w, h, rnd) => {
    const t = n > 1 ? i / (n - 1) : 0;
    const xBase = t * w;
    const xTop = w * 0.5 + (xBase - w * 0.5) * 0.3;
    const bow = (rnd() - 0.5) * 46;
    return `M ${xBase.toFixed(1)} ${(h * 1.08).toFixed(1)} C ${(xBase + bow * 0.4).toFixed(1)} ${(h * 0.62).toFixed(1)}, ${(xTop - bow * 0.4).toFixed(1)} ${(h * 0.28).toFixed(1)}, ${xTop.toFixed(1)} ${(-h * 0.12).toFixed(1)}`;
  },
  cross: (i, n, w, h, rnd) => {
    const half = Math.ceil(n / 2);
    const t = Math.floor(i / 2) / Math.max(1, half - 1);
    const dir = i % 2 === 0 ? 1 : -1;
    const y0 = t * h * 1.3 - h * 0.15;
    const x0 = dir > 0 ? -30 : w + 30;
    const x1 = dir > 0 ? w + 30 : -30;
    const sway = (rnd() - 0.5) * 70;
    return `M ${x0} ${y0.toFixed(1)} Q ${(w / 2).toFixed(1)} ${(y0 + sway).toFixed(1)}, ${x1} ${(y0 + h * 0.12).toFixed(1)}`;
  },
  drift: (i, n, w, h, rnd) => {
    const y0 = (h / (n + 1)) * (i + 1);
    const wob = 18 + rnd() * 20;
    return `M -30 ${y0.toFixed(1)} Q ${(w * 0.5).toFixed(1)} ${(y0 + wob).toFixed(1)}, ${(w + 30).toFixed(1)} ${(y0 - wob * 0.55).toFixed(1)}`;
  },
  orbit: (i, n, w, h, rnd) => {
    const cx = w * 0.5;
    const cy = h * 1.5;
    const r = h * 1.1 + i * (h * 0.55);
    const a0 = Math.PI * (0.12 + rnd() * 0.05);
    const a1 = Math.PI * (0.88 - rnd() * 0.05);
    const x0 = cx - r * Math.cos(a0);
    const y0 = cy - r * Math.sin(a0);
    const x1 = cx + r * Math.cos(Math.PI - a1);
    const y1 = cy - r * Math.sin(a1);
    const yc = cy - r * 1.32;
    return `M ${x0.toFixed(1)} ${y0.toFixed(1)} Q ${cx.toFixed(1)} ${yc.toFixed(1)}, ${x1.toFixed(1)} ${y1.toFixed(1)}`;
  },
  wave: (i, n, w, h, rnd) => {
    const y0 = (h / n) * i + h / (n * 2);
    const amp = 8 + (i % 3) * 4 + rnd() * 6;
    const freq = 0.9 + rnd() * 0.4;
    const step = Math.max(16, w / 40);
    let d = `M -20 ${y0.toFixed(1)}`;
    for (let x = -20; x <= w + 20; x += step) {
      const yy = y0 + Math.sin(x / (60 / freq) + i * 0.6) * amp;
      d += ` L ${x.toFixed(1)} ${yy.toFixed(1)}`;
    }
    return d;
  },
  burst: (i, n, w, h, rnd) => {
    const cx = w * 1.02;
    const cy = h * 1.05;
    const t = n > 1 ? i / (n - 1) : 0;
    const ang = Math.PI * (1.06 + t * 0.5);
    const len = Math.max(w, h) * 1.55;
    const bow = (rnd() - 0.5) * 36;
    const x1 = cx + Math.cos(ang) * len * 0.42;
    const y1 = cy + Math.sin(ang) * len * 0.42;
    const x2 = cx + Math.cos(ang) * len;
    const y2 = cy + Math.sin(ang) * len;
    return `M ${cx.toFixed(1)} ${cy.toFixed(1)} Q ${(x1 + bow).toFixed(1)} ${(y1 - bow).toFixed(1)}, ${x2.toFixed(1)} ${y2.toFixed(1)}`;
  },
};

const THEMES: Record<
  BeamTheme,
  {
    dir: [number, number, number, number];
    stops: { o: string; c: string; op: number }[];
    static: string;
  }
> = {
  inkBold: {
    dir: [0, 0, 100, 100],
    stops: [
      { o: '0%', c: '#b7b8bb', op: 0 },
      { o: '22%', c: '#dcdcd8', op: 0.95 },
      { o: '52%', c: '#c9ad7e', op: 1 },
      { o: '80%', c: '#b7b8bb', op: 0.9 },
      { o: '100%', c: '#b7b8bb', op: 0 },
    ],
    static: '#b7b8bb',
  },
  inkSoft: {
    dir: [0, 100, 100, 0],
    stops: [
      { o: '0%', c: '#46474a', op: 0 },
      { o: '30%', c: '#b7b8bb', op: 0.55 },
      { o: '55%', c: '#dcdcd8', op: 0.7 },
      { o: '80%', c: '#46474a', op: 0.4 },
      { o: '100%', c: '#46474a', op: 0 },
    ],
    static: '#b7b8bb',
  },
  inkWarm: {
    dir: [0, 0, 100, 0],
    stops: [
      { o: '0%', c: '#9c7a44', op: 0 },
      { o: '28%', c: '#c9ad7e', op: 0.85 },
      { o: '55%', c: '#f6f4ee', op: 0.6 },
      { o: '80%', c: '#9c7a44', op: 0.7 },
      { o: '100%', c: '#9c7a44', op: 0 },
    ],
    static: '#c9ad7e',
  },
  paperSoft: {
    dir: [0, 0, 100, 60],
    stops: [
      { o: '0%', c: '#0b0b0c', op: 0 },
      { o: '30%', c: '#46474a', op: 0.4 },
      { o: '55%', c: '#0b0b0c', op: 0.5 },
      { o: '80%', c: '#46474a', op: 0.3 },
      { o: '100%', c: '#0b0b0c', op: 0 },
    ],
    static: '#0b0b0c',
  },
};

export default function BeamField({
  id,
  family,
  theme,
  count,
  w,
  h,
  seed = 1,
  strokeWidth = 1,
  strokeWidthAnim,
  comet = 0.3,
  durMin = 5,
  durMax = 9,
  stagger = 0.3,
  staticOpacity = 0.07,
  className = '',
}: BeamFieldProps) {
  const reactId = useId().replace(/[:]/g, '');
  const prefix = id || `beam-${reactId}`;
  const svgRef = useRef<SVGSVGElement | null>(null);

  const themeConfig = THEMES[theme] || THEMES.inkBold;
  const pathGenerator = FAMILIES[family] || FAMILIES.diagonal;

  // Pre-generate paths and durations based on seed
  const pathsData = useMemo(() => {
    const rnd = seededRnd(seed);
    const items = [];
    for (let i = 0; i < count; i++) {
      const d = pathGenerator(i, count, w, h, rnd);
      const dur = durMin + rnd() * (durMax - durMin);
      const delay = i * stagger;
      items.push({ d, dur, delay });
    }
    return items;
  }, [seed, count, w, h, pathGenerator, durMin, durMax, stagger]);

  useEffect(() => {
    if (!svgRef.current) return;
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (prefersReducedMotion) return;

    const animPaths = svgRef.current.querySelectorAll<SVGPathElement>(
      '.animated-beam-path'
    );
    animPaths.forEach((path, idx) => {
      try {
        const L = path.getTotalLength() || 1000;
        const c = comet || 0.3;
        const dashLen = L * c;
        const gapLen = L * (1 - c);
        path.style.strokeDasharray = `${dashLen.toFixed(1)}px ${gapLen.toFixed(1)}px`;
        path.style.setProperty('--L', `${L.toFixed(1)}px`);
        const item = pathsData[idx];
        if (item) {
          path.style.animation = `beamTravel ${item.dur.toFixed(2)}s linear infinite`;
          path.style.animationDelay = `${item.delay.toFixed(2)}s`;
        }
      } catch (err) {
        // Fallback length
        path.style.setProperty('--L', '1200px');
      }
    });
  }, [pathsData, comet]);

  return (
    <div
      className={`beam-host ${className}`}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      <svg
        ref={svgRef}
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="none"
        style={{ width: '100%', height: '100%', display: 'block' }}
      >
        <defs>
          {pathsData.map((_, idx) => (
            <linearGradient
              key={`${prefix}-g${idx}`}
              id={`${prefix}-g${idx}`}
              x1={`${themeConfig.dir[0]}%`}
              y1={`${themeConfig.dir[1]}%`}
              x2={`${themeConfig.dir[2]}%`}
              y2={`${themeConfig.dir[3]}%`}
            >
              {themeConfig.stops.map((stop, sIdx) => (
                <stop
                  key={sIdx}
                  offset={stop.o}
                  stopColor={stop.c}
                  stopOpacity={stop.op}
                />
              ))}
            </linearGradient>
          ))}
        </defs>

        {/* Faint static structural lines */}
        <g opacity={staticOpacity}>
          {pathsData.map((item, idx) => (
            <path
              key={`static-${idx}`}
              d={item.d}
              fill="none"
              stroke={themeConfig.static}
              strokeWidth={strokeWidth}
            />
          ))}
        </g>

        {/* Animated moving beam strokes */}
        <g>
          {pathsData.map((item, idx) => (
            <path
              key={`anim-${idx}`}
              className="animated-beam-path"
              d={item.d}
              fill="none"
              stroke={`url(#${prefix}-g${idx})`}
              strokeWidth={strokeWidthAnim || strokeWidth || 1.3}
              strokeLinecap="round"
            />
          ))}
        </g>
      </svg>
    </div>
  );
}
