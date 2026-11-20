'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef } from 'react';
import type { Service } from '@/data/redesign/content';
import { ease, isLite, isStill, mix, pinned, reveal, span, useFrame, words } from './serviceMotion';
import css from './service.module.css';

// ---------------------------------------------------------------------------
// The People & Growth practice's service pages share the template but have
// their own hero and How we work:
//   PeopleHero       the team assembles: on a dark stage the people from a
//                    team photograph arrive one by one, out of focus and
//                    sharpening; then the room fades in around them
//   GrowthApproach   a rising growth line; each step is a point that lifts
//                    it higher, from "Today" to "Next phase"
// The people are cut out at runtime from one photo and its people mask (made
// with macOS person detection; see public/images/what-we-do/people-mask.png).
// ---------------------------------------------------------------------------

const TEAM_PHOTO = '/images/case-studies/workforce.jpg';
const TEAM_MASK = '/images/what-we-do/people-mask.png';

const load = (src: string) => new Promise<HTMLImageElement>((resolve, reject) => {
  const image = new window.Image();
  image.onload = () => resolve(image);
  image.onerror = reject;
  image.src = src;
});

/** Splits the people mask into one mask per person (largest first is not needed: left to right) */
function separatePeople(mask: HTMLImageElement) {
  const w = mask.naturalWidth;
  const h = mask.naturalHeight;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const context = canvas.getContext('2d', { willReadFrequently: true })!;
  context.drawImage(mask, 0, 0);
  const alpha = context.getImageData(0, 0, w, h).data;
  const label = new Int32Array(w * h).fill(-1);
  const people: { pixels: number[]; cx: number }[] = [];
  for (let start = 0; start < w * h; start++) {
    if (label[start] !== -1 || alpha[start * 4 + 3] < 128) continue;
    const id = people.length;
    const pixels: number[] = [];
    const stack = [start];
    label[start] = id;
    let sx = 0;
    while (stack.length) {
      const i = stack.pop()!;
      pixels.push(i);
      sx += i % w;
      const x = i % w;
      for (const j of [x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, i - w, i + w]) {
        if (j >= 0 && j < w * h && label[j] === -1 && alpha[j * 4 + 3] >= 128) { label[j] = id; stack.push(j); }
      }
    }
    people.push({ pixels, cx: sx / pixels.length });
  }
  // Keep real figures (not specks), ordered left to right
  return people
    .filter(person => person.pixels.length > w * h * .008)
    .sort((a, b) => a.cx - b.cx)
    .map(person => {
      const own = document.createElement('canvas');
      own.width = w;
      own.height = h;
      const ownContext = own.getContext('2d')!;
      const data = ownContext.createImageData(w, h);
      for (const i of person.pixels) { data.data[i * 4 + 3] = alpha[i * 4 + 3]; }
      ownContext.putImageData(data, 0, 0);
      // Soften the edge a touch
      const soft = document.createElement('canvas');
      soft.width = w;
      soft.height = h;
      const softContext = soft.getContext('2d')!;
      softContext.filter = 'blur(1px)';
      softContext.drawImage(own, 0, 0);
      return soft;
    });
}

