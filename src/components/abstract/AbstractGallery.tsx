'use client';

import { useEffect, useRef, useState } from 'react';
import artworks from '@/data/abstract/artworks.json';
import AbstractArtwork from './AbstractArtwork';
import AnimatedAbstractArtwork, { ANIMATED_ARTWORKS } from './AnimatedAbstractArtwork';
import styles from './abstract-gallery.module.css';

export default function AbstractGallery() {
  const root = useRef<HTMLDivElement>(null);
  const [paper, setPaper] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add(styles.visible);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    root.current?.querySelectorAll('[data-artwork]').forEach((el) => observer.observe(el));
    return () => {
      observer.disconnect();
      if (copyTimer.current) clearTimeout(copyTimer.current);
    };
  }, []);

  async function copy(slug: string, label: string) {
    try {
      await navigator.clipboard.writeText(`${label} — ${window.location.origin}/abstract-lines#${slug}`);
      setCopied(slug);
      if (copyTimer.current) clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(null), 2000);
    } catch {
      document.getElementById(slug)?.scrollIntoView({ behavior: 'smooth' });
      setCopied('unavailable');
    }
  }

  return (
    <div ref={root} className={styles.gallery} data-paper={paper}>
      <header className={styles.intro}>
        <div className={styles.eyebrow}><span>Gemstrat / Form studies</span><span>Collection 01—11</span></div>
        <h1>Lines.<br /><span>In every form.</span></h1>
        <div className={styles.introBottom}>
          <p>A collection of abstract forms from the Gemstrat profile.<br />Choose a number. Give it a place.</p>
          <a href="#collection" className={styles.jump}>Explore the collection <span aria-hidden="true">↘</span></a>
        </div>
      </header>

      <section id="collection" className={styles.collection} aria-label="Abstract artwork collection">
        <div className={styles.toolbar}>
          <span>Eleven forms. One visual language.</span>
          <button type="button" aria-pressed={paper} onClick={() => setPaper(!paper)}>
            {paper ? 'View on black' : 'View on white'} <span aria-hidden="true">◐</span>
          </button>
        </div>
        <nav aria-label="Artwork index" className={styles.index}>
          {artworks.map((art) => <a key={art.slug} href={`#${art.slug}`} aria-label={`${art.id} ${art.name}`}>{art.id}</a>)}
        </nav>
        <div className={styles.grid}>
          {artworks.map((art, index) => (
            <article key={art.slug} id={art.slug} className={styles.card} data-artwork>
              <div className={styles.cardTop}><span>{art.id} / {art.name}</span><span>Profile p.{String(art.page).padStart(2, '0')}</span></div>
              <div className={styles.stage}>
                {ANIMATED_ARTWORKS.includes(art.slug)
                  ? <AnimatedAbstractArtwork name={art.slug} className={styles.art} />
                  : <AbstractArtwork name={art.slug} className={styles.art} priority={index < 2} />}
              </div>
              <div className={styles.caption}>
                <div><h2><a href={`#${art.slug}`}>{art.name}</a></h2><p>{art.description}</p></div>
                <button type="button" onClick={() => copy(art.slug, `${art.id} ${art.name}`)} aria-label={`Copy reference for ${art.id} ${art.name}`}>
                  {copied === art.slug ? 'Copied' : 'Copy reference'} <span aria-hidden="true">↗</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
      <footer className={styles.footer}><p>Start with a line.<br /><span>Build what lasts.</span></p><a href="#">Back to top ↑</a></footer>
      <span className={styles.srOnly} role="status">{copied === 'unavailable' ? 'Clipboard unavailable. Use the artwork title link for its reference.' : copied ? 'Artwork reference copied.' : ''}</span>
    </div>
  );
}
