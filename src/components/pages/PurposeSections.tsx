'use client';

import { useEffect, useRef, type CSSProperties } from 'react';
import Link from 'next/link';
import AnimatedAbstractArtwork from '@/components/abstract/AnimatedAbstractArtwork';
import { onScrollFrame } from '@/lib/scrollFrame';
import { setWordStyle } from '@/lib/wordStyle';
import styles from './purpose-sections.module.css';

const PRINCIPLES = [
  { title: 'People at the centre.', body: 'Every organisation is made of people. We listen to their realities, respect their experience and build solutions they can believe in, use and carry forward.' },
  { title: 'Clarity in every decision.', body: 'We ask the questions that matter. Connecting strategy, technology and brand, we make complex challenges understandable and the next step clear.' },
  { title: 'Ownership from day one.', body: 'We take responsibility for the work we do together. From the first conversation to implementation, we help your teams build the confidence and capability to sustain progress.' },
];

function Words({ text, step = 45, maxDelay = 700 }: { text: string; step?: number; maxDelay?: number }) {
  return text.split(' ').map((word, i) => <span key={i} className={styles.word} style={{ '--word-delay': `${Math.min(i * step, maxDelay)}ms` } as CSSProperties}>{word}{' '}</span>);
}

function revealWords(words: HTMLElement[], progress: number) {
  const wordWindow = 0.22;
  words.forEach((word, i) => {
    const start = (i / Math.max(1, words.length - 1)) * (1 - wordWindow);
    const p = Math.min(1, Math.max(0, (progress - start) / wordWindow));
    setWordStyle(word, p, (1 - p) * 12, (1 - p) * 20);
  });
}

export default function PurposeSections() {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const section = document.getElementById('purpose');
    if (!section || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const statementWords = Array.from(section.querySelectorAll<HTMLElement>(`.${styles.purposeStatement} .${styles.word}`));
    const noteWords = Array.from(section.querySelectorAll<HTMLElement>(`.${styles.purposeNote} .${styles.word}`));
    const rule = section.querySelector<HTMLElement>(`.${styles.purposeNote} .${styles.rule}`);
    return onScrollFrame(() => {
      const height = window.innerHeight;
      const hero = document.querySelector<HTMLElement>('main > header');
      const heroBottom = hero?.getBoundingClientRect().bottom ?? height * 2;
      const zStart = window.scrollY + heroBottom - height;
      const textStart = zStart + height * 0.55;
      const leftProgress = (window.scrollY - textStart) / height;
      const rightProgress = (window.scrollY - textStart - height) / (height * 0.75);
      revealWords(statementWords, leftProgress);
      revealWords(noteWords, rightProgress);
      if (rule) rule.style.opacity = String(Math.min(1, Math.max(0, rightProgress)));
    });
  }, []);

  useEffect(() => {
    const el = root.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (typeof IntersectionObserver === 'undefined') {
      el.querySelectorAll('[data-reveal]').forEach((node) => node.classList.add(styles.shown));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add(styles.shown);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    el.querySelectorAll('[data-reveal]').forEach((node) => observer.observe(node));
    el.classList.add(styles.motionReady);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={root} className={styles.root}>
      <section id="purpose" className={styles.purpose} aria-labelledby="purpose-heading">
        <div className={styles.purposePin}>
          <h2 id="purpose-heading" className={`${styles.statement} ${styles.purposeStatement}`}><Words text="To help ambitious businesses move forward. With clarity, with confidence, and with a lasting positive impact." /></h2>
          <div className={styles.purposeNote}><span className={styles.rule} /><p><Words text="Progress means more when it strengthens the people, organisations and communities behind it." /></p></div>
        </div>
      </section>

      <section className={styles.mission} data-nav-light aria-labelledby="mission-heading">
        <div className={styles.missionGrid}>
          <div className={styles.missionCopy}>
            <h2 id="mission-heading" className={styles.heading} data-reveal><Words text="Make the complex clear. Make progress real." /></h2>
            <p data-reveal><Words text="We bring the right minds together to connect the ambition of a business with the systems, experiences and actions that make it possible." step={28} /></p>
            <p data-reveal><Words text="Working alongside your people, we turn a shared direction into practical change — and build the capability to keep it moving." step={28} /></p>
          </div>
          <div className={styles.artwork} aria-label="Abstract contour ribbon">
            <AnimatedAbstractArtwork name="contour-ribbon" className={styles.ribbon} showReplay={false} />
          </div>
        </div>
      </section>

      <section className={styles.principles} aria-labelledby="principles-heading">
        <h2 id="principles-heading" className={styles.heading} data-reveal><Words text="What guides us." /></h2>
        <div className={styles.principleList}>
          {PRINCIPLES.map((principle, i) => <article key={principle.title} className={styles.principle} data-reveal>
            <span className={styles.number}>0{i + 1}</span>
            <h3><Words text={principle.title} /></h3>
            <p>{principle.body}</p>
          </article>)}
        </div>
      </section>

      <section id="contact" className={styles.contact} aria-labelledby="purpose-contact-heading">
        <h2 id="purpose-contact-heading" className={styles.heading} data-reveal><Words text="What matters to you?" /><br /><span className={styles.muted}><Words text="Let’s build from there." /></span></h2>
        <div className={styles.contactBottom}>
          <p>Every meaningful change starts with a conversation.</p>
          <Link href="/#contact" className={styles.contactLink}>Start a conversation <span aria-hidden="true">↗</span></Link>
        </div>
        <div className={styles.related}><Link href="/#about-intro">Our approach <span aria-hidden="true">↗</span></Link><Link href="/#leadership">Meet our leadership <span aria-hidden="true">↗</span></Link></div>
      </section>
    </div>
  );
}
