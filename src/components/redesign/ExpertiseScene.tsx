'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { onScrollFrame } from '@/lib/scrollFrame';
import { setWordStyle } from '@/lib/wordStyle';
import { drawBlueprint, drawDataField } from './seeingRender';
import css from './expertise.module.css';

// ---------------------------------------------------------------------------
// ExpertiseScene: "Four ways of seeing"
// One photograph of a team at work, blurred, under "Every challenge looks
// different, depending on who's looking." On scroll a lens slides across
// it four times, and inside the lens the same scene is shown the way each
// discipline sees it:
//   Transform      an architect's ink drawing: structure and flow
//   Intelligence   a measured field of dots and figures
//   Experience     sharp and bright, as a customer sees it
//   People         everything dark except the people
// Finally all four views stand side by side, then dissolve into one sharp
// picture: "Different disciplines. One connected practice."
// On phones the lens is a horizontal band that moves down the screen.
// ---------------------------------------------------------------------------

const PHOTO = '/images/case-studies/workforce.jpg';

const LENSES = [
  { id: 'transform', name: 'Transform', title: 'See how the work really flows.', body: 'Processes, systems and hand-offs, mapped end to end.' },
  { id: 'intelligence', name: 'Intelligence', title: 'See what the data already knows.', body: 'Where AI and automation can measurably help.' },
  { id: 'experience', name: 'Experience', title: 'See it the way your customers do.', body: 'Every touchpoint, connected and clear.' },
  { id: 'people-growth', name: 'People & Growth', title: 'See the people who make it work.', body: 'Leadership, skills and teams ready for what comes next.' },
];

// Scroll beats (share of the whole scene)
const OPEN_END = .1;
const LENS_START = .11;
const LENS_LEN = .16;
const FINALE = LENS_START + LENS_LEN * LENSES.length; // .75

const clamp = (value: number) => Math.max(0, Math.min(1, value));
const span = (value: number, start: number, end: number) => clamp((value - start) / (end - start));
const ease = (t: number) => t < .5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;
const words = (text: string) => text.split(' ').map((word, i) => <span key={i} data-w>{word}{' '}</span>);

