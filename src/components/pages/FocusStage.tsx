'use client';

import React, { useEffect, useRef, useState } from 'react';
import { onScrollFrame } from '@/lib/scrollFrame';
import { setWordStyle } from '@/lib/wordStyle';
import BlueprintDrawing from '@/components/ui/BlueprintDrawing';
import type { BlueprintData } from '@/lib/blueprintGuides';
import statue from '@/data/blueprint/statue-of-liberty.json';

// ---------------------------------------------------------------------------
// FocusStage
// The Focus areas page as one pinned stage, with the Statue of Liberty large
// in the middle as its backdrop throughout:
//
//   opening  the headline and intro sit centred over the statue, of which
//            only ten fragments of its border show, here and there, dimmed
//   intro    on scroll the headline blurs out word by word (as the homepage
//            hero's), the fragments grow until they join into the whole
//            outline, its edges follow, and the statue comes up to full
//            strength
//   areas    the five areas come in one at a time on alternating sides —
//            left, right, left… — blurring in and out, while the statue's
//            ink soaks in (BlueprintDrawing, without construction lines)
//
// On phones the statue sits above and each area's text below it.
// ---------------------------------------------------------------------------

export interface FocusArea {
  title: string;
  body: string;
}

interface Props {
  title: string[];
  intro: string;
  areas: FocusArea[];
}

const INTRO = 70; // vh of scroll for the headline to leave
const PER_AREA = 75; // vh of scroll per area
const OPENING_MS = 1800; // the fragments appearing behind the headline
const DIM = 0.55; // the statue while the headline is up
// The drawing's own progress (its stages: 1 outline, 2 ink, 3 settled, 4 end)
const OPENED = 1.12; // where the opening leaves it: short fragments of border
const FRAGMENTS = 10;
const WORD_WINDOW = 0.4;

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const ease = (t: number) => -(Math.cos(Math.PI * clamp01(t)) - 1) / 2;

