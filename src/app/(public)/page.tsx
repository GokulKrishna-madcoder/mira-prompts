import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import InfiniteMasonry from '@/components/ui/InfiniteMasonry'
import CategoryTabs from '@/components/ui/CategoryTabs'
import SortDropdown from '@/components/ui/SortDropdown'
import LandingPage from '@/components/home/LandingPage'
import FirstPromptModal from '@/components/onboarding/FirstPromptModal'
import type { PromptCard } from '@/types/prompt'
import type { FeedConfig } from '@/lib/feed-actions'

export const metadata: Metadata = {
  title: 'Curated AI Image Prompts',
  description: 'Discover, copy, and save beautifully curated AI image prompts for Midjourney, DALL-E, and Stable Diffusion. Browse trending prompts by category.',
  alternates: {
    canonical: 'https://mira-prompts.vercel.app',
  },
}

export default async function Home({ searchParams }: { searchParams: Promise<{ category?: string; q?: string; sort?: string }> }) {
  const supabase = await createClient()
  const { category, q, sort } = await searchParams
  const { data: { user } } = await supabase.auth.getUser()

  // ─── LANDING PAGE FOR LOGGED-OUT USERS ───
  if (!user) {
    const { data: landingPrompts } = await supabase
      .from('prompts')
      .select('id, title, image_url')
      .eq('status', 'published')
      .order('view_count', { ascending: false })
      .limit(30)

    return <LandingPage prompts={landingPrompts || []} />
  }

  // ─── LOGGED-IN FEED ───
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug')
    .order('sort_order')

  // Determine feed type
  const feedType = sort === 'trending' ? 'trending' : sort === 'popular' ? 'popular' : 'latest'
  const feedConfig: FeedConfig = { feedType, category: category || undefined }

  let prompts: PromptCard[] = []

  if (feedType === 'trending') {
    const { data: scores } = await supabase
      .from('prompt_trending_scores')
      .select('prompt_id, score')
      .eq('window_size', 'week')
      .order('score', { ascending: false })
      .limit(50)

    if (scores && scores.length > 0) {
      const ids = scores.map(t => t.prompt_id)
      const { data: trendingPrompts } = await supabase
        .from('prompts')
        .select('id, title, slug, image_url, view_count, copy_count, is_premium, has_variants, variants, category:categories(slug)')
        .eq('status', 'published')
        .in('id', ids)

      if (trendingPrompts) {
        const scoreMap = new Map(scores.map(t => [t.prompt_id, t.score]))
        const promptMap = new Map(trendingPrompts.map(p => [p.id, p]))
        prompts = scores
          .map(t => {
            const p = promptMap.get(t.prompt_id)
            if (!p) return null
            return { ...p, trending_score: scoreMap.get(t.prompt_id) || 0 } as PromptCard
          })
          .filter(Boolean) as PromptCard[]
      }
    }
  } else {
    const sortField = feedType === 'popular' ? 'view_count' : 'created_at'
    let query = supabase
      .from('prompts')
      .select('id, title, slug, image_url, view_count, copy_count, is_premium, has_variants, variants, created_at, category:categories(slug)')
      .eq('status', 'published')
      .order(sortField, { ascending: false })
      .order('id', { ascending: false })
      .limit(50)

    if (category) {
      query = query.eq('categories.slug', category)
    }

    const { data } = await query
    prompts = (data as PromptCard[]) || []

    if (category) {
      prompts = prompts.filter(p => p.category !== null)
    }
  }

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
      <FirstPromptModal userId={user.id} />
      {q && (
        <div id="search-results-header" className="search-results-header px-4 md:px-8 pt-4 pb-2">
          <p className="search-results-text text-gray-500 text-sm">Results for &quot;<span className="search-results-query font-semibold text-black">{q}</span>&quot;</p>
        </div>
      )}
      {!q && (
        <div className="sticky top-0 z-20 bg-[var(--color-background)]/95 backdrop-blur-md pt-2 pb-4 mb-4 border-b border-gray-100 md:border-transparent">
          <div className="flex items-center justify-between px-4 md:px-8 gap-4">
            <div className="flex-1 min-w-0">
              <CategoryTabs categories={categories || []} />
            </div>
            <div className="shrink-0 flex items-center">
              <SortDropdown />
            </div>
          </div>
        </div>
      )}
      <div id="home-masonry-wrapper" className="home-masonry-wrapper mt-2">
        <InfiniteMasonry initialPrompts={prompts} savedIds={savedIds} isLoggedIn={!!user} feedConfig={feedConfig} />
      </div>
    </main>
  )
}
