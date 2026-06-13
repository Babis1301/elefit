/* Small shared helpers. */

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

export const clamp = (v: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, v));

/** Frame-rate independent damping factor for lerp-based smoothing. */
export const damp = (current: number, target: number, lambda: number, dt: number): number =>
  lerp(current, target, 1 - Math.exp(-lambda * dt));

export const prefersReducedMotion = (): boolean =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const isTouch = (): boolean => window.matchMedia('(hover: none)').matches;

/** Detect WebGL support so we can gracefully fall back to the static DOM. */
export const isWebGLAvailable = (): boolean => {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
};

/** Cap device pixel ratio for performance (retina is expensive for shaders). */
export const cappedPixelRatio = (max = 2): number => Math.min(window.devicePixelRatio || 1, max);
