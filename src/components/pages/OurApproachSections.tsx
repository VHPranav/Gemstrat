'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import AbstractArtwork from '@/components/abstract/AbstractArtwork';
import AnimatedAbstractArtwork from '@/components/abstract/AnimatedAbstractArtwork';
import InkSectionTransition from '@/components/ui/InkSectionTransition';
import { onScrollFrame } from '@/lib/scrollFrame';
import styles from './our-approach-sections.module.css';

const STAGES = [
  { title: 'See the whole picture.', short: 'Discover', art: 'angular-convergence', body: 'We start by listening. To your people, your customers and the realities of your business. We question assumptions, connect the evidence and find the challenge worth solving.' },
  { title: 'Choose a clear direction.', short: 'Align', art: 'radial-framework', body: 'Together, we turn insight into choices. We agree what matters, where to focus and what success should look like — giving your teams a direction they can act on.' },
  { title: 'Make the thinking tangible.', short: 'Create', art: 'geometric-lattice', body: 'Strategy becomes something people can experience. We connect brand, design and technology, exploring ideas through prototypes and testing them with the people who will use them.' },
  { title: 'Build the next chapter.', short: 'Advance', art: 'wave-bands', body: 'We work with your teams to put the work into practice. Clear ownership, useful tools and a rhythm of learning help progress continue beyond the first launch.' },
];

export default function OurApproachSections() {
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const stages = Array.from(root.current?.querySelectorAll<HTMLElement>('[data-process-stage]') ?? []);
    if (!stages.length) return;
    return onScrollFrame(() => {
      const middle = window.innerHeight / 2;
      let nearest = 0;
      let distance = Infinity;
      stages.forEach((stage, index) => {
        const rect = stage.getBoundingClientRect();
        const nextDistance = Math.abs(rect.top + rect.height / 2 - middle);
        if (nextDistance < distance) {
          nearest = index;
          distance = nextDistance;
        }
      });
      setActive((previous) => previous === nearest ? previous : nearest);
    });
  }, []);

  useEffect(() => {
    const el = root.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add(styles.visible);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    el.querySelectorAll('[data-approach-reveal]').forEach((section) => observer.observe(section));
    el.classList.add(styles.motion);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={root} className={styles.root}>
      <InkSectionTransition>
      <section id="our-approach" className={styles.manifesto} aria-labelledby="approach-statement">
        <h2 id="approach-statement" className={styles.statement} data-approach-reveal>Big questions.<br /><span>Connected thinking.</span><br />A way forward.</h2>
        <div className={styles.manifestoBottom}>
          <span className={styles.downArrow} aria-hidden="true">↘</span>
          <p data-approach-reveal>Business challenges rarely sit in one discipline. Neither do we. We bring different perspectives into the same conversation, so every decision connects to the bigger picture.</p>
        </div>
        <div className={styles.connection} aria-hidden="true"><AbstractArtwork name="interlocking-loops" className={styles.connectionArt} /></div>
      </section>

      </InkSectionTransition>

      <section className={styles.method} data-nav-light aria-labelledby="approach-method">
        <div className={styles.methodHeading} data-approach-reveal><h2 id="approach-method">Clarity at every turn.</h2><p>A flexible process, shaped around your challenge.<br />Explore how the work comes together.</p></div>
        <div className={styles.methodGrid}>
          <div className={styles.stages}>
            {STAGES.map((stage, index) => (
              <article key={stage.short} data-process-stage className={`${styles.stage} ${active === index ? styles.active : ''}`}>
                <h3>{stage.short}</h3>
                <div className={styles.stageContent}>
                  <h4>{stage.title}</h4><p>{stage.body}</p>
                </div>
              </article>
            ))}
          </div>
          <div className={styles.methodArt}>
            <div key={active} className={styles.artEntrance}><AnimatedAbstractArtwork name={STAGES[active].art} className={styles.abstract} showReplay={false} transparentBackground /></div>
          </div>
        </div>
      </section>

      <section className={styles.partnership} aria-labelledby="approach-partnership">
        <div className={styles.partnershipHeading} data-approach-reveal><h2 id="approach-partnership">In the room.<br /><span>On your side.</span></h2><p>We bring curiosity, challenge and care to the work. Your experience and our perspective become one team, with shared responsibility for moving things forward.</p></div>
        <div className={styles.commitments}>
          <article data-approach-reveal><span>01</span><h3>Ask better questions.</h3><p>We stay curious, make room for different views and challenge ideas with evidence.</p></article>
          <article data-approach-reveal><span>02</span><h3>Make it together.</h3><p>We work openly with your people, sharing the thinking and building confidence along the way.</p></article>
          <article data-approach-reveal><span>03</span><h3>Keep it useful.</h3><p>Every recommendation needs a role in the real world. We connect the ambition to the detail of delivery.</p></article>
        </div>
      </section>

      <section id="contact" className={styles.invitation} data-nav-light aria-labelledby="approach-contact">
        <h2 id="approach-contact" data-approach-reveal>What could we<br /><span>move forward?</span></h2>
        <Link href="/#contact" className={styles.contactLink}>Let’s work it out together <span aria-hidden="true">↗</span></Link>
        <div className={styles.footerLinks}><Link href="/our-purpose">Explore our purpose <span aria-hidden="true">↗</span></Link><Link href="/focus-areas">Discover what we do <span aria-hidden="true">↗</span></Link></div>
      </section>
    </div>
  );
}
