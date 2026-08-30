import Sidebar from "@/components/layout/Sidebar"
import TopBar from "@/components/layout/TopBar"
import MobileNav from "@/components/layout/MobileNav"

import { createClient } from "@/lib/supabase/server"

export default async function PublicLayout({
  children,
  modal
}: {
  children: React.ReactNode
  modal: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let userInitial: string | undefined
  let userAvatarUrl: string | undefined
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('display_name, avatar_url').eq('id', user.id).single()
    userInitial = (profile?.display_name || user.email || 'U').charAt(0).toUpperCase()
    userAvatarUrl = profile?.avatar_url || undefined
  }

  return (
    <div id="app-shell" className="app-shell flex w-full min-h-screen bg-[var(--color-background)]">
      <Sidebar />
      <div id="main-column" className="main-column flex-1 flex flex-col min-w-0 w-full">
        <TopBar />
        <div id="content-area" className="content-area flex-1 overflow-y-auto relative pb-20">
          {children}
        </div>
        {modal}
      </div>
      <MobileNav userInitial={userInitial} userAvatarUrl={userAvatarUrl} />
    </div>
  )
}
