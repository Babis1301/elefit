// ============================================================
// Hero fragment shader
// Flowing domain-warped simplex noise in dark obsidian tones with
// electric-lime glints. Mouse position warps the field (ripple),
// creating a living, reactive gradient behind the hero typography.
// ============================================================
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMouse; // normalized 0..1, smoothed on the CPU side
uniform float uIntensity; // global motion intensity (0 = reduced motion)

uniform vec3 uColorInk; // base dark
uniform vec3 uColorDeep; // secondary dark
uniform vec3 uColorVolt; // accent

// --- Simplex noise 3D (Ashima Arts / Stefan Gustavson, MIT) -----------
vec4 permute(vec4 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  i = mod(i, 289.0);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0)) +
    i.y + vec4(0.0, i1.y, i2.y, 1.0)) +
    i.x + vec4(0.0, i1.x, i2.x, 1.0));

  float n_ = 1.0 / 7.0;
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

// Fractal Brownian motion for richer texture.
float fbm(vec3 p) {
  float total = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 4; i++) {
    total += snoise(p) * amp;
    p *= 2.0;
    amp *= 0.5;
  }
  return total;
}

void main() {
  // Aspect-corrected coordinates centered at 0.
  vec2 uv = vUv;
  vec2 p = (uv - 0.5) * vec2(uResolution.x / uResolution.y, 1.0);

  float t = uTime * 0.08 * (0.3 + uIntensity * 0.7);

  // Mouse influence: a soft ripple that pushes the noise field.
  vec2 m = (uMouse - 0.5) * vec2(uResolution.x / uResolution.y, 1.0);
  float dist = distance(p, m);
  float ripple = exp(-dist * 2.2) * uIntensity;

  // Domain warping: noise displaces the sampling coordinates of more noise.
  vec3 q = vec3(p * 1.4, t);
  vec2 warp = vec2(fbm(q), fbm(q + vec3(5.2, 1.3, 0.0)));
  warp += ripple * normalize(p - m + 0.0001) * 0.6;

  float field = fbm(vec3(p * 1.6 + warp * 0.9, t * 1.2));
  field = field * 0.5 + 0.5;

  // Color grade: blend between two darks, then add volt glints in the
  // high-energy ridges of the field.
  vec3 col = mix(uColorInk, uColorDeep, smoothstep(0.2, 0.8, field));
  float ridge = smoothstep(0.62, 0.95, field + ripple * 0.5);
  col = mix(col, uColorVolt, ridge * 0.9);

  // Subtle vignette to keep typography legible.
  float vig = smoothstep(1.25, 0.25, length(uv - 0.5));
  col *= 0.65 + 0.35 * vig;

  // Faint film grain to avoid banding on dark gradients.
  float grain = fract(sin(dot(uv * uResolution, vec2(12.9898, 78.233))) * 43758.5453);
  col += (grain - 0.5) * 0.025;

  gl_FragColor = vec4(col, 1.0);
}
