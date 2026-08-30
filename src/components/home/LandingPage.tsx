'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Footer from '@/components/layout/Footer'

type PromptPreview = {
  id: string
  image_url: string
  title: string
}

// Split prompts into columns for the waterfall effect
function splitIntoColumns(items: PromptPreview[], cols: number): PromptPreview[][] {
  const columns: PromptPreview[][] = Array.from({ length: cols }, () => [])
  items.forEach((item, i) => columns[i % cols].push(item))
  return columns
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

  useEffect(() => {
    const interval = setInterval(() => setWordIdx(i => (i + 1) % cycleWords.length), 2400)
    return () => clearInterval(interval)
  }, [])

  // Triple the prompts for seamless infinite scroll
  const tripled = [...prompts, ...prompts, ...prompts]
  const columns = splitIntoColumns(tripled, 5)

  return (
    <div className="fixed inset-0 z-[100] min-h-screen flex flex-col bg-white overflow-y-auto overflow-x-hidden">

      {/* ─── NAVBAR ─── */}
      <nav className="sticky top-0 z-[110] bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between px-5 h-16">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/brand/logo.png" alt="Mira" width={36} height={36} className="w-9 h-9 rounded-xl" />
            <span className="text-lg font-bold tracking-tight text-black hidden sm:inline">Mira Prompts</span>
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

      {/* ─── HERO + WATERFALL ─── */}
      <section className="relative flex-1">

        {/* Waterfall Grid Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="flex gap-3 px-3 h-full">
            {columns.map((col, colIdx) => (
              <div
                key={colIdx}
                className={`flex-1 flex flex-col gap-3 ${colIdx > 2 ? 'hidden lg:flex' : ''} ${colIdx > 1 ? 'hidden md:flex' : ''}`}
                style={{
                  animation: `waterfall-scroll ${20 + colIdx * 4}s linear infinite`,
                  animationDirection: colIdx % 2 === 0 ? 'normal' : 'reverse',
                }}
              >
                {col.map((p, i) => (
                  <div key={`${p.id}-${i}`} className="rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0">
                    <Image
                      src={p.image_url}
                      alt={p.title}
                      width={300}
                      height={400}
                      className="w-full h-auto object-cover"
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-b from-white via-white/80 to-white/40" />
          <div className="absolute bottom-0 left-0 right-0 h-80 bg-gradient-to-t from-white to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-24 sm:pt-32 md:pt-40 pb-16">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-black leading-[1.1] max-w-4xl">
            Get your next
            <span className="block text-red-500 mt-1 transition-all duration-500" key={wordIdx}>
              {cycleWords[wordIdx]}
            </span>
          </h1>

          <p className="text-gray-500 text-lg md:text-xl max-w-xl mt-6 leading-relaxed">
            Discover, copy, and save beautifully curated AI image prompts for Midjourney, DALL·E, and more.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 mt-10">
            <Link
              href="/signup"
              className="bg-red-500 text-white font-bold text-lg px-10 py-4 rounded-full hover:bg-red-600 hover:scale-105 active:scale-95 transition-all shadow-lg hover:shadow-xl"
            >
              Start Exploring — It&apos;s Free
            </Link>
            <Link
              href="/login"
              className="text-gray-700 font-semibold text-lg px-8 py-4 rounded-full border border-gray-200 bg-white hover:bg-gray-50 hover:scale-105 active:scale-95 transition-all"
            >
              Log in
            </Link>
          </div>

          <p className="text-xs text-gray-400 mt-6">Already used by creators and designers worldwide.</p>
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

      {/* ─── FINAL CTA ─── */}
      <section className="relative z-10 bg-gray-50 py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-black text-black tracking-tight mb-4">
            Ready to create something amazing?
          </h2>
          <p className="text-gray-500 text-lg mb-10">
            Join thousands of creators using Mira Prompts to generate jaw-dropping AI images.
          </p>
          <Link
            href="/signup"
            className="inline-block bg-red-500 text-white font-bold text-lg px-12 py-4 rounded-full hover:bg-red-600 hover:scale-105 active:scale-95 transition-all shadow-lg"
          >
            Sign Up Free
          </Link>
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