// ---------------------------------------------------------------------------
// Hero: the team assembles
// ---------------------------------------------------------------------------
export function PeopleHero({ service }: { service: Service }) {
  const root = useRef<HTMLElement>(null);

  // Cut each person out of the photo, at the size of the stage
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const stage = el.querySelector<HTMLElement>('[data-stage]')!;
    const layer = el.querySelector<HTMLElement>('[data-people]')!;
    let cancelled = false;
    let parts: { photo: HTMLImageElement; masks: HTMLCanvasElement[] } | null = null;
    const paint = () => {
      if (!parts) return;
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = stage.clientWidth;
      const h = stage.clientHeight;
      const scale = Math.max(w / parts.photo.naturalWidth, h / parts.photo.naturalHeight);
      const dw = parts.photo.naturalWidth * scale;
      const dh = parts.photo.naturalHeight * scale;
      const dx = (w - dw) / 2;
      const dy = (h - dh) / 2;
      layer.replaceChildren(...parts.masks.map(mask => {
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(w * ratio);
        canvas.height = Math.round(h * ratio);
        canvas.dataset.person = '';
        const context = canvas.getContext('2d')!;
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
        context.drawImage(parts!.photo, dx, dy, dw, dh);
        context.globalCompositeOperation = 'destination-in';
        context.drawImage(mask, dx, dy, dw, dh);
        return canvas;
      }));
    };
    Promise.all([load(TEAM_PHOTO), load(TEAM_MASK)]).then(([photo, mask]) => {
      if (cancelled) return;
      parts = { photo, masks: separatePeople(mask) };
      paint();
    }).catch(() => { /* No cut-outs: the room photo still fades in */ });
    const resize = new ResizeObserver(paint);
    resize.observe(stage);
    return () => { cancelled = true; resize.disconnect(); };
  }, []);

  useFrame(root, el => {
    const still = isStill();
    const lite = isLite();
    const t = still ? 1 : pinned(el);
    const people = [...el.querySelectorAll<HTMLElement>('[data-person]')];
    const n = Math.max(1, people.length);

    // 1. Each person arrives in turn, out of focus, and sharpens
    people.forEach((person, i) => {
      const start = .04 + (i / n) * .3;
      const arrive = still ? 1 : ease(span(t, start, start + .16));
      const merge = still ? 1 : span(t, .6, .72);
      person.style.opacity = String(arrive * (1 - merge));
      person.style.transform = `translate3d(0, ${((1 - arrive) * 5).toFixed(2)}svh, 0) scale(${mix(.97, 1, arrive).toFixed(4)})`;
      person.style.filter = lite || arrive >= 1 ? 'brightness(1.12)' : `blur(${((1 - arrive) * 16).toFixed(1)}px) brightness(1.12)`;
    });

    // 2. The room fades in around them, dim, then becomes the whole photograph
    const room = el.querySelector<HTMLElement>('[data-room]')!;
    room.style.opacity = String(still ? 1 : span(t, .44, .6));
    room.style.setProperty('--dim', String(still ? .45 : mix(.32, .45, span(t, .6, .72))));

    reveal([...el.querySelectorAll<HTMLElement>('[data-title] [data-w]')], still ? 1 : 1 - span(t, .48, .58), still);
    reveal([...el.querySelectorAll<HTMLElement>('[data-intro] [data-w]')], still ? 1 : span(t, .7, .9), still);
    el.querySelector<HTMLElement>('[data-hint]')!.style.opacity = String(1 - span(t, 0, .04));
  });

  return <section className={`${css.hero} ${css.pgHero}`} ref={root} id="overview">
    <div className={css.heroStage} data-stage>
      <div className={css.pgRoom} data-room aria-hidden="true"><Image src={TEAM_PHOTO} alt="" fill sizes="100vw" priority /></div>
      <div className={css.pgPeople} data-people aria-hidden="true" />
      <div className={css.pgShade} aria-hidden="true" />
      <div className={`${css.heroTitle} ${css.pgTitle}`} data-title>
        <small>{words(`${service.group} · ${service.title}`)}</small>
        <h1>{words(service.headline)}</h1>
      </div>
      <p className={`${css.heroIntro} ${css.pgIntro}`} data-intro>{words(service.intro)}</p>
      <span className={css.hint} data-hint aria-hidden="true">Scroll</span>
    </div>
  </section>;
}

// ---------------------------------------------------------------------------
// How we work: the growth line
// ---------------------------------------------------------------------------

/** The curve, in a 1000 × 600 box: low on the left, rising to the right */
const CURVE = 'M 40 540 C 260 530, 380 470, 500 380 S 760 120, 960 70';
/** Where each step sits along the curve (share of its length) */
const STOPS = [.22, .56, .9];

