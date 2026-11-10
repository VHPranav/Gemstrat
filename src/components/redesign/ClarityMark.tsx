'use client';

import { useEffect, useRef, type RefObject } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { createHeroObject } from '@/lib/heroObject';
import { splitIntoPanels } from '@/lib/zPanels';
import { addZLights, createZReflections, createZMaterial, applyZShade, moveZGlints } from '@/lib/zLook';

const clamp = (n: number) => Math.max(0, Math.min(1, n));
const smooth = (n: number) => { const t = clamp(n); return t * t * (3 - 2 * t); };

// Opening (progress p): the five solid glass pieces blur in at scattered spots,
// drift and tumble, then join one by one into the slanted 3D Z during the
// three statements. The order is shuffled so it never reads top-to-bottom.
const JOIN_ORDER = [2, 0, 4, 1, 3];
const SCATTER = [ // direction (x, y, z) and tumble (rx, ry, rz) per piece
  [-1.15, .85, 1.2, .9, -1.3, .5], [1.2, -.9, -1.4, -1.1, .8, -.6], [-1.3, -.55, .9, .7, 1.1, -.9],
  [1.05, 1.1, -1, -.8, -1, .7], [1.35, .2, 1.6, 1.2, .6, .4],
];
const REVEAL_STEP = .035, REVEAL_LEN = .07;

/** How the Z forms over the opening (progress p). 'scatter' (purpose): pieces
 *  join slowly across three statements. 'wireframe' (approach): pieces float
 *  through step 01, a thin wireframe Z draws in on step 02, the glass locks
 *  into it on step 03 and the outline fades once the Z is solid on step 04. */
export type ZBuild = 'scatter' | 'wireframe';
const BUILDS = {
  scatter: { revealAt: .2, joinAt: .27, joinStep: .08, joinLen: .22, sharpAt: .84, wireIn: 0, wireOut: 0 },
  wireframe: { revealAt: .2, joinAt: .54, joinStep: .035, joinLen: .13, sharpAt: .74, wireIn: .38, wireOut: .82 },
};
// Depth of field while blurred: each piece sits at its own depth, so it gets
// its own blur (px at full strength); far and near pieces blur the most
const PIECE_BLUR = [14, 5, 9, 6, 18];
// As a piece joins the Z it moves onto one shared focal plane: this blur
const JOINED_BLUR = 10;
// While blasted apart the flying glass softens (px at full blast, per piece)
// and fades back, so the wireframe and the copy lead
const BLAST_BLUR = [7, 4, 6, 5, 9];
const BLAST_OPACITY = .18;

// After the closing line (raw/q from the scene): the homepage's glass
// separation. Face panels pull a little apart in a wave, showing the
// wireframe, then settle back before the practice cards.
// Homepage blast values (BlastScene): how far panels fly at full blast, and
// each panel's random spin and start delay
const EXPLODE_DIST = 9; // further than the homepage (5.5), so most glass clears the viewport
let seed = 7;
const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const EDGE_COLOR = 0x111111, EDGE_OPACITY = .35;

type Phase = { raw: number; q: number };

