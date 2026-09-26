import { isLowEndDevice } from './device';

// ---------------------------------------------------------------------------
// setWordStyle
// Writes a scroll-animated word's opacity / blur / vertical offset, but only
// when the (rounded) values actually change — most words sit fully visible or
// fully hidden during a scroll, so this skips the vast majority of style
// writes. On low-end devices the blur is dropped (CSS blur on many elements is
// one of the most expensive things to repaint); the fade + slide remain.
// ---------------------------------------------------------------------------

const lastKey = new WeakMap<HTMLElement, string>();

export function setWordStyle(el: HTMLElement, opacity: number, blur: number, translateY: number) {
  const o = Math.round(opacity * 100) / 100;
  const b = isLowEndDevice() ? 0 : Math.round(blur * 2) / 2;
  const y = Math.round(translateY * 2) / 2;
  const key = `${o}|${b}|${y}`;
  if (lastKey.get(el) === key) return;
  lastKey.set(el, key);
  el.style.opacity = String(o);
  el.style.filter = b > 0 ? `blur(${b}px)` : 'none';
  el.style.transform = y !== 0 ? `translate3d(0, ${y}px, 0)` : 'none';
}
