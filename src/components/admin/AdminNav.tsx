'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FileText, PlusCircle, FolderOpen, Tag, Users, TrendingUp, MessageSquare, ShieldAlert, Webhook, Inbox } from 'lucide-react'

const navItems = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/prompts', label: 'Prompts', icon: FileText },
  { href: '/admin/prompts/new', label: 'New Prompt', icon: PlusCircle },
  { href: '/admin/submissions', label: 'Submissions', icon: Inbox },
  { href: '/admin/categories', label: 'Categories', icon: FolderOpen },
  { href: '/admin/tags', label: 'Tags', icon: Tag },
  { href: '/admin/members', label: 'Members', icon: Users },
  { href: '/admin/analytics', label: 'Analytics', icon: TrendingUp },
  { href: '/admin/tickets', label: 'Tickets', icon: MessageSquare },
  { href: '/admin/audit', label: 'Audit Logs', icon: ShieldAlert },
  { href: '/admin/webhooks', label: 'Webhooks', icon: Webhook },
]

export default function AdminNav({ role }: { role: string }) {
  const pathname = usePathname()

  // Filter items based on role
  const allowedItems = navItems.filter(item => {
    if (role === 'admin') return true
    if (role === 'editor') {
      return ['/admin/prompts', '/admin/prompts/new', '/admin/submissions', '/admin/categories', '/admin/tags'].includes(item.href)
    }
    return false
  })

  return (
    <nav id="admin-nav" className="admin-nav w-full md:w-auto md:flex-1 px-2 py-3 md:px-4 md:py-6 flex flex-row md:flex-col overflow-x-auto md:overflow-y-auto space-x-2 md:space-x-0 md:space-y-1.5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <div className="hidden md:block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 px-3">Menu</div>
      
      {allowedItems.map(item => {
        // Exact match for overview, prefix match for others to keep active state when editing
        const isActive = item.href === '/admin' 
          ? pathname === '/admin' 
          : pathname.startsWith(item.href)

        return (
          <Link
            key={item.href}
            id={`admin-nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
            href={item.href}
            className={`admin-nav-link flex-shrink-0 flex items-center justify-center md:justify-start gap-2 md:gap-3.5 px-4 py-2.5 md:py-3.5 text-sm md:rounded-2xl rounded-full transition-all duration-300 relative group ${
              isActive
                ? 'bg-gradient-to-r from-gray-900 via-gray-800 to-black text-white shadow-lg shadow-black/10 font-semibold md:transform md:scale-[1.02]'
                : 'text-gray-500 font-medium hover:bg-gray-100 md:hover:bg-white hover:shadow-sm hover:text-gray-900 border border-transparent md:hover:border-gray-100/50'
            }`}
          >
            {/* Active glowing dot effect (Desktop only) */}
            {isActive && (
              <div className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
            )}

            <item.icon 
              className={`w-4 h-4 md:w-5 md:h-5 transition-transform duration-300 ${
                isActive 
                  ? 'text-white md:scale-110' 
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
