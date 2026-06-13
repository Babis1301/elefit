// Gallery image plane vertex shader.
// A gentle hover-driven bulge displaces the plane along Z for a tactile feel.
varying vec2 vUv;

uniform float uHover; // 0..1 hover progress

void main() {
  vUv = uv;
  vec3 pos = position;
  // Bulge toward the viewer, strongest at the center, eased by hover.
  float bulge = (1.0 - distance(uv, vec2(0.5)) * 2.0) * uHover * 0.12;
  pos.z += bulge;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
