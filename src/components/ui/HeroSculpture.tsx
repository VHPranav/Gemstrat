'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/examples/jsm/postprocessing/GTAOPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { getGpuTier, isLowEndDevice } from '@/lib/device';
import { setLite } from '@/lib/perf';

interface HeroSculptureProps {
  className?: string;
}

// Plate: a flat square slab with slightly rounded corners and soft bevelled
// edges (no fold)
const PLATE_SIZE = 1.45; // side length
const PLATE_LENGTH = PLATE_SIZE;
const PLATE_WIDTH = PLATE_SIZE;
const PLATE_THICKNESS = 0.1;
const PLATE_BEVEL = 0.04;
const PLATE_CORNER = 0.06; // corner radius in the plate plane

// Spine: helix the plates are stacked along
const PLATE_COUNT = 380;
// Same pitch as two turns in 7.2 units, but long enough that both ends run
// off the top and bottom of the frame — the spiral never shows a start/end
const SPINE_HEIGHT = 13.5;
const SPINE_RADIUS = 2.0;
const SPINE_TURNS = 3.75; // ~two full twists visible inside the viewport
const SPINE_TILT = -0.18; // rad about X: top of the helix leans away
const SPINE_SLANT = 0.36; // rad about Z: axis runs top-left → bottom-right
const TWIST_TURNS = 0.35; // plate rotation about the spine over the stack
const PLATE_TILT = 0.38; // rad: tips each plate's face toward the camera

// Placement & motion
const OFFSET_X_WIDE = -1.35; // left of centre on wide screens
const OFFSET_Y = 0.7; // nudged up
const SPIN_SPEED = 0.07; // rad/s
const SCROLL_TURN = 0.0015; // rad per px scrolled
const CAMERA_DRIFT = 0.4; // camera sway toward the pointer, in world units

// Intro: the plates start scattered and fly in to assemble the helix. The
// delay lines the flight up with HeroBackdrop's fade-in of this layer.
const ASSEMBLE_DELAY = 0.7; // s after mount
const ASSEMBLE_DURATION = 2.1; // s each plate takes to fly home
const ASSEMBLE_STAGGER = 1.5; // s between the first plate and the last
const SCATTER_MIN = 2.5; // how far plates start from home
const SCATTER_MAX = 7.5;
const SCATTER_SWIRL = 1.4; // rad plates swing around the axis on the way in
const ASSEMBLE_END = ASSEMBLE_DELAY + ASSEMBLE_STAGGER + ASSEMBLE_DURATION;

// Cursor wave: plates near the pointer riffle open like a deck of cards and
// their edges catch the light, then spring back when it moves on
const WAVE_RADIUS = 190; // px of screen distance the pointer reaches
const WAVE_ANGLE = 1.1; // rad a plate flips open at full strength
const WAVE_LIFT = 0.45; // units a plate pushes out from the spine
const WAVE_STIFFNESS = 70; // spring: higher snaps back faster
const WAVE_DAMPING = 9; // spring: lower wobbles more
const WAVE_SPEED_REF = 1400; // px/s of pointer speed for a full-strength wave

// Idle wave: while the pointer rests (or on touch), a pulse runs along the
// helix from one end to the other every few seconds
const IDLE_AFTER = 1.2; // s of no pointer movement before it takes over
const IDLE_TRAVEL = 3.6; // s for the pulse to run the full helix
const IDLE_PERIOD = 5.5; // s between pulse starts
const IDLE_WIDTH = 0.07; // half-width of the pulse, as a share of the helix
const IDLE_STRENGTH = 0.75;
const EDGE_LIGHT = 0xffffff; // monochrome: plates light up white, no colour
const EDGE_GLOW = 1.8; // emissive strength of a fully open plate's edge

// Adaptive quality: if frames average slower than this (≈40fps) over a
// sampling window, drop one quality level (AO → shadows → pixel ratio).
// The window is time-based so a GPU drawing 1 frame/s steps down within a
// second or two, instead of after 90 (very slow) frames.
const SLOW_FRAME_MS = 25;
const SAMPLE_WINDOW_MS = 600;
const SAMPLE_MIN_FRAMES = 8;
// A single frame this slow means the GPU is drowning: drop quality at once
const STALL_FRAME_MS = 150;
// Still slow at the lowest quality: stop animating and keep the still frame
const GIVE_UP_FRAME_MS = 60;

