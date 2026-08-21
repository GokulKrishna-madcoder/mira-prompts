import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()

  const baseUrl = 'https://mira.vercel.app'

  // Static routes
  const routes = [
    { url: baseUrl, changeFrequency: 'daily' as const, priority: 1.0 },
    { url: `${baseUrl}/explore`, changeFrequency: 'daily' as const, priority: 0.9 },
    { url: `${baseUrl}/pricing`, changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: `${baseUrl}/about`, changeFrequency: 'monthly' as const, priority: 0.7 },
    { url: `${baseUrl}/privacy`, changeFrequency: 'yearly' as const, priority: 0.3 },
    { url: `${baseUrl}/terms`, changeFrequency: 'yearly' as const, priority: 0.3 },
  ]

  // Dynamic prompt routes
  const { data: prompts } = await supabase
    .from('prompts')
    .select('slug, updated_at')
    .eq('status', 'published')
    .order('updated_at', { ascending: false })

  const promptRoutes = (prompts || []).map((prompt) => ({
    url: `${baseUrl}/prompts/${prompt.slug}`,
    lastModified: prompt.updated_at || new Date().toISOString(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  // Dynamic category routes
  const { data: categories } = await supabase
    .from('categories')
    .select('slug, updated_at')
    .order('sort_order')

  const categoryRoutes = (categories || []).map((cat) => ({
    url: `${baseUrl}/categories/${cat.slug}`,
    lastModified: cat.updated_at || new Date().toISOString(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  // Dynamic tag routes
  const { data: tags } = await supabase
    .from('tags')
    .select('slug, created_at')
    .order('name')

  const tagRoutes = (tags || []).map((tag) => ({
    url: `${baseUrl}/tags/${tag.slug}`,
    lastModified: tag.created_at || new Date().toISOString(),
    changeFrequency: 'weekly' as const,
    priority: 0.5,
  }))

  return [...routes, ...categoryRoutes, ...tagRoutes, ...promptRoutes]
}
