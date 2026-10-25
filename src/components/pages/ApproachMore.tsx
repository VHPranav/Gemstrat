'use client';

import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { onScrollFrame } from '@/lib/scrollFrame';

// ---------------------------------------------------------------------------
// The Approach page's sections after "How we work": a statement whose words
// light up as you scroll, the ways to work with Gemstrat, and the regions
// with their live local time. Everything blurs in and rises as it comes into
// view, like the steps above.
// ---------------------------------------------------------------------------

const PAD = 'px-5 sm:px-6 lg:px-8';
const HEADING = 'font-sans font-normal tracking-[-0.045em] leading-[0.98] text-[clamp(2.4rem,5vw,76px)] m-0';

/** Blurs in and rises once, as it comes into view */
function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -12% 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={`motion-reduce:!opacity-100 motion-reduce:!filter-none motion-reduce:!transform-none ${className}`}
      style={{
        opacity: shown ? 1 : 0,
        filter: shown ? 'blur(0)' : 'blur(12px)',
        transform: shown ? 'none' : 'translate3d(0, 24px, 0)',
        transition: 'opacity 0.9s, filter 0.9s, transform 1.1s cubic-bezier(0.16, 1, 0.3, 1)',
        transitionDelay: `${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

// --- Statement ---------------------------------------------------------------

const STATEMENT =
  'We don’t stop at advice. We stay until the plan is running, the numbers are moving, and your team owns what we built together.';

/** Pinned while you scroll past it; its words light up one after another */
function Statement() {
  const ref = useRef<HTMLElement>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const words = STATEMENT.split(' ');

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      wordRefs.current.forEach((el) => el && (el.style.opacity = '1'));
      return;
    }
    return onScrollFrame(() => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const run = r.height - window.innerHeight;
      const p = Math.min(1, Math.max(0, -r.top / (run || 1)));
      wordRefs.current.forEach((w, i) => {
        if (!w) return;
        const at = (i / words.length) * 0.8;
        const k = Math.min(1, Math.max(0, (p - at) / 0.12));
        w.style.opacity = String(0.14 + 0.86 * k);
      });
    });
  }, [words.length]);

  return (
    <section ref={ref} className="relative h-[180vh] border-t border-white/10">
      <div className={`sticky top-0 h-screen h-[100svh] flex items-center ${PAD}`}>
        <p className="m-0 max-w-[1100px] font-sans font-normal tracking-[-0.04em] leading-[1.08] text-[clamp(2rem,4.6vw,68px)] text-white">
          {words.map((w, i) => (
            <span
              key={i}
              ref={(el) => {
                wordRefs.current[i] = el;
              }}
              style={{ opacity: 0.14 }}
            >
              {w}{' '}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}

// --- Ways to work with us ----------------------------------------------------

const MODELS = [
  {
    name: 'Strategy sprint',
    span: 'Weeks',
    body: 'A sharp diagnosis and a clear plan: the priorities that matter, the roadmap to get there and the business case behind it, ready for the board.',
  },
  {
    name: 'Transformation programme',
    span: 'Months',
    body: 'We lead delivery alongside your teams — systems, automation, brand and growth — in short cycles, so results show up early and keep compounding.',
  },
  {
    name: 'Embedded partner',
    span: 'Ongoing',
    body: 'A senior Gemstrat lead inside your leadership rhythm, keeping momentum, decisions and the numbers honest long after launch.',
  },
];

function Models() {
  return (
    <section className={`${PAD} py-24 sm:py-36 border-t border-white/10`}>
      <Reveal>
        <h2 className={HEADING}>
          Ways to work
          <br />
          <span className="text-white/40">with us.</span>
        </h2>
      </Reveal>
      <div className="mt-16 sm:mt-24 grid gap-px bg-white/10 md:grid-cols-3">
        {MODELS.map((m, i) => (
          <Reveal key={m.name} delay={0.1 * i} className="bg-[#090909]">
            <div className="h-full flex flex-col gap-10 py-8 md:py-10 md:px-8 md:first:pl-0">
              <span className="font-sans text-[11px] uppercase tracking-[0.12em] text-white/40">{m.span}</span>
              <div>
                <h3 className="m-0 font-sans font-normal tracking-[-0.03em] text-[clamp(1.6rem,2.4vw,34px)] leading-[1.05]">
                  {m.name}
                </h3>
                <p className="mt-4 m-0 font-archivo text-[16px] leading-[1.55] text-white/60 max-w-[34rem]">{m.body}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

// --- Where we work -----------------------------------------------------------

const REGIONS = [
  { region: 'United States', city: 'New York', tz: 'America/New_York' },
  { region: 'Canada', city: 'Toronto', tz: 'America/Toronto' },
  { region: 'India', city: 'Mumbai', tz: 'Asia/Kolkata' },
  { region: 'Middle East', city: 'Dubai', tz: 'Asia/Dubai' },
  { region: 'Africa', city: 'Nairobi', tz: 'Africa/Nairobi' },
];

// A clock that ticks every 15 s (client only; the server shows dashes)
let nowMinute = 0;
const subscribeClock = (cb: () => void) => {
  const id = window.setInterval(() => {
    const m = Math.floor(Date.now() / 60000);
    if (m !== nowMinute) {
      nowMinute = m;
      cb();
    }
  }, 15000);
  return () => window.clearInterval(id);
};
const getMinute = () => (nowMinute ||= Math.floor(Date.now() / 60000));

function LocalTime({ tz }: { tz: string }) {
  const minute = useSyncExternalStore(subscribeClock, getMinute, () => 0);
  if (!minute) return <span>--:--</span>;
  const time = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: tz }).format(new Date(minute * 60000));
  return <span>{time}</span>;
}

function Regions() {
  return (
    <section className={`${PAD} py-24 sm:py-36 border-t border-white/10`}>
      <div className="grid gap-12 lg:grid-cols-[minmax(0,3fr)_minmax(0,7fr)] lg:gap-12 xl:gap-16">
        <Reveal>
          <h2 className={HEADING}>
            Five regions.
            <br />
            <span className="text-white/40">One team.</span>
          </h2>
          <p className="mt-8 m-0 font-archivo text-[16px] lg:text-[17px] leading-[1.55] text-white/60 max-w-[30rem]">
            A boutique bench with partners where our clients grow — close enough to be in the room, connected enough to bring
            what works elsewhere.
          </p>
        </Reveal>
        <ul className="list-none p-0 m-0 border-t border-white/10">
          {REGIONS.map((r, i) => (
            <li key={r.region} className="border-b border-white/10">
              <Reveal delay={0.06 * i}>
                <div className="flex items-baseline justify-between gap-6 py-6 sm:py-7">
                  <span className="font-sans font-normal tracking-[-0.03em] text-[clamp(1.5rem,2.6vw,38px)] leading-none">
                    {r.region}
                  </span>
                  <span className="flex items-baseline gap-4 sm:gap-8 font-sans text-[12px] uppercase tracking-[0.1em] text-white/50 whitespace-nowrap">
                    <span className="hidden sm:inline">{r.city}</span>
                    <span className="text-white/85 tabular-nums">
                      <LocalTime tz={r.tz} />
                    </span>
                  </span>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default function ApproachMore() {
  return (
    <>
      <Statement />
      <Models />
      <Regions />
    </>
  );
}
