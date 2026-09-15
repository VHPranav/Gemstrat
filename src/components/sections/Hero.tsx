import React from 'react';

export default function Hero() {
  return (
    <section
      className="relative w-full min-h-[100svh] bg-[#090909] text-white flex flex-col justify-center items-center overflow-hidden py-20 font-archivo"
      id="hero"
    >
      {/* Real heading for SEO/accessibility; the marquee below is decorative */}
      <h1 className="sr-only">Solving What Matters. Building What Lasts.</h1>

      {/* Center: brand video, framed */}
      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
        <div className="pointer-events-auto relative w-[clamp(200px,26vw,420px)] aspect-square overflow-hidden bg-black border border-white/10 shadow-2xl shadow-black/80 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-105">
          <video
            src="/videos/magnific_do-a-360deg-x-axis-rotati_gO2VDZASXO.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Kinetic horizontal marquee headline — sits above the video with a
          difference blend, so its colour inverts wherever it crosses the video */}
      <div
        aria-hidden="true"
        className="pointer-events-none relative z-20 w-full flex items-center overflow-hidden select-none mix-blend-difference"
      >
        <div className="marquee-track whitespace-nowrap">
          {[0, 1].map((copyIndex) => (
            <div key={copyIndex} className="flex items-center shrink-0">
              <span className="font-archivo-expanded text-[clamp(3.2rem,8vw,180px)] font-medium tracking-[-0.025em] text-white mr-10 sm:mr-14">
                Solving What Matters
              </span>
              <span className="font-archivo text-[clamp(1.8rem,3.5vw,80px)] text-white mr-10 sm:mr-14">
                •
              </span>
              <span className="font-archivo-expanded text-[clamp(3.2rem,8vw,180px)] font-medium tracking-[-0.025em] text-white mr-10 sm:mr-14">
                Building What Lasts
              </span>
              <span className="font-archivo text-[clamp(1.8rem,3.5vw,80px)] text-white mr-10 sm:mr-14">
                •
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
