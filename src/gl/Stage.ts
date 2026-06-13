/* ============================================================
   Stage — owns the single WebGLRenderer and the render loop.
   Renders a list of "passes" (Hero background, Gallery planes) into
   one fixed canvas. Handles resize, capped pixel ratio, and pauses
   rendering when the tab is hidden to save battery/GPU.
   ============================================================ */
import { WebGLRenderer } from 'three';
import { gsap } from '../core/scroll';
import { cappedPixelRatio } from '../core/utils';

export interface RenderPass {
  /** Called every frame. May clearDepth before drawing its own scene. */
  render(renderer: WebGLRenderer, elapsed: number, dt: number): void;
  resize(width: number, height: number): void;
  dispose?(): void;
}

export class Stage {
  readonly renderer: WebGLRenderer;
  private passes: RenderPass[] = [];
  private width = window.innerWidth;
  private height = window.innerHeight;
  private last = performance.now();
  private running = true;

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    this.renderer.autoClear = false; // we clear manually between passes
    this.renderer.setPixelRatio(cappedPixelRatio(2));
    this.renderer.setSize(this.width, this.height);

    window.addEventListener('resize', this.onResize, { passive: true });
    document.addEventListener('visibilitychange', this.onVisibility);
  }

  add(pass: RenderPass): void {
    pass.resize(this.width, this.height);
    this.passes.push(pass);
  }

  start(): void {
    gsap.ticker.add(this.tick);
  }

  private tick = (): void => {
    if (!this.running) return;
    const now = performance.now();
    const dt = Math.min((now - this.last) / 1000, 0.05); // clamp big gaps
    const elapsed = now / 1000;
    this.last = now;

    this.renderer.clear();
    for (const pass of this.passes) pass.render(this.renderer, elapsed, dt);
  };

  private onResize = (): void => {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.renderer.setPixelRatio(cappedPixelRatio(2));
    this.renderer.setSize(this.width, this.height);
    for (const pass of this.passes) pass.resize(this.width, this.height);
  };

  private onVisibility = (): void => {
    this.running = !document.hidden;
    this.last = performance.now(); // avoid a huge dt on resume
  };

  dispose(): void {
    gsap.ticker.remove(this.tick);
    window.removeEventListener('resize', this.onResize);
    document.removeEventListener('visibilitychange', this.onVisibility);
    for (const pass of this.passes) pass.dispose?.();
    this.renderer.dispose();
  }
}
