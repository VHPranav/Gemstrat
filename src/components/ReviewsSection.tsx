'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';

interface ReviewItem {
  id: string;
  quote: string;
  author: string;
}

const REVIEWS: ReviewItem[] = [
  {
    id: 'review-1',
    quote:
      '“Gemstrat helped us rethink everything and rebuild fast. What impressed me most was their ability to simplify the complex. We had clarity from Day 1.”',
    author: '— CEO, Fintech Startup (India)',
  },
  {
    id: 'review-2',
    quote:
      '“They operate less like an external agency and more like visionary co-founders. The velocity and technical depth they brought to our product rollout was unmatched.”',
    author: '— Founder & CTO, Enterprise SaaS (US)',
  },
];

const DIRECTORY_LINKS = [
  { num: '01', title: 'ABOUT US', href: '#about' },
  { num: '02', title: 'WHAT WE ENABLE', href: '#enable' },
  { num: '03', title: 'INDUSTRIES WE SHAPE', href: '#industries' },
  { num: '04', title: 'WORK', href: '#work' },
  { num: '05', title: 'FAQS', href: '#faqs' },
  { num: '06', title: 'CONTACT', href: '#contact' },
];

const SOCIAL_NETWORKS = [
  { name: 'LINKEDIN', href: 'https://linkedin.com' },
  { name: 'INSTAGRAM', href: 'https://instagram.com' },
  { name: 'X / TWITTER', href: 'https://x.com' },
  { name: 'YOUTUBE', href: 'https://youtube.com' },
];

