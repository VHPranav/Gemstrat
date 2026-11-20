'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { invalidateScrollFrame, onScrollFrame } from '@/lib/scrollFrame';
import { drawHorizonWipe } from './horizonWipe';
import { setWordStyle } from '@/lib/wordStyle';
import { services, type Service } from '@/data/redesign/content';
import { CASES, formatFigure } from './theoryContent';
import type { ServiceDetails } from './serviceDetails';
import { clamp, ease, isLite, isStill, mix, pinned, reveal, span, useFrame, wipesOn, words } from './serviceMotion';
import { IntelligenceHero } from './IntelligenceScenes';
import { DotMatrixApproach, DotPicture } from './DotScenes';
import { DeviceWalkthrough, ExperienceHero } from './ExperienceScenes';
import { GrowthApproach, PeopleHero } from './PeopleScenes';
import css from './service.module.css';

// ---------------------------------------------------------------------------
// The service page template ("From → To"). One story per service:
//   hero         the headline beside a small photo window that opens to
//                fill the screen, with the introduction over it
//                (Intelligence, Experience and People & Growth have their
//                own: IntelligenceScenes, ExperienceScenes, PeopleScenes)
//   covers       what we cover, as a dial: the active area large and sharp
//   approach     zooming through a letter of each step's key word
//                (Intelligence: a network; Experience: a browser walkthrough;
//                People & Growth: a rising growth line)
//   deliverables a stack of documents that fans out
//   results      one Theory by Gemstrat case, with its figures counting up
//   faqs, related services
// Content: src/data/redesign/services.json + serviceDetails.ts
// ---------------------------------------------------------------------------

/** Where each hero photo's subject is (share of its width, height), shown in the small window */
const HERO_FOCUS: Record<string, [number, number]> = {
  'business-transformation': [.72, .63],
};

