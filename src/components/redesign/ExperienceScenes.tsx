'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { invalidateScrollFrame } from '@/lib/scrollFrame';
import type { Service } from '@/data/redesign/content';
import { clamp, ease, isStill, mix, pinned, reveal, span, useFrame, words } from './serviceMotion';
import css from './service.module.css';

// ---------------------------------------------------------------------------
// The Experience practice's service pages (brand, digital, marketing, film…)
// share the template but have their own hero and How we work:
//   ExperienceHero      a brand board: grid lines draw in, then the pieces
//                       (headline, type specimen, tone swatches, photo) fly
//                       in and click into place; the photo then opens to
//                       fill the screen, with the introduction over it
//   DeviceWalkthrough   a browser window beside the steps; the screen inside
//                       scrolls from research, to a wireframe, to the live page
// ---------------------------------------------------------------------------

const TONES = [
  { name: 'Ink', hex: '#111111' },
  { name: 'Graphite', hex: '#4a4a4a' },
  { name: 'Silver', hex: '#b8b8b8' },
  { name: 'White', hex: '#ffffff' },
];

/** Where each board piece starts before it clicks into place (x, y in vw/svh, rotation) */
const SCATTER = [
  { x: -18, y: 14, r: -7 },
  { x: 22, y: -16, r: 6 },
  { x: -10, y: 30, r: 9 },
  { x: 14, y: 26, r: -8 },
];