export default function ReviewsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const curtainRef = useRef<HTMLDivElement>(null);
  const bgImageRef = useRef<HTMLDivElement>(null);
  const bgTextRef = useRef<HTMLDivElement>(null);

  const review1Ref = useRef<HTMLDivElement>(null);
  const review2Ref = useRef<HTMLDivElement>(null);
  const lastERef = useRef<HTMLSpanElement>(null);

  const footerCurtainRef = useRef<HTMLDivElement>(null);
  const footerTrackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      if (trackRef.current) trackRef.current.style.transform = 'none';
      if (curtainRef.current) curtainRef.current.style.transform = 'none';
      if (bgImageRef.current) bgImageRef.current.style.transform = 'none';
      if (footerCurtainRef.current) footerCurtainRef.current.style.transform = 'none';
      return;
    }

    let rafId: number;

    const alignReviewWithSettle = () => {
      if (!lastERef.current || !review1Ref.current || !review2Ref.current || !trackRef.current) return;

      const trackRect = trackRef.current.getBoundingClientRect();
      const eRect = lastERef.current.getBoundingClientRect();
      const r1Rect = review1Ref.current.getBoundingClientRect();
      const r2Rect = review2Ref.current.getBoundingClientRect();

      // Horizontal coordinate of the last 'e' right edge relative to track
      const eRight = eRect.right - trackRect.left;
      // Horizontal coordinate of Review 1 right edge relative to track
      const r1Right = r1Rect.right - trackRect.left;
      const r2Width = r2Rect.width;

      // Calculate gap between Review 1 and Review 2 so Review 2 right edge aligns exactly with the last 'e' of settle
      const targetGap = eRight - r1Right - r2Width;
      if (targetGap > 0) {
        review2Ref.current.style.marginLeft = `${targetGap}px`;
      }
    };

    const updateAnimation = () => {
      if (!sectionRef.current || !trackRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const viewportH = window.innerHeight;
      const totalScrollable = rect.height - viewportH;

      if (totalScrollable <= 0) return;

      // Overall section progress: 0 to 1
      const progress = Math.min(Math.max(-rect.top / totalScrollable, 0), 1);

      // ===================================================================
      // Phase 1: Horizontal scroll of reviews & headline (progress: 0.0 -> 0.32)
      // ===================================================================
      const p1 = Math.min(Math.max(progress / 0.32, 0), 1);
      const ease1 = p1 * p1 * p1 * (p1 * (p1 * 6 - 15) + 10);

      const scrollDistance = trackRef.current.scrollWidth - window.innerWidth;
      const maxTranslateX = Math.max(scrollDistance, 0);
      const currentTrackX = -ease1 * maxTranslateX;
      trackRef.current.style.transform = `translate3d(${currentTrackX.toFixed(1)}px, 0, 0)`;

      // ===================================================================
      // Phase 2: Review Curtain Slides Left to Reveal BG Image (progress: 0.30 -> 0.62)
      // ===================================================================
      const p2 = Math.min(Math.max((progress - 0.30) / 0.32, 0), 1);
      const ease2 = p2 * p2 * (3 - 2 * p2);

      // The Review Curtain moves to the left: 0% -> -100%
      if (curtainRef.current) {
        const curtainX = -ease2 * 100;
        curtainRef.current.style.transform = `translate3d(${curtainX.toFixed(2)}%, 0, 0)`;
      }

      // Background image counter-parallax and scale depth
      if (bgImageRef.current) {
        const bgParallaxX = (1 - ease2) * 6;
        const bgScale = 1.06 - ease2 * 0.06;
        bgImageRef.current.style.transform = `translate3d(${bgParallaxX.toFixed(2)}%, 0, 0) scale(${bgScale.toFixed(3)})`;
      }

      // Background editorial text fades in as the curtain opens
      if (bgTextRef.current) {
        const textFadeIn = Math.min(Math.max((ease2 - 0.2) / 0.8, 0), 1);
        bgTextRef.current.style.opacity = `${textFadeIn.toFixed(2)}`;
        bgTextRef.current.style.transform = `translate3d(0, ${((1 - textFadeIn) * 16).toFixed(1)}px, 0)`;
      }

      // ===================================================================
      // Phase 3: Footer Curtain Slides from Right Over BG Image (progress: 0.60 -> 1.0)
      // ===================================================================
      const p3 = Math.min(Math.max((progress - 0.60) / 0.40, 0), 1);
      const ease3 = p3 * p3 * (3 - 2 * p3);

      if (footerCurtainRef.current) {
        // Footer curtain slides horizontally from 100% (offscreen right) to 0% (fully covering)
        const footerCurtainX = (1 - ease3) * 100;
        footerCurtainRef.current.style.transform = `translate3d(${footerCurtainX.toFixed(2)}%, 0, 0)`;
      }

      // Internal horizontal glide on footer content for layered parallax feel
      if (footerTrackRef.current) {
        const footerInternalShift = (1 - ease3) * 10; // subtle 10vw counter glide
        footerTrackRef.current.style.transform = `translate3d(${footerInternalShift.toFixed(2)}vw, 0, 0)`;
      }
    };

    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateAnimation);
    };

    const onResize = () => {
      alignReviewWithSettle();
      onScroll();
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });

    alignReviewWithSettle();
    updateAnimation();

    if (typeof document !== 'undefined' && 'fonts' in document) {
      document.fonts.ready.then(() => {
        alignReviewWithSettle();
        updateAnimation();
      });
    }

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full h-[580vh] bg-[#090909] text-white z-40 overflow-visible"
    >
      <div className="sticky top-0 h-screen h-[100svh] w-full flex items-center overflow-hidden bg-[#090909] box-border">

        {/* ========================================================= */}
        {/* Layer 0: Background Image (Stationed Underneath)           */}
        {/* ========================================================= */}
        <div className="absolute inset-0 w-full h-full z-0 overflow-hidden bg-[#090909]">
          <div
            ref={bgImageRef}
            className="relative w-full h-full will-change-transform"
            style={{ transform: 'translate3d(6%, 0, 0) scale(1.06)' }}
          >
            <Image
              src="/images/1010565603896276505.jpeg"
              alt="Gemstrat Vision Portrait"
              fill
              priority
              sizes="100vw"
              className="object-cover object-center filter grayscale contrast-[1.08] brightness-[0.92]"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/35 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent pointer-events-none" />

            <div className="absolute top-8 sm:top-12 right-6 sm:right-12 z-10 flex items-center gap-3">
              <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-white/80 bg-black/40 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10">
                Editorial
              </span>
            </div>

            <div
              ref={bgTextRef}
              className="absolute bottom-10 sm:bottom-14 left-6 sm:left-12 right-6 sm:right-12 z-10 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 will-change-transform"
              style={{ opacity: 0, transform: 'translate3d(0, 16px, 0)' }}
            >
              <div className="flex flex-col max-w-[650px]">
                <span className="font-mono text-[11px] tracking-[0.25em] uppercase text-white/60 mb-2">
                  03 // Architecture of Speed
                </span>
                <h3 className="font-jakarta text-[clamp(1.75rem,3.2vw,48px)] font-normal text-white leading-tight tracking-[-0.03em] m-0">
                  Interesting beats perfect.
                </h3>
                <p className="font-jakarta text-[clamp(0.95rem,1.1vw,17px)] font-light text-[#a1a1aa] leading-[1.5] mt-2 m-0">
                  We partner with founders and enterprise teams doing things no one else is doing.
                </p>
              </div>

              <div className="sm:text-right">
                <span className="font-mono text-[11px] tracking-[0.18em] text-white/50 uppercase block">
                  Curtain Reveal
                </span>
                <span className="font-mono text-[11px] text-white/40 block mt-1">
                  Gemstrat // 2026
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* Layer 1: Reviews Curtain (Slides Off to Left)              */}
        {/* ========================================================= */}
        <div
          ref={curtainRef}
          className="absolute inset-0 w-full h-full bg-[#090909] z-20 shadow-[35px_0_90px_rgba(0,0,0,0.98)] border-r border-white/[0.14] will-change-transform overflow-hidden"
          style={{ transform: 'translate3d(0, 0, 0)' }}
        >
          <div
            ref={trackRef}
            className="h-full flex flex-col justify-between pt-16 sm:pt-20 pb-12 sm:pb-16 will-change-transform pointer-events-none select-none"
            style={{ width: 'max-content', transform: 'translate3d(0, 0, 0)' }}
          >
            {/* Top Row: 2 Reviews Placed Horizontally */}
            <div className="flex flex-row items-start pl-[50vw] sm:pl-[52vw] lg:pl-[54vw] pr-12 lg:pr-16">
              <div
                ref={review1Ref}
                className="w-[85vw] sm:w-[560px] lg:w-[640px] xl:w-[700px] shrink-0 pointer-events-auto"
              >
                <p className="font-jakarta text-[clamp(1.35rem,2.2vw,36px)] font-normal text-[#f4f4f5] leading-[1.38] tracking-[-0.02em] m-0">
                  {REVIEWS[0].quote}
                </p>
                <p className="font-jakarta text-[clamp(1.05rem,1.3vw,22px)] font-normal text-[#9c9ca4] leading-[1.4] tracking-[-0.01em] mt-6 m-0">
                  {REVIEWS[0].author}
                </p>
              </div>

              <div
                ref={review2Ref}
                className="w-[85vw] sm:w-[560px] lg:w-[640px] xl:w-[700px] shrink-0 pointer-events-auto ml-[36vw]"
              >
                <p className="font-jakarta text-[clamp(1.35rem,2.2vw,36px)] font-normal text-[#f4f4f5] leading-[1.38] tracking-[-0.02em] m-0">
                  {REVIEWS[1].quote}
                </p>
                <p className="font-jakarta text-[clamp(1.05rem,1.3vw,22px)] font-normal text-[#9c9ca4] leading-[1.4] tracking-[-0.01em] mt-6 m-0">
                  {REVIEWS[1].author}
                </p>
              </div>
            </div>

            {/* Bottom Row: Giant "Trusted by Teams that don't settle" */}
            <div
              ref={headlineRef}
              className="pl-[6vw] sm:pl-[8vw] lg:pl-[8vw] pr-12 lg:pr-16 shrink-0"
            >
              <h2 className="font-jakarta text-[clamp(4.5rem,13.8vw,268px)] font-normal text-white leading-[0.88] tracking-[-0.04em] whitespace-nowrap m-0">
                <span className="block">Trusted</span>
                <span className="block">
                  by Teams that don&apos;t settl<span ref={lastERef}>e</span>
                </span>
              </h2>
            </div>
          </div>

          <div className="absolute top-0 right-0 w-[1px] h-full bg-gradient-to-b from-transparent via-white/40 to-transparent pointer-events-none" />
        </div>

        {/* ========================================================= */}
        {/* Layer 2: Minimalist Brutalist / Typographic Footer Curtain */}
        {/* Features Giant Kinetic Marquee & Architectural Layout     */}
        {/* ========================================================= */}
        <div
          ref={footerCurtainRef}
          className="absolute inset-0 w-full h-full bg-[#070708] z-30 shadow-[-40px_0_100px_rgba(0,0,0,0.98)] border-l border-white/[0.14] will-change-transform overflow-hidden select-none flex flex-col justify-between"
          style={{ transform: 'translate3d(100%, 0, 0)' }}
        >
          {/* Subtle Left Edge Glow Line */}
          <div className="absolute top-0 left-0 w-[1px] h-full bg-gradient-to-b from-transparent via-white/40 to-transparent pointer-events-none z-20" />

          {/* Embedded Style for Infinite Kinetic Marquee */}
          <style jsx>{`
            @keyframes brutalMarqueeLoop {
              0% {
                transform: translate3d(0, 0, 0);
              }
              100% {
                transform: translate3d(-50%, 0, 0);
              }
            }
            .kinetic-marquee-track {
              display: flex;
              width: max-content;
              animation: brutalMarqueeLoop 24s linear infinite;
              will-change: transform;
            }
            .kinetic-marquee-track:hover {
              animation-play-state: paused;
            }
          `}</style>

          {/* Internal Track Container with Parallax Glide */}
          <div
            ref={footerTrackRef}
            className="w-full h-full flex flex-col justify-between will-change-transform"
          >

            {/* Giant Kinetic Marquee Banner */}
            <div className="w-full border-b border-white/[0.08] overflow-hidden py-3 bg-white/[0.015]">
              <div className="kinetic-marquee-track">
                {[0, 1].map((copyIndex) => (
                  <div key={copyIndex} className="flex items-center shrink-0">
                    <span className="font-jakarta font-extrabold text-[clamp(1.8rem,3.8vw,56px)] tracking-[-0.03em] text-white/90 mr-8">
                      Let&apos;s Build What&apos;s Next
                    </span>
                    <span className="font-mono text-white/30 mr-8">✦</span>
                    <span className="font-jakarta font-extrabold text-[clamp(1.8rem,3.8vw,56px)] tracking-[-0.03em] text-[#71717a] mr-8">
                      Scale What Matters
                    </span>
                    <span className="font-mono text-white/30 mr-8">—</span>
                    <span className="font-jakarta font-extrabold text-[clamp(1.8rem,3.8vw,56px)] tracking-[-0.03em] text-white/90 mr-8">
                      Systems Architecture &amp; Brand Acceleration
                    </span>
                    <span className="font-mono text-white/30 mr-8">✦</span>
                    <span className="font-jakarta font-extrabold text-[clamp(1.8rem,3.8vw,56px)] tracking-[-0.03em] text-[#a1a1aa] mr-8">
                      Gemstrat Global
                    </span>
                    <span className="font-mono text-white/30 mr-8">—</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Middle Section: Brutalist Two-Column Architectural Layout */}
            <div className="w-full flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0">

              {/* Left Column: Monumental Headline & Magnetic Button */}
              <div className="lg:col-span-7 flex flex-col justify-between px-6 sm:px-12 lg:px-16 py-8 sm:py-10 border-b lg:border-b-0 lg:border-r border-white/[0.08]">
                <div>
                  <span className="font-mono text-[10px] tracking-[0.25em] text-[#71717a] uppercase block mb-3">
                    // ARCHITECTURE STATEMENT
                  </span>
                  <h2 className="font-jakarta text-[clamp(2.6rem,6.8vw,104px)] font-black text-white leading-[0.88] tracking-[-0.04em] uppercase m-0">
                    <span className="block">LET&apos;S BUILD</span>
                    <span className="block text-white/95">WHAT&apos;S NEXT,</span>
                    <span className="block text-white/60">TOGETHER.</span>
                  </h2>
                </div>

                <div className="mt-8 pt-4 flex flex-col sm:flex-row items-start sm:items-center gap-6">
                  {/* Brutalist Button with High-Contrast Inversion */}
                  <a
                    href="mailto:ask@gemstrat.com"
                    className="group relative inline-flex items-center justify-center bg-white text-black px-8 sm:px-10 py-4 sm:py-4.5 rounded-none font-mono text-[12px] sm:text-[13px] font-bold tracking-[0.2em] uppercase transition-all duration-300 hover:bg-[#070708] hover:text-white border border-white pointer-events-auto"
                  >
                    <span>GET IN TOUCH</span>
                    <span className="ml-3 inline-block transition-transform duration-300 group-hover:translate-x-1.5 group-hover:-translate-y-0.5">
                      ↗
                    </span>
                  </a>

                  <div className="font-mono text-[10px] tracking-[0.18em] text-[#71717a] uppercase leading-relaxed max-w-[280px]">
                    READY TO CO-FOUND, RETHINK, AND SCALE YOUR SYSTEM ARCHITECTURE.
                  </div>
                </div>
              </div>

              {/* Right Column: Architectural Communication & Directory Matrix */}
              <div className="lg:col-span-5 flex flex-col justify-between divide-y divide-white/[0.08]">

                {/* Direct Transmission Block */}
                <div className="px-6 sm:px-10 lg:px-12 py-8 flex flex-col justify-center">
                  <span className="font-mono text-[10px] tracking-[0.25em] text-[#71717a] uppercase block mb-4">
                    [ 01 // DIRECT TRANSMISSION ]
                  </span>

                  <div className="flex flex-col gap-2">
                    <a
                      href="mailto:ask@gemstrat.com"
                      className="font-jakarta text-[clamp(1.4rem,2.2vw,36px)] font-bold text-white tracking-[-0.02em] hover:text-[#c59b63] transition-colors pointer-events-auto flex items-center justify-between group"
                    >
                      <span>ask@gemstrat.com</span>
                      <span className="font-mono text-[18px] text-[#71717a] group-hover:text-white transition-transform group-hover:translate-x-1 group-hover:-translate-y-1">
                        ↗
                      </span>
                    </a>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/[0.05]">
                      <span className="font-mono text-[clamp(0.95rem,1.2vw,18px)] text-[#a1a1aa] tracking-[0.1em]">
                        +1 647 472 2085
                      </span>
                      <span className="font-mono text-[10px] tracking-[0.15em] text-emerald-400/90 uppercase flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                        EST RESPONSE &lt; 4H
                      </span>
                    </div>
                  </div>
                </div>

                {/* Directory Index Matrix */}
                <div className="px-6 sm:px-10 lg:px-12 py-7 flex-1 flex flex-col justify-center">
                  <span className="font-mono text-[10px] tracking-[0.25em] text-[#71717a] uppercase block mb-3">
                    [ 02 // DIRECTORY INDEX ]
                  </span>

                  <div className="grid grid-cols-2 gap-x-6 gap-y-3 font-mono text-[11px] sm:text-[12px] tracking-[0.16em] uppercase">
                    {DIRECTORY_LINKS.map((link) => (
                      <a
                        key={link.num}
                        href={link.href}
                        className="group flex items-center gap-2 text-[#8e8e93] hover:text-white transition-colors pointer-events-auto py-1"
                      >
                        <span className="text-white/30 text-[10px] group-hover:text-white/70">
                          {link.num}
                        </span>
                        <span className="group-hover:translate-x-0.5 transition-transform">
                          {link.title}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* Bottom Bar: Architectural Metadata & Social Coordinates */}
            <div className="w-full border-t border-white/[0.08] px-6 sm:px-12 lg:px-16 py-4.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono text-[10px] sm:text-[11px] tracking-[0.18em] text-[#71717a] uppercase">
              {/* Copyright & Legal */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <span className="text-white/80">&copy; 2026 GEMSTRAT LTD.</span>
                <span className="text-white/20">/</span>
                <a href="#privacy" className="hover:text-white transition-colors pointer-events-auto">
                  PRIVACY POLICY
                </a>
                <span className="text-white/20">/</span>
                <a href="#terms" className="hover:text-white transition-colors pointer-events-auto">
                  TERMS &amp; CONDITIONS
                </a>
              </div>

              {/* Social Channels in Brutalist Notation */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                {SOCIAL_NETWORKS.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-white transition-colors pointer-events-auto flex items-center gap-1 group"
                  >
                    <span>{item.name}</span>
                    <span className="text-white/40 group-hover:text-white transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
                      ↗
                    </span>
                  </a>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
