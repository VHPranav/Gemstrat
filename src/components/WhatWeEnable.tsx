import React from 'react';

const SERVICES = [
  {
    index: '01',
    title: 'Enterprise Architecture & Mapping',
    desc: 'Align goals, operations, and systems for future-ready growth.',
    svg: (
      <svg className="w-[46px] h-[30px] shrink-0" viewBox="0 0 46 30" fill="none" aria-hidden="true">
        <rect x="1" y="1" width="44" height="28" rx="14" fill="none" stroke="var(--graphite)" strokeWidth="1.2" />
        <rect x="7" y="7" width="32" height="16" rx="8" fill="none" stroke="var(--silver)" strokeWidth="1.2" />
      </svg>
    ),
  },
  {
    index: '02',
    title: 'AI & Automation',
    desc: 'Integrate intelligence, streamline outcomes across the business.',
    svg: (
      <svg className="w-[46px] h-[30px] shrink-0" viewBox="0 0 46 30" fill="none" aria-hidden="true">
        <rect x="1" y="1" width="44" height="28" rx="14" fill="none" stroke="var(--graphite)" strokeWidth="1.2" />
        <circle cx="23" cy="15" r="8" fill="none" stroke="var(--silver)" strokeWidth="1.2" />
      </svg>
    ),
  },
  {
    index: '03',
    title: '360° Branding',
    desc: 'Craft distinctive brand systems that evolve with your business.',
    svg: (
      <svg className="w-[46px] h-[30px] shrink-0" viewBox="0 0 46 30" fill="none" aria-hidden="true">
        <rect x="1" y="1" width="44" height="28" rx="14" fill="none" stroke="var(--graphite)" strokeWidth="1.2" />
        <rect x="15" y="4" width="16" height="22" rx="8" fill="none" stroke="var(--silver)" strokeWidth="1.2" />
      </svg>
    ),
  },
  {
    index: '04',
    title: 'Advertising',
    desc: 'Build identities and campaigns that move markets.',
    svg: (
      <svg className="w-[46px] h-[30px] shrink-0" viewBox="0 0 46 30" fill="none" aria-hidden="true">
        <rect x="1" y="1" width="44" height="28" rx="14" fill="none" stroke="var(--graphite)" strokeWidth="1.2" />
        <path d="M9 15h28M28 8l7 7-7 7" fill="none" stroke="var(--silver)" strokeWidth="1.2" />
      </svg>
    ),
  },
  {
    index: '05',
    title: 'Neo Marketing & Digital',
    desc: 'Websites, apps and digital-first marketing designed to deliver results.',
    svg: (
      <svg className="w-[46px] h-[30px] shrink-0" viewBox="0 0 46 30" fill="none" aria-hidden="true">
        <rect x="1" y="1" width="44" height="28" rx="14" fill="none" stroke="var(--graphite)" strokeWidth="1.2" />
        <path d="M13 20l6-8 5 5 9-11" fill="none" stroke="var(--silver)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export default function WhatWeEnable() {
  return (
    <section className="relative bg-paper text-ink py-20 lg:py-28 border-t border-ink/10" id="enable">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 relative z-[1]">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-12 border-b border-ink/15">
          <h2 className="font-archivo-expanded text-[clamp(1.8rem,3.4vw,2.8rem)] font-extrabold uppercase tracking-[-0.01em] leading-[1.05] text-ink">
            What we enable
          </h2>
          <p className="max-w-[42ch] text-[1.05rem] text-graphite leading-relaxed">
            Our expertise spans strategy, technology, and creativity, allowing us to operate as a true end-to-end partner.
          </p>
        </div>

        {SERVICES.map((svc) => (
          <div
            key={svc.index}
            className="grid grid-cols-1 md:grid-cols-[60px_1.4fr_1.8fr_auto] items-center gap-4 md:gap-8 py-7 border-b border-ink/10 transition-colors duration-200 hover:bg-sand/30 px-3 rounded reveal"
          >
            <span className="font-mono text-sm text-graphite">{svc.index}</span>
            <span className="font-archivo font-bold text-lg md:text-xl text-ink">{svc.title}</span>
            <span className="text-graphite text-[0.98rem] leading-relaxed">{svc.desc}</span>
            {svc.svg}
          </div>
        ))}

        <div className="mt-12 flex justify-start">
          <a
            className="inline-flex items-center gap-2.5 font-archivo font-bold text-xs uppercase tracking-wider py-3.5 px-7 rounded-full border border-ink/30 hover:border-ink hover:bg-ink hover:text-paper transition-all duration-200 magnetic"
            href="#contact"
          >
            Find Your Solution
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 12h14M13 6l6 6-6 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
