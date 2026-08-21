import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import MasonryGrid from '@/components/ui/MasonryGrid'
import Breadcrumb from '@/components/ui/Breadcrumb'
import type { PromptCard } from '@/types/prompt'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  const { data: tag } = await supabase
    .from('tags')
    .select('name')
    .eq('slug', slug)
    .single()

  if (!tag) {
    return { title: 'Tag Not Found' }
  }

  const description = `Browse curated AI image prompts tagged with "${tag.name}" on Mira Prompts.`

  return {
    title: `#${tag.name} Prompts`,
    description,
    openGraph: {
      title: `#${tag.name} Prompts — Mira Prompts`,
      description,
      url: `https://mira.vercel.app/tags/${slug}`,
      type: 'website',
    },
    alternates: {
      canonical: `https://mira.vercel.app/tags/${slug}`,
    },
  }
}

export default async function TagPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: tag } = await supabase
    .from('tags')
    .select('id, name, slug')
    .eq('slug', slug)
    .single()

  if (!tag) notFound()

  const { data: { user } } = await supabase.auth.getUser()

  // Get prompt IDs that have this tag
  const { data: tagPrompts } = await supabase
    .from('prompt_tags')
    .select('prompt_id')
    .eq('tag_id', tag.id)

  const promptIds = tagPrompts?.map(tp => tp.prompt_id) || []

  let prompts: PromptCard[] = []
  if (promptIds.length > 0) {
    const { data } = await supabase
      .from('prompts')
      .select('id, title, slug, image_url, view_count, copy_count, is_premium, category:categories(slug)')
      .eq('status', 'published')
      .in('id', promptIds)
      .order('created_at', { ascending: false })
      .limit(60)

    prompts = (data || []) as PromptCard[]
  }

  let savedIds: string[] = []
  if (user) {
    const { data: saves } = await supabase
      .from('prompt_saves')
      .select('prompt_id')
      .eq('user_id', user.id)
    savedIds = saves?.map(s => s.prompt_id) || []
  }

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Explore', href: '/explore' },
    { label: `#${tag.name}`, href: `/tags/${slug}` },
  ]

  return (
    <main className="w-full mx-auto pb-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: `#${tag.name} Prompts`,
            description: `Browse curated AI image prompts tagged with "${tag.name}"`,
            url: `https://mira.vercel.app/tags/${slug}`,
            isPartOf: {
              '@type': 'WebSite',
              name: 'Mira Prompts',
              url: 'https://mira.vercel.app',
            },
          })
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: breadcrumbs.map((item, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              name: item.label,
              item: `https://mira.vercel.app${item.href}`,
            })),
          })
        }}
      />
      <div className="px-4 md:px-8 pt-6 pb-6">
        <Breadcrumb items={breadcrumbs} />
        <h1 className="text-2xl font-bold text-black mt-4">#{tag.name} Prompts</h1>
        <p className="text-gray-500 text-sm mt-2">
          {prompts.length} prompt{prompts.length !== 1 ? 's' : ''} tagged with #{tag.name}
        </p>
      </div>
      <MasonryGrid prompts={prompts} savedIds={savedIds} isLoggedIn={!!user} />
    </main>
  )
}
