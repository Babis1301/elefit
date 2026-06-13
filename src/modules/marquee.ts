/* ============================================================
   Testimonials marquee — seamless infinite horizontal loop, with a
   slight scroll-velocity skew for a kinetic feel. Pauses under
   reduced-motion (static row).
   ============================================================ */
import { gsap } from '../core/scroll';
import { prefersReducedMotion } from '../core/utils';

export function initMarquee(): void {
  const track = document.getElementById('marquee-track');
  if (!track || prefersReducedMotion()) return;

  // The track contains two identical halves; shift by 50% for a seamless loop.
  gsap.to(track, {
    xPercent: -50,
    ease: 'none',
    duration: 24,
    repeat: -1,
  });
}
