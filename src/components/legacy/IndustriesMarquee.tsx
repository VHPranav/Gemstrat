import React from 'react';
import BeamField from '@/components/ui/BeamField';

export default function IndustriesMarquee() {
  const industries = (
    <>
      <span className="marquee-item font-archivo-expanded text-[clamp(2.5rem,6vw,5.5rem)] font-extrabold uppercase tracking-tight pr-8 inline-block">
        Fintech <em className="text-bronze not-italic font-light">—</em> Healthcare <em className="text-bronze not-italic font-light">—</em> Consumer Tech <em className="text-bronze not-italic font-light">—</em> Lifestyle <em className="text-bronze not-italic font-light">—</em> Manufacturing <em className="text-bronze not-italic font-light">—</em> Hospitality <em className="text-bronze not-italic font-light">—</em> EdTech <em className="text-bronze not-italic font-light">—</em>
      </span>
      <span className="marquee-item font-archivo-expanded text-[clamp(2.5rem,6vw,5.5rem)] font-extrabold uppercase tracking-tight pr-8 inline-block">
        Fintech <em className="text-bronze not-italic font-light">—</em> Healthcare <em className="text-bronze not-italic font-light">—</em> Consumer Tech <em className="text-bronze not-italic font-light">—</em> Lifestyle <em className="text-bronze not-italic font-light">—</em> Manufacturing <em className="text-bronze not-italic font-light">—</em> Hospitality <em className="text-bronze not-italic font-light">—</em> EdTech <em className="text-bronze not-italic font-light">—</em>
      </span>
    </>
  );

  return (
    <section className="relative bg-ink text-paper py-16 overflow-hidden border-y border-line-on-ink" id="industries">
      <BeamField
        id="bIndustries"
        family="orbit"
        theme="inkSoft"
        count={5}
        w={1200}
        h={260}
        seed={67}
        strokeWidth={1}
        comet={0.4}
        durMin={7}
        durMax={12}
        stagger={0.4}
        staticOpacity={0.07}
      />
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 relative z-[1] mb-8">
        <p className="font-mono text-xs tracking-[0.14em] uppercase text-silver">
          Industries We Shape — global experience meets sectoral depth
        </p>
      </div>
      <div className="overflow-hidden whitespace-nowrap relative select-none">
        <div className="inline-flex marquee-track will-change-transform" id="marquee">
          {industries}
        </div>
      </div>
    </section>
  );
}
