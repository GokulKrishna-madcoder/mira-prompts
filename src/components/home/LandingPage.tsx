'use client'

import { useState, useEffect, useActionState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search, Sparkles, Loader2 } from 'lucide-react'
import { signUp } from '@/lib/auth-actions'
import Footer from '@/components/layout/Footer'
import HeroRipple from '@/components/home/hero/HeroRipple'
import TopBarScrollEffect from '@/components/home/TopBarScrollEffect'

type PromptPreview = {
  id: string
  image_url: string
  title: string
}

// Split prompts into columns for waterfall grids
function splitIntoColumns(items: PromptPreview[], cols: number): PromptPreview[][] {
  const columns: PromptPreview[][] = Array.from({ length: cols }, () => [])
  items.forEach((item, i) => columns[i % cols].push(item))
  return columns
}

export default function LandingPage({ prompts }: { prompts: PromptPreview[] }) {
  // Signup Form State
  const [signupState, signupAction, signupPending] = useActionState(
    async (_prev: any, formData: FormData) => await signUp(formData) ?? null,
    null
  )

  // Columns for the signup section background grid
  const tripled = [...prompts, ...prompts, ...prompts]
  const columns = splitIntoColumns(tripled, 5)

  return (
    <div className="fixed inset-0 z-[100] min-h-screen bg-white overflow-y-auto overflow-x-hidden">

      {/* ─── NAVBAR ─── */}
      <nav id="landing-nav" className="fixed top-0 w-full z-[110] bg-white/80 backdrop-blur-xl border-b border-gray-100 transition-colors duration-300">
        <TopBarScrollEffect />
        <div className="max-w-[1400px] mx-auto flex items-center justify-between px-5 h-16">
          <Link href="/" className="flex items-center">
            <Image 
              src="/brand/miralandingpage.png" 
              alt="Mira Prompts" 
              width={160} 
              height={40} 
              className="h-[32px] md:h-[36px] w-auto object-contain" 
            />
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/about" className="text-sm font-semibold text-gray-600 hover:text-black transition-colors hidden sm:inline-block px-3 py-2">
              About
            </Link>
            <Link href="/login" className="text-sm font-semibold text-gray-700 hover:text-black transition-colors px-4 py-2.5 rounded-full hover:bg-gray-100">
              Log in
            </Link>
            <Link href="/signup" className="text-sm font-bold text-white bg-red-500 hover:bg-red-600 px-5 py-2.5 rounded-full hover:scale-105 active:scale-95 transition-all shadow-sm">
              Sign up
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── HERO + WEBGL RIPPLE ─── */}
      <section data-theme="dark" className="relative min-h-[90vh] flex flex-col">

        {/* WebGL Background with gradient overlay built-in */}
        <HeroRipple />

        {/* Hero Content — Ideogram Style */}
        <div className="relative z-10 flex flex-col justify-end h-full w-full max-w-[1400px] mx-auto px-8 pb-32 pt-40 flex-1">
          <div className="max-w-2xl">
            {/* Small Label */}
            <h3 className="text-white/80 font-bold text-xs uppercase tracking-[0.2em] mb-4 drop-shadow-md">
              MIRA PROMPTS 1.0
            </h3>

            {/* Serif Headline */}
            <h1 className="text-5xl sm:text-6xl md:text-[64px] font-serif text-white leading-[1.05] tracking-tight drop-shadow-xl mb-6">
              The ultimate library for visual intelligence.
            </h1>

            {/* Subtitle */}
            <p className="text-white/90 text-sm md:text-base leading-relaxed mb-10 font-medium drop-shadow-md max-w-xl">
              Curated excellence. Crystal-clear results. Reliable generation. A library made for creators who need inspiration to hold up beyond the prompt box.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/signup"
                className="bg-red-500 text-white font-bold text-lg px-8 py-3.5 rounded-full hover:bg-red-600 hover:scale-105 active:scale-95 transition-all shadow-lg hover:shadow-xl"
              >
                Start Exploring — It&apos;s Free
              </Link>
              <Link
                href="/login"
                className="text-white font-semibold text-lg px-8 py-3.5 rounded-full border border-white/30 bg-white/10 backdrop-blur-sm hover:bg-white/20 hover:scale-105 active:scale-95 transition-all"
              >
                Log in
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── AI TOOLS MARQUEE ─── */}
      <section data-theme="light" className="relative z-10 overflow-hidden bg-white py-10 border-b border-gray-100">
        <div className="max-w-[1400px] mx-auto px-8">
          <div className="md:flex md:flex-row md:items-center md:justify-between">
            <p className="text-gray-500 text-sm md:text-base font-medium tracking-wide mb-6 md:mb-0 text-center md:text-left md:w-1/4">
              Prompts for the world&apos;s best AI Image generation tools
            </p>
            <div className="overflow-hidden md:w-3/4 md:flex md:justify-end">
              <div className="flex whitespace-nowrap animate-marquee md:animate-none md:flex-wrap md:justify-end md:gap-x-12">
              {[
                '/marquee-svg/midjourney.svg',
                '/marquee-svg/dall-e-openai-mono.svg',
                '/marquee-svg/gemini.svg',
                '/marquee-svg/openai-chatgpt.svg',
                '/marquee-svg/canva-wordmark-dark.svg',
              ].map((src, i) => (
                <Image
                  key={`${src}-${i}`}
                  src={src}
                  alt={src.split('/').pop()?.replace('.svg', '') || 'AI Tool'}
                  width={120}
                  height={40}
                  className="inline-flex items-center h-8 md:h-10 mx-6 md:mx-0 opacity-60 hover:opacity-100 transition-opacity object-contain"
                  style={{ objectFit: 'contain', filter: 'brightness(0)' }}
                />
              ))}
              {/* Duplicate set for mobile continuous scroll, hidden on desktop */}
              {[
                '/marquee-svg/midjourney.svg',
                '/marquee-svg/dall-e-openai-mono.svg',
                '/marquee-svg/gemini.svg',
                '/marquee-svg/openai-chatgpt.svg',
                '/marquee-svg/canva-wordmark-dark.svg',
              ].map((src, i) => (
                <Image
                  key={`${src}-${i}-dup`}
                  src={src}
                  alt={src.split('/').pop()?.replace('.svg', '') || 'AI Tool'}
                  width={120}
                  height={40}
                  className="inline-flex items-center h-8 md:h-10 mx-6 md:mx-0 opacity-60 hover:opacity-100 transition-opacity object-contain md:hidden"
                  style={{ objectFit: 'contain', filter: 'brightness(0)' }}
                />
              ))}
            </div>
          </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURE HIGHLIGHT SECTION ─── */}
      <section data-theme="light" className="relative z-10 bg-white py-24 px-6 overflow-hidden">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
          
          {/* Visual Column */}
          <div className="relative w-full aspect-square md:aspect-[4/3] lg:aspect-square bg-[#F0F0F0] rounded-[40px] flex items-center justify-center p-4 md:p-8 overflow-hidden">
            
            {/* Dynamic Overlapping Images */}
            {prompts.length >= 2 && (
              <div className="relative w-full h-full">
                <div className="absolute top-4 left-4 right-16 bottom-16 rounded-[24px] overflow-hidden shadow-2xl rotate-[-2deg] transition-transform hover:rotate-0 duration-500">
                  <Image 
                    src={prompts[0].image_url} 
                    alt="Prompt visual 1" 
                    fill 
                    className="object-cover"
                  />
                </div>
                <div className="absolute top-20 left-24 right-4 bottom-4 rounded-[24px] overflow-hidden shadow-2xl rotate-[3deg] transition-transform hover:rotate-0 duration-500">
                  <Image 
                    src={prompts[1].image_url} 
                    alt="Prompt visual 2" 
                    fill 
                    className="object-cover"
                  />
                </div>
              </div>
            )}

            {/* Floating UI Tags */}
            <div className="absolute top-12 left-8 md:left-12 bg-white shadow-xl rounded-full px-5 py-3 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
              <Search className="w-4 h-4 text-black" strokeWidth={3} />
              <span className="text-black font-bold text-sm">Cinematic lighting</span>
            </div>

            <div className="absolute bottom-16 right-8 md:right-12 bg-white shadow-xl rounded-full px-5 py-3 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
              <Sparkles className="w-4 h-4 text-[#E60023]" fill="currentColor" />
              <span className="text-black font-bold text-sm">Photorealistic</span>
            </div>
            
          </div>

          {/* Content Column */}
          <div className="flex flex-col items-start text-left">
            <h2 className="text-4xl md:text-5xl font-black text-black tracking-tight leading-[1.1]">
              Find the exact prompt for your vision
            </h2>
            <p className="text-xl text-gray-500 mt-6 leading-relaxed max-w-md">
              Stop guessing. Browse thousands of curated AI image prompts and copy them directly into Midjourney, DALL·E, or Stable Diffusion with a single click.
            </p>
            <Link 
              href="/signup" 
              className="mt-8 bg-[#E60023] text-white font-bold text-lg px-8 py-4 rounded-full hover:bg-red-600 hover:scale-105 active:scale-95 transition-all shadow-md"
            >
              Join Mira Prompts
            </Link>
          </div>

        </div>
      </section>

      {/* ─── VALUE PROPS ─── */}
      <section data-theme="light" className="relative z-10 bg-white py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black text-center text-black tracking-tight mb-16">
            Why creators love Mira Prompts
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { emoji: '✦', title: 'Curated Quality', desc: 'Every prompt is hand-picked and tested for stunning AI image results.' },
              { emoji: '⚡', title: 'One-Click Copy', desc: 'Find a prompt you love, click copy, and paste it directly into your AI tool.' },
              { emoji: '♡', title: 'Save & Organize', desc: 'Build your personal collection of favorite prompts for quick access later.' },
            ].map(item => (
              <div key={item.title} className="text-center flex flex-col items-center">
                <span className="text-4xl mb-5">{item.emoji}</span>
                <h3 className="text-xl font-bold text-black mb-2">{item.title}</h3>
                <p className="text-gray-500 leading-relaxed max-w-xs">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── INLINE SIGNUP SECTION (PINTEREST STYLE) ─── */}
      <section data-theme="dark" className="relative z-10 min-h-[90vh] flex items-center justify-center overflow-hidden bg-black">
        
        {/* Aesthetic Background Grid with Dark Overlay */}
        <div className="absolute inset-0 overflow-hidden opacity-50 select-none pointer-events-none">
          <div className="flex gap-3 px-3 h-full">
            {columns.map((col, colIdx) => (
              <div
                key={colIdx}
                className={`flex-1 flex flex-col gap-3 ${colIdx > 2 ? 'hidden lg:flex' : ''} ${colIdx > 1 ? 'hidden md:flex' : ''}`}
              >
                {col.map((p, i) => (
                  <div key={`${p.id}-bg-${i}`} className="rounded-2xl overflow-hidden bg-gray-800 flex-shrink-0">
                    <Image
                      src={p.image_url}
                      alt=""
                      width={300}
                      height={400}
                      className="w-full h-auto object-cover opacity-60"
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
        {/* Dark Gradient Overlay to make the card pop */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/90" />

        <div className="relative z-20 w-full max-w-[1400px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-20">
          
          {/* Left: Massive Typography */}
          <div className="text-center lg:text-left">
            <h2 className="text-5xl md:text-6xl lg:text-[5rem] font-black text-white leading-[1.05] drop-shadow-2xl">
              Sign up to get<br className="hidden lg:block"/> your prompts
            </h2>
          </div>

          {/* Right: Floating Signup Card */}
          <div className="flex justify-center lg:justify-end">
            <div className="bg-white rounded-[32px] shadow-2xl p-8 md:p-10 w-full max-w-[420px]">
              
              <div className="flex flex-col items-center text-center mb-6">
                <Image src="/brand/logo.png" alt="Mira" width={48} height={48} className="rounded-2xl mb-4 shadow-sm" />
                <h3 className="text-2xl font-black text-black tracking-tight">Welcome to Mira</h3>
                <p className="text-sm text-gray-500 mt-1">Join for free to discover curated AI prompts</p>
              </div>

              {signupState?.success ? (
                <div className="bg-green-50 border border-green-200 text-green-700 p-6 rounded-2xl text-center">
                  <span className="text-2xl mb-2 block">✨</span>
                  <p className="font-bold">Check your email!</p>
                  <p className="text-sm mt-1">We sent you a verification link.</p>
                </div>
              ) : (
                <form action={signupAction} className="flex flex-col gap-3">
                  {signupState?.error && (
                    <div className="text-red-500 text-sm text-center font-medium bg-red-50 p-3 rounded-xl mb-2">
                      {signupState.error}
                    </div>
                  )}
                  
                  <input name="name" type="text" placeholder="Your name" required className="border-2 border-gray-100 bg-gray-50 rounded-2xl px-5 py-3.5 focus:border-[#E60023] focus:bg-white outline-none transition-all font-medium text-black placeholder:text-gray-400" />
                  <input name="email" type="email" placeholder="Email address" required className="border-2 border-gray-100 bg-gray-50 rounded-2xl px-5 py-3.5 focus:border-[#E60023] focus:bg-white outline-none transition-all font-medium text-black placeholder:text-gray-400" />
                  <input name="password" type="password" placeholder="Create a password" required className="border-2 border-gray-100 bg-gray-50 rounded-2xl px-5 py-3.5 focus:border-[#E60023] focus:bg-white outline-none transition-all font-medium text-black placeholder:text-gray-400" />
                  
                  <button type="submit" disabled={signupPending} className="bg-[#E60023] text-white rounded-full py-4 font-bold mt-4 hover:bg-red-600 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md flex justify-center items-center">
                    {signupPending ? <Loader2 className="animate-spin w-6 h-6" /> : 'Continue'}
                  </button>

                  <div className="text-center mt-6">
                    <p className="text-sm text-black font-semibold mb-4">
                      Already have an account? <Link href="/login" className="text-black underline hover:text-[#E60023] transition-colors">Log in</Link>
                    </p>
                    <p className="text-[11px] text-gray-400 leading-relaxed max-w-[280px] mx-auto">
                      By continuing, you agree to Mira's <Link href="/terms" className="underline hover:text-gray-600">Terms of Service</Link> and acknowledge you've read our <Link href="/privacy" className="underline hover:text-gray-600">Privacy Policy</Link>.
                    </p>
                  </div>
                </form>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <Footer />

      {/* Waterfall Animation Keyframes */}
      <style jsx global>{`
        @keyframes waterfall-scroll {
          0% { transform: translateY(0); }
          100% { transform: translateY(-33.33%); }
        }
      `}</style>
    </div>
  )
}
