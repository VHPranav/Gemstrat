'use client';

import { useRef } from 'react';
import type { Service } from '@/data/redesign/content';
import { clamp, ease, isStill, mix, pinned, reveal, span, useFrame, words } from './serviceMotion';
import css from './service.module.css';

// ---------------------------------------------------------------------------
// ClickThroughApproach: How we work for Digital Solutions, in the spirit of
// Business Transformation's zoom through the letters, told in the language
// of digital products. Each step is one huge word set as a button. A cursor
// glides in and presses it (the button fills), then the camera dives into
// the pressed button until its colour fills the screen, which becomes the
// next step. Screens alternate dark and light; the last press lands on
// "Live."
// ---------------------------------------------------------------------------

/** Timing inside one step (share of that step's scroll) */
const ARRIVE = .14; // the word settles in
const COPY_IN = [.1, .28];
const COPY_OUT = [.48, .56];
const CURSOR = [.46, .64]; // the cursor glides to the button
const PRESS = [.64, .7]; // the press: the button fills
const DIVE = [.7, 1]; // into the button
const DIVE_SCALE = 34;

export function ClickThroughApproach({ steps, keywords, lead = false }: { steps: Service['steps']; keywords: string[]; /** Revealed by a pixel wipe from the section above */ lead?: boolean }) {
  const root = useRef<HTMLElement>(null);
  const n = steps.length;
  const screens = [...keywords.slice(0, n), 'Live.'];

  useFrame(root, el => {
    const still = isStill();
    const t = still ? 0 : pinned(el);
    // n dives, then the final screen arrives and holds
    const u = span(t, .02, .95) * (n + .5);
    const layers = [...el.querySelectorAll<HTMLElement>('[data-click-layer]')];
    const cursor = el.querySelector<HTMLElement>('[data-cursor]')!;
    let cursorShown = false;

    layers.forEach((layer, i) => {
      const local = u - i;
      const last = i === layers.length - 1;
      const arriving = i === 0 ? 1 : ease(clamp(local / ARRIVE));
      const visible = still ? i === 0 : local >= 0 && (local < 1 || last);
      layer.style.visibility = visible ? 'visible' : 'hidden';

      const button = layer.querySelector<HTMLElement>('[data-button]')!;
      const label = layer.querySelector<HTMLElement>('[data-label]')!;
      const press = last ? 0 : ease(span(local, PRESS[0], PRESS[1]));
      const dive = last || still ? 0 : span(local, DIVE[0], DIVE[1]);
      // Dive at a steady pace: scale grows exponentially
      const scale = dive > 0 ? Math.pow(DIVE_SCALE, ease(dive)) : mix(1.18, 1, arriving) * (1 - press * .04);
      button.style.transform = Math.abs(scale - 1) < .001 ? '' : `scale(${scale.toFixed(4)})`;
      button.style.setProperty('--fill', press.toFixed(3));
      button.toggleAttribute('data-pressed', press > .5);
      label.style.opacity = String((i === 0 ? 1 : arriving) * (1 - span(dive, 0, .12)));

      // The step's words along the foot of the screen
      const copy = layer.querySelector<HTMLElement>('[data-step-copy]');
      if (copy) {
        const amount = still ? 1 : last ? span(local, COPY_IN[0], COPY_IN[1]) : span(local, COPY_IN[0], COPY_IN[1]) * (1 - span(local, COPY_OUT[0], COPY_OUT[1]));
        copy.style.visibility = amount > 0 ? 'visible' : 'hidden';
        reveal([...copy.querySelectorAll<HTMLElement>('[data-w]')], amount, still);
      }

      // The cursor: in from the lower right to the button, presses, then leaves with the dive
      if (!last && !still && local >= CURSOR[0] && local < DIVE[0] + .08) {
        cursorShown = true;
        const glide = ease(span(local, CURSOR[0], CURSOR[1]));
        const box = button.getBoundingClientRect();
        const stage = el.firstElementChild!.getBoundingClientRect();
        const tx = box.left - stage.left + box.width * .62;
        const ty = box.top - stage.top + box.height * .7;
        const sx = stage.width * .92, sy = stage.height * 1.05;
        const x = mix(sx, tx, glide);
        const y = mix(sy, ty, glide);
        const pressing = span(local, PRESS[0], PRESS[0] + .03) * (1 - span(local, PRESS[1], PRESS[1] + .03));
        cursor.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) scale(${(1 - pressing * .18).toFixed(3)})`;
        cursor.style.opacity = String(1 - span(local, DIVE[0], DIVE[0] + .08));
        cursor.dataset.theme = layer.dataset.theme;
      }
      // The navigation bar reads dark on the light screens
      if (visible && (local < 1 || last)) el.firstElementChild!.toggleAttribute('data-nav-light', layer.dataset.theme === 'light');
    });
    cursor.style.visibility = cursorShown ? 'visible' : 'hidden';

    const counter = el.querySelector<HTMLElement>('[data-step-count]');
    if (counter) counter.textContent = String(Math.min(n, Math.floor(u) + 1)).padStart(2, '0');
    el.querySelector<HTMLElement>('[data-step-meta]')!.style.opacity = String(still ? 1 : 1 - span(u, n - .05, n + .1));
  });

  return <section className={`${css.click} ${lead ? css.wipeLead : ''}`} ref={root} id="approach" data-lead={lead ? '' : undefined}
    style={{ height: `calc(${(n + 1) * 120}svh + var(--wipe-extra, 0px))`, zIndex: lead ? 3 : undefined }}>
    <div className={css.clickStage}>
      {screens.map((word, i) => {
        const step = steps[i];
        // Alternate: dark, light, dark… (the press fills with the next screen's colour)
        const theme = i % 2 ? 'light' : 'dark';
        return <div className={css.clickLayer} data-click-layer data-theme={theme} key={word + i} style={{ zIndex: screens.length - i }}>
          <div className={step ? css.clickButton : css.clickFinal} data-button aria-hidden="true"
            // Long words get smaller, so every button fits the screen
            style={{ fontSize: `min(clamp(64px, 14vw, 240px), ${(84 / (word.length * .55 + (step ? .9 : .2))).toFixed(2)}vw)` }}>
            <span data-label>{word}</span>
          </div>
          {step ? <div className={css.clickCopy} data-step-copy>
            <h3>{words(step.title)}</h3>
            <p>{words(step.body)}</p>
          </div> : <div className={css.clickCopy} data-step-copy>
            <h3>{words('From understanding to action.')}</h3>
          </div>}
        </div>;
      })}
      <p className={css.clickMeta} data-step-meta><span>How we work</span><span><b data-step-count>01</b> / {String(n).padStart(2, '0')}</span></p>
      {/* The cursor that presses each button */}
      <svg className={css.cursor} data-cursor viewBox="0 0 28 36" aria-hidden="true">
        <path d="M2 2 L2 30 L9.5 23 L14.5 34 L19 32 L14 21 L24 21 Z" />
      </svg>
    </div>
  </section>;
}
