import React from 'react';
import BeamField from '@/components/ui/BeamField';

export default function Leadership() {
  return (
    <section className="relative bg-ink text-paper py-20 lg:py-28 overflow-hidden" id="leadership">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 relative z-[1] grid grid-cols-1 lg:grid-cols-[0.85fr_1.3fr] gap-12 lg:gap-16 items-center">
        <div
          className="relative min-h-[380px] lg:min-h-[480px] rounded border border-line-on-ink overflow-hidden bg-gradient-to-br from-[#1c1c1d] to-[#0a0a0b] flex flex-col justify-end p-8"
          id="wave-portrait"
        >
          <BeamField
            id="bLead"
            family="wave"
            theme="inkWarm"
            count={13}
            w={400}
            h={500}
            seed={71}
            strokeWidth={1}
            comet={0.3}
            durMin={6}
            durMax={10}
            stagger={0.25}
            staticOpacity={0.1}
          />
          <div className="relative z-[2] mt-auto pt-6 border-t border-line-on-ink">
            <div className="font-archivo-expanded font-bold text-xl uppercase tracking-tight text-paper">Deepak Suresh</div>
            <div className="font-mono text-xs text-silver mt-1 uppercase tracking-wider">Founder &amp; Chief Enterprise Architect</div>
          </div>
        </div>

        <div className="reveal space-y-6">
          <p className="font-mono text-xs tracking-[0.14em] uppercase text-silver">Leadership &amp; Reach</p>
          <h2 className="font-archivo-expanded text-[clamp(1.8rem,3.4vw,2.8rem)] font-extrabold uppercase tracking-[-0.01em] leading-[1.05] text-paper">
            Two decades of building what scales
          </h2>
          <p className="max-w-[54ch] text-[1.05rem] text-sub-on-ink leading-relaxed">
            With over two decades of experience in enterprise architecture, marketing, and technology, Deepak has built
            and scaled businesses across continents. As the creator of Webzgo and the Convergence Suite, he brings a
            rare blend of systems thinking, brand strategy, and tech innovation — driving transformation at Gemstrat
            with hands-on leadership and expert teams assembled for each client&apos;s needs.
          </p>
          <div className="inline-flex items-center gap-3 py-2.5 px-4 rounded-full border border-bronze/40 bg-bronze/10 text-xs font-mono text-bronze-soft tracking-wider uppercase">
            <span className="w-2 h-2 rounded-full bg-bronze animate-pulse" />
            <span>Also leads Gemstrat Luxe — for ultra-high-net-worth clients</span>
          </div>
        </div>
      </div>
    </section>
  );
}
