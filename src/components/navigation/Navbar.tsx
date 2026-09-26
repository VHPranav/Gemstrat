'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { onScrollFrame } from '@/lib/scrollFrame';

// ---------------------------------------------------------------------------
// Navbar
// Minimal fixed header: Gemstrat logo on the left, "Let's talk" button on the
// right. Square-cornered to match the hero. Switches to dark-on-light while
// it sits over the white sections.
// ---------------------------------------------------------------------------

export default function Navbar() {
  const [isLight, setIsLight] = useState(false);

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

  const scrollTo = (href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-[900] pointer-events-none">
      <div className="w-full px-5 sm:px-6 py-5 flex items-start justify-between">
        {/* Left: logo */}
        <a
          href="#hero"
          onClick={(e) => {
            e.preventDefault();
            scrollTo('#hero');
          }}
          style={{ animationDelay: '1.25s' }}
          className={`nav-item-in pointer-events-auto flex items-center gap-2.5 h-10 px-3.5 border transition-colors duration-300 ${
            isLight
              ? 'bg-black text-white border-black hover:bg-zinc-800'
              : 'bg-white/[0.06] text-white border-white/15 hover:bg-white/[0.14] backdrop-blur-md'
          }`}
          aria-label="Gemstrat home"
        >
          <span className="relative w-[18px] h-[18px] shrink-0 overflow-hidden">
            <Image src="/gemstrat-logo.png" alt="" fill sizes="18px" className="object-contain" />
          </span>
          <span className="font-archivo-expanded text-[11px] sm:text-xs font-bold uppercase tracking-wider">
            Gemstrat
          </span>
        </a>

        {/* Right: call to action */}
        <a
          href="#contact"
          onClick={(e) => {
            e.preventDefault();
            scrollTo('#contact');
          }}
          style={{ animationDelay: '1.38s' }}
          className={`nav-item-in pointer-events-auto group flex items-center justify-between gap-6 sm:gap-16 h-10 pl-3.5 pr-3 font-sans text-[11px] sm:text-xs uppercase tracking-[0.04em] transition-colors duration-300 ${
            isLight ? 'bg-black text-white hover:bg-zinc-800' : 'bg-white text-black hover:bg-zinc-200'
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
    </header>
  );
}
