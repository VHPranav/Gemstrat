'use client';

import React, { useMemo } from 'react';
import BeamField from '@/components/ui/BeamField';

const STRENGTHS = [
  {
    title: 'Client-Centric, Always',
    desc: 'We listen deeply and co-create solutions.',
  },
  {
    title: 'Industry Fluency',
    desc: 'From fintech to lifestyle, we speak your language.',
  },
  {
    title: 'Global Reach, Local Pulse',
    desc: 'Worldwide perspective, local nuance.',
  },
  {
    title: 'Creative Meets Commercial',
    desc: 'Smart ideas that perform in the market.',
  },
  {
    title: 'Proven Credentials',
    desc: '500+ projects across industries and markets.',
  },
  {
    title: 'Flexible Expert Teams',
    desc: 'Top specialists assembled per project needs.',
  },
  {
    title: 'Framework-First Thinking',
    desc: 'Not just tactics, but scalable architectures.',
  },
  {
    title: 'Execution That Matches Vision',
    desc: 'From grand ideas to live impact.',
  },
];

export default function Strengths() {
  const barcodeBars = useMemo(() => {
    let seed = 42;
    const rnd = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
    const bars = [];
    for (let i = 0; i < 34; i++) {
      bars.push({
        width: `${(1 + rnd() * 3).toFixed(1)}px`,
        height: `${(30 + rnd() * 70).toFixed(1)}%`,
      });
    }
    return bars;
  }, []);

  return (
    <section className="relative bg-sand text-ink py-20 lg:py-28 overflow-hidden" id="strengths">
      <BeamField
        id="bStrengths"
        family="drift"
        theme="paperSoft"
        count={7}
        w={1200}
        h={520}
        seed={59}
        strokeWidth={1}
        comet={0.35}
        durMin={8}
        durMax={13}
        stagger={0.4}
        staticOpacity={0.05}
      />
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 relative z-[1]">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-12 border-b border-ink/15">
          <div>
            <p className="font-mono text-xs tracking-[0.14em] uppercase text-graphite mb-3">Our Strengths</p>
            <h2 className="font-archivo-expanded text-[clamp(1.8rem,3.4vw,2.8rem)] font-extrabold uppercase tracking-[-0.01em] leading-[1.05] text-ink">
              Why businesses choose Gemstrat
            </h2>
          </div>
          <div className="hidden md:flex items-end gap-[3px] h-10 shrink-0 opacity-40" aria-hidden="true">
            {barcodeBars.map((bar, idx) => (
              <i key={idx} className="bg-ink block" style={{ width: bar.width, height: bar.height }} />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 my-12">
          {STRENGTHS.map((item, idx) => (
            <div
              key={idx}
              className="bg-paper/70 border border-ink/10 rounded p-6 flex items-start gap-4 transition-transform hover:-translate-y-1 duration-200 reveal"
            >
              <span className="text-bronze font-mono font-bold text-lg select-none">&gt;</span>
              <div>
                <h4 className="font-archivo font-bold text-base uppercase text-ink mb-1.5">{item.title}</h4>
                <p className="text-graphite text-sm leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="p-5 rounded bg-paper/60 border border-ink/10 font-mono text-xs tracking-wider uppercase text-graphite flex items-center gap-2.5">
          <span className="text-bronze font-bold text-sm">&gt;</span> This is the Gemstrat edge: sharper solutions for stronger business.
        </div>
      </div>
    </section>
  );
}
