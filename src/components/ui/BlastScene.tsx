'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import { createHeroObject, S_CENTER, S_HEIGHT, S_PIECES } from '@/lib/heroObject';
import { WORDMARK_BAND, WORDMARK_PATHS, WORDMARK_VIEWBOX } from '@/lib/wordmark';
import { onIntroStart } from '@/lib/intro';
import { CONSTRUCT, createConstruction } from '@/components/ui/construction';
import { getGpuTier } from '@/lib/device';
import { setLite } from '@/lib/perf';

// ---------------------------------------------------------------------------
// BlastScene
// The hero's WebGL layer:
// - Intro: construction guides glide in and draw the whole Gemstrat wordmark;
//   the other letters fade, and the S swings round into the 3D logo (it is a
//   mirrored S, so seen from behind it is the wordmark's S) as a glowing
//   wireframe that material and light fill. construction.ts draws the 2D
//   part. The hero copy waits for it.
// - The centre object (lib/heroObject) is shattered into panels — its
//   triangles grouped by face direction — so one value, `p`, blows it apart
//   (each panel flies along its own direction and spins) and back together.
//   Scrolling and holding the mouse drive that value: the first scroll blows
//   it apart, and it reassembles behind the next section.
// - Hold anywhere in the hero: after a short charge the panels blast out and
//   spin. Release and they reassemble.
// ---------------------------------------------------------------------------

const BG = 0x090909;

// Hold to blast (seconds held)
const CHARGE_TIME = 0.5; // s held before the blast
const EXPLODE_DIST = 5.5; // how far panels fly at full blast

// Idle "breath": while the visitor sits at the top of the hero, the plates pull
// apart a little and snap back every few seconds — the scroll explosion in
// miniature, hinting to scroll. It runs as a wave, plate by plate: every face
// panel of the logo pushes out along its own direction in turn, from top left
// to bottom right, evenly spaced.
// Any scroll stops it; back at the top and idle again, it resumes.
const BREATH_DIST = 0.14; // world units the plates separate
const BREATH_PERIOD = 4.2; // s between waves
const BREATH_DELAY = 1.8; // s after the intro before the first one
const BREATH_RESUME = 5; // s without scrolling, back at the top, before it resumes
const BREATH_WAVE = 1.8; // s from the first plate starting to the last
const BREATH_PULL = 0.4; // s for a plate to pull out
const BREATH_HOLD = 0.06; // s held out
const BREATH_SNAP = 0.35; // s to snap back (with a small overshoot)

// A plate's separation (0-1) at time u into its own breath
function breathAt(u: number) {
  if (u <= 0) return 0;
  if (u < BREATH_PULL) return 0.5 - 0.5 * Math.cos((Math.PI * u) / BREATH_PULL);
  if (u < BREATH_PULL + BREATH_HOLD) return 1;
  const k = (u - BREATH_PULL - BREATH_HOLD) / BREATH_SNAP;
  return k < 1 ? Math.exp(-6 * k) * Math.cos(3 * Math.PI * k) : 0;
}

// Scroll: the object blows apart over this much of the first viewport
const SCROLL_START = 0.08; // in viewport heights
const SCROLL_RANGE = 0.6;
// ...then reassembles over this range, as the next section (the Statement,
// after the 170svh hero) scrolls in over the scene
const REASSEMBLE_START = 1.15;
const REASSEMBLE_END = 1.7;

