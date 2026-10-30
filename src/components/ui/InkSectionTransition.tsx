'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { onScrollFrame } from '@/lib/scrollFrame';
import styles from './ink-section-transition.module.css';

const clamp = (value: number) => Math.max(0, Math.min(1, value));
function noise(x: number, y: number) {
  const value = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return value - Math.floor(value);
}
function smoothNoise(x: number, y: number) {
  const ix = Math.floor(x), iy = Math.floor(y);
  const tx = x - ix, ty = y - iy;
  const sx = tx * tx * (3 - 2 * tx), sy = ty * ty * (3 - 2 * ty);
  return (noise(ix, iy) * (1 - sx) + noise(ix + 1, iy) * sx) * (1 - sy)
    + (noise(ix, iy + 1) * (1 - sx) + noise(ix + 1, iy + 1) * sx) * sy;
}

/** Pins the incoming section while an organic ink mask grows over the hero. */
export default function InkSectionTransition({ children }: { children: ReactNode }) {
  const stage = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const container = stage.current;
    const content = panel.current;
    if (!container || !content) return;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!CSS.supports('mask-image', 'linear-gradient(black, transparent)')) return;
    const canvas = document.createElement('canvas');
    canvas.width = 192;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const pixels = ctx.createImageData(canvas.width, canvas.height);
    const field = new Float32Array(canvas.width * canvas.height);
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const index = y * canvas.width + x;
        field[index] = 0.1 + y / canvas.height * 0.48
          + smoothNoise(x / 32, y / 32) * 0.26
          + smoothNoise(x / 11, y / 11) * 0.12 + noise(x, y) * 0.025;
        pixels.data[index * 4] = 255;
        pixels.data[index * 4 + 1] = 255;
        pixels.data[index * 4 + 2] = 255;
      }
    }
    let lastStep = -1;
    const size = new ResizeObserver(() => {
      container.style.setProperty('--ink-panel-height', `${content.offsetHeight}px`);
    });
    container.style.setProperty('--ink-panel-height', `${content.offsetHeight}px`);
    size.observe(content);
    const update = () => {
      if (media.matches) {
        container.classList.remove(styles.ready);
        content.style.maskImage = '';
        content.style.visibility = '';
        content.inert = false;
        lastStep = -1;
        return;
      }
      container.classList.add(styles.ready);
      const progress = clamp(-container.getBoundingClientRect().top / window.innerHeight);
      const step = Math.round(progress * 100);
      if (step === lastStep) return;
      lastStep = step;
      content.inert = progress < 0.98;
      content.style.visibility = step === 0 ? 'hidden' : 'visible';
      if (step === 100) {
        content.style.maskImage = 'none';
        return;
      }
      for (let index = 0; index < field.length; index++) {
        pixels.data[index * 4 + 3] = Math.round(clamp((progress * 1.15 - field[index]) / 0.14) * 255);
      }
      ctx.putImageData(pixels, 0, 0);
      content.style.maskImage = `url(${canvas.toDataURL()})`;
    };
    const stop = onScrollFrame(update);
    media.addEventListener('change', update);
    return () => {
      stop();
      size.disconnect();
      media.removeEventListener('change', update);
    };
  }, []);
  return <div ref={stage} className={styles.stage}><div ref={panel} className={styles.panel}>{children}</div></div>;
}
