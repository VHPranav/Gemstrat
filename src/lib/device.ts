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
  cached =
    saveData || memory <= 4 || cores <= 4 || (isMobile && cores <= 8) || getGpuTier() !== 'high';
  return cached;
}

// ---------------------------------------------------------------------------
// GPU hints. CPU/RAM say nothing about the GPU: a laptop with 8 cores and 8GB
// can still have weak integrated graphics, or Chrome may have hardware
// acceleration off and be emulating WebGL on the CPU (SwiftShader), which
// freezes the tab on any real 3D scene.
//   'none' = software rendering → skip WebGL entirely
//   'low'  = integrated / mobile GPU → cheapest render path
// ---------------------------------------------------------------------------

export type GpuTier = 'none' | 'low' | 'high';

const SOFTWARE_GPU = /swiftshader|llvmpipe|softpipe|software|basic render|microsoft basic/i;
const LOW_GPU = /intel|mali|adreno|powervr|videocore|radeon\(tm\) graphics|vega \d+ graphics/i;

let gpuCached: GpuTier | null = null;

export function getGpuTier(): GpuTier {
  if (gpuCached !== null) return gpuCached;
  if (typeof document === 'undefined') return 'high';
  try {
    const canvas = document.createElement('canvas');
    const gl = (canvas.getContext('webgl2', { failIfMajorPerformanceCaveat: true }) ||
      canvas.getContext('webgl', { failIfMajorPerformanceCaveat: true })) as WebGLRenderingContext | null;
    if (!gl) {
      gpuCached = 'none';
      return gpuCached;
    }
    const info = gl.getExtension('WEBGL_debug_renderer_info');
    const renderer = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : '';
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    gpuCached = SOFTWARE_GPU.test(renderer) ? 'none' : LOW_GPU.test(renderer) ? 'low' : 'high';
  } catch {
    gpuCached = 'none';
  }
  return gpuCached;
}
