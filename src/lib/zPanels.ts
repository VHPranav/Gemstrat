import * as THREE from 'three';

// ---------------------------------------------------------------------------
// zPanels
// Splits one Z piece into its flat glass face panels, the way the homepage's
// BlastScene does: triangles grouped by face direction, each panel's geometry
// centred on its own centroid, plus the direction it pulls out along (away
// from the piece's centre, biased along the face normal).
// ---------------------------------------------------------------------------

export interface ZPanel {
  geometry: THREE.BufferGeometry;
  home: THREE.Vector3;
  dir: THREE.Vector3;
}

export function splitIntoPanels(geometry: THREE.BufferGeometry): ZPanel[] {
  const geo = geometry.index ? geometry.toNonIndexed() : geometry;
  geo.computeBoundingBox();
  const center = geo.boundingBox!.getCenter(new THREE.Vector3());
  const pos = geo.attributes.position.array as ArrayLike<number>;
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
  const groups = new Map<string, { tris: number[]; normal: THREE.Vector3 }>();
  for (let i = 0; i < pos.length; i += 9) {
    a.set(pos[i], pos[i + 1], pos[i + 2]);
    b.set(pos[i + 3], pos[i + 4], pos[i + 5]);
    c.set(pos[i + 6], pos[i + 7], pos[i + 8]);
    const n = new THREE.Vector3().subVectors(c, b).cross(a.clone().sub(b)).normalize();
    const key = `${Math.round(n.x * 10)},${Math.round(n.y * 10)},${Math.round(n.z * 10)}`;
    let g = groups.get(key);
    if (!g) groups.set(key, (g = { tris: [], normal: n }));
    g.tris.push(i);
  }
  const panels: ZPanel[] = [];
  groups.forEach(({ tris, normal }) => {
    const home = new THREE.Vector3();
    tris.forEach((i) => { for (let k = 0; k < 9; k += 3) home.add(new THREE.Vector3(pos[i + k], pos[i + k + 1], pos[i + k + 2])); });
    home.divideScalar(tris.length * 3);
    const arr = new Float32Array(tris.length * 9);
    tris.forEach((i, t) => {
      for (let k = 0; k < 9; k += 3) {
        arr[t * 9 + k] = pos[i + k] - home.x;
        arr[t * 9 + k + 1] = pos[i + k + 1] - home.y;
        arr[t * 9 + k + 2] = pos[i + k + 2] - home.z;
      }
    });
    const panelGeo = new THREE.BufferGeometry();
    panelGeo.setAttribute('position', new THREE.BufferAttribute(arr, 3));
    panelGeo.computeVertexNormals();
    const out = home.clone().sub(center);
    if (out.lengthSq() < 1e-6) out.copy(normal);
    const dir = out.normalize().multiplyScalar(0.6).addScaledVector(normal, 0.4).normalize();
    panels.push({ geometry: panelGeo, home, dir });
  });
  if (geo !== geometry) geo.dispose();
  return panels;
}
