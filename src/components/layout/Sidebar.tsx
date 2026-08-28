'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Home, Compass, Bookmark, Plus } from 'lucide-react'
import SettingsPopover from '@/components/ui/SettingsPopover'

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside id="sidebar" className="sidebar w-[72px] shrink-0 border-r border-[var(--color-border)] bg-[var(--color-background)] hidden md:flex flex-col items-center py-4 z-40 sticky top-0 h-screen">
      <Link id="sidebar-logo" href="/" className="sidebar-logo mb-8 mt-4 hover:opacity-80 transition-opacity">
        <Image 
          src="/brand/logo.png" 
          alt="Mira Logo" 
          width={44} 
          height={44} 
          className="object-contain w-auto h-auto"
          unoptimized
        />
      </Link>

      <nav id="sidebar-nav" className="sidebar-nav flex flex-col gap-4 flex-1">
        <SidebarIcon id="nav-home" href="/" icon={<Home className="w-6 h-6" strokeWidth={2.5} />} active={pathname === '/'} />
        <SidebarIcon id="nav-explore" href="/explore" icon={<Compass className="w-6 h-6" strokeWidth={2.5} />} active={pathname === '/explore'} />
        <SidebarIcon id="nav-create" href="/submit-prompt" icon={<Plus className="w-6 h-6" strokeWidth={3} />} active={pathname === '/submit-prompt'} isAction />
        <SidebarIcon id="nav-saved" href="/saved" icon={<Bookmark className="w-6 h-6" strokeWidth={2.5} />} active={pathname === '/saved'} />
      </nav>

      <div id="sidebar-footer" className="sidebar-footer mt-auto flex flex-col gap-4 w-full">
        <SettingsPopover />
      </div>
    </aside>
  )
}

function SidebarIcon({ href, icon, id, active, isAction }: { href: string; icon: React.ReactNode; id: string; active?: boolean; isAction?: boolean }) {
  const baseClasses = isAction
    ? "bg-[#E11D48] text-white hover:bg-red-700 shadow-sm"
    : active 
      ? "bg-black text-white shadow-md transform scale-105" 
      : "text-gray-500 hover:bg-gray-100 hover:text-black"

  return (
    <Link 
      id={id} 
      href={href} 
      className={`sidebar-icon w-12 h-12 flex items-center justify-center rounded-full transition-all ${baseClasses}`}
    >
      {icon}
    </Link>
  )
}
