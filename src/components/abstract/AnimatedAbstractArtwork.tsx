'use client';

import { useEffect, useId, useRef, useState } from 'react';
import artworks from '@/data/abstract/artworks.json';
import { onScrollFrame } from '@/lib/scrollFrame';
import AbstractArtwork from './AbstractArtwork';
import styles from './abstract-gallery.module.css';

export const ANIMATED_ARTWORKS = ['angular-convergence', 'contour-ribbon', 'radial-framework'];

type Drawing = { viewBox: string; paths: string[]; width: number };

export default function AnimatedAbstractArtwork({ name, className, showReplay = true }: { name: string; className: string; showReplay?: boolean }) {
  const artwork = artworks.find((item) => item.slug === name)!;
  const maskId = useId().replace(/:/g, '');
  const frame = useRef<HTMLDivElement>(null);
  const mask = useRef<SVGMaskElement>(null);
  const animations = useRef<Animation[]>([]);
  const replay = useRef<() => void>(() => {});
  const [drawing, setDrawing] = useState<Drawing | null>(null);
  const [imageReady, setImageReady] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch(artwork.src, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('Artwork unavailable');
        return response.text();
      })
      .then((source) => {
        const svg = new DOMParser().parseFromString(source, 'image/svg+xml').documentElement;
        let paths: string[];
        if (name === 'radial-framework') {
          // Construction rays start at the central opening and extend through
          // the original framework. The mask never changes the source geometry.
          paths = Array.from({ length: 42 }, (_, i) => {
            const angle = (i / 41) * Math.PI;
            const x = 326 + Math.cos(angle) * 620;
            const y = 160 + Math.sin(angle) * 450;
            return `M326 160 L${x} ${y}`;
          });
        } else {
          paths = Array.from(svg.querySelectorAll('path')).flatMap((path) =>
            (path.getAttribute('d') ?? '').match(/M[^M]+/g) ?? []);
          if (name === 'contour-ribbon') paths.reverse();
        }
        setDrawing({ viewBox: svg.getAttribute('viewBox')!, paths, width: name === 'radial-framework' ? 38 : name === 'contour-ribbon' ? 6 : 3 });
      })
      .catch(() => { /* Keep the original image if an animation cannot load. */ });
    return () => controller.abort();
  }, [artwork.src, name]);

  useEffect(() => {
    const container = frame.current;
    const drawingMask = mask.current;
    if (!drawing || !container || !drawingMask || !imageReady) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const strokes = Array.from(drawingMask.querySelectorAll('path'));
    const finish = drawingMask.querySelector('rect')!;

    if (name === 'contour-ribbon') {
      const updateFromScroll = () => {
        const progress = reduce.matches
          ? 1
          : Math.min(1, Math.max(0, (window.innerHeight - container.getBoundingClientRect().top) / window.innerHeight));
        strokes.forEach((stroke) => { stroke.style.strokeDashoffset = String(1 - progress); });
        finish.style.opacity = String(Math.min(1, Math.max(0, (progress - 0.82) / 0.18)));
        container.style.opacity = String(progress);
        container.style.transform = `translateX(${44 * (1 - progress)}px) scale(${0.88 + 0.12 * progress})`;
      };
      const stopScrollFrame = onScrollFrame(updateFromScroll);
      reduce.addEventListener('change', updateFromScroll);
      replay.current = updateFromScroll;
      return () => {
        stopScrollFrame();
        reduce.removeEventListener('change', updateFromScroll);
        replay.current = () => {};
      };
    }

    let started = false;
    let visible = false;

    function cancel() {
      animations.current.forEach((animation) => animation.cancel());
      animations.current = [];
    }
    function play() {
      cancel();
      if (reduce.matches) return;
      started = true;
      const stagger = name === 'angular-convergence' ? 65 : 48;
      const duration = 1450;
      animations.current = strokes.map((stroke, i) => stroke.animate(
        [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }],
        { duration, delay: i * stagger, easing: 'cubic-bezier(.35,0,.2,1)', fill: 'both' },
      ));
      animations.current.push(finish.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: 350, delay: (strokes.length - 1) * stagger + duration - 150, fill: 'both',
      }));
    }
    replay.current = play;
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !started) play();
      else animations.current.forEach((animation) => visible ? animation.play() : animation.pause());
    }, { threshold: 0.25 });
    observer.observe(container);
    const onMotionChange = () => {
      cancel();
      if (!reduce.matches && visible) play();
    };
    reduce.addEventListener('change', onMotionChange);
    return () => {
      observer.disconnect();
      reduce.removeEventListener('change', onMotionChange);
      cancel();
      replay.current = () => {};
    };
  }, [drawing, imageReady, name]);

  const [x, y, width, height] = drawing?.viewBox.split(/\s+/).map(Number) ?? [0, 0, artwork.width, artwork.height];

  return (
    <div ref={frame} className={styles.animationFrame}>
      {drawing ? (
        <svg className={className} viewBox={drawing.viewBox} role="img" aria-label={artwork.name} data-line-animation>
          <defs>
            <mask ref={mask} id={maskId} className={styles.drawingMask} maskUnits="userSpaceOnUse" x={x} y={y} width={width} height={height} style={{ maskType: 'luminance' }}>
                {drawing.paths.map((path, index) => <path key={index} d={path} pathLength="1" fill="none" stroke="white" strokeWidth={drawing.width} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="1 1" />)}
                <rect x={x} y={y} width={width} height={height} fill="white" />
            </mask>
          </defs>
          <rect x={x} y={y} width={width} height={height} fill="white" />
          <image href={artwork.src} x={x} y={y} width={width} height={height} mask={`url(#${maskId})`} onLoad={() => setImageReady(true)} />
        </svg>
      ) : <AbstractArtwork name={name} className={className} />}
      {showReplay && drawing && imageReady && <button className={styles.replay} type="button" onClick={() => replay.current()} aria-label={`Replay ${artwork.name} animation`}>Replay <span aria-hidden="true">↻</span></button>}
    </div>
  );
}
