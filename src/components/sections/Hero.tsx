'use client';

import React, { useState } from 'react';

// Giant wordmark letters spread edge to edge across the hero
const WORDMARK = 'GEMSTRAT'.split('');

// Intro timeline (seconds): letters rise → sculpture fades in (HeroBackdrop,
// 1.1s) → copy appears
const LETTERS_START = 0.2;
const LETTER_STAGGER = 0.07;
const COPY_START = 1.9;

export default function Hero() {
  const [isLastsHovered, setIsLastsHovered] = useState(false);
  const dim = isLastsHovered ? 'opacity-25 blur-[0.6px]' : 'opacity-100';

  const scrollToNext = () => {
    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
  };

  return (
    <section
      id="hero"
      className="relative w-full h-[100svh] min-h-[560px] bg-transparent text-white overflow-hidden"
    >
      {/* The sculpture lives in HeroBackdrop (shared with the Statement) */}
      {/* Top centre: tagline */}
      <div
        className="hero-fade-up absolute top-6 sm:top-8 inset-x-0 z-10 flex justify-center px-6"
        style={{ animationDelay: `${COPY_START}s` }}
      >
        <h1 className="font-sans font-normal uppercase text-center text-white tracking-[-0.02em] leading-[1.05] text-[clamp(1.15rem,2.1vw,2.4rem)] m-0 select-none">
          <span className={`block transition-all duration-500 ease-out ${dim}`}>Solving what matters,</span>
          <span className="block">
            <span className={`transition-all duration-500 ease-out ${dim}`}>building what </span>
            <span
              role="button"
              tabIndex={0}
              onMouseEnter={() => setIsLastsHovered(true)}
              onMouseLeave={() => setIsLastsHovered(false)}
              onFocus={() => setIsLastsHovered(true)}
              onBlur={() => setIsLastsHovered(false)}
              onClick={() => setIsLastsHovered((prev) => !prev)}
              className="inline-flex items-baseline cursor-pointer outline-none"
            >
              lasts
              <svg
                className="w-[0.32em] h-[0.32em] ml-[0.06em] text-[#e2b04a] -translate-y-[0.55em]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3.2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <line x1="12" y1="3" x2="12" y2="21" />
                <line x1="4.2" y1="7.5" x2="19.8" y2="16.5" />
                <line x1="4.2" y1="16.5" x2="19.8" y2="7.5" />
              </svg>
            </span>
          </span>
        </h1>
      </div>

      {/* Middle: giant wordmark, letters spread edge to edge, rising in */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 z-10 px-[1.2vw] pointer-events-none select-none">
        <div
          className="flex justify-between font-sans font-light text-white leading-none text-[clamp(3.2rem,13vw,15rem)] tracking-[-0.02em]"
          aria-label="Gemstrat"
          role="img"
        >
          {WORDMARK.map((letter, i) => (
            <span key={i} className="block overflow-hidden pb-[0.04em]">
              <span
                className="hero-letter"
                style={{ animationDelay: `${LETTERS_START + i * LETTER_STAGGER}s` }}
              >
                {letter}
              </span>
            </span>
          ))}
        </div>

        {/* Caption tucked under the right side of the wordmark */}
        <div
          className="hero-fade-up flex justify-end mt-4 sm:mt-6 pr-[0.5vw]"
          style={{ animationDelay: `${COPY_START + 0.15}s` }}
        >
          <p className="font-sans uppercase text-right text-white/55 text-[11px] sm:text-[13px] leading-[1.35] tracking-[0.04em] m-0">
            Boutique
            <br />
            strategic
            <br />
            consultancy
          </p>
        </div>
      </div>

      {/* Bottom left: definition of "lasts*" — revealed on hover */}
      <div
        className={`absolute bottom-8 left-6 sm:bottom-10 sm:left-10 lg:left-12 max-w-xs sm:max-w-sm z-20 transition-all duration-500 ease-out ${
          isLastsHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-1.5 font-mono text-[11px] sm:text-xs uppercase tracking-[0.14em] mb-1.5 text-white">
          <span className="text-[#e2b04a]">/</span>
          <span className="font-semibold">LASTS*</span>
        </div>
        <p className="font-sans text-xs sm:text-[13px] leading-relaxed text-white/80 font-normal m-0">
          Enduring value over short-term wins. We design resilient strategies, operating models, and execution frameworks built to thrive across market cycles.
        </p>
      </div>

      {/* Bottom right: scroll cue */}
      <button
        type="button"
        onClick={scrollToNext}
        aria-label="Scroll to next section"
        className="hero-fade-up absolute bottom-8 right-6 sm:bottom-10 sm:right-10 lg:right-12 z-20 w-10 h-10 flex items-center justify-center border border-white/20 bg-white/5 hover:bg-white/15 transition-colors"
        style={{ animationDelay: `${COPY_START + 0.3}s` }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
          <path d="M8 2v11M3.5 8.5 8 13l4.5-4.5" />
        </svg>
      </button>
    </section>
  );
}
