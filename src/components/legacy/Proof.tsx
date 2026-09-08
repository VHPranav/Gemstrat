import React from 'react';

export default function Proof() {
  return (
    <section className="relative bg-paper text-ink py-20 lg:py-28" id="proof">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 relative z-[1]">
        <h2 className="font-archivo-expanded text-[clamp(1.8rem,3.4vw,2.8rem)] font-extrabold uppercase tracking-[-0.01em] leading-[1.05] text-ink mb-12">
          Trusted by teams that don&apos;t settle
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          <div className="bg-sand/30 border border-ink/10 rounded p-8 relative flex flex-col justify-between reveal">
            <span className="text-4xl text-bronze font-serif select-none mb-2">&ldquo;</span>
            <blockquote className="text-base md:text-lg leading-relaxed text-ink italic mb-6">
              Gemstrat helped us rethink everything and rebuild fast. What impressed me most was their ability to
              simplify the complex. We had clarity from Day 1.
            </blockquote>
            <cite className="font-mono text-xs uppercase tracking-wider text-graphite not-italic">
              — CEO, Fintech Startup (India)
            </cite>
          </div>
          <div className="bg-sand/30 border border-ink/10 rounded p-8 relative flex flex-col justify-between reveal">
            <span className="text-4xl text-bronze font-serif select-none mb-2">&ldquo;</span>
            <blockquote className="text-base md:text-lg leading-relaxed text-ink italic mb-6">
              They don&apos;t just talk shop when it comes to your business. They know their way around it. From our
              brand voice to our internal operations, everything&apos;s sharper now.
            </blockquote>
            <cite className="font-mono text-xs uppercase tracking-wider text-graphite not-italic">
              — Founder, D2C Brand (Dubai)
            </cite>
          </div>
        </div>
      </div>

      <div className="border-t border-ink/10 pt-12">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 grid grid-cols-2 lg:grid-cols-4 gap-8 items-center">
          <div className="flex flex-col">
            <b className="font-archivo-expanded text-4xl lg:text-5xl font-extrabold text-ink">500+</b>
            <span className="font-mono text-xs uppercase tracking-wider text-graphite mt-1">Projects delivered</span>
          </div>
          <div className="flex flex-col">
            <b className="font-archivo-expanded text-4xl lg:text-5xl font-extrabold text-ink">5</b>
            <span className="font-mono text-xs uppercase tracking-wider text-graphite mt-1">Regions of operation</span>
          </div>
          <div className="flex flex-col">
            <b className="font-archivo-expanded text-4xl lg:text-5xl font-extrabold text-ink">7</b>
            <span className="font-mono text-xs uppercase tracking-wider text-graphite mt-1">Industries shaped</span>
          </div>
          <div className="flex flex-wrap gap-2 col-span-2 lg:col-span-1 justify-start lg:justify-end">
            <span className="font-mono text-xs uppercase tracking-wider px-2.5 py-1 rounded bg-sand/60 text-ink">USA</span>
            <span className="font-mono text-xs uppercase tracking-wider px-2.5 py-1 rounded bg-sand/60 text-ink">Canada</span>
            <span className="font-mono text-xs uppercase tracking-wider px-2.5 py-1 rounded bg-sand/60 text-ink">India</span>
            <span className="font-mono text-xs uppercase tracking-wider px-2.5 py-1 rounded bg-sand/60 text-ink">Middle East</span>
            <span className="font-mono text-xs uppercase tracking-wider px-2.5 py-1 rounded bg-sand/60 text-ink">Africa</span>
          </div>
        </div>
      </div>
    </section>
  );
}
