// ---------------------------------------------------------------------------
// Menu → page handoff
// Choosing a page in the menu (ZMenu) doesn't close it the usual way: the
// links fade, the pieces fly back into the Z and fade, and only its wireframe
// skeleton stays while the new page shows underneath. A page with its own Z
// (SkeletonMorph) tells the menu where that Z sits; the menu's skeleton glides
// there (on the Approach page it is already in place) and fades as the
// page's own shows.
//
//   menu  → html[data-handoff="z"]       a handoff is in progress
//   page  → 'gemstrat:handoff-page'      the page has rendered: the menu's
//                                        backdrop fades at once, so there's no
//                                        black gap; the skeleton stays over it
//   page  → 'gemstrat:handoff-target'    where its Z is, in px (centre, height)
//   menu  → 'gemstrat:handoff-done'      the skeleton has arrived and is fading;
//                                        the page's own Z takes over
// ---------------------------------------------------------------------------

export interface HandoffTarget {
  x: number;
  y: number;
  h: number;
  /** The page supplies its own Z and should not show the menu wireframe over it. */
  hideSkeleton?: boolean;
}

export const HANDOFF_PAGE = 'gemstrat:handoff-page';
export const HANDOFF_TARGET = 'gemstrat:handoff-target';
export const HANDOFF_DONE = 'gemstrat:handoff-done';

export function isHandoffPending(): boolean {
  return typeof document !== 'undefined' && document.documentElement.dataset.handoff === 'z';
}
