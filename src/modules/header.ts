/* ============================================================
   Header — mobile burger toggle + smooth-scroll on nav clicks
   (delegated to Lenis so internal anchors respect smooth scroll).
   ============================================================ */
import type Lenis from 'lenis';

export function initHeader(lenis: Lenis): void {
  const header = document.getElementById('header');
  const burger = document.getElementById('burger');
  if (!header || !burger) return;

  const close = (): void => {
    header.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Άνοιγμα μενού');
  };

  burger.addEventListener('click', () => {
    const open = header.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Κλείσιμο μενού' : 'Άνοιγμα μενού');
  });

  // Anchor links -> Lenis smooth scroll.
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      close();
      lenis.scrollTo(target as HTMLElement, { offset: 0, duration: 1.2 });
    });
  });
}
