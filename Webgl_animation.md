# Antigravity Implementation Plan — Ideogram-Style WebGL Hero Ripple

## 1. Objective

Recreate the Hero background transition observed in the supplied Ideogram JavaScript bundle as a clean, maintainable implementation suitable for a modern React/Next.js application.

The recreation should preserve the **behavioral and technical characteristics evidenced by the supplied bundle**, rather than approximating the effect with CSS-only transitions.

### Target behavior

- Full-bleed Hero background image carousel.
- Two-image GPU transition using WebGL textures.
- Custom GLSL fragment shader.
- Radial ripple/reveal originating from a configurable point.
- Procedural FBM/value-noise distortion.
- UV displacement.
- Subtle chromatic aberration / RGB separation.
- Optional click "pinch" impulse.
- GSAP used as the animation/tween controller.
- Automatic slide progression.
- Click/touch progression from the interaction point.
- Responsive WebGL canvas sizing.
- Device-pixel-ratio cap of 2.
- Reduced-motion fallback.
- Graceful fallback to ordinary image swapping if WebGL initialization fails.

---

## 2. Source Findings That Must Drive the Recreation

The supplied bundle is:

`NewBrandHomePage.astro_astro_type_script_index_0_lang.B2sUT7lX.js`

The following implementation details are directly supported by the source.

### Rendering

The Hero creates a native WebGL context:

```js
canvas.getContext("webgl", {
  premultipliedAlpha: false,
  alpha: false,
  preserveDrawingBuffer: true
})
```

It directly creates and compiles shaders, creates a WebGL program, creates a buffer, binds textures, sets uniforms, and renders with `drawArrays`.

**Implementation consequence:** do not introduce Three.js/PixiJS merely to reproduce this effect. Use native WebGL APIs unless the project architecture gives a compelling reason otherwise.

### Image handling

The source keeps two image sources/textures, A and B.

Images are preprocessed through a 2D canvas using a cover-style crop:

```js
scale = Math.max(canvasWidth / imageWidth, canvasHeight / imageHeight)
```

The scaled image is centered and drawn into the canvas before becoming a WebGL texture.

### Shader inputs

The shader receives:

- `u_texA`
- `u_texB`
- `u_resolution`
- `u_center`
- `u_progress`
- `u_sigma`
- `u_waveFreq`
- `u_pushAmt`
- `u_caStrength`
- `u_glow`
- `u_noiseWarp`
- `u_swap`
- `u_pinch`

### Source transition configuration

The source defines:

```js
const Ir = {
  sigma: 0.15,
  waveFreq: 5,
  pushAmt: 0.145,
  caStrength: 0.02,
  glow: 0,
  noiseWarp: 1,
  duration: 1.4 / 0.4,
  ease: "power2.inOut",
  pinch: true,
  pinchStrength: 0.3
}
```

Therefore the effective main transition duration is **3.5 seconds**.

The carousel autoplay delay is also **3500 ms**, so the source is structured around a 3.5-second transition cadence.

### Click-origin behavior

The source converts click coordinates into normalized coordinates relative to the Hero:

```js
cx = (clientX - rect.left) / rect.width
cy = (clientY - rect.top) / rect.height
```

Those values become the shader's `u_center`.

Automatic initialization starts with:

```js
{
  progress: 0,
  cx: 0.5,
  cy: 0.5,
  swap: 0,
  pinch: 0
}
```

Therefore autoplay/default behavior can use the center, while interactive transitions can originate at the pointer location.

### Pinch

On interactive transitions, the source optionally tweens:

```text
pinch: 0 → 0.3 in 0.1s
pinch: 0.3 → 0 in 0.4s
```

The pinch is separate from the main 3.5-second progress animation.

### Noise

The shader implements:

- `hash21`
- interpolated value noise
- FBM with multiple octaves

Two noise fields are used:

```glsl
noiseLarge = fbm(..., 4);
noiseSmall = fbm(..., 3);
```

The warped distance combines these fields with `u_noiseWarp`.

