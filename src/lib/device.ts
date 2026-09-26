// ---------------------------------------------------------------------------
// Device capability hints, computed once on the client.
// "Low end" = few CPU cores, little memory, or the user asked to save data.
// Used to drop expensive effects (CSS blur, ambient occlusion, shadows) so
// scrolling stays smooth on weaker phones and laptops.
// ---------------------------------------------------------------------------

type NavigatorHints = Navigator & {
  deviceMemory?: number;
  connection?: { saveData?: boolean };
};

let cached: boolean | null = null;

export function isLowEndDevice(): boolean {
  if (cached !== null) return cached;
  if (typeof navigator === 'undefined') return false;
  const nav = navigator as NavigatorHints;
  // Chrome Android always reports hardwareConcurrency as 8 even on mid-range
  // phones. Safari never exposes deviceMemory. Use viewport width as a mobile
  // proxy — narrow screen = mobile = budget GPU/CPU path.
  const cores = nav.hardwareConcurrency ?? 4;
  const memory = nav.deviceMemory ?? 4; // default to 4 (conservative) not 8
  const saveData = nav.connection?.saveData ?? false;
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  // Low-end if: data-saver on, <4GB RAM, <4 cores, OR mobile with ≤8 cores
  // (mobile "8-core" chips are still much slower than desktop per-core)
  cached = saveData || memory <= 4 || cores <= 4 || (isMobile && cores <= 8);
  return cached;
}
