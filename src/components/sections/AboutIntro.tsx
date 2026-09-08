'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import ImageTrail from '@/components/ui/ImageTrail';

const TRAIL_IMAGES = [
  '/images/1010565603896276505.jpeg',
  '/images/246572148347325364.jpeg',
  '/images/618189486392349653.jpeg',
  '/images/698128379778759116.jpeg',
  '/images/844284261438464223.jpeg',
  '/images/933511829023645883.jpeg',
  '/images/984599537320872120.jpeg',
  '/images/@maxross_design.jpeg',
  '/images/Dynamic Typography Poster Inspired by Motion and Deadlines.jpeg',
  '/images/Graphic Designer Job Opening at 134 Agency _ Creative Careers.jpeg',
  '/images/Creative_people_need_creative_people.jpeg_202609071623.jpeg',
  '/images/Dream Big, Act Bigger — Motion Running Phone Wallpaper.jpeg',
];

const FOCUS_ITEMS = [
  {
    quote: '“ Align goals, operations, and systems for future-ready growth,”',
    titleLines: ['Enterprise', 'Architecture &', 'Mapping'],
    image: '/images/Pin by Stryke Wears on Sizin Pinleriniz in 2026 _ Fitness branding, Fitness.jpeg',
    alt: 'Enterprise Architecture & Mapping',
  },
  {
    quote: '“ Integrate intelligence, streamline outcomes across the business.”',
    titleLines: ['AI &', 'Automation'],
    image: '/images/Labs for Inflammation & Stress _ Hims.jpeg',
    alt: 'AI & Automation',
  },
  {
    quote: '“ Craft distinctive brand systems that evolve with your business.”',
    titleLines: ['360°', 'Branding'],
    image: '/images/Graphic Designer Job Opening at 134 Agency _ Creative Careers.jpeg',
    alt: '360° Branding',
  },
  {
    quote: '“ Websites, apps and digital-first marketing designed to deliver results.”',
    titleLines: ['Neo Marketing &', 'Digital'],
    image: '/images/Dynamic Typography Poster Inspired by Motion and Deadlines.jpeg',
    alt: 'Neo Marketing & Digital',
  },
  {
    quote: '“ Build identities and campaigns that move markets.”',
    titleLines: ['Advertising'],
    image: '/images/Creative_people_need_creative_people.jpeg_202609071623.jpeg',
    alt: 'Advertising',
  },
];

const CLARITY_HEADLINE_LINES = [
  ['Clarity,'],
  ['execution,'],
  ['momentum'],
];

const CLARITY_BODY = "Businesses come to Gemstrat when they're ready to move past complexity, stagnation, or uncertainty. We specialize in turning challenges into momentum.";

const CLARITY_BODY_WORDS = CLARITY_BODY.split(' ');

const CLARITY_ALL_WORDS = [
  ...CLARITY_HEADLINE_LINES.flat(),
  ...CLARITY_BODY_WORDS,
];

// 24 pseudo-random unique ranks to interleave headline and body blur-out timings
const CLARITY_RANDOM_ORDER = [
  8, 18, 1, 13, 5, 21, 0, 15, 9, 23, 3, 11, 2, 17, 7, 20, 4, 14, 10, 22, 6, 12, 16, 19,
];

const HORIZONTAL_CARDS = [
  {
    number: '1.',
    titleLine1: 'Clarity in',
    titleLine2: 'complexity',
    image: '/images/618189486392349653.jpeg',
    alt: 'Clarity in complexity',
    description: 'We decode tangled operations and markets into clear roadmaps.',
  },
  {
    number: '2.',
    titleLine1: 'Scalable',
    titleLine2: 'execution',
    image: '/images/Dream Big, Act Bigger — Motion Running Phone Wallpaper.jpeg',
    alt: 'Scalable execution',
    description: 'Every framework we build is tied to practical action.',
  },
  {
    number: '3.',
    titleLine1: 'Momentum',
    titleLine2: 'at every stage',
    image: '/images/Instagram.jpeg',
    alt: 'Momentum at every stage',
    description: 'Early-stage founder or multinational — we deliver solutions that create traction.',
  },
];