// ---------------------------------------------------------------------------
// Hero: the window opens
// ---------------------------------------------------------------------------
function Hero({ service }: { service: Service }) {
  const root = useRef<HTMLElement>(null);
  useFrame(root, el => {
    const still = isStill();
    const t = still ? 1 : pinned(el);
    const photo = el.querySelector<HTMLElement>('[data-photo]')!;
    const stage = photo.parentElement!;
    // The window: a small picture set inside the headline → the whole screen
    const hole = el.querySelector<HTMLElement>('[data-window]')!.getBoundingClientRect();
    const box = stage.getBoundingClientRect();
    const from = {
      top: (hole.top - box.top) / box.height * 100,
      left: (hole.left - box.left) / box.width * 100,
      right: (box.right - hole.right) / box.width * 100,
      bottom: (box.bottom - hole.bottom) / box.height * 100,
    };
    const open = ease(span(t, .12, .55));
    photo.style.clipPath = `inset(${mix(from.top, 0, open).toFixed(2)}% ${mix(from.right, 0, open).toFixed(2)}% ${mix(from.bottom, 0, open).toFixed(2)}% ${mix(from.left, 0, open).toFixed(2)}% round ${mix(hole.height * .18, 0, open).toFixed(1)}px)`;
    photo.style.setProperty('--dim', String(mix(.92, .42, span(t, .3, .6))));
    // The photo fills the small window, centred on its subject (the train),
    // and grows with the window until it covers the screen
    const img = photo.querySelector('img');
    if (img?.naturalWidth) {
      const [fx, fy] = HERO_FOCUS[service.slug] ?? [.5, .5];
      const fit = Math.max(box.width / img.naturalWidth, box.height / img.naturalHeight);
      const dw = img.naturalWidth * fit, dh = img.naturalHeight * fit;
      // Small: just big enough to cover the window with room around the subject
      const small = Math.max(hole.width / dw, hole.height / dh) * 2.6;
      const scale = mix(small, 1, open);
      const cx = box.width / 2, cy = box.height / 2;
      const px = (box.width - dw) / 2 + fx * dw, py = (box.height - dh) / 2 + fy * dh;
      const wx = hole.left - box.left + hole.width / 2, wy = hole.top - box.top + hole.height / 2;
      // Where the subject lands without a shift, and the shift to centre it…
      let dx = wx - (cx + (px - cx) * scale);
      let dy = wy - (cy + (py - cy) * scale);
      // …kept small enough that the photo still covers the window
      // (the picture only paints inside the image element, which is screen-sized)
      const left = cx - box.width / 2 * scale, right = cx + box.width / 2 * scale, top = cy - box.height / 2 * scale, bottom = cy + box.height / 2 * scale;
      const hl = hole.left - box.left, hr = hl + hole.width, ht = hole.top - box.top, hb = ht + hole.height;
      dx = Math.min(hl - left, Math.max(hr - right, dx));
      dy = Math.min(ht - top, Math.max(hb - bottom, dy));
      photo.style.setProperty('--scale', String(scale));
      photo.style.setProperty('--dx', `${(dx * (1 - open)).toFixed(1)}px`);
      photo.style.setProperty('--dy', `${(dy * (1 - open)).toFixed(1)}px`);
    }
    // The headline sharpens in, then leaves as the window opens
    // …then each word blurs out at its own moment, in a scattered order (as on Our approach)
    el.querySelectorAll<HTMLElement>('[data-title] [data-w]').forEach((word, i) => {
      const seed = Math.sin(i * 91.7 + 13.1) * 43758.5453;
      const start = .14 + (seed - Math.floor(seed)) * .16;
      const on = still ? 1 : 1 - span(t, start, start + .1);
      setWordStyle(word, on, still ? 0 : (1 - on) * 14, still ? 0 : (1 - on) * -10);
    });
    el.querySelector<HTMLElement>('[data-hint]')!.style.opacity = String(1 - span(t, 0, .05));
    // The introduction, over the open photograph
    reveal([...el.querySelectorAll<HTMLElement>('[data-intro] [data-w]')], still ? 1 : span(t, .55, .8), still);
  });
  // (only Transform pages use this hero, and they hand over with a pixel wipe)
  return <section className={`${css.hero} ${css.wipeTrail}`} ref={root} id="overview" data-trail="" style={{ zIndex: 5 }}>
    <div className={css.heroStage}>
      <div className={css.heroPhoto} data-photo><Image src={service.image} alt="" fill sizes="100vw" priority onLoad={() => invalidateScrollFrame()} /></div>
      {/* The headline, centred, with the photo set inside it as a small window */}
      <div className={css.heroCentre} data-title>
        {!['business-transformation', 'enterprise-architecture'].includes(service.slug) && <small>{words(`${service.group} · ${service.title}`)}</small>}
        {service.slug === 'enterprise-architecture'
          // "See ▢ the whole." / "Plan the next." with the second line starting under the window
          ? <h1 aria-label={service.headline} className={css.headlineSplit}>
            <span aria-hidden="true"><span data-w>See{' '}</span></span>
            <span aria-hidden="true"><span className={`${css.heroWindow} ${css.heroWindowBase}`} data-window />{' '}<span data-w>the{' '}</span><span data-w>whole.</span></span>
            <span aria-hidden="true" className={css.headlineSecond}><span data-w>Plan{' '}</span><span data-w>the{' '}</span><span data-w>next.</span></span>
          </h1>
          : <h1 aria-label={service.headline}>{(() => {
          const all = service.headline.split(' ');
          const at = Math.max(1, Math.round(all.length * .4));
          return <>
            {all.slice(0, at).map((word, i) => <span key={i} data-w aria-hidden="true">{word}{' '}</span>)}
            <span className={css.heroWindow} data-window aria-hidden="true" />{' '}
            {all.slice(at).map((word, i) => <span key={at + i} data-w aria-hidden="true">{word}{' '}</span>)}
          </>;
        })()}</h1>}
      </div>
      <p className={css.heroIntro} data-intro>{words(service.intro)}</p>
      <span className={css.hint} data-hint aria-hidden="true">Scroll</span>
    </div>
  </section>;
}