### Ripple

The shader calculates normalized radial distance, then:

```glsl
delta = warpedDist - waveFront;

baseEnvelope =
  exp(-delta * delta / (2.0 * sigma * sigma));

ripples =
  max(0.0, cos(delta * waveFreq));

envelope =
  baseEnvelope * ripples;
```

This creates a localized traveling wave.

### UV displacement

The shader calculates a normalized radial direction and uses the ripple envelope to displace texture sampling coordinates.

### Chromatic aberration

The source samples red, green, and blue at slightly different UV positions:

```glsl
uvR = uv - uvOffset - caOffset;
uvG = uv - uvOffset;
uvB = uv - uvOffset + caOffset;
```

This produces the subtle RGB separation around the ripple.

### A/B reveal

The shader obtains colors from texture A and texture B and uses a noise-feathered `smoothstep` reveal mask to transition between them.

### Animation controller

GSAP is used to animate the state object, especially:

```js
progress: 0 → 1
```

and the optional pinch sequence.

GSAP is therefore the **controller**, while WebGL/GLSL is the **renderer**.

### Responsive rendering

The source observes the WebGL parent element with `ResizeObserver`, calculates:

```js
Math.min(window.devicePixelRatio || 1, 2)
```

and resizes the WebGL canvas accordingly.

### Accessibility/performance behavior

The source checks:

```js
window.matchMedia("(prefers-reduced-motion: reduce)")
```

When reduced motion is enabled, the WebGL ripple system is disabled/destroyed and the carousel falls back to simpler slide behavior.

The source also pauses autoplay when the document is hidden.

---

# 3. Recommended Project Architecture

Implement the recreation as a small, isolated feature rather than putting shader logic directly into a page component.

Suggested structure:

```text
src/
  components/
    hero/
      HeroRipple.tsx
      HeroRippleFallback.tsx
      heroRipple.types.ts
      heroRipple.constants.ts
      heroRipple.webgl.ts
      heroRipple.shader.ts
      heroRipple.images.ts
  styles/
    hero-ripple.css
```

If the application is not React/Next.js, adapt the structure while preserving the same separation of concerns.

### Responsibilities

#### `HeroRipple.tsx`

Owns:

- DOM/canvas lifecycle.
- Pointer/touch events.
- Slide state.
- Autoplay timer.
- Reduced-motion detection.
- Visibility handling.
- WebGL initialization/destruction.
- Connecting GSAP to the WebGL renderer.

#### `heroRipple.webgl.ts`

Owns:

- WebGL context creation.
- Shader compilation.
- Program linking.
- Buffer creation.
- Texture creation/update/deletion.
- Uniform lookup.
- Resize logic.
- Rendering.
- Texture A/B swapping.
- Cleanup.

#### `heroRipple.shader.ts`

Contains:

- Vertex shader.
- Fragment shader.
- GLSL noise functions.
- Ripple math.
- Distortion.
- Chromatic aberration.
- A/B reveal.

#### `heroRipple.constants.ts`

Contains the tunable values corresponding to the source configuration.

---

# 4. Implementation Phases

## Phase 1 — Build the DOM/CSS shell

Create a Hero container:

```text
Hero
├── background layer
│   ├── WebGL canvas
│   └── fallback image layers
├── foreground content
└── optional controls
```

The WebGL canvas must cover the entire background area.

Requirements:

- `position: absolute`
- `inset: 0`
- full width/height
- no layout influence
- foreground content above it
- canvas pointer behavior configurable so foreground buttons remain clickable

Do not allow the canvas to cause scrolling or alter Hero dimensions.

---

## Phase 2 — Create the WebGL renderer

Initialize:

```js
const gl = canvas.getContext("webgl", {
  premultipliedAlpha: false,
  alpha: false,
  preserveDrawingBuffer: true
});
```

If unavailable:

1. Disable the shader renderer.
2. Keep the ordinary image carousel.
3. Do not throw a fatal application error.

### Vertex shader

Use a minimal fullscreen quad.

