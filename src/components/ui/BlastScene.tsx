'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import * as THREE from 'three';
import { createHeroObject } from '@/lib/heroObject';
import { onIntroStart } from '@/lib/intro';
import { CONSTRUCT, createConstruction } from '@/components/ui/construction';
import { getGpuTier } from '@/lib/device';
import { setLite } from '@/lib/perf';

// ---------------------------------------------------------------------------
// BlastScene
// The hero's WebGL layer:
// - Intro: construction guides streak in and box in the flat logo, which then
//   tilts into 3D as a glowing wireframe and fills with material and light
//   (construction.ts draws the 2D part). The hero copy waits for it.
// - The centre object (lib/heroObject) is shattered into panels — its
//   triangles grouped by face direction — so one value, `p`, blows it apart
//   (each panel flies along its own direction and spins) and back together.
//   Scrolling and holding the mouse drive that value: the first scroll blows
//   it apart, and it reassembles behind the next section.
// - Hold anywhere in the hero: a short charge (the panels tremble), then the
//   blast — the panels fly out and spin. Release and they reassemble. The
//   hero copy stays still; only the scene reacts.
// ---------------------------------------------------------------------------

const BG = 0x090909;

// Hold to blast (seconds held)
const CHARGE_TIME = 0.5; // trembling, then the blast
const EXPLODE_DIST = 5.5; // how far panels fly at full blast
// Camera shake while holding (world units): builds through the charge, jolts
// at the blast, then a low rumble while still held
const SHAKE_CHARGE = 0.06;
const SHAKE_RUMBLE = 0.018;
const SHAKE_KICK = 0.16;
const SHAKE_TEXT_PX = 140; // the hero copy's shake, px per world unit

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

