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
    const plates = new THREE.InstancedMesh(plateGeometry, material, PLATE_COUNT);
    plates.castShadow = true;
    plates.receiveShadow = true;

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
      matrix.setPosition(spine.getPointAt(s));
      plates.setMatrixAt(i, matrix);
    }
    plates.instanceMatrix.needsUpdate = true;

    // spinner rotates about the helix axis; tilt leans the whole form back
    const spinner = new THREE.Group();
    spinner.add(plates);
    const sculpture = new THREE.Group();
    sculpture.rotation.set(SPINE_TILT, 0, SPINE_SLANT);
    sculpture.add(spinner);
    scene.add(sculpture);

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
      camera.position.set(0, dist * 0.55, dist);
      camera.lookAt(0, 0.4, 0);
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
      render();
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      canvas.removeEventListener('webglcontextlost', onContextLost);
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
