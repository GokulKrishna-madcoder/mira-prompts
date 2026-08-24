import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import SearchBar from './SearchBar'
import FeedbackModal from '@/components/ui/FeedbackModal'
import NotificationsPopover from '@/components/ui/NotificationsPopover'

export default async function TopBar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  let userLastRead = null
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('last_notification_read_at').eq('id', user.id).single()
    userLastRead = profile?.last_notification_read_at || null
  }

  return (
    <header id="topbar" className="topbar h-[80px] shrink-0 flex items-center px-4 md:px-8 gap-4 bg-[var(--color-background)] z-30 sticky top-0 w-full">
      <Link href="/" className="md:hidden shrink-0 flex items-center hover:opacity-80 transition-opacity">
        <Image 
          src="/brand/logo.png" 
          alt="Mira Logo" 
          width={56} 
          height={56} 
          className="object-contain"
          unoptimized
        />
      </Link>
      <SearchBar />

      <div id="topbar-actions" className="topbar-actions flex items-center gap-2 shrink-0">
        {user ? (
          <>
            <NotificationsPopover userLastRead={userLastRead} />
            <FeedbackModal />
            <Link id="user-avatar" href="/settings" className="user-avatar hidden md:flex w-10 h-10 ml-2 rounded-full bg-gray-200 overflow-hidden items-center justify-center font-bold text-gray-600 hover:ring-2 hover:ring-gray-300 transition-all">
              {user.email?.charAt(0).toUpperCase() || 'U'}
            </Link>
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
