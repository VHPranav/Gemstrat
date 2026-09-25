'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ImageGeneration } from 'img-fx';
import { usePixelSwapScheduler } from './usePixelSwapScheduler';

interface ImageFormationGridProps {
  images?: string[];
  videoSrc?: string;
}

// 16 landmarks from the regions the video tours (Canada, India, USA, Middle
// East), ordered so neighbouring tiles come from different regions.
// Generated in Google Flow (Nano Banana Pro), 900×1500 WebP in public/images/monuments.
const DEFAULT_IMAGES = [
  // Row 1
  '/images/monuments/cn-tower.webp',
  '/images/monuments/taj-mahal-archway.webp',
  '/images/monuments/statue-of-liberty.webp',
  '/images/monuments/desert-highway.webp',
  '/images/monuments/qutub-minar.webp',
  '/images/monuments/golden-gate-bridge.webp',
  // Row 2 (either side of the video)
  '/images/monuments/burj-khalifa.webp',
  '/images/monuments/toronto-skyline.webp',
  '/images/monuments/gateway-of-india.webp',
  '/images/monuments/one-world-trade-center.webp',
  // Row 3
  '/images/monuments/sheikh-zayed-mosque.webp',
  '/images/monuments/empire-state-building.webp',
  '/images/monuments/parliament-peace-tower.webp',
  '/images/monuments/taj-mahal-minaret.webp',
  '/images/monuments/dubai-skyline-fog.webp',
  '/images/monuments/chateau-frontenac.webp',
];

export default function ImageFormationGrid({
  images = DEFAULT_IMAGES,
  videoSrc = '/videos/Gemstart rough cut 02 (1).mp4',
}: ImageFormationGridProps) {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const videoContainerRef = useRef<HTMLDivElement | null>(null);
  const tileSrcs = images.slice(0, 16);
  const { tileProps, onTileHover } = usePixelSwapScheduler({
    initialSrcs: tileSrcs,
    pool: images,
    viewRef: sectionRef,
  });

  // GSAP Scroll Animation
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      if (!sectionRef.current || !gridRef.current || !videoContainerRef.current) return;

      const section = sectionRef.current;
      const video = videoContainerRef.current;
      const allGridImages = gridRef.current.querySelectorAll('.grid__img:not(.pos-video)');

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=200%',
          scrub: true,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      timeline.to(
        allGridImages,
        {
          opacity: 0,
          scale: 0.95,
          duration: 0.5,
          stagger: {
            each: 0.03,
            from: 'random',
          },
          ease: 'power2.inOut',
        },
        0
      );

      timeline.to(
        video,
        {
          // Scale until the video covers the whole viewport (its grid cell is
          // only 2 of 8 columns wide, so this is ~4× on desktop). Recomputed on
          // resize via invalidateOnRefresh.
          // offsetWidth/Height ignore transforms, so a mid-scroll refresh
          // doesn't measure the already-scaled video.
          scale: () => {
            const scaleX = window.innerWidth / (video.offsetWidth || 1);
            const scaleY = window.innerHeight / (video.offsetHeight || 1);
            return Math.max(scaleX, scaleY) * 1.05;
          },
          duration: 1,
          ease: 'power2.inOut',
        },
        0
      );

      // Hold the full-screen video briefly before unpinning to the next section
      timeline.to({}, { duration: 0.3 });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="formation-section">
      {/* Grid of Images & Center Video */}
      <div ref={gridRef} className="formation-grid" data-grid-first>
        {/* 1. Items before video (pos-1 to pos-8: 8 images) */}
        {tileSrcs.slice(0, 8).map((src, index) => (
          <div
            key={`img-pre-${index}`}
            className={`grid__img pos-${index + 1} relative overflow-hidden pointer-events-auto cursor-pointer`}
            style={{ backgroundImage: `url("${src}")` }}
            onMouseEnter={() => onTileHover(index)}
          >
            <ImageGeneration
              {...tileProps(index)}
              preset="pixels-organic"
              pixelScale={0.8}
              strength={0}
              cardBg="#090909"
              theme="dark"
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
        ))}

        {/* 2. Center Video (scales up on scroll to fill entire viewport) */}
        <div
          ref={videoContainerRef}
          className="grid__img pos-video relative overflow-hidden bg-black border border-white/10"
        >
          <video
            src={videoSrc}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover pointer-events-none"
          />
        </div>

        {/* 3. Items after video (pos-9 to pos-16: 8 images) */}
        {tileSrcs.slice(8, 16).map((src, index) => (
          <div
            key={`img-post-${index}`}
            className={`grid__img pos-${index + 9} relative overflow-hidden pointer-events-auto cursor-pointer`}
            style={{ backgroundImage: `url("${src}")` }}
            onMouseEnter={() => onTileHover(index + 8)}
          >
            <ImageGeneration
              {...tileProps(index + 8)}
              preset="pixels-organic"
              pixelScale={0.8}
              strength={0}
              cardBg="#090909"
              theme="dark"
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
        ))}
      </div>
    </section>
  );
}
