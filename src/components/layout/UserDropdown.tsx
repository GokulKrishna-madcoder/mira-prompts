'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LogOut, User, FileText, LayoutDashboard } from 'lucide-react'

export default function UserDropdown({ 
  initial, 
  gradientClass, 
  displayName, 
  email,
  isAdmin
}: { 
  initial: string
  gradientClass: string
  displayName: string
  email: string
  isAdmin: boolean
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <div ref={ref} className="relative hidden md:block">
      <button
        onClick={() => setOpen(!open)}
        className={`w-10 h-10 rounded-full overflow-hidden flex items-center justify-center font-bold text-white hover:ring-2 hover:ring-gray-300 transition-all ${gradientClass}`}
      >
        {initial}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-64 bg-white rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.12)] border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm ${gradientClass}`}>
                {initial}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm text-gray-900 truncate">{displayName}</p>
                <p className="text-xs text-gray-500 truncate">{email}</p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            {isAdmin && (
              <Link href="/admin" onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                <LayoutDashboard className="w-4 h-4 text-gray-400" />
                Dashboard
              </Link>
            )}
            <Link href="/my-prompts" onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
              <FileText className="w-4 h-4 text-gray-400" />
              My Prompts
            </Link>
            <Link href="/settings" onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
              <User className="w-4 h-4 text-gray-400" />
              Profile
            </Link>
          </div>

          {/* Logout */}
          <div className="border-t border-gray-100 pt-1">
            <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors w-full text-left">
              <LogOut className="w-4 h-4" />
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
