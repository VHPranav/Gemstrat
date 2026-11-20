'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { onScrollFrame } from '@/lib/scrollFrame';
import { setWordStyle } from '@/lib/wordStyle';
import { capabilities } from './expertiseContent';
import { CapabilityVisual } from './ExpertiseScene';
import css from './expertise.module.css';

const clamp = (value: number) => Math.max(0, Math.min(1, value));
const words = (text: string) => text.split(' ').map((word, i) => <span key={i} data-capability-word>{word}{' '}</span>);

export default function ExpertiseCapabilities() {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const sections = [...root.current!.querySelectorAll<HTMLElement>('[data-capability]')];
    const groups = sections.map(section => [...section.querySelectorAll<HTMLElement>('[data-capability-word]')]);
    let frame = 0;
    const followHash = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(() => {
          const id = window.location.hash.slice(1);
          if (id === 'capabilities' || id === 'challenges' || capabilities.some(capability => capability.id === id)) {
            document.getElementById(id)?.scrollIntoView();
          }
        });
      });
    };
    followHash();
    window.addEventListener('hashchange', followHash);
    const unsubscribe = onScrollFrame(() => {
      const still = matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.dataset.perf === 'lite';
      sections.forEach((section, i) => {
        const progress = clamp((window.innerHeight - section.getBoundingClientRect().top) / (window.innerHeight * .9));
        section.style.setProperty('--image-reveal', String(still ? 1 : clamp((progress - .22) / .65)));
        groups[i].forEach((word, index) => {
          const delay = index / Math.max(1, groups[i].length) * .28;
          const shown = still ? 1 : clamp((progress - .04 - delay) / .35);
          setWordStyle(word, shown, (1 - shown) * 8, (1 - shown) * 8);
        });
      });
    });
    return () => {
      unsubscribe();
      cancelAnimationFrame(frame);
      window.removeEventListener('hashchange', followHash);
    };
  }, []);

  return <div ref={root} className={css.capabilities} id="capabilities">
    {capabilities.map(capability => <section className={css.capabilityRun} id={capability.id} key={capability.id} data-capability>
      <div className={css.capabilityStage}>
        <div className={css.capabilityCopy}>
          <h2>{words(capability.title)}</h2>
          <p className={css.description}>{words(capability.body)}</p>
          <p className={css.outputs}>{capability.outputs}</p>
          <ul className={css.serviceLinks}>{capability.services.map(service => <li key={service.slug}>
            <Link href={`/services/${service.slug}`}>{service.title}<span aria-hidden="true">↗</span></Link>
          </li>)}</ul>
        </div>
        <CapabilityVisual src={capability.image} alt={capability.alt} />
      </div>
    </section>)}
  </div>;
}
