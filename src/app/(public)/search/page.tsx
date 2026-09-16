import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import MasonryGrid from '@/components/ui/MasonryGrid'
import type { PromptCard } from '@/types/prompt'

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ q?: string }> }): Promise<Metadata> {
  const { q } = await searchParams
  return {
    title: q ? `"${q}" — Search Results` : 'Search — Mira Prompts',
    description: q ? `Discover AI prompts matching "${q}" on Mira Prompts.` : 'Search curated AI image prompts.',
    robots: { index: false, follow: true }, // ponytail: noindex search pages, SEO juice stays on category/tag pages
  }
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const supabase = await createClient()
  const { q } = await searchParams
  const { data: { user } } = await supabase.auth.getUser()

  let prompts: PromptCard[] = []

  if (q && q.trim().length > 0) {
    // Use the existing search_prompt_ids RPC for now
    // ponytail: swap to hybrid_search_prompts once embeddings are backfilled
    const { data: matchedIds } = await supabase.rpc('search_prompt_ids', { search_term: q.trim() })
    const ids = matchedIds?.map((m: any) => m.prompt_id) || []

    if (ids.length > 0) {
      const { data } = await supabase
        .from('prompts')
        .select('id, title, slug, image_url, view_count, copy_count, is_premium, has_variants, variants, category:categories(slug)')
        .eq('status', 'published')
        .in('id', ids)
        .limit(60)
      prompts = (data as PromptCard[]) || []
    }
  }

  // Fetch saves for logged-in user
  let savedIds: string[] = []
  if (user) {
    const { data: saves } = await supabase.from('prompt_saves').select('prompt_id').eq('user_id', user.id)
    savedIds = saves?.map(s => s.prompt_id) || []
  }

  return (
    <main className="w-full max-w-[1400px] mx-auto pb-10">
      <div className="px-4 md:px-8 pt-8 pb-4">
        {q ? (
          <div className="mb-2">
            <h1 className="text-2xl font-bold text-black">
              Results for &quot;<span className="text-gray-600">{q}</span>&quot;
            </h1>
            <p className="text-sm text-gray-500 mt-1">{prompts.length} prompt{prompts.length !== 1 ? 's' : ''} found</p>
          </div>
        ) : (
          <h1 className="text-2xl font-bold text-black mb-2">Search</h1>
        )}
      </div>

      {prompts.length > 0 ? (
        <MasonryGrid prompts={prompts} savedIds={savedIds} isLoggedIn={!!user} />
      ) : q ? (
        <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">No results found</h3>
          <p className="text-sm text-gray-500 font-medium max-w-[320px]">
            Try different keywords, or browse the <a href="/explore" className="text-black font-bold underline">Explore</a> page.
          </p>
        </div>
      ) : null}
    </main>
  )
}