export function GrowthApproach({ steps, keywords }: { steps: Service['steps']; keywords: string[] }) {
  const root = useRef<HTMLElement>(null);
  const n = steps.length;
  const stops = useMemo(() => Array.from({ length: n }, (_, i) => STOPS[i] ?? (i + 1) / (n + .2)), [n]);

  // Place the step points on the curve once it is measured
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const path = el.querySelector<SVGPathElement>('[data-curve]')!;
    const total = path.getTotalLength();
    // (the chart stretches to the screen, so the points are placed in % to stay round)
    el.querySelectorAll<HTMLElement>('[data-stop]').forEach((stop, i) => {
      const p = path.getPointAtLength(total * stops[i]);
      stop.style.left = `${(p.x / 10).toFixed(2)}%`;
      stop.style.top = `${(p.y / 6).toFixed(2)}%`;
    });
  }, [stops]);

  useFrame(root, el => {
    const still = isStill();
    const t = still ? 1 : pinned(el);
    // Draw to each stop, hold while the step is read, then rise on
    const u = span(t, .04, .9) * (n - 1 + .55);
    const k = Math.min(n - 1, Math.floor(u));
    const local = u - k;
    const from = k === 0 ? 0 : stops[k - 1];
    const reach = still ? 1 : mix(from, stops[k], ease(span(local, 0, .35)));
    // After the last step, the line runs on to the edge: the next phase
    const drawn = still ? 1 : k === n - 1 && local > .38 ? mix(stops[k], 1, ease(span(local, .38, .55))) : reach;

    el.querySelector<SVGPathElement>('[data-curve]')!.style.strokeDashoffset = String(1 - drawn);
    el.querySelector<SVGPathElement>('[data-area]')!.style.clipPath = `inset(0 ${((1 - drawn) * 100).toFixed(2)}% 0 0)`;
    el.querySelectorAll<HTMLElement>('[data-stop]').forEach((stop, i) => {
      stop.toggleAttribute('data-on', drawn >= stops[i] - .002);
      stop.toggleAttribute('data-active', !still && k === i);
    });
    el.querySelectorAll<HTMLElement>('[data-step-copy]').forEach((copy, i) => {
      const amount = still ? 1 : i === k ? span(local, .2, .45) * (i === n - 1 ? 1 : 1 - span(local, .82, .96)) : 0;
      copy.style.visibility = amount > 0 ? 'visible' : 'hidden';
      reveal([...copy.querySelectorAll<HTMLElement>('[data-w]')], amount, still);
    });
    const counter = el.querySelector<HTMLElement>('[data-step-count]');
    if (counter) counter.textContent = String(k + 1).padStart(2, '0');
    el.querySelector<HTMLElement>('[data-next]')!.style.opacity = String(still ? 1 : span(drawn, .92, 1));
  });

  return <section className={css.growth} ref={root} id="approach" style={{ height: `${(n + 1) * 100}svh` }}>
    <div className={css.growthStage}>
      <p className={css.stepMeta}><span>How we work</span><span><b data-step-count>01</b> / {String(n).padStart(2, '0')}</span></p>
      <svg className={css.growthChart} viewBox="0 0 1000 600" preserveAspectRatio="none" aria-hidden="true">
        {[120, 240, 360, 480].map(y => <line key={y} x1="0" x2="1000" y1={y} y2={y} className={css.growthRule} vectorEffect="non-scaling-stroke" />)}
        <path d={`${CURVE} L 960 600 L 40 600 Z`} className={css.growthArea} data-area vectorEffect="non-scaling-stroke" />
        <path d={CURVE} className={css.growthCurve} data-curve pathLength={1} vectorEffect="non-scaling-stroke" />
      </svg>
      <div className={css.growthPlot} aria-hidden="true">
        {steps.map((step, i) => <span key={step.title} data-stop className={css.growthStop}><i /><b>{String(i + 1).padStart(2, '0')}</b></span>)}
      </div>
      <div className={css.growthLabels} aria-hidden="true">
        <span>Today</span>
        <span data-next>Next phase →</span>
      </div>
      {steps.map((step, i) => <div className={css.growthCopy} data-step-copy key={step.title}>
        <small>{words(`${String(i + 1).padStart(2, '0')} · ${keywords[i] ?? ''}`)}</small>
        <h3>{words(step.title)}</h3>
        <p>{words(step.body)}</p>
      </div>)}
    </div>
  </section>;
}
