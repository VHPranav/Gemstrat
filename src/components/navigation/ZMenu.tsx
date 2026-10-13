'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { createHeroObject, S_HEIGHT, S_PIECE_SHADES } from '@/lib/heroObject';
import { addZLights, applyZShade, createZMaterial, createZReflections, moveZGlints } from '@/lib/zLook';
import { getGpuTier } from '@/lib/device';
import { getPerfMode } from '@/lib/perf';
import { ZPieceGlyph } from '@/components/navigation/ZIcon';

// ---------------------------------------------------------------------------
// ZMenu
// The site menu is the logo. Opening it, the 3D Z flies out of the navbar
// button, trembles, and blasts apart: each of its five pieces lands beside
// one of the five links, in a cascade that follows the Z's diagonal, while a
// faint wireframe of the Z stays where it was. Hovering a link flips its
// piece and draws a guide line back to where it sits in the Z. Choosing a
// link (or closing) sends the pieces home, the Z shrinks back into the
// button, and the page moves to the section.
//
// The navbar mounts this early (on first hover/focus of the button) so the
// 3D is ready by the click; while closed it renders nothing and runs no loop.
// Without WebGL (or in lite mode) the pieces are flat SVG beside the links.
// ---------------------------------------------------------------------------

export interface ZMenuLink {
  label: string;
  href: string;
}

interface ZMenuProps {
  /** Up to five links, one per piece of the Z, top to bottom */
  links: ZMenuLink[];
  /** true plays the opening; false (after being open) plays the closing */
  open: boolean;
  /** Where to go once the menu has closed (null: just close) */
  target: string | null;
  /** The navbar button the Z comes out of and goes back into */
  trigger: HTMLElement | null;
  footer?: string;
  onSelect: (href: string) => void;
  onRequestClose: () => void;
  /** The closing has finished */
  onClosed: () => void;
}

// Which piece of the Z (index in S_PIECES) each row gets, top to bottom:
// top bar, upper stub, diagonal, lower stub, bottom bar — the order they sit
// in the Z, so they fly out without crossing
const ROW_PIECE = [0, 2, 3, 4, 1];

// Opening timeline (s)
const ARRIVE = 0.4; // the Z flies from the button to its spot
const BLAST_AT = 0.55; // after a short tremble, the pieces fly out
const FLY = 0.75; // each piece's flight
const FLY_STAGGER = 0.06;
const LABEL_DELAY = 0.4; // after its piece sets off, a link fades in
const LABEL_DUR = 0.5;
const GHOST_AT = 0.5; // the wireframe Z left behind
const FOOTER_AT = 1;
// Closing timeline (s)
const RETURN_AT = 0.08;
const RETURN = 0.5;
const RETURN_STAGGER = 0.04;
const SHRINK_AT = 0.62; // the Z shrinks back into the button, the page shows
const SHRINK = 0.3;
const CLOSE_END = SHRINK_AT + SHRINK + 0.03;

const GHOST_OPACITY = 0.16;
// Landed, each piece lights up into the flat logo's colours (white bars,
// grey diagonal); in flight it is the hero's dark glass
const LIT = { color: 0xe6e6e6, emissive: 0x6a6a6a, metalness: 0.55 };
const LIT_ACCENT = { color: 0x9a9ca0, emissive: 0x3a3b3e, metalness: 0.55 };
const SPIN = 2.6; // rad of tumble mid-flight
const TILT = 0.35; // rad the assembled Z is turned, to show its depth
const FOV = 30;
const CAMERA_Z = 12;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);
const easeInCubic = (t: number) => t * t * t;
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
/** `from` → `to` over `dur` after `delay`, eased */
const channel = (from: number, to: number, t: number, delay: number, dur: number, ease = easeInOutCubic) =>
  from + (to - from) * ease(clamp01((t - delay) / dur));

