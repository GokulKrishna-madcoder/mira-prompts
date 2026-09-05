import { VERTEX_SHADER, FRAGMENT_SHADER } from './heroRipple.shader'
import { SHADER_CONFIG, MAX_DPR } from './heroRipple.constants'

// ── Types ──

export interface RippleState {
  progress: number
  cx: number
  cy: number
  swap: number
  pinch: number
}

export interface RippleRenderer {
  /** Upload an image into the given texture slot (0=A, 1=B) */
  uploadTexture: (slot: 0 | 1, image: HTMLImageElement) => void
  /** Push the current RippleState uniforms and draw */
  render: (state: RippleState) => void
  /** Resize the WebGL canvas to match its CSS container */
  resize: () => void
  /** Free all GPU resources */
  destroy: () => void
  /** True if WebGL initialised successfully */
  ok: boolean
}

// ── Helpers ──

function compileShader(gl: WebGLRenderingContext, type: number, src: string): WebGLShader | null {
  const s = gl.createShader(type)
  if (!s) return null
  gl.shaderSource(s, src)
  gl.compileShader(s)
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    console.error('Shader compile error:', gl.getShaderInfoLog(s))
    gl.deleteShader(s)
    return null
  }
  return s
}

function linkProgram(gl: WebGLRenderingContext, vs: WebGLShader, fs: WebGLShader): WebGLProgram | null {
  const p = gl.createProgram()
  if (!p) return null
  gl.attachShader(p, vs)
  gl.attachShader(p, fs)
  gl.linkProgram(p)
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    console.error('Program link error:', gl.getProgramInfoLog(p))
    gl.deleteProgram(p)
    return null
  }
  return p
}

/** Draw an image onto an offscreen canvas with cover-crop, matching the WebGL canvas size */
function coverCrop(image: HTMLImageElement, targetW: number, targetH: number): HTMLCanvasElement {
  const c = document.createElement('canvas')
  c.width = targetW
  c.height = targetH
  const ctx = c.getContext('2d')!
  const scale = Math.max(targetW / image.naturalWidth, targetH / image.naturalHeight)
  const dw = image.naturalWidth * scale
  const dh = image.naturalHeight * scale
  ctx.drawImage(image, (targetW - dw) / 2, (targetH - dh) / 2, dw, dh)
  return c
}

// ── Main factory ──

export function createRippleRenderer(canvas: HTMLCanvasElement): RippleRenderer {
  const glMaybe = canvas.getContext('webgl', {
    premultipliedAlpha: false,
    alpha: false,
    preserveDrawingBuffer: true,
  })

  if (!glMaybe) return { uploadTexture() {}, render() {}, resize() {}, destroy() {}, ok: false }

  // After the guard, gl is guaranteed non-null
  const gl: WebGLRenderingContext = glMaybe

  // ── Shaders ──
  const vs = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER)
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER)
  if (!vs || !fs) {
    gl.deleteShader(vs)
    gl.deleteShader(fs)
    return { uploadTexture() {}, render() {}, resize() {}, destroy() {}, ok: false }
  }

  const program = linkProgram(gl, vs, fs)
  if (!program) {
    gl.deleteShader(vs)
    gl.deleteShader(fs)
    return { uploadTexture() {}, render() {}, resize() {}, destroy() {}, ok: false }
  }

  gl.useProgram(program)

  // ── Fullscreen quad buffer ──
  const buf = gl.createBuffer()!
  gl.bindBuffer(gl.ARRAY_BUFFER, buf)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)

  const aPos = gl.getAttribLocation(program, 'a_pos')
  gl.enableVertexAttribArray(aPos)
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

  // ── Two textures: A (unit 0) and B (unit 1) ──
  const textures = [gl.createTexture()!, gl.createTexture()!]
  for (let i = 0; i < 2; i++) {
    gl.activeTexture(i === 0 ? gl.TEXTURE0 : gl.TEXTURE1)
    gl.bindTexture(gl.TEXTURE_2D, textures[i])
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    // 1×1 placeholder so the shader never samples uninitialised memory
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255]))
  }

  // ── Uniform locations ──
  const loc = {
    texA: gl.getUniformLocation(program, 'u_texA'),
    texB: gl.getUniformLocation(program, 'u_texB'),
    resolution: gl.getUniformLocation(program, 'u_resolution'),
    center: gl.getUniformLocation(program, 'u_center'),
    progress: gl.getUniformLocation(program, 'u_progress'),
    sigma: gl.getUniformLocation(program, 'u_sigma'),
    waveFreq: gl.getUniformLocation(program, 'u_waveFreq'),
    pushAmt: gl.getUniformLocation(program, 'u_pushAmt'),
    caStrength: gl.getUniformLocation(program, 'u_caStrength'),
    glow: gl.getUniformLocation(program, 'u_glow'),
    noiseWarp: gl.getUniformLocation(program, 'u_noiseWarp'),
    swap: gl.getUniformLocation(program, 'u_swap'),
    pinch: gl.getUniformLocation(program, 'u_pinch'),
  }

  // Bind samplers once
  gl.uniform1i(loc.texA, 0)
  gl.uniform1i(loc.texB, 1)

  // Set static shader constants
  gl.uniform1f(loc.sigma, SHADER_CONFIG.sigma)
  gl.uniform1f(loc.waveFreq, SHADER_CONFIG.waveFreq)
  gl.uniform1f(loc.pushAmt, SHADER_CONFIG.pushAmt)
  gl.uniform1f(loc.caStrength, SHADER_CONFIG.caStrength)
  gl.uniform1f(loc.glow, SHADER_CONFIG.glow)
  gl.uniform1f(loc.noiseWarp, SHADER_CONFIG.noiseWarp)

  // ── Public API ──

  function uploadTexture(slot: 0 | 1, image: HTMLImageElement) {
    const unit = slot === 0 ? gl.TEXTURE0 : gl.TEXTURE1
    gl.activeTexture(unit)
    gl.bindTexture(gl.TEXTURE_2D, textures[slot])
    const cropped = coverCrop(image, canvas.width, canvas.height)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, cropped)
  }

  function render(state: RippleState) {
    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.uniform2f(loc.resolution, canvas.width, canvas.height)
    gl.uniform2f(loc.center, state.cx, state.cy)
    gl.uniform1f(loc.progress, state.progress)
    gl.uniform1f(loc.swap, state.swap)
    gl.uniform1f(loc.pinch, state.pinch)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
  }

  function resize() {
    const parent = canvas.parentElement
    if (!parent) return
    const rect = parent.getBoundingClientRect()
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)
    const w = Math.max(1, Math.round(rect.width * dpr))
    const h = Math.max(1, Math.round(rect.height * dpr))
    canvas.width = w
    canvas.height = h
    gl.viewport(0, 0, w, h)
  }

  function destroy() {
    gl.deleteBuffer(buf)
    gl.deleteTexture(textures[0])
    gl.deleteTexture(textures[1])
    gl.deleteShader(vs)
    gl.deleteShader(fs)
    gl.deleteProgram(program)
  }

  return { uploadTexture, render, resize, destroy, ok: true }
}
