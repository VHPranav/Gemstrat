'use client';

import { useEffect, useState } from 'react';
import { usePresenceMinute } from './RegionIndex';
import styles from './presence.module.css';

// ---------------------------------------------------------------------------
// PresenceHeadlines
// One headline for the region shown in the hero, typed out letter by letter.
// It comes from the site's own industry feed (/api/news, worker/news.ts):
// recent business and technology stories for that market, already filtered
// for anything off-brand. When the feed has nothing for the region, or
// can't be reached (e.g. on `next dev`), Gemstrat's own curated headlines
// are shown instead, so the space is never empty.
// ---------------------------------------------------------------------------

type Story = { title: string; source: string; href: string; published: string };
type Feed = { regions?: Record<string, Story[]> };

// Set NEXT_PUBLIC_NEWS_URL (e.g. http://localhost:3100/api/news, from
// `npm run start`) to see the live feed while developing
const FEED_URL = process.env.NEXT_PUBLIC_NEWS_URL || '/api/news';
const REFRESH = 15 * 60 * 1000;

function TypedHeadline({ title, link }: { title: string; link: boolean }) {
  const [visible, setVisible] = useState(0);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let frame: number;
    let started: number | undefined;
    const duration = Math.min(2700, title.length * 26);
    function tick(now: number) {
      started ??= now;
      const count = Math.min(title.length, Math.floor((now - started) / duration * title.length));
      setVisible(count);
      if (count < title.length) frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [title]);
  const arrow = link ? ' ↗' : '';
  return <span className={styles.typedHeadline} aria-hidden="true">
    <span className={styles.typedMeasure}>{title}{arrow}</span>
    <span className={styles.typedFront}>{title.slice(0, visible)}{visible === title.length ? arrow : ''}</span>
  </span>;
}

export default function PresenceHeadlines({ slug, region, perspectives }: { slug: string; region: string; perspectives: string[] }) {
  const [feed, setFeed] = useState<Record<string, Story[]>>({});
  // A different headline each minute, so returning to a region feels live
  const turn = usePresenceMinute() ?? 0;

  useEffect(() => {
    let request: AbortController | undefined;
    async function refresh() {
      request?.abort();
      const controller = new AbortController();
      request = controller;
      const timeout = window.setTimeout(() => controller.abort(), 6500);
      try {
        const response = await fetch(FEED_URL, { signal: controller.signal, credentials: 'omit' });
        const data: Feed = response.ok ? await response.json() : {};
        if (!controller.signal.aborted && data.regions) setFeed(data.regions);
      } catch {
        // Offline or unavailable: keep the last feed (or the curated headlines)
      } finally {
        window.clearTimeout(timeout);
      }
    }
    void refresh();
    const interval = window.setInterval(refresh, REFRESH);
    return () => {
      window.clearInterval(interval);
      request?.abort();
    };
  }, []);

  const stories = feed[slug] ?? [];
  if (stories.length) {
    const story = stories[turn % stories.length];
    return <div className={styles.headlines}>
      <span className={styles.newsLabel}>Industry news · {region}</span>
      <a href={story.href} target="_blank" rel="noopener noreferrer" aria-label={`${story.title} (${story.source})`}>
        <TypedHeadline key={story.title} title={story.title} link />
      </a>
      <span className={styles.newsSource}>{story.source}</span>
    </div>;
  }

  const perspective = perspectives[turn % perspectives.length];
  return <div className={styles.headlines}>
    <span className={styles.newsLabel}>Our perspective · {region}</span>
    <p><span className={styles.srOnly}>{perspective}</span><TypedHeadline key={perspective} title={perspective} link={false} /></p>
    <span className={styles.newsSource}>Gemstrat</span>
  </div>;
}
