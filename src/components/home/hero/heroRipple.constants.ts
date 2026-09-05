export interface HeroRippleSlide {
  src: string
  alt: string
}

/** 10 high-res hero backgrounds in /public/hero-background/ */
export const HERO_SLIDES: HeroRippleSlide[] = Array.from({ length: 10 }, (_, i) => ({
  src: `/hero-background/hero-background (${i + 1}).png`,
  alt: `Hero background ${i + 1}`,
}))

/** Shader uniform defaults — sourced from the Ideogram bundle */
export const SHADER_CONFIG = {
  sigma: 0.15,
  waveFreq: 5,
  pushAmt: 0.145,
  caStrength: 0.02,
  glow: 0,
  noiseWarp: 1,
} as const

/** GSAP transition defaults */
export const TRANSITION_CONFIG = {
  duration: 3.5,       // seconds (1.4 / 0.4 from source)
  ease: 'power2.inOut',
  autoplayDelay: 3500, // ms between slides
  pinchStrength: 0.3,
  pinchInDuration: 0.1,
  pinchOutDuration: 0.4,
} as const

/** Max device pixel ratio to prevent GPU overload on retina */
export const MAX_DPR = 2
