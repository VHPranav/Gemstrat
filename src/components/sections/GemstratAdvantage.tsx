'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

interface PillarItem {
  id: string;
  title: string;
  subtext: string;
  image: string;
  widthClass: string;
  aspectClass: string;
  rotation: string;
}

// 20 images from public/images/ref images for the 5x4 3D perspective grid
const GRID_IMAGES = [
  '/images/ref%20images/20.webp',
  '/images/ref%20images/19.webp',
  '/images/ref%20images/18.webp',
  '/images/ref%20images/17.webp',
  '/images/ref%20images/16.webp',
  '/images/ref%20images/15.webp',
  '/images/ref%20images/14.webp',
  '/images/ref%20images/13.webp',
  '/images/ref%20images/12.webp',
  '/images/ref%20images/11.webp',
  '/images/ref%20images/10.webp',
  '/images/ref%20images/9.webp',
  '/images/ref%20images/8.webp',
  '/images/ref%20images/7.webp',
  '/images/ref%20images/6.webp',
  '/images/ref%20images/5.webp',
  '/images/ref%20images/4.webp',
  '/images/ref%20images/3.webp',
  '/images/ref%20images/2.webp',
  '/images/ref%20images/1.webp',
];

// Scattered tiles across 5x4 grid with random voids and breathing room around title
const SCATTERED_TILES = [
  // Row 1 (void at col 3)
  { row: 1, col: 1, img: 0 },
  { row: 1, col: 2, img: 1 },
  { row: 1, col: 4, img: 2 },
  { row: 1, col: 5, img: 3 },

  // Row 2 (voids at cols 2, 3, 4 for title breathing space)
  { row: 2, col: 1, img: 4 },
  { row: 2, col: 5, img: 5 },

  // Row 3 (voids at cols 2, 3 for title breathing space)
  { row: 3, col: 1, img: 6 },
  { row: 3, col: 4, img: 7 },
  { row: 3, col: 5, img: 8 },

  // Row 4 (voids at cols 1, 4)
  { row: 4, col: 2, img: 9 },
  { row: 4, col: 3, img: 10 },
  { row: 4, col: 5, img: 11 },
];

// 8 advantage boxes for Screen 2
const ADVANTAGE_PILLARS: PillarItem[] = [
  {
    id: 'pillar-1',
    title: 'Client-Centric, Always',
    subtext: 'We listen deeply and co-create solutions.',
    image: '/images/ref%20images/6.webp',
    widthClass: 'w-[175px] sm:w-[205px]',
    aspectClass: 'aspect-[3/4]',
    rotation: '-4.5deg',
  },
  {
    id: 'pillar-2',
    title: 'Industry Fluency',
    subtext: 'We speak the language of modern markets.',
    image: '/images/ref%20images/7.webp',
    widthClass: 'w-[230px] sm:w-[270px]',
    aspectClass: 'aspect-[16/10]',
    rotation: '3.5deg',
  },
  {
    id: 'pillar-3',
    title: 'Global Reach, Local Pulse',
    subtext: 'Seamless strategic execution across continents.',
    image: '/images/ref%20images/8.webp',
    widthClass: 'w-[185px] sm:w-[220px]',
    aspectClass: 'aspect-square',
    rotation: '-6deg',
  },
  {
    id: 'pillar-4',
    title: 'Creative Meets Commercial',
    subtext: 'Bold vision grounded in commercial reality.',
    image: '/images/ref%20images/9.webp',
    widthClass: 'w-[180px] sm:w-[215px]',
    aspectClass: 'aspect-[4/5]',
    rotation: '5.5deg',
  },
  {
    id: 'pillar-5',
    title: 'Bespoke Strategy, Zero Template',
    subtext: 'Tailored roadmaps engineered specifically for your market edge.',
    image: '/images/ref%20images/10.webp',
    widthClass: 'w-[245px] sm:w-[290px]',
    aspectClass: 'aspect-[16/11]',
    rotation: '-3deg',
  },
  {
    id: 'pillar-6',
    title: 'High-Velocity Execution',
    subtext: 'Turning strategic clarity into deployed assets in record time.',
    image: '/images/ref%20images/11.webp',
    widthClass: 'w-[160px] sm:w-[195px]',
    aspectClass: 'aspect-[9/14]',
    rotation: '7deg',
  },
  {
    id: 'pillar-7',
    title: 'Engineering & Design Synergy',
    subtext: 'Where technical rigor empowers world-class brand experiences.',
    image: '/images/ref%20images/12.webp',
    widthClass: 'w-[195px] sm:w-[235px]',
    aspectClass: 'aspect-[4/5]',
    rotation: '-5deg',
  },
  {
    id: 'pillar-8',
    title: 'Measurable Commercial Impact',
    subtext: 'Every deliverable calibrated directly against your growth metrics.',
    image: '/images/ref%20images/13.webp',
    widthClass: 'w-[225px] sm:w-[265px]',
    aspectClass: 'aspect-[16/10]',
    rotation: '4.5deg',
  },
];