// ---------------------------------------------------------------------------
// What we cover: a dial
// ---------------------------------------------------------------------------
function Covers({ items, wipe, singleLine }: { items: ServiceDetails['covers']; wipe?: Wipe; singleLine?: boolean }) {
  const w = wipeProps(wipe);
  const root = useRef<HTMLElement>(null);
  useFrame(root, el => {
    const still = isStill();
    const narrow = window.innerWidth <= 760;
    const t = pinned(el);
    const active = still ? 0 : ease(span(t, .04, .96)) * (items.length - 1);
    const rows = [...el.querySelectorAll<HTMLElement>('[data-cover]')];
    const tallestRow = Math.max(0, ...rows.map(row => row.offsetHeight));
    const step = Math.max(tallestRow + 16, narrow ? 64 : Math.min(110, window.innerHeight * .12));
    const lite = isLite();
    rows.forEach((item, i) => {
      const d = i - active;
      const far = Math.min(Math.abs(d), 4);
      item.style.transform = `translate3d(0, ${(d * step).toFixed(1)}px, 0) scale(${(1 - far * .17).toFixed(3)})`;
      item.style.opacity = String(Math.max(0, 1 - far * .3));
      item.style.filter = lite || far < .05 ? '' : `blur(${(far * 2.2).toFixed(2)}px)`;
    });
    el.querySelectorAll<HTMLElement>('[data-cover-body]').forEach((body, i) => {
      const near = 1 - Math.min(1, Math.abs(i - active) * 2.2);
      body.style.opacity = String(near);
      body.style.transform = `translate3d(0, ${((1 - near) * 10).toFixed(1)}px, 0)`;
    });
    const counter = el.querySelector<HTMLElement>('[data-count]');
    if (counter) counter.textContent = String(Math.round(active) + 1).padStart(2, '0');
  });
  return <section className={`${css.covers} ${w.className}`} ref={root} id="covers" data-nav-light data-lead={w['data-lead']} data-trail={w['data-trail']} style={{ ...w.style, height: `calc(${Math.round(Math.max(3, items.length * .5 + 1) * 100)}svh + var(--wipe-extra, 0px))` }}>
    <div className={css.coversStage}>
      <div className={css.coversHead}>
        <small>What we cover</small>
        <p className={css.count}><span data-count>01</span> / {String(items.length).padStart(2, '0')}</p>
        <div className={css.coverBodies}>{items.map(item => <p key={item.title} data-cover-body>{item.body}</p>)}</div>
      </div>
      <ol className={singleLine ? `${css.dial} ${css.singleLineDial}` : css.dial}>{items.map((item, i) => <li key={item.title} data-cover>
        <span aria-hidden="true">{String(i + 1).padStart(2, '0')}</span><span>{item.title}</span>
      </li>)}</ol>
    </div>
  </section>;
}

// ---------------------------------------------------------------------------
// How we work: zoom through the letters
// Each step has one key word in huge type. Scrolling zooms into the
// counter of one of its letters (the hole in an "o" or "D") until it fills
// the screen, and the next step emerges from inside it. The last zoom lands
// on "Action." The counter is found from the real font, so the zoom always
// lands inside the letter.
// ---------------------------------------------------------------------------

/** Letters with a counter to zoom through, best first */
const COUNTERS = 'oODeaedgpqbPRABQ';

function targetIndex(word: string) {
  for (const letter of COUNTERS) {
    const at = word.indexOf(letter);
    if (at >= 0) return at;
  }
  return Math.floor(word.length / 2);
}

/**
 * Where the counter of a letter is, relative to its span (px), and roughly
 * how big it is: draw the letter, fill the outside from the edges, and what
 * empty space is left is the counter.
 */
