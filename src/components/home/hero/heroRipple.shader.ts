/** Vertex shader — minimal fullscreen quad */
export const VERTEX_SHADER = /* glsl */ `
attribute vec2 a_pos;
varying vec2 v_uv;

void main() {
  // Flip Y so top-left is (0,0)
  v_uv = vec2(a_pos.x * 0.5 + 0.5, 0.5 - a_pos.y * 0.5);
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`

/** Fragment shader — FBM ripple transition with chromatic aberration */
export const FRAGMENT_SHADER = /* glsl */ `
precision mediump float;

varying vec2 v_uv;

uniform sampler2D u_texA;
uniform sampler2D u_texB;

uniform vec2  u_resolution;
uniform vec2  u_center;

uniform float u_progress;
uniform float u_sigma;
uniform float u_waveFreq;
uniform float u_pushAmt;
uniform float u_caStrength;
uniform float u_glow;
uniform float u_noiseWarp;
uniform float u_swap;
uniform float u_pinch;

// ── Noise: hash → value noise → FBM ──

float hash21(vec2 p) {
  p = fract(p * vec2(233.34, 851.73));
  p += dot(p, p + 23.45);
  return fract(p.x * p.y);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f); // smoothstep interpolation

  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));

  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p, int octaves) {
  float val = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 6; i++) {
    if (i >= octaves) break;
    val += amp * vnoise(p);
    p *= 2.0;
    amp *= 0.5;
  }
  return val;
}

void main() {
  vec2 uv = v_uv;
  vec2 center = u_center;

  // Aspect-ratio–correct radial distance
  float aspect = u_resolution.x / u_resolution.y;
  vec2 p = uv - center;
  p.x *= aspect;

  float dist = length(p);

  // Normalize so the max possible distance ≈ 1
  float maxDist = length(vec2(max(center.x, 1.0 - center.x) * aspect,
                              max(center.y, 1.0 - center.y)));
  float normDist = dist / max(maxDist, 0.001);

  // ── FBM warp ──
  float noiseLarge = fbm(p * 4.0 + vec2(u_progress * 1.0, u_progress * 0.5), 4);
  float noiseSmall = fbm(p * 12.0 + vec2(u_progress * 2.0, -u_progress * 1.5), 3);

  float warpedDist = normDist
    + (noiseLarge - 0.5) * 0.3 * u_noiseWarp
    + (noiseSmall - 0.5) * 0.1 * u_noiseWarp;

  // ── Traveling wave ──
  float coverage = 1.6; // extends past 1.0 so wave reaches all corners
  float waveFront = u_progress * coverage;
  float delta = warpedDist - waveFront;

  float sigma = u_sigma;
  float baseEnvelope = exp(-delta * delta / (2.0 * sigma * sigma));
  float ripples = max(0.0, cos(delta * u_waveFreq));
  float envelope = baseEnvelope * ripples;

  // Gate: kill residual after transition ends
  envelope *= smoothstep(1.0, 0.95, u_progress);

  // ── Pinch ──
  float pinchSigma = 0.10;
  float pinchG = exp(-dist * dist / (2.0 * pinchSigma * pinchSigma));

  // Edge fade to prevent boundary artifacts
  float edgeFade = smoothstep(0.0, 0.05, uv.x) * smoothstep(1.0, 0.95, uv.x)
                 * smoothstep(0.0, 0.05, uv.y) * smoothstep(1.0, 0.95, uv.y);
  pinchG *= edgeFade;

  // ── UV displacement ──
  vec2 dir = (dist > 0.001) ? normalize(p) : vec2(0.0);
  float pushAmt = envelope * u_pushAmt;
  vec2 pinchDisp = dir * pinchG * u_pinch * (-0.15); // inward pull

  vec2 uvOffset = dir * pushAmt;
  // Un-correct the aspect on x before applying to UV space
  uvOffset.x /= aspect;
  pinchDisp.x /= aspect;
  uvOffset += pinchDisp;

  // ── Chromatic aberration ──
  float caStr = envelope * u_caStrength;
  vec2 caDir = (dist > 0.001) ? normalize(p) : vec2(0.0);
  vec2 caOffset = caDir * caStr;
  caOffset.x /= aspect;

  vec2 uvR = uv - uvOffset - caOffset;
  vec2 uvG = uv - uvOffset;
  vec2 uvB = uv - uvOffset + caOffset;

  // ── Sample both textures with CA ──
  vec4 colorA = vec4(
    texture2D(u_texA, uvR).r,
    texture2D(u_texA, uvG).g,
    texture2D(u_texA, uvB).b,
    1.0
  );
  vec4 colorB = vec4(
    texture2D(u_texB, uvR).r,
    texture2D(u_texB, uvG).g,
    texture2D(u_texB, uvB).b,
    1.0
  );

  // ── A/B reveal mask ──
  float feather = 0.08;
  float reveal = smoothstep(waveFront - feather + (noiseLarge - 0.5) * 0.15,
                            waveFront + feather + (noiseLarge - 0.5) * 0.15,
                            warpedDist);
  reveal = 1.0 - reveal; // invert: revealed area = 1

  // Swap logic: u_swap flips which texture is "current" vs "target"
  vec4 base   = mix(colorA, colorB, u_swap);
  vec4 target = mix(colorB, colorA, u_swap);
  vec4 color  = mix(base, target, reveal);

  // ── Glow (optional) ──
  color.rgb += envelope * u_glow * vec3(0.15, 0.1, 0.2);

  gl_FragColor = vec4(color.rgb, 1.0);
}
`
