'use client';

// Shared helpers for the scroll scenes on the service pages
// (ServiceTemplate.tsx and the practice variations).

import { useEffect, useRef, type RefObject } from 'react';
import { onScrollFrame } from '@/lib/scrollFrame';
import { setWordStyle } from '@/lib/wordStyle';

export const clamp = (value: number) => Math.max(0, Math.min(1, value));
export const span = (value: number, start: number, end: number) => clamp((value - start) / (end - start));
export const ease = (t: number) => t < .5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
export const words = (text: string) => text.split(' ').map((word, i) => <span key={i} data-w>{word}{' '}</span>);

export const isStill = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
export const isLite = () => document.documentElement.dataset.perf === 'lite';

/** Pixel wipes between sections run on wider screens with motion allowed */
export const wipesOn = () => window.innerWidth > 900 && !isStill();

/**
 * Progress (0→1) through a pinned section: from its top reaching the top of
 * the screen to its end. A section joined to its neighbours by pixel wipes
 * has an extra screen of scroll before (data-lead: it sits revealed under the
 * one above) and/or after (data-trail: it is being wiped away); those don't
 * count towards its own progress.
 */
export function pinned(el: HTMLElement) {
  const vh = window.innerHeight;
  const on = wipesOn();
  const lead = on && el.dataset.lead !== undefined ? vh : 0;
  const trail = on && el.dataset.trail !== undefined ? vh : 0;
  const range = Math.max(1, el.offsetHeight - vh - lead - trail);
  return clamp((-el.getBoundingClientRect().top - lead) / range);
}

/** Words in, each a little after the last */
export function reveal(list: HTMLElement[], amount: number, still = isStill()) {
  list.forEach((word, i) => {
    const start = i / Math.max(1, list.length) * .45;
    const on = still ? 1 : span(amount, start, start + .55);
    setWordStyle(word, on, still ? 0 : (1 - on) * 12, still ? 0 : (1 - on) * 10);
  });
}

/** Run `frame` on every scroll frame, with the element */
export function useFrame(ref: RefObject<HTMLElement | null>, frame: (el: HTMLElement) => void) {
  const latest = useRef(frame);
  useEffect(() => { latest.current = frame; });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return onScrollFrame(() => latest.current(el));
  }, [ref]);
}
