'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

interface ExplorationsGridProps {
  title?: string;
  images?: string[];
}

// 20 curated images from public/images/ref images
const DEFAULT_IMAGES = [
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

// Scattered portrait tiles across 8-column x 3-row grid with voids around center title
const SCATTERED_TILES = [
  // Row 1 (voids at col 3, col 6)
  { row: 1, col: 1, img: 0 },
  { row: 1, col: 2, img: 1 },
  { row: 1, col: 4, img: 2 },
  { row: 1, col: 5, img: 3 },
  { row: 1, col: 7, img: 4 },
  { row: 1, col: 8, img: 5 },

  // Row 2 (voids at cols 3, 4, 5, 6 for center title)
  { row: 2, col: 1, img: 6 },
  { row: 2, col: 2, img: 7 },
  { row: 2, col: 7, img: 8 },
  { row: 2, col: 8, img: 9 },

  // Row 3 (voids at col 2, col 5)
  { row: 3, col: 1, img: 10 },
  { row: 3, col: 3, img: 11 },
  { row: 3, col: 4, img: 12 },
  { row: 3, col: 6, img: 13 },
  { row: 3, col: 7, img: 14 },
  { row: 3, col: 8, img: 15 },
];

export default function ExplorationsGrid({
  title = 'The Gemstrat Advantage',
  images = DEFAULT_IMAGES,
}: ExplorationsGridProps) {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const titleRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      if (!gridRef.current || !sectionRef.current) return;

      const gridImages = gridRef.current.querySelectorAll('.grid__img');

      const tl = gsap.timeline({
        defaults: {
          ease: 'sine',
        },
        scrollTrigger: {
          trigger: gridRef.current,
          start: 'center center',
          end: '+=250%',
          pin: sectionRef.current,
          scrub: 0.3,
        },
      });

      // 3D Perspective entry: tiles tilt back (rotationX -70deg) & zoom in from Z-space
      tl.set(gridRef.current, { perspective: 1000 })
        .from(gridImages, {
          stagger: {
            amount: 0.4,
            from: 'random',
          },
          y: () => window.innerHeight,
          rotationX: -70,
          transformOrigin: '50% 0%',
          z: -900,
          autoAlpha: 0,
        });

      // Synchronous title reveal
      if (titleRef.current) {
        tl.from(
          titleRef.current,
          {
            duration: 1,
            ease: 'power3.out',
            yPercent: 120,
            autoAlpha: 0,
          },
          0.3
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="advantage" className="explorations-section">
      <style jsx>{`
        .explorations-section {
          display: grid;
          height: 100vh;
          width: 100%;
          place-items: center;
          grid-template-areas: 'main';
          grid-template-rows: 100%;
          grid-template-columns: 100%;
          position: relative;
          overflow: hidden;
          padding: 0.5rem;
          background-color: #ffffff;
          color: #0b0b0c;
        }

        /* 5 columns x 4 rows wide grid */
        .explorations-grid {
          grid-area: main;
          display: grid;
          width: 100%;
          height: 100%;
          gap: 0.5rem;
          grid-template-columns: repeat(8, 1fr);
          grid-template-rows: repeat(3, 1fr);
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
        }

        .content__title-main {
          font-family: 'Frama', sans-serif;
          font-size: clamp(2.6rem, 7.5vw, 6.2rem);
          line-height: 0.95;
          margin: 0;
          font-weight: 400;
          letter-spacing: -0.035em;
          color: #0b0b0c;
          text-align: center;
        }
      `}</style>

      {/* 5x4 Grid containing scattered tiles with random voids */}
      <div ref={gridRef} className="explorations-grid" data-grid-fifth>
        {SCATTERED_TILES.map((tile, index) => (
          <div
            key={index}
            className="grid__img"
            style={{
              gridArea: `${tile.row} / ${tile.col}`,
              backgroundImage: `url("${images[tile.img] || DEFAULT_IMAGES[tile.img]}")`,
            }}
          />
        ))}
      </div>

      {/* Centered Overlay Title */}
      <div ref={titleRef} className="content__title">
        <h2 className="content__title-main">
          <span className="block">The Gemstrat</span>
          <span className="block">Advantage</span>
        </h2>
      </div>
    </section>
  );
}
