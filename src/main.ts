/* ============================================================
   elefit.gr — entry point.
   Boots smooth scroll, the WebGL stage (hero + gallery), the custom
   cursor, reveals and the contact form. Everything degrades cleanly
   when WebGL is unavailable or reduced-motion is requested.
   ============================================================ */
import './styles/main.css';

import { initSmoothScroll, ScrollTrigger } from './core/scroll';
import { isWebGLAvailable } from './core/utils';
import { Stage } from './gl/Stage';
import { Hero } from './gl/Hero';
import { Gallery } from './gl/Gallery';
import { runPreloader } from './modules/preloader';
import { initCursor } from './modules/cursor';
import { initHeader } from './modules/header';
import { initReveals, heroIntro } from './modules/reveals';
import { initMethod } from './modules/method';
import { initMarquee } from './modules/marquee';
import { initForm } from './modules/form';

function boot(): void {
  document.documentElement.classList.add('js-ready');

  // Footer year.
  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  // 1) Smooth scroll + ScrollTrigger sync.
  const { lenis } = initSmoothScroll();

  // 2) WebGL stage (graceful fallback if unsupported).
  const canvas = document.getElementById('gl-canvas') as HTMLCanvasElement | null;
  if (canvas && isWebGLAvailable()) {
    try {
      const stage = new Stage(canvas);
      stage.add(new Hero());
      stage.add(new Gallery('[data-gl-image]'));
      stage.start();
    } catch (err) {
      // Any GL init error -> hide canvas, keep DOM images visible.
      console.warn('[elefit] WebGL disabled:', err);
      canvas.style.display = 'none';
    }
  } else if (canvas) {
    canvas.style.display = 'none';
  }

  // 3) DOM interactions.
  initCursor();
  initHeader(lenis);
  initMethod();
  initMarquee();
  initForm();
  initReveals();

  // 4) Preloader, then hero intro + ScrollTrigger refresh.
  runPreloader().then(() => {
    heroIntro();
    ScrollTrigger.refresh();
  });

  // Recalculate triggers after full load (images change layout).
  window.addEventListener('load', () => ScrollTrigger.refresh());
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
