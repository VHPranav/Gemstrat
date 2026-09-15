'use client';

import React, { useEffect, useRef, useState } from 'react';
import BeamField from '@/components/ui/BeamField';

const APPROACH_CARDS = [
  {
    step: '01',
    title: 'Clarity in complexity',
    description: 'We decode tangled operations and markets into clear roadmaps.',
  },
  {
    step: '02',
    title: 'Scalable execution',
    description: 'Every framework we build is tied to practical action.',
  },
  {
    step: '03',
    title: 'Momentum at every stage',
    description: 'Early-stage founder or multinational — we deliver solutions that create traction.',
  },
];

export default function Approach() {
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [visibleCards, setVisibleCards] = useState<boolean[]>([false, false, false]);

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      setVisibleCards([true, true, true]);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = cardRefs.current.indexOf(entry.target as HTMLDivElement);
            if (index !== -1) {
              setVisibleCards((prev) => {
                if (prev[index]) return prev;
                const next = [...prev];
                next[index] = true;
                return next;
              });
              observer.unobserve(entry.target);
            }
          }
        });
      },
      { threshold: 0.15 }
    );

    cardRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section className="relative bg-paper text-ink py-20 lg:py-28" id="approach">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 relative z-[1]">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-12 border-b border-ink/15">
          <div>
            <p className="font-mono text-xs tracking-[0.14em] uppercase text-graphite mb-3">How We Help Clients</p>
            <h2 className="font-archivo-expanded text-[clamp(1.8rem,3.4vw,2.8rem)] font-extrabold uppercase tracking-[-0.01em] leading-[1.05] text-ink">
              Clarity, execution, momentum
            </h2>
          </div>
          <p className="max-w-[42ch] text-[1.05rem] text-graphite leading-relaxed">
            Businesses come to Gemstrat when they&apos;re ready to move past complexity, stagnation, or uncertainty.
            We specialize in turning challenges into momentum.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-12">
          {APPROACH_CARDS.map((card, idx) => {
            const inView = visibleCards[idx];
            return (
              <div
                key={card.step}
                ref={(el) => {
                  cardRefs.current[idx] = el;
                }}
                className="bg-sand/30 border border-ink/10 rounded p-8 flex flex-col justify-between reveal"
              >
                <div className="font-mono text-xs text-graphite mb-8">{card.step}</div>
                <div>
                  <h3 className="font-archivo font-bold text-xl uppercase mb-3 text-ink">
                    {card.title.split(' ').map((word, wIdx) => (
                      <span
                        key={wIdx}
                        className="inline-block mr-[0.28em] last:mr-0 will-change-[opacity,filter,transform] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                        style={{
                          opacity: inView ? 1 : 0,
                          filter: inView ? 'blur(0px)' : 'blur(12px)',
                          transform: inView ? 'translate3d(0, 0, 0)' : 'translate3d(0, 18px, 0)',
                          transitionDelay: inView ? `${idx * 120 + wIdx * 65}ms` : '0ms',
                        }}
                      >
                        {word}
                      </span>
                    ))}
                  </h3>
                  <p className="text-graphite text-sm leading-relaxed">
                    {card.description.split(' ').map((word, wIdx) => (
                      <span
                        key={wIdx}
                        className="inline-block mr-[0.25em] last:mr-0 will-change-[opacity,filter,transform] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                        style={{
                          opacity: inView ? 1 : 0,
                          filter: inView ? 'blur(0px)' : 'blur(10px)',
                          transform: inView ? 'translate3d(0, 0, 0)' : 'translate3d(0, 14px, 0)',
                          transitionDelay: inView ? `${idx * 120 + 180 + wIdx * 35}ms` : '0ms',
                        }}
                      >
                        {word}
                      </span>
                    ))}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="relative rounded bg-ink text-paper p-8 lg:p-14 overflow-hidden border border-line-on-ink reveal">
          <BeamField
            id="bApproach"
            family="cross"
            theme="inkSoft"
            count={8}
            w={1000}
            h={360}
            seed={47}
            strokeWidth={1}
            comet={0.26}
            durMin={6}
            durMax={10}
            stagger={0.3}
            staticOpacity={0.05}
          />
          <div className="relative z-[1] grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="font-mono text-xs text-silver">01</span>
                <h4 className="font-archivo font-bold text-base uppercase text-paper m-0">Deep Discovery</h4>
              </div>
              <p className="text-sub-on-ink text-sm leading-relaxed">We listen first, diving into your context and goals.</p>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="font-mono text-xs text-silver">02</span>
                <h4 className="font-archivo font-bold text-base uppercase text-paper m-0">Sharp Blueprinting</h4>
              </div>
              <p className="text-sub-on-ink text-sm leading-relaxed">We create actionable, architecture-led plans.</p>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="font-mono text-xs text-silver">03</span>
                <h4 className="font-archivo font-bold text-base uppercase text-paper m-0">Seamless Execution</h4>
              </div>
              <p className="text-sub-on-ink text-sm leading-relaxed">We bring ideas to life, iterate fast, and deliver measurable outcomes.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
