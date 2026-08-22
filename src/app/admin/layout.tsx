import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { signOut } from '@/lib/auth-actions'
import { ArrowLeft, LogOut } from 'lucide-react'
import AdminNav from '@/components/admin/AdminNav'
import Image from 'next/image'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, display_name')
    .eq('id', user.id)
    .single()

  if (!profile || !['admin', 'editor'].includes(profile.role)) redirect('/')

  return (
    <div id="admin-shell" className="admin-shell flex flex-col md:flex-row w-full min-h-screen bg-[#F8F9FA]">
      
      {/* Premium Sidebar / Mobile Bottom Nav */}
      <aside 
        id="admin-sidebar" 
        className="admin-sidebar fixed bottom-0 left-0 right-0 bg-white z-50 flex flex-row md:relative md:w-[280px] md:shrink-0 bg-gradient-to-b from-[#FAFAFA] via-white to-[#F8F9FA] border-t md:border-t-0 md:border-r border-gray-200/60 md:flex-col shadow-[0_-4px_24px_-12px_rgba(0,0,0,0.05)] md:shadow-[4px_0_24px_-12px_rgba(0,0,0,0.05)] md:sticky md:top-0 md:h-screen"
      >
        
        {/* Header */}
        <div id="admin-sidebar-header" className="admin-sidebar-header p-6 pt-8 hidden md:block">
          <Link href="/" className="admin-logo-back flex items-center gap-2 text-gray-400 hover:text-black text-xs font-semibold uppercase tracking-wider transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back to Frontend
          </Link>
          <div className="flex items-center gap-3 px-2">
             <div className="shrink-0 flex items-center justify-center">
               <Image 
                 src="/brand/logo.png" 
                 alt="Mira Logo" 
                 width={70} 
                 height={70} 
                 className="object-contain"
                 unoptimized
               />
             </div>
             <div className="flex flex-col justify-center">
               <h1 className="text-lg font-black text-gray-900 leading-none tracking-tight">Prompts</h1>
               <span className="text-[10px] text-red-600 font-bold tracking-widest uppercase mt-0.5">Admin Panel</span>
             </div>
          </div>
        </div>

        {/* Client Nav */}
        <AdminNav role={profile.role} />

        {/* Floating User Profile Footer */}
        <div id="admin-sidebar-footer" className="admin-sidebar-footer p-4 mt-auto mb-4 mx-4 hidden md:block">
          <div className="admin-user-card bg-white border border-gray-100 rounded-[24px] p-2 flex items-center justify-between shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-3 overflow-hidden pl-1">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-sm font-bold text-gray-600 shrink-0 border border-white shadow-inner">
                {(profile.display_name || user.email)?.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 pr-2">
                <p className="text-sm font-bold truncate text-gray-900 leading-tight">{profile.display_name || user.email}</p>
                <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mt-0.5">{profile.role}</p>
              </div>
            </div>
            
            <form action={signOut} className="shrink-0 pr-1">
              <button 
                id="admin-btn-signout" 
                type="submit" 
                className="admin-btn-signout w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors" 
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </aside>

      <main id="admin-content" className="admin-content flex-1 overflow-y-auto bg-transparent relative pb-20 md:pb-0">
        {/* Subtle decorative background noise or blobs could go here, but keeping it clean for admin */}
        <div className="absolute top-0 right-0 w-1/2 h-64 bg-gradient-to-bl from-red-50/40 to-transparent blur-3xl pointer-events-none -z-10" />
        {children}
      </main>
    </div>
  )
}
