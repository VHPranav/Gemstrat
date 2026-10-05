'use client';

import React, { useCallback, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { onScrollFrame } from '@/lib/scrollFrame';
import { setWordStyle } from '@/lib/wordStyle';
import { usePerfLite } from '@/lib/usePerfLite';
import { holdHeroReveal } from '@/lib/intro';
import RegionClock from '@/components/ui/RegionClock';

// three.js loads after the page is interactive, so it never delays the
// hero's first paint
const BlastScene = dynamic(() => import('@/components/ui/BlastScene'), {
  ssr: false,
});

// ---------------------------------------------------------------------------
// Hero
// Full-screen WebGL scene (BlastScene) with the copy laid over it. The scene
// sits in a sticky layer behind both the hero and the section passed as
// `children` (the Statement): the first scroll blows the logo apart, its
// pieces float behind the next section, and the scene fades out as that
// section ends.
// ---------------------------------------------------------------------------

const HEADLINE = [
  ['Solving', 'what', 'matters,'],
  ['building', 'what'],
];
const LAST_WORD = 'lasts.'; // letters blur in one by one

const SCROLL_FADE = 0.45; // viewport heights over which the copy leaves
// On scroll the headline blurs out word by word: each word takes this share of
// the SCROLL_FADE window, the words starting one after another
const WORD_WINDOW = 0.4;
// Scattered order the words leave in (like the Statement's), as indexes into
// Solving(0) what(1) matters,(2) / building(3) what(4) lasts.(5)
const DISSOLVE_ORDER = [3, 1, 5, 0, 4, 2]; // building, what, lasts., Solving, what, matters,
// The scene fades out over this window of the following section's own scroll
// progress (0 = its sticky locks, 1 = it ends). The Statement's words finish
// dissolving at 0.82, so the scene goes from there to its end.
const SCENE_FADE_START = 0.82;
const SCENE_FADE_END = 1;
// The logo reassembles behind the next section (see BlastScene); the scene
// dims meanwhile so that section's copy reads clearly over it
const SCENE_DIM = 0.35; // opacity behind the next section
const DIM_START = 1.15; // viewport heights scrolled
const DIM_END = 1.7;

function Arrow() {
  return (
    <svg width="14" height="10" viewBox="0 0 14 10" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true">
      <path d="M0 5h12.5M8.5 1l4 4-4 4" />
    </svg>
  );
}

function CtaLink({ href, children, delay }: { href: string; children: React.ReactNode; delay: number }) {
  return (
    <a
      href={href}
      onClick={(e) => {
        e.preventDefault();
        document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
      }}
      className="hero-fade-up group relative flex items-center justify-between gap-6 w-full sm:w-[15rem] pb-2.5 text-[11px] sm:text-xs uppercase tracking-[0.12em] text-white/85 hover:text-white transition-colors"
      style={{ animationDelay: `${delay}s` }}
    >
      <span>{children}</span>
      <span className="transition-transform duration-300 group-hover:translate-x-1">
        <Arrow />
      </span>
      <span className="absolute left-0 right-0 bottom-0 h-px bg-white/35" />
      <span className="absolute left-0 right-0 bottom-0 h-px bg-white origin-left scale-x-0 transition-transform duration-500 ease-out group-hover:scale-x-100" />
    </a>
  );
}

export default function Hero({ children }: { children?: React.ReactNode }) {
  const lite = usePerfLite();
  const copyRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const afterRef = useRef<HTMLDivElement>(null);
  const releaseRef = useRef<(() => void) | null>(null);

  // The copy waits for the scene's construction intro. The hold is taken
  // here, at hydration — the scene itself loads lazily and may only mount
  // after the loader has gone. Lite mode (no scene) lets the copy straight in.
  useEffect(() => {
    if (lite) return;
    const release = holdHeroReveal();
    releaseRef.current = release;
    return () => {
      release?.();
      releaseRef.current = null;
    };
  }, [lite]);
  const onIntroDone = useCallback(() => releaseRef.current?.(), []);

  // As the first scroll blows the object apart, the headline blurs out word by
  // word (like the Statement's words) and the rest of the copy fades
  useEffect(() => {
    const copy = copyRef.current;
    if (!copy) return;
    const words = Array.from(copy.querySelectorAll<HTMLElement>('[data-word]'));
    const fades = Array.from(copy.querySelectorAll<HTMLElement>('[data-fade]'));
    return onScrollFrame(() => {
      const p = Math.min(1, Math.max(0, window.scrollY / window.innerHeight / SCROLL_FADE));
      words.forEach((el, i) => {
        const rank = DISSOLVE_ORDER.indexOf(i);
        const start = ((rank === -1 ? i : rank) / Math.max(1, words.length - 1)) * (1 - WORD_WINDOW);
        const wp = Math.min(1, Math.max(0, (p - start) / WORD_WINDOW));
        setWordStyle(el, 1 - wp, wp * 12, -wp * 14);
      });
      fades.forEach((el) => {
        el.style.opacity = (1 - p).toFixed(3);
        el.style.visibility = p >= 1 ? 'hidden' : '';
      });
    });
  }, []);

  // The scene dims as the following section arrives and fades out as it
  // ends; once gone it leaves layout, so the scene's own visibility check
  // pauses its rendering
  useEffect(() => {
    return onScrollFrame(() => {
      const scene = sceneRef.current;
      const after = afterRef.current?.lastElementChild;
      if (!scene) return;
      let opacity = 1;
      if (after) {
        const rect = after.getBoundingClientRect();
        const total = rect.height - window.innerHeight;
        const p = total > 0 ? Math.min(Math.max(-rect.top / total, 0), 1) : 0;
        const t = Math.min(Math.max((p - SCENE_FADE_START) / (SCENE_FADE_END - SCENE_FADE_START), 0), 1);
        opacity = 1 - t * t * (3 - 2 * t);
      }
      const d = Math.min(Math.max((window.scrollY / window.innerHeight - DIM_START) / (DIM_END - DIM_START), 0), 1);
      opacity *= 1 - (1 - SCENE_DIM) * d * d * (3 - 2 * d);
      scene.style.opacity = opacity.toFixed(3);
      scene.style.display = opacity <= 0.001 ? 'none' : '';
    });
  }, []);

  let wordIndex = 0;

  return (
    <div className="relative bg-[#090909]">
      {/* WebGL scene: a sticky full-screen layer behind the hero and the next
          section; the negative margin takes it out of the flow */}
      <div className="sticky top-0 z-0 h-screen h-[100svh] -mb-[100vh] -mb-[100svh] overflow-hidden">
        <div ref={sceneRef} className="absolute inset-0">
          {!lite && <BlastScene className="absolute inset-0" onIntroDone={onIntroDone} />}
        </div>
      </div>

      <section id="hero" className="relative z-10 w-full h-[170vh] h-[170svh] text-white select-none">
        <div className="sticky top-0 w-full h-screen h-[100svh] min-h-[560px] overflow-hidden">
          <div ref={copyRef} className="absolute inset-0 z-10 pointer-events-none">
            {/* Top left: headline + calls to action */}
            <div className="absolute left-5 right-5 sm:left-6 lg:left-8 top-24 sm:top-28">
              <h1 className="m-0 font-sans font-normal text-white tracking-[-0.045em] leading-[0.98] text-[clamp(2.6rem,6.2vw,6.4rem)]">
                {HEADLINE.map((line, li) => (
                  <span key={li} className="block">
                    {line.map((word) => (
                      <span
                        key={word}
                        data-word
                        className="inline-block overflow-hidden align-top mr-[0.22em] pb-[0.14em] -mb-[0.14em]"
                      >
                        <span className="hero-word-inner" style={{ animationDelay: `${0.15 + wordIndex++ * 0.1}s` }}>
                          {word}
                        </span>
                      </span>
                    ))}
                    {li === HEADLINE.length - 1 && (
                      <span data-word className="inline-block" aria-label={LAST_WORD}>
                        {LAST_WORD.split('').map((ch, i) => (
                          <span
                            key={i}
                            aria-hidden="true"
                            className="hero-letter-in inline-block"
                            style={{ animationDelay: `${0.75 + i * 0.09}s` }}
                          >
                            {ch}
                          </span>
                        ))}
                      </span>
                    )}
                  </span>
                ))}
              </h1>

              <div
                data-fade
                className="pointer-events-auto mt-8 sm:mt-10 flex flex-col sm:flex-row gap-4 sm:gap-4 max-w-[15rem] sm:max-w-none"
              >
                <CtaLink href="#contact" delay={1.15}>
                  Start a conversation
                </CtaLink>
                <CtaLink href="#about-intro" delay={1.25}>
                  Our approach
                </CtaLink>
              </div>
            </div>

            {/* Bottom right: live local time across the regions */}
            <div data-fade className="hidden md:block absolute right-6 lg:right-8 bottom-8 sm:bottom-10 w-[20rem] lg:w-[23rem]">
              <div className="hero-fade-up" style={{ animationDelay: '1.45s' }}>
                <RegionClock className="text-[17px] lg:text-[19px] leading-[1.3] tracking-[-0.01em] text-white/80" />
              </div>
            </div>

            {/* Bottom left: scroll cue */}
            <div data-fade className="absolute left-5 sm:left-6 lg:left-8 bottom-8 sm:bottom-10">
              <button
                type="button"
                onClick={() => window.scrollTo({ top: window.innerHeight * 1.7, behavior: 'smooth' })}
                aria-label="Scroll to next section"
                className="hero-fade-up pointer-events-auto w-7 h-7 flex items-center justify-center rounded-full border border-white/40 text-white/80 hover:bg-white hover:text-black transition-colors"
                style={{ animationDelay: '1.85s' }}
              >
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  aria-hidden="true"
                >
                  <path d="M8 2v11M3.5 8.5 8 13l4.5-4.5" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* The next section scrolls in over the same scene */}
      <div ref={afterRef} className="relative z-10">
        {children}
      </div>
    </div>
  );
}