/** Where everything goes, in px */
function layout(W: number, H: number) {
  const mobile = W < 768;
  const rowH = mobile ? 62 : Math.min(H * 0.12, 104);
  const box = mobile ? { w: 44, h: 30 } : { w: 72, h: 48 };
  const top = mobile ? Math.max(120, H * 0.17) : H / 2 - 2 * rowH;
  const left = mobile ? 20 : Math.max(32, W * 0.08);
  const stagger = mobile ? 10 : Math.min(W * 0.022, 34); // the cascade follows the Z's diagonal
  const zHeight = mobile ? Math.min(H * 0.2, 170) : Math.min(H * 0.56, 460);
  return {
    box,
    rows: [0, 1, 2, 3, 4].map((i) => ({ left: left + i * stagger, y: top + i * rowH })),
    z: mobile ? { x: W * 0.74, y: H - 30 - zHeight / 2 - 40, h: zHeight } : { x: W * 0.72, y: H * 0.52, h: zHeight },
  };
}

export default function ZMenu({ links, open, target, trigger, footer, onSelect, onRequestClose, onClosed }: ZMenuProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const canvasWrapRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLParagraphElement>(null);
  const rowRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const glyphRefs = useRef<(HTMLSpanElement | null)[]>([]);
  // Hovered row (-1: none), and the turn each piece flips toward
  const hoverRef = useRef(-1);
  const turnRef = useRef([0, 0, 0, 0, 0]);
  // The latest props, for the animation loop
  const propsRef = useRef({ open, target, trigger, onClosed });
  useEffect(() => {
    propsRef.current = { open, target, trigger, onClosed };
  });
  // Set by the effect: starts the opening or the closing
  const phaseRef = useRef<((open: boolean) => void) | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    const backdrop = backdropRef.current;
    const canvasWrap = canvasWrapRef.current;
    if (!root || !backdrop || !canvasWrap) return;
    const rootEl = root;
    const backdropEl = backdrop;
    const html = document.documentElement;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timeScale = reduceMotion ? 5 : 1;
    const use3d = getGpuTier() !== 'none' && getPerfMode() !== 'lite';
    let W = window.innerWidth;
    let H = window.innerHeight;
    let L = layout(W, H);

    // --- Channels: every animated value, 0-1 ---------------------------------
    const v = { backdrop: 0, arrive: 0, ghost: 0, footer: 0, u: [0, 0, 0, 0, 0], label: [0, 0, 0, 0, 0] };
    let from = structuredClone(v);
    let phase: 'closed' | 'open' | 'closing' = 'closed';
    let phaseStart = 0;
    let navigated = false;
    // Smoothed hover, per row and overall
    const hoverAmt = [0, 0, 0, 0, 0];
    const turn = [0, 0, 0, 0, 0];
    let hoverMix = 0;
    const lean = { x: 0, y: 0, tx: 0, ty: 0 };

    // --- 3D -------------------------------------------------------------------
    let render: ((t: number, dt: number) => void) | null = null;
    let resize3d: (() => void) | null = null;
    let dispose3d: (() => void) | null = null;

    if (use3d) {
      const r = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
      const pixelRatio = () => Math.min(window.devicePixelRatio || 1, W < 768 ? 1.25 : 1.5);
      r.setPixelRatio(pixelRatio());
      r.setSize(W, H);
      r.setClearColor(0x000000, 0);
      r.toneMapping = THREE.ACESFilmicToneMapping;
      r.toneMappingExposure = 1.1;
      r.domElement.className = 'absolute inset-0 w-full h-full';
      canvasWrap.appendChild(r.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(FOV, W / H, 0.1, 200);
      camera.position.set(0, 0, CAMERA_Z);
      const glints = addZLights(scene);
      const reflections = createZReflections(scene);
      const material = createZMaterial(reflections.texture);

      // World units per px at the logo's depth
      let wpp = (2 * CAMERA_Z * Math.tan(THREE.MathUtils.degToRad(FOV / 2))) / H;
      const toWorld = (x: number, y: number, out: THREE.Vector3) => out.set((x - W / 2) * wpp, -(y - H / 2) * wpp, 0);

      // The pieces, each centred on itself so it can tumble in place
      const pieces = createHeroObject().parts.map((geo, part) => {
        geo.computeBoundingBox();
        const home = new THREE.Vector3();
        const size = new THREE.Vector3();
        geo.boundingBox!.getCenter(home);
        geo.boundingBox!.getSize(size);
        geo.translate(-home.x, -home.y, -home.z);
        const mat = material.clone();
        applyZShade(mat, part);
        const lit = S_PIECE_SHADES[part].toLowerCase() === '#ffffff' ? LIT : LIT_ACCENT;
        const mesh = new THREE.Mesh(geo, mat);
        scene.add(mesh);
        return {
          mesh,
          home,
          size,
          edges: new THREE.EdgesGeometry(geo, 8),
          dark: { color: mat.color.clone(), emissive: mat.emissive.clone(), metalness: mat.metalness },
          lit: { color: new THREE.Color(lit.color), emissive: new THREE.Color(lit.emissive), metalness: lit.metalness },
        };
      });

      // The wireframe Z left behind; the hovered link's piece lights up in it
      const ghost = new THREE.Group();
      const ghostMats = pieces.map(({ edges, home }) => {
        const m = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 });
        const lines = new THREE.LineSegments(edges, m);
        lines.position.copy(home);
        ghost.add(lines);
        return m;
      });
      scene.add(ghost);

      // A construction guide from the hovered piece back to its place in the Z
      const guideGeo = new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3));
      const guideMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 });
      const guide = new THREE.Line(guideGeo, guideMat);
      scene.add(guide);

      // Tumble axes, one per piece
      const axes = pieces.map(() => new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize());

      // Reflections once, with the logo out of the way; and the shaders
      // compiled now rather than on the frame the menu opens
      pieces.forEach((p) => (p.mesh.visible = false));
      reflections.update(r);
      pieces.forEach((p) => (p.mesh.visible = true));
      r.compile(scene, camera);

      const zPos = new THREE.Vector3();
      const spot = new THREE.Vector3();
      const start = new THREE.Vector3();
      const posA = new THREE.Vector3();
      const posB = new THREE.Vector3();
      const qZ = new THREE.Quaternion();
      const qB = new THREE.Quaternion();
      const qSpin = new THREE.Quaternion();
      const euler = new THREE.Euler();
      const tmp = new THREE.Vector3();

      render = (t) => {
        moveZGlints(glints, t);

        // The assembled Z: from the button to its spot, turning to show depth
        const rect = propsRef.current.trigger?.getBoundingClientRect();
        const startPx = rect ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, h: rect.height * 0.45 } : { x: W - 40, y: 40, h: 18 };
        toWorld(startPx.x, startPx.y, start);
        toWorld(L.z.x, L.z.y, spot);
        const a = v.arrive;
        zPos.lerpVectors(start, spot, a);
        const zScale = ((startPx.h + (L.z.h - startPx.h) * a) * wpp) / S_HEIGHT;
        // A tremble just before the blast
        const charge = phase === 'open' && !reduceMotion ? clamp01((t - phaseStart - ARRIVE + 0.1) / 0.15) * (1 - clamp01((t - phaseStart - BLAST_AT) / 0.1)) : 0;
        if (charge > 0) {
          zPos.x += 0.025 * charge * Math.sin(t * 90);
          zPos.y += 0.025 * charge * Math.cos(t * 77);
        }
        qZ.setFromEuler(euler.set(lean.x * a, (TILT + lean.y) * a, 0));

        // The wireframe stays on the spot, at full size
        ghost.position.copy(spot);
        ghost.quaternion.setFromEuler(euler.set(lean.x, TILT + lean.y, 0));
        ghost.scale.setScalar((L.z.h * wpp) / S_HEIGHT);
        ghost.visible = v.ghost > 0.001;

        let guideOn = false;
        pieces.forEach((p, part) => {
          const row = ROW_PIECE.indexOf(part);
          const u = v.u[row];
          // Assembled: its place in the Z
          posA.copy(p.home).applyQuaternion(qZ).multiplyScalar(zScale).add(zPos);
          // Landed: beside its link, fitted to the box, idling
          const slot = L.rows[row];
          toWorld(slot.left + L.box.w / 2, slot.y + 2 * Math.sin(t * 1.1 + row), posB);
          const fit = Math.min(L.box.w / p.size.x, L.box.h / p.size.y) * wpp * (1 + 0.14 * hoverAmt[row]);
          qB.setFromEuler(euler.set(0.12 * Math.sin(t * 0.5 + row * 1.3), 0.3 * Math.sin(t * 0.6 + row) + turn[row], 0));

          p.mesh.position.lerpVectors(posA, posB, u);
          p.mesh.position.z += Math.sin(Math.PI * u) * (reduceMotion ? 0 : 1.6); // toward the camera mid-flight
          p.mesh.scale.setScalar(zScale + (fit - zScale) * u);
          p.mesh.quaternion.slerpQuaternions(qZ, qB, u);
          if (!reduceMotion) p.mesh.quaternion.multiply(qSpin.setFromAxisAngle(axes[part], Math.sin(Math.PI * u) * SPIN));

          // Fades in leaving the button and out going back into it; the
          // other pieces dim while one is hovered
          const present = clamp01(a / 0.12);
          const dim = 1 - 0.6 * hoverMix * (1 - hoverAmt[row]);
          p.mesh.material.opacity = 0.88 * present * dim;
          // Lights up as it lands (and dims again leaving)
          const glow = easeInCubic(u);
          p.mesh.material.color.lerpColors(p.dark.color, p.lit.color, glow);
          p.mesh.material.emissive.lerpColors(p.dark.emissive, p.lit.emissive, glow);
          p.mesh.material.metalness = p.dark.metalness + (p.lit.metalness - p.dark.metalness) * glow;
          p.mesh.visible = present > 0.002;

          ghostMats[part].opacity = v.ghost * (GHOST_OPACITY + 0.55 * hoverAmt[row]);

          // The guide back to its place in the Z
          if (hoverAmt[row] > 0.01 && u > 0.5) {
            guideOn = true;
            const g = guideGeo.attributes.position as THREE.BufferAttribute;
            g.setXYZ(0, p.mesh.position.x, p.mesh.position.y, 0);
            tmp.copy(p.home).applyQuaternion(ghost.quaternion).multiplyScalar(ghost.scale.x).add(ghost.position);
            g.setXYZ(1, tmp.x, tmp.y, 0);
            g.needsUpdate = true;
            guideMat.opacity = 0.3 * hoverAmt[row] * v.label[row];
          }
        });
        guide.visible = guideOn;

        r.render(scene, camera);
      };

      resize3d = () => {
        r.setPixelRatio(pixelRatio());
        r.setSize(W, H);
        camera.aspect = W / H;
        camera.updateProjectionMatrix();
        wpp = (2 * CAMERA_Z * Math.tan(THREE.MathUtils.degToRad(FOV / 2))) / H;
      };

      dispose3d = () => {
        scene.traverse((obj) => {
          if (obj instanceof THREE.Mesh || obj instanceof THREE.Line) {
            obj.geometry.dispose();
            (Array.isArray(obj.material) ? obj.material : [obj.material]).forEach((m: THREE.Material) => m.dispose());
          }
        });
        pieces.forEach((p) => p.edges.dispose());
        material.dispose();
        reflections.dispose();
        r.dispose();
        r.domElement.remove();
      };
    }

    // --- Layout -----------------------------------------------------------------
    const place = () => {
      rowRefs.current.forEach((row, i) => {
        if (!row) return;
        row.style.left = `${L.rows[i].left}px`;
        row.style.top = `${L.rows[i].y}px`;
      });
      glyphRefs.current.forEach((g) => {
        if (!g) return;
        g.style.width = `${L.box.w}px`;
        g.style.height = `${L.box.h}px`;
      });
    };
    place();

    // --- Frame ------------------------------------------------------------------
    let raf = 0;
    let last = performance.now();
    let time = 0;
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      time += dt;
      const t = (time - phaseStart) * timeScale;
      const ease = (k: number) => 1 - Math.pow(1 - k, dt * 60);

      if (phase === 'open') {
        v.backdrop = channel(from.backdrop, 1, t, 0, 0.35, easeOutCubic);
        v.arrive = channel(from.arrive, 1, t, 0, ARRIVE, easeOutCubic);
        v.ghost = channel(from.ghost, 1, t, GHOST_AT, 0.35);
        v.footer = channel(from.footer, 1, t, FOOTER_AT, 0.5);
        for (let i = 0; i < 5; i++) {
          const d = BLAST_AT + i * FLY_STAGGER;
          v.u[i] = channel(from.u[i], 1, t, d, FLY, easeOutQuart);
          v.label[i] = channel(from.label[i], 1, t, d + LABEL_DELAY, LABEL_DUR, easeOutCubic);
        }
      } else if (phase === 'closing') {
        v.footer = channel(from.footer, 0, t, 0, 0.2);
        v.ghost = channel(from.ghost, 0, t, 0.35, 0.25);
        v.arrive = channel(from.arrive, 0, t, SHRINK_AT, SHRINK, easeInCubic);
        v.backdrop = channel(from.backdrop, 0, t, SHRINK_AT, SHRINK);
        for (let i = 0; i < 5; i++) {
          v.label[i] = channel(from.label[i], 0, t, 0, 0.18);
          v.u[i] = channel(from.u[i], 0, t, RETURN_AT + (4 - i) * RETURN_STAGGER, RETURN);
        }
        // The page shows again as the Z heads home: unlock it and go
        if (t >= SHRINK_AT && !navigated) {
          navigated = true;
          html.classList.remove('menu-open');
          const href = propsRef.current.target;
          if (href) document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
        }
        if (t >= CLOSE_END) {
          setClosed();
          propsRef.current.onClosed();
          return;
        }
      }

      // Hover: eased per row, and a full flip of the piece on each new hover
      const hovered = phase === 'open' ? hoverRef.current : -1;
      for (let i = 0; i < 5; i++) {
        hoverAmt[i] += ((hovered === i ? 1 : 0) - hoverAmt[i]) * ease(0.14);
        turn[i] += (turnRef.current[i] - turn[i]) * ease(0.07);
      }
      hoverMix += ((hovered >= 0 ? 1 : 0) - hoverMix) * ease(0.12);
      lean.x += (lean.tx - lean.x) * ease(0.05);
      lean.y += (lean.ty - lean.y) * ease(0.05);

      // The HTML
      backdropEl.style.opacity = String(v.backdrop);
      if (footerRef.current) footerRef.current.style.opacity = String(v.footer);
      rowRefs.current.forEach((row, i) => {
        if (!row) return;
        const k = v.label[i];
        const dim = 1 - 0.65 * hoverMix * (1 - hoverAmt[i]);
        row.style.opacity = String(k * dim);
        row.style.transform = `translate3d(${((1 - k) * -24).toFixed(1)}px, -50%, 0)`;
        row.style.filter = k < 0.999 ? `blur(${((1 - k) * 8).toFixed(2)}px)` : '';
        row.style.pointerEvents = k > 0.5 && phase === 'open' ? 'auto' : 'none';
      });
      if (!use3d) glyphRefs.current.forEach((g, i) => g && (g.style.opacity = String(v.label[i])));

      render?.(time, dt);
    };

    const setClosed = () => {
      phase = 'closed';
      cancelAnimationFrame(raf);
      raf = 0;
      rootEl.style.visibility = 'hidden';
      html.classList.remove('menu-open');
    };
    rootEl.style.visibility = 'hidden';

    phaseRef.current = (toOpen) => {
      if (toOpen ? phase === 'open' : phase !== 'open') return;
      from = structuredClone(v);
      phaseStart = time;
      navigated = false;
      if (toOpen) {
        phase = 'open';
        rootEl.style.visibility = 'visible';
        html.classList.add('menu-open');
        hoverRef.current = -1;
      } else phase = 'closing';
      if (!raf) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };
    // Already asked to open (the button was clicked before this mounted)
    if (propsRef.current.open) phaseRef.current(true);

    const onPointerMove = (e: PointerEvent) => {
      lean.ty = ((e.clientX / W) * 2 - 1) * 0.25;
      lean.tx = ((e.clientY / H) * 2 - 1) * 0.12;
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });

    let resizeRaf = 0;
    const onResize = () => {
      cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(() => {
        W = window.innerWidth;
        H = window.innerHeight;
        L = layout(W, H);
        resize3d?.();
        place();
      });
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(resizeRaf);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('resize', onResize);
      html.classList.remove('menu-open');
      phaseRef.current = null;
      dispose3d?.();
    };
  }, []);

  // Open / close as the navbar asks
  useEffect(() => {
    phaseRef.current?.(open);
  }, [open]);

  const hover = (i: number) => {
    if (hoverRef.current !== i) turnRef.current[i] += Math.PI * 2;
    hoverRef.current = i;
  };
  const unhover = (i: number) => {
    if (hoverRef.current === i) hoverRef.current = -1;
  };

  return (
    <div
      ref={rootRef}
      id="site-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Site menu"
      aria-hidden={!open}
      data-lenis-prevent
      className="fixed inset-0 pointer-events-auto text-white"
      style={{ visibility: 'hidden' }}
    >
      <div ref={backdropRef} className="absolute inset-0 bg-[#090909]" style={{ opacity: 0 }} onClick={onRequestClose} />
      <div ref={canvasWrapRef} className="absolute inset-0 pointer-events-none" />

      <nav aria-label="Site">
        {links.slice(0, 5).map((link, i) => (
          <a
            key={link.href}
            ref={(el) => {
              rowRefs.current[i] = el;
            }}
            href={link.href}
            tabIndex={open ? 0 : -1}
            onClick={(e) => {
              e.preventDefault();
              onSelect(link.href);
            }}
            onPointerEnter={() => hover(i)}
            onPointerLeave={() => unhover(i)}
            onFocus={() => hover(i)}
            onBlur={() => unhover(i)}
            className="absolute flex items-center gap-4 sm:gap-7 pr-6 py-2 opacity-0"
          >
            {/* The piece sits here: the 3D one, or this flat one without WebGL */}
            <span
              ref={(el) => {
                glyphRefs.current[i] = el;
              }}
              className="flex items-center justify-center shrink-0 opacity-0"
            >
              <ZPieceGlyph part={ROW_PIECE[i]} className="w-full h-full" />
            </span>
            <span className="text-[2.2rem] md:text-[clamp(2.4rem,4.6vw,4.4rem)] leading-none tracking-[-0.035em] whitespace-nowrap">
              {link.label}
              <sup className="ml-2 text-[10px] md:text-xs tracking-[0.12em] text-white/40 align-super tabular-nums">
                {String(i + 1).padStart(2, '0')}
              </sup>
            </span>
          </a>
        ))}
      </nav>

      {footer && (
        <p
          ref={footerRef}
          className="absolute left-5 sm:left-6 lg:left-8 bottom-6 sm:bottom-8 m-0 text-[11px] sm:text-xs uppercase tracking-[0.14em] text-white/45"
          style={{ opacity: 0 }}
        >
          {footer}
        </p>
      )}
    </div>
  );
}
