'use client'

import { useState, useEffect, useActionState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Search, Sparkles, Loader2, Compass, Layers, Cpu } from 'lucide-react'
import { signUp } from '@/lib/auth-actions'
import Footer from '@/components/layout/Footer'

type PromptPreview = {
  id: string
  image_url: string
  title: string
}

// Cycling words for the hero headline
const cycleWords = [
  'Midjourney prompt',
  'portrait masterpiece',
  'creative concept',
  'cinematic scene',
  'viral AI image',
]

export default function LandingPage({ prompts }: { prompts: PromptPreview[] }) {
  const [wordIdx, setWordIdx] = useState(0)

  // Signup Form State
  const [signupState, signupAction, signupPending] = useActionState(
    async (_prev: any, formData: FormData) => await signUp(formData) ?? null,
    null
  )

  useEffect(() => {
    const interval = setInterval(() => setWordIdx(i => (i + 1) % cycleWords.length), 2400)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed inset-0 z-[100] min-h-screen bg-white overflow-y-auto overflow-x-hidden">

      {/* ─── NAVBAR ─── */}
      <nav className="sticky top-0 z-[110] bg-white/80 backdrop-blur-xl border-b border-gray-100">
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

       {/* 🚀 ANIMATED HERO SECTION 🚀 */}
      <section className="relative min-h-[90vh] flex flex-col bg-slate-950 overflow-hidden">
        {/* Volumetric Lighting */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }} 
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-violet-600/30 rounded-full blur-[120px] mix-blend-screen"
          />
          <motion.div 
            animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.4, 0.2] }} 
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-1/4 right-1/4 w-[700px] h-[700px] bg-cyan-600/20 rounded-full blur-[150px] mix-blend-screen"
          />
          <motion.div 
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.5, 0.2] }} 
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[150px] mix-blend-screen"
          />
        </div>

        {/* Ambient Particles */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 40 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                y: "100vh", 
                x: `${Math.random() * 100}vw`,
                opacity: 0,
                scale: Math.random() * 0.5 + 0.5
              }}
              animate={{ 
                y: "-10vh",
                opacity: [0, 0.8, 0],
              }}
              transition={{ 
                duration: Math.random() * 10 + 10, 
                repeat: Infinity,
                delay: Math.random() * 5,
                ease: "linear" 
              }}
              className="absolute w-1.5 h-1.5 rounded-full bg-cyan-200/60 blur-[1px]"
            />
          ))}
        </div>

        {/* Floating Holographic Cards */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <motion.div 
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ duration: 20, repeat: Infinity, repeatType: 'reverse', ease: "linear" }}
            className="relative w-full max-w-[1200px] h-full"
          >
            {/* Left Card */}
            <motion.div 
              animate={{ y: [0, -30, 0], rotate: [0, -5, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-[20%] left-[5%] md:left-[10%] w-[200px] md:w-[280px] p-4 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-[0_0_30px_rgba(139,92,246,0.2)] hidden sm:block"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-violet-500/20 rounded-lg">
                  <Compass className="w-5 h-5 text-violet-300" />
                </div>
                <div className="text-violet-200 font-medium text-sm">Exploration</div>
              </div>
              <div className="h-24 rounded-xl bg-gradient-to-br from-violet-500/20 to-transparent border border-white/5 mb-3" />
              <div className="h-3 w-3/4 bg-white/10 rounded-full mb-2" />
              <div className="h-3 w-1/2 bg-white/10 rounded-full" />
            </motion.div>

            {/* Right Card */}
            <motion.div 
              animate={{ y: [0, 40, 0], rotate: [0, 5, 0] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute bottom-[20%] right-[5%] md:right-[10%] w-[220px] md:w-[320px] p-5 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-[0_0_30px_rgba(6,182,212,0.2)] hidden md:block"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-cyan-500/20 rounded-lg">
                  <Layers className="w-6 h-6 text-cyan-300" />
                </div>
                <div className="text-cyan-200 font-medium text-sm">Structure Generation</div>
              </div>
              <div className="h-32 rounded-xl bg-gradient-to-br from-cyan-500/20 to-transparent border border-white/5 mb-4 relative overflow-hidden">
                 <motion.div 
                    animate={{ x: ["-100%", "200%"] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent skew-x-12"
                 />
              </div>
              <div className="flex gap-2">
                 <div className="h-2 flex-1 bg-white/10 rounded-full" />
                 <div className="h-2 flex-1 bg-white/10 rounded-full" />
                 <div className="h-2 flex-1 bg-white/10 rounded-full" />
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom Fade out to match the white section below */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white to-transparent z-20 pointer-events-none" />

        {/* Hero Content */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-32 sm:pt-40 md:pt-48 pb-32 flex-1"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-medium text-cyan-100 tracking-wide">The Next Generation of AI Prompts</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.1] max-w-4xl drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
            Get your next
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400 mt-2 transition-all duration-500 filter drop-shadow-[0_0_20px_rgba(139,92,246,0.4)]" key={wordIdx}>
              {cycleWords[wordIdx]}
            </span>
          </h1>

          <p className="text-slate-300 text-lg md:text-xl max-w-xl mt-8 leading-relaxed font-light">
            Discover, copy, and save beautifully curated AI image prompts for Midjourney, DALL-E, and Stable Diffusion in a stunning visual gallery.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 mt-12">
            <Link
              href="/signup"
              className="group relative px-10 py-4 rounded-full bg-white text-slate-950 font-bold text-lg hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(255,255,255,0.3)]"
            >
              Start Exploring
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full border-2 border-dashed border-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity" 
              />
            </Link>
            <Link
              href="/login"
              className="text-white font-semibold text-lg px-8 py-4 rounded-full border border-white/20 bg-white/5 backdrop-blur-md hover:bg-white/10 hover:scale-105 active:scale-95 transition-all"
            >
              Log in
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ─── FEATURE HIGHLIGHT SECTION ─── */}
      <section className="relative z-10 bg-white py-24 px-6 overflow-hidden">
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
      <section className="relative z-10 bg-white py-20 px-6">
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
      <section className="relative z-10 min-h-[90vh] flex items-center justify-center overflow-hidden bg-black">
        
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