// Camera framing per viewport width
function framing(w: number) {
  if (w > 1440) return { fov: 42, z: 6, scale: 1, y: 0 };
  if (w >= 1024) return { fov: 40, z: 6.28, scale: 0.9, y: -0.02 };
  if (w >= 768) return { fov: 38, z: 7.55, scale: 0.84, y: -0.035 };
  return { fov: 36, z: 9.35, scale: 0.74, y: -0.45 };
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const ramp = (t: number, start: number, dur: number) => clamp01((t - start) / dur);
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

const EDGE_COLOR = new THREE.Color(0x3a3a3a);
const EDGE_OPACITY = [0.08, 0.05];
const WIRE_COLOR = new THREE.Color(0xe8e8e8);
const SOLID_OPACITY = 0.88;
const OBJECT_SCALE = 0.72; // the logo's size in the frame
const OBJECT_Y = -0.35; // nudged down, clear of the headline
const MOUSE_TILT_X = 0.06; // rad the logo tips toward the cursor vertically
// The intro draws the whole wordmark this wide (fraction of the viewport, and
// at most WORDMARK_MAX_PX), centred, before its S turns into the logo
const WORDMARK_WIDTH = 0.78;
const WORDMARK_MAX_PX = 1100;

interface Panel {
  obj: THREE.Mesh<THREE.BufferGeometry, THREE.MeshPhysicalMaterial> | THREE.LineSegments;
  home: THREE.Vector3;
  dir: THREE.Vector3;
  axis: THREE.Vector3;
  spin: number;
  delay: number;
  part: number;
  edge: boolean;
  flash: number;
  wave: number; // 0-1: when this panel breathes, within the wave
}

// Split a geometry into flat panels (triangles sharing a face direction)
function shatter(
  geometry: THREE.BufferGeometry,
  part: number,
  material: THREE.MeshPhysicalMaterial,
  edgeMats: THREE.LineBasicMaterial[],
  group: THREE.Group,
  panels: Panel[]
) {
  const geo = geometry.index ? geometry.toNonIndexed() : geometry;
  geo.computeBoundingBox();
  const center = new THREE.Vector3();
  geo.boundingBox!.getCenter(center);

  const pos = geo.attributes.position.array as ArrayLike<number>;
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const c = new THREE.Vector3();
  const n = new THREE.Vector3();
  const groups = new Map<string, { tris: number[]; normal: THREE.Vector3 }>();
  for (let i = 0; i < pos.length; i += 9) {
    a.set(pos[i], pos[i + 1], pos[i + 2]);
    b.set(pos[i + 3], pos[i + 4], pos[i + 5]);
    c.set(pos[i + 6], pos[i + 7], pos[i + 8]);
    n.subVectors(c, b).cross(a.clone().sub(b)).normalize();
    const key = `${Math.round(n.x * 10)},${Math.round(n.y * 10)},${Math.round(n.z * 10)}`;
    let g = groups.get(key);
    if (!g) groups.set(key, (g = { tris: [], normal: n.clone() }));
    g.tris.push(i);
  }

  groups.forEach(({ tris, normal }) => {
    const centroid = new THREE.Vector3();
    tris.forEach((i) => {
      for (let k = 0; k < 9; k += 3) {
        centroid.x += pos[i + k];
        centroid.y += pos[i + k + 1];
        centroid.z += pos[i + k + 2];
      }
    });
    centroid.divideScalar(tris.length * 3);

    // Geometry around its own centroid, so each panel spins in place
    const arr = new Float32Array(tris.length * 9);
    tris.forEach((i, t) => {
      for (let k = 0; k < 9; k += 3) {
        arr[t * 9 + k] = pos[i + k] - centroid.x;
        arr[t * 9 + k + 1] = pos[i + k + 1] - centroid.y;
        arr[t * 9 + k + 2] = pos[i + k + 2] - centroid.z;
      }
    });
    const panelGeo = new THREE.BufferGeometry();
    panelGeo.setAttribute('position', new THREE.BufferAttribute(arr, 3));
    panelGeo.computeVertexNormals();

    const mesh = new THREE.Mesh(panelGeo, material.clone());
    mesh.position.copy(centroid);
    group.add(mesh);

    // Fly outward: away from the part's centre, biased along the face normal
    const out = centroid.clone().sub(center);
    if (out.lengthSq() < 1e-6) out.copy(normal);
    const dir = out.normalize().multiplyScalar(0.6).addScaledVector(normal, 0.4).normalize();
    panels.push({
      obj: mesh,
      home: centroid,
      dir,
      axis: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize(),
      spin: (Math.random() - 0.5) * 0.8,
      delay: Math.random() * 0.25,
      part,
      edge: false,
      flash: 0,
      wave: centroid.x * 0.35 - centroid.y + centroid.z * 0.15, // raw; ranked once all panels exist
    });
  });

  // Faint wireframe outline that stays put while the panels fly off
  const edges = new THREE.EdgesGeometry(geo, 8);
  edgeMats.forEach((mat, i) => {
    const lines = new THREE.LineSegments(edges, mat);
    if (i > 0) lines.scale.setScalar(1.004);
    group.add(lines);
    panels.push({
      obj: lines,
      home: new THREE.Vector3(),
      dir: new THREE.Vector3(),
      axis: new THREE.Vector3(0, 1, 0),
      spin: 0,
      delay: 0,
      part,
      edge: true,
      flash: 0,
      wave: 0,
    });
  });
  if (geo !== geometry) geo.dispose();
}

interface BlastSceneProps {
  className?: string;
  /** Called once the construction intro has played (or been skipped). */
  onIntroDone?: () => void;
}

export default function BlastScene({ className, onIntroDone }: BlastSceneProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const lineCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const lineCanvas = lineCanvasRef.current;
    const hero = document.getElementById('hero');
    if (!wrap || !lineCanvas || !hero || getGpuTier() === 'none') {
      onIntroDone?.();
      return;
    }
    const heroEl = hero;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Play the construction intro unless the copy is already showing (the
    // scene loaded late, or the Hero gave up waiting for it)
    const construct = !reduceMotion && !document.documentElement.classList.contains('hero-reveal');
    let W = window.innerWidth;
    let H = window.innerHeight;
    const pixelRatio = () => Math.min(window.devicePixelRatio || 1, W < 768 ? 1 : 1.5);

    // --- Renderer, scene, camera ------------------------------------------
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setPixelRatio(pixelRatio());
    renderer.setSize(W, H);
    renderer.setClearColor(BG, 1);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.domElement.className = 'absolute inset-0 w-full h-full';
    wrap.prepend(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(BG);
    let view = framing(W);
    const camera = new THREE.PerspectiveCamera(view.fov, W / H, 0.1, 200);
    camera.position.set(0, 0, view.z);

    // Monochrome: grey rim lights from every side, plus white point lights
    // that orbit and throw moving glints across the glass
    scene.add(new THREE.AmbientLight(0x2e2e2e, 2.8 * Math.PI));
    (
      [
        [0xffffff, 1.6, [4, 5, 4]],
        [0x999999, 0.8, [-4, 1, -2]],
        [0xdddddd, 1.5, [0, -3, -5]],
        [0x999999, 1, [-3, 2, 6]],
        [0xbbbbbb, 1, [0, 8, 2]],
        [0x777777, 1.2, [0, 0, -8]],
        [0x777777, 1, [-8, 0, 0]],
        [0x777777, 1, [8, 0, 0]],
        [0x777777, 1, [0, -8, 0]],
      ] as const
    ).forEach(([color, intensity, [x, y, z]]) => {
      const light = new THREE.DirectionalLight(color, intensity * Math.PI);
      light.position.set(x, y, z);
      scene.add(light);
    });
    const glint1 = new THREE.PointLight(0xffffff, 7 * Math.PI, 22, 1);
    const glint2 = new THREE.PointLight(0xd8d8d8, 5 * Math.PI, 20, 1);
    const glint3 = new THREE.PointLight(0xeeeeee, 3.5 * Math.PI, 14, 1);
    glint1.position.set(3, -1, 3);
    glint2.position.set(-3, 2, -2);
    glint3.position.set(0, 4, 3);
    scene.add(glint1, glint2, glint3);

    // Faint dust drifting in the background
    const dustPos = new Float32Array(600);
    for (let i = 0; i < dustPos.length; i++) dustPos[i] = (Math.random() - 0.5) * 20;
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    const dustMat = new THREE.PointsMaterial({ color: 0xbdbdbd, size: 0.022, transparent: true, opacity: 0.25 });
    const dust = new THREE.Points(dustGeo, dustMat);
    dust.visible = W >= 768;
    scene.add(dust);

    // The object reflects the scene itself (lights, dust)
    const cubeRT = new THREE.WebGLCubeRenderTarget(256, {
      generateMipmaps: true,
      minFilter: THREE.LinearMipmapLinearFilter,
    });
    const cubeCamera = new THREE.CubeCamera(0.1, 100, cubeRT);
    scene.add(cubeCamera);

    // A dim studio backdrop only the reflection probe sees (layer 1): soft
    // grey gradient with a few softboxes, so the metal facets catch light
    // while the visible background stays black
    const studio = document.createElement('canvas');
    studio.width = 512;
    studio.height = 256;
    const sctx = studio.getContext('2d')!;
    const grad = sctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, '#404040');
    grad.addColorStop(0.45, '#0e0e0e');
    grad.addColorStop(0.6, '#0b0b0b');
    grad.addColorStop(1, '#1e1e1e');
    sctx.fillStyle = grad;
    sctx.fillRect(0, 0, 512, 256);
    sctx.fillStyle = 'rgba(225,225,225,0.55)';
    sctx.fillRect(60, 40, 70, 90);
    sctx.fillRect(300, 30, 120, 26);
    sctx.fillStyle = 'rgba(160,160,160,0.3)';
    sctx.fillRect(420, 150, 50, 60);
    const studioTex = new THREE.CanvasTexture(studio);
    studioTex.colorSpace = THREE.SRGBColorSpace;
    const studioDome = new THREE.Mesh(
      new THREE.SphereGeometry(50, 32, 16),
      new THREE.MeshBasicMaterial({ map: studioTex, side: THREE.BackSide, toneMapped: false })
    );
    studioDome.layers.set(1);
    scene.add(studioDome);
    cubeCamera.children.forEach((cam) => cam.layers.enable(1));

    // --- The object --------------------------------------------------------
    const material = new THREE.MeshPhysicalMaterial({
      color: 0x3c3c3c,
      emissive: new THREE.Color(0x1c1c1c),
      emissiveIntensity: 0.15,
      metalness: 1,
      roughness: 0.08,
      transmission: 0.35,
      ior: 2.4,
      transparent: true,
      opacity: 0.88,
      clearcoat: 1,
      clearcoatRoughness: 0.05,
      envMap: cubeRT.texture,
      envMapIntensity: 3,
      side: THREE.DoubleSide,
    });
    const edgeMats = EDGE_OPACITY.map(
      (opacity) => new THREE.LineBasicMaterial({ color: EDGE_COLOR, transparent: true, opacity })
    );
    const group = new THREE.Group();
    const panels: Panel[] = [];
    const heroObject = createHeroObject();
    heroObject.parts.forEach((g, i) => {
      shatter(g, i, material, edgeMats, group, panels);
      g.dispose();
    });
    const solidMeshes = panels.filter((p) => !p.edge).map((p) => p.obj);
    // Each panel's turn in the breath wave: ranked top left → bottom right and
    // spaced evenly from 0 (first) to 1 (last), so they go strictly one by one
    {
      const solid = panels.filter((p) => !p.edge).sort((m, n) => m.wave - n.wave);
      solid.forEach((p, i) => (p.wave = solid.length > 1 ? i / (solid.length - 1) : 0));
    }
    scene.add(group);
    const placeGroup = () => {
      group.scale.setScalar(view.scale * OBJECT_SCALE);
      group.position.set(0, view.y + OBJECT_Y, 0);
    };
    placeGroup();

    // --- 2D line layer -----------------------------------------------------
    const lctx = lineCanvas.getContext('2d')!;
    const sizeLineCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      lineCanvas.width = Math.round(W * dpr);
      lineCanvas.height = Math.round(H * dpr);
      lctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    sizeLineCanvas();

    // --- State -------------------------------------------------------------
    const s = {
      time: 0,
      scrollP: 0,
      // Intro: 'waiting' for the loader, 'building' the construction, 'done'
      phase: (construct ? 'waiting' : 'done') as 'waiting' | 'building' | 'done',
      ct: 0, // construction time
      rotX: 0, // upright: no forward lean
      rotY: 0.4,
      mouseX: 0,
      mouseY: 0,
      screenX: -9999,
      screenY: -9999,
      holding: false,
      holdTime: 0,
      burst: 0,
      hovered: null as THREE.Object3D | null,
      envReady: false,
      frame: 0,
      cursorShown: false,
      doneAt: 0, // s.time when the intro finished
      scrolled: false, // the visitor has scrolled at least once
      lastScrollY: window.scrollY,
      lastScrollAt: 0, // s.time of the latest scroll
      wasBreathing: false,
      breathStart: 0, // s.time the current run of waves began
      breathU: 0, // s into the current breath wave
      breathAmp: 0, // 1 while breathing; eases to 0 once it stops
      linesCleared: false,
    };

    // --- Construction intro ------------------------------------------------
    let construction: ReturnType<typeof createConstruction> | null = null;
    const solidPanels = panels.filter((p) => !p.edge);
    const setSolid = (k: number) =>
      solidPanels.forEach((p) => {
        (p.obj as THREE.Mesh<THREE.BufferGeometry, THREE.MeshPhysicalMaterial>).material.opacity = SOLID_OPACITY * k;
        p.obj.visible = k > 0.003;
      });
    const setWire = (k: number) =>
      edgeMats.forEach((m, i) => {
        m.color.copy(EDGE_COLOR).lerp(WIRE_COLOR, k);
        m.opacity = EDGE_OPACITY[i] + (i === 0 ? 0.8 : 0.35) * k;
      });
    if (s.phase !== 'done') {
      group.visible = false;
      setSolid(0);
    }

    // Where the 3D logo starts its turn: exactly over the wordmark's S
    const turnFrom = { x: 0, y: 0, scale: 1 };

    function startConstruction() {
      if (s.phase !== 'waiting') return;
      // Lay the wordmark out centred on screen (SVG units → px)
      const k = Math.min(W * WORDMARK_WIDTH, WORDMARK_MAX_PX) / WORDMARK_VIEWBOX.width;
      const left = W / 2 - (WORDMARK_VIEWBOX.width / 2) * k;
      const top = H / 2 - ((WORDMARK_BAND.top + WORDMARK_BAND.bottom) / 2) * k;
      const toPx = (x: number, y: number) => ({ x: left + x * k, y: top + y * k });

      const svg = `<svg xmlns="http://www.w3.org/2000/svg">${WORDMARK_PATHS.map((p) => `<path d="${p.d}"/>`).join('')}</svg>`;
      const letters = new SVGLoader().parse(svg).paths.map((path, i) => {
        // Each shape's outline and holes, as one list of paths
        const paths = SVGLoader.createShapes(path).flatMap((shape): THREE.Path[] => [shape, ...shape.holes]);
        return {
          small: WORDMARK_PATHS[i].small,
          // Curves finely sampled, so they trace smoothly
          polys: paths.map((p) => p.getPoints(24).map((v) => toPx(v.x, v.y))),
          // Only the truly straight segments carry guides
          edges: paths.flatMap((p) =>
            p.curves
              .filter((c): c is THREE.LineCurve => (c as THREE.LineCurve).isLineCurve === true)
              .map((c): [{ x: number; y: number }, { x: number; y: number }] => [toPx(c.v1.x, c.v1.y), toPx(c.v2.x, c.v2.y)])
          ),
        };
      });
      const mark = S_PIECES.map((piece) => piece.map(([x, y]) => toPx(x, y)));
      construction = createConstruction({ letters, mark }, W, H);

      // The 3D logo is a mirrored S: seen from behind (turned half a turn) it
      // is the wordmark's S, so it starts there — same spot, same size — and
      // swings round into its own place (see the frame loop)
      const unitsPerPx = (2 * view.z * Math.tan(THREE.MathUtils.degToRad(view.fov / 2))) / H;
      const sCentre = toPx(S_CENTER.x, S_CENTER.y);
      turnFrom.x = (sCentre.x - W / 2) * unitsPerPx;
      turnFrom.y = -(sCentre.y - H / 2) * unitsPerPx;
      turnFrom.scale = (WORDMARK_BAND.bottom - WORDMARK_BAND.top) * k * unitsPerPx / S_HEIGHT;

      s.phase = 'building';
      s.ct = 0;
    }

    function finishConstruction() {
      if (s.phase === 'done') return;
      s.phase = 'done';
      s.doneAt = s.time;
      construction = null;
      group.visible = true;
      placeGroup();
      setSolid(1);
      setWire(0);
      onIntroDone?.();
    }
    if (s.phase === 'done') onIntroDone?.();

    let introTimer = 0;
    const stopIntro = onIntroStart(() => {
      introTimer = window.setTimeout(startConstruction, 150);
    });

    // --- Input -------------------------------------------------------------
    const onPointerMove = (e: PointerEvent) => {
      s.mouseX = (e.clientX / W) * 2 - 1;
      s.mouseY = -(e.clientY / H) * 2 + 1;
      s.screenX = e.clientX;
      s.screenY = e.clientY;
    };
    const onPointerLeave = () => {
      s.screenX = -9999;
      s.screenY = -9999;
    };
    const onPointerDown = (e: PointerEvent) => {
      onPointerMove(e);
      if (e.button !== 0 || s.phase !== 'done') return;
      const target = e.target as HTMLElement;
      if (!hero.contains(target) || target.closest('a, button, [role="button"]')) return;
      if (s.scrollP >= 0.15 || window.scrollY / H >= 0.15) return;
      s.holding = true;
      s.holdTime = 0;
      s.burst = 0;
    };
    const onRelease = (e?: PointerEvent) => {
      if (e?.pointerType === 'touch') onPointerLeave();
      if (!s.holding) return;
      s.holding = false;
    };
    const onContextMenu = (e: MouseEvent) => {
      if (s.holding) e.preventDefault();
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointerup', onRelease);
    window.addEventListener('pointercancel', onRelease);
    const onBlur = () => onRelease();
    window.addEventListener('blur', onBlur);
    document.documentElement.addEventListener('pointerleave', onPointerLeave);
    hero.addEventListener('contextmenu', onContextMenu);

    const raycaster = new THREE.Raycaster();
    const ndc = new THREE.Vector2();

    // --- Frame -------------------------------------------------------------
    let raf = 0;
    let running = false;
    let last = performance.now();

    function frame(now: number) {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const f = dt * 60; // frames at 60fps, for per-frame easing constants
      const ease = (k: number) => 1 - Math.pow(1 - k, f);
      s.time += dt;
      s.frame++;
      const t = s.time;

      // Scroll
      const norm = window.scrollY / H;
      const apart = clamp01((norm - SCROLL_START) / SCROLL_RANGE);
      const together = easeInOutCubic(clamp01((norm - REASSEMBLE_START) / (REASSEMBLE_END - REASSEMBLE_START)));
      s.scrollP += (apart * (1 - together) - s.scrollP) * ease(0.06);

      if (s.phase === 'building') {
        s.ct += dt;
        // Scrolling away (or the end of the timeline) skips to the result
        if (norm > 0.05 || s.ct >= CONSTRUCT.end) finishConstruction();
      }

      if (s.phase === 'done') {
        // Idle spin, leaning toward the cursor
        s.rotY += (reduceMotion ? 0.0015 : 0.0042) * f;
        group.rotation.x += (s.rotX + MOUSE_TILT_X * s.mouseY - group.rotation.x) * ease(0.06);
        group.rotation.y += (s.rotY + 0.22 * s.mouseX - group.rotation.y) * ease(0.06);
      } else if (s.phase === 'building') {
        // Flat → 3D: from the wordmark's S (seen from behind, half a turn
        // round) it swings into the idle pose while moving and growing into
        // its own place, as a glowing wireframe that material and light fill
        const ct = s.ct;
        const tilt = easeInOutCubic(ramp(ct, CONSTRUCT.to3dStart, CONSTRUCT.to3dDur));
        const lerp = (a: number, b: number) => a + (b - a) * tilt;
        group.rotation.set(lerp(0, s.rotX + MOUSE_TILT_X * s.mouseY), lerp(Math.PI, s.rotY + 0.22 * s.mouseX), 0);
        group.position.set(lerp(turnFrom.x, 0), lerp(turnFrom.y, view.y + OBJECT_Y), 0);
        // A slight swell mid-turn, settling at both ends
        group.scale.setScalar(lerp(turnFrom.scale, view.scale * OBJECT_SCALE) * (1 + 0.05 * Math.sin(Math.PI * tilt)));
        group.visible = ct >= CONSTRUCT.to3dStart;
        setWire(ramp(ct, CONSTRUCT.to3dStart, 0.2) * (1 - ramp(ct, CONSTRUCT.solidStart + 0.2, CONSTRUCT.solidDur)));
        setSolid(easeInOutCubic(ramp(ct, CONSTRUCT.solidStart, CONSTRUCT.solidDur)));
      }

      // Hovered panel flashes
      if (s.screenX !== -9999 && norm < 0.08 && s.scrollP < 0.08 && s.burst < 0.05 && s.phase === 'done') {
        ndc.set(s.mouseX, s.mouseY);
        raycaster.setFromCamera(ndc, camera);
        const hit = raycaster.intersectObjects(solidMeshes, false)[0]?.object ?? null;
        if (hit && hit !== s.hovered) {
          const panel = panels.find((p) => p.obj === hit);
          if (panel) panel.flash = 1;
        }
        s.hovered = hit;
      } else s.hovered = null;

      // A pointer cursor over the logo hints it can be held
      const showCursor = s.hovered !== null && !s.holding;
      if (showCursor !== s.cursorShown) {
        s.cursorShown = showCursor;
        heroEl.style.cursor = showCursor ? 'pointer' : '';
      }

      // Hold: a short charge, then the blast
      if (s.holding) {
        s.holdTime += dt;
        if (s.holdTime < CHARGE_TIME) s.burst = 0;
        else s.burst = Math.min(1, s.burst + 0.02 * f);
      } else {
        s.burst = Math.max(0, s.burst - 0.025 * f);
      }

      // Idle breath: at the top of the hero, not holding, and — once the
      // visitor has scrolled at all — only after BREATH_RESUME s without scrolling
      if (Math.abs(window.scrollY - s.lastScrollY) > 1) {
        s.lastScrollY = window.scrollY;
        s.lastScrollAt = s.time;
        s.scrolled = true;
      }
      const breathing =
        !reduceMotion &&
        s.phase === 'done' &&
        norm < 0.02 &&
        !s.holding &&
        s.burst < 0.01 &&
        s.time - s.doneAt > BREATH_DELAY &&
        (!s.scrolled || s.time - s.lastScrollAt > BREATH_RESUME);
      // Each run starts on a fresh wave; once it stops, the plates ease home
      if (breathing) {
        if (!s.wasBreathing) s.breathStart = s.time;
        s.breathU = (s.time - s.breathStart) % BREATH_PERIOD;
        s.breathAmp = 1;
      } else s.breathAmp *= Math.pow(0.85, f);
      s.wasBreathing = breathing;

      // Panels
      const p = Math.max(s.scrollP, s.scrollP < 0.15 ? s.burst : 0);
      panels.forEach((panel) => {
        const n = Math.max(0, p - panel.delay);
        const fly = EXPLODE_DIST * n;
        // This panel's breath, at its own moment in the wave, along its own
        // outward direction
        const br = s.breathAmp > 0.001 ? BREATH_DIST * s.breathAmp * breathAt(s.breathU - panel.wave * BREATH_WAVE) : 0;
        const bd = panel.dir;
        const ph = panel.part * ((2 * Math.PI) / 3);
        const idle = 1 - p;
        panel.obj.position.set(
          panel.home.x + panel.dir.x * fly + bd.x * br + 0.012 * Math.sin(0.4 * t + ph) * idle + 0.008 * s.mouseY * Math.cos(ph),
          panel.home.y + panel.dir.y * fly + bd.y * br + 0.008 * Math.cos(0.35 * t + ph) * idle + 0.008 * s.mouseX * Math.sin(ph),
          panel.home.z + panel.dir.z * fly + bd.z * br + 0.006 * Math.sin(0.3 * t + 1.5 * ph) * idle
        );
        const spin = panel.spin * n * Math.PI;
        panel.obj.rotation.set(panel.axis.x * spin, panel.axis.y * spin, panel.axis.z * spin);

        if (!panel.edge && panel.flash > 0) {
          panel.flash *= Math.pow(0.92, f);
          if (panel.flash < 0.002) panel.flash = 0;
          const k = panel.flash;
          const m = (panel.obj as THREE.Mesh<THREE.BufferGeometry, THREE.MeshPhysicalMaterial>).material;
          m.envMapIntensity = 3 + 1.6 * k;
          m.roughness = Math.max(0.02, 0.08 - 0.06 * k);
          m.clearcoatRoughness = Math.max(0.01, 0.05 - 0.035 * k);
          m.emissiveIntensity = 0.15 + 0.1 * k;
          m.transmission = 0.35 + 0.32 * k;
          m.opacity = 0.88 - 0.16 * k;
        }
      });

      glint1.position.set(4 * Math.sin(0.6 * t), 2 * Math.cos(0.4 * t), 3 * Math.cos(0.5 * t) + 2);
      glint2.position.set(4 * Math.cos(0.5 * t), 2 * Math.sin(0.7 * t), 3 * Math.sin(0.3 * t) - 1);

      // Reflections: once up front, then every 6th frame while blasting
      if (!s.envReady || (s.frame % 6 === 0 && (s.burst > 0.01 || s.holding))) {
        const visible = group.visible;
        group.visible = false;
        cubeCamera.update(renderer, scene);
        group.visible = visible;
        s.envReady = true;
      }

      renderer.render(scene, camera);
      drawLines();
    }

    // The line layer only carries the construction intro
    function drawLines() {
      if (s.phase === 'done') {
        if (!s.linesCleared) lctx.clearRect(0, 0, W, H);
        s.linesCleared = true;
        return;
      }
      lctx.clearRect(0, 0, W, H);
      construction?.draw(lctx, s.ct);
    }

    // Only render while the hero is on screen and the tab is visible
    let inView = true;
    const setRunning = () => {
      const should = inView && !document.hidden;
      if (should && !running) {
        running = true;
        last = performance.now();
        raf = requestAnimationFrame(frame);
      } else if (!should && running) {
        running = false;
        cancelAnimationFrame(raf);
      }
    };
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      setRunning();
    });
    io.observe(wrap);
    document.addEventListener('visibilitychange', setRunning);
    setRunning();

    let resizeRaf = 0;
    const onResize = () => {
      cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(() => {
        // The construction guides were laid out for the old width
        if (s.phase === 'building' && window.innerWidth !== W) finishConstruction();
        W = window.innerWidth;
        H = window.innerHeight;
        view = framing(W);
        camera.aspect = W / H;
        camera.fov = view.fov;
        camera.position.z = view.z;
        camera.updateProjectionMatrix();
        renderer.setPixelRatio(pixelRatio());
        renderer.setSize(W, H);
        dust.visible = W >= 768;
        placeGroup();
        sizeLineCanvas();
      });
    };
    window.addEventListener('resize', onResize);

    const onContextLost = (e: Event) => {
      e.preventDefault();
      setLite('webgl-context-lost');
    };
    renderer.domElement.addEventListener('webglcontextlost', onContextLost);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      cancelAnimationFrame(resizeRaf);
      window.clearTimeout(introTimer);
      stopIntro();
      io.disconnect();
      document.removeEventListener('visibilitychange', setRunning);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onRelease);
      window.removeEventListener('pointercancel', onRelease);
      window.removeEventListener('blur', onBlur);
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);
      hero.removeEventListener('contextmenu', onContextMenu);
      hero.style.cursor = '';
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh || obj instanceof THREE.Line || obj instanceof THREE.Points) {
          obj.geometry.dispose();
          (Array.isArray(obj.material) ? obj.material : [obj.material]).forEach((m: THREE.Material) => m.dispose());
        }
      });
      material.dispose();
      studioTex.dispose();
      cubeRT.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [onIntroDone]);

  return (
    <div ref={wrapRef} className={className}>
      <canvas ref={lineCanvasRef} className="absolute inset-0 w-full h-full" aria-hidden="true" />
    </div>
  );
}
