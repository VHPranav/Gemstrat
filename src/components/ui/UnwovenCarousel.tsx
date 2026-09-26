'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { getGpuTier, isLowEndDevice } from '@/lib/device';
import { setLite } from '@/lib/perf';
import { usePerfLite } from '@/lib/usePerfLite';

// ---------------------------------------------------------------------------
// UnwovenCarousel
// An infinite WebGL strip of cards whose edges unravel into fluttering threads
// as they approach the left/right sides of the viewport.
//
// Two modes:
// - Autoplay (default): drifts at `scrollSpeed` and can be dragged/flung.
// - Controlled: pass `controlRef`; the parent drives an extra position
//   (`offset`, px, eased), a constant idle `drift` (px/s), the unravel
//   strength (0..1) and whether it renders at all (`active`).
//   Used by AboutIntro: always drifting, and scrolling pushes it further.
// ---------------------------------------------------------------------------

export interface UnwovenCarouselConfig {
  threads?: number; // ribbons per card
  segments?: number; // horizontal subdivisions per ribbon for flutter
  cardMaxHeight?: number; // px, clamped against container height
  cardHeightRatio?: number; // max card height as a fraction of container height
  cardAspect?: number; // width / height
  cardGapRatio?: number; // gap as a fraction of card width
  cardRadius?: number; // px corner radius
  scrollSpeed?: number; // autoplay px per second
  flingMax?: number; // autoplay: px per second cap after drag
  tearZoneRatio?: number; // fraction of width where unravelling starts
  tearZoneMax?: number; // max px for the tear zone
}

export interface UnwovenCarouselControl {
  offset: number; // extra strip position in px, e.g. from scroll (eased towards)
  drift: number; // constant idle movement in px per second
  strength: number; // unravel strength 0..1
  active: boolean; // false skips rendering entirely (e.g. while hidden)
}

export interface UnwovenCarouselProps {
  images?: string[];
  config?: UnwovenCarouselConfig;
  controlRef?: React.RefObject<UnwovenCarouselControl>;
  className?: string;
  style?: React.CSSProperties;
}

const DEFAULT_CONFIG: Required<UnwovenCarouselConfig> = {
  threads: 26,
  segments: 20,
  cardMaxHeight: 452,
  cardHeightRatio: 0.62,
  cardAspect: 0.75,
  cardGapRatio: 0.11,
  cardRadius: 20,
  scrollSpeed: 95,
  flingMax: 4200,
  tearZoneRatio: 0.26,
  tearZoneMax: 380,
};

// How quickly a controlled carousel catches up with its target offset
const CONTROLLED_EASE = 0.1;

