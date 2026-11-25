'use client';

import Image from 'next/image';
import { useEffect, useRef, type RefObject } from 'react';
import type { Service } from '@/data/redesign/content';
import { clamp, ease, isLite, isStill, mix, pinned, reveal, span, words } from './serviceMotion';
import css from './service.module.css';

// ---------------------------------------------------------------------------
// The Intelligence practice's service pages (AI Consulting, AI Strategy,
// AI & Intelligent Automation) share the template but have their own hero
// and How we work:
//   IntelligenceHero  points of light drift at random around the headline;
//                     scrolling gathers them into a data field of the photo,
//                     and the introduction follows over it
//   NetworkApproach   the steps are nodes in a network; lines draw between
//                     them as you scroll, and data pulses run along them
// ---------------------------------------------------------------------------

/** A repeatable pseudo-random number in [0, 1) */
const rand = (seed: number) => {
  const v = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return v - Math.floor(v);
};

/** Runs `tick` every animation frame while the element is on screen */
function useLiveFrames(ref: RefObject<HTMLElement | null>, tick: (el: HTMLElement, time: number) => void) {
  const latest = useRef(tick);
  useEffect(() => { latest.current = tick; });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let frame = 0;
    let visible = false;
    const loop = (time: number) => {
      latest.current(el, time / 1000);
      if (visible) frame = requestAnimationFrame(loop);
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      cancelAnimationFrame(frame);
      if (visible) frame = requestAnimationFrame(loop);
    });
    observer.observe(el);
    return () => { observer.disconnect(); cancelAnimationFrame(frame); };
  }, [ref]);
}

/**
 * A headline as four lines, two pairs, for the stepped setting of the Our
 * approach heading ("Find where / AI can" + "make a / difference.")
 */
/** Headlines set by hand where the automatic split doesn't read well */
const HEADLINE_LINES: Record<string, string[]> = {
  'Give your AI ambition a direction.': ['Give your AI', 'ambition a direction.'],
};

function stepLines(text: string) {
  if (HEADLINE_LINES[text]) return HEADLINE_LINES[text];
  const all = text.split(' ');
  // Two words a line, four lines at most (anything left joins the last)
  const lines: string[] = [];
  for (let i = 0; i < all.length; i += 2) lines.push(all.slice(i, i + 2).join(' '));
  while (lines.length > 4) lines.splice(3, 2, `${lines[3]} ${lines[4]}`);
  return lines;
}

// ---------------------------------------------------------------------------
// Hero: from scattered points to a sharp picture
// ---------------------------------------------------------------------------
interface Dot { hx: number; hy: number; sx: number; sy: number; light: number; coarse: number; phase: number; figure: boolean }

/** Generation: how long the picture takes to form from noise, and the photo reveal after it (seconds) */
const GENERATE = 3.2;
const REVEAL = 1.1;

