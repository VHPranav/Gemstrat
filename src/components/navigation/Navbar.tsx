'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { onScrollFrame } from '@/lib/scrollFrame';
import { ZIcon } from '@/components/navigation/ZIcon';
import { useRouter } from 'next/navigation';
import { goTo, setRouterPush } from '@/lib/navigate';
import type { ZMenuLink } from './ZMenu';

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

const MENU_LINKS: ZMenuLink[] = [
  { label: 'Who we are', children: [
    { label: 'Our purpose', href: '/our-purpose' },
    { label: 'Our approach', href: '#about-intro' },
    { label: 'Leadership', href: '#leadership' },
  ] },
  { label: 'Theory of Gemstrat', href: '#statement' },
  { label: 'Our global presence', href: '/our-global-presence' },
  { label: 'What we do', href: '/focus-areas' },
  { label: 'Contact', href: '#contact' },
];
const LETS_TALK_WIDTH = 'w-[6rem] sm:w-[7.5rem]';

type MenuState = 'closed' | 'open' | 'closing';

export default function Navbar() {
  const [isLight, setIsLight] = useState(false);
  const [menu, setMenu] = useState<MenuState>('closed');
  const [target, setTarget] = useState<string | null>(null);
  // The menu is mounted ahead of the first click, so its 3D is ready
  const [armed, setArmed] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [trigger, setTrigger] = useState<HTMLButtonElement | null>(null);
  const router = useRouter();
  useEffect(() => {
    setRouterPush((href) => router.push(href));
    return () => setRouterPush(null);
  }, [router]);

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
          overlapsTop(document.getElementById('leadership')) ||
          // White sections on the other pages
          Array.from(document.querySelectorAll<HTMLElement>('[data-nav-light]')).some(overlapsTop)
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
    // Get the menu's pages (and the Approach hero's 3D) ready ahead of the
    // click, so changing page doesn't wait on them
    MENU_LINKS.flatMap<ZMenuLink>((link) => link.children ?? [link]).forEach((link) => {
      if (link.href?.startsWith('/')) router.prefetch(link.href);
    });
    void import('@/components/ui/SkeletonMorph');
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
  const scrollTo = goTo;
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
            buttonRef.current?.focus();
          }}
        />
      )}

      <div className="relative w-full px-5 sm:px-6 py-5 flex items-start justify-between">
        {/* Left: logo */}
        <Link
          href="/#hero"
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
        </Link>

        <div className="flex items-start gap-2 sm:gap-3">
          {/* Menu: the logo's S. Opening, it flies out as the 3D S (ZMenu)
              and a close mark takes its place */}
          <button
            ref={buttonRef}
            type="button"
            onClick={toggle}
            onPointerEnter={arm}
            onPointerDown={arm}
            onFocus={arm}
            aria-expanded={menu === 'open'}
            aria-controls="site-menu"
            aria-label={menu === 'open' ? 'Close menu' : 'Open menu'}
            style={{ animationDelay: '0.86s' }}
            className={`nav-item-in pointer-events-auto relative flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 cursor-pointer border bg-transparent transition duration-300 ease-out hover:scale-105 active:scale-95 ${
              light ? 'border-black text-black hover:bg-black/5' : 'border-white text-white hover:bg-white/10'
            }`}
          >
            {/* Fades only: scaling it would leave the browser holding a
                blurry low-resolution copy of the icon */}
            <span
              className="absolute inset-0 flex items-center justify-center transition-opacity duration-300"
              style={{ opacity: menu === 'closed' ? 1 : 0 }}
            >
              <ZIcon className="w-[16px] h-[16px] sm:w-[18px] sm:h-[18px]" />
            </span>
            {/* Close: two lines crossing */}
            <span
              className="absolute inset-0 flex items-center justify-center transition-opacity duration-300"
              style={{ opacity: menu === 'open' ? 1 : 0 }}
              aria-hidden="true"
            >
              <span className="relative block w-[12px] h-[12px] sm:w-[14px] sm:h-[14px]">
                <span className="absolute left-0 right-0 top-[5.35px] sm:top-[6.35px] h-[1.3px] bg-current rotate-45" />
                <span className="absolute left-0 right-0 top-[5.35px] sm:top-[6.35px] h-[1.3px] bg-current -rotate-45" />
              </span>
            </span>
          </button>

          {/* Let's talk */}
          <Link
            href="/#contact"
            onClick={go('#contact')}
            style={{ animationDelay: '0.92s' }}
            className={`nav-item-in pointer-events-auto group flex items-center justify-between ${LETS_TALK_WIDTH} h-7 sm:h-8 pl-3 pr-2.5 sm:pl-3.5 sm:pr-3 font-sans text-[10px] sm:text-[11px] uppercase tracking-[0.04em] transition-colors duration-300 ${
              light ? 'bg-black text-white hover:bg-zinc-800' : 'bg-white text-black hover:bg-zinc-200'
            }`}
          >
            <span>Let&apos;s talk</span>
            <svg
              width="12"
              height="12"
              viewBox="0 0 14 14"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.3"
              className="transition-transform duration-300 group-hover:rotate-90"
              aria-hidden="true"
            >
              <path d="M7 1v12M1 7h12" />
            </svg>
          </Link>
        </div>
      </div>
    </header>
  );
}
