import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { TrendingUp, Users, DollarSign, Eye, Copy, Bookmark, Search } from 'lucide-react'
import AdminLineChart from '@/components/admin/AdminLineChart'

export const metadata = { title: 'Analytics - Admin' }

function getFallbackDates(): { date: string; value: number }[] {
  const now = Date.now()
  return Array.from({ length: 7 }).map((_, i) => ({
    date: new Date(now - (6 - i) * 86400000).toISOString().split('T')[0],
    value: 0,
  }))
}

export default async function AdminAnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!profile || !['admin', 'editor'].includes(profile.role)) redirect('/')

  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Fetch all data in parallel
  const [
    { data: metricsHistory },
    { data: latestMetrics },
    { data: transactions },
    { data: topPrompts },
    { data: recentEvents }
  ] = await Promise.all([
    // 30-day metrics history for charts
    supabaseAdmin
      .from('daily_platform_metrics')
      .select('*')
      .order('date', { ascending: true })
      .limit(30),

    // Latest metrics
    supabaseAdmin
      .from('daily_platform_metrics')
      .select('*')
      .order('date', { ascending: false })
      .limit(1)
      .maybeSingle(),

    // Recent transactions
    supabaseAdmin
      .from('payment_transactions')
      .select('*, profiles(display_name), subscription_plans(name)')
      .order('created_at', { ascending: false })
      .limit(20),

    // Top trending
    supabaseAdmin
      .from('prompt_trending_scores')
      .select('score, prompts(title)')
      .eq('window_size', 'today')
      .order('score', { ascending: false })
      .limit(5),

    // Recent analytics events
    supabaseAdmin
      .from('analytics_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(30)
  ])

  // Build chart data from metrics history
  const fallbackZero = getFallbackDates()

  const viewsChartData = metricsHistory?.length
    ? metricsHistory.map(m => ({ date: m.date, value: m.total_views }))
    : fallbackZero

  const copiesChartData = metricsHistory?.length
    ? metricsHistory.map(m => ({ date: m.date, value: m.total_copies }))
    : fallbackZero

  const signupsChartData = metricsHistory?.length
    ? metricsHistory.map(m => ({ date: m.date, value: m.new_signups }))
    : fallbackZero

  const mrr = latestMetrics?.mrr || 0
  const arr = latestMetrics?.arr || 0
  const paidUsers = latestMetrics?.paid_users || 0

  const totalRevenue = (transactions || [])
    .filter(p => p.status === 'captured')
    .reduce((acc, curr) => acc + (curr.amount || 0), 0) / 100

  const kpiCards = [
    {
      label: 'Total Views',
      value: (latestMetrics?.total_views || 0).toLocaleString(),
      icon: Eye,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      label: 'Total Copies',
      value: (latestMetrics?.total_copies || 0).toLocaleString(),
      icon: Copy,
      color: 'bg-purple-100 text-purple-600',
    },
    {
      label: 'Total Saves',
      value: (latestMetrics?.total_saves || 0).toLocaleString(),
      icon: Bookmark,
      color: 'bg-amber-100 text-amber-600',
    },
    {
      label: 'Total Searches',
      value: (latestMetrics?.total_searches || 0).toLocaleString(),
      icon: Search,
      color: 'bg-green-100 text-green-600',
    },
    {
      label: 'Total Captured',
      value: `₹${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-green-100 text-green-600',
    },
    {
      label: 'Paid Users',
      value: paidUsers.toString(),
      icon: Users,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      label: 'MRR',
      value: `₹${Math.round(mrr).toLocaleString()}`,
      icon: TrendingUp,
      color: 'bg-amber-100 text-amber-600',
    },
    {
      label: 'ARR',
      value: `₹${Math.round(arr).toLocaleString()}`,
      icon: TrendingUp,
      color: 'bg-gray-900 text-white',
    },
  ]

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-black">Analytics & Platform Metrics</h1>
        <p className="text-gray-500 text-sm mt-1">Authoritative metrics powered by daily aggregation pipelines.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {kpiCards.map((card) => (
          <div key={card.label} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.color}`}>
              <card.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">{card.label}</p>
              <p className="text-xl font-bold text-black">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="mb-4">
            <h2 className="text-base font-bold text-black flex items-center gap-2">
              <Eye className="w-4 h-4 text-blue-500" />
              Views (30 Days)
            </h2>
          </div>
          <div className="h-52 w-full">
            <AdminLineChart data={viewsChartData} title="Views" color="rgb(59, 130, 246)" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="mb-4">
            <h2 className="text-base font-bold text-black flex items-center gap-2">
              <Copy className="w-4 h-4 text-purple-500" />
              Copies (30 Days)
            </h2>
          </div>
          <div className="h-52 w-full">
            <AdminLineChart data={copiesChartData} title="Copies" color="rgb(147, 51, 234)" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="mb-4">
            <h2 className="text-base font-bold text-black flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              Signups (30 Days)
            </h2>
          </div>
          <div className="h-52 w-full">
            <AdminLineChart data={signupsChartData} title="Signups" color="rgb(16, 185, 129)" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="mb-4">
            <h2 className="text-base font-bold text-black flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-amber-500" />
              MRR (30 Days)
            </h2>
          </div>
          <div className="h-52 w-full">
            <AdminLineChart
              data={metricsHistory?.length
                ? metricsHistory.map(m => ({ date: m.date, value: m.mrr }))
                : fallbackZero}
              title="MRR"
              color="rgb(245, 158, 11)"
            />
          </div>
        </div>
      </div>

      {/* Trending + Events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-bold text-black mb-4">Trending Prompts (Today)</h2>
          <div className="space-y-3">
            {topPrompts?.map((tp, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900 truncate pr-2">{(tp.prompts as { title?: string })?.title || 'Unknown'}</span>
                <span className="text-xs font-bold text-gray-400 shrink-0">Score: {tp.score}</span>
              </div>
            ))}
            {(!topPrompts || topPrompts.length === 0) && (
              <p className="text-sm text-gray-500">No trending data yet.</p>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-bold text-black mb-4">Recent Events</h2>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {recentEvents?.map((event) => (
              <div key={event.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    event.event_name === 'signup' ? 'bg-green-100 text-green-700' :
                    event.event_name === 'payment_success' ? 'bg-emerald-100 text-emerald-700' :
                    event.event_name === 'prompt_copy' ? 'bg-blue-100 text-blue-700' :
                    event.event_name === 'prompt_view' ? 'bg-gray-100 text-gray-600' :
                    event.event_name === 'search' ? 'bg-purple-100 text-purple-700' :
                    'bg-gray-100 text-gray-500'
                  }`}>
                    {event.event_name}
                  </span>
                  {event.prompt_id && (
                    <span className="text-[10px] text-gray-400 font-mono">{event.prompt_id.slice(0, 8)}...</span>
                  )}
                </div>
                <span className="text-[10px] text-gray-400">
                  {new Date(event.created_at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
            {(!recentEvents || recentEvents.length === 0) && (
              <p className="text-sm text-gray-500">No events yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Transactions */}
      <h2 className="text-base font-bold text-black mb-4">Recent Transactions</h2>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-100">
              <tr>
                <th className="px-6 py-3">Transaction ID</th>
                <th className="px-6 py-3">User</th>
                <th className="px-6 py-3">Plan</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions?.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-3 font-medium text-black text-xs font-mono">{p.provider_payment_id || p.id}</td>
                  <td className="px-6 py-3 font-medium text-gray-900">{(p.profiles as { display_name?: string })?.display_name || 'Anonymous'}</td>
                  <td className="px-6 py-3 font-medium text-gray-600">{(p.subscription_plans as { name?: string })?.name || 'Unknown'}</td>
                  <td className="px-6 py-3 font-bold text-green-600">₹{(p.amount / 100).toLocaleString()}</td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      p.status === 'captured' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-gray-500">
                    {new Date(p.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {(!transactions || transactions.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500 font-medium">No transactions yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
