'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import styles from './presence.module.css';

const width = 384;
const height = 256;
const clamp = (value: number) => Math.max(0, Math.min(1, value));
type Trace = { w: number; h: number; lines: [number, number, number, number][] };

function noise(x: number, y: number) {
  const value = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return value - Math.floor(value);
}

function smoothNoise(x: number, y: number) {
  const left = Math.floor(x);
  const top = Math.floor(y);
  const smooth = (t: number) => t * t * (3 - 2 * t);
  const u = smooth(x - left);
  const v = smooth(y - top);
  return (noise(left, top) * (1 - u) + noise(left + 1, top) * u) * (1 - v)
    + (noise(left, top + 1) * (1 - u) + noise(left + 1, top + 1) * u) * v;
}

let thresholdField: Float32Array | undefined;
function thresholds() {
  if (thresholdField) return thresholdField;
  thresholdField = Float32Array.from({ length: width * height }, (_, i) => {
    const x = i % width;
    const y = Math.floor(i / width);
    return .22 + (1 - y / height) * .49 + .13 * smoothNoise(x / 38, y / 38)
      + .07 * smoothNoise(x / 15, y / 15) + .03 * smoothNoise(x / 6, y / 6);
  });
  return thresholdField;
}

function paintOutline(canvas: HTMLCanvasElement, source: HTMLImageElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.drawImage(source, 0, 0, width, height);
  const input = ctx.getImageData(0, 0, width, height);
  const output = ctx.createImageData(width, height);
  const lum = (i: number) => {
    const pixel = 4 * i;
    const alpha = input.data[pixel + 3] / 255;
    const value = .299 * input.data[pixel] + .587 * input.data[pixel + 1] + .114 * input.data[pixel + 2];
    return value * alpha + 255 * (1 - alpha);
  };
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = y * width + x;
      const a = lum(i - width - 1), b = lum(i - width), c = lum(i - width + 1);
      const d = lum(i - 1), f = lum(i + 1);
      const g = lum(i + width - 1), h = lum(i + width), j = lum(i + width + 1);
      const edge = Math.hypot(c + 2 * f + j - a - 2 * d - g, g + 2 * h + j - a - 2 * b - c);
      output.data.set([88, 77, 60, Math.min(160, Math.max(0, edge - 32))], i * 4);
    }
  }
  ctx.putImageData(output, 0, 0);
}

export default function LandmarkReveal({ image, landmark, progress }: { image: string; landmark: string; progress: number }) {
  const outline = useRef<HTMLCanvasElement>(null);
  const ink = useRef<HTMLCanvasElement>(null);
  const mask = useRef<CanvasRenderingContext2D | null>(null);
  const pixels = useRef<ImageData | null>(null);
  const [source, setSource] = useState<HTMLImageElement | null>(null);
  const [trace, setTrace] = useState<Trace | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const drawing = new window.Image();
    drawing.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      mask.current = canvas.getContext('2d');
      pixels.current = mask.current?.createImageData(width, height) ?? null;
      if (outline.current && ink.current?.getContext('2d') && pixels.current) {
        paintOutline(outline.current, drawing);
        setSource(drawing);
      }
    };
    drawing.src = image;
    fetch(image.replace('.png', '-trace.json'), { signal: controller.signal })
      .then(response => response.ok ? response.json() : null)
      .then(data => { if (!controller.signal.aborted) setTrace(data); })
      .catch(() => {});
    return () => {
      controller.abort();
      drawing.onload = null;
    };
  }, [image]);

  useEffect(() => {
    const ctx = ink.current?.getContext('2d');
    const maskContext = mask.current;
    const bitmap = pixels.current;
    if (!ctx || !source || !maskContext || !bitmap || progress === 1) return;
    const field = thresholds();
    for (let i = 0; i < field.length; i++) {
      bitmap.data[i * 4 + 3] = Math.round(clamp((progress - field[i]) / .14) * 255);
    }
    maskContext.putImageData(bitmap, 0, 0);
    ctx.clearRect(0, 0, 1536, 1024);
    ctx.drawImage(maskContext.canvas, 0, 0, 1536, 1024);
    ctx.globalCompositeOperation = 'source-in';
    ctx.drawImage(source, 0, 0, 1536, 1024);
    ctx.globalCompositeOperation = 'source-over';
  }, [source, progress]);

  const animated = Boolean(source) && progress < 1;
  const traceOpacity = 1 - clamp((progress - .56) / .37);
  return <div className={styles.landmark} data-animated={animated}>
    <Image className={styles.finished} src={image} alt={landmark} width={1536} height={1024} />
    <canvas className={styles.ink} ref={ink} width={1536} height={1024} aria-hidden="true" />
    <canvas className={styles.outline} ref={outline} width={width} height={height} aria-hidden="true" style={{ opacity: traceOpacity * .36 * clamp(progress * 5) }} />
    {animated && trace && <svg className={styles.trace} viewBox={`0 0 ${trace.w} ${trace.h}`} aria-hidden="true" style={{ opacity: traceOpacity }}>
      {trace.lines.map(([x1, y1, x2, y2], i) => <line key={i} x1={x1} x2={x2} y1={y1} y2={y2}
        pathLength={1} strokeDasharray={1} strokeDashoffset={1 - clamp(progress * 3 - Math.max(0, 1 - y1 / 213) * .8)} />)}
    </svg>}
  </div>;
}