function measureCounter(span: HTMLElement) {
  const style = getComputedStyle(span);
  const size = parseFloat(style.fontSize);
  const k = 220 / size;
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d', { willReadFrequently: true });
  const fallback = { x: span.offsetWidth / 2, y: span.offsetHeight / 2, r: size * .12 };
  if (!context) return fallback;
  const font = `${style.fontStyle} ${style.fontWeight} 220px ${style.fontFamily}`;
  context.font = font;
  const m = context.measureText(span.textContent ?? '');
  const ascent = m.fontBoundingBoxAscent;
  const descent = m.fontBoundingBoxDescent;
  const w = Math.ceil(m.width) + 20;
  const h = Math.ceil(ascent + descent) + 20;
  canvas.width = w;
  canvas.height = h;
  context.font = font;
  context.fillStyle = '#000';
  context.textBaseline = 'alphabetic';
  context.fillText(span.textContent ?? '', 10, 10 + ascent);
  const alpha = context.getImageData(0, 0, w, h).data;
  const ink = (i: number) => alpha[i * 4 + 3] > 110;
  // Fill the outside, starting from the edges
  const outside = new Uint8Array(w * h);
  const stack: number[] = [];
  for (let x = 0; x < w; x++) stack.push(x, (h - 1) * w + x);
  for (let y = 0; y < h; y++) stack.push(y * w, y * w + w - 1);
  while (stack.length) {
    const i = stack.pop()!;
    if (outside[i] || ink(i)) continue;
    outside[i] = 1;
    const x = i % w;
    if (x > 0) stack.push(i - 1);
    if (x < w - 1) stack.push(i + 1);
    if (i >= w) stack.push(i - w);
    if (i < w * (h - 1)) stack.push(i + w);
  }
  let sx = 0, sy = 0, count = 0;
  for (let i = 0; i < w * h; i++) {
    if (!outside[i] && !ink(i)) { sx += i % w; sy += Math.floor(i / w); count++; }
  }
  if (count < 20) return fallback;
  // Canvas → span: the span's line-height is 1, so the baseline sits
  // half the leftover leading below its top, plus the font's ascent
  const baseline = (size - (ascent + descent) / k) / 2 + ascent / k;
  return {
    x: (sx / count - 10) / k,
    y: baseline + (sy / count - (10 + ascent)) / k,
    r: Math.sqrt(count / Math.PI) / k,
  };
}

function Approach({ steps, keywords, wipe }: { steps: Service['steps']; keywords: string[]; wipe?: Wipe }) {
  const w = wipeProps(wipe);
  const root = useRef<HTMLElement>(null);
  const zooms = useRef<{ scale: number }[]>([]);

  // Find each word's counter once the font is ready, and again on resize
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const measure = () => {
      zooms.current = [...el.querySelectorAll<HTMLElement>('[data-zoom-word]')].map(word => {
        const target = word.querySelector<HTMLElement>('[data-target]');
        if (!target) return { scale: 1 };
        const counter = measureCounter(target);
        word.style.transformOrigin = `${(target.offsetLeft + counter.x).toFixed(1)}px ${(target.offsetTop + counter.y).toFixed(1)}px`;
        // Enough to make the counter cover the whole screen
        const cover = Math.hypot(window.innerWidth, window.innerHeight) / Math.max(4, counter.r * 1.6);
        return { scale: Math.min(90, Math.max(12, cover)) };
      });
      invalidateScrollFrame();
    };
    document.fonts.ready.then(measure);
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  useFrame(root, el => {
    const still = isStill();
    const t = still ? 0 : pinned(el);
    const layers = [...el.querySelectorAll<HTMLElement>('[data-zoom-layer]')];
    const n = steps.length;
    // n zooms, then the final word arrives and holds
    const u = span(t, .02, .96) * (n + .45);
    layers.forEach((layer, i) => {
      const word = layer.querySelector<HTMLElement>('[data-zoom-word]')!;
      const local = u - i; // <0: not yet, 0–1: this step, >1: gone through
      // Emerging from the previous counter
      // (only once the previous counter has all but filled the screen)
      const arrive = i === 0 ? 1 : ease(clamp((local + .12) / .14));
      // Zooming in: exponential, so it feels like constant speed
      const z = i < n ? ease(span(local, .55, 1)) : 0;
      const maxScale = zooms.current[i]?.scale ?? 30;
      const scale = z > 0 ? Math.pow(maxScale, z) : mix(1.35, 1, arrive);
      // At rest, no transform at all, so the word is drawn fresh at its real size
      word.style.transform = Math.abs(scale - 1) < .001 ? '' : `scale(${scale.toFixed(4)})`;
      const visible = still || (local > -.12 && local < 1);
      layer.style.visibility = visible ? 'visible' : 'hidden';
      layer.style.opacity = String(still ? 1 : arrive);
      // The step's text: in once settled, held, out before the zoom
      const copy = i < n ? span(local, .08, .24) * (1 - span(local, .46, .56)) : span(local, .04, .3);
      reveal([...layer.querySelectorAll<HTMLElement>('[data-step-copy] [data-w]')], still ? 1 : copy, still);
    });
    const counter = el.querySelector<HTMLElement>('[data-step-count]');
    if (counter) counter.textContent = String(Math.min(n, Math.floor(u) + 1)).padStart(2, '0');
    el.querySelector<HTMLElement>('[data-step-meta]')!.style.opacity = String(still ? 1 : 1 - span(u, n - .05, n + .1));
  });

  const finale = ['Action.'];
  const words2 = [...keywords.slice(0, steps.length), ...finale];
  return <section className={`${css.approach} ${w.className}`} ref={root} id="approach" data-lead={w['data-lead']} data-trail={w['data-trail']} style={{ ...w.style, height: `calc(${(steps.length + 1) * 120}svh + var(--wipe-extra, 0px))` }}>
    <div className={css.approachStage}>
      <p className={css.stepMeta} data-step-meta><span>How we work</span><span><b data-step-count>01</b> / {String(steps.length).padStart(2, '0')}</span></p>
      {words2.map((keyword, i) => {
        const step = steps[i];
        const target = i < steps.length ? targetIndex(keyword) : -1;
        return <div className={css.zoomLayer} data-zoom-layer key={keyword + i} style={{ zIndex: words2.length - i }}>
          <div className={css.zoomWord} data-zoom-word aria-hidden="true">
            {[...keyword].map((letter, k) => <span key={k} data-target={k === target ? '' : undefined}>{letter}</span>)}
          </div>
          <div className={css.stepCopy} data-step-copy>
            {step ? <>
              <h3>{words(step.title)}</h3>
              <p>{words(step.body)}</p>
            </> : <h3>{words('From understanding to action.')}</h3>}
          </div>
        </div>;
      })}
    </div>
  </section>;
}

