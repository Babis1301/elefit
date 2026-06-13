// Hero plane vertex shader — passes UVs straight through.
// The plane is a full-screen quad rendered with an orthographic camera.
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
