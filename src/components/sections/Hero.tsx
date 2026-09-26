'use client';

import React, { useState } from 'react';

const LINE_1 = ['Solving', 'what', 'matters,'];
const LINE_2 = ['building', 'what'];
const SUB_WORDS = ['Boutique', 'strategic', 'consultancy'];

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

      {/* Centre: tagline — the primary hero statement */}
      <div className="absolute inset-0 z-10 flex items-center justify-center px-6">
        <div className="flex flex-col items-center text-center">
          <h1 className="font-sans font-normal uppercase text-center text-white tracking-[-0.03em] leading-[1.05] text-[clamp(2.4rem,7vw,6rem)] m-0 select-none">
            {/* Line 1 */}
            <span className="block overflow-hidden pb-[0.06em]">
              {LINE_1.map((word, i) => (
                <span key={word} className="inline-block overflow-hidden align-top mr-[0.24em] last:mr-0">
                  <span
                    className="hero-word-inner"
                    style={{ animationDelay: `${0.15 + i * 0.11}s` }}
                  >
                    <span className={`inline-block transition-all duration-500 ease-out ${dim}`}>
                      {word}
                    </span>
                  </span>
                </span>
              ))}
            </span>

            {/* Line 2 */}
            <span className="block overflow-hidden pb-[0.06em]">
              {LINE_2.map((word, i) => (
                <span key={word} className="inline-block overflow-hidden align-top mr-[0.24em]">
                  <span
                    className="hero-word-inner"
                    style={{ animationDelay: `${0.49 + i * 0.11}s` }}
                  >
                    <span className={`inline-block transition-all duration-500 ease-out ${dim}`}>
                      {word}
                    </span>
                  </span>
                </span>
              ))}

              {/* lasts* with interactive hover */}
              <span className="inline-block overflow-hidden align-top">
                <span
                  className="hero-word-inner"
                  style={{ animationDelay: '0.71s' }}
                >
                  <span
                    role="button"
                    tabIndex={0}
                    onMouseEnter={() => setIsLastsHovered(true)}
                    onMouseLeave={() => setIsLastsHovered(false)}
                    onFocus={() => setIsLastsHovered(true)}
                    onBlur={() => setIsLastsHovered(false)}
                    onClick={() => setIsLastsHovered((prev) => !prev)}
                    className="inline-flex items-baseline cursor-pointer outline-none group"
                  >
                    <span className="transition-all duration-300 group-hover:text-white">lasts</span>
                    <span
                      className="hero-asterisk-pop inline-block"
                      style={{ animationDelay: '0.85s' }}
                    >
                      <svg
                        className="w-[0.32em] h-[0.32em] ml-[0.06em] text-[#e2b04a] -translate-y-[0.55em] transition-transform duration-300 group-hover:scale-125"
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
                </span>
              </span>
            </span>
          </h1>

          {/* Boutique label below tagline */}
          <p className="font-sans uppercase text-center text-white/45 text-[11px] sm:text-[13px] leading-[1.35] tracking-[0.1em] m-0 mt-6 select-none">
            {SUB_WORDS.map((word, i) => (
              <span key={word} className="inline-block overflow-hidden align-top mr-[0.32em] last:mr-0">
                <span
                  className="hero-word-inner"
                  style={{ animationDelay: `${0.94 + i * 0.09}s` }}
                >
                  <span className={`inline-block transition-all duration-500 ease-out ${dim}`}>
                    {word}
                  </span>
                </span>
              </span>
            ))}
          </p>
        </div>
      </div>

      {/* Bottom left: definition of "lasts*" — revealed on hover */}
      <div
        className={`absolute bottom-8 left-6 sm:bottom-10 sm:left-10 lg:left-12 max-w-xs sm:max-w-sm z-20 transition-all duration-500 ease-out ${isLastsHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
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
        style={{ animationDelay: '1.85s' }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
          <path d="M8 2v11M3.5 8.5 8 13l4.5-4.5" />
        </svg>
      </button>
    </section>
  );
}
