'use client';

import { useCallback, useEffect, useRef, type RefObject } from 'react';
import {
  setFrameRate,
  setMaxDpr,
  type ImageGenerationCycleEvent,
  type ImageGenerationHandle,
} from 'img-fx';

// ---------------------------------------------------------------------------
// usePixelSwapScheduler
// Drives a grid of <ImageGeneration> tiles:
// - Nothing pixelates until the grid is fully in view: either `viewRef` is
//   fully on screen, or — for grids animated by scroll (pinned / 3D entry) —
//   the caller drives it with `setActive()`.
// - At most 3 tiles pixelate at once: 1 random pair + 1 hovered tile.
// - The random pair swaps images with each other, both at the same moment.
// - A hovered tile pixelates and re-forms into its own image.
//
// img-fx picks the next image from its pool on its own; `excludeSrcs` is used
// to exclude everything except the tile's assigned src, forcing the pick.
// ---------------------------------------------------------------------------

type Slot = 'random' | 'hover';

interface Options {
  /** Image each tile starts with (index-aligned with the tiles). */
  initialSrcs: string[];
  /** The `images` pool passed to every tile — must contain every initial src. */
  pool: string[];
  /** Element that must be fully in the viewport for the effect to run.
   *  Omit it to drive the effect manually with `setActive()`. */
  viewRef?: RefObject<HTMLElement | null>;
  /** Minimum gap between the starts of consecutive random pairs. */
  intervalMs?: number;
  swapDurationMs?: number;
  hoverDurationMs?: number;
}

// Fraction of the element's HEIGHT that must be on screen. Measured vertically
// only: a `100vw` element is wider than the viewport by the scrollbar, so its
// area ratio never reaches 1.
const FULL_VIEW_RATIO = 0.98;
const OBSERVER_THRESHOLDS = Array.from({ length: 101 }, (_, i) => i / 100);
// Safety net in case the `visible` cycle event never arrives
const RELEASE_FALLBACK_MS = 4000;
// How often the scheduler checks whether the next random pair may start
const TICK_MS = 200;