Conceptually:

```glsl
attribute vec2 a_pos;
varying vec2 v_uv;

void main() {
  v_uv = vec2(
    a_pos.x * 0.5 + 0.5,
    0.5 - a_pos.y * 0.5
  );

  gl_Position = vec4(a_pos, 0.0, 1.0);
}
```

The quad vertices should be:

```js
new Float32Array([
  -1, -1,
   1, -1,
  -1,  1,
   1,  1
])
```

Render with:

```js
gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
```

---

# 5. Image-to-Texture Pipeline

## A/B texture model

Maintain two GPU textures:

```text
Texture A = current image
Texture B = target image
```

Do not allocate a new texture every frame.

When changing slides:

1. Load target image.
2. Draw it to an offscreen 2D canvas using cover-crop.
3. Upload it into the inactive texture.
4. Set the target slide index.
5. Reset `progress = 0`.
6. Animate progress to `1`.
7. Swap A/B logical roles at completion.

---

# 6. Cover-Crop Image Preparation

Create an offscreen canvas matching the WebGL drawing size.

Use:

```js
const scale = Math.max(
  targetWidth / image.naturalWidth,
  targetHeight / image.naturalHeight
);

const drawWidth = image.naturalWidth * scale;
const drawHeight = image.naturalHeight * scale;

const x = (targetWidth - drawWidth) / 2;
const y = (targetHeight - drawHeight) / 2;

ctx.drawImage(
  image,
  x,
  y,
  drawWidth,
  drawHeight
);
```

This reproduces the source's centered cover behavior.

---

# 7. WebGL Texture Configuration

For each texture:

```js
gl.texParameteri(
  gl.TEXTURE_2D,
  gl.TEXTURE_MIN_FILTER,
  gl.LINEAR
);

gl.texParameteri(
  gl.TEXTURE_2D,
  gl.TEXTURE_MAG_FILTER,
  gl.LINEAR
);

gl.texParameteri(
  gl.TEXTURE_2D,
  gl.TEXTURE_WRAP_S,
  gl.CLAMP_TO_EDGE
);

gl.texParameteri(
  gl.TEXTURE_2D,
  gl.TEXTURE_WRAP_T,
  gl.CLAMP_TO_EDGE
);
```

Use two texture units:

```text
TEXTURE0 → A
TEXTURE1 → B
```

Bind the corresponding sampler uniforms.

---

# 8. Fragment Shader Implementation

Implement the source shader as closely as practical.

## 8.1 Uniform declarations

```glsl
uniform sampler2D u_texA;
uniform sampler2D u_texB;

uniform vec2 u_resolution;
uniform vec2 u_center;

uniform float u_progress;
uniform float u_sigma;
uniform float u_waveFreq;
uniform float u_pushAmt;
uniform float u_caStrength;
uniform float u_glow;
uniform float u_noiseWarp;
uniform float u_swap;
uniform float u_pinch;
```

---

## 8.2 Noise

Implement the source's:

```text
hash21
vnoise
fbm
```

Use the same general octave structure:

- large noise: 4 octaves
- small noise: 3 octaves

Avoid replacing this with a random texture unless profiling later proves necessary.

The procedural noise is part of the visual identity of the effect.

---

## 8.3 Aspect-ratio correction

Use:

```glsl
vec2 p = uv - center;

float aspect = resolution.x / resolution.y;

p.x *= aspect;
```

Then:

```glsl
float dist = length(p);
```

Normalize against the maximum radial distance.

This prevents the ripple from becoming elliptical when the Hero is not square.

---

## 8.4 Warped distance

Implement the two noise fields:

```glsl
float noiseLarge = fbm(
  p * 4.0 +
  vec2(progress * 1.0, progress * 0.5),
  4
);

float noiseSmall = fbm(
  p * 12.0 +
  vec2(progress * 2.0, -progress * 1.5),
  3
);
```

Then combine them into the radial distance.

Preserve the source's relationship between:

- normalized distance
- noiseLarge
- noiseSmall
- noiseWarp
- progress

