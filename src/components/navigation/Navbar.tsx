'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { onScrollFrame } from '@/lib/scrollFrame';

// ---------------------------------------------------------------------------
// Navbar
// Minimal fixed header: Gemstrat logo on the left; on the right a "Chapters"
// button (white-bordered, transparent) that opens a full-screen list of the
// page's sections, and the "Let's talk" button. Square-cornered to match the
// hero. Switches to dark-on-light while it sits over the white sections.
// ---------------------------------------------------------------------------

const INDEX_LINKS = [
  { label: 'Approach', href: '#about-intro' },
  { label: 'Focus areas', href: '#focus-areas' },
  { label: 'Advantage', href: '#advantage' },
  { label: 'Leadership', href: '#leadership' },
  { label: 'Voices', href: '#reviews' },
];
const REGIONS = 'USA · Canada · India · Middle East · Africa';
// Chapters and Let's talk share one width, label left and icon right
const NAV_BUTTON_WIDTH = 'w-[6.75rem] sm:w-[9rem]';

export default function Navbar() {
  const [isLight, setIsLight] = useState(false);
  const [open, setOpen] = useState(false);

  // Light theme while the top of the viewport overlaps a white section
  useEffect(() => {
    const overlapsTop = (el: HTMLElement | null) => {
      if (!el) return false;
      const rect = el.getBoundingClientRect();
      return rect.top <= 60 && rect.bottom >= 60;
    };
    const handleScroll = () => {
      const focusAreas = document.getElementById('focus-areas');
      const pastFocus = (() => {
        const last = document.getElementById('focus-item-4');
        return last ? last.getBoundingClientRect().bottom < 80 : false;
      })();
      setIsLight(
        (overlapsTop(focusAreas) && !pastFocus) ||
          overlapsTop(document.getElementById('advantage')) ||
          overlapsTop(document.getElementById('leadership'))
      );
    };

    return onScrollFrame(handleScroll);
  }, []);

  // While the index is open: no page scrolling behind it, and Escape closes it
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    root.classList.add('index-open');
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      root.classList.remove('index-open');
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const scrollTo = (href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };
  const go = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setOpen(false);
    // Let the index fade before the page starts moving
    window.setTimeout(() => scrollTo(href), 250);
  };

  // Over a white section the bar goes dark-on-light — unless the index is
  // open, which is always dark
  const light = isLight && !open;

  return (
    <header className="fixed top-0 left-0 right-0 z-[900] pointer-events-none">
      {/* Full-screen index (below the bar, so the bar's buttons stay on top) */}
      <div
        id="site-index"
        data-lenis-prevent
        aria-hidden={!open}
        className={`fixed inset-0 bg-[#090909]/95 backdrop-blur-md text-white transition-opacity duration-500 ease-out ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <nav
          aria-label="Site index"
          className="h-full flex flex-col justify-between px-5 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-8 sm:pb-10"
        >
          <ol className="m-0 p-0 list-none">
            {INDEX_LINKS.map((link, i) => (
              <li
                key={link.href}
                className="border-t border-white/10 last:border-b transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                style={{
                  opacity: open ? 1 : 0,
                  transform: open ? 'translateY(0)' : 'translateY(24px)',
                  transitionDelay: open ? `${0.08 + i * 0.06}s` : '0s',
                }}
              >
                <a
                  href={link.href}
                  onClick={go(link.href)}
                  tabIndex={open ? 0 : -1}
                  className="group flex items-baseline gap-5 sm:gap-8 py-3 sm:py-4 text-white/85 hover:text-white transition-colors"
                >
                  <span className="w-8 text-[11px] sm:text-xs tracking-[0.12em] text-white/40 tabular-nums">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="text-[clamp(2rem,5vw,4.2rem)] leading-[1] tracking-[-0.035em] transition-transform duration-500 ease-out group-hover:translate-x-3">
                    {link.label}
                  </span>
                </a>
              </li>
            ))}
          </ol>
          <p
            className="m-0 text-[11px] sm:text-xs uppercase tracking-[0.14em] text-white/45 transition-opacity duration-700"
            style={{ opacity: open ? 1 : 0, transitionDelay: open ? '0.4s' : '0s' }}
          >
            {REGIONS}
          </p>
        </nav>
      </div>

      <div className="relative w-full px-5 sm:px-6 py-5 flex items-start justify-between">
        {/* Left: logo */}
        <a
          href="#hero"
          onClick={(e) => {
            e.preventDefault();
            setOpen(false);
            scrollTo('#hero');
          }}
          style={{ animationDelay: '1.25s' }}
          className="nav-item-in pointer-events-auto flex items-center h-10 transition-opacity duration-300 hover:opacity-75"
          aria-label="Gemstrat home"
        >
          {/* The wordmark is white; over the white sections it flips to black */}
          <Image
            src="/images/gems.svg"
            alt=""
            width={183}
            height={37}
            priority
            className={`h-5 sm:h-6 w-auto shrink-0 transition-[filter] duration-300 ${light ? 'invert' : ''}`}
          />
        </a>

        <div className="flex items-start gap-2 sm:gap-3">
          {/* Chapters: opens the full-screen list of sections */}
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="site-index"
            style={{ animationDelay: '1.32s' }}
            className={`nav-item-in pointer-events-auto group flex items-center justify-between ${NAV_BUTTON_WIDTH} h-10 pl-3.5 pr-3 border bg-transparent font-sans text-[11px] sm:text-xs uppercase tracking-[0.04em] transition-colors duration-300 ${
              light
                ? 'border-black text-black hover:bg-black hover:text-white'
                : 'border-white text-white hover:bg-white hover:text-black'
            }`}
          >
            <span className="relative block overflow-hidden h-[1.2em] leading-[1.2em]">
              <span
                className="block transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                style={{ transform: open ? 'translateY(-50%)' : 'translateY(0)' }}
              >
                <span className="block">Chapters</span>
                <span className="block" aria-hidden="true">
                  Close
                </span>
              </span>
            </span>
            {/* Two lines that cross into an × when open */}
            <span className="relative block w-[14px] h-[14px]" aria-hidden="true">
              <span
                className="absolute left-0 right-0 h-[1.3px] bg-current transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                style={{ top: '4px', transform: open ? 'translateY(3px) rotate(45deg)' : 'none' }}
              />
              <span
                className="absolute left-0 right-0 h-[1.3px] bg-current transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                style={{ top: '10px', transform: open ? 'translateY(-3px) rotate(-45deg)' : 'none' }}
              />
            </span>
          </button>

          {/* Let's talk */}
          <a
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              setOpen(false);
              scrollTo('#contact');
            }}
            style={{ animationDelay: '1.38s' }}
            className={`nav-item-in pointer-events-auto group flex items-center justify-between ${NAV_BUTTON_WIDTH} h-10 pl-3.5 pr-3 font-sans text-[11px] sm:text-xs uppercase tracking-[0.04em] transition-colors duration-300 ${
              light ? 'bg-black text-white hover:bg-zinc-800' : 'bg-white text-black hover:bg-zinc-200'
            }`}
          >
            <span>Let&apos;s talk</span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.3"
              className="transition-transform duration-300 group-hover:rotate-90"
              aria-hidden="true"
            >
              <path d="M7 1v12M1 7h12" />
            </svg>
          </a>
        </div>
      </div>
    </header>
  );
}