const EDGE_COLOR = new THREE.Color(0x363e4d);
const EDGE_OPACITY = [0.08, 0.05];
const WIRE_COLOR = new THREE.Color(0xdde6ff);
const SOLID_OPACITY = 0.88;
const OBJECT_SCALE = 0.72; // the logo's size in the frame
const OBJECT_Y = -0.35; // nudged down, clear of the headline

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
  const tipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const lineCanvas = lineCanvasRef.current;
    const tip = tipRef.current;
    const hero = document.getElementById('hero');
    if (!wrap || !lineCanvas || !tip || !hero || getGpuTier() === 'none') {
      onIntroDone?.();
      return;
    }
    const tipEl = tip;
    const heroEl = hero;
    // The hero copy shakes with the camera (marked by the Hero)
    const shakeEl = hero.querySelector<HTMLElement>('[data-shake]');

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

    // Cool rim lights from every side, plus warm point lights that orbit
    scene.add(new THREE.AmbientLight(0x2a3040, 2.8 * Math.PI));
    (
      [
        [0xffffff, 1.6, [4, 5, 4]],
        [0x889aaa, 0.8, [-4, 1, -2]],
        [0xccddee, 1.5, [0, -3, -5]],
        [0x889aaa, 1, [-3, 2, 6]],
        [0xaabbcc, 1, [0, 8, 2]],
        [0x6677aa, 1.2, [0, 0, -8]],
        [0x6677aa, 1, [-8, 0, 0]],
        [0x6677aa, 1, [8, 0, 0]],
        [0x6677aa, 1, [0, -8, 0]],
      ] as const
    ).forEach(([color, intensity, [x, y, z]]) => {
      const light = new THREE.DirectionalLight(color, intensity * Math.PI);
      light.position.set(x, y, z);
      scene.add(light);
    });
    const warm1 = new THREE.PointLight(0xff3300, 12 * Math.PI, 22, 1);
    const warm2 = new THREE.PointLight(0xff2200, 9 * Math.PI, 20, 1);
    const warm3 = new THREE.PointLight(0xff5500, 6 * Math.PI, 14, 1);
    warm1.position.set(3, -1, 3);
    warm2.position.set(-3, 2, -2);
    warm3.position.set(0, 4, 3);
    scene.add(warm1, warm2, warm3);

    // Embers drifting in the background
    const dustPos = new Float32Array(600);
    for (let i = 0; i < dustPos.length; i++) dustPos[i] = (Math.random() - 0.5) * 20;
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    const dustMat = new THREE.PointsMaterial({ color: 0xff3300, size: 0.022, transparent: true, opacity: 0.35 });
    const dust = new THREE.Points(dustGeo, dustMat);
    dust.visible = W >= 768;
    scene.add(dust);

    // The object reflects the scene itself (lights, embers)
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
    grad.addColorStop(0, '#3c434e');
    grad.addColorStop(0.45, '#0d0e10');
    grad.addColorStop(0.6, '#0b0b0c');
    grad.addColorStop(1, '#1c1f24');
    sctx.fillStyle = grad;
    sctx.fillRect(0, 0, 512, 256);
    sctx.fillStyle = 'rgba(200,215,235,0.55)';
    sctx.fillRect(60, 40, 70, 90);
    sctx.fillRect(300, 30, 120, 26);
    sctx.fillStyle = 'rgba(255,120,60,0.35)';
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
      color: 0x3a3d42,
      emissive: new THREE.Color(0x1a2030),
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

    const anchorWorld = new THREE.Vector3();
    function toScreen(local: THREE.Vector3) {
      anchorWorld.copy(local).applyMatrix4(group.matrixWorld);
      const worldZ = anchorWorld.z;
      anchorWorld.project(camera);
      return { x: ((anchorWorld.x + 1) / 2) * W, y: ((-anchorWorld.y + 1) / 2) * H, worldZ };
    }
    // --- State -------------------------------------------------------------
    const s = {
      time: 0,
      scrollP: 0,
      // Intro: 'waiting' for the loader, 'building' the construction, 'done'
      phase: (construct ? 'waiting' : 'done') as 'waiting' | 'building' | 'done',
      ct: 0, // construction time
      rotX: 0.3,
      rotY: 0.4,
      mouseX: 0,
      mouseY: 0,
      screenX: -9999,
      screenY: -9999,
      holding: false,
      holdTime: 0,
      vibrate: 0,
      vibratePhase: 0,
      burst: 0,
      hovered: null as THREE.Object3D | null,
      envReady: false,
      frame: 0,
      kick: 0, // blast jolt, decays to 0
      tipShown: false,
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

    function startConstruction() {
      if (s.phase !== 'waiting') return;
      // The flat logo faces the camera; project its outline to the screen
      // (the matrices may not be current yet if no frame has rendered)
      group.rotation.set(0, 0, 0);
      group.updateMatrixWorld(true);
      camera.updateMatrixWorld();
      construction = createConstruction(
        heroObject.outline.map((poly) => poly.map((p) => toScreen(p))),
        W,
        H
      );
      s.phase = 'building';
      s.ct = 0;
    }

    function finishConstruction() {
      if (s.phase === 'done') return;
      s.phase = 'done';
      construction = null;
      group.visible = true;
      group.scale.setScalar(view.scale * OBJECT_SCALE);
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
      s.vibrate = 1;
      s.vibratePhase = 0;
      s.burst = 0;
    };
    const onRelease = (e?: PointerEvent) => {
      if (e?.pointerType === 'touch') onPointerLeave();
      if (!s.holding) return;
      s.holding = false;
      s.vibrate = 0;
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
        group.rotation.x += (s.rotX + 0.22 * s.mouseY - group.rotation.x) * ease(0.06);
        group.rotation.y += (s.rotY + 0.22 * s.mouseX - group.rotation.y) * ease(0.06);
      } else if (s.phase === 'building') {
        // Flat → 3D: tilt from facing the camera into the idle pose, as a
        // glowing wireframe that material and light then fill
        const ct = s.ct;
        const tilt = easeInOutCubic(ramp(ct, CONSTRUCT.to3dStart, CONSTRUCT.to3dDur));
        group.rotation.set((s.rotX + 0.22 * s.mouseY) * tilt, (s.rotY + 0.22 * s.mouseX) * tilt, 0);
        // It swells slightly as it turns and settles back, so it lines up
        // with the flat outline at both ends
        group.scale.setScalar(view.scale * OBJECT_SCALE * (1 + 0.05 * Math.sin(Math.PI * tilt)));
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

      // Over the logo (and not already holding): the "hold to blast" label
      // follows the cursor
      const showTip = s.hovered !== null && !s.holding;
      if (showTip !== s.tipShown) {
        s.tipShown = showTip;
        tipEl.style.opacity = showTip ? '1' : '0';
        heroEl.style.cursor = showTip ? 'pointer' : '';
      }
      if (showTip) tipEl.style.transform = `translate3d(${s.screenX + 18}px, ${s.screenY + 18}px, 0)`;

      // Hold: charge (tremble), then blast
      s.vibratePhase += 1.1 * f;
      if (s.holding) {
        s.holdTime += dt;
        s.vibrate = 1;
        if (s.holdTime < CHARGE_TIME) s.burst = 0;
        else {
          if (s.burst === 0) s.kick = 1; // the moment it blasts
          s.vibrate *= 0.88;
          s.burst = Math.min(1, s.burst + 0.02 * f);
        }
      } else {
        s.vibrate = Math.max(0, s.vibrate - 0.08 * f);
        s.burst = Math.max(0, s.burst - 0.025 * f);
      }

      // Screen shake: the camera trembles with the charge, jolts at the blast
      s.kick *= Math.pow(0.9, f);
      const shake =
        (s.holding
          ? s.holdTime < CHARGE_TIME
            ? SHAKE_CHARGE * (0.25 + 0.75 * (s.holdTime / CHARGE_TIME))
            : SHAKE_RUMBLE
          : 0) +
        SHAKE_KICK * s.kick;
      if (shake > 0.0005) {
        const sx = 0.6 * Math.sin(t * 67) + 0.4 * Math.sin(t * 113);
        const sy = 0.6 * Math.cos(t * 59) + 0.4 * Math.sin(t * 97);
        const sr = Math.sin(t * 41);
        camera.position.x = shake * sx;
        camera.position.y = shake * sy;
        camera.rotation.z = shake * 0.25 * sr;
        // The copy moves against the camera (as the scene appears to), scaled
        // from world units to pixels
        if (shakeEl) {
          const px = shake * SHAKE_TEXT_PX;
          shakeEl.style.transform = `translate3d(${(-sx * px).toFixed(2)}px, ${(sy * px).toFixed(2)}px, 0) rotate(${(-sr * shake * 6).toFixed(3)}deg)`;
        }
      } else if (camera.position.x !== 0 || camera.position.y !== 0) {
        camera.position.x = 0;
        camera.position.y = 0;
        camera.rotation.z = 0;
        if (shakeEl) shakeEl.style.transform = '';
      }

      // Panels
      const p = Math.max(s.scrollP, s.scrollP < 0.15 ? s.burst : 0);
      const jitterAmt = 0.018 * s.vibrate * (1 - s.burst);
      panels.forEach((panel) => {
        const n = Math.max(0, p - panel.delay);
        const fly = EXPLODE_DIST * n;
        const ph = panel.part * ((2 * Math.PI) / 3);
        const idle = 1 - p;
        const jx = Math.sin(s.vibratePhase + 20 * panel.delay) * jitterAmt;
        const jy = Math.cos(1.3 * s.vibratePhase + 2 * panel.part) * jitterAmt;
        panel.obj.position.set(
          panel.home.x + panel.dir.x * fly + 0.012 * Math.sin(0.4 * t + ph) * idle + 0.008 * s.mouseY * Math.cos(ph) + jx,
          panel.home.y + panel.dir.y * fly + 0.008 * Math.cos(0.35 * t + ph) * idle + 0.008 * s.mouseX * Math.sin(ph) + jy,
          panel.home.z + panel.dir.z * fly + 0.006 * Math.sin(0.3 * t + 1.5 * ph) * idle
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

      warm1.position.set(4 * Math.sin(0.6 * t), 2 * Math.cos(0.4 * t), 3 * Math.cos(0.5 * t) + 2);
      warm2.position.set(4 * Math.cos(0.5 * t), 2 * Math.sin(0.7 * t), 3 * Math.sin(0.3 * t) - 1);

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
      if (shakeEl) shakeEl.style.transform = '';
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
      {/* Cursor label, shown while hovering the logo (positioned per frame) */}
      <div
        ref={tipRef}
        aria-hidden="true"
        className="fixed left-0 top-0 z-20 pointer-events-none opacity-0 transition-opacity duration-300 flex items-center gap-2 h-9 pl-2 pr-3.5 rounded-full bg-[#141416]/85 border border-white/10 backdrop-blur-md text-[11px] uppercase tracking-[0.12em] text-white whitespace-nowrap"
      >
        <Image src="/images/blast.gif" alt="" width={22} height={22} unoptimized />
        Hold to blast
      </div>
    </div>
  );
}