---

## 8.5 Traveling wave

Use the source structure:

```glsl
float waveFront = progress * coverage;

float delta = warpedDist - waveFront;

float baseEnvelope =
  exp(
    -delta * delta /
    (2.0 * sigma * sigma)
  );

float ripples =
  max(0.0, cos(delta * waveFreq));

float envelope =
  baseEnvelope * ripples;
```

Gate the envelope so it does not remain active after the transition reaches the end.

---

# 9. Pinch Implementation

Use a localized Gaussian around the ripple center.

The source uses:

```glsl
float pinchSigma = 0.10;

float pinchG =
  exp(
    -dist * dist /
    (2.0 * pinchSigma * pinchSigma)
  );
```

Then derive a radial displacement from it.

Apply an edge fade so the pinch does not create unwanted artifacts at the canvas boundary.

---

# 10. UV Displacement

Compute:

```glsl
vec2 dir =
  (dist > 0.001)
    ? normalize(p)
    : vec2(0.0);
```

Then:

```glsl
float pushAmt =
  envelope * u_pushAmt;
```

and combine the push with the pinch displacement.

Convert the X displacement back through the aspect ratio before sampling.

This is critical: the effect is achieved by **sampling the source texture from displaced UV coordinates**, not by transforming the HTML image.

---

# 11. Chromatic Aberration

Calculate:

```glsl
float caStrength =
  envelope * u_caStrength;

vec2 caOffset =
  dir * caStrength;
```

Then create:

```glsl
vec2 uvR = uv - uvOffset - caOffset;
vec2 uvG = uv - uvOffset;
vec2 uvB = uv - uvOffset + caOffset;
```

Sample RGB independently from each texture.

Do not apply a global CSS `filter` for this. The source effect is localized to the ripple envelope.

---

# 12. A/B Reveal

For each texture:

```glsl
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
```

Create a feathered reveal mask using the warped radial distance and wave front.

Then:

```glsl
vec4 base =
  mix(colorA, colorB, u_swap);

vec4 target =
  mix(colorB, colorA, u_swap);

vec4 color =
  mix(base, target, reveal);
```

Finally output:

```glsl
gl_FragColor =
  vec4(color.rgb, 1.0);
```

---

# 13. GSAP Integration

Install/use GSAP only for state interpolation.

Create renderer state:

```ts
type RippleState = {
  progress: number;
  cx: number;
  cy: number;
  swap: number;
  pinch: number;
};
```

Initialize:

```js
{
  progress: 0,
  cx: 0.5,
  cy: 0.5,
  swap: 0,
  pinch: 0
}
```

Every GSAP update must call a renderer update function that uploads the uniforms and renders.

Conceptually:

```js
gsap.to(state, {
  progress: 1,
  duration: 3.5,
  ease: "power2.inOut",
  onUpdate: render,
  onComplete: finishTransition
});
```

For an interactive click, run the pinch sequence in parallel with the main transition.

Do not animate the DOM background itself.

---

# 14. Slide Transition State Machine

Use explicit states:

```text
IDLE
  ↓
PREPARE_TARGET
  ↓
LOADING_TARGET
  ↓
READY
  ↓
TRANSITIONING
  ↓
COMMIT
  ↓
IDLE
```

### `PREPARE_TARGET`

- Determine next index.
- Load target image.
- Upload target into inactive WebGL texture.

### `TRANSITIONING`

- `progress` runs from 0 to 1.
- Shader renders both textures.
- User interaction controls `cx/cy`.

### `COMMIT`

- Flip logical A/B role.
- Set current index.
- Reset progress to 0.
- Render final image.
- Schedule next autoplay transition.

This prevents race conditions if the user clicks repeatedly.

---

# 15. Autoplay

The source uses approximately:

```text
3500 ms
```

for the next slide cadence.

Implement a single timer rather than multiple independent timers.

Rules:

