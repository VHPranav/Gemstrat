'use client';

import Image from 'next/image';
import gsap from 'gsap';
import { useEffect, useRef, type ReactNode } from 'react';
import { onScrollFrame } from '@/lib/scrollFrame';
import { setWordStyle } from '@/lib/wordStyle';
import css from './theory.module.css';
import { CASES, HERO_PROBLEMS, formatFigure } from './theoryContent';

// ---------------------------------------------------------------------------
// FocusScene ("Into focus")
// One pinned, scroll-driven stage. The hero is a wall of blurred problem
// words that clear away as the title sharpens. Then each featured case plays
// out over a full-screen image that starts blurred and grey (the challenge),
// sharpens (our approach) and lands in full colour (the outcome, with its
// figures counting up), before blurring back out for the next case.
// ---------------------------------------------------------------------------

const clamp = (n: number) => Math.max(0, Math.min(1, n));
const span = (p: number, a: number, b: number) => clamp((p - a) / (b - a));

const FEATURED = CASES.filter(c => c.featured);
// Share of the scroll the hero takes; the cases split the rest evenly
const WIPE_START = .09;
const HERO_END = .18;
const CASE_LEN = (1 - HERO_END) / FEATURED.length;
const CASE_WIPE_LENGTH = CASE_LEN * .15;

// Where each problem word sits in the hero wall (% of the stage), its size
// and how soft it starts
const WALL: [number, number, number, number][] = [
  [8, 20, 1.4, 1], [30, 13, 1, 3], [56, 17, 1.7, 0], [80, 24, 1.1, 2],
  [5, 44, 1, 2], [22, 32, 1.2, 4], [75, 40, 1.5, 1], [90, 52, 1, 3],
  [12, 66, 1.6, 0], [33, 78, 1, 2], [62, 70, 1.2, 3], [84, 74, 1.4, 1],
  [46, 88, .9, 4], [20, 90, 1.1, 1], [70, 90, 1, 2], [48, 8, 1, 2],
  [16, 10, .9, 3], [71, 9, 1, 2], [93, 18, 1.2, 4], [39, 27, .9, 2],
  [64, 29, 1.1, 3], [8, 56, .9, 2], [18, 78, 1, 3], [94, 65, 1.1, 2],
  [94, 87, .9, 4], [57, 94, 1, 3], [6, 84, .9, 2], [77, 59, 1, 4],
];

const words = (text: string, attr = 'data-w') => text.split(' ').map((w, j) => <span key={j} {...{ [attr]: '' }}>{w}{' '}</span>);

/** A text block that blurs in word by word over [inA, inB] of its case and out over [outA, outB] */
function Block({ className, timing, children }: { className: string; timing: [number, number, number, number]; children: ReactNode }) {
  return <div className={className} data-fx={timing.join(',')} aria-hidden="true">{children}</div>;
}