export default function ExpertiseScene() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = root.current!;
    const stage = section.querySelector<HTMLElement>('[data-stage]')!;
    const lenses = [...section.querySelectorAll<HTMLElement>('[data-lens]')];
    const edges = [...section.querySelectorAll<HTMLElement>('[data-edge]')];
    const notes = [...section.querySelectorAll<HTMLElement>('[data-note]')];
    const tags = [...section.querySelectorAll<HTMLElement>('[data-tag]')];
    const whole = section.querySelector<HTMLElement>('[data-whole]')!;
    const opening = section.querySelector<HTMLElement>('[data-opening-copy]')!;
    const closing = section.querySelector<HTMLElement>('[data-closing-copy]')!;
    const hint = section.querySelector<HTMLElement>('[data-hint]')!;
    const group = (el: Element) => [...el.querySelectorAll<HTMLElement>('[data-w]')];
    const openingWords = group(opening);
    const closingWords = group(closing);
    const noteWords = notes.map(group);
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const narrow = matchMedia('(max-width: 760px)');

    // Paint the two drawn lenses once the photo is loaded, and on resize
    const blueprint = section.querySelector<HTMLCanvasElement>('[data-blueprint]')!;
    const dataField = section.querySelector<HTMLCanvasElement>('[data-datafield]')!;
    const image = new window.Image();
    let painted = 0;
    const paint = () => {
      if (!image.naturalWidth) return;
      cancelAnimationFrame(painted);
      painted = requestAnimationFrame(() => { drawBlueprint(blueprint, image); drawDataField(dataField, image); });
    };
    image.onload = paint;
    image.src = PHOTO;
    const resize = new ResizeObserver(paint);
    resize.observe(stage);

    /** Words in (amount 0→1), each a little after the last */
    const show = (list: HTMLElement[], amount: number, still: boolean) => list.forEach((word, i) => {
      const start = i / Math.max(1, list.length) * .45;
      const on = still ? 1 : span(amount, start, start + .55);
      setWordStyle(word, on, still ? 0 : (1 - on) * 12, still ? 0 : (1 - on) * 10);
    });

    const unsubscribe = onScrollFrame(() => {
      const still = reduced.matches;
      const range = Math.max(1, section.offsetHeight - stage.offsetHeight);
      const total = still ? 1 : clamp(-section.getBoundingClientRect().top / range);
      const vertical = narrow.matches;
      const width = stage.clientWidth;
      const height = stage.clientHeight;
      const size = vertical ? height : width;
      // The lens window: centre and width as shares of the screen
      const centre = vertical ? .36 : .63;
      const lensSize = vertical ? .5 : .5;

      // Opening headline: sharpens, holds, then leaves as the first lens arrives
      const openingAmount = still ? 0 : (.35 + span(total, 0, .05) * .65) * (1 - span(total, .08, OPEN_END + .01));
      show(openingWords, openingAmount, false);
      opening.style.visibility = openingAmount > 0 ? 'visible' : 'hidden';
      hint.style.opacity = String(1 - span(total, 0, .02));

      const finale = span(total, FINALE, FINALE + .08);
      lenses.forEach((lens, i) => {
        const t = span(total, LENS_START + i * LENS_LEN, LENS_START + (i + 1) * LENS_LEN);
        // Slide in, hold, slide on (from the left, or from the top on phones)
        const enter = ease(span(t, 0, .3));
        const leave = ease(span(t, .74, 1));
        const mid = centre - (centre + lensSize / 2) * (1 - enter) + (1 - centre + lensSize / 2) * leave;
        let a = (mid - lensSize / 2) * size;
        let b = (mid + lensSize / 2) * size;
        const live = t > 0 && t < 1;

        // Finale: each lens takes its quarter of the screen, one after another
        const quarter = ease(span(finale, i * .15, i * .15 + .55));
        if (total >= FINALE) {
          a = (i / 4) * size;
          b = a + size / 4;
          const grow = quarter;
          // Each quarter wipes in from its leading edge
          b = a + (b - a) * grow;
        }
        const visible = live || (total >= FINALE && quarter > 0);
        const clip = vertical
          ? `inset(${Math.max(0, a).toFixed(1)}px 0 ${Math.max(0, height - b).toFixed(1)}px 0)`
          : `inset(0 ${Math.max(0, width - b).toFixed(1)}px 0 ${Math.max(0, a).toFixed(1)}px)`;
        lens.style.clipPath = visible ? clip : 'inset(0 0 100% 0)';
        lens.style.visibility = visible ? 'visible' : 'hidden';

        // The lens's thin edges travel with it (not in the finale)
        const [left, right] = [edges[i * 2], edges[i * 2 + 1]];
        const showEdges = live && total < FINALE;
        [left, right].forEach((edge, side) => {
          const at = side ? b : a;
          edge.style.opacity = showEdges ? '1' : '0';
          edge.style.transform = vertical ? `translate3d(0, ${at.toFixed(1)}px, 0)` : `translate3d(${at.toFixed(1)}px, 0, 0)`;
        });

        // Its note: in once the lens settles, held, out before it moves on
        const noteAmount = still ? 0 : span(t, .2, .42) * (1 - span(t, .66, .8));
        show(noteWords[i], noteAmount, false);
        notes[i].style.visibility = noteAmount > 0 ? 'visible' : 'hidden';

        // Finale labels under each quarter
        tags[i].style.opacity = String(still ? 0 : quarter * (1 - span(total, .9, .94)));
      });

      // One picture: everything dissolves into the sharp photograph
      const dissolve = still ? 1 : ease(span(total, .87, .94));
      whole.style.opacity = String(dissolve);

      // Closing headline and the links into each discipline
      show(closingWords, still ? 1 : span(total, .9, 1), still);
      closing.style.visibility = still || total > .89 ? 'visible' : 'hidden';
    });

    return () => {
      unsubscribe();
      resize.disconnect();
      cancelAnimationFrame(painted);
      image.onload = null;
    };
  }, []);

  return <section className={css.seeing} ref={root} aria-label="What we do">
    <div className={css.seeingStage} data-stage>
      {/* The scene, out of focus */}
      <div className={css.base} aria-hidden="true"><Image src={PHOTO} alt="" fill sizes="100vw" priority /></div>

      {/* The four lenses: the same scene, four ways */}
      <div className={`${css.lens} ${css.lensBlueprint}`} data-lens aria-hidden="true"><canvas data-blueprint /></div>
      <div className={`${css.lens} ${css.lensData}`} data-lens aria-hidden="true"><canvas data-datafield /></div>
      <div className={`${css.lens} ${css.lensClear}`} data-lens aria-hidden="true"><Image src={PHOTO} alt="" fill sizes="100vw" loading="eager" /></div>
      <div className={`${css.lens} ${css.lensPeople}`} data-lens aria-hidden="true">
        <div className={css.peopleDim}><Image src={PHOTO} alt="" fill sizes="100vw" loading="eager" /></div>
        <div className={css.peopleLit}><Image src={PHOTO} alt="" fill sizes="100vw" loading="eager" /></div>
      </div>
      {LENSES.map(lens => <span key={lens.id} aria-hidden="true">
        <i className={css.lensEdge} data-edge /><i className={css.lensEdge} data-edge />
      </span>)}

      {/* All four, become one */}
      <div className={css.whole} data-whole aria-hidden="true"><Image src={PHOTO} alt="" fill sizes="100vw" loading="eager" /></div>
      <div className={css.shade} aria-hidden="true" />

      <h1 className={css.openingCopy} data-opening-copy>{words('Every challenge looks different, depending on who’s looking.')}</h1>
      <span className={css.hint} data-hint aria-hidden="true">Scroll</span>

      {LENSES.map((lens, i) => <div className={css.note} data-note key={lens.id}>
        <small>{words(`${String(i + 1).padStart(2, '0')} · ${lens.name}`)}</small>
        <h2>{words(lens.title)}</h2>
        <p>{words(lens.body)}</p>
      </div>)}

      <div className={css.tags} aria-hidden="true">{LENSES.map(lens => <span key={lens.id} data-tag>{lens.name}</span>)}</div>

      <div className={css.closingCopy} data-closing-copy>
        <h2>{words('Different disciplines.')}<br />{words('One connected practice.')}</h2>
        <nav aria-label="Our capabilities">{LENSES.map(lens => <a key={lens.id} href={`#${lens.id}`}><span data-w>{lens.name} ↓</span></a>)}</nav>
      </div>
    </div>
  </section>;
}

