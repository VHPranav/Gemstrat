// ---------------------------------------------------------------------------
// Hero intro trigger
// The hero / navbar / cookie entrance animations stay paused (globals.css:
// `html:not(.intro-play)`) until the intro starts. The loader calls
// playIntroWhenHeroVisible() once it has gone; the intro then starts the
// moment the hero section is in the viewport, with its original timings.
// ---------------------------------------------------------------------------

let started = false;
const listeners = new Set<() => void>();

function startIntro() {
  if (started) return;
  started = true;
  document.documentElement.classList.add('intro-play');
  listeners.forEach((l) => l());
  listeners.clear();
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
