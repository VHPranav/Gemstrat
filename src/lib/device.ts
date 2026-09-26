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
  const cores = nav.hardwareConcurrency ?? 8;
  const memory = nav.deviceMemory ?? 8;
  const saveData = nav.connection?.saveData ?? false;
  cached = cores <= 4 || memory <= 4 || saveData;
  return cached;
}
