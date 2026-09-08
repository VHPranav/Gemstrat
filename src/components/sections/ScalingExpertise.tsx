'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import BeamField from '@/components/ui/BeamField';

const PARAGRAPH_TEXT =
  "With over two decades of experience in enterprise architecture, marketing, and technology, Deepak has built and scaled businesses across continents. As the creator of Webzgo and the Convergence Suite, he brings a rare blend of systems thinking, brand strategy, and tech innovation — driving transformation at Gemstrat with hands-on leadership and expert teams assembled for each client's needs.";

const PARAGRAPH_WORDS = PARAGRAPH_TEXT.split(' ');

export default function ScalingExpertise() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const imageBoxRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const paraRef = useRef<HTMLDivElement>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      if (imageBoxRef.current) {
        imageBoxRef.current.style.transform = 'none';
      }
      if (headingRef.current) {
        headingRef.current.style.opacity = '1';
        headingRef.current.style.transform = 'none';
      }
      if (paraRef.current) {
        paraRef.current.style.opacity = '1';
        paraRef.current.style.transform = 'none';
      }
      wordRefs.current.forEach((span) => {
        if (span) {
          span.style.opacity = '1';
          span.style.filter = 'none';
          span.style.transform = 'none';
        }
      });
      return;
    }

    let rafId: number;

    const updateAnimation = () => {
      if (!sectionRef.current || !imageBoxRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const viewportH = window.innerHeight;
      const viewportW = window.innerWidth;

      // Distance scrolled since section top first enters the bottom of the viewport
      // (scrolledIntoView = 0 at moment of entry, starts scaling down immediately)
      const scrolledIntoView = viewportH - rect.top;

      // On mobile screens (< 768px), keep layout natural
      if (viewportW < 768) {
        imageBoxRef.current.style.transform = 'none';
        if (headingRef.current) {
          headingRef.current.style.opacity = '1';
          headingRef.current.style.transform = 'none';
        }
        wordRefs.current.forEach((span) => {
          if (span) {
            span.style.opacity = '1';
            span.style.filter = 'none';
            span.style.transform = 'none';
          }
        });
        return;
      }

      // ==========================================================
      // Immediate Scroll-Dependent Scaling & Entrance:
      // Starts scaling down the instant the image enters the viewport!
      // Everything is directly tied to scroll position without waiting.
      // ==========================================================
      const transitionDistance = viewportH * 1.45;
      const p = Math.min(Math.max(scrolledIntoView / transitionDistance, 0), 1);

      // Silky smootherstep ease
      const ease = p * p * p * (p * (p * 6 - 15) + 10);

      // Photo: 50vw wide on left, scaling down to reference grid size
      const naturalWidth = imageBoxRef.current.offsetWidth || 470;
      const naturalLeft = imageBoxRef.current.getBoundingClientRect().left;

      const targetStartWidth = viewportW * 0.50;
      const startScale = Math.max(targetStartWidth / naturalWidth, 1.25);
      const currentScale = startScale - ease * (startScale - 1.0);

      const startOffsetX = -naturalLeft;
      const currentOffsetX = startOffsetX * (1 - ease);

      imageBoxRef.current.style.transform = `translate3d(${currentOffsetX.toFixed(1)}px, 0, 0) scale(${currentScale.toFixed(4)})`;

      // Heading: Rises UPWARD from bottom-right (Frame 1 peeking tips -> Frame 3 docked)
      if (headingRef.current) {
        const startHeadingY = Math.min(viewportH * 0.65, 480);
        const currentHeadingY = (1 - ease) * startHeadingY;
        const headingOpacity = 0.70 + ease * 0.30;

        headingRef.current.style.opacity = headingOpacity.toFixed(3);
        headingRef.current.style.transform = `translate3d(0, ${currentHeadingY.toFixed(1)}px, 0)`;
      }

      // ==========================================================
      // Paragraph: Word-by-Word Blur-Up In (Strictly Sequential / Non-Random)
      // Words blur up in order from 0 to N as the user scrolls
      // ==========================================================
      const totalWords = PARAGRAPH_WORDS.length;
      const startPhase = 0.35;
      const endPhase = 0.92;
      const windowSize = 0.08;
      const activeSpread = endPhase - startPhase - windowSize;

      wordRefs.current.forEach((span, i) => {
        if (!span) return;
        // Strictly sequential index (not random)
        const wordStart = startPhase + (i / (totalWords - 1 || 1)) * activeSpread;
        const wordEnd = wordStart + windowSize;

        const wordP = Math.min(Math.max((p - wordStart) / (wordEnd - wordStart), 0), 1);

        const opacity = wordP;
        const blur = (1 - wordP) * 16;
        const translateY = (1 - wordP) * 20;

        span.style.opacity = opacity.toFixed(3);
        span.style.filter = blur > 0.05 ? `blur(${blur.toFixed(1)}px)` : 'none';
        span.style.transform = `translate3d(0, ${translateY.toFixed(1)}px, 0)`;
      });
    };

    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateAnimation);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    updateAnimation();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full h-[230vh] bg-[#090909] text-white z-30 overflow-visible"
    >
      <div className="sticky top-0 h-screen h-[100svh] w-full flex items-center overflow-hidden bg-[#090909] box-border">
        {/* 100vh Ambient BeamField: Vertical Family */}
        <BeamField
          family="vertical"
          theme="inkSoft"
          count={10}
          w={1600}
          h={1000}
          staticOpacity={0.03}
          className="opacity-25 pointer-events-none"
        />

        <div className="relative z-10 w-full max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-14 xl:px-16 flex flex-col justify-center">

          {/* Reference Grid: Row 1 = Photo + Heading (Bottom-aligned), Row 2 = Paragraph */}
          <div className="w-full grid grid-cols-1 md:grid-cols-[auto_1fr] gap-x-8 lg:gap-x-12 xl:gap-x-16 gap-y-6 sm:gap-y-8 lg:gap-y-10 items-end">

            {/* Row 1, Col 1: Photo (Aspect 12/13, matching reference) */}
            <div className="shrink-0 flex justify-start">
              <div
                ref={imageBoxRef}
                className="relative w-[280px] sm:w-[360px] md:w-[420px] lg:w-[470px] xl:w-[510px] aspect-[12/13] overflow-hidden shadow-2xl bg-black border border-white/10 will-change-transform"
                style={{
                  transformOrigin: 'top left',
                }}
              >
                <Image
                  src="/images/698128379778759116.jpeg"
                  alt="What a privilege it is to be exhausted by a challenge you chose for yourself"
                  fill
                  sizes="(max-width: 768px) 340px, (max-width: 1200px) 480px, 560px"
                  className="object-cover pointer-events-none select-none"
                  priority
                />
              </div>
            </div>

            {/* Row 1, Col 2: Heading (Bottom-aligned with photo, Right-aligned text) */}
            <div
              ref={headingRef}
              className="flex flex-col justify-end items-end text-right will-change-[transform,opacity]"
            >
              <h2 className="font-jakarta text-[clamp(4.5rem,13vw,230px)] font-normal text-white leading-[0.86] tracking-[-0.04em] text-right m-0 w-full">
                <span className="block">Scaling</span>
                <span className="block">Expertise</span>
              </h2>
            </div>

            {/* Row 2, Col 1: Empty space under photo */}
            <div className="hidden md:block" />

            {/* Row 2, Col 2: Paragraph directly under 'Expertise' (Word-by-word blur-up in) */}
            <div
              ref={paraRef}
              className="flex flex-col items-end w-full"
            >
              <p className="font-jakarta text-[clamp(1.15rem,1.75vw,24px)] font-normal text-[#d4d4d8] leading-[1.42] tracking-[-0.02em] max-w-[920px] text-left m-0 w-full">
                {PARAGRAPH_WORDS.map((word, wIdx) => (
                  <span
                    key={wIdx}
                    ref={(el) => {
                      wordRefs.current[wIdx] = el;
                    }}
                    className="inline-block mr-[0.28em] last:mr-0 will-change-[opacity,filter,transform] opacity-0"
                    style={{
                      transform: 'translate3d(0, 20px, 0)',
                      filter: 'blur(16px)',
                    }}
                  >
                    {word}
                  </span>
                ))}
              </p>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
