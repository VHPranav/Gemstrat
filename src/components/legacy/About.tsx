import React from 'react';
import BeamField from '@/components/ui/BeamField';

export default function About() {
  return (
    <section className="relative bg-paper text-ink py-20 lg:py-28 overflow-hidden" id="about">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 relative z-[1] grid grid-cols-1 lg:grid-cols-[0.9fr_1.3fr] gap-10 lg:gap-16 items-center">
        <div className="relative min-h-[300px] lg:min-h-[420px] rounded border border-ink/10 overflow-hidden bg-sand/30" id="ribbon">
          <BeamField
            id="bAbout"
            family="ribbon"
            theme="paperSoft"
            count={9}
            w={460}
            h={420}
            seed={23}
            strokeWidth={1}
            comet={0.4}
            durMin={6}
            durMax={11}
            stagger={0.35}
            staticOpacity={0.1}
          />
        </div>

        <div>
          <p className="font-mono text-xs tracking-[0.14em] uppercase text-graphite mb-3">Who We Are</p>
          <h2 className="font-archivo-expanded text-[clamp(1.8rem,3.4vw,2.8rem)] font-extrabold uppercase tracking-[-0.01em] leading-[1.05] text-ink text-balance">
            What drives us
          </h2>
          <div className="mt-5 space-y-4 max-w-[62ch] text-[1.05rem] leading-[1.65] text-graphite reveal">
            <p>
              <strong className="text-ink font-semibold">Gemstrat</strong> is where sharp minds and bold ideas come together. We are a boutique
              strategic consultancy built for ambitious businesses ready to scale, transform, and succeed. With a
              footprint spanning the <strong className="text-ink font-semibold">USA, Canada, India, the Middle East, and Africa</strong>, we combine
              global perspective with local insight to solve complex challenges.
            </p>
            <p>
              Our belief is simple: solutions should be practical, human, and built to last. We don&apos;t stop at advice.
              We execute, ensuring strategy translates into measurable outcomes. From enterprise architecture to AI
              integration, from branding to digital transformation,{' '}
              <span className="bg-sand/70 px-1.5 py-0.5 rounded font-medium text-ink">Gemstrat helps businesses move forward with clarity and confidence.</span>
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-ink/10 reveal">
            <div className="font-archivo font-bold text-[0.95rem] text-ink flex flex-col gap-1.5 leading-snug">
              Clarity first
              <span className="font-normal text-xs text-graphite font-mono">We decode before we advise.</span>
            </div>
            <div className="font-archivo font-bold text-[0.95rem] text-ink flex flex-col gap-1.5 leading-snug">
              Partnership over transaction
              <span className="font-normal text-xs text-graphite font-mono">Extended arms, not vendors.</span>
            </div>
            <div className="font-archivo font-bold text-[0.95rem] text-ink flex flex-col gap-1.5 leading-snug">
              Long-term value
              <span className="font-normal text-xs text-graphite font-mono">Over short-term wins.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
