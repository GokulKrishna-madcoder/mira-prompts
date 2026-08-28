'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { LayoutDashboard, FileText, PlusCircle, Bookmark, Bell, User, Shield, Settings, X, Home } from 'lucide-react'
import { getAvatarGradient } from '@/lib/avatar'

export default function DashboardSidebar({ profile, email, userInitial }: { profile: any, email: string, userInitial: string }) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleToggle = () => setIsOpen(prev => !prev)
    window.addEventListener('toggle-dashboard-sidebar', handleToggle)
    return () => window.removeEventListener('toggle-dashboard-sidebar', handleToggle)
  }, [])

  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  const navGroups = [
    {
      label: 'CONTENT',
      items: [
        { name: 'Home', href: '/', icon: Home },
        { name: 'My Posts', href: '/posts', icon: FileText },
        { name: 'Add Post', href: '/submit-prompt', icon: PlusCircle, isRed: true },
        { name: 'Saved Posts', href: '/saved', icon: Bookmark },
      ]
    },
    {
      label: 'AUDIENCE',
      items: [
        { name: 'Notifications', href: '/notifications', icon: Bell },
      ]
    },
    {
      label: 'ACCOUNT',
      items: [
        { name: 'Profile', href: '?modal=profile', icon: User },
        { name: 'Security', href: '/security', icon: Shield },
        { name: 'Preferences', href: '/preferences', icon: Settings },
      ]
    }
  ]

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setIsOpen(false)}
        />
      )}
      <aside className={`w-[280px] shrink-0 border-r border-gray-200 bg-[#fafafa] flex flex-col h-[100dvh] md:h-[calc(100vh-80px)] overflow-y-auto transition-transform duration-300 z-50 
        ${isOpen ? 'fixed top-0 left-0 translate-x-0' : 'fixed top-0 left-0 -translate-x-full md:sticky md:translate-x-0'}`}>
        
        {/* Mobile Close Button */}
        <div className="md:hidden flex justify-end p-4 pb-0">
          <button onClick={() => setIsOpen(false)} className="p-2 text-gray-500 hover:bg-gray-200 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Desktop Logo */}
        <div className="hidden md:flex items-center justify-center pt-8">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <Image src="/brand/logo.png" alt="Mira Logo" width={44} height={44} unoptimized />
          </Link>
        </div>

        {/* Profile Header */}
      <div className="flex flex-col items-center pt-6 pb-6 border-b border-gray-200 px-6">
        {profile?.avatar_url ? (
          <div className="w-16 h-16 rounded-full overflow-hidden mb-3 shadow-sm border-2 border-white">
            <Image src={profile.avatar_url} alt="Avatar" width={64} height={64} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className={`w-16 h-16 rounded-full text-white flex items-center justify-center text-2xl font-bold mb-3 shadow-sm border-2 border-white ${getAvatarGradient(userInitial)}`}>
            {userInitial}
          </div>
        )}
        <h2 className="font-bold text-gray-900 text-base">{profile?.display_name || 'User'}</h2>
        <p className="text-xs text-gray-400 mt-1 mb-4 truncate w-full text-center">{email}</p>
        <Link href="?modal=profile" className="w-full py-2 bg-[#E11D48] text-white text-sm font-bold rounded-full text-center hover:bg-red-700 transition-colors">
          Edit Profile
        </Link>
      </div>

      {/* Overview Button */}
      <div className="px-4 py-4">
        <Link href="/dashboard" className={`flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${pathname === '/dashboard' ? 'bg-gray-100 text-black font-bold' : 'text-gray-600 hover:bg-gray-100 font-semibold'}`}>
          <div className="flex items-center gap-3">
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-sm">Overview</span>
          </div>
          <span className="text-gray-400 text-xs">›</span>
        </Link>
      </div>

      {/* Nav Groups */}
      <div className="flex-1 px-4 space-y-6 pb-8">
        {navGroups.map(group => (
          <div key={group.label}>
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-4">{group.label}</h3>
            <ul className="space-y-1">
              {group.items.map(item => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                const finalHref = item.name === 'Profile' ? '?modal=profile' : item.href;
                return (
                  <li key={item.name}>
                    <Link href={finalHref} className={`flex items-center justify-between px-4 py-2.5 rounded-xl transition-colors ${isActive ? 'bg-gray-100 font-bold' : 'font-semibold'} ${item.isRed ? (isActive ? 'text-red-600' : 'text-red-500 hover:bg-red-50') : (isActive ? 'text-black' : 'text-gray-500 hover:text-black hover:bg-gray-100')}`}>
                      <div className="flex items-center gap-3">
                        <item.icon className="w-4 h-4" />
                        <span className="text-sm">{item.name}</span>
                      </div>
                      <span className="text-gray-300 text-xs">›</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>
    </aside>
    </>
  )
}
