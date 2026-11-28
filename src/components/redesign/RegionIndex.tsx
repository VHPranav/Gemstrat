'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { presence } from './presenceContent';
import styles from './presence.module.css';

function subscribe(callback: () => void) {
  const timer = setInterval(callback, 1000);
  return () => clearInterval(timer);
}
export function usePresenceMinute() {
  return useSyncExternalStore(subscribe, () => Math.floor(Date.now() / 60000), () => null);
}
export function PresenceTime({ zone }: { zone: string }) {
  const minute = usePresenceMinute();
  return <span>{minute === null ? '––:––' : new Intl.DateTimeFormat('en-GB', {
    timeZone: zone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).format(minute * 60000)}</span>;
}

export default function RegionIndex() {
  const [open, setOpen] = useState('');
  useEffect(() => {
    function followHash() {
      const slug = window.location.hash.slice(1);
      if (presence.some(office => office.slug === slug)) {
        setOpen(slug);
        requestAnimationFrame(() => document.getElementById(slug)?.scrollIntoView());
      }
    }
    followHash();
    window.addEventListener('hashchange', followHash);
    return () => window.removeEventListener('hashchange', followHash);
  }, []);

  return <section className={styles.index} id="regions" data-nav-light>
    <h2>Where we work, and how.</h2>
    <p className={styles.indexIntro}>We don’t visit markets. We work within them.</p>
    {presence.map((office, i) => {
      const expanded = open === office.slug;
      const panel = `${office.slug}-details`;
      return <article key={office.slug} id={office.slug} className={styles.region}>
        <h3><button className={styles.row} type="button" aria-expanded={expanded} aria-controls={panel} onClick={() => {
          setOpen(expanded ? '' : office.slug);
          history.replaceState(null, '', expanded ? location.pathname + location.search : `#${office.slug}`);
        }}>
          <span className={styles.number}>{String(i + 1).padStart(2, '0')}</span>
          <span className={styles.rowCity}>{office.region}</span>
          <span className={styles.rowTime}><PresenceTime zone={office.timezone} /></span>
          <Image src={office.image} alt="" width={120} height={80} />
          <span className={styles.rowIcon} aria-hidden="true">{expanded ? '−' : '+'}</span>
        </button></h3>
        <div className={styles.accordion} data-expanded={expanded} id={panel} inert={!expanded}>
          <div className={styles.accordionInner}>
            <div className={styles.details}>
              <div><h4>Local focus</h4><p>{office.focus}</p><h4>Industries we support</h4><ul>{office.industries.map(item => <li key={item}>{item}</li>)}</ul></div>
              <div><h4>Key services</h4><ul>{office.keyServices.map(service => <li key={service.slug}><Link href={`/services/${service.slug}`}>{service.title} ↗</Link></li>)}</ul><h4>Why Gemstrat</h4><ul>{office.why.map(item => <li key={item}>{item}</li>)}</ul></div>
              <div><h4>Local contact</h4><p>{office.contact.address}<br />{office.contact.phone}<br /><a href={`mailto:${office.contact.email}`}>{office.contact.email}</a></p><Link href="/contact" className={styles.contact}>Start a conversation →</Link></div>
              <div className={styles.faq}><h4>Frequently asked questions</h4>{office.faqs.map(faq => <details key={faq.question}><summary>{faq.question}</summary><p>{faq.answer}</p></details>)}</div>
            </div>
          </div>
        </div>
      </article>;
    })}
  </section>;
}
