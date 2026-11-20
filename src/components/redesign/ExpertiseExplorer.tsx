'use client';

import Link from 'next/link';
import { useState } from 'react';
import { services } from '@/data/redesign/content';
import { challenges } from './expertiseContent';
import css from './expertise.module.css';

export default function ExpertiseExplorer() {
  const [selected, setSelected] = useState(challenges[0].id);
  const active = challenges.find(challenge => challenge.id === selected)!;
  const relevant = active.services.map(slug => services.find(service => service.slug === slug)!);

  return <section className={css.explorer} id="challenges">
    <h2>What are you<br />working through?</h2>
    <div className={css.explorerGrid}>
      <div className={css.questions} role="group" aria-label="Choose your business challenge">
        {challenges.map(challenge => <button key={challenge.id} type="button" aria-pressed={challenge.id === selected}
          aria-controls="challenge-services" onClick={() => setSelected(challenge.id)}>
          {challenge.question}<span aria-hidden="true">↗</span>
        </button>)}
      </div>
      <div id="challenge-services" className={css.answer} aria-live="polite">
        <p>{active.body}</p>
        <ul>{relevant.map(service => <li key={service.slug}><Link href={`/services/${service.slug}`}>{service.title}<span aria-hidden="true">↗</span></Link></li>)}</ul>
        <Link className={css.textLink} href="/contact">Discuss your challenge <span aria-hidden="true">↗</span></Link>
      </div>
    </div>
  </section>;
}