/** An element's position inside an ancestor, ignoring transforms */
function offsetWithin(el: HTMLElement, ancestor: HTMLElement) {
  let x = 0, y = 0;
  let node: HTMLElement | null = el;
  while (node && node !== ancestor) {
    x += node.offsetLeft;
    y += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return { x, y, w: el.offsetWidth, h: el.offsetHeight };
}

// ---------------------------------------------------------------------------
// Hero: the brand board
// ---------------------------------------------------------------------------
export function ExperienceHero({ service }: { service: Service }) {
  const root = useRef<HTMLElement>(null);
  // Every Experience page: the board settles in by itself on load (no scattered fly-in)
  const autoEnter = true;
  const entrance = useRef(0);

  useEffect(() => {
    if (!autoEnter || isStill()) return;
    const start = performance.now();
    let frameId: number;
    const tick = (now: number) => {
      entrance.current = clamp((now - start) / 1250);
      invalidateScrollFrame();
      if (entrance.current < 1) frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [autoEnter]);

  // The photo inside its tile is the same full-screen picture, offset by the
  // tile's position, so it can open to full screen without a jump
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const stage = el.querySelector<HTMLElement>('[data-stage]')!;
    const tile = el.querySelector<HTMLElement>('[data-photo-tile]')!;
    const inner = tile.querySelector<HTMLElement>('[data-photo-inner]')!;
    const fit = () => {
      const box = offsetWithin(tile, stage);
      inner.style.left = `${-box.x}px`;
      inner.style.top = `${-box.y}px`;
      inner.style.width = `${stage.clientWidth}px`;
      inner.style.height = `${stage.clientHeight}px`;
    };
    fit();
    const resize = new ResizeObserver(fit);
    resize.observe(stage);
    return () => resize.disconnect();
  }, []);

  useFrame(root, el => {
    const still = isStill();
    const scroll = pinned(el);
    const t = still ? 1 : autoEnter
      ? Math.max(entrance.current * .51, scroll > 0 ? mix(.51, 1, scroll) : 0)
      : scroll;
    const stage = el.querySelector<HTMLElement>('[data-stage]')!;

    // 1. The grid draws in
    el.querySelectorAll<HTMLElement>('[data-grid] i').forEach((line, i) => {
      line.style.transform = `scaleY(${still ? 1 : ease(span(t, i * .008, .1 + i * .008)).toFixed(3)})`;
    });

    // 2. The pieces fly in and click into place, one after another
    el.querySelectorAll<HTMLElement>('[data-piece]').forEach((piece, i) => {
      const s = SCATTER[i % SCATTER.length];
      const land = still ? 1 : ease(span(t, .04 + i * .05, .3 + i * .05));
      piece.style.transform = autoEnter || land >= 1 ? '' : `translate3d(${(s.x * (1 - land)).toFixed(2)}vw, ${(s.y * (1 - land)).toFixed(2)}svh, 0) rotate(${(s.r * (1 - land)).toFixed(2)}deg)`;
      if (autoEnter && !piece.hasAttribute('data-title')) {
        piece.style.transform = `translateY(${(1 - land) * 24}px)`;
        piece.style.filter = `blur(${(1 - land) * 8}px) opacity(${still || piece.hasAttribute('data-photo-tile') ? 1 : 1 - span(t, .54, .64)})`;
      }
      piece.style.opacity = String(clamp(land * 2));
      // Everything but the photo steps back as the photo opens
      if (!piece.hasAttribute('data-photo-tile')) piece.style.setProperty('--away', String(still ? 0 : span(t, .54, .64)));
    });

    // 3. The photo opens from its tile to the whole screen
    const tile = el.querySelector<HTMLElement>('[data-photo-tile]')!;
    const full = el.querySelector<HTMLElement>('[data-photo-full]')!;
    const open = still ? 1 : ease(span(t, .56, .78));
    const w = stage.clientWidth;
    const h = stage.clientHeight;
    const box = offsetWithin(tile, stage);
    const top = box.y / h * 100;
    const left = box.x / w * 100;
    const right = 100 - (box.x + box.w) / w * 100;
    const bottom = 100 - (box.y + box.h) / h * 100;
    full.style.visibility = open > 0 ? 'visible' : 'hidden';
    full.style.clipPath = `inset(${mix(top, 0, open).toFixed(2)}% ${mix(right, 0, open).toFixed(2)}% ${mix(bottom, 0, open).toFixed(2)}% ${mix(left, 0, open).toFixed(2)}%)`;
    full.style.setProperty('--dim', String(mix(1, .45, span(t, .7, .82))));
    el.querySelector<HTMLElement>('[data-grid]')!.style.opacity = String(1 - span(t, .54, .64));

    // The headline sharpens in with its piece; the introduction lands on the photo
    reveal([...el.querySelectorAll<HTMLElement>('[data-title] [data-w]')], still ? 1 : span(t, .06, .3), still);
    reveal([...el.querySelectorAll<HTMLElement>('[data-intro] [data-w]')], still ? 1 : span(t, .78, .95), still);
    el.querySelector<HTMLElement>('[data-hint]')!.style.opacity = String(1 - span(autoEnter ? scroll : t, 0, .04));
    // The navigation bar reads dark on the white board, light on the photo
    stage.toggleAttribute('data-nav-light', open < .5);
  });

  return <section className={css.exHero} ref={root} id="overview">
    <div className={css.exStage} data-stage data-nav-light>
      <div className={css.exGrid} data-grid aria-hidden="true">{Array.from({ length: 13 }, (_, i) => <i key={i} />)}</div>
      <div className={css.exBoard}>
        <div className={`${css.exPiece} ${css.exTitle}`} data-piece data-title>
          <small>{words(`${service.group} · ${service.title}`)}</small>
          <h1>{words(service.headline)}</h1>
        </div>
        <div className={`${css.exPiece} ${css.exPhotoTile}`} data-piece data-photo-tile aria-hidden="true">
          <div className={css.exPhotoInner} data-photo-inner><Image src={service.image} alt="" fill sizes="100vw" priority /></div>
        </div>
        <div className={`${css.exPiece} ${css.exSpecimen}`} data-piece aria-hidden="true">
          <span>Aa</span>
          <small>Typeface · Regular</small>
        </div>
        <div className={`${css.exPiece} ${css.exSwatches}`} data-piece aria-hidden="true">
          {TONES.map(tone => <div key={tone.hex}><i style={{ background: tone.hex }} /><small>{tone.name}<br />{tone.hex.toUpperCase()}</small></div>)}
        </div>
      </div>
      <div className={css.exPhotoFull} data-photo-full aria-hidden="true"><Image src={service.image} alt="" fill sizes="100vw" /></div>
      <p className={`${css.heroIntro} ${css.exIntro}`} data-intro>{words(service.intro)}</p>
      <span className={css.exHint} data-hint aria-hidden="true">Scroll</span>
    </div>
  </section>;
}

// ---------------------------------------------------------------------------
// How we work: a walkthrough inside a browser window
// ---------------------------------------------------------------------------
function ResearchScreen({ notes }: { notes: string[] }) {
  return <div className={css.screenResearch}>
    <small>Research board</small>
    <div>{notes.slice(0, 6).map((note, i) => <p key={note} style={{ rotate: `${[-2, 1.5, -1, 2, -1.5, 1][i]}deg` }}>{note}</p>)}</div>
  </div>;
}

function WireframeScreen() {
  return <div className={css.screenWire}>
    <div className={css.wireBar}><i /><i /><i /><i /></div>
    <div className={css.wireHero}><i /><i /><i /></div>
    <div className={css.wireCards}><i /><i /><i /></div>
    <span className={css.wireCursor} aria-hidden="true" />
  </div>;
}

function LiveScreen({ service }: { service: Service }) {
  return <div className={css.screenLive}>
    <div className={css.liveImage}><Image src={service.image} alt="" fill sizes="40vw" /></div>
    <div className={css.liveCopy}>
      <span className={css.liveBadge}>● Live</span>
      <strong>{service.headline}</strong>
      <span className={css.liveButton}>Get in touch</span>
    </div>
    <div className={css.liveBars}>{[38, 52, 47, 66, 74, 88].map((h, i) => <i key={i} style={{ height: `${h}%` }} />)}</div>
  </div>;
}

function DigitalWalkthrough({ service, steps, notes }: { service: Service; steps: Service['steps']; notes: string[] }) {
  const root = useRef<HTMLElement>(null);
  useFrame(root, el => {
    if (isStill() || window.innerWidth <= 760) return;
    const stages = [...el.querySelectorAll<HTMLElement>('[data-digital-stage]')];
    if (!stages.length) return;
    const focus = window.innerHeight * .52;
    const centers = stages.map(stage => {
      const box = stage.getBoundingClientRect();
      return box.top + box.height / 2;
    });
    let active = 0;
    let shot = 0;
    el.querySelectorAll<HTMLElement>('[data-digital-preview]').forEach((preview, i) => {
      const cut = (centers[i - 1] + centers[i]) / 2;
      const duration = window.innerHeight * .14;
      const reveal = i === 0 ? 1 : ease(span(focus, cut - duration, cut + duration));
      preview.style.setProperty('--reveal', String(reveal));
      if (reveal >= .5) active = i;
      if (i > 0) shot += reveal;
    });
    stages.forEach((stage, i) => stage.toggleAttribute('data-current', i === active));
    const camera = el.querySelector<HTMLElement>('[data-digital-camera]')!;
    const push = shot / Math.max(1, stages.length - 1);
    camera.style.setProperty('--push', String(push));
    camera.style.setProperty('--yaw', `${mix(-28, 8, span(push, 0, .5)) * (1 - span(push, .5, 1))}deg`);
    camera.style.setProperty('--pitch', `${mix(12, -7, span(push, 0, .5)) * (1 - span(push, .5, 1))}deg`);
  });

  const screens = [<ResearchScreen key="research" notes={notes} />, <WireframeScreen key="design" />, <LiveScreen key="live" service={service} />];
  return <section ref={root} className={`${css.walk} ${css.digitalWalk}`} id="approach">
    <h2>How we work</h2>
    <div className={css.digitalLayout}>
      <div className={css.digitalStages}>
        {steps.map((step, i) => <article key={step.title} className={css.digitalStage} data-digital-stage data-current={i === 0 ? '' : undefined}>
          <h3>{step.title}</h3>
          <p>{step.body}</p>
          <div className={`${css.device} ${css.digitalInline}`} aria-hidden="true">
            <div className={css.deviceBar}><i /><i /><i /><span>{step.title}</span></div>
            <div className={css.deviceView}>{screens[Math.min(i, screens.length - 1)]}</div>
          </div>
        </article>)}
      </div>
      <div className={css.digitalSticky} aria-hidden="true">
        <div className={`${css.device} ${css.digitalCamera}`} data-digital-camera>
          {steps.map((step, i) => <div key={step.title} className={css.digitalPreview} data-digital-preview>
            <div className={css.deviceBar}><i /><i /><i /><span>{step.title}</span></div>
            <div className={css.deviceView}>{screens[Math.min(i, screens.length - 1)]}</div>
          </div>)}
        </div>
      </div>
    </div>
  </section>;
}

type WalkthroughProps = { service: Service; steps: Service['steps']; keywords: string[]; notes: string[] };

export function DeviceWalkthrough(props: WalkthroughProps) {
  return props.service.slug === 'digital-solutions' ? <DigitalWalkthrough {...props} /> : <LegacyWalkthrough {...props} />;
}

function LegacyWalkthrough({ service, steps, keywords, notes }: WalkthroughProps) {
  const root = useRef<HTMLElement>(null);
  const n = steps.length;
  useFrame(root, el => {
    const still = isStill();
    const t = still ? 0 : pinned(el);
    // Hold on each screen, then scroll to the next
    const u = span(t, .04, .92) * (n - 1 + .5);
    const k = Math.min(n - 1, Math.floor(u));
    const move = k < n - 1 ? ease(span(u - k, .6, 1)) : 0;
    const at = still ? 0 : k + move;
    const screen = el.querySelector<HTMLElement>('[data-screen]')!;
    screen.style.transform = still ? '' : `translate3d(0, ${(-at * 100 / n).toFixed(3)}%, 0)`;
    el.querySelectorAll<HTMLElement>('[data-screen-dot]').forEach((dot, i) => dot.toggleAttribute('data-on', Math.round(at) === i));
    el.querySelector<HTMLElement>('[data-url]')!.textContent = `gemstrat.com/${['discover', 'design', 'live'][Math.min(2, Math.round(at))]}`;
    // The words for the current step
    el.querySelectorAll<HTMLElement>('[data-step-copy]').forEach((copy, i) => {
      const amount = still ? 1 : clamp(1 - Math.abs(at - i) * 2.2);
      copy.style.visibility = amount > 0 ? 'visible' : 'hidden';
      reveal([...copy.querySelectorAll<HTMLElement>('[data-w]')], amount, still);
    });
    const counter = el.querySelector<HTMLElement>('[data-step-count]');
    if (counter) counter.textContent = String(Math.round(at) + 1).padStart(2, '0');
    // The window tilts gently into place as the section begins
    const arrive = still ? 1 : ease(span(t, 0, .08));
    el.querySelector<HTMLElement>('[data-device]')!.style.transform = `perspective(1400px) rotateX(${((1 - arrive) * 14).toFixed(2)}deg) translate3d(0, ${((1 - arrive) * 6).toFixed(2)}svh, 0)`;
  });

  const screens = [<ResearchScreen key="r" notes={notes} />, <WireframeScreen key="w" />, <LiveScreen key="l" service={service} />];
  return <section className={css.walk} ref={root} id="approach" style={{ height: `${(n + 1) * 100}svh` }}>
    <div className={css.walkStage}>
      <div className={css.walkCopy}>
        <p className={css.walkMeta}><span>How we work</span><span><b data-step-count>01</b> / {String(n).padStart(2, '0')}</span></p>
        <div className={css.walkSteps}>{steps.map((step, i) => <div key={step.title} data-step-copy className={css.walkStep}>
          <small>{words(`${String(i + 1).padStart(2, '0')} · ${keywords[i] ?? ''}`)}</small>
          <h3>{words(step.title)}</h3>
          <p>{words(step.body)}</p>
        </div>)}</div>
      </div>
      <div className={css.device} data-device aria-hidden="true">
        <div className={css.deviceBar}><i /><i /><i /><span data-url>gemstrat.com/discover</span></div>
        <div className={css.deviceView}>
          <div className={css.deviceScreen} data-screen style={{ height: `${n * 100}%` }}>
            {steps.map((step, i) => <div key={step.title} className={css.deviceScreenPart} style={{ height: `${100 / n}%` }}>{screens[Math.min(i, screens.length - 1)]}</div>)}
          </div>
        </div>
        <div className={css.deviceDots}>{steps.map((step, i) => <i key={step.title} data-screen-dot data-on={i === 0 ? '' : undefined} />)}</div>
      </div>
    </div>
  </section>;
}