// Rounded rectangle in the plate plane, extruded to its thickness with a
// rounded bevel so every edge catches a soft highlight.
function buildPlateGeometry() {
  const w = PLATE_LENGTH / 2 - PLATE_BEVEL;
  const h = PLATE_WIDTH / 2 - PLATE_BEVEL;
  const r = Math.min(PLATE_CORNER, h);
  const shape = new THREE.Shape();
  shape.moveTo(-w + r, -h);
  shape.lineTo(w - r, -h);
  shape.quadraticCurveTo(w, -h, w, -h + r);
  shape.lineTo(w, h - r);
  shape.quadraticCurveTo(w, h, w - r, h);
  shape.lineTo(-w + r, h);
  shape.quadraticCurveTo(-w, h, -w, h - r);
  shape.lineTo(-w, -h + r);
  shape.quadraticCurveTo(-w, -h, -w + r, -h);

  const depth = Math.max(PLATE_THICKNESS - PLATE_BEVEL * 2, 0.005);
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: PLATE_BEVEL,
    bevelSize: PLATE_BEVEL,
    bevelSegments: 3,
    curveSegments: 4,
  });
  // Centre it; plate plane → XZ, thickness along Y
  geometry.translate(0, 0, -depth / 2);
  geometry.rotateX(-Math.PI / 2);
  geometry.computeVertexNormals();
  return geometry;
}

// Deterministic PRNG so every visit scatters the plates the same way
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);

