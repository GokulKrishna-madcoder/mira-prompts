import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Eye, Copy, Bookmark, FileText, TrendingUp, PlusCircle, Award } from 'lucide-react'
import { redirect } from 'next/navigation'
import AdminLineChart from '@/components/admin/AdminLineChart'
import LiveRefresher from '@/components/admin/LiveRefresher'

export default async function AdminDashboard() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role === 'editor') redirect('/admin/prompts')

  const [
    { count: promptsCount },
    { data: recentPrompts },
    { data: topCopiedPrompts },
    { data: platformMetrics }
  ] = await Promise.all([
    supabase.from('prompts').select('*', { count: 'exact', head: true }),
    supabase
      .from('prompts')
      .select('id, title, status, created_at, view_count, copy_count, save_count')
      .order('created_at', { ascending: false })
      .limit(7),
    supabase
      .from('prompts')
      .select('id, title, copy_count, view_count')
      .eq('status', 'published')
      .order('copy_count', { ascending: false })
      .limit(10),
    supabase
      .from('daily_platform_metrics')
      .select('*')
      .order('date', { ascending: true })
      .limit(30)
  ])

  const latestMetrics = platformMetrics?.[platformMetrics.length - 1] || {}
  const mrrRupees = Math.round((latestMetrics.mrr || 0) / 100)

  const stats = [
    { label: 'MRR', value: `₹${mrrRupees.toLocaleString()}`, icon: TrendingUp, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Total Users', value: (latestMetrics.total_users || 0).toLocaleString(), icon: Eye, color: 'bg-rose-50 text-rose-600' },
    { label: 'Paid Users', value: (latestMetrics.paid_users || 0).toLocaleString(), icon: Bookmark, color: 'bg-indigo-50 text-indigo-600' },
    { label: 'Total Prompts', value: promptsCount || 0, icon: FileText, color: 'bg-blue-50 text-blue-600' },
    { label: 'Total Views', value: (latestMetrics.total_views || 0).toLocaleString(), icon: Eye, color: 'bg-green-50 text-green-600' },
    { label: 'Total Copies', value: (latestMetrics.total_copies || 0).toLocaleString(), icon: Copy, color: 'bg-purple-50 text-purple-600' },
    { label: 'Total Saves', value: (latestMetrics.total_saves || 0).toLocaleString(), icon: Bookmark, color: 'bg-amber-50 text-amber-600' },
  ]

  // Prepare chart data (fallback to 0 if no metrics exist)
  const lineChartData = platformMetrics?.length 
    ? platformMetrics.map(m => ({ date: m.date, value: m.total_views }))
    : Array.from({ length: 7 }).map((_, i) => ({ 
        date: new Date(Date.now() - (6 - i) * 86400000).toISOString().split('T')[0], 
        value: 0 
      }))

  return (
    <div id="admin-dashboard" className="admin-dashboard p-8 max-w-6xl mx-auto">
      <LiveRefresher intervalMs={15000} />
      {/* Header */}
      <div id="dashboard-header" className="dashboard-header flex items-center justify-between mb-8">
        <div>
          <h1 className="dashboard-title text-2xl font-bold text-black">Dashboard</h1>
          <p className="dashboard-subtitle text-gray-500 text-sm mt-1">Overview of your Mira Prompts</p>
        </div>
        <Link id="dashboard-btn-new" href="/admin/prompts/new" className="dashboard-btn-new flex items-center gap-2 px-5 py-3 bg-black text-white rounded-full text-sm font-semibold hover:bg-gray-800 transition-colors">
          <PlusCircle className="w-4 h-4" />
          New Prompt
        </Link>
      </div>

      {/* Stat Cards */}
      <div id="dashboard-stats" className="dashboard-stats grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(stat => (
          <div key={stat.label} className="stat-card bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="stat-card-header flex items-center justify-between mb-4">
              <span className="stat-card-label text-sm font-medium text-gray-500">{stat.label}</span>
              <div className={`stat-card-icon w-10 h-10 rounded-2xl flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <p className="stat-card-value text-3xl font-bold text-black tabular-nums">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="dashboard-grid grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Top 10 Copied Prompts */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm p-6 overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-black flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              Top 10 Trending (Most Copied)
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-gray-400 font-medium">
                <tr>
                  <th className="pb-3 pl-2">Rank</th>
                  <th className="pb-3">Prompt Title</th>
                  <th className="pb-3 text-right">Copies</th>
                  <th className="pb-3 text-right pr-2">Views</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {topCopiedPrompts?.map((p, idx) => (
                  <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 pl-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        idx === 0 ? 'bg-amber-100 text-amber-700' :
                        idx === 1 ? 'bg-gray-200 text-gray-700' :
                        idx === 2 ? 'bg-orange-100 text-orange-700' :
                        'bg-gray-50 text-gray-400'
                      }`}>
                        {idx + 1}
                      </div>
                    </td>
                    <td className="py-3 font-semibold text-gray-900 max-w-[200px] truncate">{p.title}</td>
                    <td className="py-3 text-right font-bold text-blue-600">{p.copy_count?.toLocaleString() || 0}</td>
                    <td className="py-3 text-right text-gray-500 pr-2">{p.view_count?.toLocaleString() || 0}</td>
                  </tr>
                ))}
                {(!topCopiedPrompts || topCopiedPrompts.length === 0) && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-gray-400">No prompts found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity */}
        <div id="dashboard-activity" className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="activity-header px-6 py-5 border-b border-gray-100">
            <h2 className="activity-title text-lg font-semibold text-black">Recent Activity</h2>
          </div>
          <div id="activity-list" className="activity-list divide-y divide-gray-50 flex-1 overflow-y-auto">
            {recentPrompts?.map(prompt => (
              <div key={prompt.id} className="activity-item px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="activity-item-header flex items-center justify-between">
                  <h3 className="activity-item-title text-sm font-medium text-black truncate pr-3">{prompt.title}</h3>
                  <span className={`activity-item-status text-[11px] px-2.5 py-1 rounded-full font-semibold whitespace-nowrap ${
                    prompt.status === 'published'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {prompt.status}
                  </span>
                </div>
                <p className="activity-item-meta text-xs text-gray-400 mt-1">
                  {new Date(prompt.created_at).toLocaleDateString()} · {prompt.view_count} views
                </p>
              </div>
            ))}
            {(!recentPrompts || recentPrompts.length === 0) && (
              <div className="activity-empty px-6 py-10 text-center text-gray-400 text-sm">
                No prompts yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Line Chart Metric */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 w-full">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-black flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            Platform Views (30 Days)
          </h2>
          <p className="text-xs text-gray-400">Total accumulated views across all prompts over time.</p>
        </div>
        <div className="h-64 w-full">
          <AdminLineChart data={lineChartData} title="Total Views" color="rgb(59, 130, 246)" />
        </div>
      </div>
    </div>
  )
}

