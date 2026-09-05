export interface HeroRippleSlide {
  src: string
  alt: string
}

/** 10 high-res hero backgrounds in /public/hero-background/ */
export const HERO_SLIDES: HeroRippleSlide[] = Array.from({ length: 10 }, (_, i) => ({
  src: `/hero-background/hero-background (${i + 1}).png`,
  alt: `Hero background ${i + 1}`,
}))

/** Shader uniform defaults — LOCKED per user specification */
export const SHADER_CONFIG = {
  sigma: 0.17,
  waveFreq: 5,
  pushAmt: 0.08,
  caStrength: 0.000,
  glow: 0,
  noiseWarp: 2.50,
} as const

/** GSAP transition defaults */
export const TRANSITION_CONFIG = {
  duration: 3.5,
  ease: 'linear',
  autoplayDelay: 1800,
} as const

/** Max device pixel ratio to prevent GPU overload on retina */
export const MAX_DPR = 2
