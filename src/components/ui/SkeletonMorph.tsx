'use client';

import { useEffect } from 'react';
import * as THREE from 'three';
import { createHeroObject, S_HEIGHT } from '@/lib/heroObject';
import { addZLights, applyZShade, createZMaterial, createZReflections } from '@/lib/zLook';
import { zSpot, heroZFraming, HERO_Z_SCALE, Z_CAMERA, Z_FOV, Z_GHOST_OPACITY, Z_TILT } from '@/lib/zSpot';
import { HANDOFF_DONE, HANDOFF_TARGET, isHandoffPending, type HandoffTarget } from '@/lib/handoff';
import { blueprintGuides, guideHandoff, type BlueprintData } from '@/lib/blueprintGuides';

// ---------------------------------------------------------------------------
// SkeletonMorph
// The Approach hero's wireframe S (the menu's, in the same place and size:
// lib/zSpot), drawn as flat lines on a fixed full-window canvas so its lines
// can move on their own. On scroll the S becomes the blueprint's grid:
//
//   TURN    it turns to face you, flat like a technical drawing; its minor
//           edges fade, and 13 of its own lines stay: one for each of the
//           blueprint's construction lines (6 across, 7 down)
//   EXTEND  those lines run out from both ends, like a draftsman's ruler,
//           until they span the grid; the rest of the S fades inside it
//   SETTLE  each slides parallel into its place on the grid (across ones
//           only up or down, upright ones only sideways; in order, so none
//           cross), where the blueprint will be pinned
//   L       the blueprint pins under them; its own lines, drawn the same,
//           take over with no visible change
//
// L is where the "How we work" section reaches the top. Everything follows
// the (softened) scroll, so scrolling back runs it in reverse.
// ---------------------------------------------------------------------------

// Scroll, in screens
const TURN_END = 0.35;
const EXTEND_AT = 0.25;
const EXTEND = 0.4; // each line's run-out
const SETTLE_AT = 0.7;
const SETTLE_DONE = 0.12; // the last line settles this long before the pin
const STAGGER = 0.12; // first to last line, within a stage
const MINOR_FADE: [number, number] = [0.05, 0.3]; // the S's other edges
const OUTLINE_FADE: [number, number] = [0.45, 0.8]; // the S inside the grid
const HANDOVER = 0.06; // once pinned, the blueprint's own lines fade in under them

const GUIDE_OPACITY = 0.32; // the blueprint's construction lines
// Canvas lines at the menu's look: its WebGL lines are tone-mapped (ACES at
// 1.1), which takes white to about 0.85
const WHITE = 0.85;
const GHOST = Z_GHOST_OPACITY * WHITE;

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
// Gentle in and out (sine): no sudden pull at the start or snap at the end
const ease = (t: number) => -(Math.cos(Math.PI * clamp01(t)) - 1) / 2;
const span = (s: number, [a, b]: [number, number]) => clamp01((s - a) / (b - a));

interface Edge {
  a: THREE.Vector3; // in the S's own space
  b: THREE.Vector3;
}

interface Line {
  edge: number; // which of the S's edges it starts as
  guide: number; // which construction line it becomes
  horizontal: boolean;
  order: number; // 0 → 1, for the stagger
}

