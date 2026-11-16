'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { onScrollFrame, invalidateScrollFrame } from '@/lib/scrollFrame';
import { setWordStyle } from '@/lib/wordStyle';
import LandmarkReveal from './LandmarkReveal';
import PresenceHeadlines from './PresenceHeadlines';
import { drawHorizonWipe } from './horizonWipe';
import torontoTrace from '../../../public/images/presence/toronto-trace.json';
import newYorkTrace from '../../../public/images/presence/new-york-trace.json';
import nairobiTrace from '../../../public/images/presence/nairobi-trace.json';
import dubaiTrace from '../../../public/images/presence/dubai-trace.json';
import indiaTrace from '../../../public/images/presence/india-trace.json';
import { PresenceTime, usePresenceMinute } from './RegionIndex';
import { presence, type PresenceOffice } from './presenceContent';
import styles from './presence.module.css';

const heroTraces: Record<string, { w: number; h: number; lines: number[][] }> = {
  'toronto': torontoTrace,
  'new-york': newYorkTrace,
  'nairobi': nairobiTrace,
  'dubai': dubaiTrace,
  'mumbai': indiaTrace,
};

const heroLandmarks = presence.map(office => {
  const { w, h, lines } = heroTraces[office.slug];
  return { office, viewBox: `0 0 ${w} ${h}`, path: lines.map(([x1, y1, x2, y2]) => `M${x1} ${y1}L${x2} ${y2}`).join('') };
});

function HorizonOpening() {
  const opening = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const { office, viewBox, path } = heroLandmarks[active];

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const timer = window.setInterval(() => {
      const hero = opening.current;
      if (!hero || document.hidden || reduced.matches || getComputedStyle(hero).visibility === 'hidden') return;
      const bounds = hero.getBoundingClientRect();
      if (bounds.bottom <= 0 || bounds.top >= window.innerHeight) return;
      if (hero.contains(document.activeElement) && document.activeElement?.matches(':focus-visible')) return;
      setActive(index => (index + 1) % heroLandmarks.length);
    }, 14000);
    return () => window.clearInterval(timer);
  }, []);

  return <header ref={opening} className={styles.opening} data-opening data-nav-light>
    <div className={styles.heroBackdrop} key={office.slug} aria-hidden="true">
      <svg className={styles.heroWireframe} viewBox={viewBox}><path d={path} /></svg>
      <Image src={office.image} alt="" width={1536} height={1024} loading="eager" />
    </div>
    <div className={styles.openingCopy}>
      <h1>Five regions.<br />One way of working.</h1>
      <div className={styles.openingIntro}>
        <p>Connected expertise across five regions, close to where our clients work.</p>
        <a href="#regions" className={styles.openingLink}>Explore our locations <span aria-hidden="true">↓</span></a>
      </div>
    </div>
    <div className={styles.heroBulletin}>
      <div className={styles.heroRegion}>
        <a href={`#${office.slug}`}>{office.region}</a>
        <span className={styles.heroClock}><PresenceTime zone={office.timezone} /></span>
      </div>
    </div>
    <PresenceHeadlines slug={office.slug} region={office.region} perspectives={office.perspectives} />
  </header>;
}

const clamp = (value: number) => Math.max(0, Math.min(1, value));
const span = (value: number, start: number, end: number) => clamp((value - start) / (end - start));
const words = (text: string) => text.split(' ').map((word, i) => <span data-w key={i}>{word}{' '}</span>);
const radians = (degrees: number) => degrees * Math.PI / 180;

function travelDistance(from: PresenceOffice, to: PresenceOffice) {
  const halfLat = radians(to.lat - from.lat) / 2;
  const halfLon = radians(to.lon - from.lon) / 2;
  const a = Math.sin(halfLat) ** 2 + Math.cos(radians(from.lat)) * Math.cos(radians(to.lat)) * Math.sin(halfLon) ** 2;
  return Math.round(12742 * Math.asin(Math.sqrt(a)) / 10) * 10;
}

function offset(zone: string, minute: number) {
  const time = new Intl.DateTimeFormat('en-GB', { timeZone: zone, timeZoneName: 'longOffset' })
    .formatToParts(minute * 60000).find(part => part.type === 'timeZoneName')?.value ?? '';
  const match = /([+-])(\d{2}):(\d{2})/.exec(time);
  return match ? (match[1] === '-' ? -1 : 1) * (+match[2] + +match[3] / 60) : 0;
}

function JourneyLabel({ from, to }: { from: PresenceOffice; to: PresenceOffice }) {
  const minute = usePresenceMinute();
  const difference = minute === null ? null : offset(to.timezone, minute) - offset(from.timezone, minute);
  return <span className={styles.journeyLabel}>
    → {travelDistance(from, to).toLocaleString('en-GB')} km
    {difference === 0 ? ' · Same local time' : difference !== null && ` · ${Math.abs(difference)} h ${difference > 0 ? 'ahead' : 'behind'}`}
  </span>;
}