- Never start a second autoplay timer while one exists.
- Cancel/restart timer when visibility changes.
- Cancel/restart timer when reduced-motion changes.
- Do not advance while a transition is already running.
- Schedule the next transition only after the current transition has committed.

---

# 16. Pointer Interaction

Attach pointer events to the Hero background.

On pointer activation:

```js
const rect = hero.getBoundingClientRect();

const cx =
  (event.clientX - rect.left) /
  rect.width;

const cy =
  (event.clientY - rect.top) /
  rect.height;
```

Clamp:

```js
cx = Math.max(0, Math.min(1, cx));
cy = Math.max(0, Math.min(1, cy));
```

Then pass these coordinates to the shader.

Important:

- Foreground links/buttons must remain clickable.
- Ignore pointer events whose target is an interactive foreground control.
- Avoid double-triggering mouse + touch by using Pointer Events.

---

# 17. Mobile / Touch

Use Pointer Events rather than separate mouse/touch handlers.

For touch:

- A tap can trigger the same transition.
- Do not require dragging.
- Do not interfere with vertical page scrolling.
- Avoid `preventDefault()` unless absolutely necessary.

The ripple origin should still be based on the tap position.

---

# 18. Reduced Motion

Respect:

```js
window.matchMedia(
  "(prefers-reduced-motion: reduce)"
)
```

When true:

- Do not initialize the WebGL ripple renderer, or destroy it if already active.
- Show the current/target image normally.
- Disable automatic animated ripple transitions.
- Keep navigation usable.
- Do not create continuous animation loops.

When the media query changes back:

- Reinitialize WebGL safely.
- Upload current and next textures.
- Resume normal behavior.

---

# 19. Visibility Handling

Listen for:

```js
document.addEventListener(
  "visibilitychange",
  ...
)
```

When:

```js
document.hidden === true
```

stop autoplay scheduling.

When visible again:

- Resume autoplay.
- Do not unexpectedly restart a half-finished transition.
- If a transition was active when hidden, either finish it immediately or reset it deterministically.

Prefer deterministic behavior over attempting to maintain animation timing while the tab is backgrounded.

---

# 20. Resize Strategy

Use `ResizeObserver` on the WebGL parent.

Calculate:

```js
const dpr =
  Math.min(window.devicePixelRatio || 1, 2);

const width =
  Math.max(1, Math.round(rect.width * dpr));

const height =
  Math.max(1, Math.round(rect.height * dpr));
```

Then:

```js
canvas.width = width;
canvas.height = height;

gl.viewport(
  0,
  0,
  width,
  height
);
```

Update:

```text
u_resolution = width, height
```

After resizing, regenerate the offscreen cover-crop canvases and refresh texture contents so the source images remain correctly framed.

Debounce only if profiling shows excessive resize work.

---

# 21. Resource Cleanup

`destroy()` must:

- Cancel GSAP tweens.
- Cancel pending animation frames.
- Disconnect ResizeObserver.
- Remove event listeners.
- Delete textures.
- Delete buffers.
- Delete shaders/program.
- Stop timers.
- Release references to image/canvas objects.

React cleanup must call this on unmount.

No WebGL context or animation loop should remain after the Hero component is removed.

---

# 22. Performance Requirements

### Do

- Render only during an active transition.
- Avoid an unnecessary permanent RAF loop.
- Reuse two textures.
- Reuse the WebGL program.
- Reuse buffers.
- Cap DPR at 2.
- Preload the next image.
- Keep foreground DOM outside WebGL.
- Use `ResizeObserver`.

### Do not

- Recreate shaders on every transition.
- Create textures every frame.
- Render continuously when idle.
- Apply large CSS blur filters over the entire Hero.
- Use DOM transforms to fake the displacement.
- Introduce a heavyweight 3D engine unnecessarily.

---

# 23. Fallback Design

There must always be a working fallback.

Fallback conditions:

- WebGL unavailable.
- Shader compilation fails.
- Program linking fails.
- Image texture upload fails.
- Browser/device causes a runtime WebGL failure.
- Reduced-motion is enabled.