const VERTEX_SHADER = /* glsl */ `
  attribute float aThread;   // ribbon index, 0 .. threads-1
  attribute float aRim;      // -1 at ribbon top edge, +1 at bottom

  uniform float uTime;
  uniform float uHalfWidth;  // half viewport width in px
  uniform float uZone;       // tear zone depth in px
  uniform float uStrength;   // master switch 0..1
  uniform float uWobble;     // 0 for reduced motion
  uniform float uSeed;       // per-card variation

  varying vec2  vUv;
  varying float vTear;
  varying float vRim;
  varying float vRandom;

  float hash(float n) {
    return fract(sin(n * 127.1 + 311.7) * 43758.5453);
  }

  void main() {
    vUv = uv;
    vRim = aRim;

    vec4 world = modelMatrix * vec4(position, 1.0);
    float x = world.x;

    float left  = 1.0 - smoothstep(-uHalfWidth, -uHalfWidth + uZone, x);
    float right = smoothstep(uHalfWidth - uZone, uHalfWidth, x);
    float tear  = max(left, right) * uStrength;

    float direction = x < 0.0 ? -1.0 : 1.0;

    float randomA = hash(aThread + uSeed * 57.0);
    float randomB = hash(aThread * 3.7 + uSeed * 91.0);
    vRandom = randomA;

    float t = pow(tear, 1.4);

    float run = t * (60.0 + randomA * 420.0);
    run *= 0.85 + 0.15 * sin(uTime * (1.0 + randomB * 2.0) + randomA * 6.2831);
    world.x += direction * run;

    world.y += (randomA - 0.5) * 170.0 * t * t;
    world.y += sin(world.x * 0.02 + uTime * (1.6 + randomA * 2.2) + randomA * 6.2831)
               * (5.0 + 13.0 * randomA) * t * uWobble;

    vTear = tear;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  precision highp float;

  uniform sampler2D uMap;
  uniform vec2  uCardSize;
  uniform float uRadius;
  uniform float uImageAspect;

  varying vec2  vUv;
  varying float vTear;
  varying float vRim;
  varying float vRandom;

  float sdRoundBox(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + r;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
  }

  void main() {
    float tear = vTear;
    float rim  = abs(vRim);

    float coreWidth = mix(0.8, 0.16 + vRandom * 0.12, smoothstep(0.0, 0.85, tear));
    float threadAlpha = 1.0 - smoothstep(coreWidth - 0.10, coreWidth + 0.06, rim);
    threadAlpha = mix(1.0, threadAlpha, smoothstep(0.03, 0.30, tear));

    vec2 p = (vUv - 0.5) * uCardSize;
    float cardAlpha = 1.0 - smoothstep(-1.5, 0.5, sdRoundBox(p, uCardSize * 0.5, uRadius));

    float fade  = 1.0 - smoothstep(0.75, 1.0, tear) * 0.65;
    float alpha = cardAlpha * threadAlpha * fade;
    if (alpha < 0.003) discard;

    float cardAspect = uCardSize.x / uCardSize.y;
    vec2 scale = cardAspect > uImageAspect
      ? vec2(1.0, uImageAspect / cardAspect)
      : vec2(cardAspect / uImageAspect, 1.0);
    vec3 color = texture2D(uMap, (vUv - 0.5) * scale + 0.5).rgb;

    color *= 1.0 - tear * 0.4 * rim * rim;
    color += tear * 0.18 * (1.0 - smoothstep(0.0, 0.45, rim));
    color = mix(color, vec3(1.0), smoothstep(0.55, 1.0, tear) * 0.8);

    gl_FragColor = vec4(color, alpha);
  }
`;

function buildRibbonGeometry(width: number, height: number, threads: number, segments: number) {
  const columns = segments + 1;
  const perThread = columns * 2;
  const total = threads * perThread;

  const positions = new Float32Array(total * 3);
  const uvs = new Float32Array(total * 2);
  const rims = new Float32Array(total);
  const threadIds = new Float32Array(total);
  const indices: number[] = [];

  let v = 0;
  for (let t = 0; t < threads; t++) {
    for (let row = 0; row < 2; row++) {
      const vy = (t + row) / threads;
      for (let c = 0; c < columns; c++) {
        const ux = c / segments;
        positions[v * 3 + 0] = (ux - 0.5) * width;
        positions[v * 3 + 1] = (vy - 0.5) * height;
        positions[v * 3 + 2] = 0;
        uvs[v * 2 + 0] = ux;
        uvs[v * 2 + 1] = vy;
        rims[v] = row === 0 ? -1 : 1;
        threadIds[v] = t;
        v++;
      }
    }

    const base = t * perThread;
    for (let c = 0; c < segments; c++) {
      const bl = base + c;
      const br = base + c + 1;
      const tl = base + columns + c;
      const tr = base + columns + c + 1;
      indices.push(bl, br, tl, br, tr, tl);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geometry.setAttribute('aRim', new THREE.BufferAttribute(rims, 1));
  geometry.setAttribute('aThread', new THREE.BufferAttribute(threadIds, 1));
  geometry.setIndex(indices);
  return geometry;
}

// Neutral dark placeholder shown until each photo has loaded
function drawPlaceholder(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 8;
  canvas.height = 8;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, 8, 8);
  }
  return canvas;
}

// Static row of images when WebGL is unavailable
function mountFallback(container: HTMLDivElement, images: string[]) {
  const row = document.createElement('div');
  row.style.cssText =
    'display:flex;gap:32px;align-items:center;justify-content:center;height:100%;overflow:hidden;';
  images.slice(0, 6).forEach((src) => {
    const img = document.createElement('img');
    img.src = src;
    img.alt = '';
    img.style.cssText =
      'width:240px;height:320px;object-fit:cover;border-radius:18px;flex:none;';
    row.appendChild(img);
  });
  container.appendChild(row);
  return () => row.remove();
}

