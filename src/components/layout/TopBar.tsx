import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import SearchBar from './SearchBar'
import FeedbackModal from '@/components/ui/FeedbackModal'
import NotificationsPopover from '@/components/ui/NotificationsPopover'
import UserDropdown from './UserDropdown'
import { getAvatarGradient } from '@/lib/avatar'
import MobileDashboardToggle from '@/components/dashboard/MobileDashboardToggle'

export default async function TopBar({ showDesktopLogo = false }: { showDesktopLogo?: boolean }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  let userLastRead = null
  let initial = 'U'
  let displayName = 'User'
  let email = ''
  let isAdmin = false
  let avatarUrl = null

  if (user) {
    const { data: profile } = await supabase.from('profiles').select('last_notification_read_at, display_name, role, avatar_url').eq('id', user.id).single()
    userLastRead = profile?.last_notification_read_at || null
    displayName = profile?.display_name || user.email?.split('@')[0] || 'User'
    initial = displayName.charAt(0).toUpperCase()
    email = user.email || ''
    isAdmin = profile?.role === 'admin' || profile?.role === 'editor'
    avatarUrl = profile?.avatar_url || null
  }

  return (
    <header id="topbar" className="topbar h-[80px] shrink-0 flex items-center px-4 md:px-8 gap-2 bg-[var(--color-background)] z-30 sticky top-0 w-full border-b border-gray-100">
      <MobileDashboardToggle />
      <Link href="/" className="md:hidden shrink-0 flex items-center hover:opacity-80 transition-opacity">
        <Image 
          src="/brand/mobilevlogo.png" 
          alt="Mira Logo" 
          width={36} 
          height={36} 
          className="object-contain"
          unoptimized
        />
      </Link>

      {showDesktopLogo && (
        <Link href="/" className="hidden md:flex shrink-0 items-center hover:opacity-80 transition-opacity mr-4">
          <Image 
            src="/brand/logo.png" 
            alt="Mira Logo" 
            width={80} 
            height={28} 
            className="object-contain"
            unoptimized
          />
        </Link>
      )}

      <div className="flex-1">
        <SearchBar />
      </div>

      <div id="topbar-actions" className="topbar-actions flex items-center gap-2 shrink-0">
        {user ? (
          <>
            <Link href="/submit-prompt" className="hidden md:flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-bold rounded-full hover:bg-gray-800 transition-colors">
              <span className="text-lg leading-none mb-[2px]">+</span> Create
            </Link>
            <NotificationsPopover userLastRead={userLastRead} />
            <FeedbackModal />
            <UserDropdown 
              initial={initial} 
              gradientClass={getAvatarGradient(initial)} 
              displayName={displayName} 
              email={email}
              isAdmin={isAdmin}
              avatarUrl={avatarUrl}
            />
          </>
        ) : (
          <div id="auth-buttons" className="auth-buttons hidden md:flex items-center gap-2 ml-2">
            <Link id="btn-login" href="/login" className="btn-login px-4 py-2 font-medium hover:bg-gray-100 rounded-full transition-colors">Log in</Link>
            <Link id="btn-signup" href="/signup" className="btn-signup px-4 py-2 font-medium bg-black hover:bg-gray-800 text-white rounded-full transition-colors">Sign up</Link>
          </div>
        )}
      </div>
    </header>
  )
}

