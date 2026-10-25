'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { goTo } from '@/lib/navigate';
import { onScrollFrame } from '@/lib/scrollFrame';
import { setWordStyle } from '@/lib/wordStyle';
import { HANDOFF_PAGE, isHandoffPending } from '@/lib/handoff';

// ---------------------------------------------------------------------------
// SubPage
// Shell for the pages behind the menu (Approach, Focus areas), built in the
// homepage hero's language so the pages read as one site: a full-screen hero
// with the headline blurring in word by word, the same underlined links and
// scroll cue, an optional visual on the right (`aside`), and the headline
// blurring out word by word as the page scrolls on. It ends on a black
// closing section.
// These pages have no loader or 3D intro, so the navbar shows straight away.
// Opened from the menu, it tells the menu it has rendered, so the menu's
// backdrop fades straight away (see lib/handoff) while the copy comes in.
// `page-in` on <html> starts the copy.
// ---------------------------------------------------------------------------

interface SubPageProps {
  /** Small label above the headline (optional) */
  eyebrow?: string;
  title: string[];
  intro: string;
  /** The second link in the hero (the first is "Start a conversation") */
  next: { label: string; href: string };
  /** Visual on the right of the hero */
  aside?: React.ReactNode;
  /** Headline block centred top to bottom, with no links under it (the
   *  scroll cue stays) */
  centered?: boolean;
  /** Keep the hero pinned for this many extra screens of scroll, while its
   *  words blur out (the Approach page's S transition plays over it) */
  pinned?: number;
  children: React.ReactNode;
}

// The headline blurs out over this much scroll (screens), every word
// in a scattered order, each over WORD_WINDOW of it — as the homepage hero
const DISSOLVE = 0.5;
const WORD_WINDOW = 0.4;