export default function ClarityMark({ progress, phase, build = 'scatter' }: { progress: RefObject<number>; phase?: RefObject<Phase>; build?: ZBuild }) {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' }); } catch { return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1; // same as the homepage BlastScene
    renderer.setClearColor(0, 0);
    el.appendChild(renderer.domElement);
    // One 2D layer per piece, each blurred on its own, used only while blurred
    const layers = PIECE_BLUR.map(() => {
      const c = document.createElement('canvas');
      Object.assign(c.style, { position: 'absolute', inset: '0', width: '100%', height: '100%', pointerEvents: 'none', display: 'none' });
      el.appendChild(c);
      return { canvas: c, ctx: c.getContext('2d')! };
    });
    // The 3D carries the whole scene, so the flat SVG fallback stays hidden
    el.parentElement?.setAttribute('data-rendered', 'true');
    el.parentElement?.style.setProperty('--solid', '1');
    const scene = new THREE.Scene();
    const glints = addZLights(scene);
    const reflections = createZReflections(scene);
    const base = createZMaterial(reflections.texture);
    const group = new THREE.Group();
    const geometries = createHeroObject().parts;
    const disposables: { dispose: () => void }[] = [];

    // Each piece is a group of its glass face panels plus a wireframe outline
    const pieces = geometries.map((geometry, i) => {
      const material = base.clone(); applyZShade(material, i);
      const piece = new THREE.Group();
      const panels = splitIntoPanels(geometry).map(p => {
        const mesh = new THREE.Mesh(p.geometry, material);
        mesh.position.copy(p.home);
        piece.add(mesh);
        disposables.push(p.geometry);
        return {
          mesh, ...p, wave: 0,
          axis: new THREE.Vector3(rand() - .5, rand() - .5, rand() - .5).normalize(),
          spin: (rand() - .5) * .45,
          delay: rand() * .25,
          fly: new THREE.Vector3(),
        };
      });
      const edgeGeo = new THREE.EdgesGeometry(geometry, 8);
      const edgeMat = new THREE.LineBasicMaterial({ color: EDGE_COLOR, transparent: true, opacity: 0, depthWrite: false });
      const edges = new THREE.LineSegments(edgeGeo, edgeMat);
      // The outline lives on the Z itself, not the piece, so it can show the
      // finished shape while the glass is still apart
      group.add(edges);
      disposables.push(material, edgeGeo, edgeMat);
      geometry.computeBoundingBox();
      group.add(piece);
      return { piece, panels, material, edgeMat, edges, opacity: material.opacity, center: geometry.boundingBox!.getCenter(new THREE.Vector3()) };
    });
    // Wave order across every panel: top left → bottom right, as on the homepage
    const allPanels = pieces.flatMap(p => p.panels).sort((m, n) => (m.home.x * .35 - m.home.y + m.home.z * .15) - (n.home.x * .35 - n.home.y + n.home.z * .15));
    allPanels.forEach((p, i) => (p.wave = allPanels.length > 1 ? i / (allPanels.length - 1) : 0));
    // Blast paths: spread every panel over its own direction on a sphere
    // (golden spiral, shuffled) so neighbouring plates never travel together,
    // and send all but a few right out of the viewport
    const NEAR_COUNT = 7;
    const slots = allPanels.map((_, i) => i).sort(() => rand() - .5);
    allPanels.forEach((pn, k) => {
      const i = slots[k], n = allPanels.length;
      const y = 1 - (i + .5) / n * 2, r = Math.sqrt(1 - y * y), a = i * 2.39996;
      const sphere = new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r);
      const dir = sphere.multiplyScalar(.75).addScaledVector(pn.dir, .25).normalize();
      // Flatten the depth a little so the spread reads across the screen
      dir.z *= .6; dir.normalize();
      const near = k < NEAR_COUNT;
      pn.fly.copy(dir).multiplyScalar(EXPLODE_DIST * (near ? .32 + rand() * .2 : 1.1 + rand() * .9));
    });

    const tumble = new THREE.Euler(), quat = new THREE.Quaternion(), pivot = new THREE.Vector3();
    scene.add(group); group.visible = false; reflections.update(renderer); group.visible = true;
    const camera = new THREE.OrthographicCamera(-5, 5, 3.5, -3.5, .1, 100);
    camera.position.z = 12;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const B = BUILDS[build];
    const JOINED = B.joinAt + B.joinStep * (JOIN_ORDER.length - 1) + B.joinLen;
    let width = 0, height = 0;
    const t0 = performance.now();
    const apartOf = PIECE_BLUR.map(() => 1);
    // Once the Z is whole it spins on its own; scrolling speeds the spin up,
    // then it eases back to the idle speed
    let spin = 0, boost = 0, lastY = window.scrollY;
    const frame = () => {
      const dt = Math.min(gsap.ticker.deltaRatio(60), 3) / 60;
      const dy = Math.abs(window.scrollY - lastY);
      lastY = window.scrollY;
      boost = Math.min(1.5, boost * Math.pow(.04, dt) + dy * .004);
      const w = el.clientWidth, h = el.clientHeight;
      if (!w || !h) return;
      if (w !== width || h !== height) {
        width = w; height = h; renderer.setSize(w, h);
        const halfH = w < 640 ? 5 : 3.5;
        camera.top = halfH; camera.bottom = -halfH; camera.left = -halfH*w/h; camera.right = halfH*w/h; camera.updateProjectionMatrix();
      }
      const p = progress.current;
      const ph = phase?.current ?? { raw: 0, q: 0 };
      const time = (performance.now() - t0) / 1000;
      const still = reduced.matches;

      // Spin only once every piece has joined; scrolling back before that,
      // it eases home to the nearest full turn
      if (p >= JOINED && !still) spin += (.22 + boost) * dt;
      else {
        const home = Math.round(spin / (Math.PI * 2)) * Math.PI * 2;
        spin += (home - spin) * Math.min(1, dt * 6);
      }
      group.rotation.set(.16, -.48 + spin, -.07);
      // Blast out after the closing line and stay apart through the practice
      // cards. The last card ("Our global presence") blurs in over q .79–.85
      // and holds; only after a little more scroll does the glass fly home
      const blast = smooth((ph.raw - .84) / .16) * (1 - smooth((ph.q - .9) / .09));
      group.scale.setScalar(1.25);

      // Approach: the wireframe Z on its own, ahead of the glass
      const wire = B.wireIn ? smooth((p - B.wireIn) / .07) * (1 - smooth((p - B.wireOut) / .05)) : 0;
      pieces.forEach((pc, i) => {
        const rank = JOIN_ORDER.indexOf(i);
        const reveal = smooth((p - B.revealAt - rank * REVEAL_STEP) / REVEAL_LEN);
        const apart = still ? 0 : 1 - smooth((p - B.joinAt - rank * B.joinStep) / B.joinLen);
        const [dx, dy, dz, rx, ry, rz] = SCATTER[i];
        // While apart, each piece keeps a slow float of its own
        // (wide, slow, never-repeating-looking drift and turn, fading out as it joins)
        const fx = (Math.sin(time * .45 + i * 1.7) * .35 + Math.sin(time * .17 + i) * .2) * apart;
        const fy = (Math.cos(time * .38 + i * 2.3) * .3 + Math.sin(time * .21 + i * .7) * .18) * apart;
        const fz = Math.sin(time * .29 + i * 1.1) * .4 * apart;
        tumble.set(
          rx * apart + Math.sin(time * .33 + i) * .7 * apart,
          ry * apart + Math.cos(time * .27 + i * 1.3) * .8 * apart,
          rz * apart + Math.sin(time * .23 + i * 2.1) * .5 * apart,
        );
        quat.setFromEuler(tumble);
        pivot.copy(pc.center).applyQuaternion(quat);
        pc.piece.position.set(dx * 2.2 * apart + fx + pc.center.x - pivot.x, dy * 1.6 * apart + fy + pc.center.y - pivot.y, dz * 1.5 * apart + fz + pc.center.z - pivot.z);
        pc.piece.rotation.copy(tumble);
        // Blur-in companion: a small scale-up as the piece arrives
        pc.piece.scale.setScalar(.82 + .18 * reveal);
        pc.material.opacity = pc.opacity * reveal * (1 - (1 - BLAST_OPACITY) * blast);

        // Glass separation after the closing line
        let most = 0;
        apartOf[i] = apart;
        // The homepage blast: panels fly out along their own direction and
        // spin, each after its own delay, while the wireframe stays put. Out
        // after the closing line, home again before the practice cards.
        pc.panels.forEach(panel => {
          const n = still ? 0 : Math.max(0, blast - panel.delay);
          most = Math.max(most, n);
          panel.mesh.position.copy(panel.home).addScaledVector(panel.fly, n);
          const sp = panel.spin * n * Math.PI;
          panel.mesh.rotation.set(panel.axis.x * sp, panel.axis.y * sp, panel.axis.z * sp);
        });
        pc.edgeMat.opacity = EDGE_OPACITY * Math.max(Math.min(1, most * 6) * reveal, wire);
      });
      // The pieces stay fully blurred until "One direction forward." blurs
      // out (the scene's third statement exits over p .84–.88), then sharpen
      const soft = still ? 0 : 1 - smooth((p - B.sharpAt) / .04);
      if (!still) moveZGlints(glints, time);
      if (soft > .005 || blast > .005) {
        // Each piece's glass alone, copied to its own layer with its own blur;
        // the wireframe stays sharp on the main canvas underneath
        const src = renderer.domElement;
        pieces.forEach((pc, i) => {
          pieces.forEach((o, j) => { o.piece.visible = i === j; o.edges.visible = false; });
          renderer.render(scene, camera);
          const { canvas, ctx } = layers[i];
          if (canvas.width !== src.width || canvas.height !== src.height) { canvas.width = src.width; canvas.height = src.height; }
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(src, 0, 0);
          canvas.style.display = 'block';
          const depthBlur = JOINED_BLUR + (PIECE_BLUR[i] - JOINED_BLUR) * apartOf[i];
          canvas.style.filter = `blur(${(depthBlur * soft + BLAST_BLUR[i] * blast).toFixed(2)}px)`;
        });
        // Main canvas: wireframe only
        pieces.forEach(o => { o.piece.visible = true; o.edges.visible = true; o.panels.forEach(pn => (pn.mesh.visible = false)); });
        renderer.render(scene, camera);
        pieces.forEach(o => o.panels.forEach(pn => (pn.mesh.visible = true)));
      } else {
        layers.forEach(l => (l.canvas.style.display = 'none'));
        renderer.render(scene, camera);
      }
    };
    gsap.ticker.add(frame);
    return () => {
      gsap.ticker.remove(frame);
      el.parentElement?.removeAttribute('data-rendered');
      el.parentElement?.style.removeProperty('--solid');
      renderer.domElement.remove();
      layers.forEach(l => l.canvas.remove());
      geometries.forEach(g => g.dispose());
      disposables.forEach(d => d.dispose());
      base.dispose(); reflections.dispose(); renderer.dispose();
    };
  }, [progress, phase, build]);
  return <div ref={host} style={{ position: 'absolute', inset: 0 }} />;
}
