'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FileText, PlusCircle, FolderOpen, Tag, Users, TrendingUp, MessageSquare, ShieldAlert, Webhook } from 'lucide-react'

const navItems = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/prompts', label: 'Prompts', icon: FileText },
  { href: '/admin/prompts/new', label: 'New Prompt', icon: PlusCircle },
  { href: '/admin/categories', label: 'Categories', icon: FolderOpen },
  { href: '/admin/tags', label: 'Tags', icon: Tag },
  { href: '/admin/members', label: 'Members', icon: Users },
  { href: '/admin/analytics', label: 'Analytics', icon: TrendingUp },
  { href: '/admin/tickets', label: 'Tickets', icon: MessageSquare },
  { href: '/admin/audit', label: 'Audit Logs', icon: ShieldAlert },
  { href: '/admin/webhooks', label: 'Webhooks', icon: Webhook },
]

export default function AdminNav() {
  const pathname = usePathname()

  return (
    <nav id="admin-nav" className="admin-nav flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 px-3">Menu</div>
      
      {navItems.map(item => {
        // Exact match for overview, prefix match for others to keep active state when editing
        const isActive = item.href === '/admin' 
          ? pathname === '/admin' 
          : pathname.startsWith(item.href)

        return (
          <Link
            key={item.href}
            id={`admin-nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
            href={item.href}
            className={`admin-nav-link flex items-center gap-3.5 px-4 py-3.5 text-sm rounded-2xl transition-all duration-300 relative group ${
              isActive
                ? 'bg-gradient-to-r from-gray-900 via-gray-800 to-black text-white shadow-lg shadow-black/10 font-semibold transform scale-[1.02]'
                : 'text-gray-500 font-medium hover:bg-white hover:shadow-sm hover:text-gray-900 border border-transparent hover:border-gray-100/50'
            }`}
          >
            {/* Active glowing dot effect */}
            {isActive && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
            )}

            <item.icon 
              className={`w-5 h-5 transition-transform duration-300 ${
                isActive 
                  ? 'text-white scale-110' 
                  : 'text-gray-400 group-hover:scale-110 group-hover:text-gray-600'
              }`} 
              strokeWidth={isActive ? 2.5 : 2} 
            />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
