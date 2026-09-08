'use client';

import { useEffect } from 'react';

export default function ScrollObserver() {
  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    // Scroll reveal
    const revealEls = Array.from(document.querySelectorAll<HTMLElement>('.reveal'));
    revealEls.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top > window.innerHeight * 0.92) {
        el.classList.add('pre');
      }
    });

    const revealObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.remove('pre');
            revealObs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    revealEls.forEach((el) => {
      if (el.classList.contains('pre')) revealObs.observe(el);
    });

    // Magnetic buttons
    const magneticCleanups: (() => void)[] = [];
    const magneticEls = Array.from(document.querySelectorAll<HTMLElement>('.magnetic'));

    magneticEls.forEach((el) => {
      const onMouseMove = (ev: MouseEvent) => {
        const r = el.getBoundingClientRect();
        const x = ev.clientX - (r.left + r.width / 2);
        const y = ev.clientY - (r.top + r.height / 2);
        el.style.transform = `translate(${(x * 0.18).toFixed(1)}px, ${(y * 0.28).toFixed(1)}px)`;
      };

      const onMouseLeave = () => {
        el.style.transform = 'translate(0px, 0px)';
      };

      el.addEventListener('mousemove', onMouseMove);
      el.addEventListener('mouseleave', onMouseLeave);

      magneticCleanups.push(() => {
        el.removeEventListener('mousemove', onMouseMove);
        el.removeEventListener('mouseleave', onMouseLeave);
      });
    });

    return () => {
      revealObs.disconnect();
      magneticCleanups.forEach((cleanup) => cleanup());
    };
  }, []);

  return null;
}
