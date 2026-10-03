'use client';

import React, { useEffect, useRef } from 'react';

// ---------------------------------------------------------------------------
// FilmSection
// The Gemstrat film, full viewport width and height, in the normal page flow
// (no pinning): it simply scrolls in after the hero and Statement.
// ---------------------------------------------------------------------------

// 1080p H.264 at 4.5 Mbps, no audio, fast-start (re-encoded from the 95 MB master)
const VIDEO_SRC = '/videos/gemstrat-film.mp4';
const POSTER_SRC = '/videos/gemstrat-film-poster.webp';

export default function FilmSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Lazy video: nothing downloads until the section is within ~1 screen of the
  // viewport; it pauses again when far away so it isn't decoding off-screen
  useEffect(() => {
    const video = videoRef.current;
    const section = sectionRef.current;
    if (!video || !section) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!video.src) {
            video.src = VIDEO_SRC;
            video.load();
          }
          video.play().catch(() => {
            // Autoplay blocked (e.g. low-power mode): the poster stays visible
          });
        } else if (!video.paused) {
          video.pause();
        }
      },
      { rootMargin: '100% 0px' }
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} id="film" aria-label="Gemstrat film" className="relative w-full h-screen h-[100svh] bg-[#090909] overflow-hidden">
      <video
        ref={videoRef}
        poster={POSTER_SRC}
        preload="none"
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
      />
    </section>
  );
}
