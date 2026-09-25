'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface PillarItem {
  id: string;
  title: string;
  subtext: string;
  image: string;
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------
const ADVANTAGE_PILLARS: PillarItem[] = [
  {
    id: 'pillar-1',
    title: 'Client-Centric, Always',
    subtext: 'We listen deeply and co-create solutions.',
    image: '/images/advantage/client-centric.webp',
  },
  {
    id: 'pillar-2',
    title: 'Industry Fluency',
    subtext: 'We speak the language of modern markets.',
    image: '/images/advantage/industry-fluency.webp',
  },
  {
    id: 'pillar-3',
    title: 'Global Reach, Local Pulse',
    subtext: 'Seamless strategic execution across continents.',
    image: '/images/advantage/global-reach.webp',
  },
  {
    id: 'pillar-4',
    title: 'Creative Meets Commercial',
    subtext: 'Bold vision grounded in commercial reality.',
    image: '/images/advantage/creative-commercial.webp',
  },
  {
    id: 'pillar-5',
    title: 'Bespoke Strategy, Zero Template',
    subtext: 'Tailored roadmaps engineered specifically for your market edge.',
    image: '/images/advantage/bespoke-strategy.webp',
  },
  {
    id: 'pillar-6',
    title: 'High-Velocity Execution',
    subtext: 'Turning strategic clarity into deployed assets in record time.',
    image: '/images/advantage/high-velocity.webp',
  },
  {
    id: 'pillar-7',
    title: 'Engineering & Design Synergy',
    subtext: 'Where technical rigor empowers world-class brand experiences.',
    image: '/images/advantage/engineering-design.webp',
  },
  {
    id: 'pillar-8',
    title: 'Measurable Commercial Impact',
    subtext: 'Every deliverable calibrated directly against your growth metrics.',
    image: '/images/advantage/measurable-impact.webp',
  },
];

// Staggered editorial layout for the 8 pillars (desktop, 24-column grid).
// A 4-card rhythm — large left, medium right & dropped, medium-large centre-
// right, small left & dropped — then the same rhythm mirrored. All images 4:5.
// Explicit rows keep each pair side by side; vertical drops use vw so they
// scale with the columns.
const PILLAR_SLOTS = [
  'lg:row-start-1 lg:col-start-1 lg:col-span-14',
  'lg:row-start-1 lg:col-start-16 lg:col-span-9 lg:mt-[37vw]',
  'lg:row-start-2 lg:col-start-11 lg:col-span-11',
  'lg:row-start-2 lg:col-start-1 lg:col-span-7 lg:mt-[14vw]',
  'lg:row-start-3 lg:col-start-11 lg:col-span-14',
  'lg:row-start-3 lg:col-start-1 lg:col-span-9 lg:mt-[37vw]',
  'lg:row-start-4 lg:col-start-4 lg:col-span-11',
  'lg:row-start-4 lg:col-start-18 lg:col-span-7 lg:mt-[14vw]',
];
// Below lg: single column with alternating widths/alignment
const PILLAR_SLOTS_MOBILE = ['w-full', 'w-[78%] self-end', 'w-[88%]', 'w-[70%] self-end'];
// Parallax per slot in the 4-card rhythm — smaller cards move more, so the
// layout reads with depth:
// - image: yPercent travel of the oversized layer inside its frame. The layer
//   overhangs the frame by 28% top and bottom (156% tall), so travel must stay
//   below 28/156 ≈ 17.9% or the frame's edge would show.
// - card: px the whole card drifts against the page over its scroll-through.
const PILLAR_PARALLAX = [10, 14, 12, 17];
const PILLAR_CARD_DRIFT = [40, 110, 70, 150];
const PILLAR_SIZES = [
  '(min-width: 1024px) 42vw, 100vw',
  '(min-width: 1024px) 28vw, 80vw',
  '(min-width: 1024px) 34vw, 90vw',
  '(min-width: 1024px) 22vw, 70vw',
];

