// ---------------------------------------------------------------------------
// whenIdle
// Run `cb` once the browser is idle, starting `delay` ms after page load (so the
// hero's own loading and first paint go first), or `timeout` ms after that at
// the latest. Used to prepare below-the-fold sections (images, WebGL set-up)
// in the background, so neither the initial load nor the moment you scroll
// into them has to pay for it.
// ---------------------------------------------------------------------------

type IdleWindow = Window & {
  requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
  cancelIdleCallback?: (id: number) => void;
};

export function whenIdle(cb: () => void, timeout = 3000, delay = 2000): () => void {
  const w = window as IdleWindow;
  let idleId = 0;
  let timer = 0;
  let delayTimer = 0;
  const schedule = () => {
    if (w.requestIdleCallback) idleId = w.requestIdleCallback(cb, { timeout });
    else timer = window.setTimeout(cb, Math.min(timeout, 1500));
  };
  const afterLoad = () => {
    delayTimer = window.setTimeout(schedule, delay);
  };
  if (document.readyState === 'complete') afterLoad();
  else window.addEventListener('load', afterLoad, { once: true });
  return () => {
    window.removeEventListener('load', afterLoad);
    if (delayTimer) window.clearTimeout(delayTimer);
    if (idleId && w.cancelIdleCallback) w.cancelIdleCallback(idleId);
    if (timer) window.clearTimeout(timer);
  };
}
