'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import dynamic from 'next/dynamic';
import { whenIdle } from '@/lib/whenIdle';
import { isLowEndDevice } from '@/lib/device';

// img-fx (and three.js with it) loads on demand; until then each tile shows
// its image via its own background, so there's no visible difference
const ImageGeneration = dynamic(() => import('img-fx').then((m) => m.ImageGeneration), {
  ssr: false,
});
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
  // 1080p H.264 at 4.5 Mbps, no audio, fast-start (re-encoded from the 95 MB master)
  videoSrc = '/videos/gemstrat-film.mp4',
}: ImageFormationGridProps) {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  // Tile images + pixel effects are prepared in the background once the page
  // is idle after load (or when the section gets within ~3 screens, whichever
  // comes first) — not at page load, and not mid-scroll. Stays true afterwards.
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true);
          observer.disconnect();
        }
      },
      { rootMargin: '300% 0px' }
    );
    observer.observe(el);
    const cancelIdle = whenIdle(() => setNear(true), 2500);
    return () => {
      observer.disconnect();
      cancelIdle();
    };
  }, []);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const videoContainerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Lazy video: nothing downloads until the section is within ~1 screen of the
  // viewport; it pauses again when far away so it isn't decoding off-screen
  useEffect(() => {
    const video = videoRef.current;
    const section = sectionRef.current;
    if (!video || !section) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!video.src) {
            video.src = videoSrc;
            video.load();
          }
          video.play().catch(() => {
            // Autoplay blocked (e.g. low-power mode): the poster stays visible
          });
        } else if (!video.paused) {
          video.pause();
        }
      },
      { rootMargin: '100% 0px' }
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, [videoSrc]);
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
      const allGridImages = gridRef.current.querySelectorAll<HTMLElement>(
        '.grid__img:not(.pos-video)'
      );

      // Entrance: as the section scrolls in, the tiles flow in one after
      // another — a diagonal wave from top-left to bottom-right — instead of
      // arriving together. Scrubbed, and only transform + opacity (composited).
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const gridRect = gridRef.current.getBoundingClientRect();
        const order = Array.from(allGridImages, (tile) => {
          const r = tile.getBoundingClientRect();
          return (
            (r.left - gridRect.left) / (gridRect.width || 1) +
            ((r.top - gridRect.top) / (gridRect.height || 1)) * 0.5
          );
        });
        const maxOrder = Math.max(...order) || 1;
        const entrance = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: 'top 85%',
            end: 'top top',
            scrub: true,
          },
        });
        allGridImages.forEach((tile, i) => {
          entrance.fromTo(
            tile,
            { y: 160, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.4, ease: 'power3.out' },
            (order[i] / maxOrder) * 0.6
          );
        });
      }

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

      // fromTo so the exit never records the entrance's hidden state as its start
      timeline.fromTo(
        allGridImages,
        { opacity: 1, scale: 1 },
        {
          opacity: 0,
          scale: 0.95,
          immediateRender: false,
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
            style={near ? { backgroundImage: `url("${src}")` } : undefined}
            onMouseEnter={() => onTileHover(index)}
          >
            {near && (
              <ImageGeneration
                {...tileProps(index)}
                preset="pixels-organic"
                pixelScale={isLowEndDevice() ? 1.2 : 0.8}
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
            )}
          </div>
        ))}

        {/* 2. Center Video (scales up on scroll to fill entire viewport) */}
        <div
          ref={videoContainerRef}
          className="grid__img pos-video relative overflow-hidden bg-black border border-white/10"
        >
          <video
            ref={videoRef}
            poster="/videos/gemstrat-film-poster.webp"
            preload="none"
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
            style={near ? { backgroundImage: `url("${src}")` } : undefined}
            onMouseEnter={() => onTileHover(index + 8)}
          >
            {near && (
              <ImageGeneration
                {...tileProps(index + 8)}
                preset="pixels-organic"
                pixelScale={isLowEndDevice() ? 1.2 : 0.8}
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
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
