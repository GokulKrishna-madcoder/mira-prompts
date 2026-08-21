import { createClient } from '@supabase/supabase-js'

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export type PlatformMetrics = {
  date: string
  total_users: number
  active_users: number
  new_signups: number
  published_prompts: number
  total_views: number
  total_copies: number
  total_saves: number
  total_searches: number
  paid_users: number
  mrr: number
  arr: number
}

export async function getDailyMetrics(date: string): Promise<PlatformMetrics | null> {
  const { data } = await admin
    .from('daily_platform_metrics')
    .select('*')
    .eq('date', date)
    .maybeSingle()

  return data as PlatformMetrics | null
}

export async function getMetricsRange(startDate: string, endDate: string): Promise<PlatformMetrics[]> {
  const { data, error } = await admin
    .from('daily_platform_metrics')
    .select('*')
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true })

  if (error) throw new Error(`Failed to fetch metrics: ${error.message}`)
  return (data as PlatformMetrics[]) ?? []
}

export async function getPromptMetrics(promptId: string, days = 30) {
  const startDate = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10)

  const { data, error } = await admin
    .from('daily_prompt_metrics')
    .select('*')
    .eq('prompt_id', promptId)
    .gte('date', startDate)
    .order('date', { ascending: true })

  if (error) throw new Error(`Failed to fetch prompt metrics: ${error.message}`)
  return data ?? []
}

export async function getCategoryMetrics(days = 30) {
  const startDate = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10)

  const { data, error } = await admin
    .from('daily_category_metrics')
    .select('*, categories(name, slug)')
    .gte('date', startDate)
    .order('date', { ascending: true })

  if (error) throw new Error(`Failed to fetch category metrics: ${error.message}`)
  return data ?? []
}

export async function getTrendingPrompts(windowSize: 'today' | 'week' | 'month' = 'week', limit = 10) {
  const { data, error } = await admin
    .from('prompt_trending_scores')
    .select('*, prompts!inner(title, slug, image_url, category_id)')
    .eq('window_size', windowSize)
    .order('score', { ascending: false })
    .limit(limit)

  if (error) throw new Error(`Failed to fetch trending: ${error.message}`)
  return data ?? []
}

export async function getRecentEvents(limit = 50) {
  const { data, error } = await admin
    .from('analytics_events')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw new Error(`Failed to fetch events: ${error.message}`)
  return data ?? []
}
