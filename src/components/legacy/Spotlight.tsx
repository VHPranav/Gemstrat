import React from 'react';
import BeamField from '@/components/ui/BeamField';

export default function Spotlight() {
  return (
    <section className="relative bg-ink text-paper py-20 lg:py-28 overflow-hidden" id="spotlight">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 relative z-[1] grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-12 lg:gap-16 items-center">
        <div className="reveal space-y-6">
          <p className="font-mono text-xs tracking-[0.14em] uppercase text-silver">Spotlight</p>
          <h2 className="font-archivo-expanded text-[clamp(1.8rem,3.4vw,2.8rem)] font-extrabold uppercase tracking-[-0.01em] leading-[1.05] text-paper">
            Enterprise architecture &amp; mapping
          </h2>
          <p className="max-w-[56ch] text-[1.05rem] text-sub-on-ink leading-relaxed">
            We help you structure your business to scale, aligning people, processes, and platforms — because big moves
            need solid foundations. It isn&apos;t a buzzword at Gemstrat, it&apos;s a core discipline: we break down complex
            operations into clear, visual structures that highlight friction points, streamline systems, and identify
            areas of growth.
          </p>
          <div className="pt-2">
            <a
              className="inline-flex items-center gap-2.5 font-archivo font-bold text-xs uppercase tracking-wider py-3.5 px-7 rounded-full bg-paper text-ink hover:bg-white transition-all duration-200 magnetic"
              href="#contact"
            >
              Learn About EA &amp; Mapping
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
        <div className="relative min-h-[280px] lg:min-h-[340px] rounded border border-line-on-ink overflow-hidden bg-ink-2" id="skyline" aria-hidden="true">
          <BeamField
            id="bSpot"
            family="vertical"
            theme="inkSoft"
            count={13}
            w={480}
            h={340}
            seed={37}
            strokeWidth={1}
            comet={0.28}
            durMin={5}
            durMax={9}
            stagger={0.22}
            staticOpacity={0.07}
          />
        </div>
      </div>
    </section>
  );
}