export function IntelligenceHero({ service }: { service: Service }) {
  const root = useRef<HTMLElement>(null);
  const field = useRef<{ dots: Dot[]; cell: number; ratio: number; cols: number; rows: number } | null>(null);
  const formedAt = useRef(0);
  // Clicking the field sends a ripple out from the click
  const hold = useRef({ ripple: { at: -10, x: 0, y: 0 } });

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const stage = el.querySelector<HTMLElement>('[data-hold]')!;
    const click = (e: PointerEvent) => {
      if (e.button !== 0) return;
      const box = stage.getBoundingClientRect();
      hold.current.ripple = { at: performance.now() / 1000, x: e.clientX - box.left, y: e.clientY - box.top };
    };
    stage.addEventListener('pointerdown', click);
    return () => stage.removeEventListener('pointerdown', click);
  }, []);

  // Sample the photo into a grid of dots (on load and on resize)
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const canvas = el.querySelector<HTMLCanvasElement>('[data-field]')!;
    const image = new window.Image();
    const build = () => {
      if (!image.naturalWidth) return;
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      canvas.width = Math.round(w * ratio);
      canvas.height = Math.round(h * ratio);
      const cell = w < 700 ? 9 : Math.max(10, Math.round(w / 128));
      const cols = Math.ceil(w / cell);
      const rows = Math.ceil(h / cell);
      const sample = document.createElement('canvas');
      sample.width = cols;
      sample.height = rows;
      const context = sample.getContext('2d', { willReadFrequently: true });
      if (!context) return;
      const scale = Math.max(cols / image.naturalWidth, rows / image.naturalHeight);
      const dw = image.naturalWidth * scale;
      const dh = image.naturalHeight * scale;
      context.drawImage(image, (cols - dw) / 2, (rows - dh) / 2, dw, dh);
      const data = context.getImageData(0, 0, cols, rows).data;
      const dots: Dot[] = [];
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const k = (row * cols + col) * 4;
          const light = (data[k] * .299 + data[k + 1] * .587 + data[k + 2] * .114) / 255;
          const seed = row * 977 + col;
          dots.push({
            hx: col * cell + cell / 2, hy: row * cell + cell / 2,
            sx: rand(seed) * w, sy: rand(seed + .5) * h,
            light, coarse: light, phase: rand(seed + .25) * Math.PI * 2,
            figure: light > .55 && (col * 7 + row * 13) % 37 === 0,
          });
        }
      }
      // The rough layout a generator finds first: each square's 8×8 neighbourhood, averaged
      const B = 8;
      for (let br = 0; br < rows; br += B) {
        for (let bc = 0; bc < cols; bc += B) {
          let sum = 0, count = 0;
          for (let r = br; r < Math.min(rows, br + B); r++) for (let c = bc; c < Math.min(cols, bc + B); c++) { sum += dots[r * cols + c].light; count++; }
          for (let r = br; r < Math.min(rows, br + B); r++) for (let c = bc; c < Math.min(cols, bc + B); c++) dots[r * cols + c].coarse = sum / count;
        }
      }
      field.current = { dots, cell, ratio, cols, rows };
    };
    image.onload = build;
    image.src = service.image;
    const resize = new ResizeObserver(build);
    resize.observe(canvas);
    return () => { resize.disconnect(); image.onload = null; };
  }, [service.image]);

  useLiveFrames(root, (el, time) => {
    const still = isStill();
    const lite = isLite();
    const progressive = service.slug === 'ai-consulting' || service.slug === 'ai-strategy';
    const buildTime = progressive ? 2.15 : GENERATE;
    const revealTime = progressive ? 1.1 : REVEAL;
    const t = still ? 1 : pinned(el);
    const canvas = el.querySelector<HTMLCanvasElement>('[data-field]')!;

    // The data field simply fades in once the page has loaded (about 0.6s)
    if (field.current && !formedAt.current) formedAt.current = time;
    const appear = still ? 1 : formedAt.current ? ease(clamp((time - formedAt.current) / .6)) : 0;
    const assemble = 1;
    // The field dims a little once the headline gives way to the introduction
    const dim = mix(1, .55, span(t, .62, .75));

    const context = canvas.getContext('2d');
    const f = field.current;
    canvas.style.visibility = still || lite ? 'hidden' : 'visible';
    if (context && f && !still && !lite) {
      const { dots, cell, ratio } = f;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.font = `${Math.round(cell * .8)}px ui-monospace, Menlo, monospace`;
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      const h = hold.current;
      const sinceRipple = time - h.ripple.at;
      const rippleFront = sinceRipple * 760;
      const rippleSize = 22 * Math.exp(-sinceRipple * 1.6);
      // Generation, the way an AI image model works: the squares are laid down
      // as noise, then the noise is removed; the rough layout (light and dark
      // areas) appears first and the detail sharpens last
      const since = still ? 99 : Math.max(0, time - formedAt.current);
      const g = clamp(since / buildTime);
      const { cols, rows } = f;
      // Once formed, the squares give way to the photograph itself
      const finish = span(since, buildTime, buildTime + revealTime);
      const photoIn = progressive ? finish : ease(finish);
      for (let i = 0; i < dots.length; i++) {
        const dot = dots[i];
        // A soft diagonal sweep lays the squares down from the top left; each one
        // arrives as still grey noise and settles into the picture (no flicker)
        const row = Math.floor(i / cols), col = i % cols;
        const diagonal = (row / rows + col / cols) / 2;
        // A stable grain preview gives way to large tonal shapes and then detail.
        const cluster = Math.floor(row / 4) * 997 + Math.floor(col / 4);
        const variation = rand(cluster + 29);
        const local = progressive
          ? span(g, .19 + diagonal * .09 + variation * .12, .78 + variation * .17)
          : clamp(g * 1.45 - diagonal * .45);
        const arrived = progressive ? ease(span(g, 0, .16)) : ease(clamp(local / .18));
        const noise = (1 - local) ** 1.6;
        const detail = ease(span(local, .35, 1));
        const n = rand(i * 1.7 + 11);
        const light = progressive
          ? mix(.08 + n * .48, mix(dot.coarse, dot.light, detail), ease(span(local, 0, .65)))
          : clamp(mix(dot.coarse, dot.light, detail) * (1 - noise) + n * .7 * noise);
        // Each point travels on its own slightly delayed path
        const own = ease(clamp((assemble - dot.phase / 30) / (1 - .21)));
        // Until it settles, it wanders on its own slow loop
        const wander = (1 - own) * 46;
        let x = mix(dot.sx, dot.hx, own) + Math.sin(time * .35 + dot.phase * 3) * wander;
        let y = mix(dot.sy, dot.hy, own) + Math.cos(time * .28 + dot.phase * 5) * wander;
        // Clicked: a ripple rings out from the click
        if (!progressive && rippleSize > .3) {
          const dx = x - h.ripple.x, dy = y - h.ripple.y;
          const r = Math.hypot(dx, dy) || 1;
          const wave = Math.exp(-((r - rippleFront) ** 2) / (2 * 70 * 70)) * Math.sin((r - rippleFront) / 24);
          x += dx / r * wave * rippleSize;
          y += dy / r * wave * rippleSize;
        }
        const twinkle = .78 + .22 * Math.sin(time * 2.2 + dot.phase);
        // The photo opens through random tiles (4×4 squares each), each at its own moment
        const tileStart = diagonal * .24 + variation * .46;
        const swept = progressive
          ? ease(span(photoIn, tileStart, tileStart + .26))
          : photoIn <= 0 ? 0 : clamp((photoIn * 1.18 - rand(cluster * 3.1 + 5) * .85) / .16);
        // Until its tile opens, a dark cell keeps the photo hidden underneath
        if (photoIn > 0 && swept < 1) {
          context.fillStyle = `rgba(9,9,9,${(1 - swept).toFixed(3)})`;
          context.fillRect(dot.hx - cell / 2, dot.hy - cell / 2, cell + .5, cell + .5);
        }
        const alpha = clamp((.14 + light * .82) * twinkle * dim * mix(.55, 1, own)
          * appear * arrived * (1 - swept));
        if (alpha < .03) continue;
        context.fillStyle = `rgba(255,255,255,${alpha.toFixed(3)})`;
        if (dot.figure && own > .9 && g >= 1) {
          context.fillText(String(Math.floor((dot.light * 97 + time * 3 + dot.phase * 9) % 99)).padStart(2, '0'), x, y);
        } else {
          const r = Math.max(.6, light ** 1.4 * cell * .44) * mix(.5, 1, own);
          // A square (the same block as the pixel wipes), sized by brightness
          context.fillRect(x - r, y - r, r * 2, r * 2);
        }
      }
    }

    // The headline lands once the picture has resolved, holds, then gives way to the introduction
    const resolved = still || lite ? 1 : formedAt.current
      ? progressive ? span(time - formedAt.current, 1.25, buildTime + .45) : span(time - formedAt.current, GENERATE + .4, GENERATE + 1.2)
      : 0;
    // The photograph: revealed at the end of the generation, dimmed for the introduction
    const photo = el.querySelector<HTMLElement>('[data-photo]')!;
    const since2 = formedAt.current ? time - formedAt.current : 0;
    // Shown underneath as soon as the reveal starts; the tiles in the square field uncover it
    const opening = still || lite ? 1 : progressive
      ? ease(span(since2, buildTime, buildTime + revealTime))
      : span(since2, GENERATE, GENERATE + .05);
    photo.style.opacity = opening > 0 ? '1' : '0';
    if (progressive) photo.style.setProperty('--focus-blur', `${(1 - opening) * 2.5}px`);
    photo.style.setProperty('--dim', String(mix(.62, .4, span(t, .6, .75))));
    reveal([...el.querySelectorAll<HTMLElement>('[data-title] [data-w]')], still ? 1 : resolved * (1 - span(t, .55, .66)), still);
    reveal([...el.querySelectorAll<HTMLElement>('[data-intro] [data-w]')], still ? 1 : span(t, .68, .88), still);
    el.querySelector<HTMLElement>('[data-hint]')!.style.opacity = String(1 - span(t, 0, .05));
  });

  return <section className={`${css.hero} ${css.ixHero}`} ref={root} id="overview">
    <div className={`${css.heroStage} ${css.ixStage}`} data-hold>
      <div className={css.ixPhoto} data-photo aria-hidden="true"><Image src={service.image} alt="" fill sizes="100vw" priority /></div>
      <canvas className={css.ixField} data-field aria-hidden="true" />
      <div className={css.ixShade} aria-hidden="true" />
      {/* The headline, centred as one block like the Our approach heading */}
      <div className={css.ixTitle} data-title>
        <h1 aria-label={service.headline}>{stepLines(service.headline).map((line, i, all) => <span key={i} aria-hidden="true"
          className={`${css.stepLine} ${i >= all.length / 2 ? css.stepLineIn : ''} ${i === Math.ceil(all.length / 2) ? css.stepLineGap : ''}`}>{words(line)}</span>)}</h1>
      </div>
      <p className={css.heroIntro} data-intro>{words(service.intro)}</p>
      <span className={css.hint} data-hint aria-hidden="true">Scroll</span>
    </div>
  </section>;
}

