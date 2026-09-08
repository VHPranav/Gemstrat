'use client';

import React, { useEffect, useState } from 'react';

const SECTIONS = [
  { id: 'about', title: 'About' },
  { id: 'enable', title: 'What We Enable' },
  { id: 'spotlight', title: 'Spotlight' },
  { id: 'approach', title: 'Approach' },
  { id: 'strengths', title: 'Strengths' },
  { id: 'leadership', title: 'Leadership' },
  { id: 'proof', title: 'Proof' },
  { id: 'contact', title: 'Contact' },
];

export default function Rail() {
  const [activeSection, setActiveSection] = useState<string>('about');

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + window.innerHeight * 0.45;
      for (let i = SECTIONS.length - 1; i >= 0; i--) {
        const el = document.getElementById(SECTIONS[i].id);
        if (el && el.offsetTop <= scrollPos) {
          setActiveSection(SECTIONS[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 z-40 hidden xl:flex flex-col items-center gap-4" aria-hidden="true">
      <div className="absolute right-[9px] top-0 bottom-0 w-px bg-ink/15 -z-10" />
      {SECTIONS.map((sec) => (
        <button
          key={sec.id}
          type="button"
          className={`w-5 h-5 flex items-center justify-center relative cursor-pointer group`}
          onClick={() => scrollTo(sec.id)}
          title={sec.title}
          aria-label={sec.title}
        >
          <span
            className={`rounded-full transition-all duration-200 ${
              activeSection === sec.id
                ? 'w-2.5 h-2.5 bg-bronze'
                : 'w-1.5 h-1.5 bg-graphite/40 group-hover:bg-graphite'
            }`}
          />
        </button>
      ))}
    </div>
  );
}