export default function SkeletonMorph({ data, heroOnly = false, centerOnScroll = false }: { data: BlueprintData; heroOnly?: boolean; centerOnScroll?: boolean }) {
  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    Object.assign(canvas.style, { position: 'fixed', left: '0', top: '0', pointerEvents: 'none', zIndex: '0' });
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d')!;
    guideHandoff.active = !heroOnly;
    guideHandoff.reveal = 0;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const guides = blueprintGuides(data);

    // --- The S's edges, as in the menu (the hero's Z, half a turn round) ----
    const edges: Edge[] = [];
    createHeroObject().parts.forEach((geo) => {
      geo.rotateY(Math.PI);
      const e = new THREE.EdgesGeometry(geo, 8);
      const pos = e.getAttribute('position');
      for (let i = 0; i < pos.count; i += 2) {
        edges.push({ a: new THREE.Vector3().fromBufferAttribute(pos, i), b: new THREE.Vector3().fromBufferAttribute(pos, i + 1) });
      }
      e.dispose();
      geo.dispose();
    });

    // --- Camera and placement, as the menu's ------------------------------
    const camera = new THREE.PerspectiveCamera(Z_FOV, 1, 0.1, 200);
    camera.position.set(0, 0, Z_CAMERA);
    camera.updateMatrixWorld();
    const ghost = new THREE.Object3D();
    const heroPosition = new THREE.Vector3();
    let W = 0;
    let H = 0;
    let dpr = 1;
    let heroScale = 1;
    let centeredScale = 1;
    let lines: Line[] = [];
    const glassScene = new THREE.Scene();
    const glassRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    glassRenderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    glassRenderer.setSize(W, H);
    glassRenderer.setClearColor(0x000000, 0);
    glassRenderer.toneMapping = THREE.ACESFilmicToneMapping;
    glassRenderer.toneMappingExposure = 1.1;
    Object.assign(glassRenderer.domElement.style, { position: 'fixed', left: '0', top: '0', width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: '0' });
    document.body.appendChild(glassRenderer.domElement);
    const glassGlints = addZLights(glassScene);
    if (heroOnly && centerOnScroll) glassGlints.forEach((light) => { light.intensity = 0; });
    const reflections = createZReflections(glassScene);
    const glassMaterial = createZMaterial(reflections.texture);
    const glassGroup = new THREE.Group();
    const glassGeometries: THREE.BufferGeometry[] = [];
    const glassMaterials: THREE.MeshPhysicalMaterial[] = [];
    createHeroObject().parts.forEach((geometry, part) => {
      const material = glassMaterial.clone();
      applyZShade(material, part);
      if (heroOnly && centerOnScroll) {
        // Hide rear edges showing through the Purpose page's solid logo.
        material.transmission = 0;
        material.opacity = 1;
        material.transparent = false;
      }
      glassMaterials.push(material);
      glassGeometries.push(geometry);
      glassGroup.add(new THREE.Mesh(geometry, material));
    });
    glassScene.add(glassGroup);
    glassGroup.visible = false;
    reflections.update(glassRenderer);
    glassGroup.visible = true;
    const v = new THREE.Vector3();
    const project = (p: THREE.Vector3, out: [number, number]) => {
      v.copy(p).applyMatrix4(ghost.matrixWorld).project(camera);
      out[0] = (v.x * 0.5 + 0.5) * W;
      out[1] = (-v.y * 0.5 + 0.5) * H;
    };

    // --- The 13 lines: the S's own, face on --------------------------------
    // The longest distinct horizontals and verticals of the face-on S,
    // matched in order to the construction lines (top to bottom, left to
    // right), so they slide into place without crossing.
    const choose = () => {
      ghost.rotation.set(0, 0, 0);
      ghost.updateMatrixWorld(true);
      const pa: [number, number] = [0, 0];
      const pb: [number, number] = [0, 0];
      const cands = edges.map((e, i) => {
        project(e.a, pa);
        project(e.b, pb);
        const dx = Math.abs(pb[0] - pa[0]);
        const dy = Math.abs(pb[1] - pa[1]);
        return { i, dx, dy, x: (pa[0] + pb[0]) / 2, y: (pa[1] + pb[1]) / 2, len: Math.hypot(dx, dy) };
      });
      const pick = (horizontal: boolean, n: number) => {
        const pool = cands
          .filter((c) => (horizontal ? c.dy < c.dx * 0.15 : c.dx < c.dy * 0.15) && c.len > 2)
          .sort((p, q) => q.len - p.len);
        const out: typeof pool = [];
        for (const minGap of [4, 1.5, 0]) {
          for (const c of pool) {
            if (out.length >= n) break;
            if (out.includes(c)) continue;
            if (out.every((o) => Math.abs(horizontal ? o.y - c.y : o.x - c.x) > minGap)) out.push(c);
          }
        }
        return out.sort((p, q) => (horizontal ? p.y - q.y : p.x - q.x));
      };
      const gh = guides
        .map((g, gi) => ({ g, gi }))
        .filter(({ g }) => g.horizontal)
        .sort((p, q) => p.g.y1 - q.g.y1);
      const gv = guides
        .map((g, gi) => ({ g, gi }))
        .filter(({ g }) => !g.horizontal)
        .sort((p, q) => p.g.x1 - q.g.x1);
      const hs = pick(true, gh.length);
      const vs = pick(false, gv.length);
      lines = [
        ...hs.map((c, k) => ({ edge: c.i, guide: gh[k].gi, horizontal: true, order: 0 })),
        ...vs.map((c, k) => ({ edge: c.i, guide: gv[k].gi, horizontal: false, order: 0 })),
      ];
      lines.forEach((l, k) => (l.order = k / Math.max(1, lines.length - 1)));
    };

    const resize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
      camera.updateMatrixWorld();
      glassRenderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, W < 768 ? 1 : 1.5));
      glassRenderer.setSize(W, H);
      const wpp = (2 * Z_CAMERA * Math.tan(THREE.MathUtils.degToRad(Z_FOV / 2))) / H;
      const spot = zSpot(W, H);
      ghost.position.set((spot.x - W / 2) * wpp, -(spot.y - H / 2) * wpp, 0);
      heroPosition.copy(ghost.position);
      heroScale = (spot.h * wpp) / S_HEIGHT;
      const home = heroZFraming(W);
      centeredScale = HERO_Z_SCALE * home.scale *
        (Z_CAMERA * Math.tan(THREE.MathUtils.degToRad(Z_FOV / 2))) /
        (home.z * Math.tan(THREE.MathUtils.degToRad(home.fov / 2)));
      ghost.scale.setScalar(heroScale);
      choose();
    };
    window.addEventListener('resize', resize);

    // --- Opened from the menu: its S is already here ------------------------
    const handoff = isHandoffPending();
    const start = performance.now();
    let shownAt = handoff ? -1 : 0;
    resize();
    if (handoff) window.dispatchEvent(new CustomEvent<HandoffTarget>(HANDOFF_TARGET, { detail: zSpot(W, H) }));
    const onDone = () => {
      if (shownAt < 0) shownAt = (performance.now() - start) / 1000;
    };
    window.addEventListener(HANDOFF_DONE, onDone);

    // Lean towards the pointer, as in the menu
    const lean = { x: 0, y: 0, tx: 0, ty: 0 };
    const onPointer = (e: PointerEvent) => {
      if (heroOnly && centerOnScroll) return;
      lean.ty = ((e.clientX / window.innerWidth) * 2 - 1) * 0.25;
      lean.tx = ((e.clientY / window.innerHeight) * 2 - 1) * 0.12;
    };
    window.addEventListener('pointermove', onPointer, { passive: true });

    const pa: [number, number] = [0, 0];
    const pb: [number, number] = [0, 0];
    const stroke = (x1: number, y1: number, x2: number, y2: number, alpha: number) => {
      if (alpha <= 0.002) return;
      ctx.strokeStyle = `rgba(255,255,255,${alpha.toFixed(3)})`;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    };
    let raf = 0;
    let last = performance.now();
    let centerSpin = 0;
    let heroTextReady = false;
    let cleared = false;
    let sSmooth = window.scrollY / window.innerHeight;
    let sVel = 0;

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const t = (now - start) / 1000;

      // Where it lands: when the next section reaches the top
      const section = document.getElementById('how-we-work');
      const land = section ? section.offsetTop / H : 1.6;

      // The scroll, softened by a critically damped spring, so the lines
      // glide rather than step with each scroll tick
      const target = heroOnly ? 0 : window.scrollY / H;
      let centerProgress = 0;
      if (centerOnScroll) {
        const hero = document.querySelector<HTMLElement>('main > header');
        const heroBottom = hero?.getBoundingClientRect().bottom ?? H * 2;
        const enterAt = window.scrollY + heroBottom - H;
        const progress = (window.scrollY - enterAt) / H;
        centerProgress = clamp01(progress / 0.55);
        const move = ease(centerProgress);
        ghost.position.set(heroPosition.x * (1 - move), heroPosition.y * (1 - move), heroPosition.z);
        ghost.scale.setScalar(heroScale + (centeredScale - heroScale) * move);
        canvas.style.opacity = '1';
      } else if (heroOnly) {
        canvas.style.opacity = String(Math.max(0, 1 - window.scrollY / H / 0.6));
      }
      if (reduced || Math.abs(target - sSmooth) > 1.5) {
        sSmooth = target;
        sVel = 0;
      } else {
        const k = 90;
        sVel += ((target - sSmooth) * k - sVel * 2 * Math.sqrt(k)) * dt;
        sSmooth += sVel * dt;
      }
      const s = heroOnly ? 0 : sSmooth;

      const reveal = clamp01((s - land) / HANDOVER);
      guideHandoff.reveal = reveal;
      if (reveal >= 1) {
        if (!cleared) {
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          cleared = true;
        }
        return;
      }
      cleared = false;

      const k = 1 - Math.pow(1 - 0.05, dt * 60);
      lean.x += (lean.tx - lean.x) * k;
      lean.y += (lean.ty - lean.y) * k;
      const appear = shownAt < 0 ? 0 : Math.min(1, (t - shownAt) / (handoff ? 0.45 : 0.6));

      // TURN: to face on (and it stops leaning)
      const turn = reduced ? 1 : ease(s / TURN_END);
      if (heroOnly && centerOnScroll) {
        // Wait for the hero's text entrance, including any menu handoff pause.
        if (!heroTextReady && shownAt >= 0) {
          const hero = document.querySelector('main > header');
          heroTextReady = !!hero && Array.from(hero.querySelectorAll('.sub-word, .sub-fade'))
            .every((element) => element.getAnimations().every((animation) => animation.playState === 'finished'));
        }
        if (!reduced && heroTextReady) centerSpin += dt * 60 * 0.0042;
        const arrivalTurn = 0.4 * ease(centerProgress);
        ghost.rotation.set(0, arrivalTurn + centerSpin, 0);
      } else {
        ghost.rotation.set(lean.x * (1 - turn), (Z_TILT + lean.y) * (1 - turn), 0);
      }
      ghost.updateMatrixWorld(true);
      glassGroup.position.copy(ghost.position);
      glassGroup.rotation.copy(ghost.rotation);
      glassGroup.scale.copy(ghost.scale);
      if (heroOnly && centerOnScroll) glassGroup.scale.x *= -1;
      glassRenderer.render(glassScene, camera);

      // The purpose page uses the homepage's solid glass Z without the
      // construction wireframe drawn by the canvas layer.
      if (heroOnly && centerOnScroll) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }

      // Where the blueprint will be once pinned (until then it scrolls up
      // 1:1), so everything settles where it will stay
      const rect = document.querySelector<HTMLElement>('[data-blueprint-box]')?.getBoundingClientRect();
      const toPin = Math.max(0, land * H - window.scrollY);
      const box = rect
        ? { left: rect.left, top: rect.top - toPin, width: rect.width, height: rect.height }
        : { left: W * 0.05, top: H * 0.15, width: W * 0.6, height: H * 0.6 };
      const gx = (x: number) => box.left + (x / data.w) * box.width;
      const gy = (y: number) => box.top + (y / data.h) * box.height;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.lineWidth = 1;
      ctx.lineCap = 'round';

      // The rest of the S: minor edges fade as it turns; its outline lingers
      // inside the growing grid, then fades too
      const chosen = new Set(lines.map((l) => l.edge));
      const minor = reduced ? 0 : 1 - span(s, MINOR_FADE);
      const outline = reduced ? 0 : 1 - span(s, OUTLINE_FADE);
      edges.forEach((e, i) => {
        if (chosen.has(i)) return;
        const long = e.a.distanceTo(e.b) > 0.3;
        const alpha = GHOST * appear * (long ? outline : minor) * (1 - reveal);
        if (alpha <= 0.002) return;
        project(e.a, pa);
        project(e.b, pb);
        stroke(pa[0], pa[1], pb[0], pb[1], alpha);
      });

      // The 13 lines
      const settleEnd = land - SETTLE_DONE;
      const settleLen = Math.max(0.1, settleEnd - SETTLE_AT - STAGGER);
      for (const l of lines) {
        const e = edges[l.edge];
        project(e.a, pa);
        project(e.b, pb);
        const g = guides[l.guide];
        const lag = l.order * STAGGER;
        const ext = reduced ? span(s, [EXTEND_AT, SETTLE_AT]) : ease((s - EXTEND_AT - lag) / EXTEND);
        const set = reduced ? span(s, [SETTLE_AT, settleEnd]) : ease((s - SETTLE_AT - lag) / settleLen);
        const alpha = (GHOST + (GUIDE_OPACITY - GHOST) * ext) * appear * (1 - reveal);
        // Face on (or once it starts running out), its ends line up exactly
        const square = Math.max(turn, ext);

        if (l.horizontal) {
          // Its own height and ends, run out to span the grid (and past the
          // S), then slid to its construction line's height and ends
          const y0 = (pa[1] + pb[1]) / 2;
          const lo0 = Math.min(pa[0], pb[0]);
          const hi0 = Math.max(pa[0], pb[0]);
          const L = gx(Math.min(g.x1, g.x2));
          const R = gx(Math.max(g.x1, g.x2));
          let lo = lo0 + (Math.min(L, lo0) - lo0) * ext;
          let hi = hi0 + (Math.max(R, hi0) - hi0) * ext;
          lo += (L - lo) * set;
          hi += (R - hi) * set;
          const y = y0 + (gy(g.y1) - y0) * set;
          const [ax, bx] = pa[0] <= pb[0] ? [lo, hi] : [hi, lo];
          stroke(ax, pa[1] + (y - pa[1]) * square, bx, pb[1] + (y - pb[1]) * square, alpha);
        } else {
          const x0 = (pa[0] + pb[0]) / 2;
          const lo0 = Math.min(pa[1], pb[1]);
          const hi0 = Math.max(pa[1], pb[1]);
          const T = gy(Math.min(g.y1, g.y2));
          const B = gy(Math.max(g.y1, g.y2));
          let lo = lo0 + (Math.min(T, lo0) - lo0) * ext;
          let hi = hi0 + (Math.max(B, hi0) - hi0) * ext;
          lo += (T - lo) * set;
          hi += (B - hi) * set;
          const x = x0 + (gx(g.x1) - x0) * set;
          const [ay, by] = pa[1] <= pb[1] ? [lo, hi] : [hi, lo];
          stroke(pa[0] + (x - pa[0]) * square, ay, pb[0] + (x - pb[0]) * square, by, alpha);
        }
      }
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener(HANDOFF_DONE, onDone);
      window.removeEventListener('pointermove', onPointer);
      canvas.remove();
      glassRenderer.domElement.remove();
      glassGeometries.forEach((geometry) => geometry.dispose());
      glassMaterials.forEach((material) => material.dispose());
      glassMaterial.dispose();
      reflections.dispose();
      glassRenderer.dispose();
      guideHandoff.active = false;
      guideHandoff.reveal = 0;
    };
  }, [data, heroOnly, centerOnScroll]);

  return null;
}