export default function FocusScene() {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const stage = el.querySelector<HTMLElement>('[data-stage]')!;
    const problems = Array.from(el.querySelectorAll<HTMLElement>('[data-problem]'));
    const titleWords = Array.from(el.querySelectorAll<HTMLElement>('[data-title-word]'));
    const hero = el.querySelector<HTMLElement>('header')!;
    const subWords = Array.from(el.querySelectorAll<HTMLElement>('[data-sub-word]'));
    const cases = Array.from(el.querySelectorAll<HTMLElement>('[data-case]'));
    const dots = Array.from(el.querySelectorAll<HTMLElement>('[data-dot]'));
    const counter = el.querySelector<HTMLElement>('[data-counter]');
    const fill = el.querySelector<HTMLElement>('[data-fill]');
    const wipe = el.querySelector<HTMLCanvasElement>('[data-wipe]')!;
    const context = wipe.getContext('2d');
    let heroProgress = 0;
    let stageWidth = stage.clientWidth;
    let stageHeight = stage.clientHeight;
    let elapsed = 0;
    let speed = 1;
    let previousScroll = window.scrollY;
    let wordsRunning = false;

    const animateWords = (_time: number, deltaMs: number) => {
      const seconds = Math.min(deltaMs, 50) / 1000;
      const scrollDistance = Math.abs(window.scrollY - previousScroll);
      previousScroll = window.scrollY;
      const targetSpeed = 1 + Math.min(4, scrollDistance / Math.max(seconds, .001) / 400);
      speed += (targetSpeed - speed) * (1 - Math.exp(-seconds * 5));
      if (document.hidden) return;
      if (!motion.matches) elapsed += seconds * speed / 12;
      problems.forEach((word, i) => {
        const phase = elapsed + i * .618;
        const progress = motion.matches ? .4 : phase % 1;
        const distance = .45 + progress * 2.7;
        const [x, y, , softness] = WALL[i];
        const offsetX = (x / 100 - .5) * stageWidth * (distance - 1);
        const offsetY = (y / 100 - .5) * stageHeight * (distance - 1);
        const visibility = span(progress, 0, .15) * (1 - span(progress, .8, 1));
        word.style.opacity = String(.38 * visibility * (1 - span(heroProgress, WIPE_START, HERO_END)));
        word.style.filter = motion.matches ? 'none' : `blur(${softness + 1}px)`;
        word.style.transform = motion.matches ? 'none' : `translate3d(${offsetX}px, ${offsetY}px, 0) scale(${1 + .08 * progress})`;
        const text = HERO_PROBLEMS[(i + Math.floor(phase)) % HERO_PROBLEMS.length];
        if (word.textContent !== text) word.textContent = text;
      });
    };

    // A stable cell pattern makes the dissolve reversible when scrolling back.
    const drawWipe = (progress: number, outgoing: HTMLElement, whiteBackground: boolean) => {
      if (!context) return;
      const width = stage.clientWidth;
      const height = stage.clientHeight;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      if (wipe.width !== Math.round(width * ratio) || wipe.height !== Math.round(height * ratio)) {
        wipe.width = Math.round(width * ratio);
        wipe.height = Math.round(height * ratio);
      }
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.clearRect(0, 0, width, height);
      const cell = width < 640 ? 6 : 8;
      const band = height * .14;
      const edge = height + band - progress * (height + band * 2);
      let titleMask = '';
      context.font = `${cell * .65}px monospace`;
      context.textAlign = 'center';
      const letters = 'THINKINGPUTTOWORK';
      for (let column = 0; column * cell < width; column++) {
        const x = column * cell;
        const position = x / width;
        // Overlapping waves give the frontier unequal peaks and troughs.
        // The envelope settles both endpoints and stays reversible on scroll.
        const wave = Math.sin(position * Math.PI * 2.3 + .4) * .09
          + Math.sin(position * Math.PI * 5.7 + 1.8) * .045
          + Math.sin(position * Math.PI * 10.1 + .7) * .018;
        const columnEdge = edge + height * wave * Math.sin(progress * Math.PI);
        const top = Math.max(0, Math.floor((columnEdge - band) / cell) * cell);
        context.fillStyle = '#fff';
        if (whiteBackground) context.fillRect(x, 0, cell + .5, top);
        titleMask += `M${x} 0h${cell + .5}v${top}h${-cell - .5}Z`;
        for (let row = top / cell; row * cell < Math.min(height, columnEdge + band); row++) {
          const seed = Math.sin(column * 127.1 + row * 311.7) * 43758.5453;
          const noise = seed - Math.floor(seed);
          const coverage = clamp((columnEdge + band * (noise - .5) - row * cell) / cell);
          if (coverage > .45) {
            context.fillStyle = '#fff';
            if (whiteBackground) context.fillRect(column * cell, row * cell, cell + .5, cell + .5);
            titleMask += `M${column * cell} ${row * cell}h${cell + .5}v${cell + .5}h${-cell - .5}Z`;
          }
          if (Math.abs(row * cell - columnEdge) < band * .65 && noise > .72) {
            context.fillStyle = whiteBackground && coverage > .45 ? '#777' : '#aaa';
            context.fillText(letters[(row + column) % letters.length], (column + .5) * cell, (row + .8) * cell);
          }
        }
      }
      outgoing.style.clipPath = `path('${titleMask}')`;
    };

    const stopScroll = onScrollFrame(() => {
      const still = motion.matches;
      const pixelWipe = !still && context !== null;
      const blur = (v: number) => (still ? 0 : v);
      const total = clamp(-el.getBoundingClientRect().top / Math.max(1, el.offsetHeight - window.innerHeight));

      heroProgress = total;
      stageWidth = stage.clientWidth;
      stageHeight = stage.clientHeight;
      const shouldAnimate = total < HERO_END && !still;
      if (shouldAnimate !== wordsRunning) {
        wordsRunning = shouldAnimate;
        previousScroll = window.scrollY;
        if (shouldAnimate) gsap.ticker.add(animateWords);
        else gsap.ticker.remove(animateWords);
      }
      if (still) animateWords(0, 0);
      const heroOut = still || !context ? span(total, HERO_END - .02, HERO_END + .012) : 0;
      hero.style.visibility = total < (still || !context ? HERO_END + .012 : HERO_END) ? 'visible' : 'hidden';
      hero.style.clipPath = 'none';
      titleWords.forEach(w => {
        setWordStyle(w, 1 - heroOut, blur(heroOut * 16), -heroOut * 16);
      });
      subWords.forEach(w => {
        setWordStyle(w, 1 - heroOut, blur(heroOut * 14), -heroOut * 14);
      });
      const wiping = !still && context !== null && total >= WIPE_START && total < HERO_END;
      wipe.style.visibility = wiping ? 'visible' : 'hidden';
      if (wiping) drawWipe(span(total, WIPE_START, HERO_END), hero, true);

      // Navbar: dark over the white hero, light over the case images
      if (total < HERO_END - .008) stage.setAttribute('data-nav-light', ''); else stage.removeAttribute('data-nav-light');

      // Cases
      let active = -1;
      cases.forEach((c, i) => {
        const start = HERO_END + i * CASE_LEN;
        const last = i === cases.length - 1;
        const t = clamp((total - start) / CASE_LEN);
        c.style.clipPath = 'none';
        c.style.zIndex = '3';
        const before = total < (i === 0 ? WIPE_START : start - (pixelWipe ? CASE_WIPE_LENGTH : .02));
        const after = !last && total >= start + CASE_LEN + (pixelWipe ? 0 : .02);
        if (before || after) { c.style.visibility = 'hidden'; return; }
        c.style.visibility = 'visible';
        if (total >= start && (last || total < start + CASE_LEN)) active = i;
        // The image: in over black, then from blurred grey to sharp colour,
        // then (except the last) blurred again and out
        const imgIn = pixelWipe ? 1 : span(total, start - .02, start + .012);
        const imgOut = last || pixelWipe ? 0 : span(t, .95, 1);
        const unfocus = last || pixelWipe ? 0 : span(t, .88, .95);
        c.style.opacity = String(imgIn * (1 - imgOut));
        const media = c.querySelector<HTMLElement>('[data-media]');
        if (media) media.style.transform = still ? 'none' : `scale(${1.1 - .1 * t})`;
        const grey = c.querySelector<HTMLElement>('[data-grey]');
        const colour = c.querySelector<HTMLElement>('[data-colour]');
        if (grey) grey.style.opacity = String(span(t, .32, .55) * (1 - unfocus));
        if (colour) colour.style.opacity = String(span(t, .52, .7) * (1 - unfocus));

        c.querySelectorAll<HTMLElement>('[data-fx]').forEach(block => {
          const [inA, inB, outA, outB] = block.dataset.fx!.split(',').map(Number);
          const exit = (last || pixelWipe) && outA >= .85 ? 0 : span(t, outA, outB);
          const ws = block.querySelectorAll<HTMLElement>('[data-w]');
          const step = (inB - inA) * .6 / Math.max(1, ws.length);
          let shown = 0;
          ws.forEach((w, j) => {
            const enter = span(t, inA + j * step, inA + j * step + (inB - inA) * .4);
            const v = enter * (1 - exit);
            shown = Math.max(shown, v);
            setWordStyle(w, v, blur((1 - v) * 16), still ? 0 : (1 - enter) * 22 - exit * 14);
          });
          block.setAttribute('aria-hidden', shown > .5 ? 'false' : 'true');
        });
        // Figures count up as the outcome lands
        const count = span(t, .64, .8);
        c.querySelectorAll<HTMLElement>('[data-figure]').forEach(f => {
          const fig = FEATURED[i].figures[Number(f.dataset.figure)];
          f.textContent = formatFigure(fig, still ? 1 : 1 - Math.pow(1 - count, 3));
        });
      });

      // Keep the outgoing story above the incoming image and dissolve its
      // silhouette using the same pixel frontier as the title transition.
      if (pixelWipe) {
        const next = cases.findIndex((_, i) => i > 0
          && total >= HERO_END + i * CASE_LEN - CASE_WIPE_LENGTH
          && total < HERO_END + i * CASE_LEN);
        if (next > 0) {
          const boundary = HERO_END + next * CASE_LEN;
          cases[next].style.zIndex = '2';
          wipe.style.visibility = 'visible';
          drawWipe(span(total, boundary - CASE_WIPE_LENGTH, boundary), cases[next - 1], false);
        }
      }

      // Progress: which case, and how far through the stories
      const casesOn = span(total, HERO_END - .01, HERO_END + .01);
      if (counter) { counter.style.opacity = String(casesOn); counter.style.pointerEvents = casesOn > .5 ? 'auto' : 'none'; }
      dots.forEach((d, i) => d.toggleAttribute('data-active', i === active));
      if (fill) fill.style.transform = `scaleY(${span(total, HERO_END, 1)})`;
    });
    return () => {
      stopScroll();
      gsap.ticker.remove(animateWords);
    };
  }, []);

  return <section ref={root} className={css.scene} aria-label="Theory by Gemstrat: case studies">
    <div className={css.stage} data-stage data-nav-light>
      {/* Hero */}
      <div className={css.wall} aria-hidden="true">
        {WALL.map(([x, y, size], i) => <span key={i} data-problem className={css.problem} style={{ left: `${x}%`, top: `${y}%`, fontSize: `calc(var(--problem) * ${size})` }}>{HERO_PROBLEMS[i % HERO_PROBLEMS.length]}</span>)}
      </div>
      <header className={css.hero}>
        <h1 aria-label="Thinking, put to work."><span data-title-word aria-hidden="true">Thinking,</span><span data-title-word aria-hidden="true">put to work.</span></h1>
        <p aria-label="Our Success Stories. Real challenges. Measurable progress.">{words('Our Success Stories. Real challenges. Measurable progress.', 'data-sub-word')}</p>
      </header>

      {/* Cases */}
      {FEATURED.map((c, i) => <article key={c.slug} className={css.case} data-case aria-label={c.title} style={{ visibility: 'hidden' }}>
        <div className={css.media} data-media aria-hidden="true">
          <Image className={css.blurred} src={c.image} alt="" fill sizes="100vw" />
          <Image className={css.grey} data-grey src={c.image} alt="" fill sizes="100vw" />
          <Image className={css.colour} data-colour src={c.image} alt="" fill sizes="100vw" />
        </div>
        <div className={css.shade} aria-hidden="true" />
        <Block className={css.meta} timing={[0, .06, .9, .95]}>
          <span data-w>{`0${i + 1}`}</span> <span data-w>—</span> {words(`${c.practice} · ${c.industry}, ${c.location}`)}<em data-w>Illustrative engagement</em>
        </Block>
        <Block className={css.challenge} timing={[.04, .14, .27, .32]}>
          <small>{words('The challenge')}</small>
          <h2>{words(c.title)}</h2>
          <p>{words(c.challenge)}</p>
        </Block>
        <Block className={css.approach} timing={[.35, .45, .55, .6]}>
          <small>{words('Our approach')}</small>
          <p>{words(c.approach)}</p>
          <ul>{c.tags.map(tag => <li key={tag} data-w>{tag}</li>)}</ul>
        </Block>
        <Block className={css.outcome} timing={[.62, .7, .88, .93]}>
          <small>{words('The outcome')}</small>
          <div className={css.figures}>{c.figures.map((f, k) => <div key={k} data-w><strong data-figure={k}>{formatFigure(f)}</strong><span>{f.label}</span></div>)}</div>
          <p>{words(c.result)}</p>
        </Block>
      </article>)}

      <canvas className={css.wipe} data-wipe aria-hidden="true" />

      {/* Progress through the cases */}
      <nav className={css.counter} data-counter aria-label="Case progress" style={{ opacity: 0 }}>
        <span className={css.track}><span className={css.fill} data-fill /></span>
        <ol>{FEATURED.map((c, i) => <li key={c.slug} data-dot>{`0${i + 1}`}</li>)}</ol>
      </nav>
    </div>
  </section>;
}
