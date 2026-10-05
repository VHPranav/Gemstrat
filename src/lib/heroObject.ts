import * as THREE from 'three';

// ---------------------------------------------------------------------------
// heroObject
// The object in the centre of the hero (BlastScene). To change it, swap the
// body of createHeroObject(); nothing else has to change.
//
// The scene shatters every geometry returned here into panels (triangles
// grouped by face direction), so any closed mesh blasts apart and reassembles:
// an ExtrudeGeometry from an SVG logo, a loaded GLTF mesh's geometry, etc.
// ---------------------------------------------------------------------------

export interface HeroObject {
  /** Pieces of the object, in object space, roughly centred on the origin
   *  and ~2.6 units tall. Each piece bobs on its own phase while idle. */
  parts: THREE.BufferGeometry[];
}

// The "S" of the Gemstrat wordmark (gems.svg, viewBox units, y down): a top
// bar, a bottom bar, two short stubs and the diagonal between them. Stubs are
// trimmed to meet the bars instead of overlapping them, so no faces coincide.
export const S_PIECES: [number, number][][] = [
  // top bar
  [[70.948, 0], [94.147, 0], [94.147, 4], [70.948, 4]],
  // bottom bar
  [[70.948, 19.878], [94.147, 19.878], [94.147, 23.879], [70.948, 23.879]],
  // left stub, hanging from the top bar
  [[70.952, 4], [75.048, 4], [75.048, 10.142], [70.952, 10.142]],
  // diagonal
  [[75.048, 4], [90.05, 13.749], [90.05, 19.878], [75.048, 10.13]],
  // right stub, rising from the bottom bar
  [[90.054, 13.736], [94.151, 13.736], [94.151, 19.878], [90.054, 19.878]],
];
export const S_CENTER = { x: 82.55, y: 11.94 };
/** The S's height in object space (it spans the wordmark's 23.879-unit band) */
export const S_HEIGHT = 2.6;
const S_SCALE = S_HEIGHT / 23.879;
const DEPTH = 0.42;
const EXTRUDE: THREE.ExtrudeGeometryOptions = {
  depth: DEPTH,
  bevelEnabled: true,
  bevelThickness: 0.008,
  bevelSize: 0.006,
  bevelSegments: 1,
};

export function createHeroObject(): HeroObject {
  // Mirrored horizontally (x negated) so the S reads as a Z; y flips from
  // SVG's down to three.js's up
  const flat = S_PIECES.map((piece) =>
    piece.map(([x, y]) => new THREE.Vector2(-(x - S_CENTER.x) * S_SCALE, -(y - S_CENTER.y) * S_SCALE))
  );
  const parts = flat.map((points) => {
    const shape = new THREE.Shape(points);
    const geo = new THREE.ExtrudeGeometry(shape, EXTRUDE);
    geo.translate(0, 0, -DEPTH / 2);
    return geo;
  });

  return { parts };
}