export const UnwovenCarousel: React.FC<UnwovenCarouselProps> = ({
  images = [],
  config: userConfig,
  controlRef,
  className = '',
  style,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const controlled = controlRef !== undefined;
  const config = { ...DEFAULT_CONFIG, ...userConfig };
  const lite = usePerfLite();

  useEffect(() => {
    const container = containerRef.current;
    if (!container || images.length === 0) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Software-emulated WebGL would freeze the tab: use the static fallback
    // Lite mode (slow device) too: switching to lite re-runs this effect, so
    // the WebGL version is disposed and replaced by the static row
    if (lite || getGpuTier() === 'none') return mountFallback(container, images);
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isLowEndDevice(),
        alpha: true,
        failIfMajorPerformanceCaveat: true,
      });
    } catch {
      return mountFallback(container, images);
    }

    const dpr = window.devicePixelRatio || 1;
    const isMobile = window.innerWidth < 768;
    renderer.setPixelRatio(
      isLowEndDevice()
        ? 1
        : isMobile
          ? Math.min(dpr, 1.5)
          : Math.min(dpr, 2)
    );
    const domElement = renderer.domElement;
    const onContextLost = (e: Event) => {
      e.preventDefault();
      setLite('webgl-context-lost');
    };
    domElement.addEventListener('webglcontextlost', onContextLost);
    domElement.style.display = 'block';
    domElement.style.width = '100%';
    domElement.style.height = '100%';
    container.appendChild(domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -100, 100);

    const shared = {
      uTime: { value: 0 },
      uHalfWidth: { value: 1 },
      uZone: { value: 1 },
      uStrength: { value: 0 },
      uWobble: { value: reduceMotion ? 0 : 1 },
      uCardSize: { value: new THREE.Vector2(1, 1) },
      uRadius: { value: config.cardRadius },
    };

    const placeholder = drawPlaceholder();
    const slots = images.map((url, i) => {
      const texture = new THREE.Texture<HTMLCanvasElement | HTMLImageElement>(placeholder);
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.generateMipmaps = false;
      texture.needsUpdate = true;

      const material = new THREE.ShaderMaterial({
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
        transparent: true,
        depthTest: false,
        depthWrite: false,
        uniforms: {
          uMap: { value: texture },
          uSeed: { value: (i + 1) * 0.731 },
          uImageAspect: { value: 1 },
          uTime: shared.uTime,
          uHalfWidth: shared.uHalfWidth,
          uZone: shared.uZone,
          uStrength: shared.uStrength,
          uWobble: shared.uWobble,
          uCardSize: shared.uCardSize,
          uRadius: shared.uRadius,
        },
      });

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        texture.image = img;
        texture.needsUpdate = true;
        material.uniforms.uImageAspect.value = img.naturalWidth / img.naturalHeight;
      };
      img.src = url;

      return { texture, material };
    });

    const cards: Array<{ mesh: THREE.Mesh; baseX: number }> = [];
    let currentGeometry: THREE.BufferGeometry | null = null;
    let pitch = 0;
    let stripSpan = 0;

    function rebuildStrip(cardWidth: number, cardHeight: number, viewportWidth: number) {
      cards.forEach((card) => scene.remove(card.mesh));
      cards.length = 0;
      currentGeometry?.dispose();

      currentGeometry = buildRibbonGeometry(cardWidth, cardHeight, config.threads, config.segments);

      const count = Math.max(8, Math.ceil((viewportWidth + pitch * 3) / pitch));
      stripSpan = count * pitch;

      for (let i = 0; i < count; i++) {
        const mesh = new THREE.Mesh(currentGeometry, slots[i % slots.length].material);
        mesh.frustumCulled = false;
        scene.add(mesh);
        cards.push({ mesh, baseX: i * pitch });
      }
    }

    function handleResize() {
      const viewportWidth = container!.clientWidth;
      const viewportHeight = container!.clientHeight;
      if (viewportWidth === 0 || viewportHeight === 0) return;

      renderer.setSize(viewportWidth, viewportHeight, false);
      camera.left = -viewportWidth / 2;
      camera.right = viewportWidth / 2;
      camera.top = viewportHeight / 2;
      camera.bottom = -viewportHeight / 2;
      camera.updateProjectionMatrix();

      const cardHeight = Math.min(config.cardMaxHeight, viewportHeight * config.cardHeightRatio);
      const cardWidth = cardHeight * config.cardAspect;
      pitch = cardWidth + Math.max(24, cardWidth * config.cardGapRatio);

      shared.uHalfWidth.value = viewportWidth / 2;
      shared.uZone.value = Math.min(viewportWidth * config.tearZoneRatio, config.tearZoneMax);
      shared.uCardSize.value.set(cardWidth, cardHeight);

      rebuildStrip(cardWidth, cardHeight, viewportWidth);
    }

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);
    handleResize();

    let offset = controlRef?.current?.offset ?? 0;
    // Controlled mode: eased copy of control.offset + accumulated idle drift
    let controlledOffset = offset;
    let driftOffset = 0;
    const cleanups: Array<() => void> = [];

    // Autoplay mode: drift + drag/fling. Controlled mode skips all of this.
    const motion = { velocity: 0 };
    let dragging = false;
    if (!controlled) {
      const baseSpeed = reduceMotion ? 0 : config.scrollSpeed;
      gsap.to(motion, { velocity: baseSpeed, duration: 2.4, ease: 'power2.out', delay: 0.35 });
      gsap.to(shared.uStrength, { value: 1, duration: 1.8, ease: 'power3.inOut', delay: 0.2 });

      let lastX = 0;
      let lastTime = 0;
      let dragVelocity = 0;

      const onPointerDown = (event: PointerEvent) => {
        dragging = true;
        container.style.cursor = 'grabbing';
        lastX = event.clientX;
        lastTime = performance.now();
        dragVelocity = 0;
        try {
          container.setPointerCapture(event.pointerId);
        } catch {
          // Pointer capture unsupported
        }
        gsap.killTweensOf(motion);
      };
      const onPointerMove = (event: PointerEvent) => {
        if (!dragging) return;
        const now = performance.now();
        const dx = event.clientX - lastX;
        const dt = Math.max(1, now - lastTime) / 1000;
        offset -= dx;
        dragVelocity += (-dx / dt - dragVelocity) * 0.35;
        lastX = event.clientX;
        lastTime = now;
      };
      const endDrag = (event?: PointerEvent) => {
        if (!dragging) return;
        dragging = false;
        container.style.cursor = 'grab';
        if (event) {
          try {
            container.releasePointerCapture(event.pointerId);
          } catch {
            // Already released
          }
        }
        motion.velocity = gsap.utils.clamp(-config.flingMax, config.flingMax, dragVelocity);
        gsap.to(motion, { velocity: baseSpeed, duration: 2.2, ease: 'power3.out' });
      };

      container.addEventListener('pointerdown', onPointerDown);
      container.addEventListener('pointermove', onPointerMove);
      container.addEventListener('pointerup', endDrag);
      container.addEventListener('pointercancel', endDrag);
      container.addEventListener('lostpointercapture', endDrag);
      cleanups.push(() => {
        gsap.killTweensOf(motion);
        gsap.killTweensOf(shared.uStrength);
        container.removeEventListener('pointerdown', onPointerDown);
        container.removeEventListener('pointermove', onPointerMove);
        container.removeEventListener('pointerup', endDrag);
        container.removeEventListener('pointercancel', endDrag);
        container.removeEventListener('lostpointercapture', endDrag);
      });
    }

    const tick = (time: number, deltaMS: number) => {
      const control = controlRef?.current;
      if (control) {
        if (!control.active) return; // hidden: skip the GPU work
        controlledOffset += (control.offset - controlledOffset) * CONTROLLED_EASE;
        if (!reduceMotion) driftOffset += control.drift * (deltaMS / 1000);
        offset = controlledOffset + driftOffset;
        shared.uStrength.value = control.strength;
      } else if (!dragging) {
        offset += motion.velocity * (deltaMS / 1000);
      }
      shared.uTime.value = time;

      const half = stripSpan / 2;
      for (const card of cards) {
        const x = (((card.baseX - offset) % stripSpan) + stripSpan) % stripSpan;
        card.mesh.position.x = x - half;
      }
      renderer.render(scene, camera);
    };
    gsap.ticker.add(tick);

    return () => {
      resizeObserver.disconnect();
      gsap.ticker.remove(tick);
      cleanups.forEach((fn) => fn());
      cards.forEach((card) => scene.remove(card.mesh));
      currentGeometry?.dispose();
      slots.forEach((slot) => {
        slot.texture.dispose();
        slot.material.dispose();
      });
      domElement.removeEventListener('webglcontextlost', onContextLost);
      renderer.dispose();
      domElement.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- config is read once per mount
  }, [images, controlled, lite]);

  return (
    <div
      ref={containerRef}
      className={`unwoven-stage ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        cursor: controlled ? undefined : 'grab',
        touchAction: controlled ? undefined : 'none',
        ...style,
      }}
      aria-hidden="true"
    />
  );
};

export default UnwovenCarousel;
