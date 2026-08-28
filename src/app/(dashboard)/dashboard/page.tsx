import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export default async function DashboardOverview() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch stats
  const { data: prompts } = await supabase
    .from('prompts')
    .select('id, title, status, view_count, copy_count, save_count, like_count')
    .eq('created_by', user.id)

  const totalPrompts = prompts?.length || 0
  const publishedPrompts = prompts?.filter(p => p.status === 'published').length || 0
  const drafts = prompts?.filter(p => p.status === 'draft').length || 0
  
  const totalViews = prompts?.reduce((sum, p) => sum + (p.view_count || 0), 0) || 0
  const totalCopies = prompts?.reduce((sum, p) => sum + (p.copy_count || 0), 0) || 0
  const totalSaves = prompts?.reduce((sum, p) => sum + (p.save_count || 0), 0) || 0
  const totalLikes = prompts?.reduce((sum, p) => sum + (p.like_count || 0), 0) || 0

  const recentPrompts = prompts?.slice(0, 3) || []

  // Calculate content mix percentage
  const publishedPercentage = totalPrompts > 0 ? Math.round((publishedPrompts / totalPrompts) * 100) : 0

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      {/* Top Row Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#B91C1C] rounded-[24px] p-6 text-white flex flex-col justify-between h-[140px] relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <span className="font-bold text-sm text-white/90">Total Prompts</span>
            <span className="w-6 h-6 rounded-full border border-white/30 flex items-center justify-center text-xs group-hover:bg-white group-hover:text-[#B91C1C] transition-colors cursor-pointer">↗</span>
          </div>
          <div>
            <h2 className="text-4xl font-black">{totalPrompts}</h2>
            <p className="text-xs text-white/70 mt-1">Across your library</p>
          </div>
        </div>

        <div className="bg-white rounded-[24px] border border-gray-100 p-6 flex flex-col justify-between h-[140px] shadow-sm">
          <div className="flex justify-between items-start">
            <span className="font-bold text-sm text-gray-900">Impressions</span>
            <span className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center text-xs text-gray-400">↗</span>
          </div>
          <div>
            <h2 className="text-4xl font-black text-gray-900">{totalViews}</h2>
            <p className="text-xs text-gray-400 mt-1">Total views</p>
          </div>
        </div>

        <div className="bg-white rounded-[24px] border border-gray-100 p-6 flex flex-col justify-between h-[140px] shadow-sm">
          <div className="flex justify-between items-start">
            <span className="font-bold text-sm text-gray-900">Saves</span>
            <span className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center text-xs text-gray-400">↗</span>
          </div>
          <div>
            <h2 className="text-4xl font-black text-gray-900">{totalSaves}</h2>
            <p className="text-xs text-gray-400 mt-1">Times bookmarked</p>
          </div>
        </div>
        
        {/* Skipping Followers to match requirement, adding placeholder to maintain grid or just let it span 3 */}
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-[#1A0B0E] to-[#2D0A11] rounded-[24px] p-8 text-white flex flex-col justify-between h-[220px]">
          <span className="font-bold text-sm text-white/90">Engagement</span>
          <div>
            <h2 className="text-5xl font-black">{totalCopies}</h2>
            <p className="text-xs text-white/70 mt-1 mb-6">Total copies</p>
            <div className="flex items-center gap-8 text-sm font-semibold">
              <div><span className="block text-lg">{totalSaves}</span><span className="text-white/50 text-xs">Saves</span></div>
              <div><span className="block text-lg">{totalLikes}</span><span className="text-white/50 text-xs">Likes</span></div>
              <div><span className="block text-lg">{totalViews}</span><span className="text-white/50 text-xs">Views</span></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[24px] border border-gray-100 p-6 shadow-sm flex flex-col h-[220px]">
          <div className="flex justify-between items-center mb-6">
            <span className="font-bold text-sm text-gray-900">Recent Prompts</span>
            <Link href="/submit-prompt" className="flex items-center gap-1 text-xs font-bold text-gray-600 px-3 py-1.5 rounded-full border border-gray-200 hover:bg-gray-50">
              <Plus className="w-3 h-3" /> New
            </Link>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            {recentPrompts.length > 0 ? (
              <ul className="w-full space-y-2">
                {recentPrompts.map(p => (
                  <li key={p.id} className="flex justify-between items-center text-sm p-2 hover:bg-gray-50 rounded-lg">
                    <span className="font-semibold truncate w-[70%] text-left">{p.title}</span>
                    <span className="text-gray-400 text-xs">{p.status}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <>
                <p className="text-sm text-gray-400 mb-2">No prompts yet. Create one →</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white rounded-[24px] border border-gray-100 p-6 shadow-sm h-[220px] flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <span className="font-bold text-sm text-gray-900">Saved Boards</span>
            <span className="text-xs font-bold text-gray-500 px-3 py-1 rounded-full border border-gray-200 cursor-pointer">View all</span>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm text-gray-400">No saved prompts yet.</p>
          </div>
        </div>

        <div className="bg-white rounded-[24px] border border-gray-100 p-6 shadow-sm h-[220px] flex flex-col items-center justify-center">
          <span className="font-bold text-sm text-gray-900 self-start w-full mb-4">Content Mix</span>
          <div className="relative w-28 h-28 rounded-full border-[12px] border-gray-100 flex items-center justify-center" style={{ borderTopColor: '#B91C1C', transform: `rotate(${publishedPercentage * 3.6}deg)`}}>
            <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ transform: `rotate(-${publishedPercentage * 3.6}deg)` }}>
              <span className="text-2xl font-black">{publishedPercentage}%</span>
              <span className="text-[10px] text-gray-400 font-bold uppercase">Published</span>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-6 text-xs font-semibold text-gray-500">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#B91C1C]"></span> Published</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-gray-200"></span> Drafts</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#1A0B0E] to-[#2D0A11] rounded-[24px] p-8 text-white flex flex-col justify-center h-[220px] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/20 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
          <h3 className="text-lg font-black mb-2 flex items-center gap-2">Everything's free ✨</h3>
          <p className="text-xs text-white/70 mb-6 leading-relaxed">Every feature is unlocked for everyone — no paid plans, ever. pineprompts.com is free and ad-supported.</p>
          <button className="self-start px-5 py-2.5 bg-white text-black text-xs font-bold rounded-full hover:bg-gray-100 transition-colors">
            Share a prompt →
          </button>
        </div>
      </div>
    </div>
  )
}
