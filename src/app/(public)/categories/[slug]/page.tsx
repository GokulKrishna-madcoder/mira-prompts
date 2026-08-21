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

  const { data: category } = await supabase
    .from('categories')
    .select('name, description')
    .eq('slug', slug)
    .single()

  if (!category) {
    return { title: 'Category Not Found' }
  }

  const description = category.description
    || `Browse curated AI image prompts in the ${category.name} category on Mira Prompts.`

  return {
    title: `${category.name} Prompts`,
    description,
    openGraph: {
      title: `${category.name} Prompts — Mira Prompts`,
      description,
      url: `https://mira.vercel.app/categories/${slug}`,
      type: 'website',
    },
    alternates: {
      canonical: `https://mira.vercel.app/categories/${slug}`,
    },
  }
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: category } = await supabase
    .from('categories')
    .select('id, name, slug, description')
    .eq('slug', slug)
    .single()

  if (!category) notFound()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: prompts } = await supabase
    .from('prompts')
    .select('id, title, slug, image_url, view_count, copy_count, is_premium, category:categories(slug)')
    .eq('status', 'published')
    .eq('category_id', category.id)
    .order('created_at', { ascending: false })
    .limit(60)

  const typedPrompts = (prompts || []) as PromptCard[]

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
    { label: category.name, href: `/categories/${slug}` },
  ]

  return (
    <main className="w-full mx-auto pb-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: `${category.name} Prompts`,
            description: category.description || `Browse curated AI image prompts in the ${category.name} category`,
            url: `https://mira.vercel.app/categories/${slug}`,
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
        <h1 className="text-2xl font-bold text-black mt-4">{category.name} Prompts</h1>
        {category.description && (
          <p className="text-gray-500 text-sm mt-2">{category.description}</p>
        )}
      </div>
      <MasonryGrid prompts={typedPrompts} savedIds={savedIds} isLoggedIn={!!user} />
    </main>
  )
}
