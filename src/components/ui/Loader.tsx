'use client';

import { useEffect, useRef, useState } from 'react';
import { playIntroWhenHeroVisible } from '@/lib/intro';

// ---------------------------------------------------------------------------
// Loader
// A 1 → 100 counter in the centre of the viewport, shown before the hero.
// It counts over COUNT_MS but waits at 99 until the page has finished loading
// (at most MAX_WAIT_MS), then fades out. While it's up, <html> carries
// `is-loading`, which locks scrolling. The hero intro doesn't run under it:
// once the loader is gone it hands over to playIntroWhenHeroVisible().
// ---------------------------------------------------------------------------

const COUNT_MS = 1800;
const COUNT_MS_REDUCED = 500;
const MAX_WAIT_MS = 6000;
const HOLD_MS = 500; // "100" stays on screen before the fade
const FADE_MS = 800;
const GAP_MS = 500; // black pause between the loader and the hero intro

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export default function Loader() {
  const numberRef = useRef<HTMLSpanElement>(null);
  const [leaving, setLeaving] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const countMs = reduceMotion ? COUNT_MS_REDUCED : COUNT_MS;

    // Block wheel / touch / key scrolling (Lenis included) while loading
    const block = (e: Event) => {
      e.preventDefault();
      e.stopImmediatePropagation();
    };
    const blockKeys = (e: KeyboardEvent) => {
      if ([' ', 'PageDown', 'PageUp', 'ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) block(e);
    };
    const opts = { capture: true, passive: false } as const;
    window.addEventListener('wheel', block, opts);
    window.addEventListener('touchmove', block, opts);
    window.addEventListener('keydown', blockKeys, opts);
    const unblock = () => {
      window.removeEventListener('wheel', block, opts);
      window.removeEventListener('touchmove', block, opts);
      window.removeEventListener('keydown', blockKeys, opts);
    };

    let loaded = document.readyState === 'complete';
    const onLoad = () => (loaded = true);
    window.addEventListener('load', onLoad, { once: true });

    const start = performance.now();
    let shown = 1;
    let rafId = 0;
    let holdTimer = 0;
    let fadeTimer = 0;
    let gapTimer = 0;

    const finish = () => {
      if (numberRef.current) numberRef.current.textContent = '100';
      holdTimer = window.setTimeout(() => {
        setLeaving(true);
        // Faded out (the page behind is still black): pause, then start the
        // hero intro. Unmount only after, as unmounting cancels the timers.
        fadeTimer = window.setTimeout(() => {
          gapTimer = window.setTimeout(() => {
            root.classList.remove('is-loading');
            unblock();
            setDone(true);
            playIntroWhenHeroVisible();
          }, GAP_MS);
        }, FADE_MS);
      }, HOLD_MS);
    };

    const tick = (now: number) => {
      const elapsed = now - start;
      const ready = loaded || elapsed >= MAX_WAIT_MS;
      const t = Math.min(Math.max(elapsed / countMs, 0), 1);
      // Hold at 99 until the page is ready
      const target = Math.min(1 + Math.floor(easeInOut(t) * 99), ready ? 100 : 99);
      if (target !== shown && numberRef.current) {
        shown = target;
        numberRef.current.textContent = String(target);
      }
      if (t >= 1 && ready) {
        finish();
        return;
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      window.clearTimeout(holdTimer);
      window.clearTimeout(fadeTimer);
      window.clearTimeout(gapTimer);
      window.removeEventListener('load', onLoad);
      unblock();
      root.classList.remove('is-loading');
    };
  }, []);

  if (done) return null;
  return (
    <div
      className="site-loader"
      style={{ opacity: leaving ? 0 : 1, transition: `opacity ${FADE_MS}ms ease` }}
      aria-hidden="true"
    >
      <span ref={numberRef} className="site-loader__number">
        1
      </span>
    </div>
  );
}
