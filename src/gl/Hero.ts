/* ============================================================
   Hero pass — full-screen shader quad with mouse-reactive,
   domain-warped noise. Renders as the living dark background.
   ============================================================ */
import {
  Color,
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Vector2,
  WebGLRenderer,
} from 'three';
import type { RenderPass } from './Stage';
import { damp, prefersReducedMotion } from '../core/utils';
import vertexShader from '../shaders/hero.vert';
import fragmentShader from '../shaders/hero.frag';

export class Hero implements RenderPass {
  private scene = new Scene();
  private camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  private material: ShaderMaterial;
  private targetMouse = new Vector2(0.5, 0.5);
  private smoothMouse = new Vector2(0.5, 0.5);
  private reduced = prefersReducedMotion();

  constructor() {
    this.material = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new Vector2(window.innerWidth, window.innerHeight) },
        uMouse: { value: new Vector2(0.5, 0.5) },
        uIntensity: { value: this.reduced ? 0 : 1 },
        uColorInk: { value: new Color('#0a0a0c') },
        uColorDeep: { value: new Color('#15151f') },
        uColorVolt: { value: new Color('#d7ff3e') },
      },
    });

    const quad = new Mesh(new PlaneGeometry(2, 2), this.material);
    quad.frustumCulled = false;
    this.scene.add(quad);

    if (!this.reduced) {
      window.addEventListener('pointermove', this.onPointerMove, { passive: true });
    }
  }

  private onPointerMove = (e: PointerEvent): void => {
    this.targetMouse.set(e.clientX / window.innerWidth, 1 - e.clientY / window.innerHeight);
  };

  render(renderer: WebGLRenderer, elapsed: number, dt: number): void {
    const u = this.material.uniforms;
    u.uTime.value = elapsed;

    // Smooth the mouse for a fluid, weighty feel.
    this.smoothMouse.x = damp(this.smoothMouse.x, this.targetMouse.x, 6, dt);
    this.smoothMouse.y = damp(this.smoothMouse.y, this.targetMouse.y, 6, dt);
    (u.uMouse.value as Vector2).copy(this.smoothMouse);

    renderer.render(this.scene, this.camera);
  }

  resize(width: number, height: number): void {
    (this.material.uniforms.uResolution.value as Vector2).set(width, height);
  }

  dispose(): void {
    window.removeEventListener('pointermove', this.onPointerMove);
    this.material.dispose();
  }
}
