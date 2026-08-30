'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Home, Compass, Plus, Bookmark, ExternalLink, User, LayoutDashboard, FileText, UserCircle, LogOut, Settings } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const getAvatarGradient = (letter: string) => {
  const gradients = [
    'bg-gradient-to-br from-blue-700 to-blue-950',
    'bg-gradient-to-br from-emerald-700 to-emerald-950',
    'bg-gradient-to-br from-purple-700 to-purple-950',
    'bg-gradient-to-br from-rose-700 to-rose-950',
    'bg-gradient-to-br from-amber-700 to-amber-950'
  ]
  if (!letter) return gradients[0]
  return gradients[letter.charCodeAt(0) % gradients.length]
}

export default function MobileNav({ userInitial, userAvatarUrl }: { userInitial?: string; userAvatarUrl?: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const [showSettings, setShowSettings] = useState(false)
  const navRef = useRef<HTMLElement>(null)

  // Hide on admin routes
  if (pathname.startsWith('/admin')) return null

  // Close popover when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setShowSettings(false)
    }
    if (showSettings) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showSettings])

  const handleLogout = async () => {
    setShowSettings(false)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <nav ref={navRef} className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-t border-gray-200/60 px-2 pb-[env(safe-area-inset-bottom)]">
      
      {showSettings && (
        <div className="absolute bottom-[72px] right-2 w-[220px] bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 p-2 flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-200">
          {!userInitial ? (
            <Link href="/login" onClick={() => setShowSettings(false)} className="px-4 py-3 rounded-xl hover:bg-gray-50 text-black font-semibold text-sm transition-colors">
              Log in / Sign up
            </Link>
          ) : (
            <>
              <Link href="/dashboard" onClick={() => setShowSettings(false)} className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-gray-50 text-black font-semibold text-sm transition-colors">
                <LayoutDashboard className="w-4 h-4 text-gray-500" />
                Dashboard
              </Link>
              <Link href="/posts" onClick={() => setShowSettings(false)} className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-gray-50 text-black font-semibold text-sm transition-colors">
                <FileText className="w-4 h-4 text-gray-500" />
                My posts
              </Link>
              <Link href="/dashboard?modal=profile" onClick={() => setShowSettings(false)} className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-gray-50 text-black font-semibold text-sm transition-colors">
                <UserCircle className="w-4 h-4 text-gray-500" />
                Profile
              </Link>
              <Link href="/preferences" onClick={() => setShowSettings(false)} className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-gray-50 text-black font-semibold text-sm transition-colors">
                <Settings className="w-4 h-4 text-gray-500" />
                Preferences
              </Link>
            </>
          )}

          <div className="h-px bg-gray-100 my-1 mx-2" />
          <span className="px-4 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wide">Support & Legal</span>
          <Link href="/about" onClick={() => setShowSettings(false)} className="px-4 py-2.5 rounded-xl hover:bg-gray-50 text-black font-semibold text-sm transition-colors">
            About Mira Prompts
          </Link>
          <Link href="/privacy" onClick={() => setShowSettings(false)} className="flex items-center justify-between px-4 py-2.5 rounded-xl hover:bg-gray-50 text-black font-semibold text-sm transition-colors group">
            Privacy policy <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
          </Link>
          <Link href="/terms" onClick={() => setShowSettings(false)} className="flex items-center justify-between px-4 py-2.5 rounded-xl hover:bg-gray-50 text-black font-semibold text-sm transition-colors group">
            Terms of service <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
          </Link>

          {userInitial && (
            <>
              <div className="h-px bg-gray-100 my-1 mx-2" />
              <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-red-50 text-red-600 font-semibold text-sm transition-colors w-full text-left">
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </>
          )}
        </div>
      )}

      <div className="flex items-center justify-around h-16 relative">
        <MobileNavIcon href="/" icon={<Home className="w-6 h-6" />} label="Home" active={pathname === '/'} />
        <MobileNavIcon href="/explore" icon={<Compass className="w-6 h-6" />} label="Explore" active={pathname === '/explore'} />
        <MobileNavIcon href="/submit-prompt" icon={<Plus className="w-6 h-6" strokeWidth={3} />} label="Create" active={pathname === '/submit-prompt'} />
        <MobileNavIcon href="/saved" icon={<Bookmark className="w-6 h-6" />} label="Saved" active={pathname === '/saved'} />
        
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-colors ${
            showSettings || pathname === '/preferences' ? 'text-black' : 'text-gray-400'
          }`}
        >
          {userInitial ? (
            <div className={`w-6 h-6 rounded-full overflow-hidden flex items-center justify-center font-bold text-white text-[10px] ${!userAvatarUrl ? getAvatarGradient(userInitial) : 'bg-white'}`}>
              {userAvatarUrl ? (
                <img src={userAvatarUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                userInitial
              )}
            </div>
          ) : (
            <User className="w-6 h-6" />
          )}
          <span className="text-[10px] font-bold">{userInitial ? 'Profile' : 'Menu'}</span>
        </button>
      </div>
    </nav>
  )
}

function MobileNavIcon({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-colors ${
        active ? 'text-black' : 'text-gray-400'
      }`}
    >
      {icon}
      <span className="text-[10px] font-bold">{label}</span>
    </Link>
  )
}

