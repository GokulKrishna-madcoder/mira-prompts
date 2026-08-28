import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Footer from '@/components/layout/Footer'
import PostActions from '@/components/prompt/PostActions'

export const metadata: Metadata = {
  title: 'My Prompts',
  robots: { index: false, follow: false },
}

export default async function MyPromptsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tab?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const tab = params.tab || 'all'
  const q = params.q || ''

  let query = supabase
    .from('prompts')
    .select('id, title, slug, image_url, status, created_at, view_count, copy_count')
    .eq('created_by', user.id)
    .order('created_at', { ascending: false })

  if (tab === 'published') query = query.eq('status', 'published')
  if (tab === 'drafts') query = query.eq('status', 'draft')
  if (q) query = query.ilike('title', `%${q}%`)

  const { data: prompts } = await query

  const tabs = [
    { key: 'all', label: 'All' },
    { key: 'published', label: 'Published' },
    { key: 'drafts', label: 'Drafts' },
  ]

  return (
    <main className="w-full min-h-screen flex flex-col">
      <div className="flex-1 max-w-5xl mx-auto w-full px-4 md:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-black">My Prompts</h1>
          <Link href="/submit-prompt" className="px-5 py-2.5 bg-red-500 text-white rounded-full text-sm font-bold hover:bg-red-600 transition-colors">
            + Create Prompt
          </Link>
        </div>

        {/* Search */}
        <form method="get" className="mb-6">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search your prompts by title..."
            className="w-full max-w-md px-5 py-3 border border-gray-200 rounded-full bg-gray-50 focus:outline-none focus:border-black focus:bg-white transition-all text-sm font-medium"
          />
          {tab !== 'all' && <input type="hidden" name="tab" value={tab} />}
        </form>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-8">
          {tabs.map(t => (
            <Link
              key={t.key}
              href={`/posts?tab=${t.key}${q ? `&q=${q}` : ''}`}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
                tab === t.key
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {t.label}
            </Link>
          ))}
        </div>

        {/* Content */}
        {prompts && prompts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {prompts.map(p => (
              <Link key={p.id} href={`/prompts/${p.slug}`} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow group relative block">
                {p.image_url && (
                  <div className="relative h-44 bg-gray-100 overflow-hidden">
                    <Image src={p.image_url} alt={p.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" unoptimized />
                    <div className="absolute top-3 right-3 z-10">
                      <PostActions promptId={p.id} slug={p.slug} />
                    </div>
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[11px] px-2.5 py-1 rounded-full font-semibold ${
                      p.status === 'published' ? 'bg-green-100 text-green-700' :
                      p.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                      {p.status === 'pending' ? 'Under Review' : p.status}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-black truncate">{p.title}</h3>
                  <p className="text-xs text-gray-400 mt-1">{p.view_count || 0} views</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-5xl mb-4">&#128221;</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">No prompts yet</h2>
            <p className="text-gray-500 text-sm mb-6">You haven&apos;t created any prompts yet.</p>
            <Link href="/submit-prompt" className="px-6 py-3 bg-red-500 text-white rounded-full text-sm font-bold hover:bg-red-600 transition-colors">
              Create your first prompt
            </Link>
          </div>
        )}
      </div>
      
    </main>
  )
}
