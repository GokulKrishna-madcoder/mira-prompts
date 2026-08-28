import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, BarChart2, Bookmark, Eye, Heart, Layers, Sparkles } from 'lucide-react'

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

  const recentPrompts = prompts?.slice(0, 4) || []

  const { data: savedBoardsData } = await supabase
    .from('prompt_saves')
    .select(`
      id,
      prompt:prompts ( id, title, status )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(3)

  const savedBoards = savedBoardsData?.map((s: any) => s.prompt) || []

  // Calculate content mix percentage
  const publishedPercentage = totalPrompts > 0 ? Math.round((publishedPrompts / totalPrompts) * 100) : 0

  return (
    <div className="space-y-8 max-w-[1200px] mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Overview of your prompt library and engagement</p>
      </div>

      {/* Top Row Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white rounded-3xl border border-gray-200 p-6 flex flex-col justify-between h-[160px] shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#E11D48]/5 rounded-bl-full -mr-8 -mt-8"></div>
          <div className="flex justify-between items-start relative z-10">
            <span className="font-bold text-sm text-gray-500">Total Prompts</span>
            <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-[#E11D48]">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="relative z-10">
            <h2 className="text-4xl font-black text-gray-900">{totalPrompts}</h2>
            <p className="text-xs text-gray-400 mt-1 font-medium">Across your library</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-gray-200 p-6 flex flex-col justify-between h-[160px] shadow-sm">
          <div className="flex justify-between items-start">
            <span className="font-bold text-sm text-gray-500">Impressions</span>
            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h2 className="text-4xl font-black text-gray-900">{totalViews}</h2>
            <p className="text-xs text-gray-400 mt-1 font-medium">Total views</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-gray-200 p-6 flex flex-col justify-between h-[160px] shadow-sm">
          <div className="flex justify-between items-start">
            <span className="font-bold text-sm text-gray-500">Saves</span>
            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
              <Bookmark className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h2 className="text-4xl font-black text-gray-900">{totalSaves}</h2>
            <p className="text-xs text-gray-400 mt-1 font-medium">Times bookmarked</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-gray-200 p-6 flex flex-col justify-between h-[160px] shadow-sm">
          <div className="flex justify-between items-start">
            <span className="font-bold text-sm text-gray-500">Likes</span>
            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
              <Heart className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h2 className="text-4xl font-black text-gray-900">{totalLikes}</h2>
            <p className="text-xs text-gray-400 mt-1 font-medium">Total likes received</p>
          </div>
        </div>
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl border border-gray-200 p-8 flex flex-col justify-between h-[240px] shadow-sm">
          <div className="flex justify-between items-center">
            <span className="font-bold text-sm text-gray-900">Total Copies (Engagement)</span>
            <BarChart2 className="w-5 h-5 text-gray-400" />
          </div>
          <div>
            <h2 className="text-5xl font-black text-[#E11D48] tracking-tight">{totalCopies}</h2>
            <p className="text-sm text-gray-500 mt-2 font-medium">Users copied your prompts</p>
            
            <div className="mt-8 flex items-center gap-8 border-t border-gray-100 pt-6">
              <div><span className="block text-xl font-bold text-gray-900">{totalSaves}</span><span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Saves</span></div>
              <div><span className="block text-xl font-bold text-gray-900">{totalLikes}</span><span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Likes</span></div>
              <div><span className="block text-xl font-bold text-gray-900">{totalViews}</span><span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Views</span></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm flex flex-col h-[240px]">
          <div className="flex justify-between items-center mb-4">
            <span className="font-bold text-sm text-gray-900">Recent Prompts</span>
            <Link href="/submit-prompt" className="flex items-center gap-1.5 text-xs font-bold text-[#E11D48] bg-red-50 px-3 py-1.5 rounded-full hover:bg-red-100 transition-colors">
              <Plus className="w-3.5 h-3.5" /> New
            </Link>
          </div>
          <div className="flex-1 flex flex-col text-left overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {recentPrompts.length > 0 ? (
              <ul className="w-full space-y-1">
                {recentPrompts.map(p => (
                  <li key={p.id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-100 cursor-pointer">
                    <span className="text-sm font-semibold text-gray-800 truncate pr-4">{p.title}</span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${p.status === 'published' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                      {p.status}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-sm text-gray-400 font-medium">No prompts yet. Create one to get started.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm h-[220px] flex flex-col items-center justify-center">
          <span className="font-bold text-sm text-gray-900 self-start w-full mb-4">Content Mix</span>
          <div className="relative w-28 h-28 shrink-0 aspect-square rounded-full border-[12px] border-gray-100 flex items-center justify-center" style={{ borderTopColor: '#E11D48', transform: `rotate(${publishedPercentage * 3.6}deg)`}}>
            <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ transform: `rotate(-${publishedPercentage * 3.6}deg)` }}>
              <span className="text-2xl font-black text-gray-900">{publishedPercentage}%</span>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Published</span>
            </div>
          </div>
          <div className="flex items-center gap-6 mt-6 text-xs font-semibold text-gray-500">
            <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#E11D48]"></span> Published</span>
            <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-gray-200"></span> Drafts</span>
          </div>
        </div>

        <div className="lg:col-span-1 bg-white rounded-3xl border border-gray-200 p-6 shadow-sm h-[220px] flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <span className="font-bold text-sm text-gray-900">Saved Boards</span>
            <Link href="/saved" className="text-xs font-bold text-gray-500 hover:text-black cursor-pointer transition-colors">View all</Link>
          </div>
          <div className="flex-1 flex flex-col text-left overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {savedBoards.length > 0 ? (
              <ul className="w-full space-y-1">
                {savedBoards.map((p: any) => (
                  <li key={p.id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-100 cursor-pointer">
                    <span className="text-sm font-semibold text-gray-800 truncate pr-4">{p.title}</span>
                    <Bookmark className="w-4 h-4 text-gray-400 shrink-0" />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                  <Bookmark className="w-5 h-5 text-gray-300" />
                </div>
                <p className="text-sm text-gray-400 font-medium">No saved prompts yet.</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-black rounded-3xl border border-gray-800 p-8 text-white flex flex-col justify-center h-[220px] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-[#E11D48]/20 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
          <div className="relative z-10">
            <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#E11D48]" />
              Become a Top Creator
            </h3>
            <p className="text-sm text-white/60 mb-6 font-medium leading-relaxed">
              Boost your engagement by adding multiple variants (like Gender or Creative Ads) to your prompts. High-quality submissions get featured!
            </p>
            <Link href="/submit-prompt" className="inline-block px-6 py-2.5 bg-white text-black text-sm font-bold rounded-full hover:bg-gray-100 transition-colors">
              Submit a masterpiece
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
