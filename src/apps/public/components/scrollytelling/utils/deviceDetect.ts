/**
 * Device detection utilities for performance optimization
 */

export function isMobile(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768 || /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
}

export function isLowPerf(): boolean {
  if (typeof navigator === 'undefined') return false;
  const cores = navigator.hardwareConcurrency || 4;
  return cores <= 4 || isMobile();
}

export function getParticleCount(base: number): number {
  if (isMobile()) return Math.floor(base * 0.3);
  if (isLowPerf()) return Math.floor(base * 0.5);
  return base;
}

export function getRouteCount(): number {
  if (isMobile()) return 3;
  return 5;
}

/** Nearby, large, individually-readable trees */
export function getNearTreeCount(): number {
  // Trees are scattered 360° around the origin (see scatterTrees in
  // ForestScene.tsx), but the camera only ever sees a ~60° FOV slice of
  // that circle — so the count needs to be above what "looks right" for a
  // full circle, or any given shot reads as empty even though the total is
  // high.
  //
  // 32 -> 18 (desktop). Every one of these is a full-detail procedural
  // EZ-Tree with its own geometry and draw call (Tree.tsx), which is what
  // made orbiting the hero feel laggy. At radius 44 they sit far enough back
  // that 18 still closes the treeline, and DistantTrees.tsx fills in behind.
  if (isMobile()) return 10;
  // Desktop machines with <=4 cores were still getting the full desktop
  // count — isLowPerf() covered mobile+weak-desktop for particles/routes but
  // was never wired into tree counts, the single heaviest per-object cost
  // (unique procedural geometry + shadow-casting per tree).
  if (isLowPerf()) return 14;
  return 20;
}

/** Distant, small trees that the forest fog fades into the background */
export function getFarTreeCount(): number {
  // 42 -> 22 (desktop), same reasoning as above: these are full-detail trees
  // too, and past ~72 units the fog is already dissolving them, so the extra
  // 20 were costing draw calls for detail the haze hides anyway.
  if (isMobile()) return 12;
  if (isLowPerf()) return 16;
  return 22;
}

/** True when the user has requested reduced motion at the OS/browser level */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
