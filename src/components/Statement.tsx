'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';

const QUOTE_LINES = [
  ['“Scale,', 'transform,', 'and'],
  ['succeed', 'with', 'a', 'people-first'],
  ['mindset', 'and', 'creative', '+'],
  ['technology', 'power.”'],
];

const ALL_WORDS = QUOTE_LINES.flat();

// Non-sequential, scattered blur-out sequence across lines:
const RANDOM_DISSOLVE_SEQUENCE = [7, 2, 11, 4, 9, 1, 8, 5, 12, 3, 10, 0, 6];

// 4 images with same height but different widths, no text
const GALLERY_IMAGES = [
  {
    src: '/images/618189486392349653.jpeg',
    alt: 'Gallery showcase image 1',
    widthClass: 'w-[clamp(280px,32vw,440px)]',
  },
  {
    src: '/images/933511829023645883.jpeg',
    alt: 'Gallery showcase image 2',
    widthClass: 'w-[clamp(420px,48vw,680px)]', // Wide card
  },
  {
    src: '/images/1010565603896276505.jpeg',
    alt: 'Gallery showcase image 3',
    widthClass: 'w-[clamp(260px,28vw,390px)]', // Slim card
  },
  {
    src: '/images/698128379778759116.jpeg',
    alt: 'Gallery showcase image 4',
    widthClass: 'w-[clamp(360px,38vw,540px)]', // Medium-wide card
  },
];