Fallback should use ordinary images with an accessible carousel.

Example:

```text
WebGL available
    ↓
Initialize shader
    ↓
Success → WebGL Hero

Failure
    ↓
CSS/HTML Hero
    ↓
Simple image transition
```

Do not leave the Hero blank because WebGL failed.

---

# 24. Error Handling

Wrap WebGL initialization in a controlled error boundary.

Errors should:

1. Be logged in development.
2. Disable the WebGL path.
3. Activate fallback rendering.
4. Keep navigation functional.

Do not repeatedly attempt initialization after a hard failure on every render.

---

# 25. TypeScript API

Expose a simple component API.

Example:

```ts
export interface HeroRippleSlide {
  src: string;
  alt: string;
}

export interface HeroRippleProps {
  slides: HeroRippleSlide[];
  autoplay?: boolean;
  autoplayDelay?: number;
  transitionDuration?: number;
  className?: string;
  onSlideChange?: (index: number) => void;
}
```

Defaults should reflect the source:

```ts
autoplay = true
autoplayDelay = 3500
transitionDuration = 3.5
```

Shader constants:

```ts
sigma = 0.15
waveFreq = 5
pushAmt = 0.145
caStrength = 0.02
glow = 0
noiseWarp = 1
pinch = true
pinchStrength = 0.3
ease = "power2.inOut"
```

Keep these configurable internally, but don't expose every shader parameter as a public prop unless needed.

---

# 26. Testing Plan

## Functional

Test:

- Initial slide renders.
- Autoplay advances.
- Click advances.
- Multiple clicks do not corrupt state.
- Click near top-left produces top-left ripple.
- Click near bottom-right produces bottom-right ripple.
- Center click produces center ripple.
- Target image loads correctly.
- A/B textures swap correctly.
- Loop wraps from last slide to first.

## Responsive

Test:

- Desktop.
- Retina desktop.
- Tablet.
- Mobile.
- Portrait.
- Landscape.
- Hero resizing after initialization.

## Accessibility

Test:

- `prefers-reduced-motion`.
- Keyboard-accessible foreground controls.
- Screen reader-visible content.
- No focus traps caused by canvas.
- No keyboard interaction blocked by the WebGL layer.

## Failure

Test:

- WebGL unavailable.
- Shader compilation error.
- Image load failure.
- Rapid navigation.
- Browser tab hidden during transition.
- Component unmount during transition.

---

# 27. Visual Validation Checklist

The recreation should be compared against the source behavior using identical or visually similar Hero images.

Check:

### Ripple

- Starts from correct point.
- Travels outward.
- Has a soft envelope.
- Has visible but subtle wave oscillation.
- Does not look like a generic circular wipe.

### Noise

- Boundary is organically irregular.
- Large-scale distortion is visible.
- Fine-scale variation remains subtle.

### Distortion

- Image bends around the wave.
- Displacement is strongest near the ripple.
- Image is not globally warped.

### RGB split

- Very subtle.
- Localized around the ripple.
- Not a permanent glitch effect.

### Pinch

- Quick impulse on interaction.
- Not strong enough to look like a lens effect.

### Reveal

- Target image appears through the moving wave.
- No hard rectangular clipping.
- Final state is perfectly stable.

---

# 28. Suggested Implementation Order for Antigravity

Implement in exactly this order to reduce debugging complexity.

### Step 1

Create the Hero DOM and CSS layout.

### Step 2

Create a plain two-image carousel with correct sizing.

### Step 3

Add the WebGL canvas without effects.

### Step 4

Render texture A as a fullscreen quad.

### Step 5

Render texture B.

### Step 6

Implement the A/B `mix()` shader.

### Step 7

Add `u_progress`.

### Step 8

Add radial distance and reveal.

### Step 9

Add Gaussian wave envelope.

### Step 10

Add cosine ripple component.

### Step 11

Add FBM noise.

### Step 12

Add UV displacement.

### Step 13

Add chromatic aberration.

### Step 14

Add pinch.

### Step 15

Connect GSAP.