// ---------------------------------------------------------------------------
// What you get: documents that fan out
// ---------------------------------------------------------------------------
function Deliverables({ items, wipe }: { items: ServiceDetails['deliverables']; wipe?: Wipe }) {
  const w = wipeProps(wipe);
  const root = useRef<HTMLElement>(null);
  // Scroll sets where the fan should be; a frame loop eases the cards
  // towards it, so they glide rather than jump with each scroll step
  const target = useRef(0);
  const current = useRef(0);

  const place = (el: HTMLElement, fan: number, flat: boolean) => {
    const n = items.length;
    const slot = Math.min(1240, window.innerWidth * .9) / n;
    el.querySelectorAll<HTMLElement>('[data-sheet]').forEach((sheet, i) => {
      if (flat) { sheet.style.transform = ''; return; }
      const centre = i - (n - 1) / 2;
      const x = mix(centre * 6, centre * slot, fan);
      const y = mix(-i * 6, Math.abs(centre) * 14, fan);
      const r = mix(centre * 1.6, centre * 2.4, fan) + Math.sin(fan * Math.PI) * (i % 2 ? 1.5 : -1.5);
      sheet.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) rotate(${r.toFixed(3)}deg)`;
    });
  };

  useFrame(root, el => {
    const flat = window.innerWidth <= 900 || isStill();
    const t = flat ? 1 : pinned(el);
    target.current = ease(span(t, .1, .62));
    if (flat) { current.current = target.current; place(el, 1, true); }
    reveal([...el.querySelectorAll<HTMLElement>('[data-sheets-title] [data-w]')], flat ? 1 : span(t, 0, .2), flat);
  });

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    let frame = 0;
    const loop = () => {
      const flat = window.innerWidth <= 900 || isStill();
      if (!flat) {
        const gap = target.current - current.current;
        if (Math.abs(gap) > .0005) {
          current.current += gap * .14;
          place(el, current.current, false);
        }
      }
      frame = requestAnimationFrame(loop);
    };
    place(el, current.current, false);
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
    // place only reads items, which don't change on a page
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <section className={`${css.deliverables} ${w.className}`} ref={root} id="deliverables" data-nav-light data-lead={w['data-lead']} data-trail={w['data-trail']} style={w.style}>
    <div className={css.deliverablesStage}>
      <div className={css.deliverablesHead} data-sheets-title>
        <small>What you get</small>
        <h2>{words('Useful work. Clear next steps.')}</h2>
      </div>
      <div className={css.sheets}>{items.map((item, i) => <article className={css.sheet} key={item.title} data-sheet style={{ zIndex: items.length - i }}>
        <span>{String(i + 1).padStart(2, '0')}</span>
        <h3>{item.title}</h3>
        <p>{item.body}</p>
        <i aria-hidden="true" /><i aria-hidden="true" /><i aria-hidden="true" />
      </article>)}</div>
    </div>
  </section>;
}

// ---------------------------------------------------------------------------
// Results: one case, in the Theory style
// ---------------------------------------------------------------------------
function Result({ slug, wipe, dots = false }: { slug: string; wipe?: Wipe; dots?: boolean }) {
  const w = wipeProps(wipe);
  const root = useRef<HTMLElement>(null);
  const study = CASES.find(c => c.slug === slug);
  useFrame(root, el => {
    if (!study) return;
    const still = isStill();
    const t = still ? 1 : pinned(el);
    const photo = el.querySelector<HTMLElement>('[data-result-photo]')!;
    const focus = span(t, .05, .4);
    photo.style.filter = isLite() || focus >= 1 ? '' : `blur(${((1 - focus) * 22).toFixed(1)}px)`;
    photo.style.setProperty('--scale', String(mix(1.12, 1, focus)));
    reveal([...el.querySelectorAll<HTMLElement>('[data-result-copy] [data-w]')], still ? 1 : span(t, .2, .45), still);
    const count = still ? 1 : 1 - (1 - span(t, .38, .66)) ** 3;
    el.querySelectorAll<HTMLElement>('[data-figure]').forEach((figure, i) => {
      figure.textContent = formatFigure(study.figures[i], count);
    });
    el.querySelector<HTMLElement>('[data-figures]')!.style.opacity = String(still ? 1 : span(t, .34, .44));
  });
  if (!study) return null;
  return <section className={`${css.result} ${w.className}`} ref={root} id="results" data-lead={w['data-lead']} data-trail={w['data-trail']} style={w.style}>
    <div className={css.resultStage}>
      <div className={`${css.resultPhoto} ${dots ? css.resultPhotoDots : ''}`} data-result-photo><Image src={study.image} alt="" fill sizes="100vw" /></div>
      {/* Intelligence pages: the photo drawn in dots, already formed */}
      {dots && <DotPicture src={study.image} dim={.85} progress={() => 1} />}
      <div className={css.resultCopy} data-result-copy>
        <small>{words(`In practice · Illustrative case · ${study.industry}, ${study.location}`)}</small>
        <h2>{words(study.title)}</h2>
      </div>
      <div className={css.resultFigures} data-figures>
        {study.figures.map(figure => <div key={figure.label}>
          <strong data-figure>{formatFigure(figure, 0)}</strong>
          <span>{figure.label}</span>
        </div>)}
        <Link href={`/theory-by-gemstrat#${study.slug}`} className={css.resultLink}>Read the case <span aria-hidden="true">↗</span></Link>
      </div>
    </div>
  </section>;
}

// ---------------------------------------------------------------------------
// FAQs and related services
// ---------------------------------------------------------------------------
function Questions({ faqs }: { faqs: ServiceDetails['faqs'] }) {
  return <section className={css.faqs} id="faqs" data-nav-light>
    <div className={css.faqsHead}><small>Your questions</small><h2>Before we begin.</h2></div>
    <div className={css.faqList}>{faqs.map((faq, i) => <details key={faq.question} open={i === 0}>
      <summary>{faq.question}<span aria-hidden="true" /></summary>
      <p>{faq.answer}</p>
    </details>)}</div>
  </section>;
}

function Related({ service, connected }: { service: Service; connected?: string }) {
  // Up to three from the same practice, plus the connected one (once)
  const same = services.filter(s => s.slug !== service.slug && s.group === service.group && s.slug !== connected).slice(0, 3);
  const list = [...same, ...services.filter(s => s.slug === connected && s.slug !== service.slug)];
  if (!list.length) return null;
  return <section className={css.related} data-nav-light>
    <div className={css.faqsHead}><small>Connected expertise</small><h2>Works well with.</h2></div>
    <ul className={css.relatedList}>{list.map(s => <li key={s.slug}>
      <Link href={`/services/${s.slug}`}>
        <span className={css.relatedGroup}>{s.group}</span>
        <span className={css.relatedTitle}>{s.title}</span>
        <span className={css.relatedLine}>{s.headline}</span>
        <span aria-hidden="true">→</span>
      </Link>
    </li>)}</ul>
  </section>;
}

// ---------------------------------------------------------------------------
// Pixel wipes between sections (Transform pages). Each section that hands
// over has an extra screen of scroll at its end, and the next section is
// pulled up underneath it; as you scroll, an uneven pixel frontier climbs the
// screen, clipping the section away and revealing the next one, already in
// place. The same frontier as the Theory and Global presence transitions.
// ---------------------------------------------------------------------------
type Wipe = { lead?: boolean; trail?: boolean; z: number };
const wipeProps = (wipe: Wipe | undefined) => wipe ? {
  'data-lead': wipe.lead ? '' : undefined,
  'data-trail': wipe.trail ? '' : undefined,
  className: `${wipe.lead ? css.wipeLead : ''} ${wipe.trail ? css.wipeTrail : ''}`,
  style: { zIndex: wipe.z },
} : { className: '', style: {} };

function useSectionWipes(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return;
    return onScrollFrame(() => {
      const vh = window.innerHeight;
      document.querySelectorAll<HTMLElement>('[data-trail]').forEach(section => {
        const stage = section.firstElementChild as HTMLElement | null;
        if (!stage) return;
        if (!wipesOn()) { stage.style.clipPath = ''; return; }
        // The last screen of the section's scroll is the wipe
        const w = clamp((-section.getBoundingClientRect().top - (section.offsetHeight - 2 * vh)) / vh);
        stage.style.clipPath = w <= 0 ? '' : w >= 1 ? 'inset(0 0 100% 0)'
          : drawHorizonWipe(canvas, context, stage.clientWidth, stage.clientHeight, w, 'GEMSTRAT');
      });
    });
  }, [active]);
}

