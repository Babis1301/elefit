// ============================================================
// Gallery image transition fragment shader.
// On hover: RGB channel-split + ripple distortion driven by the
// mouse position over the plane. Falls back to a clean texture at rest.
// ============================================================
precision highp float;

varying vec2 vUv;

uniform sampler2D uTexture;
uniform float uHover; // 0..1 eased hover progress
uniform float uTime;
uniform vec2 uMouse; // local mouse over the plane, 0..1
uniform vec2 uImageRatio; // cover-fit correction (scale, offset baked)

void main() {
  // Cover-fit the texture so it never stretches.
  vec2 uv = (vUv - 0.5) * uImageRatio + 0.5;

  // Distortion grows from the cursor outwards.
  float d = distance(vUv, uMouse);
  float wave = sin(d * 18.0 - uTime * 2.0) * 0.5 + 0.5;
  vec2 dir = normalize(vUv - uMouse + 0.0001);
  vec2 distort = dir * wave * uHover * 0.012;

  // RGB shift scales with hover and distance from cursor.
  float shift = uHover * 0.012 * (0.4 + d);
  float r = texture2D(uTexture, uv + distort + vec2(shift, 0.0)).r;
  float g = texture2D(uTexture, uv + distort).g;
  float b = texture2D(uTexture, uv + distort - vec2(shift, 0.0)).b;

  vec3 col = vec3(r, g, b);

  // Lift exposure slightly on hover to make the image pop.
  col += uHover * 0.06;

  gl_FragColor = vec4(col, 1.0);
}