### Step 16

Add click-origin coordinates.

### Step 17

Add autoplay.

### Step 18

Add visibility handling.

### Step 19

Add reduced-motion behavior.

### Step 20

Add fallback.

### Step 21

Optimize and profile.

### Step 22

Perform visual comparison and tune constants.

Do not attempt all features simultaneously. Build from a working texture renderer toward the final shader.

---

# 29. Antigravity Coding Instructions

When implementing this plan:

1. **Inspect the existing project before modifying files.**
2. Identify the framework, bundler, TypeScript configuration, styling system, and current Hero implementation.
3. Reuse the existing architecture where possible.
4. Do not replace the whole project structure.
5. Do not introduce Three.js/PixiJS unless the existing project already requires it for unrelated reasons.
6. Prefer native WebGL for this specific effect.
7. Use GSAP only for tweening state.
8. Keep shader code isolated and readable.
9. Add comments around non-obvious GLSL math.
10. Preserve existing Hero foreground content and accessibility.
11. Do not hard-code viewport dimensions.
12. Do not use a permanent RAF loop when no transition is occurring.
13. Ensure all resources are cleaned up.
14. Implement a graceful fallback before polishing the shader.
15. Keep the implementation production-ready rather than creating a one-off demo.

---

# 30. Acceptance Criteria

The implementation is complete only when all of the following are true:

- [ ] Hero background uses native WebGL.
- [ ] Two images are held as GPU textures.
- [ ] Custom GLSL fragment shader performs the transition.
- [ ] Transition duration defaults to 3.5 seconds.
- [ ] Default ripple center is 50%/50%.
- [ ] Interactive transition uses pointer/tap coordinates.
- [ ] FBM noise distorts the radial wave.
- [ ] UV displacement bends the images.
- [ ] Localized RGB separation is visible.
- [ ] Pinch impulse works on interaction.
- [ ] GSAP drives progress/pinch state.
- [ ] Texture A/B roles swap cleanly.
- [ ] Autoplay operates around the source's 3500 ms cadence.
- [ ] ResizeObserver updates the WebGL viewport.
- [ ] DPR is capped at 2.
- [ ] Reduced-motion disables the animated shader path.
- [ ] Page visibility pauses autoplay.
- [ ] WebGL failure falls back gracefully.
- [ ] No memory leaks remain after component unmount.
- [ ] Foreground Hero controls remain accessible.
- [ ] Mobile interaction does not break page scrolling.
- [ ] No heavyweight rendering framework is required.
- [ ] Visual behavior is recognizably close to the supplied source implementation.

---

# 31. Important Scope Boundary

This document describes a recreation based on the implementation evidence available in the supplied JavaScript bundle.

It should **not** claim that this is Ideogram's complete site-wide architecture.

The bundle specifically supports the conclusions about the Hero masthead carousel, its WebGL renderer, GLSL shader, GSAP control, image handling, autoplay, click-origin ripple, pinch, reduced-motion handling, and responsive canvas behavior.

Where the source does not expose a detail, Antigravity should make a minimal engineering choice rather than inventing additional proprietary behavior.

---

# 32. Final Instruction to Antigravity

Build the Hero ripple system as a **production-quality native WebGL + GLSL renderer controlled by GSAP**, closely following the supplied bundle's architecture and constants.

The visual goal is not merely "a ripple animation."

The goal is to reproduce the combined effect:

```text
A/B GPU textures
+
radial wave
+
FBM-distorted wavefront
+
UV displacement
+
localized chromatic aberration
+
click-origin center
+
short pinch impulse
+
3.5s GSAP progression
+
responsive DPR-aware WebGL
+
reduced-motion/fallback behavior
```

Start by inspecting the existing application and then implement incrementally according to the phases above.

Do not substitute a CSS-only transition, generic mask, SVG filter, Three.js scene, or pre-rendered video for the core effect unless native WebGL is genuinely unavailable at runtime.

The final result should feel like a refined production Hero interaction rather than a generic image slideshow.