// ---------------------------------------------------------------------------
// How we work: a network
// ---------------------------------------------------------------------------

/** Where each step's node sits (percent of the stage), for 3 or more steps */
function nodeAt(i: number, n: number, narrow: boolean) {
  if (narrow) return { x: [26, 72, 34, 70][i % 4], y: 18 + (i / Math.max(1, n - 1)) * 40 };
  return { x: 14 + (i / Math.max(1, n - 1)) * 64, y: [58, 30, 52, 34][i % 4] };
}

/** A faint background constellation: points and the links between near ones */
// (rounded, so the server and the browser produce exactly the same markup)
const STARS = Array.from({ length: 42 }, (_, i) => ({ x: Math.round((4 + rand(i + 3) * 92) * 10) / 10, y: Math.round((8 + rand(i + 40) * 74) * 10) / 10 }));
const LINKS = STARS.flatMap((a, i) => STARS.slice(i + 1).map((b, j) => ({ a: i, b: i + 1 + j, d: Math.hypot(a.x - b.x, (a.y - b.y) * 1.6) })))
  .filter(link => link.d < 13);

export function NetworkApproach({ steps, keywords }: { steps: Service['steps']; keywords: string[] }) {
  const root = useRef<HTMLElement>(null);
  const n = steps.length;

  useLiveFrames(root, (el, time) => {
    const still = isStill();
    const narrow = window.innerWidth <= 760;
    const t = still ? 1 : pinned(el);
    // The network grows from one step to the next; each step holds while you read
    const u = span(t, .04, .92) * (n - 1 + .6);
    const reached = Math.min(n - 1, Math.floor(u + .0001));

    // Nodes
    el.querySelectorAll<HTMLElement>('[data-node]').forEach((node, i) => {
      const p = nodeAt(i, n, narrow);
      node.style.left = `${p.x}%`;
      node.style.top = `${p.y}%`;
      const on = still ? 1 : clamp((u - i + .35) / .35);
      node.style.setProperty('--on', on.toFixed(3));
      node.toggleAttribute('data-active', !still && reached === i);
    });

    // Links between steps: each draws as the next step comes up
    el.querySelectorAll<SVGLineElement>('[data-link]').forEach((line, i) => {
      const a = nodeAt(i, n, narrow);
      const b = nodeAt(i + 1, n, narrow);
      line.setAttribute('x1', `${a.x}%`); line.setAttribute('y1', `${a.y}%`);
      line.setAttribute('x2', `${b.x}%`); line.setAttribute('y2', `${b.y}%`);
      const drawn = still ? 1 : ease(span(u, i + .45, i + 1));
      line.style.strokeDashoffset = String(1 - drawn);
    });

    // Data pulses travel along every drawn link, from step to step
    el.querySelectorAll<SVGCircleElement>('[data-pulse]').forEach(pulse => {
      const i = Number(pulse.dataset.pulse);
      const drawn = still ? 0 : ease(span(u, i + .45, i + 1));
      const a = nodeAt(i, n, narrow);
      const b = nodeAt(i + 1, n, narrow);
      const along = ((time * .35 + Number(pulse.dataset.offset)) % 1) * drawn;
      pulse.setAttribute('cx', `${mix(a.x, b.x, along)}%`);
      pulse.setAttribute('cy', `${mix(a.y, b.y, along)}%`);
      pulse.style.opacity = drawn > .98 ? String(Math.sin(along * Math.PI)) : '0';
    });

    // The background constellation brightens as the network grows
    const glow = still ? .5 : span(u, 0, n - 1);
    el.querySelector<SVGGElement>('[data-stars]')!.style.opacity = String(.25 + glow * .45);

    // The current step's words, along the foot of the screen
    el.querySelectorAll<HTMLElement>('[data-step-copy]').forEach((copy, i) => {
      const amount = still ? 1 : span(u - i, -.05, .2) * (i === n - 1 ? 1 : 1 - span(u - i, .7, .85));
      copy.style.visibility = amount > 0 ? 'visible' : 'hidden';
      reveal([...copy.querySelectorAll<HTMLElement>('[data-w]')], amount, still);
    });
    const counter = el.querySelector<HTMLElement>('[data-step-count]');
    if (counter) counter.textContent = String(reached + 1).padStart(2, '0');
  });

  return <section className={css.network} ref={root} id="approach" style={{ height: `${(n + 1) * 100}svh` }}>
    <div className={css.networkStage}>
      <p className={css.stepMeta}><span>How we work</span><span><b data-step-count>01</b> / {String(n).padStart(2, '0')}</span></p>
      <svg className={css.networkLines} aria-hidden="true">
        <g data-stars>
          {LINKS.map(link => <line key={`${link.a}-${link.b}`} x1={`${STARS[link.a].x}%`} y1={`${STARS[link.a].y}%`} x2={`${STARS[link.b].x}%`} y2={`${STARS[link.b].y}%`} className={css.starLink} />)}
          {STARS.map((star, i) => <circle key={i} cx={`${star.x}%`} cy={`${star.y}%`} r="1.6" className={css.star} />)}
        </g>
        {steps.slice(1).map((_, i) => <line key={i} data-link pathLength={1} className={css.link} />)}
        {steps.slice(1).flatMap((_, i) => [0, .33, .66].map(offset => <circle key={`${i}-${offset}`} data-pulse={i} data-offset={offset} r="3" className={css.pulse} />))}
      </svg>
      {steps.map((step, i) => <div className={css.node} data-node key={step.title}>
        <i aria-hidden="true" />
        <span>{String(i + 1).padStart(2, '0')} · {keywords[i]}</span>
      </div>)}
      {steps.map(step => <div className={css.networkCopy} data-step-copy key={step.title}>
        <h3>{words(step.title)}</h3>
        <p>{words(step.body)}</p>
      </div>)}
    </div>
  </section>;
}
