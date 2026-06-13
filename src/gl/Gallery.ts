/* ============================================================
   Gallery pass — DOM-synced image planes with a hover RGB-shift /
   ripple transition. Each <figure data-gl-image> is mirrored by a
   WebGL plane positioned exactly over its on-screen rect (tracks
   Lenis scroll), shown through the transparent figure.
   ============================================================ */
import {
  Mesh,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  SRGBColorSpace,
  Texture,
  TextureLoader,
  Vector2,
  WebGLRenderer,
} from 'three';
import type { RenderPass } from './Stage';
import { damp, prefersReducedMotion } from '../core/utils';
import vertexShader from '../shaders/gallery.vert';
import fragmentShader from '../shaders/gallery.frag';

interface Item {
  el: HTMLElement;
  mesh: Mesh;
  material: ShaderMaterial;
  targetHover: number;
  targetMouse: Vector2;
}

const PERSPECTIVE = 1000;

export class Gallery implements RenderPass {
  private scene = new Scene();
  private camera: PerspectiveCamera;
  private items: Item[] = [];
  private loader = new TextureLoader();
  private geometry = new PlaneGeometry(1, 1, 24, 24);
  private width = window.innerWidth;
  private height = window.innerHeight;
  private reduced = prefersReducedMotion();

  constructor(selector: string) {
    this.camera = new PerspectiveCamera(50, this.width / this.height, 100, PERSPECTIVE * 2);
    this.camera.position.z = PERSPECTIVE;
    this.setCameraFov();

    document.querySelectorAll<HTMLElement>(selector).forEach((el) => this.addItem(el));
  }

  private addItem(el: HTMLElement): void {
    const raw = el.dataset.glImage;
    if (!raw) return;
    // Respect Vite's base (e.g. '/repo/' on GitHub Pages project sites).
    const src = raw.startsWith('/')
      ? import.meta.env.BASE_URL.replace(/\/$/, '') + raw
      : raw;

    const material = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTexture: { value: null as Texture | null },
        uHover: { value: 0 },
        uTime: { value: 0 },
        uMouse: { value: new Vector2(0.5, 0.5) },
        uImageRatio: { value: new Vector2(1, 1) },
      },
    });

    const mesh = new Mesh(this.geometry, material);
    mesh.visible = false;
    this.scene.add(mesh);

    const item: Item = { el, mesh, material, targetHover: 0, targetMouse: new Vector2(0.5, 0.5) };
    this.items.push(item);

    // Lazy-load the texture; reveal the WebGL plane once ready.
    this.loader.load(src, (texture) => {
      texture.colorSpace = SRGBColorSpace;
      material.uniforms.uTexture.value = texture;
      this.fitCover(item, texture);
      mesh.visible = true;
      el.classList.add('gl-active'); // CSS hides the DOM <img>
    });

    if (!this.reduced) {
      el.addEventListener('pointerenter', () => (item.targetHover = 1));
      el.addEventListener('pointerleave', () => (item.targetHover = 0));
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        item.targetMouse.set((e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height);
      });
    }
  }

  private fitCover(item: Item, texture: Texture): void {
    const img = texture.image as { width: number; height: number };
    const r = item.el.getBoundingClientRect();
    const planeAspect = r.width / r.height;
    const imageAspect = img.width / img.height;
    (item.material.uniforms.uImageRatio.value as Vector2).set(
      Math.min(planeAspect / imageAspect, 1),
      Math.min(imageAspect / planeAspect, 1),
    );
  }

  private setCameraFov(): void {
    this.camera.fov = (2 * Math.atan(this.height / 2 / PERSPECTIVE) * 180) / Math.PI;
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
  }

  render(renderer: WebGLRenderer, elapsed: number, dt: number): void {
    let anyVisible = false;

    for (const item of this.items) {
      if (!item.mesh.visible) continue;

      const r = item.el.getBoundingClientRect();
      // Skip planes well outside the viewport (cheap culling).
      if (r.bottom < -200 || r.top > this.height + 200) {
        item.mesh.visible = true; // keep registered, just don't draw this frame
        continue;
      }
      anyVisible = true;

      // Map DOM rect -> world space (1 unit = 1 pixel, origin at center).
      item.mesh.scale.set(r.width, r.height, 1);
      item.mesh.position.set(
        r.left - this.width / 2 + r.width / 2,
        -r.top + this.height / 2 - r.height / 2,
        0,
      );

      const u = item.material.uniforms;
      u.uTime.value = elapsed;
      u.uHover.value = damp(u.uHover.value as number, item.targetHover, 7, dt);
      (u.uMouse.value as Vector2).x = damp(
        (u.uMouse.value as Vector2).x,
        item.targetMouse.x,
        8,
        dt,
      );
      (u.uMouse.value as Vector2).y = damp(
        (u.uMouse.value as Vector2).y,
        item.targetMouse.y,
        8,
        dt,
      );
    }

    if (!anyVisible) return;
    renderer.clearDepth(); // draw planes on top of the hero background
    renderer.render(this.scene, this.camera);
  }

  resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.setCameraFov();
    // Re-fit cover ratios after layout changes.
    for (const item of this.items) {
      const tex = item.material.uniforms.uTexture.value as Texture | null;
      if (tex) this.fitCover(item, tex);
    }
  }

  dispose(): void {
    this.geometry.dispose();
    for (const item of this.items) {
      item.material.dispose();
      (item.material.uniforms.uTexture.value as Texture | null)?.dispose();
    }
  }
}