export default function HorizonScene() {
  const root = useRef<HTMLElement>(null);
  const [reveals, setReveals] = useState(presence.map(() => 1));

  useEffect(() => {
    const scene = root.current!;
    const track = scene.querySelector<HTMLElement>('[data-track]')!;
    const opening = scene.querySelector<HTMLElement>('[data-opening]')!;
    const stage = scene.querySelector<HTMLElement>(`.${styles.stage}`)!;
    const openingWrap = opening.parentElement!;
    const wipe = scene.querySelector<HTMLCanvasElement>('[data-horizon-wipe]')!;
    const context = wipe.getContext('2d');
    const stops = [...scene.querySelectorAll<HTMLElement>('[data-stop]')];
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const narrow = matchMedia('(max-width: 900px)');
    const stopWords = stops.map(stop => [...stop.querySelectorAll<HTMLElement>('[data-w]')]);
    const change = () => invalidateScrollFrame();
    const observer = new MutationObserver(change);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-perf'] });
    reduced.addEventListener('change', change);

    const unsubscribe = onScrollFrame(() => {
      const lite = document.documentElement.dataset.perf === 'lite';
      const still = lite || reduced.matches;
      const vertical = narrow.matches || reduced.matches;
      const viewport = window.innerHeight;
      const total = clamp(-scene.getBoundingClientRect().top / Math.max(1, scene.offsetHeight - viewport));
      const journey = clamp((total - .125) / .875) * stops.length;
      const active = Math.min(stops.length - 1, Math.floor(journey));
      const local = journey - active;
      const nextStop = active < stops.length - 1 ? stops[active + 1] : null;
      // Between cities the whole track travels sideways along the horizon
      // (the pixel wipe is kept only for leaving the opening)
      const slide = nextStop ? span(local, .68, 1) : 0;
      const pixelWipe = !still && context !== null;
      const progress = vertical
        ? span(-openingWrap.getBoundingClientRect().top, 0, Math.max(1, openingWrap.offsetHeight - opening.offsetHeight))
        : span(total, .08, .13);
      const wiping = pixelWipe && progress > 0 && progress < 1;
      const mask = context && wiping
        ? drawHorizonWipe(wipe, context, stage.clientWidth, opening.clientHeight, progress)
        : '';
      opening.style.clipPath = wiping ? mask : '';
      wipe.style.visibility = wiping ? 'visible' : 'hidden';
      opening.style.opacity = String(pixelWipe || vertical ? 1 : 1 - progress);
      opening.style.visibility = progress < 1 || (vertical && !pixelWipe) ? 'visible' : 'hidden';
      track.style.opacity = String(vertical ? 1 : pixelWipe ? 1 : progress);
      track.style.visibility = vertical || progress > 0 ? 'visible' : 'hidden';
      // Ease in and out of each journey so the camera settles on every city
      const eased = slide < .5 ? 4 * slide ** 3 : 1 - (-2 * slide + 2) ** 3 / 2;
      const travel = active + (still ? Math.round(slide) : eased);
      track.style.transform = vertical ? 'none' : `translate3d(${-travel * 100}vw, 0, 0)`;

      const animate = (group: HTMLElement[], enter: number, exit = 0) => {
        group.forEach((word, i) => {
          const start = i / Math.max(1, group.length) * .6;
          const amount = still ? 1 : span(enter, start, start + .4) * (1 - exit);
          setWordStyle(word, amount, still ? 0 : (1 - amount) * 9, still ? 0 : (1 - amount) * 8);
        });
      };

      const next = stops.map((stop, i) => {
        const top = vertical ? stop.getBoundingClientRect().top : 0;
        let phase = vertical ? span(viewport - top, 0, viewport * .73) : clamp(journey - i);
        // The next city starts drawing its construction lines while it
        // slides in, so it arrives already sketched
        if (!still && !vertical && i > 0) {
          if (i === active + 1) phase = slide * .18;
          else if (i <= active) phase = .18 + phase * .82;
        }
        // Words stay put until the slide begins, then blur out as they travel away
        animate(stopWords[i], vertical ? span(phase, .12, .75) : span(phase, .10, .31),
          vertical || i === stops.length - 1 ? 0 : span(phase, .72, .9));
        return still ? 1 : Math.round(span(phase, 0, vertical ? 1 : .46) * 44) / 44;
      });
      setReveals(previous => previous.every((value, i) => value === next[i]) ? previous : next);
    });
    return () => {
      unsubscribe();
      observer.disconnect();
      reduced.removeEventListener('change', change);
    };
  }, []);

  return <section className={styles.scene} ref={root} aria-label="Our global presence">
    <div className={styles.stage} data-nav-light>
      <div className={styles.openingWrap}>
        <HorizonOpening />
        <canvas className={styles.horizonWipe} data-horizon-wipe aria-hidden="true" />
      </div>

      <div className={styles.track} data-track>
        {presence.map((office, i) => <article className={styles.stop} data-stop data-nav-light key={office.slug}>
          <div className={styles.drawing}><LandmarkReveal image={office.image} landmark={office.landmark} progress={reveals[i]} /></div>
          <div className={styles.stopCopy}>
            <p className={styles.eyebrow}>{words(office.landmark)}</p>
            <h2>{words(office.region)}</h2>
            <p>{words(office.focus)}</p>
            <div className={styles.localTime}><span data-w>{office.region} · <PresenceTime zone={office.timezone} /></span></div>
          </div>
          {i < presence.length - 1 && <JourneyLabel from={office} to={presence[i + 1]} />}
        </article>)}
      </div>

    </div>
  </section>;
}
