'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

interface ImageFormationGridProps {
    images?: string[];
    videoSrc?: string;
}

// Shuffled set of 16 images from public/images/ref images
const DEFAULT_IMAGES = [
    '/images/ref%20images/5.webp',
    '/images/ref%20images/28.webp',
    '/images/ref%20images/12.webp',
    '/images/ref%20images/1.webp',
    '/images/ref%20images/20.webp',
    '/images/ref%20images/7.webp',
    '/images/ref%20images/26.webp',
    '/images/ref%20images/15.webp',
    '/images/ref%20images/4.webp',
    '/images/ref%20images/23.webp',
    '/images/ref%20images/10.webp',
    '/images/ref%20images/17.webp',
    '/images/ref%20images/2.webp',
    '/images/ref%20images/24.webp',
    '/images/ref%20images/14.webp',
    '/images/ref%20images/9.webp',
];

export default function ImageFormationGrid({
    images = DEFAULT_IMAGES,
    videoSrc = '/videos/Gemstart rough cut 02 (1).mp4',
}: ImageFormationGridProps) {
    const sectionRef = useRef<HTMLDivElement | null>(null);
    const gridRef = useRef<HTMLDivElement | null>(null);
    const videoContainerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        gsap.registerPlugin(ScrollTrigger);

        const ctx = gsap.context(() => {
            if (!gridRef.current || !sectionRef.current) return;

            const gridImages = gridRef.current.querySelectorAll('.grid__img');
            const siblingImages = gridRef.current.querySelectorAll('.grid__img:not(.pos-video)');

            const tl = gsap.timeline({
                defaults: {
                    ease: 'none',
                },
                scrollTrigger: {
                    trigger: gridRef.current,
                    start: 'center center',
                    end: '+=400%',
                    pin: sectionRef.current,
                    scrub: 0.6,
                },
            });

            // 1. Initial grid entry: all images + center video rise from below into grid formation
            tl.from(gridImages, {
                stagger: 0.05,
                y: () => gsap.utils.random(window.innerHeight, window.innerHeight * 1.8),
                ease: 'power2.out',
                duration: 1.6,
            });

            // 2. Pause: everything stays assembled in full formation so the user takes it in
            tl.to({}, { duration: 0.4 });

            // 3. Further scroll: center video scales up smoothly to fill the entire viewport,
            // while surrounding images fade out and recede
            tl.to(
                siblingImages,
                {
                    opacity: 0,
                    scale: 0.85,
                    ease: 'power2.inOut',
                    duration: 1.8,
                },
                'scaleVideo'
            );

            if (videoContainerRef.current) {
                tl.to(
                    videoContainerRef.current,
                    {
                        scale: () => {
                            if (!videoContainerRef.current) return 4.5;
                            const rect = videoContainerRef.current.getBoundingClientRect();
                            const scaleX = window.innerWidth / (rect.width || 1);
                            const scaleY = window.innerHeight / (rect.height || 1);
                            // Ensure 100% viewport coverage in all directions with slight margin
                            return Math.max(scaleX, scaleY) * 1.05;
                        },
                        borderColor: 'rgba(255, 255, 255, 0)',
                        boxShadow: 'none',
                        zIndex: 50,
                        ease: 'power2.inOut',
                        duration: 1.8,
                    },
                    'scaleVideo'
                );
            }

            // 4. Hold full screen video before unpinning to the next section
            tl.to({}, { duration: 0.6 });
        }, sectionRef);

        return () => ctx.revert(); // Cleanup on unmount / hot reload
    }, []);

    return (
        <section ref={sectionRef} className="formation-section">
            {/* Self-contained styles */}
            <style jsx>{`
        .formation-section {
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
          background-color: #090909;
          color: #f5f3ee;
          font-family: inherit;
        }

        .formation-grid {
          grid-area: main;
          display: grid;
          width: 100%;
          height: 100%;
          gap: 0.5rem;
          grid-template-columns: repeat(8, 1fr);
          grid-template-rows: 1fr 1fr 1fr;
        }

        .grid__img {
          background-size: cover;
          background-position: 50% 50%;
          pointer-events: none;
          will-change: transform;
          transform: translateZ(0.1px);
          filter: grayscale(100%);
        }

        /* Newly shuffled grid layout positions */
        /* Row 1 */
        .pos-1 { grid-area: 1 / 1; }
        .pos-2 { grid-area: 1 / 3; }
        .pos-3 { grid-area: 1 / 5; }
        .pos-4 { grid-area: 1 / 6; }
        .pos-5 { grid-area: 1 / 7; }
        .pos-6 { grid-area: 1 / 8; }

        /* Row 2: Center video kept fixed at cols 4 & 5 */
        .pos-7 { grid-area: 2 / 2; }
        .pos-8 { grid-area: 2 / 3; }
        .pos-video {
          grid-area: 2 / 4 / 3 / 6;
          z-index: 5;
          transform-origin: 50% 50%;
          will-change: transform;
          filter: none;
        }
        .pos-9 { grid-area: 2 / 6; }
        .pos-10 { grid-area: 2 / 7; }

        /* Row 3 */
        .pos-11 { grid-area: 3 / 1; }
        .pos-12 { grid-area: 3 / 2; }
        .pos-13 { grid-area: 3 / 4; }
        .pos-14 { grid-area: 3 / 6; }
        .pos-15 { grid-area: 3 / 7; }
        .pos-16 { grid-area: 3 / 8; }
      `}</style>

            {/* Grid of Images & Center Video */}
            <div ref={gridRef} className="formation-grid" data-grid-first>
                {/* 1. Items before video (pos-1 to pos-8: 8 images) */}
                {images.slice(0, 8).map((src, index) => (
                    <div
                        key={`img-pre-${index}`}
                        className={`grid__img pos-${index + 1}`}
                        style={{ backgroundImage: `url("${src}")` }}
                    />
                ))}

                {/* 2. Center Video (scales up on further scroll to fill entire viewport) */}
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
                {images.slice(8, 16).map((src, index) => (
                    <div
                        key={`img-post-${index}`}
                        className={`grid__img pos-${index + 9}`}
                        style={{ backgroundImage: `url("${src}")` }}
                    />
                ))}
            </div>
        </section>
    );
}
