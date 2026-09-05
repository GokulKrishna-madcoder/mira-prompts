'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import gsap from 'gsap'
import { createRippleRenderer, type RippleState, type RippleRenderer } from './heroRipple.webgl'
import { HERO_SLIDES, TRANSITION_CONFIG } from './heroRipple.constants'

type TransitionPhase = 'IDLE' | 'LOADING' | 'TRANSITIONING'

/** Preload an image and return a Promise */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

export default function HeroRipple() {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rendererRef = useRef<RippleRenderer | null>(null)
  const stateRef = useRef<RippleState>({ progress: 0, cx: 0.5, cy: 0.5, swap: 0, pinch: 0 })
  const phaseRef = useRef<TransitionPhase>('IDLE')
  const currentIdxRef = useRef(0)
  const swapFlagRef = useRef(0) // toggles 0 ↔ 1 to flip A/B roles
  const autoplayRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const tweenRef = useRef<gsap.core.Tween | null>(null)
  const pinchTweenRef = useRef<gsap.core.Tween | null>(null)
  const rafRef = useRef<number>(0)
  const imagesRef = useRef<HTMLImageElement[]>([])
  const [webglFailed, setWebglFailed] = useState(false)
  const [fallbackIdx, setFallbackIdx] = useState(0)

  // ── Render loop (only while transitioning) ──
  const renderLoop = useCallback(() => {
    const r = rendererRef.current
    if (!r || !r.ok) return
    r.render(stateRef.current)
    if (phaseRef.current === 'TRANSITIONING') {
      rafRef.current = requestAnimationFrame(renderLoop)
    }
  }, [])

  // ── Trigger a slide transition ──
  const triggerTransition = useCallback((cx: number, cy: number, withPinch: boolean) => {
    const r = rendererRef.current
    if (!r || !r.ok || phaseRef.current !== 'IDLE') return

    phaseRef.current = 'LOADING'

    // Cancel any pending autoplay
    if (autoplayRef.current) { clearTimeout(autoplayRef.current); autoplayRef.current = null }

    const nextIdx = (currentIdxRef.current + 1) % HERO_SLIDES.length
    const targetSlot = (swapFlagRef.current === 0 ? 1 : 0) as 0 | 1

    const proceedWithImage = (img: HTMLImageElement) => {
      r.uploadTexture(targetSlot, img)

      // Set center for the ripple origin
      stateRef.current.cx = cx
      stateRef.current.cy = cy
      stateRef.current.progress = 0

      phaseRef.current = 'TRANSITIONING'

      // Start render loop
      rafRef.current = requestAnimationFrame(renderLoop)

      // Main progress tween
      tweenRef.current = gsap.to(stateRef.current, {
        progress: 1,
        duration: TRANSITION_CONFIG.duration,
        ease: TRANSITION_CONFIG.ease,
        onComplete: () => {
          // Commit: swap A/B roles
          swapFlagRef.current = swapFlagRef.current === 0 ? 1 : 0
          stateRef.current.swap = swapFlagRef.current
          stateRef.current.progress = 0
          stateRef.current.pinch = 0
          currentIdxRef.current = nextIdx
          phaseRef.current = 'IDLE'

          // Final stable frame
          r.render(stateRef.current)
          cancelAnimationFrame(rafRef.current)

          // Schedule next autoplay
          scheduleAutoplay()
        }
      })

      // Pinch impulse on interactive clicks
      if (withPinch) {
        stateRef.current.pinch = 0
        pinchTweenRef.current = gsap.to(stateRef.current, {
          pinch: TRANSITION_CONFIG.pinchStrength,
          duration: TRANSITION_CONFIG.pinchInDuration,
          ease: 'power2.out',
          onComplete: () => {
            gsap.to(stateRef.current, {
              pinch: 0,
              duration: TRANSITION_CONFIG.pinchOutDuration,
              ease: 'power2.inOut',
            })
          }
        })
      }
    }

    // Use cached image if available, otherwise load
    if (imagesRef.current[nextIdx]) {
      proceedWithImage(imagesRef.current[nextIdx])
    } else {
      loadImage(HERO_SLIDES[nextIdx].src)
        .then(img => {
          imagesRef.current[nextIdx] = img
          proceedWithImage(img)
        })
        .catch(() => {
          phaseRef.current = 'IDLE'
          scheduleAutoplay()
        })
    }
  }, [renderLoop])

  // ── Autoplay scheduling ──
  const scheduleAutoplay = useCallback(() => {
    if (autoplayRef.current) clearTimeout(autoplayRef.current)
    autoplayRef.current = setTimeout(() => {
      if (phaseRef.current === 'IDLE' && !document.hidden) {
        triggerTransition(0.5, 0.5, false)
      }
    }, TRANSITION_CONFIG.autoplayDelay)
  }, [triggerTransition])

  // ── Click handler: derive normalized coords ──
  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    // Don't hijack button/link clicks
    const target = e.target as HTMLElement
    if (target.closest('a, button')) return

    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return

    const cx = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    const cy = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height))

    triggerTransition(cx, cy, true)
  }, [triggerTransition])

  // ── Initialise ──
  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    // Reduced motion check
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (motionQuery.matches) {
      setWebglFailed(true)
      return
    }

    // Create renderer
    const renderer = createRippleRenderer(canvas)
    rendererRef.current = renderer
    if (!renderer.ok) {
      setWebglFailed(true)
      return
    }

    renderer.resize()

    // Load first two images, then start
    Promise.all([
      loadImage(HERO_SLIDES[0].src),
      loadImage(HERO_SLIDES[1].src),
    ]).then(([imgA, imgB]) => {
      imagesRef.current[0] = imgA
      imagesRef.current[1] = imgB

      renderer.uploadTexture(0, imgA)
      renderer.uploadTexture(1, imgB)

      // Render initial frame (texture A visible)
      stateRef.current = { progress: 0, cx: 0.5, cy: 0.5, swap: 0, pinch: 0 }
      renderer.render(stateRef.current)

      // Start autoplay
      scheduleAutoplay()

      // Preload remaining images in background
      for (let i = 2; i < HERO_SLIDES.length; i++) {
        loadImage(HERO_SLIDES[i].src).then(img => { imagesRef.current[i] = img }).catch(() => {})
      }
    }).catch(() => {
      setWebglFailed(true)
    })

    // ── ResizeObserver ──
    const ro = new ResizeObserver(() => {
      renderer.resize()
      // Re-upload current textures at new size
      const curImg = imagesRef.current[currentIdxRef.current]
      if (curImg) {
        renderer.uploadTexture(0, curImg)
        const nextIdx = (currentIdxRef.current + 1) % HERO_SLIDES.length
        const nextImg = imagesRef.current[nextIdx]
        if (nextImg) renderer.uploadTexture(1, nextImg)
      }
      if (phaseRef.current === 'IDLE') renderer.render(stateRef.current)
    })
    ro.observe(container)

    // ── Visibility ──
    const onVisibility = () => {
      if (document.hidden) {
        if (autoplayRef.current) { clearTimeout(autoplayRef.current); autoplayRef.current = null }
      } else {
        if (phaseRef.current === 'IDLE') scheduleAutoplay()
      }
    }
    document.addEventListener('visibilitychange', onVisibility)

    // ── Reduced-motion listener ──
    const onMotionChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        tweenRef.current?.kill()
        pinchTweenRef.current?.kill()
        cancelAnimationFrame(rafRef.current)
        if (autoplayRef.current) clearTimeout(autoplayRef.current)
        renderer.destroy()
        rendererRef.current = null
        setWebglFailed(true)
      }
    }
    motionQuery.addEventListener('change', onMotionChange)

    // ── Cleanup ──
    return () => {
      tweenRef.current?.kill()
      pinchTweenRef.current?.kill()
      cancelAnimationFrame(rafRef.current)
      if (autoplayRef.current) clearTimeout(autoplayRef.current)
      ro.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      motionQuery.removeEventListener('change', onMotionChange)
      renderer.destroy()
    }
  }, [scheduleAutoplay])

  // ── Fallback: simple CSS crossfade ──
  useEffect(() => {
    if (!webglFailed) return
    const interval = setInterval(() => {
      setFallbackIdx(i => (i + 1) % HERO_SLIDES.length)
    }, TRANSITION_CONFIG.autoplayDelay)
    return () => clearInterval(interval)
  }, [webglFailed])

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden"
      onPointerDown={handlePointerDown}
    >
      {/* WebGL canvas */}
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 w-full h-full ${webglFailed ? 'hidden' : ''}`}
        style={{ display: webglFailed ? 'none' : 'block' }}
      />

      {/* CSS fallback for reduced-motion / WebGL failure */}
      {webglFailed && (
        <div className="absolute inset-0">
          {HERO_SLIDES.map((slide, i) => (
            <img
              key={slide.src}
              src={slide.src}
              alt={slide.alt}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                i === fallbackIdx ? 'opacity-100' : 'opacity-0'
              }`}
            />
          ))}
        </div>
      )}

      {/* Gradient overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60 pointer-events-none z-[1]" />
    </div>
  )
}
