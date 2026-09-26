'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import ImageTrail from '@/components/ui/ImageTrail';
import FragmentedImageGrid from '@/components/ui/FragmentedImageGrid';
import dynamic from 'next/dynamic';
import type { UnwovenCarouselControl } from '@/components/ui/UnwovenCarousel';
import { onScrollFrame } from '@/lib/scrollFrame';
import { setWordStyle } from '@/lib/wordStyle';
import { whenIdle } from '@/lib/whenIdle';

// WebGL carousel (three.js) loads on demand, off the critical path
const UnwovenCarousel = dynamic(() => import('@/components/ui/UnwovenCarousel'), { ssr: false });

const TRAIL_IMAGES = [
  '/images/motion/airport.webp',
  '/images/motion/container-ship.webp',
  '/images/motion/bridge-cables.webp',
  '/images/motion/atrium.webp',
  '/images/motion/train-platform.webp',
  '/images/motion/interchange.webp',
  '/images/motion/compass.webp',
  '/images/motion/reflection.webp',
  '/images/motion/escalators.webp',
  '/images/motion/wind-turbines.webp',
  '/images/motion/conference-hall.webp',
  '/images/motion/harbour.webp',
  '/images/motion/data-center.webp',
  '/images/motion/glass-wall-strategy.webp',
  '/images/motion/cyclist-bridge.webp',
  '/images/motion/night-city.webp',
];

const FOCUS_ITEMS = [
  {
    quote: '“ Align goals, operations, and systems for future-ready growth,”',
    titleLines: ['Enterprise', 'Architecture &', 'Mapping'],
    image: '/images/about/enterprise-architecture.webp',
    alt: 'Enterprise Architecture & Mapping',
  },
  {
    quote: '“ Integrate intelligence, streamline outcomes across the business.”',
    titleLines: ['AI &', 'Automation'],
    image: '/images/about/ai-automation.webp',
    alt: 'AI & Automation',
  },
  {
    quote: '“ Craft distinctive brand systems that evolve with your business.”',
    titleLines: ['360°', 'Branding'],
    image: '/images/about/branding.webp',
    alt: '360° Branding',
  },
  {
    quote: '“ Websites, apps and digital-first marketing designed to deliver results.”',
    titleLines: ['Neo Marketing &', 'Digital'],
    image: '/images/about/neo-marketing-digital.webp',
    alt: 'Neo Marketing & Digital',
  },
  {
    quote: '“ Build identities and campaigns that move markets.”',
    titleLines: ['Advertising'],
    image: '/images/about/advertising.webp',
    alt: 'Advertising',
  },
];

// Images for the scroll-driven unravelling carousel behind "Clarity, execution,
// momentum". Module-level so the array identity is stable across renders.
const CAROUSEL_IMAGES = [...TRAIL_IMAGES, '/images/about/clarity-lighthouse.webp'];

// Carousel motion: it always drifts at CAROUSEL_DRIFT px/s, and page scroll
// pushes it further by CAROUSEL_SCROLL_RATIO px per px scrolled.
const CAROUSEL_DRIFT = 60;
const CAROUSEL_SCROLL_RATIO = 1.1;

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
    image: '/images/about/clarity-maze.webp',
    alt: 'Clarity in complexity',
    description: 'We decode tangled operations and markets into clear roadmaps.',
  },
  {
    number: '2.',
    titleLine1: 'Scalable',
    titleLine2: 'execution',
    image: '/images/about/scalable-scaffolding.webp',
    alt: 'Scalable execution',
    description: 'Every framework we build is tied to practical action.',
  },
  {
    number: '3.',
    titleLine1: 'Momentum',
    titleLine2: 'at every stage',
    image: '/images/about/momentum-runner.webp',
    alt: 'Momentum at every stage',
    description: 'Early-stage founder or multinational — we deliver solutions that create traction.',
  },
];

