'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';

interface DispersalItem {
  id: string;
  src: string;
  alt: string;
  targetX: number; // Final target X in vw relative to center of Screen 1
  targetY: number; // Final target Y in vh relative to center of Screen 1
  widthClass: string;
  aspectClass: string;
  stagger: number; // Staggered release offset (0 to 0.15)
}

// 5 images placed around "The Gemstrat Advantage"
const DISPERSAL_ITEMS: DispersalItem[] = [
  {
    id: 'top-left',
    src: '/images/698128379778759116.jpeg',
    alt: 'What a privilege it is to be exhausted by a challenge you chose for yourself',
    targetX: -38, // Floating top-left of "The"
    targetY: -30,
    widthClass: 'w-[145px] sm:w-[180px] lg:w-[225px]',
    aspectClass: 'aspect-[3/4]',
    stagger: 0.0,
  },
  {
    id: 'top-right',
    src: '/images/933511829023645883.jpeg',
    alt: 'Run at your own pace motion poster',
    targetX: 28, // Floating top-right of "Advantage"
    targetY: -30,
    widthClass: 'w-[145px] sm:w-[175px] lg:w-[215px]',
    aspectClass: 'aspect-[4/5]',
    stagger: 0.06,
  },
  {
    id: 'bottom-left',
    src: '/images/844284261438464223.jpeg',
    alt: 'Noise off Focus on eyewear portrait',
    targetX: -36, // Floating bottom-left under "The"
    targetY: 28,
    widthClass: 'w-[135px] sm:w-[165px] lg:w-[205px]',
    aspectClass: 'aspect-[4/5]',
    stagger: 0.03,
  },
  {
    id: 'bottom-center',
    src: '/images/984599537320872120.jpeg',
    alt: 'The next batch will arrive desk visual',
    targetX: 4, // Floating below center
    targetY: 33,
    widthClass: 'w-[135px] sm:w-[165px] lg:w-[200px]',
    aspectClass: 'aspect-[4/5]',
    stagger: 0.10,
  },
  {
    id: 'bottom-right',
    src: '/images/246572148347325364.jpeg',
    alt: 'Homie delivery vehicle motion shot',
    targetX: 38, // Floating right of "Advantage"
    targetY: 16,
    widthClass: 'w-[145px] sm:w-[180px] lg:w-[225px]',
    aspectClass: 'aspect-[4/5]',
    stagger: 0.05,
  },
];

const ADVANTAGE_LINES = [
  ['The', 'Gemstrat'],
  ['Advantage'],
];

const ALL_WORDS = ADVANTAGE_LINES.flat();

// Random order for word-by-word blur-up in: "Gemstrat" (1) -> "The" (0) -> "Advantage" (2)
const WORD_RANDOM_ORDER = [1, 0, 2];

// 4 advantage rows: start staggered diagonally (Ref 1), then slide left to align together (Ref 2)
const ADVANTAGE_PILLARS = [
  {
    id: 'pillar-1',
    title: 'Client-Centric, Always',
    subtext: 'We listen deeply and co-create solutions.',
    initialStaggerVw: 0, // Starts aligned at base left
  },
  {
    id: 'pillar-2',
    title: 'Industry Fluency',
    subtext: 'We listen deeply and co-create solutions.',
    initialStaggerVw: 12, // Starts indented +12vw, slides left to 0
  },
  {
    id: 'pillar-3',
    title: 'Global Reach, Local Pulse',
    subtext: 'We listen deeply and co-create solutions.',
    initialStaggerVw: 24, // Starts indented +24vw, slides left to 0
  },
  {
    id: 'pillar-4',
    title: 'Creative Meets Commercial',
    subtext: 'We listen deeply and co-create solutions.',
    initialStaggerVw: 38, // Starts indented +38vw, slides left to 0
  },
];

