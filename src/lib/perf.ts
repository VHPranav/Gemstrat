// ---------------------------------------------------------------------------
// Performance mode: 'full' (every effect) or 'lite' (no WebGL, no pixel FX,
// no image trail, no CSS blur, native scroll).
//
// GPU name lists (device.ts) only catch known-weak hardware, so the real
// safety net is a watchdog that measures the frame rate this device actually
// achieves: if the page stays under ~20fps, it switches to lite on the spot
// (components tear their effects down) and remembers it for the next visit.
//
// Manual overrides for testing: ?lite forces lite, ?full forces full (and
// clears a remembered lite).
// ---------------------------------------------------------------------------

import { getGpuTier } from '@/lib/device';

export type PerfMode = 'full' | 'lite';

const STORAGE_KEY = 'gemstrat:perf-lite';
const REMEMBER_MS = 7 * 24 * 60 * 60 * 1000;

// Watchdog: a window is "slow" if its frames average slower than this (≈20fps)
const SLOW_AVG_MS = 50;
const WINDOW_MS = 2000;
// Consecutive slow windows before switching (one-off stalls like shader
// compiles or image decodes only spoil a single window)
const SLOW_WINDOWS = 2;
// Ignore the first moments after load (fonts, hydration, first compiles)
const GRACE_MS = 1500;

let mode: PerfMode | null = null;
let reason = '';
const listeners = new Set<() => void>();

function readOverride(): PerfMode | null {
  const params = new URLSearchParams(window.location.search);
  if (params.has('lite')) return 'lite';
  if (params.has('full')) return 'full';
  return null;
}

function readRemembered(): boolean {
  try {
    const at = Number(window.localStorage.getItem(STORAGE_KEY));
    return at > 0 && Date.now() - at < REMEMBER_MS;
  } catch {
    return false;
  }
}

function applyToDocument(m: PerfMode) {
  document.documentElement.dataset.perf = m;
}

export function getPerfMode(): PerfMode {
  if (mode !== null) return mode;
  if (typeof window === 'undefined') return 'full';
  const override = readOverride();
  if (override === 'full') {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }
  if (override) {
    mode = override;
    reason = 'url';
  } else if (getGpuTier() === 'none') {
    mode = 'lite';
    reason = 'software-gpu';
  } else if (readRemembered()) {
    mode = 'lite';
    reason = 'remembered';
  } else {
    mode = 'full';
  }
  applyToDocument(mode);
  return mode;
}

export function getPerfReason(): string {
  return reason;
}

/** Switch the whole page to lite mode (idempotent). */
export function setLite(why: string) {
  if (getPerfMode() === 'lite') return;
  mode = 'lite';
  reason = why;
  applyToDocument(mode);
  if (readOverride() !== 'full') {
    try {
      window.localStorage.setItem(STORAGE_KEY, String(Date.now()));
    } catch {}
  }
  listeners.forEach((l) => l());
}

export function onPerfModeChange(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Frame-rate watchdog. Returns a stop function. */
export function startPerfWatchdog(onSample?: (fps: number) => void): () => void {
  let rafId = 0;
  let last = 0;
  let windowStart = 0;
  let frames = 0;
  let slowWindows = 0;
  const startedAt = performance.now();
  const forced = readOverride() === 'full';

  const reset = () => {
    last = 0;
    windowStart = 0;
    frames = 0;
  };
  // A hidden tab stops rAF; the gap on return is not a slow frame
  const onVisibility = () => reset();
  document.addEventListener('visibilitychange', onVisibility);

  const tick = (now: number) => {
    rafId = requestAnimationFrame(tick);
    if (now - startedAt < GRACE_MS) return;
    if (!last) {
      last = now;
      windowStart = now;
      return;
    }
    last = now;
    frames++;
    const elapsed = now - windowStart;
    if (elapsed < WINDOW_MS) return;
    const avg = elapsed / frames;
    onSample?.(1000 / avg);
    slowWindows = avg > SLOW_AVG_MS ? slowWindows + 1 : 0;
    windowStart = now;
    frames = 0;
    if (slowWindows >= SLOW_WINDOWS && !forced && getPerfMode() === 'full') {
      setLite(`slow-frames (${Math.round(1000 / avg)}fps)`);
    }
  };
  rafId = requestAnimationFrame(tick);
  return () => {
    cancelAnimationFrame(rafId);
    document.removeEventListener('visibilitychange', onVisibility);
  };
}
