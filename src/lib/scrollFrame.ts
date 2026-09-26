import gsap from 'gsap';

// ---------------------------------------------------------------------------
// scrollFrame
// One shared per-frame scroll loop for all scroll-driven sections.
//
// Lenis moves the page inside gsap.ticker (see SmoothScroll, which registers
// first/prioritised). Subscribers here run in the SAME tick, right after, so
// effects are locked to the scroll position — no one-frame lag from waiting on
// a separate 'scroll' event + requestAnimationFrame. Callbacks only run when
// the scroll position or viewport actually changed.
// ---------------------------------------------------------------------------

type Callback = () => void;

const callbacks = new Set<Callback>();
let lastY = Number.NaN;
let lastW = 0;
let lastH = 0;
let dirty = true;

function tick() {
  const y = window.scrollY;
  const w = window.innerWidth;
  const h = window.innerHeight;
  if (!dirty && y === lastY && w === lastW && h === lastH) return;
  dirty = false;
  lastY = y;
  lastW = w;
  lastH = h;
  callbacks.forEach((cb) => cb());
}

/** Run `cb` every frame the page scrolls or resizes (and once immediately). */
export function onScrollFrame(cb: Callback) {
  if (callbacks.size === 0) gsap.ticker.add(tick);
  callbacks.add(cb);
  cb();
  return () => {
    callbacks.delete(cb);
    if (callbacks.size === 0) gsap.ticker.remove(tick);
  };
}

/** Force subscribers to run on the next frame (e.g. after layout changes). */
export function invalidateScrollFrame() {
  dirty = true;
}
