import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import MasonryGrid from '@/components/ui/MasonryGrid'
import CategoryTabs from '@/components/ui/CategoryTabs'
import SortDropdown from '@/components/ui/SortDropdown'
import type { PromptCard } from '@/types/prompt'

export const metadata: Metadata = {
  title: 'Mira Prompts — Curated AI Image Prompts',
  description: 'Discover, copy, and save beautifully curated AI image prompts for Midjourney, DALL-E, and Stable Diffusion. Browse trending prompts by category.',
  openGraph: {
    title: 'Mira Prompts — Curated AI Image Prompts',
    description: 'Discover, copy, and save beautifully curated AI image prompts for Midjourney, DALL-E, and Stable Diffusion.',
    url: 'https://mira-prompts.vercel.app',
    type: 'website',
  },
  alternates: {
    canonical: 'https://mira-prompts.vercel.app',
  },
}

export default async function Home({ searchParams }: { searchParams: Promise<{ category?: string; q?: string; sort?: string }> }) {
  const supabase = await createClient()
  const { category, q, sort } = await searchParams
  const { data: { user } } = await supabase.auth.getUser()

  // Categories for tabs
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug')
    .order('sort_order')

  let prompts: PromptCard[] | null = null

  if (sort === 'trending') {
    // Use trending scores for trending sort
    const { data: trendingScores } = await supabase
      .from('prompt_trending_scores')
      .select('prompt_id, score')
      .eq('window_size', 'week')
      .order('score', { ascending: false })
      .limit(60)

    if (trendingScores && trendingScores.length > 0) {
      const promptIds = trendingScores.map(t => t.prompt_id)
      const { data: trendingPrompts } = await supabase
        .from('prompts')
        .select('id, title, slug, image_url, view_count, copy_count, is_premium, category:categories(slug)')
        .eq('status', 'published')
        .in('id', promptIds)

      if (trendingPrompts) {
        // Maintain trending order and attach scores
        const scoreMap = new Map(trendingScores.map(t => [t.prompt_id, t.score]))
        const promptMap = new Map(trendingPrompts.map(p => [p.id, p]))
        prompts = trendingScores
          .map(t => {
            const prompt = promptMap.get(t.prompt_id)
            if (!prompt) return null
            return { ...prompt, trending_score: scoreMap.get(t.prompt_id) || 0 } as PromptCard
          })
          .filter(Boolean) as PromptCard[]
      }
    }
  }

  // Fallback to regular query if not trending or no trending data
  if (!prompts) {
    let query = supabase
      .from('prompts')
      .select('id, title, slug, image_url, view_count, copy_count, is_premium, category:categories(slug)')
      .eq('status', 'published')
      .limit(60)

    const sortField = sort === 'popular' ? 'view_count' : 'created_at'
    query = query.order(sortField, { ascending: false })

    if (q) {
      query = query.or(`title.ilike.%${q}%,prompt.ilike.%${q}%`)
    }

    if (category) {
      query = query.eq('categories.slug', category)
    }

    const { data } = await query
    prompts = data as PromptCard[]
  }

  const displayPrompts: PromptCard[] = category && prompts
    ? prompts.filter(p => p.category !== null)
    : prompts || []

  // Get user's saved prompt IDs
  let savedIds: string[] = []
  if (user) {
    const { data: saves } = await supabase
      .from('prompt_saves')
      .select('prompt_id')
      .eq('user_id', user.id)
    savedIds = saves?.map(s => s.prompt_id) || []
  }

  return (
    <main id="home-main" className="home-main w-full mx-auto pb-10">
      {q && (
        <div id="search-results-header" className="search-results-header px-4 md:px-8 pt-4 pb-2">
          <p className="search-results-text text-gray-500 text-sm">Results for &quot;<span className="search-results-query font-semibold text-black">{q}</span>&quot;</p>
        </div>
      )}
      {!q && (
        <div className="flex items-center justify-between px-4 md:px-8 overflow-x-auto scrollbar-hide gap-4">
          <CategoryTabs categories={categories || []} />
          <SortDropdown />
        </div>
      )}
      <div id="home-masonry-wrapper" className="home-masonry-wrapper mt-2">
        <MasonryGrid prompts={displayPrompts} savedIds={savedIds} isLoggedIn={!!user} />
      </div>
    </main>
  )
}

