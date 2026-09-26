'use client';

import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
// Types only: the img-fx runtime (and three.js with it) is loaded on demand
import type { ImageGenerationCycleEvent, ImageGenerationHandle } from 'img-fx';
import { isLowEndDevice } from '@/lib/device';
import { onScrollFrame } from '@/lib/scrollFrame';

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
// Scrolling must have paused this long before a new pair starts
const SCROLL_SETTLE_MS = 350;
// How long a tile stays live after its transition finishes before re-pausing
const PAUSE_AFTER_MS = 400;

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
  const releaseTimersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());
  // True while the grid is fully in view — the effect only runs then
  const activeRef = useRef(false);
  const tileCount = initialSrcs.length;

  // Tiles are kept PAUSED unless transitioning. A paused img-fx tile skips all
  // rendering (its canvas keeps the last frame), and with every tile paused
  // the library's render loop stops entirely — so the idle grid costs nothing
  // per frame instead of redrawing 16 invisible canvases at 60fps.
  const [liveTiles, setLiveTiles] = useState<ReadonlySet<number>>(() => new Set());
  const setLive = useCallback((index: number, live: boolean) => {
    setLiveTiles((prev) => {
      if (prev.has(index) === live) return prev;
      const next = new Set(prev);
      if (live) next.add(index);
      else next.delete(index);
      return next;
    });
  }, []);

  const release = useCallback(
    (index: number) => {
      busyRef.current.delete(index);
      const timer = releaseTimersRef.current.get(index);
      if (timer) clearTimeout(timer);
      releaseTimersRef.current.delete(index);
      // Let the final frame paint, then pause the tile again
      setTimeout(() => {
        if (!busyRef.current.has(index)) setLive(index, false);
      }, PAUSE_AFTER_MS);
    },
    [setLive]
  );

  // Start a pixel transition on one tile.
  // - Already-revealed tiles churn (triggerRegenerate) into their next image.
  // - Fresh tiles (nothing revealed yet) run a reveal instead — itself a pixel
  //   dissolve into the target image, so it looks the same. This replaces the
  //   old "prime all 16 tiles up front", which ran 16 simultaneous reveals (each
  //   reading pixels back from the GPU every frame) exactly as the section
  //   scrolled in — the main source of scroll jank here.
  //
  // img-fx sizes its canvas from getBoundingClientRect() and only re-measures on
  // resize or when the child's class/style changes, so a tile that mounted
  // while transformed keeps a stale size. Touch the child's style to force a
  // re-measure (it runs next frame) before a fresh tile's first reveal.
  const startTransition = useCallback(
    (index: number, slot: Slot, durationMs: number) => {
      const handle = handlesRef.current[index];
      if (!handle) return;
      busyRef.current.set(index, slot);
      releaseTimersRef.current.set(
        index,
        setTimeout(() => release(index), durationMs + RELEASE_FALLBACK_MS)
      );
      // Unpause first — img-fx ignores triggers while a tile is paused — and
      // wait until the tile reports it's live before triggering
      setLive(index, true);
      let tries = 0;
      const whenLive = () => {
        const h = handlesRef.current[index];
        if (!h) return;
        if (h.element?.dataset.paused === 'true' && tries++ < 30) {
          requestAnimationFrame(whenLive);
          return;
        }
        if (h.isImageActive()) {
          h.triggerRegenerate({ durationMs, tintFromImage: false, autoReveal: true });
          return;
        }
        h.element
          ?.querySelector<HTMLElement>('.image-gen-child > *')
          ?.style.setProperty('--fx-remeasure', String(performance.now()));
        requestAnimationFrame(() =>
          requestAnimationFrame(() => handlesRef.current[index]?.triggerReveal({ hold: 'manual' }))
        );
      };
      requestAnimationFrame(whenLive);
    },
    [release, setLive]
  );

  // Track when the section is fully in view
  useEffect(() => {
    const el = viewRef?.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        activeRef.current =
          entry.isIntersecting &&
          entry.intersectionRect.height >= entry.boundingClientRect.height * FULL_VIEW_RATIO;
      },
      { threshold: OBSERVER_THRESHOLDS }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [viewRef]);

  // 60 FPS renderer + periodic random pair swap
  useEffect(() => {
    try {
      // Loaded lazily so three.js stays off the critical path; 30fps on
      // low-end devices
      import('img-fx')
        .then(({ setFrameRate, setMaxDpr }) => {
          setFrameRate(isLowEndDevice() ? 30 : 60);
          setMaxDpr(isLowEndDevice() ? 1 : window.devicePixelRatio > 2 ? 1.5 : 1.25);
        })
        .catch(() => {
          // WebGL/img-fx unavailable — tiles keep their static images
        });
    } catch {
      // WebGL unavailable — silent no-op
    }

    // A full swap (churn + reveal dissolve) can outlast `intervalMs`, so poll
    // and start the next pair once the gap has passed AND the last pair is done.
    const releaseTimers = releaseTimersRef.current;
    const busy = busyRef.current;
    let lastPairAt = -Infinity;
    // New pairs only start once scrolling has paused, so their start-up cost
    // never lands mid-scroll (running transitions just finish)
    let lastScrollAt = 0;
    const unsubscribeScroll = onScrollFrame(() => {
      lastScrollAt = performance.now();
    });
    const interval = setInterval(() => {
      if (!activeRef.current) return;
      const now = performance.now();
      if (now - lastScrollAt < SCROLL_SETTLE_MS) return;
      if (now - lastPairAt < intervalMs) return;
      // Only one random pair at a time
      for (const slot of busyRef.current.values()) if (slot === 'random') return;

      const free = Array.from({ length: tileCount }, (_, i) => i)
        .filter((i) => !busyRef.current.has(i) && handlesRef.current[i])
        .sort(() => Math.random() - 0.5);
      if (free.length < 2) return;

      // Pair tiles in the same state (both fresh → both reveal, both revealed →
      // both churn) so the two transitions stay in step
      const a = free[0];
      const aActive = handlesRef.current[a]!.isImageActive();
      const b =
        free.slice(1).find((i) => handlesRef.current[i]!.isImageActive() === aActive) ?? free[1];
      const srcs = srcsRef.current;
      [srcs[a], srcs[b]] = [srcs[b], srcs[a]];

      lastPairAt = performance.now();
      startTransition(a, 'random', swapDurationMs);
      startTransition(b, 'random', swapDurationMs);
    }, TICK_MS);

    return () => {
      clearInterval(interval);
      unsubscribeScroll();
      releaseTimers.forEach(clearTimeout);
      releaseTimers.clear();
      busy.clear();
    };
  }, [tileCount, intervalMs, swapDurationMs, startTransition]);

  // Hover: only one hovered tile at a time, never one of the random pair
  const onTileHover = useCallback(
    (index: number) => {
      if (!activeRef.current) return;
      if (busyRef.current.has(index)) return;
      for (const slot of busyRef.current.values()) if (slot === 'hover') return;
      if (!handlesRef.current[index]) return;
      startTransition(index, 'hover', hoverDurationMs);
    },
    [hoverDurationMs, startTransition]
  );

  // Props to spread onto each tile's <ImageGeneration>
  const tileProps = (index: number) => ({
    ref: (handle: ImageGenerationHandle | null) => {
      handlesRef.current[index] = handle;
    },
    images: pool,
    paused: !liveTiles.has(index),
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

  const setActive = useCallback((active: boolean) => {
    activeRef.current = active;
  }, []);

  return { tileProps, onTileHover, setActive };
}
