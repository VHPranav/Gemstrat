// ---------------------------------------------------------------------------
// Hero intro trigger
// The hero / navbar / cookie entrance animations stay paused (globals.css)
// until the intro starts. The loader calls playIntroWhenHeroVisible() once it
// has gone; the intro then starts the moment the hero section is in the
// viewport.
//
// Two stages: `intro-play` on <html> starts the hero scene, `hero-reveal`
// starts the copy (headline, navbar, cookie banner). The Hero holds the
// reveal with holdHeroReveal() until its scene's construction intro has
// played; without a hold (lite mode) the copy comes in right away.
// ---------------------------------------------------------------------------

const MAX_HOLD_MS = 10000; // the copy never waits longer than this for the scene

let started = false;
let revealed = false;
let holds = 0;
let holdTimer = 0;
const listeners = new Set<() => void>();

function reveal() {
  if (revealed) return;
  revealed = true;
  window.clearTimeout(holdTimer);
  document.documentElement.classList.add('hero-reveal');
}

function startIntro() {
  if (started) return;
  started = true;
  document.documentElement.classList.add('intro-play');
  listeners.forEach((l) => l());
  listeners.clear();
  if (holds === 0) reveal();
  else holdTimer = window.setTimeout(reveal, MAX_HOLD_MS);
}

/** Run `cb` when the intro starts (right away if it already has). */
export function onIntroStart(cb: () => void): () => void {
  if (started) {
    cb();
    return () => {};
  }
  listeners.add(cb);
  return () => listeners.delete(cb);
}

/**
 * Keep the hero copy hidden until the returned release() is called. Returns
 * null when the copy is already showing (too late to hold it).
 */
export function holdHeroReveal(): (() => void) | null {
  if (revealed) return null;
  holds++;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    holds--;
    if (started && holds === 0) reveal();
  };
}

export function playIntroWhenHeroVisible() {
  if (started) return;
  const hero = document.getElementById('hero');
  if (!hero) {
    startIntro();
    return;
  }
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        observer.disconnect();
        startIntro();
      }
    },
    { threshold: 0.3 }
  );
  observer.observe(hero);
}
