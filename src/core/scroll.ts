/* ============================================================
   Smooth scroll — Lenis synchronized with GSAP ScrollTrigger.
   A single GSAP ticker drives Lenis so scroll, ScrollTrigger and
   the WebGL render loop all share one clock (no jank / double RAF).
   ============================================================ */
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from './utils';

gsap.registerPlugin(ScrollTrigger);

export interface ScrollContext {
  lenis: Lenis;
}

export function initSmoothScroll(): ScrollContext {
  const reduced = prefersReducedMotion();

  const lenis = new Lenis({
    duration: 1.1,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // expo out
    smoothWheel: !reduced,
    wheelMultiplier: 1,
    touchMultiplier: 1.6,
  });

  // Keep ScrollTrigger in sync on every Lenis scroll event.
  lenis.on('scroll', ScrollTrigger.update);

  // Drive Lenis from GSAP's ticker — one source of truth for time.
  gsap.ticker.add((time: number) => {
    lenis.raf(time * 1000); // gsap ticker time is in seconds
  });
  gsap.ticker.lagSmoothing(0);

  return { lenis };
}

export { gsap, ScrollTrigger };
