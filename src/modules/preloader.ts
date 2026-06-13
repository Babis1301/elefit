/* ============================================================
   Preloader — shows progress while fonts + first paint settle,
   then reveals the site. Resolves a promise the entry point awaits
   before kicking off the hero intro animation.
   ============================================================ */
import { gsap } from '../core/scroll';

export function runPreloader(): Promise<void> {
  const el = document.getElementById('preloader');
  const fill = document.getElementById('preloader-fill');
  const count = document.getElementById('preloader-count');
  if (!el || !fill || !count) return Promise.resolve();

  return new Promise((resolve) => {
    const state = { v: 0 };
    const minTime = 0.9; // keep the brand mark on screen at least this long

    // Gate completion on fonts being ready so headings don't reflow.
    const fontsReady = (document as Document & { fonts?: FontFaceSet }).fonts?.ready ?? Promise.resolve();

    const tl = gsap.timeline();
    tl.to(state, {
      v: 100,
      duration: 1.6,
      ease: 'power2.inOut',
      onUpdate: () => {
        const v = Math.round(state.v);
        fill.style.width = `${v}%`;
        count.textContent = `${v}`;
      },
    });

    Promise.all([fontsReady, tl.then(), gsap.delayedCall(minTime, () => {})]).then(() => {
      gsap.to(el, {
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out',
        onStart: () => el.classList.add('is-done'),
        onComplete: () => {
          el.remove();
          resolve();
        },
      });
    });
  });
}