export default function GemstratAdvantage() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const mainTrackRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const [hoveredPillar, setHoveredPillar] = useState<PillarItem | null>(null);
  const [cursorPos, setCursorPos] = useState({ x: -1000, y: -1000 });

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      if (gridRef.current) {
        const gridImages = gridRef.current.querySelectorAll('.grid__img');
        gsap.set(gridImages, { autoAlpha: 1, y: 0, z: 0, rotationX: 0 });
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
      });

      // 1) 3D Perspective entry: tiles tilt back (rotationX -70deg) & zoom in from Z-space
      // Text is ALREADY visible at center
      tl.set(gridRef.current, { perspective: 1000 })
        .from(gridImages, {
          stagger: {
            amount: 0.45,
            from: 'random',
          },
          y: () => window.innerHeight,
          rotationX: -70,
          transformOrigin: '50% 0%',
          z: -900,
          autoAlpha: 0,
          ease: 'sine.out',
          duration: 1,
        })
        // Brief settle beat with full grid in place
        .to({}, { duration: 0.2 })
        // 2) Horizontal slide: Screen 1 slides left while Screen 2 (8 boxes) slides in
        .to(mainTrackRef.current, {
          xPercent: -50,
          duration: 1.2,
          ease: 'power2.inOut',
        })
        // 3) Rest on Screen 2 for interactive pillar exploration
        .to({}, { duration: 0.35 });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="advantage"
      className="relative w-full h-[400vh] bg-white text-[#090909] z-40 overflow-visible"
    >
      <style jsx>{`
        .screen-1 {
          width: 100vw;
          height: 100%;
          flex-shrink: 0;
          position: relative;
          overflow: hidden;
          display: grid;
          place-items: center;
          grid-template-areas: 'main';
          grid-template-rows: 100%;
          grid-template-columns: 100%;
          background-color: #ffffff;
        }

        .explorations-grid {
          grid-area: main;
          display: grid;
          width: 100%;
          height: 100%;
          gap: 0.5rem;
          padding: 0.5rem;
          grid-template-columns: repeat(5, 1fr);
          grid-template-rows: repeat(4, 1fr);
          transform-style: preserve-3d;
          position: relative;
        }

        .grid__img {
          background-size: cover;
          background-position: 50% 50%;
          pointer-events: none;
          will-change: transform, opacity;
          transform: translateZ(0.1px);
          filter: grayscale(100%);
        }

        .content__title {
          grid-area: main;
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 10;
          pointer-events: none;
          text-align: center;
          padding: 0 1.5rem;
          opacity: 1; /* ALREADY VISIBLE FROM THE START */
        }

        .content__title-main {
          font-family: var(--font-sans), 'Besley', serif;
          font-size: clamp(2.8rem, 7.5vw, 6.5rem);
          line-height: 0.95;
          margin: 0;
          font-weight: 600;
          letter-spacing: -0.035em;
          color: #0b0b0c;
          text-align: center;
        }
      `}</style>

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
          {/* Screen 1: "The Gemstrat Advantage" + 3D Grid Formation    */}
          {/* ========================================================= */}
          <div className="screen-1">
            {/* 5x4 Grid containing scattered tiles with random voids arriving via 3D perspective */}
            <div ref={gridRef} className="explorations-grid" data-grid-fifth>
              {SCATTERED_TILES.map((tile, index) => (
                <div
                  key={index}
                  className="grid__img"
                  style={{
                    gridArea: `${tile.row} / ${tile.col}`,
                    backgroundImage: `url("${GRID_IMAGES[tile.img]}")`,
                  }}
                />
              ))}
            </div>

            {/* Centered Overlay Title — ALREADY VISIBLE FROM THE START */}
            <div className="content__title">
              <h2 className="content__title-main">
                <span className="block">The Gemstrat</span>
                <span className="block">Advantage</span>
              </h2>
            </div>
          </div>

          {/* ========================================================= */}
          {/* Screen 2: 8 Advantage Boxes (2 in one row, 4 rows total)  */}
          {/* ========================================================= */}
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
                    className={`font-sans text-[clamp(1.3rem,2.1vw,34px)] font-medium leading-[1.12] tracking-[-0.03em] m-0 text-left transition-colors duration-250 ${
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

        {/* Floating Cursor Image Badge (tracks mouse with custom angle and preview) */}
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