export default function HeroSculpture({ className = '' }: HeroSculptureProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Software-emulated WebGL (hardware acceleration off / blocklisted GPU)
    // would freeze the tab: the hero shows its type on black instead
    if (getGpuTier() === 'none') return;
    // Low-end devices start without AO/shadows/MSAA at 1x; everyone else
    // starts at full quality and steps down only if frames actually get slow
    const lowEnd = isLowEndDevice();

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !lowEnd,
        alpha: true,
        powerPreference: 'high-performance',
        failIfMajorPerformanceCaveat: true,
      });
    } catch {
      return; // No (hardware) WebGL: the hero shows its type on black
    }
    renderer.setPixelRatio(lowEnd ? 1 : Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.7;
    renderer.shadowMap.enabled = !lowEnd;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    const canvas = renderer.domElement;
    // GPU driver reset / out of GPU memory: switch the page to lite mode
    // (HeroBackdrop unmounts this component) instead of a dead black canvas
    const onContextLost = (e: Event) => {
      e.preventDefault();
      setLite('webgl-context-lost');
    };
    canvas.addEventListener('webglcontextlost', onContextLost);
    canvas.style.cssText = 'display:block;width:100%;height:100%;opacity:0;transition:opacity 1.6s ease;';
    container.appendChild(canvas);

    const scene = new THREE.Scene();
    // Transparent background: the hero's own #090909 shows through, so tone
    // mapping in the post-processing chain can't shift the black
    renderer.setClearColor(0x000000, 0);
    // The far side of the helix sinks into the black, like depth haze
    scene.fog = new THREE.Fog(0x090909, 10, 19);

    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);

    // Ambient occlusion: scene → GTAO (soft contact darkening in gaps/creases)
    // → output (tone mapping + colour space)
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const gtao = new GTAOPass(scene, camera, 1, 1);
    gtao.updateGtaoMaterial({ radius: 0.7, distanceExponent: 1.1, thickness: 2, scale: 1.6, samples: 16 });
    gtao.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 6, rings: 2, samples: 16 });
    gtao.blendIntensity = 1.6; // deep shadow in the bends and between plates
    gtao.enabled = !lowEnd;
    composer.addPass(gtao);
    composer.addPass(new OutputPass());

    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTexture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTexture;

    // Soft overhead key casts the plate-on-plate shadows; cool rim picks out
    // the rounded edges against the black
    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(2.5, 7, 4);
    key.castShadow = true;
    key.shadow.mapSize.set(lowEnd ? 1024 : 2048, lowEnd ? 1024 : 2048);
    key.shadow.camera.left = -6;
    key.shadow.camera.right = 6;
    key.shadow.camera.top = 10;
    key.shadow.camera.bottom = -10;
    key.shadow.camera.near = 0.5;
    key.shadow.camera.far = 25;
    key.shadow.bias = -0.0006;
    key.shadow.normalBias = 0.02;
    key.shadow.radius = 4;
    const rim = new THREE.DirectionalLight(0xdde6ff, 0.7);
    rim.position.set(-5, 2, -4);
    const fill = new THREE.HemisphereLight(0x4a4d54, 0x000000, 0.08);
    scene.add(key, rim, fill);


    // --- Spine ---------------------------------------------------------------
    const spinePoints: THREE.Vector3[] = [];
    const SAMPLES = 80;
    for (let i = 0; i <= SAMPLES; i++) {
      const t = i / SAMPLES;
      const a = t * SPINE_TURNS * Math.PI * 2 + 0.9;
      spinePoints.push(
        // Mirrored helix: sweeps top-left → centre → out bottom-right
        new THREE.Vector3(-Math.sin(a) * SPINE_RADIUS, (0.5 - t) * SPINE_HEIGHT, Math.cos(a) * SPINE_RADIUS)
      );
    }
    const spine = new THREE.CatmullRomCurve3(spinePoints);
    const frames = spine.computeFrenetFrames(PLATE_COUNT - 1, false);

    // --- Plates --------------------------------------------------------------
    const plateGeometry = buildPlateGeometry();
    const material = new THREE.MeshStandardMaterial({
      // Fully matte: no gloss or sheen, just soft diffuse shading
      color: 0x000000,
      metalness: 0,
      roughness: 1,
      envMapIntensity: 0.12,
    });
    // Per-plate edge glow (0–1), strongest at grazing angles so it reads as
    // light catching the bevelled edges rather than the face turning white
    const glow = new Float32Array(PLATE_COUNT);
    const glowAttr = new THREE.InstancedBufferAttribute(glow, 1);
    glowAttr.setUsage(THREE.DynamicDrawUsage);
    plateGeometry.setAttribute('aGlow', glowAttr);
    const edgeLight = new THREE.Color(EDGE_LIGHT).multiplyScalar(EDGE_GLOW);
    material.onBeforeCompile = (shader) => {
      shader.uniforms.uEdgeLight = { value: edgeLight };
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\nattribute float aGlow;\nvarying float vGlow;')
        .replace('#include <begin_vertex>', '#include <begin_vertex>\nvGlow = aGlow;');
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', '#include <common>\nuniform vec3 uEdgeLight;\nvarying float vGlow;')
        .replace(
          '#include <emissivemap_fragment>',
          `#include <emissivemap_fragment>
          float edge = 1.0 - abs(dot(normal, normalize(vViewPosition)));
          totalEmissiveRadiance += uEdgeLight * vGlow * (0.12 + 1.4 * edge * edge);`
        );
    };
    const plates = new THREE.InstancedMesh(plateGeometry, material, PLATE_COUNT);
    plates.castShadow = true;
    plates.receiveShadow = true;

    // Home pose of each plate on the helix, and where it starts the intro
    const homePos: THREE.Vector3[] = [];
    const homeQuat: THREE.Quaternion[] = [];
    const scatterPos: THREE.Vector3[] = [];
    const scatterQuat: THREE.Quaternion[] = [];
    const scatterSwirl = new Float32Array(PLATE_COUNT);
    const assembleAt = new Float32Array(PLATE_COUNT); // s each plate sets off
    // Unit vector from the helix axis out through each plate (wave push)
    const radial: THREE.Vector3[] = [];
    const rand = mulberry32(7);

    const matrix = new THREE.Matrix4();
    const xAxis = new THREE.Vector3();
    const yAxis = new THREE.Vector3();
    const zAxis = new THREE.Vector3();
    const tmp = new THREE.Vector3();
    const tiltCos = Math.cos(PLATE_TILT);
    const tiltSin = Math.sin(PLATE_TILT);
    for (let i = 0; i < PLATE_COUNT; i++) {
      const s = i / (PLATE_COUNT - 1);
      const tangent = frames.tangents[i];
      const angle = s * TWIST_TURNS * Math.PI * 2;
      xAxis
        .copy(frames.normals[i])
        .multiplyScalar(Math.cos(angle))
        .addScaledVector(frames.binormals[i], Math.sin(angle));
      zAxis.crossVectors(xAxis, tangent).normalize();
      // Tip the plate about its long axis so its broad face turns toward us
      yAxis.copy(tangent).multiplyScalar(tiltCos).addScaledVector(zAxis, tiltSin);
      tmp.copy(zAxis).multiplyScalar(tiltCos).addScaledVector(tangent, -tiltSin);
      zAxis.copy(tmp);
      matrix.makeBasis(xAxis, yAxis, zAxis);
      const home = spine.getPointAt(s);
      homePos.push(home);
      homeQuat.push(new THREE.Quaternion().setFromRotationMatrix(matrix));
      radial.push(new THREE.Vector3(home.x, 0, home.z).normalize());

      // Thrown outward from the axis and up/down, tumbling
      const dir = new THREE.Vector3(home.x, (rand() - 0.5) * 3, home.z).normalize();
      dir.x += (rand() - 0.5) * 0.8;
      dir.z += (rand() - 0.5) * 0.8;
      // Mostly sideways and up/down: plates thrown at the camera fill the screen
      dir.z *= 0.35;
      dir.normalize();
      scatterPos.push(home.clone().addScaledVector(dir, SCATTER_MIN + rand() * (SCATTER_MAX - SCATTER_MIN)));
      scatterQuat.push(
        new THREE.Quaternion().setFromEuler(
          new THREE.Euler((rand() - 0.5) * Math.PI * 2, (rand() - 0.5) * Math.PI * 2, (rand() - 0.5) * Math.PI)
        )
      );
      scatterSwirl[i] = (0.6 + rand() * 0.4) * SCATTER_SWIRL;
      // The helix builds out from its middle, with a little jitter
      const fromMiddle = Math.abs(s - 0.5) * 2;
      assembleAt[i] = ASSEMBLE_DELAY + ASSEMBLE_STAGGER * (0.75 * fromMiddle + 0.25 * rand());
    }

    // spinner rotates about the helix axis; tilt leans the whole form back
    const spinner = new THREE.Group();
    spinner.add(plates);
    const sculpture = new THREE.Group();
    sculpture.rotation.set(SPINE_TILT, 0, SPINE_SLANT);
    sculpture.add(spinner);
    scene.add(sculpture);
    // Scattered and waving plates leave the rest-pose bounds
    plates.frustumCulled = false;

    // --- Plate poses: intro flight + cursor wave -----------------------------
    const open = new Float32Array(PLATE_COUNT); // wave spring position
    const openVel = new Float32Array(PLATE_COUNT); // wave spring velocity
    const pos = new THREE.Vector3();
    const quat = new THREE.Quaternion();
    const flip = new THREE.Quaternion();
    const unitScale = new THREE.Vector3(1, 1, 1);
    const X_AXIS = new THREE.Vector3(1, 0, 0);
    const Y_AXIS = new THREE.Vector3(0, 1, 0);
    let introT = reduceMotion ? ASSEMBLE_END : 0;

    function writePlates() {
      for (let i = 0; i < PLATE_COUNT; i++) {
        const e = easeOutQuart(Math.min(Math.max((introT - assembleAt[i]) / ASSEMBLE_DURATION, 0), 1));
        if (e < 1) {
          pos.lerpVectors(scatterPos[i], homePos[i], e).applyAxisAngle(Y_AXIS, (1 - e) * scatterSwirl[i]);
          quat.slerpQuaternions(scatterQuat[i], homeQuat[i], e);
        } else {
          pos.copy(homePos[i]);
          quat.copy(homeQuat[i]);
        }
        const o = open[i];
        if (o !== 0) {
          // Riffle about the plate's own cross axis and lean out from the spine
          pos.addScaledVector(radial[i], o * WAVE_LIFT);
          quat.multiply(flip.setFromAxisAngle(X_AXIS, o * WAVE_ANGLE));
        }
        matrix.compose(pos, quat, unitScale);
        plates.setMatrixAt(i, matrix);
        glow[i] = Math.min(Math.max(o, 0), 1);
      }
      plates.instanceMatrix.needsUpdate = true;
      glowAttr.needsUpdate = true;
    }
    writePlates();

    // Pointer, in client px. Mouse/pen only: on touch the finger is scrolling
    const pointer = { x: 0, y: 0, active: false, energy: 0, t: 0 };
    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      const now = performance.now();
      if (pointer.active && now > pointer.t) {
        const speed = Math.hypot(e.clientX - pointer.x, e.clientY - pointer.y) / ((now - pointer.t) / 1000);
        pointer.energy = Math.max(pointer.energy, Math.min(speed / WAVE_SPEED_REF, 1));
      }
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.t = now;
      pointer.active = true;
    };
    const onPointerOut = (e: PointerEvent) => {
      if (!e.relatedTarget) pointer.active = false; // left the window
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('pointerout', onPointerOut);

    // Advance each plate's spring toward how close the pointer is to it on
    // screen; returns whether any plate is still moving
    function stepWave(dt: number) {
      // The wave wakes up only as the helix finishes assembling
      const ready = Math.min(Math.max((introT - (ASSEMBLE_END - 0.8)) / 0.8, 0), 1);
      const strength = pointer.active ? ready * (0.35 + 0.65 * pointer.energy) : 0;
      // Idle pulse fades in once the pointer has rested, out when it moves
      const resting = !pointer.active || performance.now() - pointer.t > IDLE_AFTER * 1000;
      idleMix += ((resting ? 1 : 0) - idleMix) * (1 - Math.exp(-dt * (resting ? 1.5 : 6)));
      idleT += dt;
      // Pulse centre runs a little past both ends so it enters and leaves cleanly
      const cycle = (idleT % IDLE_PERIOD) / IDLE_TRAVEL;
      const pulseAt = cycle <= 1 ? -IDLE_WIDTH + cycle * (1 + IDLE_WIDTH * 2) : -1;
      const idleStrength = ready * idleMix * IDLE_STRENGTH;
      const rect = container!.getBoundingClientRect();
      const px = pointer.x - rect.left;
      const py = pointer.y - rect.top;
      if (strength > 0) plates.updateWorldMatrix(true, false);
      let moving = false;
      for (let i = 0; i < PLATE_COUNT; i++) {
        let target = 0;
        if (strength > 0) {
          pos.copy(homePos[i]).applyMatrix4(plates.matrixWorld).project(camera);
          const d = Math.hypot((pos.x * 0.5 + 0.5) * rect.width - px, (0.5 - pos.y * 0.5) * rect.height - py);
          if (d < WAVE_RADIUS) {
            const f = 1 - d / WAVE_RADIUS;
            target = f * f * (3 - 2 * f) * strength;
          }
        }
        if (idleStrength > 0 && pulseAt >= 0 - IDLE_WIDTH) {
          const d = Math.abs(i / (PLATE_COUNT - 1) - pulseAt) / IDLE_WIDTH;
          if (d < 1) {
            const f = 1 - d;
            target = Math.max(target, f * f * (3 - 2 * f) * idleStrength);
          }
        }
        openVel[i] += (WAVE_STIFFNESS * (target - open[i]) - WAVE_DAMPING * openVel[i]) * dt;
        open[i] += openVel[i] * dt;
        if (target === 0 && Math.abs(open[i]) < 1e-4 && Math.abs(openVel[i]) < 1e-3) {
          open[i] = 0;
          openVel[i] = 0;
        } else {
          moving = true;
        }
      }
      return moving;
    }

    let idleT = 0;
    let idleMix = 0;

    const camBase = new THREE.Vector3();
    const camTarget = new THREE.Vector3(0, 0.4, 0);
    let driftX = 0;
    let driftY = 0;

    function fit() {
      const w = container!.clientWidth;
      const h = container!.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      composer.setSize(w, h);
      camera.aspect = w / h;
      const wide = w / h >= 1;
      // Looking down ~30° so the plates show their broad lit top faces
      const dist = wide ? 11 : 15.5;
      camBase.set(0, dist * 0.55, dist);
      camera.position.set(camBase.x + driftX, camBase.y + driftY, camBase.z);
      camera.lookAt(camTarget);
      sculpture.position.x = wide ? OFFSET_X_WIDE : 0;
      sculpture.position.y = OFFSET_Y;
      camera.updateProjectionMatrix();
    }
    // Without AO the composer only adds a full-screen copy pass; render
    // straight to the canvas (the renderer applies tone mapping itself)
    const render = () => (gtao.enabled ? composer.render() : renderer.render(scene, camera));
    const resizeObserver = new ResizeObserver(() => {
      fit();
      render();
    });
    resizeObserver.observe(container);
    fit();
    render();
    // Fade in after the first frame (forced reflow; rAF never fires in
    // background tabs)
    void canvas.offsetWidth;
    canvas.style.opacity = '1';

    let visible = true;
    const io = new IntersectionObserver(([entry]) => {
      const wasVisible = visible;
      visible = entry.isIntersecting;
      // Restart the loop only when it has fully stopped
      if (visible && !wasVisible && rafId === 0) {
        last = performance.now();
        rafId = requestAnimationFrame(loop);
      }
    });
    io.observe(container);

    // Quality governor: 0 = full, 1 = no AO, 2 = no shadows, 3 = 1x pixel ratio
    let quality = lowEnd ? 2 : 0;
    let sampleSum = 0;
    let sampleCount = 0;
    let slowAtFloor = 0;
    const stepDownQuality = () => {
      quality++;
      if (quality === 1) gtao.enabled = false;
      if (quality === 2) {
        renderer.shadowMap.enabled = false;
        material.needsUpdate = true;
      }
      if (quality === 3) {
        renderer.setPixelRatio(1);
        fit();
      }
    };

    let rafId = 0;
    let spin = 0;
    let scrollTurn = 0;
    let platesDirty = false;
    let last = performance.now();
    const loop = (now: number) => {
      const frameMs = now - last;
      const dt = Math.min(frameMs / 1000, 0.1);
      last = now;
      // Stop the loop completely when off-screen or motion reduced.
      // IntersectionObserver above restarts it when visible again.
      if (!visible || reduceMotion) {
        rafId = 0;
        return;
      }
      // Measure the real frame time (not the clamped dt), so a GPU taking
      // seconds per frame is noticed immediately
      if (quality < 3) {
        if (frameMs > STALL_FRAME_MS) {
          stepDownQuality();
          sampleSum = 0;
          sampleCount = 0;
        } else {
          sampleSum += frameMs;
          if (++sampleCount >= SAMPLE_MIN_FRAMES && sampleSum >= SAMPLE_WINDOW_MS) {
            if (sampleSum / sampleCount > SLOW_FRAME_MS) stepDownQuality();
            sampleSum = 0;
            sampleCount = 0;
          }
        }
      } else if (frameMs > GIVE_UP_FRAME_MS) {
        // Lowest quality and still struggling: this device can't run the
        // page's effects — switch everything to lite
        if (++slowAtFloor >= 20) {
          rafId = 0;
          setLite('hero-slow');
          return;
        }
      } else {
        slowAtFloor = 0;
      }
      spin += SPIN_SPEED * dt;
      scrollTurn += (window.scrollY * SCROLL_TURN - scrollTurn) * 0.08;
      spinner.rotation.y = spin + scrollTurn;

      // Camera sways a little toward the pointer
      const w = container!.clientWidth || 1;
      const h = container!.clientHeight || 1;
      const nx = pointer.active ? (pointer.x / w) * 2 - 1 : 0;
      const ny = pointer.active ? (pointer.y / h) * 2 - 1 : 0;
      const ease = 1 - Math.exp(-dt * 2.5);
      driftX += (nx * CAMERA_DRIFT - driftX) * ease;
      driftY += (-ny * CAMERA_DRIFT * 0.6 - driftY) * ease;
      camera.position.set(camBase.x + driftX, camBase.y + driftY, camBase.z);
      camera.lookAt(camTarget);

      const assembling = introT < ASSEMBLE_END;
      if (assembling) introT = Math.min(introT + dt, ASSEMBLE_END);
      pointer.energy *= Math.exp(-dt * 2.5);
      const waving = stepWave(dt);
      // One extra write after things settle, so the rest pose lands exactly
      if (assembling || waving || platesDirty) {
        writePlates();
        platesDirty = assembling || waving;
      }
      render();
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerout', onPointerOut);
      resizeObserver.disconnect();
      io.disconnect();
      gtao.dispose();
      composer.dispose();
      plateGeometry.dispose();
      material.dispose();
      plates.dispose();
      envTexture.dispose();
      pmrem.dispose();
      renderer.dispose();
      canvas.remove();
    };
  }, []);

  return <div ref={containerRef} className={className} aria-hidden="true" />;
}
