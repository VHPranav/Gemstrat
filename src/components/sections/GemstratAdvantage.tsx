'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ImageGeneration } from 'img-fx';
import { usePixelSwapScheduler } from '@/components/ui/usePixelSwapScheduler';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface PillarItem {
  id: string;
  title: string;
  subtext: string;
  image: string;
  widthClass: string;
  aspectClass: string;
  rotation: string;
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------
// 10 landmarks (none repeated from the video grid), in SCATTERED_TILES order so
// neighbouring tiles come from different regions
const GRID_IMAGES = [
  '/images/monuments/lotus-temple.webp',
  '/images/monuments/flatiron-building.webp',
  '/images/monuments/burj-al-arab.webp',
  '/images/monuments/montreal-olympic-tower.webp',
  '/images/monuments/pyramids-of-giza.webp',
  '/images/monuments/india-gate.webp',
  '/images/monuments/canada-place.webp',
  '/images/monuments/museum-of-the-future.webp',
  '/images/monuments/hawa-mahal.webp',
  '/images/monuments/chrysler-building.webp',
];

// 10 tiles on the 8×3 grid, arranged with point symmetry: the top-left cluster
// mirrors the bottom-right one, and the rows stagger against each other.
// Row 2 only uses the outermost columns so no tile ever sits under the title,
// which spans cols 2–7 on narrow screens.
const SCATTERED_TILES = [
  // Row 1
  { row: 1, col: 1, img: 0 },
  { row: 1, col: 2, img: 1 },
  { row: 1, col: 5, img: 2 },
  { row: 1, col: 7, img: 3 },
  // Row 2 (cols 2–7 left clear for the title)
  { row: 2, col: 1, img: 4 },
  { row: 2, col: 8, img: 5 },
  // Row 3
  { row: 3, col: 2, img: 6 },
  { row: 3, col: 4, img: 7 },
  { row: 3, col: 7, img: 8 },
  { row: 3, col: 8, img: 9 },
];

const TILE_SRCS = SCATTERED_TILES.map((tile) => GRID_IMAGES[tile.img]);

const ADVANTAGE_PILLARS: PillarItem[] = [
  {
    id: 'pillar-1',
    title: 'Client-Centric, Always',
    subtext: 'We listen deeply and co-create solutions.',
    image: '/images/advantage/client-centric.webp',
    widthClass: 'w-[175px] sm:w-[205px]',
    aspectClass: 'aspect-[3/4]',
    rotation: '-4.5deg',
  },
  {
    id: 'pillar-2',
    title: 'Industry Fluency',
    subtext: 'We speak the language of modern markets.',
    image: '/images/advantage/industry-fluency.webp',
    widthClass: 'w-[230px] sm:w-[270px]',
    aspectClass: 'aspect-[16/10]',
    rotation: '3.5deg',
  },
  {
    id: 'pillar-3',
    title: 'Global Reach, Local Pulse',
    subtext: 'Seamless strategic execution across continents.',
    image: '/images/advantage/global-reach.webp',
    widthClass: 'w-[185px] sm:w-[220px]',
    aspectClass: 'aspect-square',
    rotation: '-6deg',
  },
  {
    id: 'pillar-4',
    title: 'Creative Meets Commercial',
    subtext: 'Bold vision grounded in commercial reality.',
    image: '/images/advantage/creative-commercial.webp',
    widthClass: 'w-[180px] sm:w-[215px]',
    aspectClass: 'aspect-[4/5]',
    rotation: '5.5deg',
  },
  {
    id: 'pillar-5',
    title: 'Bespoke Strategy, Zero Template',
    subtext: 'Tailored roadmaps engineered specifically for your market edge.',
    image: '/images/advantage/bespoke-strategy.webp',
    widthClass: 'w-[245px] sm:w-[290px]',
    aspectClass: 'aspect-[16/11]',
    rotation: '-3deg',
  },
  {
    id: 'pillar-6',
    title: 'High-Velocity Execution',
    subtext: 'Turning strategic clarity into deployed assets in record time.',
    image: '/images/advantage/high-velocity.webp',
    widthClass: 'w-[160px] sm:w-[195px]',
    aspectClass: 'aspect-[9/14]',
    rotation: '7deg',
  },
  {
    id: 'pillar-7',
    title: 'Engineering & Design Synergy',
    subtext: 'Where technical rigor empowers world-class brand experiences.',
    image: '/images/advantage/engineering-design.webp',
    widthClass: 'w-[195px] sm:w-[235px]',
    aspectClass: 'aspect-[4/5]',
    rotation: '-5deg',
  },
  {
    id: 'pillar-8',
    title: 'Measurable Commercial Impact',
    subtext: 'Every deliverable calibrated directly against your growth metrics.',
    image: '/images/advantage/measurable-impact.webp',
    widthClass: 'w-[225px] sm:w-[265px]',
    aspectClass: 'aspect-[16/10]',
    rotation: '4.5deg',
  },
];

// ---------------------------------------------------------------------------
// PixelTile
// Static image with an img-fx layer on top. Swaps and hover churn are driven
// by usePixelSwapScheduler through the spread `genProps`.
// Starts completely static on mount (strength=0, no autoReveal).
// ---------------------------------------------------------------------------
function PixelTile({
  src,
  gridArea,
  onMouseEnter,
  genProps,
}: {
  src: string;
  gridArea: string;
  onMouseEnter: () => void;
  genProps: ReturnType<ReturnType<typeof usePixelSwapScheduler>['tileProps']>;
}) {
  return (
    <div
      className="grid__img relative overflow-hidden pointer-events-auto cursor-pointer"
      style={{ gridArea, backgroundImage: `url("${src}")` }}
      onMouseEnter={onMouseEnter}
    >
      <ImageGeneration
        {...genProps}
        preset="pixels-organic"
        pixelScale={0.8}
        strength={0}
        cardBg="#ffffff"
        theme="light"
        suppressHydrationWarning
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          display: 'block',
        }}
        className="w-full h-full absolute inset-0"
      >
        <div
          className="w-full h-full bg-cover bg-center"
          style={{
            backgroundImage: `url("${src}")`,
            width: '100%',
            height: '100%',
            backgroundColor: 'transparent',
          }}
        />
      </ImageGeneration>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Section
// ---------------------------------------------------------------------------
export default function GemstratAdvantage() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const mainTrackRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // Driven by the scroll timeline below: the grid is only "fully in view" once
  // every tile has landed and before the track slides to Screen 2. Tiles must
  // not be primed mid-flight — img-fx would measure the 3D-squashed tile and
  // bake a vertically stretched image into the reveal.
  const { tileProps, onTileHover, setActive } = usePixelSwapScheduler({
    initialSrcs: TILE_SRCS,
    pool: GRID_IMAGES,
    intervalMs: 3200,
  });

  const [hoveredPillar, setHoveredPillar] = useState<PillarItem | null>(null);
  const [cursorPos, setCursorPos] = useState({ x: -1000, y: -1000 });

  // GSAP scroll animation
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      if (gridRef.current) {
        gsap.set(gridRef.current.querySelectorAll('.grid__img'), {
          autoAlpha: 1,
          y: 0,
          z: 0,
          rotationX: 0,
        });
      }
      return;
    }

    const ctx = gsap.context(() => {
      if (!sectionRef.current || !mainTrackRef.current || !gridRef.current) return;

      const gridImages = gridRef.current.querySelectorAll('.grid__img');

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=300%',
          pin: stickyRef.current,
          scrub: 0.4,
        },
        onUpdate: () => {
          const t = tl.time();
          setActive(t >= tl.labels.gridLanded && t <= tl.labels.slideStart);
        },
      });

      // 3D Perspective entry
      tl.set(gridRef.current, { perspective: 1000 })
        .from(gridImages, {
          stagger: { amount: 0.45, from: 'random' },
          y: () => window.innerHeight,
          rotationX: -70,
          transformOrigin: '50% 0%',
          z: -900,
          autoAlpha: 0,
          ease: 'sine.out',
          duration: 1,
        })
        .addLabel('gridLanded')
        .to({}, { duration: 0.2 })
        .addLabel('slideStart')
        // Horizontal slide → Screen 2
        .to(mainTrackRef.current, {
          xPercent: -50,
          duration: 1.2,
          ease: 'power2.inOut',
        })
        .to({}, { duration: 0.35 });
    }, sectionRef);

    return () => {
      setActive(false);
      ctx.revert();
    };
  }, [setActive]);

  return (
    <section
      ref={sectionRef}
      id="advantage"
      className="relative w-full h-[400vh] bg-white text-[#090909] z-40 overflow-visible"
    >
      <div
        ref={stickyRef}
        className="sticky top-0 h-screen h-[100svh] w-full flex items-center overflow-hidden bg-white box-border"
      >
        {/* Horizontal Track: Screen 1 + Screen 2 side-by-side */}
        <div
          ref={mainTrackRef}
          className="h-full flex flex-row flex-nowrap items-center will-change-transform pointer-events-none select-none"
          style={{ width: '200vw', transform: 'translate3d(0, 0, 0)' }}
        >
          {/* ===== Screen 1: 3D portrait grid ===== */}
          <div className="screen-1 pointer-events-auto">
            <div ref={gridRef} className="explorations-grid" data-grid-fifth>
              {SCATTERED_TILES.map((tile, index) => (
                <PixelTile
                  key={index}
                  src={TILE_SRCS[index]}
                  gridArea={`${tile.row} / ${tile.col}`}
                  onMouseEnter={() => onTileHover(index)}
                  genProps={tileProps(index)}
                />
              ))}
            </div>

            {/* Centered Overlay Title */}
            <div className="content__title">
              <h2 className="content__title-main">
                <span className="block">The Gemstrat</span>
                <span className="block">Advantage</span>
              </h2>
            </div>
          </div>

          {/* ===== Screen 2: Advantage pillar boxes ===== */}
          <div
            onMouseMove={(e) => setCursorPos({ x: e.clientX, y: e.clientY })}
            onMouseLeave={() => setHoveredPillar(null)}
            className="w-screen h-full shrink-0 grid grid-cols-2 grid-rows-4 pointer-events-auto select-none bg-white relative border-l border-black/[0.12]"
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
                    className={`font-frama text-[clamp(1.35rem,2.2vw,40px)] font-normal leading-[1.1] sm:leading-[34.4px] tracking-[-0.03em] m-0 text-left transition-colors duration-250 ${
                      isHovered ? 'text-white' : 'text-[#090909]'
                    }`}
                  >
                    {pillar.title}
                  </h3>
                  <p
                    className={`font-sans text-[clamp(0.88rem,1.05vw,16px)] font-normal leading-[1.45] tracking-[-0.015em] mt-2 sm:mt-2.5 m-0 text-left transition-colors duration-250 ${
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

        {/* Floating Cursor Image Badge */}
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
            } rounded-none overflow-hidden border border-white/35 bg-black`}
          >
            {hoveredPillar && (
              <Image
                src={hoveredPillar.image}
                alt={hoveredPillar.title}
                fill
                sizes="300px"
                className="object-cover object-center rounded-none grayscale"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent pointer-events-none" />
            <span className="absolute bottom-2.5 left-3 right-3 text-[10px] font-mono tracking-wider text-white/90 uppercase truncate">
              {hoveredPillar?.title}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