/** A fixed scattered order for n words (same on every visit) */
function scatter(n: number) {
  const order = Array.from({ length: n }, (_, i) => i);
  let seed = 7;
  for (let i = n - 1; i > 0; i--) {
    seed = (seed * 9301 + 49297) % 233280;
    const j = Math.floor((seed / 233280) * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

function Arrow({ down }: { down?: boolean }) {
  return (
    <svg
      width="14"
      height="10"
      viewBox="0 0 14 10"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      aria-hidden="true"
      className={down ? 'rotate-90' : ''}
    >
      <path d="M0 5h12.5M8.5 1l4 4-4 4" />
    </svg>
  );
}

function CtaLink({ href, children, delay, down }: { href: string; children: React.ReactNode; delay: number; down?: boolean }) {
  return (
    <a
      href={href}
      onClick={(e) => {
        e.preventDefault();
        goTo(href);
      }}
      className="sub-fade group relative flex items-center justify-between gap-6 w-full sm:w-[15rem] pb-2.5 text-[11px] sm:text-xs uppercase tracking-[0.12em] text-white/85 hover:text-white transition-colors"
      style={{ animationDelay: `${delay}s` }}
    >
      <span>{children}</span>
      <span className="transition-transform duration-300 group-hover:translate-x-1">
        <Arrow down={down} />
      </span>
      <span className="absolute left-0 right-0 bottom-0 h-px bg-white/35" />
      <span className="absolute left-0 right-0 bottom-0 h-px bg-white origin-left scale-x-0 transition-transform duration-500 ease-out group-hover:scale-x-100" />
    </a>
  );
}

export default function SubPage({ eyebrow, title, intro, next, aside, centered, pinned = 0, children }: SubPageProps) {
  const copyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('is-loading');
    root.classList.add('intro-play', 'hero-reveal');
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    // Rendered: the menu (if it brought us here) can lift its backdrop, and
    // the copy comes in as it does
    const raf = requestAnimationFrame(() => {
      if (isHandoffPending()) window.dispatchEvent(new Event(HANDOFF_PAGE));
      root.classList.add('page-in');
    });
    return () => {
      cancelAnimationFrame(raf);
      root.classList.remove('page-in');
    };
  }, []);

  // As the page scrolls on, every word of the headline blurs out, in a
  // scattered order, like the homepage hero; the rest (intro included) fades
  useEffect(() => {
    const copy = copyRef.current;
    if (!copy) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const words = Array.from(copy.querySelectorAll<HTMLElement>('[data-word]'));
    const fades = Array.from(copy.querySelectorAll<HTMLElement>('[data-fade]'));
    const rank = scatter(words.length);
    return onScrollFrame(() => {
      const p = Math.min(1, Math.max(0, window.scrollY / window.innerHeight / DISSOLVE));
      words.forEach((el, i) => {
        const start = (rank[i] / Math.max(1, words.length - 1)) * (1 - WORD_WINDOW);
        const wp = Math.min(1, Math.max(0, (p - start) / WORD_WINDOW));
        setWordStyle(el, 1 - wp, wp * 12, -wp * 14);
      });
      fades.forEach((el) => {
        el.style.opacity = (1 - p).toFixed(3);
      });
    });
  }, []);

  let wordIndex = 0;

  return (
    <main className="bg-[#090909] text-white min-h-screen">
      <header className="relative w-full" style={pinned ? { height: `${100 + pinned * 100}vh` } : undefined}>
        <div className="sticky top-0 w-full h-screen h-[100svh] min-h-[620px] overflow-hidden">
          {aside && <div className="absolute inset-0 pointer-events-none">{aside}</div>}

          <div ref={copyRef} className="relative z-10 h-full pointer-events-none">
            <div
              className={
                centered
                  ? // Centred from tablets up; on phones it stays near the top,
                    // clear of the S below it
                    'absolute left-5 right-5 sm:left-6 lg:left-8 top-24 sm:top-28 md:top-0 md:bottom-0 md:flex md:flex-col md:justify-center lg:max-w-[52%]'
                  : 'absolute left-5 right-5 sm:left-6 lg:left-8 top-24 sm:top-28 lg:max-w-[52%]'
              }
            >
              {eyebrow && (
                <p className="sub-fade font-sans text-[11px] uppercase tracking-[0.12em] text-white/50 mb-6 m-0">{eyebrow}</p>
              )}
              <h1 className="m-0 font-sans font-normal text-white tracking-[-0.045em] leading-[0.98] text-[clamp(2.6rem,6.2vw,6.4rem)]">
                {title.map((line, li) => (
                  <span key={li} className="block">
                    {line.split(' ').map((word, wi) => (
                      <span key={wi} data-word className="inline-block mr-[0.22em]">
                        <span
                          className="sub-word inline-block"
                          style={{
                            animationDelay: `${0.05 + wordIndex++ * 0.09}s`,
                          }}
                        >
                          {word}
                        </span>
                      </span>
                    ))}
                  </span>
                ))}
              </h1>

              <div data-fade>
                <p
                  className="sub-fade mt-8 max-w-[34rem] font-archivo text-[clamp(1rem,1.3vw,19px)] leading-[1.5] tracking-[-0.01em] text-white/65"
                  style={{ animationDelay: '0.75s' }}
                >
                  {intro}
                </p>
              </div>

              {!centered && (
                <div data-fade className="pointer-events-auto mt-8 flex flex-col sm:flex-row gap-4 max-w-[15rem] sm:max-w-none">
                  <CtaLink href="#contact" delay={0.9}>
                    Start a conversation
                  </CtaLink>
                  <CtaLink href={next.href} delay={0.98} down>
                    {next.label}
                  </CtaLink>
                </div>
              )}
            </div>

            {/* Bottom left: scroll cue */}
            <div data-fade className="absolute left-5 sm:left-6 lg:left-8 bottom-8 sm:bottom-10">
              <button
                type="button"
                onClick={() => goTo(next.href)}
                aria-label="Scroll to next section"
                className="sub-fade pointer-events-auto w-7 h-7 flex items-center justify-center rounded-full border border-white/40 text-white/80 hover:bg-white hover:text-black transition-colors"
                style={{ animationDelay: '1.2s' }}
              >
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  aria-hidden="true"
                >
                  <path d="M8 2v11M3.5 8.5 8 13l4.5-4.5" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {children}

      {/* Closing: on the page's black, set off by a hairline */}
      <section
        id="contact"
        className="bg-[#090909] text-white border-t border-white/10 px-6 sm:px-10 lg:px-16 xl:px-20 py-24 sm:py-36 flex flex-col sm:flex-row sm:items-end justify-between gap-10"
      >
        <h2 className="font-sans text-[clamp(2.2rem,5.4vw,84px)] font-normal tracking-[-0.045em] leading-[1] m-0">
          Solving what matters,
          <br />
          <span className="text-white/40">building what lasts.</span>
        </h2>
        <Link
          href="/#contact"
          className="group shrink-0 inline-flex items-center justify-between gap-8 h-11 px-5 bg-white text-black font-sans text-[12px] uppercase tracking-[0.04em] hover:bg-zinc-200 transition-colors"
        >
          Let&apos;s talk
          <span className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true">
            →
          </span>
        </Link>
      </section>
    </main>
  );
}
