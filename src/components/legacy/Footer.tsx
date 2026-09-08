import React from 'react';

export default function Footer() {
  return (
    <footer className="relative bg-ink text-paper py-16 border-t border-line-on-ink overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 relative z-[1]">
        <div className="flex flex-wrap gap-x-8 gap-y-4 pb-12 border-b border-line-on-ink">
          <a className="font-mono text-xs uppercase tracking-wider text-silver hover:text-paper transition-colors" href="#about">
            About Us
          </a>
          <a className="font-mono text-xs uppercase tracking-wider text-silver hover:text-paper transition-colors" href="#enable">
            What We Enable
          </a>
          <a className="font-mono text-xs uppercase tracking-wider text-silver hover:text-paper transition-colors" href="#industries">
            Industries We Shape
          </a>
          <a className="font-mono text-xs uppercase tracking-wider text-silver hover:text-paper transition-colors" href="#approach">
            Work
          </a>
          <a className="font-mono text-xs uppercase tracking-wider text-silver hover:text-paper transition-colors" href="#proof">
            FAQs
          </a>
          <a className="font-mono text-xs uppercase tracking-wider text-silver hover:text-paper transition-colors" href="#contact">
            Contact
          </a>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pt-8">
          <span className="font-mono text-xs text-sub-on-ink tracking-wider">
            © 2026 Gemstrat · Privacy Policy · Terms &amp; Conditions
          </span>
          <div className="flex gap-6">
            <a className="font-mono text-xs uppercase tracking-wider text-silver hover:text-paper transition-colors" href="#" aria-label="LinkedIn">
              LinkedIn
            </a>
            <a className="font-mono text-xs uppercase tracking-wider text-silver hover:text-paper transition-colors" href="#" aria-label="Instagram">
              Instagram
            </a>
            <a className="font-mono text-xs uppercase tracking-wider text-silver hover:text-paper transition-colors" href="#" aria-label="X">
              X
            </a>
            <a className="font-mono text-xs uppercase tracking-wider text-silver hover:text-paper transition-colors" href="#" aria-label="YouTube">
              YouTube
            </a>
          </div>
        </div>
      </div>
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 mt-16 select-none opacity-10 pointer-events-none" aria-hidden="true">
        <span className="font-archivo-expanded font-black text-[clamp(4rem,14vw,14rem)] leading-none text-white tracking-tighter block">
          GEMSTRAT
        </span>
      </div>
    </footer>
  );
}
