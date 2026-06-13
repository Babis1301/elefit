/* ============================================================
   Methodology — pinned horizontal scroll. The track translates on
   the X axis while the section is pinned. On reduced-motion or small
   screens it degrades to a normal horizontally-scrollable row.
   ============================================================ */
import { gsap } from '../core/scroll';
import { prefersReducedMotion } from '../core/utils';

export function initMethod(): void {
  const pin = document.getElementById('method-pin');
  const track = document.getElementById('method-track');
  if (!pin || !track) return;

  // Fallback: native horizontal scroll for touch / reduced motion / small.
  if (prefersReducedMotion() || window.innerWidth < 800) {
    track.style.overflowX = 'auto';
    track.style.scrollSnapType = 'x mandatory';
    return;
  }

  const getDistance = (): number => track.scrollWidth - window.innerWidth + 64;

  gsap.to(track, {
    x: () => -getDistance(),
    ease: 'none',
    scrollTrigger: {
      trigger: pin,
      start: 'top top',
      end: () => `+=${getDistance()}`,
      pin: true,
      scrub: 1,
      invalidateOnRefresh: true,
      anticipatePin: 1,
    },
  });
}
