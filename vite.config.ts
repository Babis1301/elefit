import { defineConfig } from 'vite';
import glsl from 'vite-plugin-glsl';

// NOTE on `base`:
//  - GitHub Pages PROJECT page (https://<user>.github.io/<repo>/) -> set base to '/<repo>/'
//    The deploy workflow injects it automatically via the BASE_PATH env var.
//  - Custom domain (elefit.gr) or Netlify/Vercel or user/org page -> base should be '/'.
//    Just push without BASE_PATH, or set it to '/'.
const base = process.env.BASE_PATH ?? '/';

export default defineConfig({
  base,
  plugins: [
    glsl({
      // Import .glsl/.vert/.frag as strings, with #include support.
      include: ['**/*.glsl', '**/*.vert', '**/*.frag'],
    }),
  ],
  build: {
    target: 'es2020',
    cssMinify: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        // Keep the heavy 3D lib in its own chunk for better caching / code-splitting.
        manualChunks: {
          three: ['three'],
          gsap: ['gsap'],
        },
      },
    },
  },
});
