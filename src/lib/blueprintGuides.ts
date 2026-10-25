// ---------------------------------------------------------------------------
// Blueprint construction lines
// The thin construction lines a blueprint (BlueprintDrawing) is set out on: the
// ground, the main levels and the main verticals, run right across the sheet.
// Shared with the Approach hero's skeleton S (SkeletonMorph), whose lines
// come loose and fly onto exactly these.
// ---------------------------------------------------------------------------

export interface BlueprintData {
  w: number;
  h: number;
  v: string;
  ground: number[];
  building: number[];
  lines: number[][];
  outline: number[][][];
}

export interface Guide {
  /** In the image's own pixels */
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  horizontal: boolean;
  /** Draw order, 0 → 1 */
  order: number;
}

export function blueprintGuides(data: BlueprintData): Guide[] {
  const { w, h, lines, outline, ground } = data;
  const hs = lines.filter((l) => l[1] === l[3]).sort((a, b) => b[2] - b[0] - (a[2] - a[0]));
  const vs = lines.filter((l) => l[0] === l[2]).sort((a, b) => b[3] - b[1] - (a[3] - a[1]));
  const ys: number[] = [ground[1]];
  const top = Math.min(...outline.flat().map((p) => p[1]));
  ys.push(top);
  for (const l of hs) {
    if (ys.length >= 6) break;
    if (ys.every((y) => Math.abs(y - l[1]) > 40)) ys.push(l[1]);
  }
  const xs: number[] = [w / 2, data.building[0] + 10, data.building[1] - 10];
  for (const l of vs) {
    if (xs.length >= 7) break;
    if (xs.every((x) => Math.abs(x - l[0]) > 60)) xs.push(l[0]);
  }
  return [
    ...ys.map((y, i) => ({
      x1: 0,
      y1: y,
      x2: w,
      y2: y,
      horizontal: true,
      order: i / ys.length,
    })),
    ...xs.map((x, i) => ({
      x1: x,
      y1: h,
      x2: x,
      y2: 0,
      horizontal: false,
      order: i / xs.length,
    })),
  ];
}

/** The hand-off from the skeleton S: while `active`, the blueprint shows its
 *  construction lines as `reveal` (0 → 1) says, instead of drawing them in
 *  during Diagnose */
export const guideHandoff = { active: false, reveal: 0 };