export default function Statement() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const quoteWrapRef = useRef<HTMLDivElement>(null);
  const galleryWrapRef = useRef<HTMLDivElement>(null);
  const galleryTrackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const expandCardRef = useRef<HTMLDivElement>(null);

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
      if (galleryWrapRef.current) galleryWrapRef.current.style.opacity = '1';
      return;
    }

    let rafId: number;

    const updateScrollAnimation = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const viewportH = window.innerHeight;
      const viewportW = window.innerWidth;
      const totalScrollable = rect.height - viewportH;

      if (totalScrollable <= 0) return;

      // Progress: 0 when sticky locks, 1 when section completes
      const progress = Math.min(Math.max(-rect.top / totalScrollable, 0), 1);

      // ----------------------------------------------------
      // Phase 1: Text blur-out dissolution (progress 0.00 -> 0.18)
      // ----------------------------------------------------
      const totalWords = ALL_WORDS.length;
      const startBuffer = 0.02;
      const endDissolve = 0.17;
      const availableRange = endDissolve - startBuffer;
      const windowSize = 0.06;

      ALL_WORDS.forEach((_, index) => {
        const el = wordRefs.current[index];
        if (!el) return;

        const randomRank = RANDOM_DISSOLVE_SEQUENCE.indexOf(index);
        const orderRank = randomRank !== -1 ? randomRank : index;

        const wordStart = startBuffer + (orderRank / (totalWords - 1 || 1)) * (availableRange - windowSize);
        const wordEnd = wordStart + windowSize;

        const wordP = Math.min(Math.max((progress - wordStart) / (wordEnd - wordStart), 0), 1);

        const opacity = 1 - wordP;
        const blur = wordP * 16;
        const translateY = -wordP * 14;

        el.style.opacity = opacity.toFixed(3);
        el.style.filter = blur > 0.05 ? `blur(${blur.toFixed(1)}px)` : 'none';
        el.style.transform = `translate3d(0, ${translateY.toFixed(1)}px, 0)`;
      });

      // Quote container fade-out (completely gone by progress 0.18)
      if (quoteWrapRef.current) {
        const quoteOpacity = Math.max(1 - (progress - 0.14) / 0.04, 0);
        quoteWrapRef.current.style.opacity = quoteOpacity.toFixed(3);
        quoteWrapRef.current.style.pointerEvents = quoteOpacity > 0.1 ? 'auto' : 'none';
      }

      // ----------------------------------------------------
      // Phase 2: Horizontal scroll until Image 4 is DEAD-CENTER (progress 0.20 -> 0.60)
      // Phase 3: Image 4 scales in EVERY DIRECTION (up, down, left, right) to fit viewport (progress 0.60 -> 0.95)
      // ----------------------------------------------------
      if (galleryTrackRef.current) {
        const card4 = cardRefs.current[3];

        // Start strictly outside the right edge (+80px buffer)
        const startX = viewportW + 80;

        // Calculate exact horizontal translate to center Card 4 in the viewport
        let targetCenterX = -1200;
        if (card4) {
          const card4Left = card4.offsetLeft;
          const card4Width = card4.offsetWidth;
          const card4CenterInTrack = card4Left + card4Width / 2;
          targetCenterX = viewportW / 2 - card4CenterInTrack;
        }

        const totalTravel = startX - targetCenterX;

        if (progress <= 0.20) {
          // Off-screen right, zero opacity fade
          galleryTrackRef.current.style.transform = `translate3d(${startX}px, 0, 0)`;

          // Hide expanding overlay
          if (expandCardRef.current) {
            expandCardRef.current.style.display = 'none';
          }

          // Reset all cards in track
          cardRefs.current.forEach((card) => {
            if (card) {
              card.style.opacity = '1';
              card.style.borderRadius = '1rem';
              card.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            }
          });
        } else if (progress <= 0.60) {
          // Horizontal translation phase: moves until Card 4 is centered
          const pTravel = Math.min(Math.max((progress - 0.20) / (0.60 - 0.20), 0), 1);
          const currentTranslate = startX - pTravel * totalTravel;
          galleryTrackRef.current.style.transform = `translate3d(${currentTranslate.toFixed(1)}px, 0, 0)`;

          // Hide expanding overlay
          if (expandCardRef.current) {
            expandCardRef.current.style.display = 'none';
          }

          // Cards at regular appearance
          cardRefs.current.forEach((card) => {
            if (card) {
              card.style.opacity = '1';
              card.style.borderRadius = '1rem';
              card.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            }
          });
        } else {
          // Locked centered horizontally: Image 4 scales in every direction to fill viewport
          galleryTrackRef.current.style.transform = `translate3d(${targetCenterX.toFixed(1)}px, 0, 0)`;

          // Scale finishes at progress 0.86, holding 100% full screen before unpinning and scrolling up
          const pScale = Math.min(Math.max((progress - 0.58) / (0.86 - 0.58), 0), 1);

          // Sibling cards (0, 1, 2) fade out smoothly so Image 4 expands cleanly
          const siblingOpacity = Math.max(1 - pScale * 3.5, 0);
          for (let i = 0; i < 3; i++) {
            const sib = cardRefs.current[i];
            if (sib) sib.style.opacity = siblingOpacity.toFixed(3);
          }

          // Hide original card 4 in track so expanding centered clone takes over seamlessly
          if (card4) {
            card4.style.opacity = '0';
          }

          if (expandCardRef.current) {
            expandCardRef.current.style.display = 'block';

            const baseW = card4?.offsetWidth || 540;
            const baseH = card4?.offsetHeight || 500;

            // Omnidirectional expansion: expands equally top, bottom, left, right from center
            const currentW = baseW + pScale * (viewportW - baseW);
            const currentH = baseH + pScale * (viewportH - baseH);

            const borderRadius = (16 * (1 - pScale)).toFixed(1);
            const borderOpacity = Math.max(1 - pScale * 2, 0);

            expandCardRef.current.style.width = `${currentW.toFixed(1)}px`;
            expandCardRef.current.style.height = `${currentH.toFixed(1)}px`;
            expandCardRef.current.style.borderRadius = `${borderRadius}px`;
            expandCardRef.current.style.borderColor = `rgba(255, 255, 255, ${(0.1 * borderOpacity).toFixed(3)})`;
            expandCardRef.current.style.boxShadow = `0 25px 50px -12px rgba(0, 0, 0, ${(0.8 * borderOpacity).toFixed(3)})`;
          }
        }
      }
    };

    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateScrollAnimation);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    updateScrollAnimation();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  let wordCounter = 0;

  return (
    <div
      className="relative h-[680vh] bg-[#090909] m-0 p-0 border-none overflow-visible"
      ref={sectionRef}
      id="statement"
      role="region"
      aria-label="Company Statement & Visual Gallery"
    >
      <div className="sticky top-0 h-screen h-[100svh] w-full flex items-center justify-center bg-[#090909] z-10 overflow-hidden">
        {/* Layer 1: Statement Quote */}
        <div
          ref={quoteWrapRef}
          className="absolute inset-0 flex items-center justify-center transition-opacity duration-150"
        >
          <div className="w-full max-w-[1500px] mx-auto px-6 sm:px-12 lg:px-16">
            <blockquote className="m-0 p-0 font-jakarta text-[clamp(2.5rem,7vw,100px)] font-semibold leading-[1.12] tracking-[-0.03em] text-white text-left">
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
                        className="inline-block mr-[0.28em] opacity-100 blur-none translate-y-0 will-change-[opacity,filter,transform] transition-[opacity,filter,transform] duration-75"
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

        {/* Layer 2: 4 Images Coming from Outside Right Edge */}
        <div
          ref={galleryWrapRef}
          className="absolute inset-0 flex items-center overflow-hidden pointer-events-auto"
        >
          <div
            ref={galleryTrackRef}
            className="flex items-center gap-12 sm:gap-16 lg:gap-20 will-change-transform"
            style={{ transform: 'translate3d(100vw, 0, 0)' }}
          >
            {GALLERY_IMAGES.map((img, idx) => (
              <div
                key={idx}
                ref={(el) => {
                  cardRefs.current[idx] = el;
                }}
                className={`shrink-0 ${img.widthClass} h-[65vh] max-h-[560px] min-h-[380px] relative rounded-2xl overflow-hidden border border-white/10 bg-[#141414] shadow-2xl shadow-black/80 will-change-[width,height,border-radius,opacity]`}
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  sizes={idx === 3 ? '100vw' : '(max-width: 768px) 80vw, 680px'}
                  priority={idx === 3}
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Layer 3: Expanding Overlay Card (Scales symmetrically in all directions from center to fit viewport) */}
        <div
          ref={expandCardRef}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 overflow-hidden rounded-2xl border border-white/10 bg-[#141414] shadow-2xl shadow-black/80 will-change-[width,height,border-radius,opacity] pointer-events-none"
          style={{ display: 'none' }}
        >
          <Image
            src={GALLERY_IMAGES[3].src}
            alt={GALLERY_IMAGES[3].alt}
            fill
            sizes="100vw"
            priority
            className="object-cover"
          />
        </div>
      </div>
    </div>
  );
}
