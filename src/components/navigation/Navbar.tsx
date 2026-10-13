'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { onScrollFrame } from '@/lib/scrollFrame';
import { ZIcon } from '@/components/navigation/ZIcon';

// The Z menu (three.js) loads on its own, the first time the button is
// hovered, focused or pressed
const ZMenu = dynamic(() => import('@/components/navigation/ZMenu'), { ssr: false });

// ---------------------------------------------------------------------------
// Navbar
// Minimal fixed header: Gemstrat logo on the left; on the right the menu
// button — the logo's Z, which flies out and blasts into the menu (ZMenu) —
// and the "Let's talk" button. Square-cornered to match the hero. Switches to
// dark-on-light while it sits over the white sections.
// ---------------------------------------------------------------------------

const MENU_LINKS = [
  { label: 'Approach', href: '#about-intro' },
  { label: 'Focus areas', href: '#focus-areas' },
  { label: 'Advantage', href: '#advantage' },
  { label: 'Leadership', href: '#leadership' },
  { label: 'Voices', href: '#reviews' },
];
const LETS_TALK_WIDTH = 'w-[6.75rem] sm:w-[9rem]';

type MenuState = 'closed' | 'open' | 'closing';

export default function Navbar() {
  const [isLight, setIsLight] = useState(false);
  const [menu, setMenu] = useState<MenuState>('closed');
  const [target, setTarget] = useState<string | null>(null);
  // The menu is mounted ahead of the first click, so its 3D is ready
  const [armed, setArmed] = useState(false);
  const [hoverZ, setHoverZ] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [trigger, setTrigger] = useState<HTMLButtonElement | null>(null);

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

  // Escape closes the menu
  useEffect(() => {
    if (menu !== 'open') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setTarget(null);
      setMenu('closing');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menu]);

  const arm = () => {
    if (armed) return;
    setTrigger(buttonRef.current);
    setArmed(true);
  };
  const close = (href: string | null) => {
    setTarget(href);
    setMenu('closing');
  };
  const toggle = () => {
    arm();
    if (menu === 'open') close(null);
    else setMenu('open');
  };
  const scrollTo = (href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };
  // Logo and Let's talk: straight there, or via the menu's closing if it's up
  const go = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    if (menu === 'open') close(href);
    else scrollTo(href);
  };

  // Over a white section the bar goes dark-on-light — unless the menu is
  // up, which is always dark
  const light = isLight && menu === 'closed';

  return (
    <header className="fixed top-0 left-0 right-0 z-[900] pointer-events-none">
      {/* The menu sits below the bar, so the bar's buttons stay on top */}
      {armed && (
        <ZMenu
          links={MENU_LINKS}
          open={menu === 'open'}
          target={target}
          trigger={trigger}
          onSelect={(href) => close(href)}
          onRequestClose={() => close(null)}
          onClosed={() => {
            setMenu('closed');
            setTarget(null);
          }}
        />
      )}

      <div className="relative w-full px-5 sm:px-6 py-5 flex items-start justify-between">
        {/* Left: logo */}
        <a
          href="#hero"
          onClick={go('#hero')}
          style={{ animationDelay: '0.8s' }}
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
          {/* Menu: the logo's Z. It eases apart on hover; opening, it flies
              out as the 3D Z (ZMenu) and a close mark takes its place */}
          <button
            ref={buttonRef}
            type="button"
            onClick={toggle}
            onPointerEnter={() => {
              arm();
              setHoverZ(true);
            }}
            onPointerLeave={() => setHoverZ(false)}
            onPointerDown={arm}
            onFocus={arm}
            aria-expanded={menu === 'open'}
            aria-controls="site-menu"
            aria-label={menu === 'open' ? 'Close menu' : 'Open menu'}
            style={{ animationDelay: '0.86s' }}
            className={`nav-item-in pointer-events-auto relative flex items-center justify-center w-10 h-10 cursor-pointer border bg-transparent transition-colors duration-300 ${
              light ? 'border-black text-black hover:bg-black/5' : 'border-white text-white hover:bg-white/10'
            }`}
          >
            <span
              className="absolute inset-0 flex items-center justify-center transition-[opacity,transform] duration-300"
              style={{ opacity: menu === 'closed' ? 1 : 0, transform: menu === 'closed' ? 'scale(1)' : 'scale(0.6)' }}
            >
              <ZIcon className="w-[18px] h-[18px]" apart={hoverZ && menu === 'closed'} />
            </span>
            {/* Close: two lines crossing */}
            <span
              className="absolute inset-0 flex items-center justify-center transition-opacity duration-300"
              style={{ opacity: menu === 'open' ? 1 : 0 }}
              aria-hidden="true"
            >
              <span className="relative block w-[14px] h-[14px]">
                <span className="absolute left-0 right-0 top-[6.35px] h-[1.3px] bg-current rotate-45" />
                <span className="absolute left-0 right-0 top-[6.35px] h-[1.3px] bg-current -rotate-45" />
              </span>
            </span>
          </button>

          {/* Let's talk */}
          <a
            href="#contact"
            onClick={go('#contact')}
            style={{ animationDelay: '0.92s' }}
            className={`nav-item-in pointer-events-auto group flex items-center justify-between ${LETS_TALK_WIDTH} h-10 pl-3.5 pr-3 font-sans text-[11px] sm:text-xs uppercase tracking-[0.04em] transition-colors duration-300 ${
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
