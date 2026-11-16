'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import css from './theory.module.css';
import { CASES, PRACTICES, formatFigure, type CaseStudy, type Practice } from './theoryContent';

// ---------------------------------------------------------------------------
// CaseIndex
// Every case as one typographic row, filterable by practice. Hovering a row
// floats its image beside the cursor; clicking opens the full case in a side
// panel on the same page, with its own #link so it can be shared.
// ---------------------------------------------------------------------------

export default function CaseIndex() {
  const [filter, setFilter] = useState<Practice | 'All'>('All');
  const [open, setOpen] = useState<CaseStudy | null>(null);
  const [hovered, setHovered] = useState<number>(-1);
  const preview = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);
  const list = filter === 'All' ? CASES : CASES.filter(c => c.practice === filter);

  // The floating preview trails the cursor
  useEffect(() => {
    const el = preview.current;
    if (!el) return;
    const x = gsap.quickTo(el, 'x', { duration: .45, ease: 'power3' });
    const y = gsap.quickTo(el, 'y', { duration: .45, ease: 'power3' });
    const move = (e: PointerEvent) => { x(e.clientX + 28); y(e.clientY - 120); };
    window.addEventListener('pointermove', move);
    return () => window.removeEventListener('pointermove', move);
  }, []);

  const show = useCallback((c: CaseStudy) => {
    lastFocus.current = document.activeElement as HTMLElement;
    setOpen(c);
    history.replaceState(null, '', `#${c.slug}`);
  }, []);
  const close = useCallback(() => {
    setOpen(null);
    history.replaceState(null, '', location.pathname + location.search);
    lastFocus.current?.focus();
  }, []);

  // A shared #link opens its case
  useEffect(() => {
    const fromHash = () => {
      const c = CASES.find(k => `#${k.slug}` === location.hash);
      if (c) { setOpen(c); document.getElementById('cases')?.scrollIntoView(); }
    };
    fromHash();
    window.addEventListener('hashchange', fromHash);
    return () => window.removeEventListener('hashchange', fromHash);
  }, []);

  // While the panel is open: Escape closes it, focus moves into it, and the
  // page behind doesn't scroll
  useEffect(() => {
    if (!open) return;
    closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    const block = (e: Event) => { if (!(e.target as HTMLElement).closest('[data-panel]')) e.preventDefault(); };
    window.addEventListener('keydown', onKey);
    window.addEventListener('wheel', block, { passive: false });
    window.addEventListener('touchmove', block, { passive: false });
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('wheel', block);
      window.removeEventListener('touchmove', block);
    };
  }, [open, close]);

  return <section className={css.index} id="cases" data-nav-light>
    <div className={css.indexHead}>
      <h2>Every challenge, its own way forward.</h2>
      <p>Browse every case by practice. Open one to see the full story. <em>These are sample cases that show the layout; real client work will replace them.</em></p>
    </div>
    <div className={css.filters} role="group" aria-label="Filter cases by practice">
      {(['All', ...PRACTICES] as const).map(p => <button key={p} type="button" className={filter === p ? css.filterOn : ''} aria-pressed={filter === p} onClick={() => setFilter(p)}>{p}</button>)}
    </div>
    <ol className={css.rows} onPointerLeave={() => setHovered(-1)}>
      {list.map(c => {
        const n = CASES.indexOf(c);
        return <li key={c.slug}>
          <button type="button" className={css.row} onClick={() => show(c)} onPointerEnter={() => setHovered(n)} onFocus={() => setHovered(n)} onBlur={() => setHovered(-1)} aria-haspopup="dialog">
            <span className={css.rowNum}>{`0${n + 1}`}</span>
            <span className={css.rowTitle}>{c.title}</span>
            <span className={css.rowMeta}>{c.industry}, {c.location}</span>
            <span className={css.rowPractice}>{c.practice}</span>
            <span className={css.rowResult}><strong>{formatFigure(c.figures[0])}</strong> {c.figures[0].label}</span>
            <span className={css.rowArrow} aria-hidden="true">→</span>
          </button>
        </li>;
      })}
    </ol>

    {/* Floating image preview (pointer only) */}
    <div className={css.preview} ref={preview} aria-hidden="true">
      {CASES.map((c, i) => <Image key={c.slug} src={c.image} alt="" width={420} height={300} className={hovered === i && !open ? css.previewOn : ''} />)}
    </div>

    {/* Detail panel */}
    <div className={`${css.backdrop} ${open ? css.backdropOn : ''}`} onClick={close} aria-hidden="true" />
    <aside className={`${css.panel} ${open ? css.panelOn : ''}`} role="dialog" aria-modal="true" aria-label={open?.title ?? 'Case study'} aria-hidden={!open} data-panel data-lenis-prevent inert={!open}>
      {open && <>
        <button ref={closeBtn} type="button" className={css.panelClose} onClick={close}>Close <span aria-hidden="true">✕</span></button>
        <div className={css.panelImage}><Image src={open.image} alt="" fill sizes="(max-width:640px) 100vw, 640px" /></div>
        <div className={css.panelBody}>
          <span className={css.sample}>Sample case</span>
          <small>{open.practice} · {open.industry}, {open.location}</small>
          <h2>{open.title}</h2>
          <div className={css.panelFigures}>{open.figures.map((f, k) => <div key={k}><strong>{formatFigure(f)}</strong><span>{f.label}</span></div>)}</div>
          <h3>The challenge</h3><p>{open.challenge}</p>
          <h3>Our approach</h3><p>{open.approach}</p>
          <h3>Scope</h3><p>{open.scope}</p>
          <h3>What we delivered</h3><ul>{open.delivered.map(d => <li key={d}>{d}</li>)}</ul>
          <h3>The outcome</h3><p>{open.result}</p>
          {open.quote && <blockquote><p>“{open.quote.text}”</p><cite>{open.quote.by}</cite></blockquote>}
          <h3>Related services</h3>
          <div className={css.panelLinks}>{open.services.map(s => <Link key={s.href} href={s.href}>{s.title} →</Link>)}</div>
          <Link className={css.panelCta} href="/contact">Discuss a similar challenge →</Link>
        </div>
      </>}
    </aside>
  </section>;
}
