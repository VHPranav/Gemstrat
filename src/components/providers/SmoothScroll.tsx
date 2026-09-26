'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { usePerfLite } from '@/lib/usePerfLite';

export default function SmoothScroll() {
  const lite = usePerfLite();
  useEffect(() => {
    // Respect reduced motion; slow devices (lite mode) keep native scrolling
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || lite) return;

    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      duration: 1.25,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.5,
      infinite: false,
    });

    lenis.on('scroll', ScrollTrigger.update);

    const updateTicker = (time: number) => {
      lenis.raf(time * 1000);
    };

    // Prioritised: Lenis moves the page first each tick, then the shared
    // scrollFrame subscribers (src/lib/scrollFrame.ts) react in the same frame
    gsap.ticker.add(updateTicker, false, true);
    // Re-enable lag smoothing: clamps time-jumps from GC pauses / heavy frames
    // to a max of 33ms so animations don't pop forward after a slow frame.
    gsap.ticker.lagSmoothing(500, 33);

    return () => {
      gsap.ticker.remove(updateTicker);
      lenis.destroy();
    };
  }, [lite]);

  return null;
}
