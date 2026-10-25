'use client';

import React, { useEffect, useRef, useState } from 'react';
import { onScrollFrame } from '@/lib/scrollFrame';
import BlueprintDrawing, { type BlueprintData } from '@/components/ui/BlueprintDrawing';
import taj from '@/data/blueprint/taj-mahal.json';

// ---------------------------------------------------------------------------
// ApproachSteps
// "How we work": the Taj Mahal blueprint pinned on the right (about 70% of
// the width, where the hero's S was) builds itself as the reader scrolls, one
// stage per step (BlueprintDrawing). The steps stay in place on the left,
// under where the hero's headline was: each blurs in and
// rises when its turn comes and blurs out as the next arrives. Invisible
// markers, one per step, carry the scroll. On phones the drawing pins across
// the top and the steps sit under it.
// ---------------------------------------------------------------------------

export interface ApproachStep {
  n: string;
  title: string;
  body: string;
}

export default function ApproachSteps({ steps }: { steps: ApproachStep[] }) {
  const progress = useRef(0);
  const stepRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [active, setActive] = useState(-1);

  // Progress 0 → 4: each step adds its share as it passes the reading line
  useEffect(() => {
    return onScrollFrame(() => {
      const line = window.innerHeight * 0.62;
      let p = 0;
      let current = -1;
      stepRefs.current.forEach((el, i) => {
        if (!el) return;
        const r = el.getBoundingClientRect();
        p += Math.min(1, Math.max(0, (line - r.top) / r.height));
        if (r.top < line) current = i;
      });
      progress.current = p;
      setActive(current);
    });
  }, []);

  return (
    <section
      id="how-we-work"
      className="relative px-5 sm:px-6 lg:px-8 [--steps-top:calc(5rem_+_(100vw_-_2.5rem)_*_var(--ratio)_+_2.5rem)] lg:[--steps-top:0px]"
      style={{ '--ratio': taj.h / taj.w } as React.CSSProperties}
    >
      <div className="lg:grid lg:grid-cols-[minmax(0,3fr)_minmax(0,7fr)] lg:gap-12 xl:gap-16">
        {/* The drawing, pinned on the right (on phones, across the top) */}
        <div className="sticky top-0 z-10 self-start lg:col-start-2 lg:row-start-1 -mx-5 sm:-mx-6 lg:mx-0 px-5 sm:px-6 lg:px-0 pt-20 pb-4 lg:pt-0 lg:pb-0 bg-[#090909] lg:bg-transparent lg:h-screen lg:flex lg:flex-col lg:justify-center">
          <div className="mx-auto w-full lg:w-[85%]" style={{ maxWidth: `calc((100vh - 20rem) * ${taj.w / taj.h})` }}>
            <BlueprintDrawing
              data={taj as BlueprintData}
              src="/images/blueprint/taj-mahal.webp"
              progress={progress}
              label="An architectural elevation of the Taj Mahal that draws itself as you scroll"
            />
          </div>
          {/* Phones: which step the drawing is on */}
          <div className="lg:hidden mt-3 grid grid-cols-4 gap-2">
            {steps.map((s, i) => (
              <span key={s.n} className={`h-px transition-colors duration-500 ${i <= active ? 'bg-white' : 'bg-white/20'}`} />
            ))}
          </div>
        </div>

        {/* The steps: they don't scroll past; each blurs in where it stands
            when its turn comes, and blurs out as the next comes in */}
        {/* (On phones it starts level with the drawing above it, so its text
            sits just under the drawing from the start) */}
        <div className="relative lg:col-start-1 lg:row-start-1 max-lg:-mt-[calc(var(--steps-top)_-_1.75rem)]">
          <div
            className="sticky top-0 h-screen h-[100svh] flex items-start lg:items-center pointer-events-none"
            style={{ paddingTop: `var(--steps-top)` } as React.CSSProperties}
          >
            <div className="grid w-full lg:pt-0 pointer-events-auto">
              {steps.map((s, i) => {
                const state = i === active ? 'now' : i < active ? 'past' : 'next';
                // In: blur in and rise, part after part. Out: blur out and
                // lift away, a touch quicker, so the next can come in
                const part = (k: number): React.CSSProperties => ({
                  opacity: state === 'now' ? 1 : 0,
                  filter: state === 'now' ? 'blur(0)' : 'blur(12px)',
                  transform: state === 'now' ? 'none' : `translate3d(0, ${state === 'past' ? -18 : 22}px, 0)`,
                  transition: `opacity ${state === 'now' ? 0.8 : 0.45}s, filter ${state === 'now' ? 0.8 : 0.45}s, transform ${
                    state === 'now' ? 1 : 0.5
                  }s cubic-bezier(0.16, 1, 0.3, 1)`,
                  transitionDelay: state === 'now' ? `${0.18 + k * 0.08}s` : `${k * 0.03}s`,
                });
                return (
                  <div
                    key={s.n}
                    className="[grid-area:1/1] self-center"
                    aria-hidden={state !== 'now'}
                    style={{ visibility: state === 'now' || active >= 0 ? 'visible' : 'hidden' }}
                  >
                    <h3
                      className="font-sans text-[clamp(2.2rem,3.4vw,56px)] font-normal tracking-[-0.045em] leading-[0.98] m-0"
                      style={part(0)}
                    >
                      {s.title}
                    </h3>
                    <p className="mt-5 font-archivo text-[16px] lg:text-[17px] leading-[1.55] text-white/65 m-0" style={part(1)}>
                      {s.body}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Invisible markers, one per step, that the scroll moves past: they
              set which step is showing and how far the drawing has got */}
          <ol
            className="list-none p-0 m-0 -mt-[100vh] -mt-[100svh] pb-[30vh] lg:pt-[20vh] lg:pb-[15vh] pointer-events-none"
            aria-hidden="true"
          >
            {steps.map((s, i) => (
              <li
                key={s.n}
                ref={(el) => {
                  stepRefs.current[i] = el;
                }}
                className="min-h-[45vh] lg:min-h-[55vh]"
              />
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