// ---------------------------------------------------------------------------
// Main Section
// ---------------------------------------------------------------------------
export default function GemstratAdvantage() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const pillarsRef = useRef<HTMLDivElement>(null);

  // Parallax: each image layer drifts inside its frame, and each card drifts
  // against the page, while it scrolls through the viewport
  useEffect(() => {
    const root = pillarsRef.current;
    if (!root || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      root.querySelectorAll<HTMLElement>('[data-parallax]').forEach((layer) => {
        const travel = Number(layer.dataset.parallax) || 10;
        gsap.fromTo(
          layer,
          { yPercent: -travel },
          {
            yPercent: travel,
            ease: 'none',
            scrollTrigger: {
              trigger: layer.parentElement,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          }
        );
      });
      // Card-level drift (GSAP transform; the reveal uses the separate CSS
      // `translate` property, so the two don't fight)
      root.querySelectorAll<HTMLElement>('[data-drift]').forEach((card) => {
        const drift = Number(card.dataset.drift) || 0;
        gsap.fromTo(
          card,
          { y: drift },
          {
            y: -drift,
            ease: 'none',
            scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: true },
          }
        );
      });
    }, root);
    return () => ctx.revert();
  }, []);

  // Pillars fade/slide up as they enter the viewport
  useEffect(() => {
    const items = pillarsRef.current?.querySelectorAll<HTMLElement>('[data-pillar]');
    if (!items) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      items.forEach((el) => (el.dataset.in = 'true'));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          (entry.target as HTMLElement).dataset.in = 'true';
          observer.unobserve(entry.target);
        }),
      { rootMargin: '0px 0px -12% 0px' }
    );
    items.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="advantage"
      className="relative w-full bg-white text-[#090909] z-40"
    >
      {/* Sticky centred title: stays fixed in the middle of the screen for the
          whole section, ON TOP of the 8 pillars scrolling up beneath it.
          White + difference blend → black over the white page, inverted over
          the photos, so it stays legible everywhere. */}
      <div className="sticky top-0 h-screen h-[100svh] w-full flex items-center justify-center z-20 mix-blend-difference pointer-events-none select-none px-6">
        <h2 className="content__title-main !text-white">
          <span className="block">The Gemstrat</span>
          <span className="block">Advantage</span>
        </h2>
      </div>

      {/* The 8 pillars: staggered editorial image layout. Pulled up by one screen
          so it scrolls beneath the sticky title; the first card starts below the fold.
          The sticky title only releases when the section's bottom reaches the
          viewport's bottom, so the 125vh bottom padding makes every card leave
          through the top of the screen before the title starts to move. */}
      <div className="relative z-10 -mt-[100vh] -mt-[100svh] w-full max-w-[1500px] mx-auto px-6 sm:px-10 lg:px-[8vw] pt-[85vh] pb-[125vh] box-border">
        <div
          ref={pillarsRef}
          className="flex flex-col gap-16 sm:gap-20 lg:grid lg:grid-cols-24 lg:gap-x-[2vw] lg:gap-y-[7vw] lg:items-start"
        >
          {ADVANTAGE_PILLARS.map((pillar, idx) => (
            <article
              key={pillar.id}
              data-pillar
              data-drift={PILLAR_CARD_DRIFT[idx % 4]}
              data-in="false"
              className={`group ${PILLAR_SLOTS_MOBILE[idx % 4]} lg:w-auto ${PILLAR_SLOTS[idx]} opacity-0 translate-y-12 transition-[opacity,translate] duration-[1100ms] ease-[cubic-bezier(0.16,1,0.3,1)] data-[in=true]:opacity-100 data-[in=true]:translate-y-0`}
            >
              <div className="relative w-full aspect-[4/5] overflow-hidden bg-[#eaeaea]">
                {/* Oversized layer the parallax moves; the image inside keeps its
                    own reveal/hover scale */}
                <div
                  data-parallax={PILLAR_PARALLAX[idx % 4]}
                  className="absolute inset-x-0 -top-[28%] h-[156%] will-change-transform"
                >
                  <Image
                    src={pillar.image}
                    alt={pillar.title}
                    fill
                    sizes={PILLAR_SIZES[idx % 4]}
                    className="object-cover grayscale scale-[1.08] transition-transform duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-data-[in=true]:scale-100 group-hover:!scale-[1.04]"
                  />
                </div>
              </div>
              <div className="mt-5 flex items-baseline gap-4">
                <span className="font-mono text-[11px] tracking-[0.2em] text-[#8a8a8a] shrink-0">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <div className="min-w-0">
                  <h3 className="font-frama text-[clamp(1.25rem,1.6vw,28px)] font-normal leading-[1.15] tracking-[-0.025em] m-0">
                    {pillar.title}
                  </h3>
                  <p className="font-sans text-[clamp(0.9rem,1vw,16px)] leading-[1.45] tracking-[-0.01em] text-[#6b6b6b] mt-1.5 m-0">
                    {pillar.subtext}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