export function CapabilityVisual({ src, alt }: { src: string; alt: string }) {
  const edge = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = edge.current!;
    const context = canvas.getContext('2d');
    if (!context) return;
    const image = new window.Image();
    const paint = () => {
      const bounds = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(bounds.width * Math.min(1, 720 / bounds.height)));
      canvas.height = Math.max(1, Math.round(bounds.height * Math.min(1, 720 / bounds.height)));
      const width = canvas.width, height = canvas.height;
      const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
      const scaledWidth = image.naturalWidth * scale;
      const scaledHeight = image.naturalHeight * scale;
      context.drawImage(image, (width - scaledWidth) / 2, (height - scaledHeight) / 2, scaledWidth, scaledHeight);
      const input = context.getImageData(0, 0, width, height);
      const output = context.createImageData(width, height);
      const value = (i: number) => input.data[i * 4] * .299 + input.data[i * 4 + 1] * .587 + input.data[i * 4 + 2] * .114;
      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          const i = y * width + x;
          const dx = value(i - width + 1) + 2 * value(i + 1) + value(i + width + 1) - value(i - width - 1) - 2 * value(i - 1) - value(i + width - 1);
          const dy = value(i + width - 1) + 2 * value(i + width) + value(i + width + 1) - value(i - width - 1) - 2 * value(i - width) - value(i - width + 1);
          output.data.set([35, 35, 35, Math.min(180, Math.max(0, Math.hypot(dx, dy) - 30))], i * 4);
        }
      }
      context.putImageData(output, 0, 0);
      canvas.style.visibility = 'visible';
    };
    const resize = new ResizeObserver(() => {
      if (image.complete && image.naturalWidth) paint();
    });
    resize.observe(canvas);
    image.onload = paint;
    image.src = src;
    return () => {
      image.onload = null;
      resize.disconnect();
    };
  }, [src]);

  return <div className={css.capabilityVisual}>
    <Image src={src} alt={alt} fill sizes="(max-width: 900px) 100vw, 52vw" />
    <canvas ref={edge} width={540} height={720} aria-hidden="true" />
  </div>;
}
