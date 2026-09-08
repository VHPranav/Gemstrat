import React from 'react';
import Image from 'next/image';
import BeamField from '@/components/BeamField';

export default function Hero() {
  return (
    <section
      className="relative w-full min-h-[100svh] bg-[#090909] text-white flex flex-col justify-center items-center overflow-hidden py-20 font-jakarta"
      id="hero"
    >
      {/* 100vh Ambient BeamField: Orbit Family */}
      <BeamField
        family="orbit"
        theme="inkSoft"
        count={12}
        w={1600}
        h={1000}
        staticOpacity={0.035}
        className="opacity-30 pointer-events-none"
      />

      <div className="relative z-10 w-full max-w-full m-0 grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] items-center justify-items-center gap-8 lg:gap-12 px-6 sm:px-12 lg:px-20 box-border">
        {/* Left column */}
        <div className="justify-self-center lg:justify-self-start text-center lg:text-left">
          <h1 className="font-jakarta text-[clamp(2.2rem,4.3vw,100px)] font-medium leading-[1.15] tracking-[-0.025em] text-white m-0 text-center lg:text-left">
            <span className="block whitespace-nowrap">Solving What</span>
            <span className="block whitespace-nowrap">Matters</span>
          </h1>
        </div>

        {/* Center column: dummy image placeholder */}
        <div className="justify-self-center flex items-center justify-center relative">
          <div className="relative flex items-center justify-center">
            {/* DUMMY IMAGE AT CENTER: Replace src="/hero-dummy.png" with your real image later */}
            <Image
              src="/hero-dummy.png"
              alt="Gemstrat Emblem Placeholder"
              width={160}
              height={155}
              priority
              className="w-[clamp(120px,13vw,175px)] h-auto aspect-[100/97] object-contain block select-none transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-105"
            />
          </div>
        </div>

        {/* Right column */}
        <div className="justify-self-center lg:justify-self-end text-center lg:text-right">
          <h2 className="font-jakarta text-[clamp(2.2rem,4.3vw,100px)] font-medium leading-[1.15] tracking-[-0.025em] text-white m-0 text-center lg:text-right">
            <span className="block whitespace-nowrap">Building What</span>
            <span className="block whitespace-nowrap">Lasts</span>
          </h2>
        </div>
      </div>
    </section>
  );
}
