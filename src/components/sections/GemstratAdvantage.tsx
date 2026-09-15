'use client';

import React, { useEffect, useRef, useState } from 'react';
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
    src: '/images/bearded-man-dark-studio-portrait.jpg',
    alt: 'What a privilege it is to be exhausted by a challenge you chose for yourself',
    targetX: -38, // Floating top-left of "The"
    targetY: -30,
    widthClass: 'w-[145px] sm:w-[180px] lg:w-[225px]',
    aspectClass: 'aspect-[3/4]',
    stagger: 0.0,
  },
  {
    id: 'top-right',
    src: '/images/athlete-sprint-motion-blur.jpg',
    alt: 'Run at your own pace motion poster',
    targetX: 28, // Floating top-right of "Advantage"
    targetY: -30,
    widthClass: 'w-[145px] sm:w-[175px] lg:w-[215px]',
    aspectClass: 'aspect-[4/5]',
    stagger: 0.06,
  },
  {
    id: 'bottom-left',
    src: '/images/cyberpunk-visor-silhouette.jpg',
    alt: 'Noise off Focus on eyewear portrait',
    targetX: -36, // Floating bottom-left under "The"
    targetY: 28,
    widthClass: 'w-[135px] sm:w-[165px] lg:w-[205px]',
    aspectClass: 'aspect-[4/5]',
    stagger: 0.03,
  },
  {
    id: 'bottom-center',
    src: '/images/man-writing-desk-dark-office.jpg',
    alt: 'The next batch will arrive desk visual',
    targetX: 4, // Floating below center
    targetY: 33,
    widthClass: 'w-[135px] sm:w-[165px] lg:w-[200px]',
    aspectClass: 'aspect-[4/5]',
    stagger: 0.10,
  },
  {
    id: 'bottom-right',
    src: '/images/crosswalk-motion-blur-evening.jpg',
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

interface PillarItem {
  id: string;
  title: string;
  subtext: string;
  image: string;
  widthClass: string;
  aspectClass: string;
  rotation: string;
}

// 8 advantage boxes: 2 in one row, 4 rows total
// Each has unique image, custom dimensions (different sizes), sharp corners, and custom tilt angle
const ADVANTAGE_PILLARS: PillarItem[] = [
  {
    id: 'pillar-1',
    title: 'Client-Centric, Always',
    subtext: 'We listen deeply and co-create solutions.',
    image: '/images/hands-pinning-notes-wall.jpg',
    widthClass: 'w-[175px] sm:w-[205px]',
    aspectClass: 'aspect-[3/4]',
    rotation: '-4.5deg',
  },
  {
    id: 'pillar-2',
    title: 'Industry Fluency',
    subtext: 'We listen deeply and co-create solutions.',
    image: '/images/geometric-building-architecture-bw.jpg',
    widthClass: 'w-[230px] sm:w-[270px]',
    aspectClass: 'aspect-[16/10]',
    rotation: '3.5deg',
  },
  {
    id: 'pillar-3',
    title: 'Global Reach, Local Pulse',
    subtext: 'We listen deeply and co-create solutions.',
    image: '/images/glowing-skyscrapers-night.jpg',
    widthClass: 'w-[185px] sm:w-[220px]',
    aspectClass: 'aspect-square',
    rotation: '-6deg',
  },
  {
    id: 'pillar-4',
    title: 'Creative Meets Commercial',
    subtext: 'We listen deeply and co-create solutions.',
    image: '/images/glitch-portrait-dissolve-2.jpg',
    widthClass: 'w-[180px] sm:w-[215px]',
    aspectClass: 'aspect-[4/5]',
    rotation: '5.5deg',
  },
  {
    id: 'pillar-5',
    title: 'Bespoke Strategy, Zero Template',
    subtext: 'Tailored roadmaps engineered specifically for your market edge.',
    image: '/images/aerial-city-dark-rooftop.jpg',
    widthClass: 'w-[245px] sm:w-[290px]',
    aspectClass: 'aspect-[16/11]',
    rotation: '-3deg',
  },
  {
    id: 'pillar-6',
    title: 'High-Velocity Execution',
    subtext: 'Turning strategic clarity into deployed assets in record time.',
    image: '/images/sled-push-gym-motion-blur.jpg',
    widthClass: 'w-[160px] sm:w-[195px]',
    aspectClass: 'aspect-[9/14]',
    rotation: '7deg',
  },
  {
    id: 'pillar-7',
    title: 'Engineering & Design Synergy',
    subtext: 'Where technical rigor empowers world-class brand experiences.',
    image: '/images/futuristic-ai-vr-glasses.jpg',
    widthClass: 'w-[195px] sm:w-[235px]',
    aspectClass: 'aspect-[4/5]',
    rotation: '-5deg',
  },
  {
    id: 'pillar-8',
    title: 'Measurable Commercial Impact',
    subtext: 'Every deliverable calibrated directly against your growth metrics.',
    image: '/images/executive-crossed-arms-blue-hour.jpg',
    widthClass: 'w-[225px] sm:w-[265px]',
    aspectClass: 'aspect-[16/10]',
    rotation: '4.5deg',
  },
];

export default function GemstratAdvantage() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const mainTrackRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);

  const [hoveredPillar, setHoveredPillar] = useState<PillarItem | null>(null);
  const [cursorPos, setCursorPos] = useState({ x: -1000, y: -1000 });

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
      if (mainTrackRef.current) {
        mainTrackRef.current.style.transform = 'translate3d(0, 0, 0)';
      }
      return;
    }

    let rafId: number;

    const updateAnimation = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const viewportH = window.innerHeight;
      const viewportW = window.innerWidth;
      const totalDist = rect.height - viewportH;

      if (totalDist <= 0) return;

      const scrolled = -rect.top;
      const progress = Math.min(Math.max(scrolled / totalDist, 0), 1);

      // ==========================================================
      // Phase 1: Random Word-by-Word Blur-Up In (progress 0.02 -> 0.16)
      // ==========================================================
      const totalWords = ALL_WORDS.length;
      const startWord = 0.02;
      const endWord = 0.16;
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
      // Phase 2: Images Emerge One by One on Scrolling (progress 0.16 -> 0.44)
      // Each image launches sequentially with distinct start and arrival points
      // ==========================================================
      const imgPhaseStart = 0.16;
      const stepDuration = 0.052; // duration of individual image journey
      const stepInterval = 0.042; // interval between successive launches

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
      // Phase 3: Screen 1 slides left while Screen 2 (8 boxes) slides in!
      // (progress 0.48 -> 0.72)
      // ==========================================================
      const slideStart = 0.48;
      const slideEnd = 0.72;

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
      id="advantage"
      className="relative w-full h-[320vh] bg-white text-[#090909] z-40 overflow-visible"
    >
      <div
        ref={stickyRef}
        className="sticky top-0 h-screen h-[100svh] w-full flex items-center overflow-hidden bg-white box-border"
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
            
            {/* Editorial Headline */}
            <div className="relative z-10 text-center pointer-events-none select-none max-w-[1440px] mx-auto">
              <h2 className="font-archivo-expanded text-[clamp(3.2rem,8.5vw,118px)] font-medium text-[#090909] leading-[0.98] tracking-[-0.035em] m-0">
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
                  className={`absolute ${item.widthClass} ${item.aspectClass} overflow-hidden shadow-2xl bg-[#eaeaea] border border-black/5 will-change-[transform,opacity] pointer-events-none select-none`}
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
          {/* Screen 2: 8 Advantage Boxes (2 in one row, 4 rows total)  */}
          {/* ========================================================= */}
          <div
            onMouseMove={(e) => setCursorPos({ x: e.clientX, y: e.clientY })}
            onMouseLeave={() => setHoveredPillar(null)}
            className="w-screen h-full shrink-0 grid grid-cols-2 grid-rows-4 pointer-events-auto select-none bg-white relative"
          >
            {ADVANTAGE_PILLARS.map((pillar, pIdx) => {
              const isLeftCol = pIdx % 2 === 0;
              const isTopRow = pIdx < 2;
              const isHovered = hoveredPillar?.id === pillar.id;

              return (
                <div
                  key={pillar.id}
                  onMouseEnter={() => setHoveredPillar(pillar)}
                  className={`relative flex flex-col justify-center px-6 sm:px-10 lg:px-14 xl:px-16 border-b border-black/[0.12] ${
                    isTopRow ? 'border-t border-black/[0.12]' : ''
                  } ${isLeftCol ? 'border-r border-black/[0.12]' : ''} overflow-hidden cursor-pointer transition-colors duration-250 ${
                    isHovered ? 'bg-[#090909]' : 'bg-white'
                  }`}
                >
                  <h3
                    className={`font-archivo-expanded text-[clamp(1.3rem,2.1vw,34px)] font-medium leading-[1.12] tracking-[-0.03em] m-0 text-left transition-colors duration-250 ${
                      isHovered ? 'text-white' : 'text-[#090909]'
                    }`}
                  >
                    {pillar.title}
                  </h3>
                  <p
                    className={`font-archivo text-[clamp(0.88rem,1.05vw,16px)] font-normal leading-[1.45] tracking-[-0.015em] mt-2 sm:mt-2.5 m-0 text-left transition-colors duration-250 ${
                      isHovered ? 'text-zinc-400' : 'text-[#555555]'
                    }`}
                  >
                    {pillar.subtext}
                  </p>
                </div>
              );
            })}
          </div>

        </div>

        {/* Floating Cursor Image Badge (Tracks mouse with distinct angles, sizes, and sharp corners) */}
        <div
          className="fixed pointer-events-none z-50 will-change-transform rounded-none"
          style={{
            left: cursorPos.x,
            top: cursorPos.y,
            transform: hoveredPillar
              ? `translate(-50%, -50%) scale(1) rotate(${hoveredPillar.rotation})`
              : 'translate(-50%, -50%) scale(0.6) rotate(0deg)',
            opacity: hoveredPillar ? 1 : 0,
            transition: 'transform 0.18s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease',
          }}
        >
          <div
            className={`relative ${hoveredPillar?.widthClass || 'w-[200px] sm:w-[240px]'} ${
              hoveredPillar?.aspectClass || 'aspect-[16/11]'
            } rounded-none overflow-hidden shadow-[0_30px_70px_rgba(0,0,0,0.92)] border border-white/35 bg-black`}
          >
            {hoveredPillar && (
              <Image
                src={hoveredPillar.image}
                alt={hoveredPillar.title}
                fill
                sizes="300px"
                className="object-cover object-center rounded-none"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent pointer-events-none" />
            <span className="absolute bottom-2.5 left-3 right-3 text-[10px] font-mono tracking-wider text-white/90 uppercase truncate drop-shadow-md">
              {hoveredPillar?.title}
            </span>
          </div>
        </div>

      </div>
    </section>
  );
}
