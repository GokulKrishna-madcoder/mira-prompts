import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardSidebar from '@/components/dashboard/DashboardSidebar'
import TopBar from '@/components/layout/TopBar'
import ProfileModal from '@/components/dashboard/ProfileModal'
import { Suspense } from 'react'
import MobileNav from '@/components/layout/MobileNav'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  const userInitial = (profile?.display_name || user.email || 'U').charAt(0).toUpperCase()

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#F9FAFB]">
      <TopBar />
      <div className="flex-1 flex min-w-0 h-[calc(100vh-80px)] overflow-hidden relative">
        <DashboardSidebar profile={profile} email={user.email || ''} userInitial={userInitial} />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative z-0 pb-20 md:pb-8">
          {children}
        </main>
      </div>
      <Suspense fallback={null}>
        <ProfileModal profile={profile} email={user.email || ''} />
      </Suspense>
      <MobileNav userInitial={userInitial} />
    </div>
  )
}