/** A fixed scattered order for n words */
function scatter(n: number) {
  const order = Array.from({ length: n }, (_, i) => i);
  let seed = 11;
  for (let i = n - 1; i > 0; i--) {
    seed = (seed * 9301 + 49297) % 233280;
    const j = Math.floor((seed / 233280) * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

export default function FocusStage({ title, intro, areas }: Props) {
  const ref = useRef<HTMLElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const statueRef = useRef<HTMLDivElement>(null);
  const progress = useRef(1);
  const [active, setActive] = useState(-1);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const words = Array.from(copyRef.current?.querySelectorAll<HTMLElement>('[data-word]') ?? []);
    const fades = Array.from(copyRef.current?.querySelectorAll<HTMLElement>('[data-fade]') ?? []);
    const rank = scatter(words.length);

    // The opening: the outline draws in behind the headline once the page is in
    let opened = reduced ? 1 : 0;
    let startAt = 0;
    let raf = 0;
    let introP = 0;
    let areaP = 0;
    const apply = () => {
      // The drawing: the opening's fragments; joined into the outline (and
      // its edges) as the headline leaves; then the ink, through the areas
      progress.current =
        introP < 1
          ? Math.max(1 + (OPENED - 1) * ease(opened), OPENED + (2 - OPENED) * introP)
          : 2 + (areaP / areas.length) * 2;
      if (statueRef.current) statueRef.current.style.opacity = String(DIM + (1 - DIM) * ease(introP));
    };
    const tick = (now: number) => {
      if (!startAt) startAt = now;
      opened = clamp01((now - startAt) / OPENING_MS);
      apply();
      if (opened < 1) raf = requestAnimationFrame(tick);
    };
    const begin = () => {
      if (!raf && opened < 1) raf = requestAnimationFrame(tick);
    };
    // Wait for the page to be in (after the menu's handoff), like the copy
    const html = document.documentElement;
    let mo: MutationObserver | null = null;
    if (html.classList.contains('page-in')) begin();
    else {
      mo = new MutationObserver(() => {
        if (html.classList.contains('page-in')) {
          mo?.disconnect();
          begin();
        }
      });
      mo.observe(html, { attributes: true, attributeFilter: ['class'] });
    }

    const stop = onScrollFrame(() => {
      const el = ref.current;
      if (!el) return;
      const vh = window.innerHeight;
      const scrolled = Math.max(0, -el.getBoundingClientRect().top);
      const introRun = (INTRO / 100) * vh;
      const run = el.offsetHeight - vh - introRun;
      introP = clamp01(scrolled / introRun);
      areaP = clamp01((scrolled - introRun) / (run || 1)) * areas.length;
      // Scrolling on finishes the opening at once
      if (introP > 0 && opened < 1) opened = 1;
      apply();

      // The headline blurs out word by word, the rest fades
      if (!reduced) {
        words.forEach((w, i) => {
          const start = (rank[i] / Math.max(1, words.length - 1)) * (1 - WORD_WINDOW);
          const wp = clamp01((introP - start) / WORD_WINDOW);
          setWordStyle(w, 1 - wp, wp * 12, -wp * 14);
        });
        fades.forEach((f) => (f.style.opacity = (1 - introP).toFixed(3)));
      }
      setActive(introP < 1 ? -1 : Math.min(areas.length - 1, Math.floor(areaP)));
    });

    return () => {
      stop();
      mo?.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [areas.length]);

  let wordIndex = 0;

  return (
    <section
      id="areas"
      ref={ref}
      className="relative"
      style={{ height: `${INTRO + areas.length * PER_AREA + 100}vh` }}
    >
      <div className="sticky top-0 h-screen h-[100svh] overflow-hidden">
        {/* The statue, large and central: the backdrop for the whole page */}
        <div
          ref={statueRef}
          className="absolute inset-x-0 top-[14vh] h-[46vh] lg:top-[7vh] lg:h-[86vh] flex justify-center pointer-events-none"
          style={{ opacity: DIM }}
        >
          <div className="h-full" style={{ aspectRatio: `${statue.w} / ${statue.h}` }}>
            <BlueprintDrawing
              data={statue as BlueprintData}
              src="/images/blueprint/statue-of-liberty.webp"
              progress={progress}
              guides={false}
              fragments={FRAGMENTS}
              label="An architectural elevation of the Statue of Liberty that draws itself as you scroll"
            />
          </div>
        </div>

        {/* The headline and intro, centred over the statue */}
        <div
          ref={copyRef}
          className="absolute inset-0 flex flex-col items-center justify-center text-center px-5 sm:px-6 pointer-events-none"
        >
          <h1 className="m-0 font-sans font-normal text-white tracking-[-0.045em] leading-[0.98] text-[clamp(2.6rem,6.2vw,6.4rem)]">
            {title.map((line, li) => (
              <span key={li} className="block">
                {line.split(' ').map((word, wi) => (
                  <span key={wi} data-word className="inline-block mx-[0.11em]">
                    <span className="sub-word inline-block" style={{ animationDelay: `${0.05 + wordIndex++ * 0.09}s` }}>
                      {word}
                    </span>
                  </span>
                ))}
              </span>
            ))}
          </h1>
          <div data-fade>
            <p
              className="sub-fade mt-8 m-0 max-w-[36rem] font-archivo text-[clamp(1rem,1.3vw,19px)] leading-[1.5] tracking-[-0.01em] text-white/70"
              style={{ animationDelay: '0.75s' }}
            >
              {intro}
            </p>
          </div>
        </div>

        {/* The areas, one at a time, alternating sides */}
        {areas.map((a, i) => {
          const state = i === active ? 'now' : i < active ? 'past' : 'next';
          const right = i % 2 === 1;
          const part = (k: number): React.CSSProperties => ({
            opacity: state === 'now' ? 1 : 0,
            filter: state === 'now' ? 'blur(0)' : 'blur(12px)',
            transform: state === 'now' ? 'none' : `translate3d(0, ${state === 'past' ? -18 : 22}px, 0)`,
            transition: `opacity ${state === 'now' ? 0.8 : 0.45}s, filter ${state === 'now' ? 0.8 : 0.45}s, transform ${
              state === 'now' ? 1 : 0.5
            }s cubic-bezier(0.16, 1, 0.3, 1)`,
            transitionDelay: state === 'now' ? `${0.18 + k * 0.08}s` : `${k * 0.03}s`,
          });
          return (
            <div
              key={a.title}
              aria-hidden={state !== 'now'}
              className={`absolute left-5 right-5 bottom-[8vh] lg:bottom-auto lg:top-1/2 lg:-translate-y-1/2 lg:w-[min(24rem,26vw)] ${
                right ? 'lg:left-auto lg:right-8' : 'lg:left-8 lg:right-auto'
              }`}
            >
              <h3 className="m-0 font-sans font-normal tracking-[-0.045em] leading-[0.98] text-[clamp(2rem,3vw,48px)]" style={part(0)}>
                {a.title}
              </h3>
              <p className="mt-5 m-0 font-archivo text-[16px] lg:text-[17px] leading-[1.55] text-white/65" style={part(1)}>
                {a.body}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
