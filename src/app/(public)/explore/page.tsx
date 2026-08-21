import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import MasonryGrid from '@/components/ui/MasonryGrid'
import ExploreTabs from '@/components/ui/ExploreTabs'
import type { PromptCard } from '@/types/prompt'

// Helper to assign a random gorgeous gradient to categories based on index
const categoryGradients = [
  'from-pink-500 to-rose-500',
  'from-purple-500 to-indigo-500',
  'from-blue-500 to-cyan-500',
  'from-emerald-500 to-teal-500',
  'from-amber-500 to-orange-500',
  'from-fuchsia-500 to-pink-500',
  'from-violet-500 to-purple-500',
  'from-sky-500 to-blue-500',
]

export const metadata: Metadata = {
  title: 'Explore',
  description: 'Explore the best curated AI image prompts on Mira Prompts. Browse by category, discover trending prompts, and find inspiration for your next AI-generated image.',
  openGraph: {
    title: 'Explore — Mira Prompts',
    description: 'Browse the best curated AI image prompts by category, popularity, and trending.',
    url: 'https://mira-prompts.vercel.app/explore',
    type: 'website',
  },
  alternates: {
    canonical: 'https://mira-prompts.vercel.app/explore',
  },
}

export default async function ExplorePage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const supabase = await createClient()
  const { tab } = await searchParams
  const { data: { user } } = await supabase.auth.getUser()

  // 1. Fetch Top 3 Prompts for "Best of Mira Prompts"
  let { data: bestPrompts } = await supabase
    .from('prompts')
    .select('id, title, slug, image_url, is_premium, category:categories(name)')
    .eq('status', 'published')
    .eq('is_featured', true)
    .limit(3)

  if (!bestPrompts || bestPrompts.length < 3) {
    const { data: topViewed } = await supabase
      .from('prompts')
      .select('id, title, slug, image_url, is_premium, category:categories(name)')
      .eq('status', 'published')
      .order('view_count', { ascending: false })
      .limit(3)
    bestPrompts = topViewed || []
  }

  // 2. Fetch Categories
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug')
    .order('sort_order')

  // 3. Fetch Prompts for Masonry — sorted by active tab
  let tabPrompts: PromptCard[] | null = null

  if (tab === 'trending') {
    // Use trending scores for trending tab
    const { data: trendingScores } = await supabase
      .from('prompt_trending_scores')
      .select('prompt_id, score')
      .eq('window_size', 'week')
      .order('score', { ascending: false })
      .limit(30)

    if (trendingScores && trendingScores.length > 0) {
      const promptIds = trendingScores.map(t => t.prompt_id)
      const { data: trendingPrompts } = await supabase
        .from('prompts')
        .select('id, title, slug, image_url, view_count, copy_count, is_premium, category:categories(slug)')
        .eq('status', 'published')
        .in('id', promptIds)

      if (trendingPrompts) {
        const scoreMap = new Map(trendingScores.map(t => [t.prompt_id, t.score]))
        const promptMap = new Map(trendingPrompts.map(p => [p.id, p]))
        tabPrompts = trendingScores
          .map(t => {
            const prompt = promptMap.get(t.prompt_id)
            if (!prompt) return null
            return { ...prompt, trending_score: scoreMap.get(t.prompt_id) || 0 } as PromptCard
          })
          .filter(Boolean) as PromptCard[]
      }
    }
  }

  // Fallback to regular query
  if (!tabPrompts) {
    const sortField = tab === 'popular' ? 'view_count' : 'created_at'
    const { data } = await supabase
      .from('prompts')
      .select('id, title, slug, image_url, view_count, copy_count, is_premium, category:categories(slug)')
      .eq('status', 'published')
      .order(sortField, { ascending: false })
      .limit(30)
    tabPrompts = data as PromptCard[]
  }

  // 4. Fetch User's Saves
  let savedIds: string[] = []
  if (user) {
    const { data: saves } = await supabase
      .from('prompt_saves')
      .select('prompt_id')
      .eq('user_id', user.id)
    savedIds = saves?.map(s => s.prompt_id) || []
  }

  const tabLabel = tab === 'popular' ? 'Popular on Mira Prompts' : tab === 'trending' ? 'Trending on Mira Prompts' : "What's new on Mira Prompts"

  return (
    <main id="explore-main" className="explore-main w-full max-w-[1400px] mx-auto px-4 md:px-8 py-10 flex flex-col items-center">
      
      {/* SECTION 1: Explore the best of Mira Prompts */}
      <section id="explore-best" className="w-full flex flex-col items-center mb-16">
        <h2 className="text-2xl font-bold text-black mb-8 text-center">
          Explore the best of Mira Prompts
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
          {bestPrompts?.map((prompt) => (
            <Link key={prompt.id} href={`/prompts/${prompt.slug}`} className="group relative h-72 md:h-80 rounded-[32px] overflow-hidden shadow-lg transform transition-transform hover:scale-[1.02]">
              <Image 
                src={prompt.image_url} 
                alt={prompt.title} 
                fill 
                className="object-cover"
                priority
                unoptimized
              />
              {/* Dark overlay for text readability */}
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white">
                <span className="text-xs font-bold uppercase tracking-widest mb-2 opacity-80">
                  Best of {((prompt.category as { name?: string })?.name) || 'Prompts'}
                </span>
                <h3 className="text-xl md:text-2xl font-bold leading-tight drop-shadow-md">
                  {prompt.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* SECTION 2: Browse by category */}
      <section id="explore-categories" className="w-full flex flex-col items-center mb-16">
        <h2 className="text-xl font-bold text-black mb-6 w-full max-w-5xl text-left">
          Browse by category
        </h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4 w-full max-w-5xl">
          {categories?.map((cat, idx) => {
            const gradient = categoryGradients[idx % categoryGradients.length]
            return (
              <Link 
                key={cat.id} 
                href={`/categories/${cat.slug}`}
                className={`relative h-28 md:h-32 rounded-[24px] overflow-hidden shadow-sm flex items-center justify-center p-4 bg-gradient-to-br ${gradient} transform transition-transform hover:-translate-y-1 hover:shadow-md group`}
              >
                {/* Subtle dark overlay for contrast */}
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                <span className="relative z-10 text-white font-bold text-sm md:text-base text-center drop-shadow-sm">
                  {cat.name}
                </span>
              </Link>
            )
          })}
        </div>
      </section>

      {/* SECTION 3: Tabbed feed — New / Popular / Trending */}
      <section id="explore-feed" className="w-full flex flex-col items-center">
        <div className="w-full flex items-center justify-between mb-6 max-w-[1400px]">
          <h2 className="text-xl font-bold text-black">
            {tabLabel}
          </h2>
          <ExploreTabs />
        </div>
        <div className="w-full -mx-4 md:-mx-8">
          <MasonryGrid prompts={tabPrompts || []} savedIds={savedIds} isLoggedIn={!!user} />
        </div>
      </section>

    </main>
  )
}

