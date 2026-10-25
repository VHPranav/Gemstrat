// ---------------------------------------------------------------------------
// zSpot
// Where the wireframe S sits, in px, for a W × H viewport: on the right,
// centred top to bottom (on phones, low on the right, below the menu links).
// Shared by the menu (ZMenu) and the Approach hero (SkeletonMorph), so the S is
// in exactly the same place and size on both, and the menu can hand over to
// the page without a jump. Both draw it with the same camera (below).
// ---------------------------------------------------------------------------

export const Z_FOV = 30;
export const Z_CAMERA = 12;
/** The S's turn, to show its depth */
export const Z_TILT = 0.35;
/** The wireframe's brightness at rest */
export const Z_GHOST_OPACITY = 0.16;

export function zSpot(W: number, H: number) {
  const mobile = W < 768;
  const h = mobile ? Math.min(H * 0.2, 170) : Math.min(H * 0.56, 460);
  return mobile ? { x: W * 0.74, y: H - 30 - h / 2 - 40, h } : { x: W * 0.72, y: H / 2, h };
}
