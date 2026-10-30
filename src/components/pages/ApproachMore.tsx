'use client';

import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { onScrollFrame } from '@/lib/scrollFrame';
import taj from '@/data/blueprint/taj-mahal.json';
import LineMap, { cityLandsAt, MAP_CITIES, MAP_H, MAP_W } from '@/components/ui/LineMap';

// ---------------------------------------------------------------------------
// The Approach page's sections after "How we work": a statement in outlined
// letters that the Taj's ink soaks into as you scroll, and the regions on a
// line map that draws itself (LineMap), with their live local times. The rest
// blurs in and rises as it comes into view, like the steps above.
// ---------------------------------------------------------------------------

const PAD = 'px-5 sm:px-6 lg:px-8';
const HEADING = 'font-sans font-normal tracking-[-0.045em] leading-[0.98] text-[clamp(2.4rem,5vw,76px)] m-0';

/** Blurs in and rises once, as it comes into view */
function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -12% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={`motion-reduce:!opacity-100 motion-reduce:!filter-none motion-reduce:!transform-none ${className}`}
      style={{
        opacity: shown ? 1 : 0,
        filter: shown ? 'blur(0)' : 'blur(12px)',
        transform: shown ? 'none' : 'translate3d(0, 24px, 0)',
        transition: 'opacity 0.9s, filter 0.9s, transform 1.1s cubic-bezier(0.16, 1, 0.3, 1)',
        transitionDelay: `${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

// --- Statement ---------------------------------------------------------------

const STATEMENT =
  'We don’t stop at advice. We stay until the plan is running, the numbers are moving, and your team owns what we built together.';

const WORDS = STATEMENT.split(' ');

// The ink: the Taj blueprint's shaded drawing (white ink on clear)
const INK_SRC = `/images/blueprint/taj-mahal.webp?v=${taj.v}`;
const INK_RATIO = taj.w / taj.h;

/** A fixed pseudo-random number for word i, slot k (same on every visit) */
const seeded = (i: number, k: number) => {
  const x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

/** Pinned while you scroll past it. Its words are outlines, like the
 *  blueprint's lines; one after another, the Taj's ink soaks into them from
 *  two points that spread like blots. The ink is one drawing laid across the
 *  whole sentence, so together the words show the Taj. */
function Statement() {
  const ref = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const inkRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const words = WORDS;

  useEffect(() => {
    const text = textRef.current;
    if (!text) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Lay the one drawing across the sentence: each word shows its own part
    const place = () => {
      // Covering the whole sentence (on phones it's taller than wide)
      const box = text.getBoundingClientRect();
      const iw = Math.max(box.width, box.height * INK_RATIO);
      const ih = iw / INK_RATIO;
      const ox = (box.width - iw) / 2;
      const oy = (box.height - ih) / 2;
      inkRefs.current.forEach((ink) => {
        if (!ink) return;
        const r = ink.getBoundingClientRect();
        ink.style.backgroundSize = `${iw}px ${ih}px, 100% 100%`;
        ink.style.backgroundPosition = `${box.left - r.left + ox}px ${box.top - r.top + oy}px, 0 0`;
      });
    };
    const ro = new ResizeObserver(place);
    ro.observe(text);
    document.fonts?.ready.then(place);

    // Two blot centres per word
    const blots = words.map((_, i) => [
      [15 + seeded(i, 1) * 70, 20 + seeded(i, 2) * 60],
      [15 + seeded(i, 3) * 70, 20 + seeded(i, 4) * 60],
    ]);
    const last: number[] = words.map(() => -1);
    const stop = onScrollFrame(() => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const run = r.height - window.innerHeight;
      const p = Math.min(1, Math.max(0, -r.top / (run || 1)));
      inkRefs.current.forEach((ink, i) => {
        if (!ink) return;
        const at = (i / words.length) * 0.72;
        const raw = reduced ? 1 : Math.min(1, Math.max(0, (p - at) / 0.18));
        const k = Math.round(raw * 200) / 200;
        if (k === last[i]) return;
        last[i] = k;
        // Each blot grows from nothing to past the word's corners, with a
        // soft edge; the second starts a little later
        const blot = ([x, y]: number[], t: number) => {
          const rad = Math.max(0, t) * 150;
          return `radial-gradient(circle at ${x}% ${y}%, #000 ${rad}%, transparent ${rad + 22}%)`;
        };
        const [b1, b2] = blots[i];
        const mask = `${blot(b1, k)}, ${blot(b2, (k - 0.25) / 0.75)}`;
        ink.style.maskImage = mask;
        ink.style.webkitMaskImage = mask;
        ink.style.opacity = k > 0 ? '1' : '0';
      });
    });
    return () => {
      stop();
      ro.disconnect();
    };
  }, [words]);

  return (
    <section ref={ref} className="relative h-[220vh]">
      <div className={`sticky top-0 h-screen h-[100svh] flex items-center ${PAD}`}>
        <p
          ref={textRef}
          className="m-0 w-full lg:max-w-[75%] font-sans font-medium tracking-[-0.04em] leading-[1.06] text-[clamp(1.9rem,4.3vw,76px)]"
        >
          {words.map((w, i) => (
            <React.Fragment key={i}>
              <span className="relative inline-block">
                {/* The outline */}
                <span className="text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.4)]">{w}</span>
                {/* The ink, soaking in */}
                <span
                  ref={(el) => {
                    inkRefs.current[i] = el;
                  }}
                  aria-hidden="true"
                  className="absolute inset-0 text-transparent bg-clip-text [-webkit-background-clip:text] bg-no-repeat"
                  style={{
                    backgroundImage: `url(${INK_SRC}), linear-gradient(rgba(255,255,255,0.24), rgba(255,255,255,0.24))`,
                    opacity: 0,
                  }}
                >
                  {w}
                </span>
              </span>{' '}
            </React.Fragment>
          ))}
        </p>
      </div>
    </section>
  );
}