export function usePixelSwapScheduler({
  initialSrcs,
  pool,
  viewRef,
  intervalMs = 3000,
  swapDurationMs = 1400,
  hoverDurationMs = 1200,
}: Options) {
  const handlesRef = useRef<(ImageGenerationHandle | null)[]>([]);
  // Image each tile shows (or is currently transitioning to)
  const srcsRef = useRef<string[]>([...initialSrcs]);
  const busyRef = useRef<Map<number, Slot>>(new Map());
  // Tiles waiting for their re-measure before being primed
  const primingRef = useRef<Set<number>>(new Set());
  const releaseTimersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());
  // True while the grid is fully in view — the effect only runs then
  const activeRef = useRef(false);
  const tileCount = initialSrcs.length;

  const release = useCallback((index: number) => {
    busyRef.current.delete(index);
    const timer = releaseTimersRef.current.get(index);
    if (timer) clearTimeout(timer);
    releaseTimersRef.current.delete(index);
  }, []);

  // Tiles start static (no image revealed), and triggerRegenerate only works on
  // a revealed image. Reveal each tile's own image once so it is ready to churn;
  // since it is the same image as the static layer underneath, this is invisible.
  //
  // img-fx sizes its canvas from getBoundingClientRect() and only re-measures on
  // resize or when the child's class/style changes. A tile that mounted while
  // transformed (e.g. GSAP's squashed 3D entry state) keeps that size and draws
  // a vertically stretched image. Touch the child's style to force a re-measure
  // (it runs on the next frame), then reveal once it has.
  const primeTiles = useCallback(() => {
    const pending: number[] = [];
    handlesRef.current.forEach((handle, i) => {
      if (!handle || busyRef.current.has(i) || primingRef.current.has(i)) return;
      if (handle.isImageActive()) return;
      handle.element
        ?.querySelector<HTMLElement>('.image-gen-child > *')
        ?.style.setProperty('--fx-remeasure', String(performance.now()));
      primingRef.current.add(i);
      pending.push(i);
    });
    if (pending.length === 0) return;

    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        pending.forEach((i) => {
          primingRef.current.delete(i);
          const handle = handlesRef.current[i];
          if (!handle || busyRef.current.has(i) || handle.isImageActive()) return;
          handle.triggerReveal({ hold: 'manual' });
        });
      })
    );
  }, []);

  const startChurn = useCallback(
    (index: number, slot: Slot, durationMs: number) => {
      const handle = handlesRef.current[index];
      if (!handle) return;
      busyRef.current.set(index, slot);
      releaseTimersRef.current.set(
        index,
        setTimeout(() => release(index), durationMs + RELEASE_FALLBACK_MS)
      );
      handle.triggerRegenerate({ durationMs, tintFromImage: false, autoReveal: true });
    },
    [release]
  );

  // Track when the section is fully in view (and prime tiles as it approaches)
  useEffect(() => {
    const el = viewRef?.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        activeRef.current =
          entry.isIntersecting &&
          entry.intersectionRect.height >= entry.boundingClientRect.height * FULL_VIEW_RATIO;
        if (entry.isIntersecting) primeTiles();
      },
      { threshold: OBSERVER_THRESHOLDS }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [viewRef, primeTiles]);

  // 60 FPS renderer + periodic random pair swap
  useEffect(() => {
    try {
      setFrameRate(60);
      setMaxDpr(window.devicePixelRatio > 2 ? 1.5 : 1.25);
    } catch {
      // WebGL unavailable — silent no-op
    }

    // A full swap (churn + reveal dissolve) can outlast `intervalMs`, so poll
    // and start the next pair once the gap has passed AND the last pair is done.
    const releaseTimers = releaseTimersRef.current;
    const busy = busyRef.current;
    let lastPairAt = -Infinity;
    const interval = setInterval(() => {
      if (!activeRef.current) return;
      primeTiles();

      if (performance.now() - lastPairAt < intervalMs) return;
      // Only one random pair at a time
      for (const slot of busyRef.current.values()) if (slot === 'random') return;

      const free = Array.from({ length: tileCount }, (_, i) => i)
        .filter((i) => !busyRef.current.has(i) && handlesRef.current[i]?.isImageActive())
        .sort(() => Math.random() - 0.5);
      if (free.length < 2) return;

      const [a, b] = free;
      const srcs = srcsRef.current;
      [srcs[a], srcs[b]] = [srcs[b], srcs[a]];

      lastPairAt = performance.now();
      startChurn(a, 'random', swapDurationMs);
      startChurn(b, 'random', swapDurationMs);
    }, TICK_MS);

    return () => {
      clearInterval(interval);
      releaseTimers.forEach(clearTimeout);
      releaseTimers.clear();
      busy.clear();
    };
  }, [tileCount, intervalMs, swapDurationMs, primeTiles, startChurn]);

  // Hover: only one hovered tile at a time, never one of the random pair
  const onTileHover = useCallback(
    (index: number) => {
      if (!activeRef.current) return;
      if (busyRef.current.has(index)) return;
      for (const slot of busyRef.current.values()) if (slot === 'hover') return;
      if (!handlesRef.current[index]?.isImageActive()) return;
      startChurn(index, 'hover', hoverDurationMs);
    },
    [hoverDurationMs, startChurn]
  );

  // Props to spread onto each tile's <ImageGeneration>
  const tileProps = (index: number) => ({
    ref: (handle: ImageGenerationHandle | null) => {
      handlesRef.current[index] = handle;
    },
    images: pool,
    excludeSrcs: () => pool.filter((src) => src !== srcsRef.current[index]),
    onCycle: (event: ImageGenerationCycleEvent) => {
      if (event.phase !== 'visible') return;
      release(index);
      // Keep the static layers under the canvas in sync with the revealed
      // image, so churn gaps never flash the tile's original picture.
      const root = handlesRef.current[index]?.element;
      if (!root || !event.src) return;
      const url = `url("${event.src}")`;
      if (root.parentElement) root.parentElement.style.backgroundImage = url;
      const child = root.querySelector<HTMLElement>('.image-gen-child > *');
      if (child) child.style.backgroundImage = url;
    },
  });

  const setActive = useCallback(
    (active: boolean) => {
      if (active && !activeRef.current) primeTiles();
      activeRef.current = active;
    },
    [primeTiles]
  );

  return { tileProps, onTileHover, setActive };
}
