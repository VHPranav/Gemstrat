'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

const TITLE_LINES = [
  [
    { text: 'Scaling', highlight: false },
    { text: 'expertise,', highlight: true },
  ],
  [
    { text: 'building', highlight: false },
    { text: 'what', highlight: false },
    { text: 'lasts.', highlight: false },
  ],
];

const DESC_P1_WORDS =
  'Two decades scaling businesses across enterprise architecture, marketing, and technology.'.split(
    ' '
  );

const DESC_P2_WORDS =
  'Creator of Webzgo and the Convergence Suite, leading Gemstrat with hands-on expertise and expert teams assembled for every client.'.split(
    ' '
  );

export default function ScalingExpertise() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
        }
      },
      {
        threshold: 0.15,
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="leadership"
      className="relative w-full min-h-screen lg:h-screen lg:min-h-[720px] xl:min-h-[760px] bg-white text-black py-16 sm:py-20 lg:py-12 px-6 sm:px-10 lg:px-16 xl:px-20 flex items-center justify-center overflow-hidden z-30"
      aria-label="Leadership & Scaling Expertise"
    >
      <div className="w-full max-w-[1560px] mx-auto h-full flex flex-col justify-between">

        {/* Desktop 3-Column Asymmetric Layout Matching Reference */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 xl:gap-12 w-full h-full items-center">

          {/* ========================================================= */}
          {/* Column 1 (Left): Top Image + Bottom Title                 */}
          {/* ========================================================= */}
          <div className="lg:col-span-4 flex flex-col justify-between items-start h-full gap-10 sm:gap-12 lg:gap-14 xl:gap-18">

            {/* Image 1 (Top-Left) */}
            <div
              className="relative w-[240px] sm:w-[280px] lg:w-[310px] xl:w-[335px] aspect-[4/5] bg-neutral-100 overflow-hidden border border-black/5 transition-all duration-800 ease-[cubic-bezier(0.16,1,0.3,1)] group"
              style={{
                opacity: inView ? 1 : 0,
                transform: inView ? 'none' : 'translate3d(0, 20px, 0)',
                filter: inView ? 'none' : 'blur(10px)',
                transitionDelay: '80ms',
              }}
            >
              <Image
                src="/images/ref%20images/14.webp"
                alt="Motion Blur - Dynamic Speed & Focus"
                fill
                priority
                unoptimized
                className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.03] grayscale"
              />
            </div>

            {/* Bottom-Left: Title with Blur-In-Up Stagger Animation */}
            <div className="flex flex-col items-start gap-3 sm:gap-3.5 max-w-[440px]">
              <h2 className="font-archivo text-[clamp(2.2rem,3.4vw,50px)] font-medium tracking-[-0.035em] leading-[1.08] text-black m-0">
                {TITLE_LINES.map((line, lIdx) => (
                  <span key={lIdx} className="block">
                    {line.map((item, wIdx) => (
                      <span
                        key={wIdx}
                        style={{
                          opacity: inView ? 1 : 0,
                          transform: inView ? 'translate3d(0, 0, 0)' : 'translate3d(0, 16px, 0)',
                          filter: inView ? 'none' : 'blur(10px)',
                          transitionDelay: inView
                            ? `${100 + (lIdx * 3 + wIdx) * 50}ms`
                            : '0ms',
                        }}
                        className={`inline-block mr-[0.24em] will-change-[transform,opacity,filter] transition-all duration-600 ease-[cubic-bezier(0.16,1,0.3,1)] ${item.highlight
                          ? 'text-neutral-400 font-normal'
                          : 'text-black font-medium'
                          }`}
                      >
                        {item.text}
                      </span>
                    ))}
                  </span>
                ))}
              </h2>
            </div>

          </div>

          {/* ========================================================= */}
          {/* Column 2 (Center): Vertically Centered Portrait Image     */}
          {/* ========================================================= */}
          <div className="lg:col-span-4 flex justify-center items-center h-full my-auto">
            <div
              className="relative w-[230px] sm:w-[270px] lg:w-[295px] xl:w-[325px] aspect-[3/4] bg-neutral-100 overflow-hidden border border-black/5 transition-all duration-800 ease-[cubic-bezier(0.16,1,0.3,1)] group"
              style={{
                opacity: inView ? 1 : 0,
                transform: inView ? 'none' : 'translate3d(0, 24px, 0)',
                filter: inView ? 'none' : 'blur(12px)',
                transitionDelay: '140ms',
              }}
            >
              <Image
                src="/images/ref%20images/15.webp"
                alt="Deepak - Founder of Gemstrat"
                fill
                priority
                unoptimized
                className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.03] grayscale"
              />
            </div>
          </div>

          {/* ========================================================= */}
          {/* Column 3 (Right): Top Description + Bottom-Right Image    */}
          {/* ========================================================= */}
          <div className="lg:col-span-4 flex flex-col justify-between items-start lg:items-end h-full gap-8 sm:gap-10">

            {/* Top-Right Corner: Bigger Description with Blur-In-Up Stagger */}
            <div className="w-full max-w-[460px] xl:max-w-[500px] text-left flex flex-col gap-3.5 sm:gap-4 pt-2 lg:pt-0">
              {/* Paragraph 1 */}
              <p className="font-archivo text-[clamp(1.15rem,1.55vw,23px)] xl:text-[24px] font-normal text-black leading-[1.45] tracking-[-0.015em] m-0">
                {DESC_P1_WORDS.map((word, wIdx) => (
                  <span
                    key={wIdx}
                    style={{
                      opacity: inView ? 1 : 0,
                      transform: inView ? 'translate3d(0, 0, 0)' : 'translate3d(0, 14px, 0)',
                      filter: inView ? 'none' : 'blur(8px)',
                      transitionDelay: inView ? `${140 + wIdx * 25}ms` : '0ms',
                    }}
                    className="inline-block mr-[0.25em] last:mr-0 will-change-[transform,opacity,filter] transition-all duration-600 ease-[cubic-bezier(0.16,1,0.3,1)]"
                  >
                    {word}
                  </span>
                ))}
              </p>

              {/* Paragraph 2 */}
              <p className="font-archivo text-[clamp(1.05rem,1.35vw,20px)] xl:text-[21px] font-normal text-neutral-500 leading-[1.5] tracking-[-0.012em] m-0">
                {DESC_P2_WORDS.map((word, wIdx) => (
                  <span
                    key={wIdx}
                    style={{
                      opacity: inView ? 1 : 0,
                      transform: inView ? 'translate3d(0, 0, 0)' : 'translate3d(0, 14px, 0)',
                      filter: inView ? 'none' : 'blur(8px)',
                      transitionDelay: inView
                        ? `${140 + (DESC_P1_WORDS.length + wIdx) * 18}ms`
                        : '0ms',
                    }}
                    className="inline-block mr-[0.25em] last:mr-0 will-change-[transform,opacity,filter] transition-all duration-600 ease-[cubic-bezier(0.16,1,0.3,1)]"
                  >
                    {word}
                  </span>
                ))}
              </p>
            </div>

            {/* Bottom-Right Corner: Image 3 */}
            <div
              className="relative w-[240px] sm:w-[280px] lg:w-[310px] xl:w-[335px] aspect-[4/5] bg-neutral-100 overflow-hidden border border-black/5 transition-all duration-800 ease-[cubic-bezier(0.16,1,0.3,1)] group"
              style={{
                opacity: inView ? 1 : 0,
                transform: inView ? 'none' : 'translate3d(0, 20px, 0)',
                filter: inView ? 'none' : 'blur(10px)',
                transitionDelay: '220ms',
              }}
            >
              <Image
                src="/images/ref%20images/16.webp"
                alt="Techwear Motion Blur - Execution & Momentum"
                fill
                unoptimized
                className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.03] grayscale"
              />
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
