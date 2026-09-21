'use client';

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';

interface NavItem {
  name: string;
  href: string;
}

const NAV_LINKS: NavItem[] = [
  { name: 'About us', href: '#about-intro' },
  { name: 'What we enable', href: '#statement' },
  { name: 'The Advantage', href: '#advantage' },
  { name: 'Scaling Expertise', href: '#leadership' },
  { name: 'Client Reviews', href: '#reviews' },
  { name: 'Contact', href: '#contact' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLight, setIsLight] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Dynamic Theme Detection:
  // Checks if the top navbar (viewport top ~40px) overlaps white sections (#advantage, #leadership)
  useEffect(() => {
    const handleScroll = () => {
      const focusAreasEl = document.getElementById('focus-areas');
      if (focusAreasEl) {
        const rect = focusAreasEl.getBoundingClientRect();
        const advEl = document.getElementById('focus-item-4');
        const isPastAdv = advEl ? advEl.getBoundingClientRect().bottom < 80 : false;
        if (rect.top <= 60 && rect.bottom >= 60 && !isPastAdv) {
          setIsLight(true);
          return;
        }
      }

      const advantageEl = document.getElementById('advantage');
      if (advantageEl) {
        const rect = advantageEl.getBoundingClientRect();
        if (rect.top <= 60 && rect.bottom >= 60) {
          setIsLight(true);
          return;
        }
      }

      const leadershipEl = document.getElementById('leadership');
      if (leadershipEl) {
        const rect = leadershipEl.getBoundingClientRect();
        if (rect.top <= 60 && rect.bottom >= 60) {
          setIsLight(true);
          return;
        }
      }

      setIsLight(false);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLinkClick = (href: string) => {
    setIsOpen(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* ========================================================= */}
      {/* 1. Top Floating Navigation Bar                            */}
      {/* ========================================================= */}
      <header className="fixed top-0 left-0 right-0 z-[900] pointer-events-none w-full transition-all duration-300">
        <div className="w-full max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-14 py-5 sm:py-6 flex items-center justify-between">

          {/* Left: Gemstrat Logo Pill (Fades out when menu opens) */}
          <div
            className={`pointer-events-auto transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              isOpen
                ? 'opacity-0 -translate-y-2 pointer-events-none scale-95'
                : 'opacity-100 translate-y-0 scale-100'
            }`}
          >
            <a
              href="#hero"
              onClick={(e) => {
                e.preventDefault();
                handleLinkClick('#hero');
              }}
              className={`group cursor-pointer flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border backdrop-blur-md transition-all duration-300 ${
                isLight
                  ? 'bg-black/[0.06] hover:bg-black/[0.12] border-black/15 text-black'
                  : 'bg-white/[0.08] hover:bg-white/[0.16] border-white/15 text-white'
              }`}
              aria-label="Gemstrat Home"
            >
              <div className="relative w-[18px] h-[18px] shrink-0 rounded-sm overflow-hidden">
                <Image
                  src="/gemstrat-logo.png"
                  alt="Gemstrat"
                  fill
                  sizes="18px"
                  className="object-contain"
                />
              </div>
              <span className="font-archivo-expanded text-[11px] sm:text-xs font-bold uppercase tracking-wider">
                Gemstrat
              </span>
            </a>
          </div>

          {/* Center: Adaptive Elongated Menu Pill Button */}
          {/* On black bg: White menu button | On white bg: Black menu button */}
          <div className="pointer-events-auto">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`group cursor-pointer min-w-[145px] sm:min-w-[175px] px-8 sm:px-10 py-2 sm:py-2.5 rounded-full flex items-center justify-center gap-3 font-mono text-[11px] sm:text-xs uppercase tracking-widest transition-all duration-300 will-change-transform hover:scale-[1.03] active:scale-95 ${
                isOpen
                  ? 'opacity-0 pointer-events-none scale-90'
                  : isLight
                  ? 'bg-black text-white hover:bg-zinc-800 shadow-[0_10px_30px_rgba(0,0,0,0.25)]'
                  : 'bg-white text-black hover:bg-zinc-200 shadow-[0_10px_30px_rgba(255,255,255,0.18)]'
              }`}
              aria-expanded={isOpen}
              aria-label="Toggle Navigation Menu"
            >
              <span className="font-mono text-zinc-500 group-hover:text-inherit transition-colors">
                [ ]
              </span>
              <span className="font-semibold tracking-[0.2em]">menu</span>
            </button>
          </div>

          {/* Right: "Let's Talk" Button Pill (Fades out when menu opens) */}
          <div
            className={`pointer-events-auto transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              isOpen
                ? 'opacity-0 -translate-y-2 pointer-events-none scale-95'
                : 'opacity-100 translate-y-0 scale-100'
            }`}
          >
            <a
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                handleLinkClick('#contact');
              }}
              className={`group cursor-pointer flex items-center gap-2 px-4 py-1.5 rounded-full border backdrop-blur-md transition-all duration-300 font-mono text-[11px] sm:text-xs tracking-wider uppercase ${
                isLight
                  ? 'bg-black/[0.06] hover:bg-black/[0.12] border-black/15 text-black'
                  : 'bg-white/[0.08] hover:bg-white/[0.16] border-white/15 text-white'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
              <span>Let&apos;s talk</span>
            </a>
          </div>

        </div>
      </header>

      {/* ========================================================= */}
      {/* 2. Menu Open: Blurred Background Backdrop                  */}
      {/* ========================================================= */}
      <div
        onClick={() => setIsOpen(false)}
        className={`fixed inset-0 z-[950] bg-black/45 backdrop-blur-md cursor-pointer transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden={!isOpen}
      />

      {/* ========================================================= */}
      {/* 3. Dropdown Menu Island (Compact, Scales Open & Blur-In)  */}
      {/* ========================================================= */}
      <div
        ref={dropdownRef}
        className={`fixed top-5 sm:top-6 left-1/2 -translate-x-1/2 z-[990] w-[90vw] sm:w-[350px] max-w-[360px] rounded-[24px] bg-[#0e0e0f]/95 border border-white/15 shadow-[0_30px_90px_rgba(0,0,0,0.85)] p-5 sm:p-6 backdrop-blur-2xl text-white origin-top will-change-[transform,opacity,filter] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen
            ? 'opacity-100 scale-100 translate-y-0 blur-0 pointer-events-auto'
            : 'opacity-0 scale-[0.82] -translate-y-3 blur-[8px] pointer-events-none'
        }`}
        role="dialog"
        aria-modal="true"
      >
        {/* Dropdown Header: Logo on left, Close button on right */}
        <div className="flex items-center justify-between w-full pb-3.5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="relative w-4 h-4 rounded-sm overflow-hidden shrink-0">
              <Image
                src="/gemstrat-logo.png"
                alt="Gemstrat Logo"
                fill
                sizes="16px"
                className="object-contain"
              />
            </div>
            <span className="font-archivo-expanded text-[11px] font-bold uppercase tracking-wider text-white">
              Gemstrat
            </span>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="cursor-pointer font-mono text-[11px] tracking-wider text-zinc-400 hover:text-white uppercase transition-colors px-2 py-0.5 rounded-full hover:bg-white/10 flex items-center gap-1.5"
            aria-label="Close menu"
          >
            <span className="text-[10px] text-zinc-500">[x]</span>
            <span>close</span>
          </button>
        </div>

        {/* Navigation Links with Staggered Blur-In-Up Animation */}
        <nav className="py-4 sm:py-5 flex flex-col items-start gap-2 sm:gap-2.5">
          {NAV_LINKS.map((link, idx) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => {
                e.preventDefault();
                handleLinkClick(link.href);
              }}
              style={{
                transitionDelay: isOpen ? `${90 + idx * 40}ms` : '0ms',
              }}
              className={`group cursor-pointer flex items-center gap-2.5 text-[16px] sm:text-[18px] font-archivo font-normal text-zinc-300 hover:text-white will-change-[transform,opacity,filter] transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isOpen
                  ? 'opacity-100 translate-y-0 blur-0'
                  : 'opacity-0 translate-y-3 blur-[6px]'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
              <span className="tracking-[-0.01em] group-hover:translate-x-1 transition-transform duration-200">
                {link.name}
              </span>
            </a>
          ))}
        </nav>

        {/* Dropdown Footer: [ gemstrat ] tag on left, "Let's talk" on right */}
        <div className="flex items-center justify-between pt-3.5 border-t border-white/10 w-full">
          <span className="font-mono text-[11px] text-zinc-500 tracking-wider">
            [ gemstrat ]
          </span>

          <a
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              handleLinkClick('#contact');
            }}
            className="cursor-pointer flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white text-black hover:bg-zinc-200 font-mono text-[11px] tracking-wider uppercase transition-all duration-200 shadow-md font-semibold"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
            <span>Let&apos;s talk</span>
          </a>
        </div>
      </div>
    </>
  );
}