export default function AboutIntro() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const introStickyRef = useRef<HTMLDivElement>(null);
  const introWrapRef = useRef<HTMLDivElement>(null);
  const textTrackRef = useRef<HTMLDivElement>(null);

  const rightItemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const leftQuoteRefs = useRef<(HTMLDivElement | null)[]>([]);
  // One slot per focus item, created up front (not during render)
  const focusWordRefs = useRef<(HTMLSpanElement | null)[][]>(FOCUS_ITEMS.map(() => []));

  const carouselWrapRef = useRef<HTMLDivElement>(null);
  const carouselControlRef = useRef<UnwovenCarouselControl>({
    offset: 0,
    drift: CAROUSEL_DRIFT,
    strength: 0,
    active: false,
  });

  const clarityTrackRef = useRef<HTMLDivElement>(null);
  // The image trail + WebGL carousel (and their ~1 MB of photos) are prepared in
  // the background when the page is idle after load, or when the Clarity
  // section gets within ~2 screens — never at load, never mid-scroll
  const [clarityNear, setClarityNear] = useState(false);
  useEffect(() => {
    const el = clarityTrackRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setClarityNear(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200% 0px' }
    );
    observer.observe(el);
    const cancelIdle = whenIdle(() => setClarityNear(true), 5000);
    return () => {
      observer.disconnect();
      cancelIdle();
    };
  }, []);
  const clarityStickyRef = useRef<HTMLDivElement>(null);
  const clarityTextWrapRef = useRef<HTMLDivElement>(null);
  const clarityHeadlineRef = useRef<HTMLHeadingElement>(null);
  const clarityParaRef = useRef<HTMLParagraphElement>(null);
  const clarityWordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const horizontalTrackRef = useRef<HTMLDivElement>(null);
  const cardDescWordRefs = useRef<(HTMLSpanElement | null)[][]>([]);

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
      if (carouselWrapRef.current) carouselWrapRef.current.style.opacity = '1';
      carouselControlRef.current = { offset: 0, drift: 0, strength: 1, active: true };
      if (horizontalTrackRef.current) {
        horizontalTrackRef.current.style.opacity = '1';
        horizontalTrackRef.current.style.transform = 'none';
      }
      cardDescWordRefs.current.forEach((words) => {
        words?.forEach((w) => {
          if (w) {
            w.style.opacity = '1';
            w.style.filter = 'none';
            w.style.transform = 'none';
          }
        });
      });
      if (introStickyRef.current) {
        introStickyRef.current.style.backgroundColor = '#090909';
      }
      if (clarityStickyRef.current) {
        clarityStickyRef.current.style.backgroundColor = '#ffffff';
      }
      return;
    }

    const updateScroll = () => {
      const viewportH = window.innerHeight;
      const viewportW = window.innerWidth;

      // -----------------------------------------------------------------------
      // PHASE 1: ALL DOM READS (one layout calculation, no style writes yet)
      // -----------------------------------------------------------------------
      const sectionRect = sectionRef.current?.getBoundingClientRect();
      const clarityRect = clarityTrackRef.current?.getBoundingClientRect();
      // Snapshot all focus-item rects in a single pass
      const itemRects = rightItemRefs.current.map(el => el?.getBoundingClientRect() ?? null);
      // Snapshot text block rects only if clarity section is relevant
      let headlineBottom = 0, paraTop = 0, stickyTop = 0, stickyHeight = 0;
      if (clarityRect && clarityStickyRef.current) {
        const stickyBox = clarityStickyRef.current.getBoundingClientRect();
        stickyTop = stickyBox.top;
        stickyHeight = stickyBox.height;
      }

      // -----------------------------------------------------------------------
      // PHASE 2: COMPUTE (pure math, no DOM access)
      // -----------------------------------------------------------------------

      // -----------------------------------------------------------------------
      // PHASE 3: ALL DOM WRITES (style mutations happen only here)
      // -----------------------------------------------------------------------

      // ----------------------------------------------------
      // 1. Pinned About Intro fade-out & Focus Areas scroll
      // ----------------------------------------------------
      if (sectionRect) {
        const rect = sectionRect;
        const totalScrollable = rect.height - viewportH;

        if (totalScrollable > 0) {
          const progress = Math.min(Math.max(-rect.top / totalScrollable, 0), 1);

          // Crossfade sticky background to pure white as "Who we are" fades out
          if (introStickyRef.current) {
            if (progress <= 0.20) {
              introStickyRef.current.style.backgroundColor = '#090909';
            } else if (progress >= 0.42) {
              introStickyRef.current.style.backgroundColor = '#ffffff';
            } else {
              const t = (progress - 0.20) / (0.42 - 0.20);
              const channel = Math.round(9 + t * (255 - 9));
              introStickyRef.current.style.backgroundColor = `rgb(${channel}, ${channel}, ${channel})`;
            }
          }

          // Intro content holds fully visible (progress 0.00 -> 0.15),
          // then fades out gradually (0.15 -> 0.40) — more scroll time to read it
          if (introWrapRef.current) {
            const introOpacity =
              progress <= 0.15 ? 1 : Math.max(1 - (progress - 0.15) / 0.25, 0);
            const translateY = -Math.max(progress - 0.15, 0) * 60;
            introWrapRef.current.style.opacity = introOpacity.toFixed(3);
            introWrapRef.current.style.transform = `translate3d(0, ${translateY.toFixed(1)}px, 0)`;
            introWrapRef.current.style.pointerEvents = introOpacity > 0.1 ? 'auto' : 'none';
          }

          // Horizontal scroll for 350px "Focus areas" (starts once intro has cleared)
          if (textTrackRef.current) {
            const trackW = textTrackRef.current.scrollWidth;
            const startX = viewportW + 60;
            const rightMargin = Math.max(viewportW * 0.05, 48);
            const endX = viewportW - trackW - rightMargin;
            const totalDistance = startX - endX;

            if (progress <= 0.38) {
              textTrackRef.current.style.transform = `translate3d(${startX}px, 0, 0)`;
            } else {
              const pText = Math.min(Math.max((progress - 0.38) / (0.90 - 0.38), 0), 1);
              const currentTranslate = startX - pText * totalDistance;
              textTrackRef.current.style.transform = `translate3d(${currentTranslate.toFixed(1)}px, 0, 0)`;
            }
          }
        }
      }

      // ----------------------------------------------------
      // 2. Dynamic In-Place Word-by-Word Blur-In for Left Quotes
      // Uses pre-snapshotted rects — no getBoundingClientRect here
      // ----------------------------------------------------
      rightItemRefs.current.forEach((itemEl, idx) => {
        if (!itemEl) return;
        const rect = itemRects[idx];
        if (!rect) return;
        const quoteEl = leftQuoteRefs.current[idx];
        const words = focusWordRefs.current[idx] || [];
        const totalWords = words.length;

        // Enter window: as the corresponding right content scrolls into view
        const enterStart = viewportH * 0.88;
        const enterEnd = viewportH * 0.38;

        // Exit window: as the right content finishes and scrolls above
        const exitStart = -rect.height * 0.12;
        const exitEnd = -rect.height * 0.65;

        if (rect.top > enterStart) {
          // Below eye-level: fully hidden
          if (quoteEl) {
            quoteEl.style.opacity = '0';
            quoteEl.style.pointerEvents = 'none';
          }
          words.forEach((span) => {
            if (span) {
              setWordStyle(span, 0, 14, 10);
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

            setWordStyle(span, opacity, blur, translateY);
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
              setWordStyle(span, 1, 0, 0);
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
      // 4. Clarity Section — ONE combined pinned track:
      //    Intro (0 -> INTRO_END):
      //    - 0 -> 0.16: Screen-wide pinned background smoothly dims from
      //      white (#ffffff) to black (#090909) with ZERO seam or horizontal cut!
      //    - 0.16 -> INTRO_END: scattered images fly in near-center and exit,
      //      one settles centered at a fixed size, then headline/paragraph fade in.
      //    Then (INTRO_END -> 1): word-blur-out + horizontal 3-card sequence.
      // ----------------------------------------------------
      if (clarityTrackRef.current && clarityRect) {
        const rect = clarityRect;
        const totalScrollable = rect.height - viewportH;

        if (totalScrollable > 0) {
          const progress = Math.min(Math.max(-rect.top / totalScrollable, 0), 1);
          const INTRO_END = 0.32;

          if (progress < INTRO_END) {
            const introP = progress / INTRO_END;

            // Seamless screen-wide crossfade from white (#ffffff) to black (#090909)
            // across the entire 100vw x 100vh pinned sticky canvas
            if (clarityStickyRef.current) {
              const fadeWindow = 0.16; // from introP 0.00 to 0.16
              if (introP <= 0) {
                clarityStickyRef.current.style.backgroundColor = '#ffffff';
              } else if (introP >= fadeWindow) {
                clarityStickyRef.current.style.backgroundColor = '#090909';
              } else {
                const ft = introP / fadeWindow;
                const ease = ft * ft * (3 - 2 * ft);
                const channel = Math.round(255 - ease * (255 - 9));
                clarityStickyRef.current.style.backgroundColor = `rgb(${channel}, ${channel}, ${channel})`;
              }
            }

            // Keep the text container itself visible; individual words below
            // control their own hidden -> fade-in state during the intro.
            if (clarityTextWrapRef.current) {
              clarityTextWrapRef.current.style.opacity = '1';
              clarityTextWrapRef.current.style.pointerEvents = 'none';
            }

            // Carousel fades in once the canvas has turned black; its edges unravel
            // as it appears, and it travels sideways with the page scroll.
            {
              const t = Math.min(Math.max((introP - 0.14) / (0.34 - 0.14), 0), 1);
              const ease = t * t * (3 - 2 * t);
              if (carouselWrapRef.current) {
                carouselWrapRef.current.style.opacity = ease.toFixed(3);
                carouselWrapRef.current.style.transform = `scale(${(0.96 + ease * 0.04).toFixed(4)})`;
              }
              const control = carouselControlRef.current;
              control.offset = Math.max(-rect.top, 0) * CAROUSEL_SCROLL_RATIO;
              control.strength = ease;
              control.active = ease > 0;
            }

            // While the carousel keeps moving: headline blurs up in the top-left,
            // then the paragraph blurs up in the bottom-right (word by word).
            {
              const headlineCount = CLARITY_HEADLINE_LINES.flat().length;
              const bodyCount = CLARITY_BODY_WORDS.length;
              const phases = [
                { from: 0, count: headlineCount, start: 0.42, end: 0.66 },
                { from: headlineCount, count: bodyCount, start: 0.62, end: 0.96 },
              ];

              phases.forEach(({ from, count, start, end }) => {
                const phaseP = Math.min(Math.max((introP - start) / (end - start), 0), 1);
                const windowSize = 0.45;
                for (let i = 0; i < count; i++) {
                  const span = clarityWordRefs.current[from + i];
                  if (!span) continue;
                  const wordStart = (i / Math.max(count - 1, 1)) * (1 - windowSize);
                  const wordP = Math.min(Math.max((phaseP - wordStart) / windowSize, 0), 1);
                  const blur = (1 - wordP) * 16;
                  setWordStyle(span, wordP, blur, ((1 - wordP) * 18));
                }
              });
            }
          } else {
            const oldP = Math.min(Math.max((progress - INTRO_END) / (1 - INTRO_END), 0), 1);

            // Carousel keeps travelling with the scroll while it fades out
            // alongside the words, before the horizontal cards arrive.
            {
              const t = Math.min(Math.max((oldP - 0.04) / (0.19 - 0.04), 0), 1);
              const vis = 1 - t * t * (3 - 2 * t);
              if (carouselWrapRef.current) {
                carouselWrapRef.current.style.opacity = vis.toFixed(3);
                carouselWrapRef.current.style.transform = 'scale(1)';
              }
              const control = carouselControlRef.current;
              control.offset = Math.max(-rect.top, 0) * CAROUSEL_SCROLL_RATIO;
              control.strength = 1;
              control.active = vis > 0;
            }

            // Background theme: stays black through the headline/paragraph and the
            // first two horizontal cards, then crosses to white exactly as Card 3
            // ("Momentum at every stage") arrives — matching hStart/hEnd/pHoriz
            // thresholds used by Phase 2 below (card 2->3 transition = pHoriz 0.60-0.80)
            const hStart = 0.19;
            const hEnd = 0.95;
            if (clarityStickyRef.current) {
              const colorStart = hStart + 0.6 * (hEnd - hStart);
              const colorEnd = hStart + 0.8 * (hEnd - hStart);
              const ct = Math.min(Math.max((oldP - colorStart) / (colorEnd - colorStart), 0), 1);
              const channel = Math.round(9 + ct * (255 - 9));
              clarityStickyRef.current.style.backgroundColor = `rgb(${channel}, ${channel}, ${channel})`;
            }

            // Phase 1: Words blur out randomly between oldP 0.02 and 0.18
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
              const wordP = Math.min(Math.max((oldP - wordStart) / (wordEnd - wordStart), 0), 1);

              const opacity = 1 - wordP;
              const blur = wordP * 16;
              const translateY = -wordP * 10;

              setWordStyle(span, opacity, blur, translateY);
            });

            // Container (headline + paragraph) fades out completely once words are gone
            if (clarityTextWrapRef.current) {
              clarityTextWrapRef.current.style.opacity = oldP >= 0.2 ? '0' : '1';
              clarityTextWrapRef.current.style.pointerEvents = 'none';
            }

            // Phase 2: Horizontal Scroll Track across 3 cards
            if (horizontalTrackRef.current) {
              if (oldP < hStart) {
                // Before words fade out: parked offscreen to the right
                horizontalTrackRef.current.style.opacity = '0';
                horizontalTrackRef.current.style.transform = `translate3d(${viewportW}px, 0, 0)`;
                horizontalTrackRef.current.style.pointerEvents = 'none';
                cardDescWordRefs.current.forEach((words) => {
                  words?.forEach((span) => {
                    if (span) {
                      setWordStyle(span, 0, 12, 14);
                    }
                  });
                });
              } else {
                const pHoriz = Math.min(Math.max((oldP - hStart) / (hEnd - hStart), 0), 1);
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

                // Blur-in-up animation for horizontal card descriptions
                const cardDwellRanges = [
                  { enterStart: 0.02, enterEnd: 0.16 }, // Card 1
                  { enterStart: 0.32, enterEnd: 0.46 }, // Card 2
                  { enterStart: 0.64, enterEnd: 0.78 }, // Card 3
                ];

                cardDwellRanges.forEach((range, cIdx) => {
                  const words = cardDescWordRefs.current[cIdx] || [];
                  const totalWords = words.length;
                  const pCard = Math.min(Math.max((pHoriz - range.enterStart) / (range.enterEnd - range.enterStart), 0), 1);

                  words.forEach((span, wIdx) => {
                    if (!span) return;
                    const wStart = (wIdx / (totalWords || 1)) * 0.65;
                    const wEnd = Math.min(wStart + 0.35, 1);
                    const wProgress = Math.min(Math.max((pCard - wStart) / (wEnd - wStart), 0), 1);

                    const op = wProgress;
                    const blur = (1 - wProgress) * 12;
                    const translateY = (1 - wProgress) * 14;

                    setWordStyle(span, op, blur, translateY);
                  });
                });
              }
            }
          }
        }
      }
    };

    // Same-frame updates from the shared scroll loop (no rAF lag)
    return onScrollFrame(updateScroll);
  }, []);

  // Fit the carousel into the band between the top-left headline and the
  // bottom-right paragraph so the cards never sit under either text block.
  useEffect(() => {
    const sticky = clarityStickyRef.current;
    const headline = clarityHeadlineRef.current;
    const para = clarityParaRef.current;
    const wrap = carouselWrapRef.current;
    if (!sticky || !headline || !para || !wrap) return;

    const GAP = 24;
    const layout = () => {
      const box = sticky.getBoundingClientRect();
      if (box.height === 0) return;
      let top = headline.getBoundingClientRect().bottom - box.top + GAP;
      let bottom = box.bottom - para.getBoundingClientRect().top + GAP;
      // Very short/narrow screens: keep a usable band, centred, even if it overlaps
      const minBand = box.height * 0.3;
      if (box.height - top - bottom < minBand) {
        top = (box.height - minBand) / 2;
        bottom = top;
      }
      wrap.style.top = `${Math.round(top)}px`;
      wrap.style.bottom = `${Math.round(bottom)}px`;
    };

    const observer = new ResizeObserver(layout);
    [sticky, headline, para].forEach((el) => observer.observe(el));
    layout();
    return () => observer.disconnect();
  }, []);

  let clarityWordCounter = 0;

  return (
    <>
      {/* Sequence 1: Pinned Section with Intro fade-out and "Focus areas" horizontal scroll */}
      <div
        ref={sectionRef}
        id="about-intro"
        className="relative h-[340vh] bg-[#090909] m-0 p-0 border-none overflow-visible"
        aria-label="About Gemstrat & Focus Areas"
      >
        <div
          ref={introStickyRef}
          className="sticky top-0 h-screen h-[100svh] w-full flex items-center justify-center bg-[#090909] overflow-hidden"
        >
          {/* Layer 1: Intro Content (Fades out completely on scroll) */}
          <div
            ref={introWrapRef}
            className="absolute inset-0 flex items-center justify-center will-change-[opacity,transform] transition-opacity duration-75"
          >
            <div className="w-full max-w-[1500px] mx-auto px-6 sm:px-12 lg:px-16 xl:px-20 box-border">
              <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-12 lg:gap-14 xl:gap-20">

                {/* Left: Editorial Statement */}
                <div className="lg:col-span-6 flex flex-col items-start justify-center text-left">
                  <div className="max-w-[580px] xl:max-w-[620px]">
                    <p className="font-archivo text-white/90 text-[clamp(1.65rem,2.6vw,38px)] leading-[1.32] tracking-[-0.02em] font-normal m-0">
                      A boutique strategic consultancy for ambitious businesses ready to scale and transform — we don&apos;t stop at advice, we execute.
                    </p>
                  </div>
                </div>

                {/* Right: Fragmented Image Grid (Sliced Image Layout) */}
                <div className="lg:col-span-6 flex items-center justify-center lg:justify-end w-full">
                  <FragmentedImageGrid
                    images={[
                      { src: '/images/about/boardroom.webp', alt: 'Gemstrat Strategic Advisory' },
                      { src: '/images/about/architect-drawing.webp', alt: 'Enterprise Architecture & Mapping' },
                      { src: '/images/about/tower-crane.webp', alt: 'Scalable Execution & Systems' },
                      { src: '/images/about/high-speed-train.webp', alt: 'Momentum at Scale' },
                      { src: '/images/about/strategy-notebook.webp', alt: 'Strategic Consultancy' },
                    ]}
                  />
                </div>

              </div>
            </div>
          </div>

          {/* Layer 2: 350px Horizontal Scrolling Text "Focus areas" */}
          <div className="absolute inset-0 flex items-center overflow-hidden pointer-events-none select-none">
            <div
              ref={textTrackRef}
              className="whitespace-nowrap font-archivo-expanded text-[clamp(120px,22vw,350px)] font-medium tracking-[-0.04em] text-[#090909] leading-none will-change-transform"
              style={{ transform: 'translate3d(100vw, 0, 0)' }}
            >
              Focus areas
            </div>
          </div>
        </div>
      </div>

      {/* Sequence 2: 5 Focus Areas with In-Place Dynamic Left Text */}
      <div id="focus-areas" className="relative w-full bg-white text-[#090909]">
        <div className="w-full max-w-[1440px] mx-auto px-6 sm:px-12 lg:px-20 box-border">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 sm:gap-16 lg:gap-20 xl:gap-24 items-start relative">

            {/* Pinned Left Column: Stays fixed at eye level; content changes dynamically in place! */}
            <div className="lg:col-span-5 min-w-0 w-full hidden lg:block lg:sticky lg:top-[34vh] self-start z-20">
              <div className="relative w-full max-w-[440px] min-h-[160px]">
                {FOCUS_ITEMS.map((item, idx) => {
                  const words = item.quote.split(' ');

                  return (
                    <div
                      key={idx}
                      ref={(el) => {
                        leftQuoteRefs.current[idx] = el;
                      }}
                      className="absolute inset-0 flex flex-col justify-start will-change-[opacity,filter,transform] pointer-events-none"
                      style={{ opacity: idx === 0 ? 1 : 0 }}
                    >
                      <p className="font-archivo text-[#090909] text-[clamp(1.15rem,1.7vw,24px)] leading-[1.5] tracking-[-0.015em] font-normal m-0 text-left">
                        {words.map((word, wIdx) => (
                          <span
                            key={wIdx}
                            ref={(el) => {
                              focusWordRefs.current[idx][wIdx] = el;
                            }}
                            className="inline-block mr-[0.28em] opacity-0 blur-[14px] translate-y-2"
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
            <div className="lg:col-span-7 min-w-0 w-full flex flex-col items-start space-y-36 sm:space-y-48 lg:space-y-64 pt-16 sm:pt-24 lg:pt-32 pb-24 sm:pb-32 lg:pb-36">
              {FOCUS_ITEMS.map((item, idx) => {
                return (
                  <div
                    key={idx}
                    id={idx === 4 ? 'focus-item-4' : undefined}
                    ref={(el) => {
                      rightItemRefs.current[idx] = el;
                    }}
                    className="w-full flex flex-col items-start min-h-[70vh] lg:min-h-[85vh] justify-center scroll-mt-24"
                  >
                    {/* Mobile-only quote */}
                    <div className="block lg:hidden mb-8">
                      <p className="font-archivo text-[#090909]/75 text-[clamp(1.1rem,4vw,18px)] leading-[1.5] tracking-[-0.015em] font-normal m-0 text-left">
                        {item.quote}
                      </p>
                    </div>

                    <h2 className="font-archivo-expanded text-[clamp(2.8rem,6.8vw,82px)] font-normal text-[#090909] leading-[1.02] tracking-[-0.035em] m-0 mb-10 sm:mb-14 text-left">
                      {item.titleLines.map((line, lIdx) => (
                        <span key={lIdx} className="block">
                          {line}
                        </span>
                      ))}
                    </h2>

                    <div className="relative w-full max-w-[580px] aspect-[16/10] overflow-hidden border border-black/10 bg-[#f4f4f4]">
                      <Image
                        src={item.image}
                        alt={item.alt}
                        fill
                        sizes="(max-width: 640px) 100vw, 580px"
                        className="object-cover grayscale"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      </div>

      {/* Sequence 3: Clarity, execution, momentum + Horizontal Scroll — opens
          with the scattered-image flythrough: images fly in and out, one
          settles centered, then the headline/paragraph fade in flanking it */}
      <section
        ref={clarityTrackRef}
        className="relative w-full h-[900vh] bg-white z-30 -mt-[2px] overflow-visible"
      >
        <div
          ref={clarityStickyRef}
          className="sticky top-0 h-screen h-[100svh] w-full flex items-center justify-center px-6 sm:px-12 lg:px-20 box-border overflow-hidden"
          style={{ backgroundColor: '#ffffff' }}
        >
          {/* Interactive GSAP Image Trail Layer */}
          <div className="absolute inset-0 z-10 pointer-events-auto overflow-hidden">
            {clarityNear && <ImageTrail items={TRAIL_IMAGES} variant="2" />}
          </div>

          {/* Scroll-driven unravelling carousel (fades in, travels with scroll) */}
          <div
            ref={carouselWrapRef}
            className="absolute inset-x-0 top-0 bottom-0 z-15 pointer-events-none opacity-0 will-change-[opacity,transform]"
          >
            {/* Fills the band between the headline and the paragraph (sized by the
                layout effect); sharp corners to match the rest of the imagery */}
            {clarityNear && (
              <UnwovenCarousel
                images={CAROUSEL_IMAGES}
                controlRef={carouselControlRef}
                config={{ cardHeightRatio: 0.92, cardMaxHeight: 400, cardRadius: 0 }}
              />
            )}
          </div>

          {/* Layer 1: "Clarity, execution, momentum" — headline top-left, paragraph
              bottom-right, over the carousel (words blur up, later blur out) */}
          <div
            ref={clarityTextWrapRef}
            className="absolute inset-0 z-20 pointer-events-none select-none transition-opacity duration-150"
          >
            <div className="w-full h-full max-w-[1600px] mx-auto px-6 sm:px-12 lg:px-20 py-[6vh] box-border flex flex-col justify-between">
              <div className="self-start">
              <h2 ref={clarityHeadlineRef} className="font-archivo-expanded text-[clamp(2.2rem,min(5.2vw,7vh),72px)] font-normal text-white leading-[1.04] tracking-[-0.03em] m-0 text-left">
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
                          className="inline-block"
                        >
                          {word}
                        </span>
                      );
                    })}
                  </span>
                ))}
              </h2>
              </div>
              <div className="self-end">
              <p ref={clarityParaRef} className="font-archivo text-[clamp(1.05rem,min(1.6vw,2.6vh),23px)] font-normal text-[#d4d4d8] leading-[1.56] tracking-[-0.015em] max-w-[460px] m-0 text-left">
                {CLARITY_BODY_WORDS.map((word) => {
                  const idx = clarityWordCounter++;
                  return (
                    <span
                      key={idx}
                      ref={(el) => {
                        clarityWordRefs.current[idx] = el;
                      }}
                      className="inline-block mr-[0.28em]"
                    >
                      {word}
                    </span>
                  );
                })}
              </p>
              </div>
            </div>
          </div>

          {/* Layer 2: Horizontal Scroll Track (3 Cards) */}
          <div
            ref={horizontalTrackRef}
            className="absolute top-0 left-0 h-full flex flex-row flex-nowrap items-center z-30 will-change-[transform,opacity] pointer-events-none select-none"
            style={{ width: '300vw', transform: 'translate3d(100vw, 0, 0)', opacity: 0 }}
          >
            {HORIZONTAL_CARDS.map((card, idx) => {
              // Cards 1 & 2 stay in the dark theme; Card 3 ("Momentum") arrives
              // once the section background has already crossed to white.
              const isDark = idx < 2;
              return (
                <div
                  key={idx}
                  className="w-screen h-full flex items-center justify-center shrink-0 px-6 sm:px-12 lg:px-20 box-border pointer-events-none"
                >
                  <div className="flex flex-col lg:flex-row items-center lg:items-end justify-center gap-8 sm:gap-12 lg:gap-16 xl:gap-24 w-full max-w-[1440px] mx-auto px-6 sm:px-12 box-border pointer-events-none">

                    {/* Left Title */}
                    <div className="lg:self-center shrink-0 pointer-events-none w-full lg:w-[320px] xl:w-[380px]">
                      <h3 className={`font-archivo-expanded text-[clamp(2.2rem,4vw,54px)] font-normal leading-[1.1] tracking-[-0.025em] m-0 text-left pointer-events-none ${isDark ? 'text-white' : 'text-[#090909]'}`}>
                        {card.number}{card.titleLine1}<br />{card.titleLine2}
                      </h3>
                    </div>

                    {/* Center Image from public/images */}
                    <div className={`relative w-[280px] sm:w-[340px] lg:w-[420px] aspect-[4/5] overflow-hidden shrink-0 pointer-events-none ${isDark ? 'bg-[#141414] border border-white/10' : 'bg-[#eaeaea] border border-black/5'}`}>
                      <Image
                        src={card.image}
                        alt={card.alt}
                        fill
                        sizes="(max-width: 1024px) 340px, 420px"
                        className="object-cover grayscale pointer-events-none"
                      />
                    </div>

                    {/* Right Description: Aligned to bottom right */}
                    <div className="lg:self-end max-w-[280px] sm:max-w-[320px] lg:max-w-[340px] pb-2 sm:pb-4 shrink-0 pointer-events-none">
                      <p className={`font-archivo text-[clamp(1.05rem,1.35vw,19px)] font-normal leading-[1.5] tracking-[-0.015em] m-0 text-left pointer-events-none ${isDark ? 'text-[#d4d4d8]' : 'text-[#1a1a1a]'}`}>
                        {card.description.split(' ').map((word, wIdx) => (
                          <span
                            key={wIdx}
                            ref={(el) => {
                              if (!cardDescWordRefs.current[idx]) {
                                cardDescWordRefs.current[idx] = [];
                              }
                              cardDescWordRefs.current[idx][wIdx] = el;
                            }}
                            className="inline-block mr-[0.25em] last:mr-0 opacity-0"
                            style={{
                              filter: 'blur(12px)',
                              transform: 'translate3d(0, 14px, 0)',
                            }}
                          >
                            {word}
                          </span>
                        ))}
                      </p>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

    </>
  );
}