// --- Where we work -----------------------------------------------------------

const REGIONS = [
  { region: 'United States', city: 'New York', tz: 'America/New_York' },
  { region: 'Canada', city: 'Toronto', tz: 'America/Toronto' },
  { region: 'India', city: 'Mumbai', tz: 'Asia/Kolkata' },
  { region: 'Middle East', city: 'Dubai', tz: 'Asia/Dubai' },
  { region: 'Africa', city: 'Nairobi', tz: 'Africa/Nairobi' },
];

// A clock that ticks every 15 s (client only; the server shows dashes)
let nowMinute = 0;
const subscribeClock = (cb: () => void) => {
  const id = window.setInterval(() => {
    const m = Math.floor(Date.now() / 60000);
    if (m !== nowMinute) {
      nowMinute = m;
      cb();
    }
  }, 15000);
  return () => window.clearInterval(id);
};
const getMinute = () => (nowMinute ||= Math.floor(Date.now() / 60000));

function LocalTime({ tz }: { tz: string }) {
  const minute = useSyncExternalStore(subscribeClock, getMinute, () => 0);
  if (!minute) return <span>--:--</span>;
  const time = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: tz }).format(
    new Date(minute * 60000),
  );
  return <span>{time}</span>;
}

// Where each city's label sits beside its pin (the close pairs, Toronto and
// New York, Dubai and Mumbai, face away from each other)
const LABEL_SIDE: Record<string, string> = {
  Toronto: 'translate(calc(-100% - 12px), calc(-100% - 6px))',
  'New York': 'translate(12px, 6px)',
  Dubai: 'translate(calc(-100% - 12px), calc(-100% - 4px))',
  Mumbai: 'translate(12px, -30%)',
  Nairobi: 'translate(12px, 4px)',
};
// On phones the map is zoomed in, so the labels at its edges tuck in
const LABEL_SIDE_PHONE: Record<string, string> = {
  ...LABEL_SIDE,
  Toronto: 'translate(-35%, calc(-100% - 10px))',
  Mumbai: 'translate(-75%, 10px)',
};

/** Pinned while you scroll past it: the world sweeps in as dots, the five
 *  cities are joined by arcs drawn one after another, and each city's label
 *  (with its live time) comes in as its arc lands */
export function Regions() {
  const ref = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const labelRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    return onScrollFrame(() => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const run = r.height - window.innerHeight;
      const p = Math.min(1, Math.max(0, -r.top / (run || 1)));
      progress.current = p;
      MAP_CITIES.forEach((c, i) => {
        const label = labelRefs.current[i];
        if (!label) return;
        const k = Math.min(1, Math.max(0, (p - cityLandsAt(c.name)) / 0.06));
        label.style.opacity = String(k);
        label.style.filter = k < 1 ? `blur(${((1 - k) * 8).toFixed(1)}px)` : '';
      });
    });
  }, []);

  return (
    <section ref={ref} className="relative h-[260vh]">
      <div className={`sticky top-0 h-screen h-[100svh] flex items-center overflow-hidden ${PAD}`}>
        <div className="w-full grid gap-10 lg:grid-cols-[minmax(0,3fr)_minmax(0,7fr)] lg:gap-12 xl:gap-16 items-center">
          <Reveal>
            <h2 className={HEADING}>
              Five regions.
              <br />
              <span className="text-white/40">One team.</span>
            </h2>
            <p className="mt-8 m-0 font-archivo text-[16px] lg:text-[17px] leading-[1.55] text-white/60 max-w-[30rem]">
              A boutique bench with partners where our clients grow — close enough to be in the room, connected enough to bring
              what works elsewhere.
            </p>
          </Reveal>

          {/* On phones, zoomed to the band the cities sit in (the Americas to
              India), so their labels have room */}
          <div className="relative w-full max-lg:w-[175%] max-lg:-ml-[36%]" style={{ aspectRatio: `${MAP_W} / ${MAP_H}` }}>
            <LineMap progress={progress} />
            {MAP_CITIES.map((c, i) => {
              const info = REGIONS.find((r) => r.city === c.name);
              return (
                <div
                  key={c.name}
                  className="absolute left-0 top-0 pointer-events-none"
                  style={{ left: `${(c.x / MAP_W) * 100}%`, top: `${(c.y / MAP_H) * 100}%` }}
                >
                  <div
                    ref={(el) => {
                      labelRefs.current[i] = el;
                    }}
                    className="whitespace-nowrap font-sans uppercase tracking-[0.1em] text-[9px] sm:text-[11px] leading-[1.4] [transform:var(--side-phone)] lg:[transform:var(--side)]"
                    style={
                      {
                        '--side': LABEL_SIDE[c.name],
                        '--side-phone': LABEL_SIDE_PHONE[c.name],
                        opacity: 0,
                      } as React.CSSProperties
                    }
                  >
                    <span className="block text-white/40">{info?.region}</span>
                    <span className="block text-white/90">
                      {c.name} <span className="tabular-nums text-white/60">{info && <LocalTime tz={info.tz} />}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function ApproachMore() {
  return (
    <>
      <Statement />
      <Regions />
    </>
  );
}
