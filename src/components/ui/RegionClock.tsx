'use client';

import { useSyncExternalStore } from 'react';

// ---------------------------------------------------------------------------
// RegionClock
// "Right now, it's 15:07 in Dubai. <a line for that time of day>" — live local
// time, cycling through a city in each region Gemstrat works across.
// ---------------------------------------------------------------------------

const CITIES = [
  { city: 'New York', tz: 'America/New_York' },
  { city: 'Toronto', tz: 'America/Toronto' },
  { city: 'Mumbai', tz: 'Asia/Kolkata' },
  { city: 'Dubai', tz: 'Asia/Dubai' },
  { city: 'Nairobi', tz: 'Africa/Nairobi' },
];
const CITY_MS = 6000; // how long each city stays up

// A line for the local hour there
function lineFor(hour: number) {
  if (hour >= 5 && hour < 11) return 'A good hour for asking the hard questions.';
  if (hour >= 11 && hour < 17) return 'Somewhere, a plan is meeting reality.';
  if (hour >= 17 && hour < 22) return 'The numbers are getting a second look.';
  return 'The best strategies are still being refined.';
}

// Seconds since the epoch, ticking once a second (null on the server)
let second = 0;
function subscribe(cb: () => void) {
  const id = window.setInterval(() => {
    second = Math.floor(Date.now() / 1000);
    cb();
  }, 1000);
  return () => window.clearInterval(id);
}
const getSnapshot = () => second || (second = Math.floor(Date.now() / 1000));
const getServerSnapshot = () => null;

export default function RegionClock({ className = '' }: { className?: string }) {
  const now = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  // Before hydration: the first city, without a time
  const index = now === null ? 0 : Math.floor((now * 1000) / CITY_MS) % CITIES.length;
  const { city, tz } = CITIES[index];

  let time = '--:--';
  let line = lineFor(12);
  if (now !== null) {
    const parts = new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: tz,
    }).formatToParts(new Date(now * 1000));
    const hour = parts.find((p) => p.type === 'hour')?.value ?? '00';
    const minute = parts.find((p) => p.type === 'minute')?.value ?? '00';
    time = `${hour}:${minute}`;
    line = lineFor(Number(hour) % 24);
  }

  return (
    <p className={`m-0 ${className}`} aria-live="off">
      Right now, it&rsquo;s <span className="text-white">{time}</span> in{' '}
      {/* Keyed so each new city fades in */}
      <span key={city} className="hero-swap-in inline-block text-white">
        {city}.
      </span>{' '}
      <span key={`${city}-line`} className="hero-swap-in text-white/55">
        {line}
      </span>
    </p>
  );
}
