import Image from 'next/image'
import Link from 'next/link'
import Footer from '@/components/layout/Footer'

export const metadata = {
  title: 'About - Mira Prompts',
  description: 'Mira Prompts is your space to discover, save, and copy beautiful AI image prompts.',
}

export default function AboutPage() {
  // Use static images from public/about-image
  const staticImages = [
    '/about-image/about (1).png',
    '/about-image/about (2).png',
    '/about-image/about (3).png',
    '/about-image/about (4).png',
    '/about-image/about (5).png',
    '/about-image/about (6).png',
    '/about-image/about (7).png',
    '/about-image/about (8).png',
    '/about-image/about (9).png',
  ]

  return (
    <main className="w-full overflow-hidden">

      {/* ═══════════════════════════════════════════ */}
      {/* HERO — Giant centered text, Pinterest style */}
      {/* ═══════════════════════════════════════════ */}
      <section className="min-h-[80vh] flex flex-col items-center justify-center px-6 py-24">
        <h1 className="text-center text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-black leading-[1.15] tracking-tight max-w-5xl">
          <span className="inline-flex items-center gap-2">
            <Image src="/brand/logo.png" alt="Mira" width={56} height={56} className="inline-block -mt-2 rounded-2xl" unoptimized />
          </span>
          {' '}Mira Prompts is your space to discover
          <span className="inline-block mx-2 align-middle">
            <Image src={staticImages[0]} alt="" width={48} height={48} className="w-10 h-10 md:w-12 md:h-12 rounded-xl object-cover inline-block" unoptimized />
          </span>
          {' '}and explore AI prompts you actually love, not just what&apos;s trending. Save
          <span className="inline-block mx-2 align-middle">
            <Image src={staticImages[1]} alt="" width={48} height={48} className="w-10 h-10 md:w-12 md:h-12 rounded-xl object-cover inline-block" unoptimized />
          </span>
          {' '}prompts, copy what you love and follow your creativity wherever it takes you.
        </h1>

        <Link
          href="/signup"
          className="mt-12 px-8 py-4 bg-black text-white font-bold text-base rounded-full hover:bg-gray-800 transition-colors shadow-sm"
        >
          Sign up
        </Link>
      </section>

      {/* ═══════════════════════════════════════════ */}
      {/* SECTION: Find what inspires you            */}
      {/* Left text, Right image card                */}
      {/* ═══════════════════════════════════════════ */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="flex flex-col md:flex-row items-center gap-16 md:gap-24">
          {/* Text */}
          <div className="w-full md:w-5/12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-black leading-tight">
              Find what inspires you
            </h2>
            <p className="mt-5 text-base md:text-lg text-gray-600 leading-relaxed">
              Explore beautifully curated AI image prompts and discover collections that bring ideas together. You&apos;ll find a steady stream of fresh inspiration, from featured picks by our team to trending prompts tailored to your taste.
            </p>
            <Link
              href="/explore"
              className="inline-block mt-8 px-7 py-3.5 bg-black text-white font-bold text-sm rounded-full hover:bg-gray-800 transition-colors"
            >
              Discover new ideas
            </Link>
          </div>

          {/* Image Card */}
          <div className="w-full md:w-7/12 flex justify-center">
            <div className="w-[340px] bg-white rounded-[24px] shadow-[0_4px_40px_rgba(0,0,0,0.08)] overflow-hidden">
              {/* Card collage grid */}
              <div className="grid grid-cols-2 gap-1 p-3">
                <div className="col-span-1 row-span-2 rounded-[16px] overflow-hidden aspect-[3/4] relative">
                  <Image src={staticImages[2]} alt="Inspired prompt" fill className="object-cover" unoptimized />
                </div>
                <div className="rounded-[16px] overflow-hidden aspect-square relative">
                  <Image src={staticImages[3]} alt="Inspired prompt" fill className="object-cover" unoptimized />
                </div>
                <div className="rounded-[16px] overflow-hidden aspect-square relative">
                  <Image src={staticImages[4]} alt="Inspired prompt" fill className="object-cover" unoptimized />
                </div>
              </div>
              {/* Card info */}
              <div className="px-4 pb-4 pt-2">
                <h3 className="font-bold text-lg text-black">Featured Concepts</h3>
                <p className="text-sm text-gray-500 mt-0.5">Mira Prompts • Curated</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ */}
      {/* SECTION: Copy and create                   */}
      {/* Left image card, Right text                */}
      {/* ═══════════════════════════════════════════ */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="flex flex-col md:flex-row-reverse items-center gap-16 md:gap-24">
          {/* Text */}
          <div className="w-full md:w-5/12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-black leading-tight">
              Copy and create
            </h2>
            <p className="mt-5 text-base md:text-lg text-gray-600 leading-relaxed">
              Every prompt comes with the exact text, AI model, and aspect ratio used. One click to copy, then paste into your favourite AI tool and watch the magic happen. No guesswork, just results.
            </p>
            <Link
              href="/"
              className="inline-block mt-8 px-7 py-3.5 bg-black text-white font-bold text-sm rounded-full hover:bg-gray-800 transition-colors"
            >
              Browse prompts
            </Link>
          </div>

          {/* UI Mockup Card */}
          <div className="w-full md:w-7/12 flex justify-center">
            <div className="w-[340px] bg-gray-50 rounded-[24px] shadow-[0_4px_40px_rgba(0,0,0,0.08)] overflow-hidden">
              {/* Header image */}
              <div className="relative aspect-[4/3] rounded-t-[24px] overflow-hidden">
                <Image src={staticImages[5]} alt="Mockup" fill className="object-cover" unoptimized />
              </div>
              {/* Fake UI elements */}
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1.5 bg-white rounded-full text-xs font-semibold text-gray-600 border border-gray-200">Midjourney</span>
                  <span className="px-3 py-1.5 bg-white rounded-full text-xs font-semibold text-gray-600 border border-gray-200">16:9</span>
                  <span className="px-3 py-1.5 bg-white rounded-full text-xs font-semibold text-gray-600 border border-gray-200">Landscape</span>
                </div>
                <div className="bg-white rounded-2xl p-3 border border-gray-200">
                  <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed">Create a stunning sunset over a cyberpunk city, neon lights reflecting on wet streets, highly detailed, cinematic...</p>
                </div>
                <div className="flex justify-center">
                  <span className="px-6 py-2.5 bg-black text-white font-bold text-sm rounded-full">Copy prompt</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ */}
      {/* SECTION: Tune your taste                   */}
      {/* Left image, Right text                     */}
      {/* ═══════════════════════════════════════════ */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="flex flex-col md:flex-row items-center gap-16 md:gap-24">
          {/* Text */}
          <div className="w-full md:w-5/12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-black leading-tight">
              Tune your taste
            </h2>
            <p className="mt-5 text-base md:text-lg text-gray-600 leading-relaxed">
              See more of what you love and discover prompts that match your style — even when you don&apos;t have the words yet. Save your favourites and build your personal collection of AI inspiration.
            </p>
            <Link
              href="/saved"
              className="inline-block mt-8 px-7 py-3.5 bg-black text-white font-bold text-sm rounded-full hover:bg-gray-800 transition-colors"
            >
              Start saving
            </Link>
          </div>

          {/* Card */}
          <div className="w-full md:w-7/12 flex justify-center">
            <div className="w-[340px] bg-white rounded-[24px] shadow-[0_4px_40px_rgba(0,0,0,0.08)] overflow-hidden">
              <div className="relative aspect-[4/3] rounded-t-[24px] overflow-hidden">
                <Image src={staticImages[6]} alt="Taste" fill className="object-cover" unoptimized />
              </div>
              <div className="p-4">
                <div className="flex gap-2">
                  {[staticImages[7], staticImages[8], staticImages[2]].map((img, i) => (
                    <div key={i} className="w-20 h-20 rounded-xl overflow-hidden relative">
                      <Image src={img} alt="" fill className="object-cover" unoptimized />
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Similar prompts</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ */}
      {/* FOOTER                                     */}
      {/* ═══════════════════════════════════════════ */}
      <Footer />

    </main>
  )
}