// 4 new dummy content items revealed by the black blinds transition
const DARK_ADVANTAGE_PILLARS = [
  {
    id: 'dark-pillar-1',
    title: 'Bespoke Strategy, Zero Template',
    subtext: 'Tailored roadmaps engineered specifically for your market edge.',
  },
  {
    id: 'dark-pillar-2',
    title: 'High-Velocity Execution',
    subtext: 'Turning strategic clarity into deployed assets in record time.',
  },
  {
    id: 'dark-pillar-3',
    title: 'Engineering & Design Synergy',
    subtext: 'Where technical rigor empowers world-class brand experiences.',
  },
  {
    id: 'dark-pillar-4',
    title: 'Measurable Commercial Impact',
    subtext: 'Every deliverable calibrated directly against your growth metrics.',
  },
];

export default function GemstratAdvantage() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const mainTrackRef = useRef<HTMLDivElement>(null);
  const pillarContentRefs = useRef<(HTMLDivElement | null)[]>([]);
  const blindRefs = useRef<(HTMLDivElement | null)[]>([]);
  const blindEdgeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const stickyRef = useRef<HTMLDivElement>(null);

  const isAlignedRef = useRef(false);

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      wordRefs.current.forEach((span) => {
        if (span) {
          span.style.opacity = '1';
          span.style.filter = 'none';
          span.style.transform = 'none';
        }
      });
      itemRefs.current.forEach((el, index) => {
        if (!el) return;
        const item = DISPERSAL_ITEMS[index];
        el.style.transform = `translate3d(${item.targetX}vw, ${item.targetY}vh, 0) scale(1)`;
        el.style.opacity = '1';
      });
      pillarContentRefs.current.forEach((el) => {
        if (el) el.style.transform = 'translate3d(0, 0, 0)';
      });
      return;
    }

    let rafId: number;

    const updateAnimation = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const viewportH = window.innerHeight;
      const viewportW = window.innerWidth;
      const totalScrollable = rect.height - viewportH;

      if (totalScrollable <= 0) return;

      // Progress: 0 when sticky locks, 1 when section completes
      const progress = Math.min(Math.max(-rect.top / totalScrollable, 0), 1);

      // ==========================================================
      // Phase 1: Random Word-by-Word Blur-Up In (progress 0.02 -> 0.13)
      // ==========================================================
      const totalWords = ALL_WORDS.length;
      const startWord = 0.02;
      const endWord = 0.13;
      const windowSize = 0.045;
      const activeRange = endWord - startWord - windowSize;

      wordRefs.current.forEach((span, index) => {
        if (!span) return;
        const rank = WORD_RANDOM_ORDER[index] ?? index;
        const wordStart = startWord + (rank / (totalWords - 1 || 1)) * activeRange;
        const wordEnd = wordStart + windowSize;

        const wordP = Math.min(Math.max((progress - wordStart) / (wordEnd - wordStart), 0), 1);

        const opacity = wordP;
        const blur = (1 - wordP) * 24;
        const translateY = (1 - wordP) * 32;

        span.style.opacity = opacity.toFixed(3);
        span.style.filter = blur > 0.05 ? `blur(${blur.toFixed(1)}px)` : 'none';
        span.style.transform = `translate3d(0, ${translateY.toFixed(1)}px, 0)`;
      });

      // ==========================================================
      // Phase 2: Images Emerge One by One on Scrolling (progress 0.135 -> 0.35)
      // Each image launches sequentially with distinct start and arrival points
      // ==========================================================
      const imgPhaseStart = 0.135;
      const stepDuration = 0.048; // duration of individual image journey
      const stepInterval = 0.038; // interval between successive launches

      const startX = 0;
      const startY = 46;

      itemRefs.current.forEach((el, index) => {
        if (!el) return;
        const item = DISPERSAL_ITEMS[index];

        const itemStart = imgPhaseStart + index * stepInterval;
        const itemEnd = itemStart + stepDuration;

        if (progress < itemStart) {
          el.style.opacity = '0';
          el.style.transform = `translate3d(${startX}vw, ${startY}vh, 0) scale(0.18)`;
        } else {
          const localP = Math.min(
            Math.max((progress - itemStart) / (itemEnd - itemStart), 0),
            1
          );

          // Silky cubic ease-out
          const ease = 1 - Math.pow(1 - localP, 2.5);

          const curX = startX + ease * (item.targetX - startX);
          const curY = startY + ease * (item.targetY - startY);
          const curScale = 0.18 + ease * 0.82;
          const curOpacity = Math.min(localP / 0.22, 1);

          el.style.opacity = curOpacity.toFixed(3);
          el.style.transform = `translate3d(${curX.toFixed(2)}vw, ${curY.toFixed(2)}vh, 0) scale(${curScale.toFixed(4)})`;
        }
      });

      // ==========================================================
      // Phase 3: Screen 1 slides left while Screen 2 (all 4 rows) slides in!
      // (NO FADING: buttery smootherstep physical slide across progress 0.38 -> 0.56)
      // ==========================================================
      const slideStart = 0.38;
      const slideEnd = 0.56;

      if (mainTrackRef.current) {
        if (progress < slideStart) {
          mainTrackRef.current.style.transform = 'translate3d(0, 0, 0)';
        } else if (progress <= slideEnd) {
          const pSlide = (progress - slideStart) / (slideEnd - slideStart);
          // Smootherstep (zero velocity at both start and end for zero-jerk slide)
          const easeSlide = pSlide * pSlide * pSlide * (pSlide * (pSlide * 6 - 15) + 10);
          const currentX = -easeSlide * viewportW;
          mainTrackRef.current.style.transform = `translate3d(${currentX.toFixed(1)}px, 0, 0)`;
        } else {
          // Screen 2 is locked fully centered in viewport
          mainTrackRef.current.style.transform = `translate3d(${-viewportW}px, 0, 0)`;
        }
      }

      // ==========================================================
      // Phase 4: Buttery Automatic Slide into Left Alignment!
      // Once Screen 2 arrives in viewport (progress >= 0.55),
      // the rows glide gracefully into left alignment via smooth quintic transition.
      // If scrolling back up (progress < 0.45), smoothly reset to staggered state.
      // ==========================================================
      if (progress >= 0.55 && !isAlignedRef.current) {
        isAlignedRef.current = true;
        pillarContentRefs.current.forEach((el) => {
          if (el) el.style.transform = 'translate3d(0vw, 0, 0)';
        });
      } else if (progress < 0.45 && isAlignedRef.current) {
        isAlignedRef.current = false;
        pillarContentRefs.current.forEach((el, idx) => {
          if (el) {
            const initialStagger = ADVANTAGE_PILLARS[idx].initialStaggerVw;
            el.style.transform = `translate3d(${initialStagger}vw, 0, 0)`;
          }
        });
      }

      // ==========================================================
      // Phase 5: The 4 Blinds Transition (motion.dev curtains blinds)
      // 4 black blinds expand down from each divider line,
      // changing each row into black and revealing the new 4 contents!
      // (progress 0.66 -> 0.88)
      // ==========================================================
      const blindsStart = 0.66;
      const blindsEnd = 0.88;

      blindRefs.current.forEach((el, idx) => {
        if (!el) return;
        const edgeEl = blindEdgeRefs.current[idx];

        if (progress < blindsStart) {
          el.style.clipPath = 'inset(0 0 100% 0)';
          if (edgeEl) {
            edgeEl.style.opacity = '0';
            edgeEl.style.top = '0%';
          }
        } else if (progress <= blindsEnd) {
          const pBlinds = (progress - blindsStart) / (blindsEnd - blindsStart);
          const stagger = idx * 0.035;
          const localT = Math.min(Math.max((pBlinds - stagger) / (1 - 3 * 0.035), 0), 1);
          // Smootherstep for clean, mechanical yet organic blinds wipe
          const easeBlind = localT * localT * (3 - 2 * localT);
          const bottomInset = (1 - easeBlind) * 100;
          el.style.clipPath = `inset(0 0 ${bottomInset.toFixed(2)}% 0)`;
          if (edgeEl) {
            edgeEl.style.top = `${(easeBlind * 100).toFixed(2)}%`;
            edgeEl.style.opacity = easeBlind > 0.01 && easeBlind < 0.99 ? '1' : '0';
          }
        } else {
          el.style.clipPath = 'inset(0 0 0% 0)';
          if (edgeEl) {
            edgeEl.style.opacity = '0';
            edgeEl.style.top = '100%';
          }
        }
      });

      if (sectionRef.current) {
        sectionRef.current.style.backgroundColor = progress >= 0.86 ? '#090909' : '#ffffff';
      }
      if (stickyRef.current) {
        stickyRef.current.style.backgroundColor = progress >= 0.86 ? '#090909' : '#ffffff';
      }
    };

    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateAnimation);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    updateAnimation();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  let wordIndexCounter = 0;

  return (
    <section
      ref={sectionRef}
      className="relative w-full h-[460vh] bg-white text-[#090909] z-40 overflow-visible transition-colors duration-300"
    >
      <div
        ref={stickyRef}
        className="sticky top-0 h-screen h-[100svh] w-full flex items-center overflow-hidden bg-white box-border transition-colors duration-300"
      >
        
        {/* Continuous Horizontal Track (Screen 1 + Screen 2 side-by-side) */}
        <div
          ref={mainTrackRef}
          className="h-full flex flex-row flex-nowrap items-center will-change-transform pointer-events-none select-none"
          style={{ width: '200vw', transform: 'translate3d(0, 0, 0)' }}
        >
          
          {/* ========================================================= */}
          {/* Screen 1: "The Gemstrat Advantage" Headline + 5 Images   */}
          {/* ========================================================= */}
          <div className="w-screen h-full shrink-0 relative flex items-center justify-center overflow-hidden px-6 sm:px-12 lg:px-16 pointer-events-none select-none">
            
            {/* Giant Editorial Headline */}
            <div className="relative z-10 text-center pointer-events-none select-none max-w-[1440px] mx-auto">
              <h2 className="font-jakarta text-[clamp(4.6rem,12vw,165px)] font-medium text-[#090909] leading-[0.96] tracking-[-0.04em] m-0">
                {ADVANTAGE_LINES.map((line, lIdx) => (
                  <span key={lIdx} className="block">
                    {line.map((word) => {
                      const idx = wordIndexCounter++;
                      return (
                        <span
                          key={idx}
                          ref={(el) => {
                            wordRefs.current[idx] = el;
                          }}
                          className="inline-block mr-[0.25em] last:mr-0 will-change-[opacity,filter,transform] opacity-0"
                          style={{
                            transform: 'translate3d(0, 32px, 0)',
                            filter: 'blur(24px)',
                          }}
                        >
                          {word}
                        </span>
                      );
                    })}
                  </span>
                ))}
              </h2>
            </div>

            {/* 5 Dispersing Visual Cards from Center-Bottom of Screen 1 */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-20">
              {DISPERSAL_ITEMS.map((item, idx) => (
                <div
                  key={item.id}
                  ref={(el) => {
                    itemRefs.current[idx] = el;
                  }}
                  className={`absolute ${item.widthClass} ${item.aspectClass} rounded-xl overflow-hidden shadow-2xl bg-[#eaeaea] border border-black/5 will-change-[transform,opacity] pointer-events-none select-none`}
                  style={{
                    transform: 'translate3d(0, 46vh, 0) scale(0.2)',
                    opacity: 0,
                  }}
                >
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    sizes="(max-width: 768px) 160px, 225px"
                    className="object-cover pointer-events-none"
                  />
                </div>
              ))}
            </div>

          </div>

          {/* ========================================================= */}
          {/* Screen 2: All 4 Advantage Rows Together (Single Viewport) */}
          {/* 1. Staggered -> Auto-slides left into alignment           */}
          {/* 2. 4 Blinds Transition wipes down from lines into black!  */}
          {/* ========================================================= */}
          <div className="w-screen h-full shrink-0 flex flex-col justify-between relative pointer-events-none select-none">
            {ADVANTAGE_PILLARS.map((pillar, pIdx) => (
              <div
                key={pillar.id}
                className={`flex-1 relative flex flex-col justify-center border-b border-black/[0.12] ${
                  pIdx === 0 ? 'border-t border-black/[0.12]' : ''
                } pointer-events-none select-none px-6 overflow-hidden`}
              >
                {/* 1. White Content Block: starts staggered, auto-slides left */}
                <div
                  ref={(el) => {
                    pillarContentRefs.current[pIdx] = el;
                  }}
                  className="absolute top-1/2 -translate-y-1/2 left-[6vw] sm:left-[8vw] lg:left-[10vw] max-w-[90vw] sm:max-w-[700px] lg:max-w-[950px] transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform pointer-events-none select-none"
                  style={{
                    transitionDelay: `${pIdx * 110}ms`,
                    transform: `translate3d(${pillar.initialStaggerVw}vw, 0, 0)`,
                  }}
                >
                  <h3 className="font-jakarta text-[clamp(2.4rem,4.4vw,66px)] font-medium text-[#090909] leading-[1.08] tracking-[-0.035em] m-0 text-left">
                    {pillar.title}
                  </h3>
                  <p className="font-jakarta text-[clamp(1.1rem,1.4vw,22px)] font-normal text-[#555555] leading-[1.5] tracking-[-0.015em] mt-2.5 sm:mt-3.5 m-0 text-left">
                    {pillar.subtext}
                  </p>
                </div>

                {/* 2. Black Blind Slat (Wipes down from divider line, revealing new dark dummy content) */}
                <div
                  ref={(el) => {
                    blindRefs.current[pIdx] = el;
                  }}
                  className="absolute inset-0 bg-[#090909] z-20 pointer-events-none select-none will-change-[clip-path]"
                  style={{
                    clipPath: 'inset(0 0 100% 0)',
                  }}
                >
                  {/* Dark Content Block inside blind */}
                  <div className="absolute top-1/2 -translate-y-1/2 left-[6vw] sm:left-[8vw] lg:left-[10vw] max-w-[90vw] sm:max-w-[700px] lg:max-w-[950px] pointer-events-none select-none">
                    <h3 className="font-jakarta text-[clamp(2.4rem,4.4vw,66px)] font-medium text-[#f5f5f7] leading-[1.08] tracking-[-0.035em] m-0 text-left">
                      {DARK_ADVANTAGE_PILLARS[pIdx].title}
                    </h3>
                    <p className="font-jakarta text-[clamp(1.1rem,1.4vw,22px)] font-normal text-[#9a9a9f] leading-[1.5] tracking-[-0.015em] mt-2.5 sm:mt-3.5 m-0 text-left">
                      {DARK_ADVANTAGE_PILLARS[pIdx].subtext}
                    </p>
                  </div>

                  {/* Ultra-fine whisper-thin hairline white divider after transition */}
                  <div className="absolute inset-x-0 bottom-0 h-[1px] scale-y-[0.35] origin-bottom bg-white/[0.05] pointer-events-none" />
                  {pIdx === 0 && (
                    <div className="absolute inset-x-0 top-0 h-[1px] scale-y-[0.35] origin-top bg-white/[0.05] pointer-events-none" />
                  )}
                </div>

                {/* 3. Moving bottom slat edge line during the blinds transition */}
                <div
                  ref={(el) => {
                    blindEdgeRefs.current[pIdx] = el;
                  }}
                  className="absolute inset-x-0 h-[1px] scale-y-[0.35] bg-white/12 pointer-events-none select-none z-30 opacity-0 will-change-[top,opacity]"
                  style={{ top: '0%' }}
                />
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
