'use client';

import React, { useEffect, useState } from 'react';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 sm:px-12 lg:px-16 text-paper transition-all duration-400 border-b ${
        isScrolled
          ? 'bg-[#0b0b0c]/85 backdrop-blur-md border-line-on-ink py-3'
          : 'bg-transparent border-transparent py-5'
      }`}
      id="topnav"
    >
      <a href="#hero" className="flex items-center gap-2.5 text-inherit no-underline">
        <svg className="w-8 h-8 shrink-0" viewBox="0 0 40 40" fill="none" aria-hidden="true">
          <path d="M6 8H30V16H14V16.5L30 24V32H6V24H22V23.5L6 16Z" fill="currentColor" />
          <path d="M14 16L22 23.5V24H14V16Z" fill="#B7B8BB" />
        </svg>
        <span className="font-archivo-expanded font-bold text-sm tracking-widest uppercase text-white">GEMSTRAT</span>
      </a>
      <div className="hidden md:flex items-center gap-8">
        <a className="font-mono text-xs uppercase tracking-wider text-silver hover:text-paper transition-colors" href="#about">
          About
        </a>
        <a className="font-mono text-xs uppercase tracking-wider text-silver hover:text-paper transition-colors" href="#enable">
          Enable
        </a>
        <a className="font-mono text-xs uppercase tracking-wider text-silver hover:text-paper transition-colors" href="#industries">
          Industries
        </a>
        <a className="font-mono text-xs uppercase tracking-wider text-silver hover:text-paper transition-colors" href="#approach">
          Approach
        </a>
        <a
          className="inline-flex items-center font-mono text-xs uppercase tracking-wider py-2 px-5 rounded-full border border-paper/30 hover:border-paper hover:bg-paper hover:text-ink transition-all duration-200"
          href="#contact"
        >
          Let&apos;s Talk
        </a>
      </div>
    </nav>
  );
}