export default function AboutIntro() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const introWrapRef = useRef<HTMLDivElement>(null);
  const textTrackRef = useRef<HTMLDivElement>(null);

  const rightItemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const leftQuoteRefs = useRef<(HTMLDivElement | null)[]>([]);
  const focusWordRefs = useRef<(HTMLSpanElement | null)[][]>([]);

  const themeCircleRef = useRef<HTMLDivElement>(null);
  const nextSectionRef = useRef<HTMLElement>(null);

  const clarityTrackRef = useRef<HTMLDivElement>(null);
  const clarityTextWrapRef = useRef<HTMLDivElement>(null);
  const clarityWordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const horizontalTrackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      focusWordRefs.current.forEach((words) => {
        words?.forEach((w) => {
          if (w) {
            w.style.opacity = '1';
            w.style.filter = 'none';
            w.style.transform = 'none';
          }
        });
      });
      clarityWordRefs.current.forEach((w) => {
        if (w) {
          w.style.opacity = '1';
          w.style.filter = 'none';
          w.style.transform = 'none';
        }
      });
      if (horizontalTrackRef.current) {
        horizontalTrackRef.current.style.opacity = '1';
        horizontalTrackRef.current.style.transform = 'none';
      }
      return;
    }

    let rafId: number;

    const updateScroll = () => {
      const viewportH = window.innerHeight;
      const viewportW = window.innerWidth;

      // ----------------------------------------------------
      // 1. Pinned About Intro fade-out & Focus Areas scroll
      // ----------------------------------------------------
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        const totalScrollable = rect.height - viewportH;

        if (totalScrollable > 0) {
          const progress = Math.min(Math.max(-rect.top / totalScrollable, 0), 1);

          // Intro content fades out completely (progress 0.00 -> 0.20)
          if (introWrapRef.current) {
            const introOpacity = Math.max(1 - progress / 0.18, 0);
            const translateY = -progress * 40;
            introWrapRef.current.style.opacity = introOpacity.toFixed(3);
            introWrapRef.current.style.transform = `translate3d(0, ${translateY.toFixed(1)}px, 0)`;
            introWrapRef.current.style.pointerEvents = introOpacity > 0.1 ? 'auto' : 'none';
          }

          // Horizontal scroll for 350px "Focus areas"
          if (textTrackRef.current) {
            const trackW = textTrackRef.current.scrollWidth;
            const startX = viewportW + 60;
            const rightMargin = Math.max(viewportW * 0.05, 48);
            const endX = viewportW - trackW - rightMargin;
            const totalDistance = startX - endX;

            if (progress <= 0.20) {
              textTrackRef.current.style.transform = `translate3d(${startX}px, 0, 0)`;
            } else {
              const pText = Math.min(Math.max((progress - 0.20) / (0.75 - 0.20), 0), 1);
              const currentTranslate = startX - pText * totalDistance;
              textTrackRef.current.style.transform = `translate3d(${currentTranslate.toFixed(1)}px, 0, 0)`;
            }
          }
        }
      }

      // ----------------------------------------------------
      // 2. Dynamic In-Place Word-by-Word Blur-In for Left Quotes
      // ----------------------------------------------------
      rightItemRefs.current.forEach((itemEl, idx) => {
        if (!itemEl) return;
        const rect = itemEl.getBoundingClientRect();
        const quoteEl = leftQuoteRefs.current[idx];
        const words = focusWordRefs.current[idx] || [];
        const totalWords = words.length;

        const isLast = idx === FOCUS_ITEMS.length - 1;

        // Enter window: as the corresponding right content scrolls into view
        const enterStart = viewportH * 0.88;
        const enterEnd = viewportH * 0.38;

        // Exit window: as the right content finishes and scrolls above
        const exitStart = isLast ? 99999 : -rect.height * 0.12;
        const exitEnd = -rect.height * 0.65;

        if (rect.top > enterStart) {
          // Below eye-level: fully hidden
          if (quoteEl) {
            quoteEl.style.opacity = '0';
            quoteEl.style.pointerEvents = 'none';
          }
          words.forEach((span) => {
            if (span) {
              span.style.opacity = '0';
              span.style.filter = 'blur(14px)';
              span.style.transform = 'translate3d(0, 10px, 0)';
            }
          });
        } else if (rect.top <= enterStart && rect.top > enterEnd) {
          // Entering phase: Left text blurs in word-by-word right there in place!
          if (quoteEl) {
            quoteEl.style.opacity = '1';
            quoteEl.style.filter = 'none';
            quoteEl.style.transform = 'none';
            quoteEl.style.pointerEvents = 'auto';
          }
          const pEnter = Math.min(Math.max((enterStart - rect.top) / (enterStart - enterEnd), 0), 1);

          words.forEach((span, wIdx) => {
            if (!span) return;
            const wStart = (wIdx / (totalWords || 1)) * 0.72;
            const wEnd = Math.min(wStart + 0.28, 1);
            const wProgress = Math.min(Math.max((pEnter - wStart) / (wEnd - wStart), 0), 1);

            const opacity = wProgress;
            const blur = (1 - wProgress) * 14;
            const translateY = (1 - wProgress) * 10;

            span.style.opacity = opacity.toFixed(3);
            span.style.filter = blur > 0.05 ? `blur(${blur.toFixed(1)}px)` : 'none';
            span.style.transform = `translate3d(0, ${translateY.toFixed(1)}px, 0)`;
          });
        } else if (idx === FOCUS_ITEMS.length - 1) {
          // For the LAST item (Item 5), once entered, it NEVER exits or blurs out!
          // It stays 100% visible and sharp while pinned centered and while circle appears/expands above it!
          if (quoteEl) {
            quoteEl.style.opacity = '1';
            quoteEl.style.filter = 'none';
            quoteEl.style.transform = 'none';
            quoteEl.style.pointerEvents = 'auto';
          }
          words.forEach((span) => {
            if (span) {
              span.style.opacity = '1';
              span.style.filter = 'none';
              span.style.transform = 'none';
            }
          });
        } else if (rect.top <= enterEnd && rect.top > exitStart) {
          // Fully active phase: 100% visible and crisp
          if (quoteEl) {
            quoteEl.style.opacity = '1';
            quoteEl.style.filter = 'none';
            quoteEl.style.transform = 'none';
            quoteEl.style.pointerEvents = 'auto';
          }
          words.forEach((span) => {
            if (span) {
              span.style.opacity = '1';
              span.style.filter = 'none';
              span.style.transform = 'none';
            }
          });
        } else if (rect.top <= exitStart && rect.top > exitEnd) {
          // Exiting phase: Blurs out upwards in place as next item arrives
          const pExit = Math.min(Math.max((exitStart - rect.top) / (exitStart - exitEnd), 0), 1);
          const opacity = 1 - pExit;
          const blur = pExit * 14;
          const translateY = -pExit * 10;

          if (quoteEl) {
            quoteEl.style.opacity = opacity.toFixed(3);
            quoteEl.style.filter = blur > 0.05 ? `blur(${blur.toFixed(1)}px)` : 'none';
            quoteEl.style.transform = `translate3d(0, ${translateY.toFixed(1)}px, 0)`;
            quoteEl.style.pointerEvents = opacity > 0.1 ? 'auto' : 'none';
          }
        } else {
          // Above eye-level: fully hidden
          if (quoteEl) {
            quoteEl.style.opacity = '0';
            quoteEl.style.pointerEvents = 'none';
          }
        }
      });

      // ----------------------------------------------------
      // 3. Theme Transition Over Item 5 ("Advertising"):
      // True rounded-full circle, razor-sharp high-res 2600px base, zero glow.
      // The instant the circle fills the viewport, the next section fades in immediately!
      // ----------------------------------------------------
      const lastItemEl = rightItemRefs.current[FOCUS_ITEMS.length - 1];
      if (lastItemEl && themeCircleRef.current) {
        const rect = lastItemEl.getBoundingClientRect();
        const totalScrollable = rect.height - viewportH;

        if (totalScrollable > 0) {
          // Radius from viewport center to furthest corner (with 6% buffer to guarantee full bleed)
          const distToCorner = Math.hypot(viewportW / 2, viewportH / 2);
          const baseSize = 2600; // 2600px base circle diameter: renders at ultra-crisp Retina quality without stretching
          const targetScale = (distToCorner * 2 * 1.06) / baseSize;

          if (rect.top > 0) {
            // Still scrolling towards center: circle remains dormant
            themeCircleRef.current.style.opacity = '0';
            themeCircleRef.current.style.transform = 'translate3d(-50%, -50%, 0) scale(0)';
            if (nextSectionRef.current) {
              nextSectionRef.current.style.opacity = '0';
              nextSectionRef.current.style.transform = 'translate3d(0, 0, 0)';
              nextSectionRef.current.style.pointerEvents = 'none';
            }
          } else if (rect.bottom <= viewportH) {
            // Scrolled past the pin track: Sequence 3 scrolls up in exact 1:1 lockstep with Sequence 4!
            const exitOffset = Math.max(viewportH - rect.bottom, 0);

            if (exitOffset >= viewportH) {
              // Completely scrolled past Sequence 3 into Sequence 4:
              // Hide fixed overlay elements so Sequence 4 is 100% visible and interactive!
              themeCircleRef.current.style.opacity = '0';
              themeCircleRef.current.style.transform = 'translate3d(-50%, -50%, 0) scale(0)';
              if (nextSectionRef.current) {
                nextSectionRef.current.style.opacity = '0';
                nextSectionRef.current.style.transform = `translate3d(0, ${-exitOffset}px, 0)`;
                nextSectionRef.current.style.pointerEvents = 'none';
              }
            } else {
              // During the 1:1 scroll transition between Sequence 3 and Sequence 4:
              themeCircleRef.current.style.opacity = '1';
              themeCircleRef.current.style.transform = `translate3d(-50%, -50%, 0) scale(${targetScale.toFixed(5)})`;
              if (nextSectionRef.current) {
                nextSectionRef.current.style.opacity = '1';
                nextSectionRef.current.style.transform = `translate3d(0, ${-exitOffset}px, 0)`;
                nextSectionRef.current.style.pointerEvents = 'auto';
              }
            }
          } else {
            // Locked centered! Progress runs from 0 (centered) to 1 (end of track)
            const progress = Math.min(Math.max(-rect.top / totalScrollable, 0), 1);

            // Normalized circle progress u:
            // 0 to 0.04: Settles cleanly at center (matches user screenshot)
            // 0.04 to 0.60: Continuous, buttery smooth expansion to full screen pure white
            const startU = 0.04;
            const endU = 0.60;
            const u = Math.min(Math.max((progress - startU) / (endU - startU), 0), 1);

            if (u <= 0) {
              themeCircleRef.current.style.opacity = '0';
              themeCircleRef.current.style.transform = 'translate3d(-50%, -50%, 0) scale(0)';
              if (nextSectionRef.current) {
                nextSectionRef.current.style.opacity = '0';
                nextSectionRef.current.style.transform = 'translate3d(0, 0, 0)';
                nextSectionRef.current.style.pointerEvents = 'none';
              }
            } else {
              // Smooth S-curve opacity over initial 6% of motion
              const opT = Math.min(u / 0.06, 1);
              const opacity = (1 - Math.cos(opT * Math.PI)) / 2;

              // Pure continuous expansion from scale 0 to targetScale (~0.95 - 1.05)
              const scale = Math.pow(u, 2.05) * targetScale;

              themeCircleRef.current.style.opacity = opacity.toFixed(4);
              themeCircleRef.current.style.transform = `translate3d(-50%, -50%, 0) scale(${scale.toFixed(5)})`;

              // Once the circle fills the entire viewport, next section fades in immediately!
              // No scrolling needed after the transition!
              if (nextSectionRef.current) {
                nextSectionRef.current.style.transform = 'translate3d(0, 0, 0)';
                if (u >= 0.94) {
                  nextSectionRef.current.style.opacity = '1';
                  nextSectionRef.current.style.pointerEvents = 'auto';
                } else {
                  nextSectionRef.current.style.opacity = '0';
                  nextSectionRef.current.style.pointerEvents = 'none';
                }
              }
            }
          }
        }
      }

      // ----------------------------------------------------
      // 4. Clarity Section: Random Word-by-Word Blur-Out on scroll
      // ----------------------------------------------------
      if (clarityTrackRef.current) {
        const rect = clarityTrackRef.current.getBoundingClientRect();
        const totalScrollable = rect.height - viewportH;

        if (totalScrollable > 0) {
          // Progress: 0 when clarity section locks sticky at top (rect.top <= 0), 1 when track finishes
          const progress = Math.min(Math.max(-rect.top / totalScrollable, 0), 1);

          // Phase 1: Words blur out randomly between progress 0.02 and 0.18
          const totalWords = CLARITY_ALL_WORDS.length;
          const startBuffer = 0.02;
          const endBuffer = 0.18;
          const windowSize = 0.05;
          const activeRange = endBuffer - startBuffer - windowSize;

          clarityWordRefs.current.forEach((span, index) => {
            if (!span) return;
            const rank = CLARITY_RANDOM_ORDER[index] ?? index;
            const wordStart = startBuffer + (rank / (totalWords - 1 || 1)) * activeRange;
            const wordEnd = wordStart + windowSize;

            // Word progress: 0 (fully sharp & visible) -> 1 (fully blurred out)
            const wordP = Math.min(Math.max((progress - wordStart) / (wordEnd - wordStart), 0), 1);

            const opacity = 1 - wordP;
            const blur = wordP * 16;
            const translateY = -wordP * 10;

            span.style.opacity = opacity.toFixed(3);
            span.style.filter = blur > 0.05 ? `blur(${blur.toFixed(1)}px)` : 'none';
            span.style.transform = `translate3d(0, ${translateY.toFixed(1)}px, 0)`;
          });

          // Container for initial text fades out completely once words are gone
          if (clarityTextWrapRef.current) {
            if (progress >= 0.20) {
              clarityTextWrapRef.current.style.opacity = '0';
            } else {
              clarityTextWrapRef.current.style.opacity = '1';
            }
            clarityTextWrapRef.current.style.pointerEvents = 'none';
          }

          // Phase 2: Horizontal Scroll Track across 3 cards
          if (horizontalTrackRef.current) {
            const hStart = 0.19;
            const hEnd = 0.95;

            if (progress < hStart) {
              // Before words fade out: parked offscreen to the right
              horizontalTrackRef.current.style.opacity = '0';
              horizontalTrackRef.current.style.transform = `translate3d(${viewportW}px, 0, 0)`;
              horizontalTrackRef.current.style.pointerEvents = 'none';
            } else {
              const pHoriz = Math.min(Math.max((progress - hStart) / (hEnd - hStart), 0), 1);
              const opacity = Math.min(pHoriz / 0.04, 1);

              // Calculate translation across 3 cards with smooth dwell per card
              let targetXOffset = 1.0; // in units of viewportW
              if (pHoriz <= 0.16) {
                // Card 1 enters from right (1.0 -> 0.0)
                const t = pHoriz / 0.16;
                const ease = 1 - Math.pow(1 - t, 2.2);
                targetXOffset = 1.0 - ease * 1.0;
              } else if (pHoriz <= 0.28) {
                // Card 1 dwells centered
                targetXOffset = 0.0;
              } else if (pHoriz <= 0.48) {
                // Smooth transition: Card 1 -> Card 2 (0.0 -> -1.0)
                const t = (pHoriz - 0.28) / (0.48 - 0.28);
                const ease = t * t * (3 - 2 * t);
                targetXOffset = 0.0 - ease * 1.0;
              } else if (pHoriz <= 0.60) {
                // Card 2 dwells centered
                targetXOffset = -1.0;
              } else if (pHoriz <= 0.80) {
                // Smooth transition: Card 2 -> Card 3 (-1.0 -> -2.0)
                const t = (pHoriz - 0.60) / (0.80 - 0.60);
                const ease = t * t * (3 - 2 * t);
                targetXOffset = -1.0 - ease * 1.0;
              } else {
                // Card 3 dwells centered
                targetXOffset = -2.0;
              }

              const currentX = targetXOffset * viewportW;
              horizontalTrackRef.current.style.opacity = opacity.toFixed(3);
              horizontalTrackRef.current.style.transform = `translate3d(${currentX.toFixed(1)}px, 0, 0)`;
              horizontalTrackRef.current.style.pointerEvents = 'none';
            }
          }
        }
      }
    };

    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateScroll);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    updateScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  let clarityWordCounter = 0;

  return (
    <>
      {/* Sequence 1: Pinned Section with Intro fade-out and "Focus areas" horizontal scroll */}
      <div
        ref={sectionRef}
        id="about-intro"
        className="relative h-[260vh] bg-[#090909] m-0 p-0 border-none overflow-visible"
        aria-label="About Gemstrat & Focus Areas"
      >
        <div className="sticky top-0 h-screen h-[100svh] w-full flex items-center justify-center bg-[#090909] overflow-hidden">
          {/* Layer 1: Intro Content (Fades out completely on scroll) */}
          <div
            ref={introWrapRef}
            className="absolute inset-0 flex items-center justify-center will-change-[opacity,transform] transition-opacity duration-75"
          >
            <div className="w-full max-w-[1440px] mx-auto px-6 sm:px-12 lg:px-20 box-border">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 sm:gap-16 lg:gap-20 xl:gap-24 items-end">
                {/* Left Column: Visual Card aligned to bottom of text */}
                <div className="lg:col-span-5 w-full flex justify-center lg:justify-start items-end self-end">
                  <div className="relative w-full max-w-[500px] aspect-[16/10] rounded-2xl overflow-hidden border border-white/10 bg-[#141414] shadow-2xl shadow-black/80">
                    <Image
                      src="/images/Conteúdo _ motivacional _ social media.jpeg"
                      alt="Gemstrat strategic and architectural focus"
                      fill
                      sizes="(max-width: 1024px) 100vw, 500px"
                      className="object-cover"
                    />
                  </div>
                </div>

                {/* Right Column: Editorial Paragraphs */}
                <div className="lg:col-span-7 w-full flex flex-col justify-end self-end">
                  <div className="max-w-[760px] flex flex-col space-y-6 sm:space-y-8 font-jakarta text-white/90 text-[clamp(1.15rem,1.7vw,26px)] leading-[1.55] tracking-[-0.015em] font-normal">
                    <p className="indent-12 sm:indent-16 lg:indent-20 m-0 text-left">
                      Gemstrat is where sharp minds and bold ideas come together. We are a boutique
                      strategic consultancy built for ambitious businesses ready to scale, transform, and
                      succeed. With a footprint spanning the USA, Canada, India, the Middle East, and Africa, we
                      combine global perspective with local insight to solve complex challenges.
                    </p>
                    <p className="indent-12 sm:indent-16 lg:indent-20 m-0 text-left">
                      Our belief is simple: solutions should be practical, human, and built to last. We don't stop at
                      advice. We execute, ensuring strategy translates into measurable outcomes. From enterprise
                      architecture to AI integration, from branding to digital transformation, Gemstrat helps businesses
                      move forward with clarity and confidence.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Layer 2: 350px Horizontal Scrolling Text "Focus areas" */}
          <div className="absolute inset-0 flex items-center overflow-hidden pointer-events-none select-none">
            <div
              ref={textTrackRef}
              className="whitespace-nowrap font-jakarta text-[clamp(120px,22vw,350px)] font-medium tracking-[-0.04em] text-white leading-none will-change-transform"
              style={{ transform: 'translate3d(100vw, 0, 0)' }}
            >
              Focus areas
            </div>
          </div>
        </div>
      </div>

      {/* Sequence 2: 5 Focus Areas with In-Place Dynamic Left Text & Theme Transition Over Item 5 */}
      <div className="relative w-full bg-[#090909] text-white">
        <div className="w-full max-w-[1440px] mx-auto px-6 sm:px-12 lg:px-20 box-border">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 sm:gap-16 lg:gap-20 xl:gap-24 items-start relative">

            {/* Pinned Left Column: Stays fixed at eye level; content changes dynamically in place! */}
            <div className="lg:col-span-5 w-full hidden lg:block lg:sticky lg:top-[34vh] self-start z-20">
              <div className="relative w-full max-w-[440px] min-h-[160px]">
                {FOCUS_ITEMS.map((item, idx) => {
                  const words = item.quote.split(' ');
                  if (!focusWordRefs.current[idx]) {
                    focusWordRefs.current[idx] = [];
                  }

                  return (
                    <div
                      key={idx}
                      ref={(el) => {
                        leftQuoteRefs.current[idx] = el;
                      }}
                      className="absolute inset-0 flex flex-col justify-start will-change-[opacity,filter,transform] pointer-events-none"
                      style={{ opacity: idx === 0 ? 1 : 0 }}
                    >
                      <p className="font-jakarta text-white text-[clamp(1.15rem,1.7vw,24px)] leading-[1.5] tracking-[-0.015em] font-normal m-0 text-left">
                        {words.map((word, wIdx) => (
                          <span
                            key={wIdx}
                            ref={(el) => {
                              focusWordRefs.current[idx][wIdx] = el;
                            }}
                            className="inline-block mr-[0.28em] opacity-0 blur-[14px] translate-y-2 will-change-[opacity,filter,transform]"
                          >
                            {word}
                          </span>
                        ))}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: 5 items */}
            <div className="lg:col-span-7 w-full flex flex-col items-start space-y-36 sm:space-y-48 lg:space-y-64 pt-16 sm:pt-24 lg:pt-32 pb-0">
              {FOCUS_ITEMS.map((item, idx) => {
                const isLast = idx === FOCUS_ITEMS.length - 1;

                if (isLast) {
                  // Item 5 (Advertising): Pins sticky in the center, then white circle scales above it!
                  return (
                    <div
                      key={idx}
                      ref={(el) => {
                        rightItemRefs.current[idx] = el;
                      }}
                      className="relative h-[220vh] w-full"
                    >
                      <div className="sticky top-0 h-screen h-[100svh] w-full flex flex-col items-start justify-center">
                        {/* Mobile-only quote */}
                        <div className="block lg:hidden mb-8">
                          <p className="font-jakarta text-white/80 text-[clamp(1.1rem,4vw,18px)] leading-[1.5] tracking-[-0.015em] font-normal m-0 text-left">
                            {item.quote}
                          </p>
                        </div>

                        <h2 className="font-jakarta text-[clamp(2.8rem,6.8vw,96px)] font-medium text-white leading-[1.02] tracking-[-0.035em] m-0 mb-10 sm:mb-14 text-left">
                          {item.titleLines.map((line, lIdx) => (
                            <span key={lIdx} className="block whitespace-nowrap">
                              {line}
                            </span>
                          ))}
                        </h2>

                        <div className="relative w-full max-w-[580px] aspect-[16/10] rounded-2xl overflow-hidden border border-white/10 bg-[#141414] shadow-2xl shadow-black/80">
                          <Image
                            src={item.image}
                            alt={item.alt}
                            fill
                            sizes="(max-width: 1024px) 100vw, 580px"
                            className="object-cover"
                          />
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={idx}
                    ref={(el) => {
                      rightItemRefs.current[idx] = el;
                    }}
                    className="w-full flex flex-col items-start min-h-[70vh] lg:min-h-[85vh] justify-center scroll-mt-24"
                  >
                    {/* Mobile-only quote */}
                    <div className="block lg:hidden mb-8">
                      <p className="font-jakarta text-white/80 text-[clamp(1.1rem,4vw,18px)] leading-[1.5] tracking-[-0.015em] font-normal m-0 text-left">
                        {item.quote}
                      </p>
                    </div>

                    <h2 className="font-jakarta text-[clamp(2.8rem,6.8vw,96px)] font-medium text-white leading-[1.02] tracking-[-0.035em] m-0 mb-10 sm:mb-14 text-left">
                      {item.titleLines.map((line, lIdx) => (
                        <span key={lIdx} className="block whitespace-nowrap">
                          {line}
                        </span>
                      ))}
                    </h2>

                    <div className="relative w-full max-w-[580px] aspect-[16/10] rounded-2xl overflow-hidden border border-white/10 bg-[#141414] shadow-2xl shadow-black/80">
                      <Image
                        src={item.image}
                        alt={item.alt}
                        fill
                        sizes="(max-width: 1024px) 100vw, 580px"
                        className="object-cover"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      </div>

      {/* Sequence 4: Clarity, execution, momentum + Horizontal Scroll */}
      <section
        ref={clarityTrackRef}
        className="relative w-full h-[520vh] bg-white text-[#090909] z-50 -mt-[2px] overflow-visible"
      >
        <div className="sticky top-0 h-screen h-[100svh] w-full flex items-center justify-center px-6 sm:px-12 lg:px-20 box-border overflow-hidden">
          {/* Interactive GSAP Image Trail Layer */}
          <div className="absolute inset-0 z-10 pointer-events-auto overflow-hidden">
            <ImageTrail
              items={TRAIL_IMAGES}
              variant="2"
            />
          </div>

          {/* Layer 1: Initial "Clarity, execution, momentum" Text (Words blur out randomly on scroll) */}
          <div
            ref={clarityTextWrapRef}
            className="absolute inset-0 flex items-center justify-center z-20 px-6 sm:px-12 lg:px-20 pointer-events-none select-none transition-opacity duration-150"
          >
            <div className="w-full max-w-[1440px] mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-14 lg:gap-20 xl:gap-24 items-center">

                {/* Left Column: 3-line Heading */}
                <div className="lg:col-span-7">
                  <h2 className="font-jakarta text-[clamp(3.2rem,6.8vw,92px)] font-medium text-[#090909] leading-[1.03] tracking-[-0.038em] m-0 text-left">
                    {CLARITY_HEADLINE_LINES.map((line, lIdx) => (
                      <span key={lIdx} className="block">
                        {line.map((word) => {
                          const idx = clarityWordCounter++;
                          return (
                            <span
                              key={idx}
                              ref={(el) => {
                                clarityWordRefs.current[idx] = el;
                              }}
                              className="inline-block will-change-[opacity,filter,transform]"
                            >
                              {word}
                            </span>
                          );
                        })}
                      </span>
                    ))}
                  </h2>
                </div>

                {/* Right Column: Editorial Paragraph */}
                <div className="lg:col-span-5 flex justify-start lg:justify-end">
                  <p className="font-jakarta text-[clamp(1.18rem,1.6vw,23px)] font-normal text-[#1a1a1a] leading-[1.56] tracking-[-0.015em] max-w-[520px] m-0 text-left">
                    {CLARITY_BODY_WORDS.map((word) => {
                      const idx = clarityWordCounter++;
                      return (
                        <span
                          key={idx}
                          ref={(el) => {
                            clarityWordRefs.current[idx] = el;
                          }}
                          className="inline-block mr-[0.28em] will-change-[opacity,filter,transform]"
                        >
                          {word}
                        </span>
                      );
                    })}
                  </p>
                </div>

              </div>
            </div>
          </div>

          {/* Layer 2: Horizontal Scroll Track (3 Cards) */}
          <div
            ref={horizontalTrackRef}
            className="absolute top-0 left-0 h-full flex flex-row flex-nowrap items-center z-30 will-change-[transform,opacity] pointer-events-none select-none"
            style={{ width: '300vw', transform: 'translate3d(100vw, 0, 0)', opacity: 0 }}
          >
            {HORIZONTAL_CARDS.map((card, idx) => (
              <div
                key={idx}
                className="w-screen h-full flex items-center justify-center shrink-0 px-6 sm:px-12 lg:px-20 box-border pointer-events-none"
              >
                <div className="flex flex-col lg:flex-row items-center lg:items-end justify-center gap-8 sm:gap-12 lg:gap-16 xl:gap-24 w-full max-w-[1440px] mx-auto px-6 sm:px-12 box-border pointer-events-none">

                  {/* Left Title */}
                  <div className="lg:self-center shrink-0 pointer-events-none w-full lg:w-[320px] xl:w-[380px]">
                    <h3 className="font-jakarta text-[clamp(2.8rem,5.2vw,72px)] font-medium text-[#090909] leading-[1.05] tracking-[-0.035em] m-0 text-left pointer-events-none">
                      {card.number}{card.titleLine1}<br />{card.titleLine2}
                    </h3>
                  </div>

                  {/* Center Image from public/images */}
                  <div className="relative w-[280px] sm:w-[340px] lg:w-[420px] aspect-[4/5] rounded-xl overflow-hidden shadow-2xl bg-[#eaeaea] shrink-0 border border-black/5 pointer-events-none">
                    <Image
                      src={card.image}
                      alt={card.alt}
                      fill
                      sizes="(max-width: 1024px) 340px, 420px"
                      className="object-cover pointer-events-none"
                    />
                  </div>

                  {/* Right Description: Aligned to bottom right */}
                  <div className="lg:self-end max-w-[280px] sm:max-w-[320px] lg:max-w-[340px] pb-2 sm:pb-4 shrink-0 pointer-events-none">
                    <p className="font-jakarta text-[clamp(1.05rem,1.35vw,19px)] font-normal text-[#1a1a1a] leading-[1.5] tracking-[-0.015em] m-0 text-left pointer-events-none">
                      {card.description}
                    </p>
                  </div>

                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Sequence 3: Enterprise Architecture & Mapping (Fades in immediately once circle fills viewport) */}
      <section
        ref={nextSectionRef}
        className="fixed inset-0 z-40 bg-white text-[#090909] overflow-hidden flex items-center transition-[opacity] duration-700 ease-out pointer-events-none will-change-[transform,opacity] h-[calc(100vh+4px)]"
        style={{ opacity: 0 }}
      >
        {/* Background Image: last.jpeg */}
        <div className="absolute inset-0 z-0 pointer-events-none select-none">
          <Image
            src="/images/last.jpeg"
            alt="Enterprise Architecture & Mapping"
            fill
            priority
            sizes="100vw"
            className="object-cover object-[78%_center] sm:object-[82%_center] lg:object-right"
          />
          {/* Subtle mobile readability gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/70 to-transparent sm:via-white/40 sm:to-transparent lg:hidden" />
        </div>

        {/* Editorial Text Content on Left */}
        <div className="relative z-10 w-full max-w-[1440px] mx-auto px-6 sm:px-12 lg:px-20 py-24 sm:py-32 lg:py-36 box-border">
          <div className="max-w-[580px] lg:max-w-[660px]">
            <h2 className="font-jakarta text-[clamp(2.8rem,5.4vw,76px)] font-medium text-[#090909] leading-[1.05] tracking-[-0.035em] m-0 mb-8 sm:mb-10 text-left">
              Enterprise architecture<br />& mapping
            </h2>
            <p className="font-jakarta text-[clamp(1.15rem,1.5vw,22px)] font-normal text-[#1a1a1a] leading-[1.58] tracking-[-0.015em] m-0 text-left">
              We help you structure your business to scale, aligning people, processes, and platforms — because big moves need solid foundations. It isn&#39;t a buzzword at Gemstrat, it&#39;s a core discipline; we break down complex operations into clear, visual structures that highlight friction points, streamline systems, and identify areas of growth.
            </p>
          </div>
        </div>
      </section>

      {/* White Circle Scaling Transition (True rounded-full circle, high-res 2600px base, zero glow) */}
      <div
        ref={themeCircleRef}
        className="fixed left-1/2 top-1/2 rounded-full bg-white will-change-transform pointer-events-none z-30"
        style={{
          width: '2600px',
          height: '2600px',
          transform: 'translate3d(-50%, -50%, 0) scale(0)',
          opacity: 0,
        }}
      />
    </>
  );
}
