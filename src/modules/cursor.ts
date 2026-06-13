/* ============================================================
   Custom cursor — a smoothed dot + ring that grows and shows a
   label over interactive elements ([data-cursor], links, buttons).
   Disabled on touch / reduced-motion (handled in CSS + guard here).
   ============================================================ */
import { damp, isTouch, prefersReducedMotion } from '../core/utils';
import { gsap } from '../core/scroll';

export function initCursor(): void {
  if (isTouch() || prefersReducedMotion()) return;

  const cursor = document.getElementById('cursor');
  const label = document.getElementById('cursor-label');
  if (!cursor || !label) return;

  const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  const pos = { ...target };

  window.addEventListener(
    'pointermove',
    (e) => {
      target.x = e.clientX;
      target.y = e.clientY;
    },
    { passive: true },
  );

  // Smooth follow using GSAP's ticker (shared clock).
  gsap.ticker.add(() => {
    const dt = gsap.ticker.deltaRatio() / 60;
    pos.x = damp(pos.x, target.x, 18, dt);
    pos.y = damp(pos.y, target.y, 18, dt);
    cursor.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
  });

  // Hover state on interactive elements.
  const interactive = 'a, button, [data-cursor], [data-service], input, select, textarea';
  document.querySelectorAll<HTMLElement>(interactive).forEach((el) => {
    el.addEventListener('pointerenter', () => {
      const text = el.dataset.cursor;
      cursor.classList.add('is-hover');
      if (text) {
        label.textContent = text;
        cursor.classList.add('is-label');
      }
    });
    el.addEventListener('pointerleave', () => {
      cursor.classList.remove('is-hover', 'is-label');
    });
  });
}
