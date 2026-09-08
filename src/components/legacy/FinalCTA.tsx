import React from 'react';
import BeamField from '@/components/ui/BeamField';

export default function FinalCTA() {
  return (
    <section className="relative bg-ink text-paper py-24 lg:py-36 overflow-hidden" id="contact">
      <BeamField
        id="bFinal"
        family="burst"
        theme="inkBold"
        count={11}
        w={1200}
        h={640}
        seed={83}
        strokeWidth={1.3}
        comet={0.3}
        durMin={4.5}
        durMax={8.5}
        stagger={0.28}
        staticOpacity={0.08}
      />
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 relative z-[1]">
        <p className="font-mono text-xs tracking-[0.14em] uppercase text-silver mb-3">Ready to scale what matters?</p>
        <h2 className="font-archivo-expanded text-[clamp(2.2rem,4.8vw,4.5rem)] font-bold uppercase tracking-[-0.02em] leading-[1.05] text-paper max-w-[20ch] mb-12">
          Let&apos;s build what&apos;s next, together.
        </h2>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8 pt-8 border-t border-line-on-ink">
          <a
            className="inline-flex items-center gap-2.5 font-archivo font-bold text-xs uppercase tracking-wider py-4 px-8 rounded-full bg-paper text-ink hover:bg-white transition-all duration-200 magnetic w-fit"
            href="mailto:ask@gemstrat.com"
          >
            Get in Touch
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
          <div className="flex flex-col sm:items-end gap-1.5">
            <a className="font-archivo text-xl md:text-2xl font-bold text-paper hover:text-bronze-soft transition-colors" href="mailto:ask@gemstrat.com">
              ask@gemstrat.com
            </a>
            <a className="font-mono text-xs uppercase tracking-wider text-silver hover:text-paper transition-colors" href="tel:+16474722085">
              +1 647 472 2085
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
