import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="w-full bg-red-500 text-white overflow-hidden rounded-t-[32px]">
      
      {/* Top Section: Newsletter + Links */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 pt-16 md:pt-20 pb-12">
        <div className="flex flex-col lg:flex-row justify-between gap-12 lg:gap-16">
          
          {/* Left: Tagline + Newsletter + Socials */}
          <div className="lg:w-[340px] flex flex-col gap-5">
            <h3 className="font-bold text-lg text-white/90">Stay Inspired ✦</h3>
            <div className="flex w-full max-w-sm items-center gap-2">
              <input 
                type="email" 
                placeholder="email@gmail.com" 
                className="flex-1 bg-transparent border border-white/30 text-white placeholder:text-white/50 px-5 py-3 rounded-full outline-none focus:border-white transition-colors text-sm" 
              />
              <button 
                type="button" 
                className="bg-white text-red-500 px-6 py-3 rounded-full font-bold text-sm hover:scale-105 active:scale-95 transition-transform whitespace-nowrap"
              >
                Subscribe
              </button>
            </div>
            
            {/* Social Icons */}
            <div className="flex gap-3 mt-1">
              <Link 
                href="https://www.instagram.com/mira.promptz" 
                target="_blank" 
                className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center hover:bg-white/10 transition-colors"
                aria-label="Instagram"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
              </Link>
              <Link 
                href="https://x.com/miraprompts" 
                target="_blank" 
                className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center hover:bg-white/10 transition-colors"
                aria-label="X (Twitter)"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </Link>
              <a 
                href="mailto:mirapromts@gmail.com" 
                className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center hover:bg-white/10 transition-colors"
                aria-label="Email"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Right: Link Columns */}
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-8 text-sm">
            {/* Quick Links */}
            <div>
              <h4 className="font-bold text-white mb-5">Quick Links</h4>
              <ul className="space-y-3">
                <li><Link href="/" className="text-white/70 hover:text-white transition-colors">Home</Link></li>
                <li><Link href="/explore" className="text-white/70 hover:text-white transition-colors">Explore</Link></li>
                <li><Link href="/submit-prompt" className="text-white/70 hover:text-white transition-colors">Submit Prompt</Link></li>
                <li><Link href="/pricing" className="text-white/70 hover:text-white transition-colors">Pricing</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-bold text-white mb-5">Company</h4>
              <ul className="space-y-3">
                <li><Link href="/about" className="text-white/70 hover:text-white transition-colors">About us</Link></li>
                <li><Link href="https://www.instagram.com/mira.promptz" target="_blank" className="text-white/70 hover:text-white transition-colors">Instagram</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-bold text-white mb-5">Legal</h4>
              <ul className="space-y-3">
                <li><Link href="/privacy" className="text-white/70 hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-white/70 hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-white/15 mx-6 md:mx-12" />

      {/* Massive Typography Centerpiece */}
      <div className="w-full px-4 pt-8 pb-6 md:pt-12 md:pb-10">
        <div className="text-[11vw] md:text-[13vw] font-black tracking-tighter leading-[0.85] text-white select-none text-center w-full lowercase whitespace-nowrap">
          <Link href="/" className="text-white no-underline hover:text-white cursor-pointer">
            mira prompts
          </Link>
        </div>
      </div>

      {/* Bottom copyright */}
      <div className="text-center pb-6 md:pb-8 text-white/50 text-xs px-4">
        <span>&copy; 2026 Mira Prompts. All rights reserved.</span>
      </div>
    </footer>
  )
}
