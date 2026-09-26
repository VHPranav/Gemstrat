'use client';

import React, { useEffect, useRef } from 'react';
import { onScrollFrame } from '@/lib/scrollFrame';
import { setWordStyle } from '@/lib/wordStyle';

const QUOTE_LINES = [
  ['“Scale,', 'transform,', 'and'],
  ['succeed', 'with', 'a', 'people-first'],
  ['mindset', 'and', 'creative', '+'],
  ['technology', 'power.”'],
];

const ALL_WORDS = QUOTE_LINES.flat();

// Non-sequential, scattered blur-out sequence across lines:
const RANDOM_DISSOLVE_SEQUENCE = [7, 2, 11, 4, 9, 1, 8, 5, 12, 3, 10, 0, 6];

export default function Statement() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const quoteWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      wordRefs.current.forEach((el) => {
        if (el) {
          el.style.opacity = '1';
          el.style.filter = 'none';
          el.style.transform = 'none';
        }
      });
      return;
    }

    const updateScrollAnimation = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const viewportH = window.innerHeight;
      const totalScrollable = rect.height - viewportH;

      if (totalScrollable <= 0) return;

      // Progress: 0 when sticky locks, 1 when section completes
      const progress = Math.min(Math.max(-rect.top / totalScrollable, 0), 1);

      // Text blur-out dissolution across scroll progress (0.10 -> 0.85)
      const totalWords = ALL_WORDS.length;
      const startBuffer = 0.12;
      const endDissolve = 0.82;
      const availableRange = endDissolve - startBuffer;
      const windowSize = 0.14;

      ALL_WORDS.forEach((_, index) => {
        const el = wordRefs.current[index];
        if (!el) return;

        const randomRank = RANDOM_DISSOLVE_SEQUENCE.indexOf(index);
        const orderRank = randomRank !== -1 ? randomRank : index;

        const wordStart = startBuffer + (orderRank / (totalWords - 1 || 1)) * (availableRange - windowSize);
        const wordEnd = wordStart + windowSize;

        const wordP = Math.min(Math.max((progress - wordStart) / (wordEnd - wordStart), 0), 1);

        const opacity = 1 - wordP;
        const blur = wordP * 10; // big type: keep the blur radius (paint cost) modest
        const translateY = -wordP * 14;

        setWordStyle(el, opacity, blur, translateY);
      });

      // Quote container fade-out toward the end
      if (quoteWrapRef.current) {
        const quoteOpacity = Math.max(1 - (progress - 0.75) / 0.20, 0);
        quoteWrapRef.current.style.opacity = quoteOpacity.toFixed(3);
      }
    };

    // Same-frame updates from the shared scroll loop (no rAF lag)
    return onScrollFrame(updateScrollAnimation);
  }, []);

  let wordCounter = 0;

  return (
    <div
      className="relative h-[220vh] bg-transparent m-0 p-0 border-none overflow-visible"
      ref={sectionRef}
      id="statement"
      role="region"
      aria-label="Company Statement"
    >
      {/* Transparent: the shared HeroBackdrop sculpture shows through */}
      <div className="sticky top-0 h-screen h-[100svh] w-full flex items-center justify-center bg-transparent z-10 overflow-hidden">
        <div
          ref={quoteWrapRef}
          className="w-full max-w-[1500px] mx-auto px-6 sm:px-12 lg:px-16"
        >
          <blockquote className="m-0 p-0 font-archivo-expanded text-[clamp(2.5rem,7vw,92px)] font-normal leading-[1.12] tracking-[-0.03em] text-white text-left">
            {QUOTE_LINES.map((line, lineIdx) => (
              <span key={lineIdx} className="block">
                {line.map((word) => {
                  const currentIdx = wordCounter++;
                  return (
                    <span
                      key={currentIdx}
                      ref={(el) => {
                        wordRefs.current[currentIdx] = el;
                      }}
                      className="inline-block mr-[0.28em] opacity-100 blur-none translate-y-0"
                    >
                      {word}
                    </span>
                  );
                })}
              </span>
            ))}
          </blockquote>
        </div>
      </div>
    </div>
  );
}
