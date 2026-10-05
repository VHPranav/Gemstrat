'use client';

import { useSyncExternalStore } from 'react';

// ---------------------------------------------------------------------------
// RegionClock
// "Right now, it's 15:07 in Dubai. <a line about that city>" — live local
// time, cycling through a city in each region Gemstrat works across. Each
// city has five lines; every time a city comes round it shows the next one in
// an order shuffled per visit, so they arrive at random and none repeats until
// all five have shown.
// ---------------------------------------------------------------------------

const CITIES = [
  {
    city: 'New York',
    tz: 'America/New_York',
    lines: [
      'Somewhere on Wall Street, a forecast is being rewritten.',
      'A boardroom just asked the right question.',
      'Ambition is running ahead of the subway.',
      'The market moved. The plan should too.',
      'Big bets are getting a second look.',
    ],
  },
  {
    city: 'Toronto',
    tz: 'America/Toronto',
    lines: [
      'Bay Street is weighing its next move.',
      'Steady growth, carefully built.',
      'Somewhere downtown, a merger is finding its logic.',
      'Patience is a strategy here.',
      'A good plan is being made winter-proof.',
    ],
  },
  {
    city: 'Mumbai',
    tz: 'Asia/Kolkata',
    lines: [
      'A thousand deals are moving at once.',
      'Dalal Street never waits.',
      'Scale is meeting speed, again.',
      'A founder’s idea is meeting its first real number.',
      'Hustle works better with a plan.',
    ],
  },
  {
    city: 'Dubai',
    tz: 'Asia/Dubai',
    lines: [
      'Skylines are drafted before breakfast.',
      'Ambition, planned to the metre.',
      'A bold idea is asking for a careful plan.',
      'Somewhere, a vision is meeting its budget.',
      'The desert keeps teaching patience.',
    ],
  },
  {
    city: 'Nairobi',
    tz: 'Africa/Nairobi',
    lines: [
      'Mobile money is moving faster than the traffic.',
      'Somewhere, a startup is outgrowing its plan.',
      'Growth, built from the ground up.',
      'Tomorrow’s markets are being shaped here.',
      'The fastest market you’re not watching yet.',
    ],
  },
];
const CITY_MS = 6000; // how long each city stays up

// Each city's lines in a random order, shuffled once per visit (client only;
// the server renders the first line)
const lineOrder = CITIES.map((c) => {
  const order = c.lines.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
});

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
  const cycle = now === null ? 0 : Math.floor((now * 1000) / CITY_MS);
  const index = cycle % CITIES.length;
  const { city, tz, lines } = CITIES[index];
  // This city's how-many-th appearance picks its next line
  const visit = Math.floor(cycle / CITIES.length);
  const line = now === null ? lines[0] : lines[lineOrder[index][visit % lines.length]];

  let time = '--:--';
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
  }

  return (
    <p className={`m-0 ${className}`} aria-live="off">
      Right now, it&rsquo;s <span className="text-white">{time}</span> in{' '}
      {/* Keyed so each new city fades in */}
      <span key={city} className="hero-swap-in inline-block text-white">
        {city}.
      </span>{' '}
      <span key={`${city}-${line}`} className="hero-swap-in text-white/55">
        {line}
      </span>
    </p>
  );
}
