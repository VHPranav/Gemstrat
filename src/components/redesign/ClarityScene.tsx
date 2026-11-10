'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { onScrollFrame } from '@/lib/scrollFrame';
import { setWordStyle } from '@/lib/wordStyle';
import { S_PIECES } from '@/lib/heroObject';
import css from './clarity-scene.module.css';
import { ABOUT_CONTENT, type ClarityContent } from './clarityContent';

const Mark = dynamic(() => import('./ClarityMark'), { ssr: false });
const clamp = (n: number) => Math.max(0, Math.min(1, n));
const span = (p: number, a: number, b: number) => clamp((p - a) / (b - a));
const fallbackOffsets = [[-16, -12, -18], [15, 13, 14], [-19, 6, -28], [13, -14, 37], [19, -3, -17]];
const splitWords = (text: string) => text.split(' ').map((w, j) => <span key={j} data-belief-word>{w}{' '}</span>);

// Share of the scroll the original story + belief take; the practice phase gets the rest
const STORY = .615;

export default function ClarityScene({ content = ABOUT_CONTENT, label = 'About Gemstrat: from different perspectives to a shared direction' }: { content?: ClarityContent; label?: string }) {
  const words = content.heroLines.flat();
  const wordCount = words.length;
  const approach = content.variant === 'approach';
  const [time, setTime] = useState(['--', '--']);
  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime([String(now.getHours()).padStart(2, '0'), String(now.getMinutes()).padStart(2, '0')]);
    };
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, []);
  const root = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const phase = useRef({ raw: 0, q: 0 });
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    // Hero words leave in a shuffled order
    const order = [3, 1, 5, 0, 4, 2, 6, 7, 8].filter(i => i < wordCount);
    return onScrollFrame(() => {
      const total = clamp(-el.getBoundingClientRect().top / Math.max(1, el.offsetHeight - window.innerHeight));
      const raw = clamp(total / STORY);
      const q = clamp((total - STORY) / (1 - STORY));
      // The original story runs over the first 80%; the belief phase takes the rest
      const p = clamp(raw / .8);
      progress.current = p;
      phase.current.raw = raw; phase.current.q = q;
      const leave = span(p, .025, .2);
      el.querySelectorAll<HTMLElement>('[data-hero-word]').forEach((word, i) => {
        const rank = order.indexOf(i);
        const w = motion.matches ? leave : clamp((leave - rank / (wordCount - 1) * .6) / .4);
        setWordStyle(word, 1 - w, w * 14, -w * 16);
      });
      el.style.setProperty('--clock-opacity', String(1 - leave));
      const subtext = el.querySelector<HTMLElement>('[data-hero-subtext]');
      if (subtext) {
        subtext.style.opacity = String(1 - leave);
        subtext.style.filter = `blur(${motion.matches ? 0 : leave * 12}px)`;
      }
      const assembly = span(p, .3, .77);
      el.style.setProperty('--assembly', String(assembly));
      const fallback = el.querySelector<SVGSVGElement>('[data-flat-mark]');
      if (fallback) {
        const halfH = (window.innerWidth < 640 ? 5 : 3.5) * (23.879 / 2.6);
        const halfW = halfH * window.innerWidth / window.innerHeight;
        fallback.setAttribute('viewBox', `${82.55-halfW} ${11.94-halfH} ${halfW*2} ${halfH*2}`);
      }
      el.querySelectorAll<SVGElement>('[data-flat-piece]').forEach((piece, i) => {
        const [x, y, rotation] = fallbackOffsets[i];
        const reveal = span(p, .205 + i * .028, .265 + i * .028);
        piece.style.opacity = String(reveal);
        piece.style.filter = motion.matches ? 'none' : `blur(${(1 - reveal) * 2.5}px)`;
        piece.setAttribute('transform', `translate(${x * (1 - assembly)} ${y * (1 - assembly) + (motion.matches ? 0 : (1 - reveal) * 3)}) rotate(${rotation * (1 - assembly)} 82.55 11.94)`);
      });
      el.querySelectorAll<HTMLElement>('[data-statement]').forEach((text, i) => {
        // Each statement holds, then leaves well before the next arrives
        const a = .21 + i * .23;
        // Words arrive by a + ~.07, hold fully readable until a + .17, then leave
        const exit = span(p, a + .17, a + .21);
        text.setAttribute('aria-hidden', p < a || exit >= 1 ? 'true' : 'false');
        text.querySelectorAll<HTMLElement>('[data-statement-word]').forEach((word, index) => {
          const enter = span(p, a + index * .012, a + .04 + index * .012);
          const visible = enter * (1 - exit);
          setWordStyle(word, visible, motion.matches ? 0 : (1-visible)*16, motion.matches ? 0 : (1-enter)*24-exit*16);
        });
      });
      // Approach: four numbered steps, each in, held, then out
      el.querySelectorAll<HTMLElement>('[data-step]').forEach((stepEl, i) => {
        const a = .2 + i * .17;
        const exit = span(p, a + .13, a + .165);
        stepEl.setAttribute('aria-hidden', p < a || exit >= 1 ? 'true' : 'false');
        const num = stepEl.querySelector<HTMLElement>('[data-step-number]');
        if (num) {
          const v = span(p, a, a + .05) * (1 - exit);
          setWordStyle(num, v, motion.matches ? 0 : (1 - v) * 16, motion.matches ? 0 : (1 - v) * 40);
        }
        // Every word is in by a + .065 however long the step is, then the
        // whole step holds until a + .13
        const stepWords = stepEl.querySelectorAll<HTMLElement>('[data-step-word]');
        const stagger = .03 / Math.max(1, stepWords.length);
        stepWords.forEach((word, index) => {
          const enter = span(p, a + .01 + index * stagger, a + .035 + index * stagger);
          const visible = enter * (1 - exit);
          setWordStyle(word, visible, motion.matches ? 0 : (1 - visible) * 16, motion.matches ? 0 : (1 - enter) * 24 - exit * 16);
        });
      });
      el.style.setProperty('--closing', String(span(p, .88, .96)));
      el.querySelectorAll<HTMLElement>('[data-closing-word]').forEach((word, i) => {
        const enter = span(p, .88 + i * .008, .93 + i * .008);
        const exit = span(raw, .82 + i * .004, .86 + i * .004);
        const visible = enter * (1 - exit);
        setWordStyle(word, visible, motion.matches ? 0 : (1 - visible) * 16, motion.matches ? 0 : (1 - enter) * 24 - exit * 16);
      });
      const beliefWords = el.querySelectorAll<HTMLElement>('[data-belief-word]');
      const step = .07 / Math.max(1, beliefWords.length);
      beliefWords.forEach((word, i) => {
        // Stagger fits the whole block inside .87–.98, whatever the word count
        const enter = span(raw, .87 + i * step, .91 + i * step);
        const exit = span(q, .03 + i * .0006, .065 + i * .0006);
        const visible = enter * (1 - exit);
        setWordStyle(word, visible, motion.matches ? 0 : (1 - visible) * 16, motion.matches ? 0 : (1 - enter) * 24 - exit * 16);
      });
      const beliefOn = raw > .9 && q < .05;
      // Practice: the Z stays put; the title arrives on the left, then the
      // four cards arrive on the right one at a time
      el.querySelectorAll<HTMLElement>('[data-practice-word]').forEach((word, i) => {
        const enter = span(q, .085 + i * .012, .135 + i * .012);
        setWordStyle(word, enter, motion.matches ? 0 : (1 - enter) * 16, motion.matches ? 0 : (1 - enter) * 24);
      });
      const cards = el.querySelectorAll<HTMLElement>('[data-practice-card]');
      cards.forEach((card, i) => {
        // The cards share the rest of the phase evenly, however many there are
        const slot = .84 / cards.length;
        const s = .16 + i * slot;
        const enter = span(q, s, s + .06);
        const exit = i === cards.length - 1 ? 0 : span(q, s + slot * .84, s + slot);
        const visible = enter * (1 - exit);
        card.style.opacity = visible > 0 ? '1' : '0';
        // Word by word: heading, then text, then the button, in and out
        const cardWords = card.querySelectorAll<HTMLElement>('[data-card-word]');
        const step = .03 / Math.max(1, cardWords.length);
        cardWords.forEach((word, j) => {
          const wIn = span(q, s + j * step, s + .03 + j * step);
          const wOut = i === cards.length - 1 ? 0 : span(q, s + slot * .84 + j * step * .3, s + slot * .95 + j * step * .3);
          const v = wIn * (1 - wOut);
          setWordStyle(word, v, motion.matches ? 0 : (1 - v) * 16, motion.matches ? 0 : (1 - wIn) * 24 - wOut * 16);
        });
        card.style.pointerEvents = visible > .6 ? 'auto' : 'none';
        card.setAttribute('aria-hidden', visible > .5 ? 'false' : 'true');
      });
      el.style.setProperty('--practice', String(span(q, .14, .2)));
      el.querySelectorAll<HTMLElement>('[data-belief]').forEach(b => { b.setAttribute('aria-hidden', beliefOn ? 'false' : 'true'); b.style.pointerEvents = beliefOn ? 'auto' : 'none'; });
    });
  }, [wordCount]);
  return <section ref={root} className={`${css.scene} ${approach ? css.sceneLong : ''}`} id="overview" aria-label={label}>
    <div className={css.stage} data-nav-light>
      <div className={css.visual} aria-hidden="true">
        <svg data-flat-mark className={css.fallback} viewBox="35 -30 95 85"><g transform="translate(165.1 0) scale(-1 1)">{S_PIECES.map((piece, i) => <g key={i} data-flat-piece style={{ opacity: 0 }} transform={`translate(${fallbackOffsets[i][0]} ${fallbackOffsets[i][1]}) rotate(${fallbackOffsets[i][2]} 82.55 11.94)`}><polygon points={piece.map(([x,y]) => `${x},${y}`).join(' ')} fill="currentColor" /></g>)}</g></svg>
        <Mark progress={progress} phase={phase} build={approach ? 'wireframe' : 'scatter'} />
      </div>
      <header className={css.hero}>
        <span className={`${css.clock} ${css.hours}`} aria-hidden="true">{time[0]}</span>
        <span className={css.clockAccessible} role="timer" aria-label={`Your local time ${time[0]}:${time[1]}`} />
        <span className={`${css.clock} ${css.minutes}`} aria-hidden="true">:{time[1]}</span>
        <h1 aria-label={words.join(' ')}>{content.heroLines.map((line, row) => { const start = content.heroLines.slice(0, row).flat().length; return <span className={css.headingLine} key={row}>{line.map((word, k) => { const i = start + k; return <span data-hero-word key={i}><span className={css.introWord} style={{ animationDelay: `${.12 + i * .1}s` }}>{word}</span></span>; })}</span>; })}</h1>
        <p className={css.heroSubtext} data-hero-subtext aria-label={content.heroSubtext}>{content.heroSubtext.split(' ').map((w, j) => <span key={j} aria-hidden="true"><span className={css.introWord} style={{ animationDelay: `${.6 + j * .06}s` }}>{w}</span>{' '}</span>)}</p>
      </header>
      {approach && content.steps && <div className={css.steps}>{content.steps.map((st, i) => <article data-step key={st.title} className={css.step} aria-hidden="true">
        <div className={css.stepLead}><span className={css.stepNumber} data-step-number>0{i + 1}</span><h2>{st.title.split(' ').map((w, j) => <span key={j} data-step-word>{w}{' '}</span>)}</h2></div>
        <div className={css.stepBody}><p>{st.body.split(' ').map((w, j) => <span key={j} data-step-word>{w}{' '}</span>)}</p><small>{st.detail.split(' ').map((w, j) => <span key={j} data-step-word>{w}{' '}</span>)}</small></div>
      </article>)}</div>}
      <div className={css.statements}>{(approach ? [] : content.statements).map((text, i) => <h2 data-statement key={text} className={css.statement}>{text.split(' ').map((word, j) => <span key={j} data-statement-word>{word}{' '}</span>)}</h2>)}</div>
      <p className={css.closing} aria-label={content.closing.join(' ')}>{content.closing.map((line, l) => <span key={l} aria-hidden="true" style={{ display: 'block' }}>{line.split(' ').map((w, j) => <span key={j} data-closing-word>{w}{' '}</span>)}</span>)}</p>
      <div className={`${css.belief} ${approach ? css.mirror : ''}`} data-belief aria-hidden="true">
        <h2>{splitWords(content.belief.title)}</h2>
        <div>
          <p>{splitWords(content.belief.body)}</p>
          <Link className={css.beliefLink} href={content.belief.link.href} data-belief-word>{content.belief.link.label} →</Link>
        </div>
      </div>
      <div className={`${css.practice} ${approach ? css.mirror : ''}`} id="explore">
        <h2 className={css.practiceTitle} aria-label={content.practice.title}>{content.practice.title.split(' ').map((w, j) => <span key={j} aria-hidden="true" data-practice-word>{w}{' '}</span>)}</h2>
        <div className={css.practiceCards}>
          {content.practice.cards.map(item => <article key={item.title} className={css.practiceCard} data-practice-card aria-hidden="true">
            <div className={css.practiceText}>
              <h3 aria-label={item.title}>{item.title.split(' ').map((w, j) => <span key={j} aria-hidden="true" data-card-word>{w}{' '}</span>)}</h3>
              <p aria-label={item.body}>{item.body.split(' ').map((w, j) => <span key={j} aria-hidden="true" data-card-word>{w}{' '}</span>)}</p>
              <Link className={css.beliefLink} href={item.href} data-card-word>{item.label ?? 'Explore'} →</Link>
            </div>
          </article>)}
        </div>
      </div>
    </div>
  </section>;
}
