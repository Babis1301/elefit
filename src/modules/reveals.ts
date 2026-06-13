/* ============================================================
   Scroll-driven reveals: word-mask line reveals for headings,
   fade-up for body blocks, and animated stat counters.
   Respects prefers-reduced-motion (then everything is visible).
   ============================================================ */
import { gsap, ScrollTrigger } from '../core/scroll';
import { prefersReducedMotion } from '../core/utils';

/** Wrap each word of an element in a masked span for reveal animation. */
function splitWords(el: HTMLElement): HTMLElement[] {
  const words = (el.textContent ?? '').trim().split(/\s+/);
  el.textContent = '';
  const inners: HTMLElement[] = [];
  for (const word of words) {
    const mask = document.createElement('span');
    mask.className = 'word';
    const inner = document.createElement('span');
    inner.className = 'word-inner';
    inner.textContent = word;
    mask.appendChild(inner);
    el.appendChild(mask);
    el.appendChild(document.createTextNode(' '));
    inners.push(inner);
  }
  return inners;
}

export function initReveals(): void {
  if (prefersReducedMotion()) return;

  // --- Heading line/word reveals ---
  document.querySelectorAll<HTMLElement>('[data-split-lines]').forEach((heading) => {
    const inners = splitWords(heading);
    gsap.set(inners, { yPercent: 110 });
    gsap.to(inners, {
      yPercent: 0,
      duration: 1,
      ease: 'expo.out',
      stagger: 0.06,
      scrollTrigger: { trigger: heading, start: 'top 88%', once: true },
    });
  });

  // --- Generic fade-up reveals (hero reveals are handled by heroIntro) ---
  document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
    if (el.closest('.hero')) return;
    gsap.fromTo(
      el,
      { y: 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      },
    );
  });

  // --- Animated counters ---
  document.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
    const end = Number(el.dataset.count ?? '0');
    const obj = { v: 0 };
    gsap.to(obj, {
      v: end,
      duration: 1.6,
      ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 92%', once: true },
      onUpdate: () => {
        el.textContent = String(Math.round(obj.v));
      },
    });
  });

  ScrollTrigger.refresh();
}

/** Hero intro — runs once after the preloader finishes. */
export function heroIntro(): void {
  if (prefersReducedMotion()) return;

  const lines = document.querySelectorAll<HTMLElement>('.hero [data-split]');
  const fades = document.querySelectorAll<HTMLElement>('.hero [data-reveal]');

  // Wrap hero lines in masked inners.
  lines.forEach((line) => {
    const inner = document.createElement('span');
    inner.style.display = 'block';
    inner.textContent = line.textContent;
    line.textContent = '';
    line.appendChild(inner);
    gsap.set(inner, { yPercent: 120 });
    line.dataset.inner = '1';
  });

  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
  tl.to('.hero [data-split] span', { yPercent: 0, duration: 1.2, stagger: 0.12 })
    // fromTo (not from): the CSS sets opacity:0, so we must declare the
    // explicit end state of 1 or the elements would animate 0 -> 0.
    .fromTo(
      fades,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, stagger: 0.12 },
      '-=0.7',
    );
}
