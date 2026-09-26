'use client';

import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

// three.js sculpture loads after the page is interactive (its canvas fades in
// anyway), so it never delays the hero's first paint
const HeroSculpture = dynamic(() => import('@/components/ui/HeroSculpture'), { ssr: false });
import { onScrollFrame } from '@/lib/scrollFrame';

// ---------------------------------------------------------------------------
// HeroBackdrop
// Shared background for the Hero and the Statement section: the sculpture sits
// in a sticky, full-screen layer (taking no space in the flow), so the hero's
// content scrolls away and the Statement scrolls in over the same rotating
// sculpture. It stays at full strength while any of the Statement's words are
// still visible, and only fades out once the quote has fully dissolved.
// ---------------------------------------------------------------------------

// Intro timing: sculpture fades in last, after heading, navbar, and cookie banner
const SCULPTURE_START = 1.95;
// Fade window in the Statement's own scroll progress (0 = its sticky locks,
// 1 = it ends). Its words finish dissolving at 0.82 (see Statement.tsx), so
// the sculpture fades from there to the end of the section.
const FADE_START = 0.82;
const FADE_END = 1;

export default function HeroBackdrop({ children }: { children: React.ReactNode }) {
  const dimRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [loadSculpture, setLoadSculpture] = useState(false);

  useEffect(() => {
    // Postpone heavy WebGL & Three.js shader compilation until after
    // the heading and navbar text entrance has smoothly finished
    const timer = setTimeout(() => setLoadSculpture(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const el = dimRef.current;
    if (!el) return;
    const update = () => {
      // The Statement is the last child; measure its scroll progress the same
      // way Statement.tsx does
      const statement = contentRef.current?.lastElementChild;
      let opacity = 1;
      if (statement) {
        const rect = statement.getBoundingClientRect();
        const total = rect.height - window.innerHeight;
        const p = total > 0 ? Math.min(Math.max(-rect.top / total, 0), 1) : 0;
        const t = Math.min(Math.max((p - FADE_START) / (FADE_END - FADE_START), 0), 1);
        opacity = 1 - t * t * (3 - 2 * t);
      }
      el.style.opacity = opacity.toFixed(3);
      // Fully faded: take it out of layout so the sculpture's own visibility
      // check pauses rendering until the user scrolls back up
      el.style.display = opacity <= 0.001 ? 'none' : '';
    };
    return onScrollFrame(update);
  }, []);

  return (
    <div className="relative bg-[#090909]">
      {/* Sticky full-screen layer; the negative margin removes it from the flow
          so the sections start at the top and scroll over it */}
      <div className="sticky top-0 h-screen h-[100svh] -mb-[100vh] -mb-[100svh] z-0 pointer-events-none overflow-hidden">
        <div ref={dimRef} className="absolute inset-0">
          <div
            className="hero-sculpture-in absolute inset-0"
            style={{ animationDelay: `${SCULPTURE_START}s` }}
          >
            {loadSculpture && <HeroSculpture className="absolute inset-0" />}
          </div>
        </div>
      </div>
      <div ref={contentRef} className="relative z-10">
        {children}
      </div>
    </div>
  );
}
