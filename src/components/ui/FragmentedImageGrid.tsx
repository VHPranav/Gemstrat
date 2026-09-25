'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface FormationSlice {
  left: number;
  top: number;
  width: number;
  height: number;
}

// 4 Distinct Architectural Fragment Formations
const FORMATIONS: FormationSlice[][] = [
  // Formation 0: Reference Style (Left top-aligned, Center shifted low, Right mid-height)
  [
    { left: 0, top: 0, width: 31.5, height: 52 },
    { left: 33.5, top: 22, width: 37.5, height: 78 },
    { left: 73, top: 8, width: 27, height: 60 },
  ],
  // Formation 1: Center Monumental (Center slice lifts high and anchors, flanking wings drop down)
  [
    { left: 0, top: 28, width: 28, height: 72 },
    { left: 30, top: 0, width: 40, height: 82 },
    { left: 72, top: 22, width: 28, height: 74 },
  ],
  // Formation 2: Descending Steppes (Left high, cascade step-down toward right)
  [
    { left: 0, top: 0, width: 32, height: 64 },
    { left: 34, top: 16, width: 32, height: 68 },
    { left: 68, top: 32, width: 32, height: 68 },
  ],
  // Formation 3: Ascending Steppes (Left low, cascade step-up toward right top)
  [
    { left: 0, top: 32, width: 30, height: 68 },
    { left: 32, top: 16, width: 35, height: 72 },
    { left: 69, top: 0, width: 31, height: 62 },
  ],
];

const DEFAULT_IMAGES = [
  { src: '/images/about/boardroom.webp', alt: 'Gemstrat Strategic Advisory' },
  { src: '/images/about/architect-drawing.webp', alt: 'Gemstrat Architecture' },
  { src: '/images/about/tower-crane.webp', alt: 'Gemstrat Scalable Execution' },
  { src: '/images/about/high-speed-train.webp', alt: 'Gemstrat Momentum' },
  { src: '/images/about/strategy-notebook.webp', alt: 'Gemstrat Leadership' },
];

interface FragmentedImageGridProps {
  images?: { src: string; alt?: string }[];
  className?: string;
  intervalMs?: number;
}

export default function FragmentedImageGrid({
  images = DEFAULT_IMAGES,
  className = '',
  intervalMs = 4000,
}: FragmentedImageGridProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Smooth recurring morph between formations and images
  useEffect(() => {
    if (isPaused || images.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPaused, images.length, intervalMs]);

  const currentFormation = FORMATIONS[currentIndex % FORMATIONS.length];

  return (
    <div
      className={`relative w-full max-w-[540px] xl:max-w-[580px] aspect-[1.25/1] group select-none ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label="Fragmented Image Grid"
    >
      {/* 3 morphing vertical slices */}
      {[0, 1, 2].map((sliceIndex) => {
        const slice = currentFormation[sliceIndex];

        // Inverse math ensures every slice inner image maps 1:1 to the master container bounds (100% x 100%)
        const innerWidth = (100 / slice.width) * 100;
        const innerHeight = (100 / slice.height) * 100;
        const innerLeft = -(slice.left / slice.width) * 100;
        const innerTop = -(slice.top / slice.height) * 100;

        return (
          <div
            key={sliceIndex}
            className="absolute overflow-hidden border border-white/10 bg-[#121214] will-change-[left,top,width,height,transform]"
            style={{
              left: `${slice.left}%`,
              top: `${slice.top}%`,
              width: `${slice.width}%`,
              height: `${slice.height}%`,
              transition:
                'left 1.35s cubic-bezier(0.16, 1, 0.3, 1), top 1.35s cubic-bezier(0.16, 1, 0.3, 1), width 1.35s cubic-bezier(0.16, 1, 0.3, 1), height 1.35s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {/* Inner window locked to global coordinate space */}
            <div
              className="absolute pointer-events-none"
              style={{
                left: `${innerLeft}%`,
                top: `${innerTop}%`,
                width: `${innerWidth}%`,
                height: `${innerHeight}%`,
                transition:
                  'left 1.35s cubic-bezier(0.16, 1, 0.3, 1), top 1.35s cubic-bezier(0.16, 1, 0.3, 1), width 1.35s cubic-bezier(0.16, 1, 0.3, 1), height 1.35s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              {/* Stacked crossfading image layers */}
              {images.map((item, imgIdx) => {
                const isActive = imgIdx === currentIndex;
                return (
                  <div
                    key={item.src}
                    className="absolute inset-0 will-change-opacity transition-opacity duration-1000 ease-in-out"
                    style={{
                      opacity: isActive ? 1 : 0,
                      zIndex: isActive ? 10 : 1,
                    }}
                  >
                    <Image
                      src={item.src}
                      alt={item.alt || 'Gemstrat'}
                      fill
                      priority={imgIdx < 2}
                      unoptimized
                      className="object-cover grayscale"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Subtle indicator dots on bottom right */}
      <div className="absolute -bottom-7 right-1 flex items-center gap-2 z-20">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`h-1 transition-all duration-500 rounded-full cursor-pointer ${
              i === currentIndex
                ? 'w-6 bg-white'
                : 'w-2 bg-white/20 hover:bg-white/40'
            }`}
            aria-label={`Switch to image formation ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
