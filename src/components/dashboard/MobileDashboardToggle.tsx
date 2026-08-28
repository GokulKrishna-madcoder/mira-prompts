'use client'

import { usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'

export default function MobileDashboardToggle() {
  const pathname = usePathname()
  
  const isDashboardRoute = ['/dashboard', '/posts', '/saved', '/submit-prompt', '/security', '/preferences', '/notifications', '/profile'].some(route => pathname?.startsWith(route))

  if (!isDashboardRoute) return null

  return (
    <button 
      onClick={() => window.dispatchEvent(new Event('toggle-dashboard-sidebar'))}
      className="md:hidden p-2 -ml-2 text-gray-700 hover:text-black rounded-lg hover:bg-gray-100 transition-colors"
      aria-label="Toggle Dashboard Menu"
    >
      <Menu className="w-6 h-6" />
    </button>
  )
}
