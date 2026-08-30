import Link from 'next/link'
import { ArrowLeft, Unplug, Compass } from 'lucide-react'
import Sidebar from '@/components/layout/Sidebar'
import TopBar from '@/components/layout/TopBar'
import MobileNav from '@/components/layout/MobileNav'
import Footer from '@/components/layout/Footer'
import { createClient } from '@/lib/supabase/server'

export default async function NotFound() {
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
        
        {/* Scrollable Content Area */}
        <div id="content-area" className="content-area flex-1 overflow-y-auto relative flex flex-col">
          
          {/* 404 Centerpiece */}
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center animate-in fade-in zoom-in-95 duration-700">
            <Unplug className="w-16 h-16 text-gray-300 mb-6" strokeWidth={1.5} />
            
            <h1 className="text-[100px] md:text-[150px] font-black text-black leading-none tracking-tighter mb-4 select-none drop-shadow-sm">
              404
            </h1>
            
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-3 tracking-tight">
              Page not found
            </h2>
            
            <p className="text-gray-500 max-w-md mx-auto mb-10 text-lg leading-relaxed">
              The prompt or page you are looking for doesn't exist, has been moved, or is temporarily unavailable.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link 
                href="/" 
                className="group flex items-center justify-center gap-2 bg-red-500 text-white px-8 py-4 rounded-full font-semibold hover:bg-red-600 hover:scale-105 active:scale-95 transition-all shadow-lg hover:shadow-xl w-full sm:w-auto"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                Go back home
              </Link>
              <Link 
                href="/explore" 
                className="group flex items-center justify-center gap-2 bg-white text-black border border-gray-200 px-8 py-4 rounded-full font-semibold hover:bg-gray-50 hover:scale-105 active:scale-95 transition-all shadow-sm w-full sm:w-auto"
              >
                <Compass className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                Explore Prompts
              </Link>
            </div>
          </div>
          
          {/* Footer at the bottom */}
          <Footer />
        </div>
      </div>
      
      <MobileNav userInitial={userInitial} userAvatarUrl={userAvatarUrl} />
    </div>
  )
}


