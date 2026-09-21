'use client';

import React, { useState } from 'react';

export default function Hero() {
  const [isLastsHovered, setIsLastsHovered] = useState(false);

  return (
    <section
      className="relative w-full min-h-[100svh] bg-[#090909] text-white flex flex-col justify-center items-center overflow-hidden px-6 py-20"
      id="hero"
    >
      <div className="w-full max-w-[1400px] mx-auto flex flex-col items-center justify-center relative z-10">
        <h1 className="font-sans font-semibold text-center text-white tracking-[-0.035em] leading-[0.94] text-[clamp(3.2rem,8.5vw,9.5rem)] select-none">
          <span
            className={`block transition-all duration-500 ease-out ${
              isLastsHovered ? 'opacity-20 blur-[0.6px]' : 'opacity-100'
            }`}
          >
            Solving
          </span>
          <span
            className={`block transition-all duration-500 ease-out ${
              isLastsHovered ? 'opacity-20 blur-[0.6px]' : 'opacity-100'
            }`}
          >
            what matters,
          </span>
          <span
            className={`block transition-all duration-500 ease-out ${
              isLastsHovered ? 'opacity-20 blur-[0.6px]' : 'opacity-100'
            }`}
          >
            building
          </span>
          <span className="block">
            <span
              className={`inline-block mr-2 sm:mr-3 transition-all duration-500 ease-out ${
                isLastsHovered ? 'opacity-20 blur-[0.6px]' : 'opacity-100'
              }`}
            >
              what
            </span>
            <span
              role="button"
              tabIndex={0}
              onMouseEnter={() => setIsLastsHovered(true)}
              onMouseLeave={() => setIsLastsHovered(false)}
              onFocus={() => setIsLastsHovered(true)}
              onBlur={() => setIsLastsHovered(false)}
              onClick={() => setIsLastsHovered((prev) => !prev)}
              className="inline-flex items-baseline cursor-pointer group/term outline-none"
            >
              <span
                className={`transition-colors duration-300 ${
                  isLastsHovered ? 'text-white' : 'text-white'
                }`}
              >
                lasts
              </span>
              {/* Professional architectural 6-point asterisk mark */}
              <span className="inline-flex items-center ml-1 select-none pointer-events-none align-super">
                <svg
                  className="w-[0.22em] h-[0.22em] text-[#e2b04a] -translate-y-[0.38em]"
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
        </h1>
      </div>

      {/* Bottom right definition note — reveals cleanly only on hover */}
      <div
        className={`absolute bottom-8 right-6 sm:bottom-10 sm:right-10 lg:right-16 max-w-xs sm:max-w-sm z-20 transition-all duration-500 ease-out ${
          isLastsHovered
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-2 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-1.5 font-mono text-[11px] sm:text-xs uppercase tracking-[0.14em] mb-1.5 text-white">
          <span className="text-[#e2b04a]">/</span>
          <span className="font-semibold">LASTS*</span>
        </div>
        <p className="font-sans text-xs sm:text-[13px] leading-relaxed text-white/80 font-normal">
          Enduring value over short-term wins. We design resilient strategies, operating models, and execution frameworks built to thrive across market cycles.
        </p>
      </div>
    </section>
  );
}
