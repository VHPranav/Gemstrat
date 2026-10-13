import * as THREE from 'three';
import { S_PIECE_SHADES } from '@/lib/heroObject';

// ---------------------------------------------------------------------------
// zLook
// How the 3D Z looks wherever it's drawn (the hero's BlastScene and the Z
// menu): monochrome studio lights with orbiting glints, reflections of a dim
// studio backdrop, and the two-tone glass — near-black bars with a charcoal
// diagonal, like the logo.
// ---------------------------------------------------------------------------

export const Z_BG = 0x090909;

// Two-tone glass, like the logo (white bars, grey diagonal): the pieces that
// aren't white in the wordmark get a charcoal — still black, a shade lighter
// than the near-black bars
const ACCENT_COLOR = 0x4a4c50;
const ACCENT_EMISSIVE = 0x232427;
// A little less metallic than the bars, so its own shade shows under the
// lights instead of only reflecting the dark scene
const ACCENT_METALNESS = 0.75;

/** Grey rim lights from every side, plus white point lights that orbit (see
 *  moveZGlints) and throw moving glints across the glass */
export function addZLights(scene: THREE.Scene) {
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
  const glints = [
    new THREE.PointLight(0xffffff, 7 * Math.PI, 22, 1),
    new THREE.PointLight(0xd8d8d8, 5 * Math.PI, 20, 1),
    new THREE.PointLight(0xeeeeee, 3.5 * Math.PI, 14, 1),
  ];
  glints[0].position.set(3, -1, 3);
  glints[1].position.set(-3, 2, -2);
  glints[2].position.set(0, 4, 3);
  scene.add(...glints);
  return glints;
}

/** Orbit the first two glints (seconds) */
export function moveZGlints(glints: THREE.PointLight[], t: number) {
  glints[0].position.set(4 * Math.sin(0.6 * t), 2 * Math.cos(0.4 * t), 3 * Math.cos(0.5 * t) + 2);
  glints[1].position.set(4 * Math.cos(0.5 * t), 2 * Math.sin(0.7 * t), 3 * Math.sin(0.3 * t) - 1);
}

/** A reflection probe for the glass. It sees the scene plus a dim studio
 *  backdrop (layer 1, invisible to the main camera): soft grey gradient with
 *  a few softboxes, so the metal facets catch light while the visible
 *  background stays black. Call `update` with the logo hidden. */
export function createZReflections(scene: THREE.Scene) {
  const cubeRT = new THREE.WebGLCubeRenderTarget(256, {
    generateMipmaps: true,
    minFilter: THREE.LinearMipmapLinearFilter,
  });
  const cubeCamera = new THREE.CubeCamera(0.1, 100, cubeRT);
  scene.add(cubeCamera);

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

  return {
    texture: cubeRT.texture,
    update: (renderer: THREE.WebGLRenderer) => cubeCamera.update(renderer, scene),
    dispose: () => {
      studioTex.dispose();
      cubeRT.dispose();
    },
  };
}

/** The logo's glass */
export function createZMaterial(envMap: THREE.Texture) {
  return new THREE.MeshPhysicalMaterial({
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
    envMap,
    envMapIntensity: 3,
    side: THREE.DoubleSide,
  });
}

/** Gives the logo's grey piece (the diagonal) its own shade of glass. Takes
 *  the piece's index in S_PIECES; leaves the white pieces as they are. */
export function applyZShade(material: THREE.MeshPhysicalMaterial, part: number) {
  if ((S_PIECE_SHADES[part] ?? '#ffffff').toLowerCase() === '#ffffff') return;
  material.color.setHex(ACCENT_COLOR);
  material.emissive.setHex(ACCENT_EMISSIVE);
  material.metalness = ACCENT_METALNESS;
}