// ---------------------------------------------------------------------------
// The page body (the hero is passed to PageFrame separately)
// ---------------------------------------------------------------------------
// Each practice can have its own hero and How we work; the rest is shared
export function ServiceHero({ service }: { service: Service }) {
  if (service.group === 'Intelligence') return <IntelligenceHero service={service} />;
  if (service.group === 'Experience') return <ExperienceHero service={service} />;
  if (service.group === 'People & Growth') return <PeopleHero service={service} />;
  return <Hero service={service} />;
}

export default function ServiceTemplate({ service, details }: { service: Service; details: ServiceDetails }) {
  const steps = details.steps ?? service.steps;
  const seams = service.group === 'Transform';
  useSectionWipes(seams);
  const keywords = details.stepWords ?? steps.map(step => step.title.split(' ').at(-1)!.replace(/^./, c => c.toUpperCase()));
  return <>
    <Covers items={details.covers} singleLine={service.slug === 'enterprise-architecture'} wipe={seams ? { lead: true, trail: true, z: 4 } : undefined} />
    {service.group === 'Intelligence' ? <DotMatrixApproach steps={steps} keywords={keywords} />
      : service.group === 'People & Growth' ? <GrowthApproach steps={steps} keywords={keywords} />
      : service.group === 'Experience' ? <DeviceWalkthrough service={service} steps={steps} keywords={keywords} notes={details.covers.map(cover => cover.title)} />
      : <Approach steps={steps} keywords={keywords} wipe={seams ? { lead: true, trail: true, z: 3 } : undefined} />}
    <Deliverables items={details.deliverables} wipe={seams ? { lead: true, trail: !!details.caseSlug, z: 2 } : undefined} />
    {details.caseSlug && <Result slug={details.caseSlug} wipe={seams ? { lead: true, z: 1 } : undefined} dots={service.group === 'Intelligence'} />}
    <Questions faqs={details.faqs} />
    <Related service={service} connected={details.connected} />
  </>;
}
