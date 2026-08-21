import { Metadata, ResolvingMetadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import PromptDetail from '@/components/prompt/PromptDetail'
import Breadcrumb from '@/components/ui/Breadcrumb'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata(
  { params }: Props,
  _parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  const { data: prompt } = await supabase
    .from('prompts')
    .select('title, prompt, image_url, category:categories(name, slug)')
    .eq('slug', slug)
    .single()

  if (!prompt) {
    return {
      title: 'Prompt Not Found',
    }
  }

  const description = prompt.prompt.length > 150 
    ? `${prompt.prompt.substring(0, 147)}...` 
    : prompt.prompt

  return {
    title: prompt.title,
    description: description,
    openGraph: {
      title: prompt.title,
      description: description,
      images: [
        {
          url: prompt.image_url,
          width: 1024,
          height: 1024,
          alt: prompt.title,
        },
      ],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: prompt.title,
      description: description,
      images: [prompt.image_url],
    },
    alternates: {
      canonical: `https://mira-prompts.vercel.app/prompts/${slug}`,
    },
  }
}

export default async function PromptPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()
  
  const { data: prompt } = await supabase
    .from('prompts')
    .select('title, prompt, image_url, source_name, created_at, category:categories(name, slug)')
    .eq('slug', slug)
    .single()

  const catData = prompt?.category as { name?: string; slug?: string } | null
  const categoryName = catData?.name
  const categorySlug = catData?.slug

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    ...(categoryName && categorySlug
      ? [{ label: categoryName, href: `/categories/${categorySlug}` }]
      : []),
    { label: prompt?.title || 'Prompt', href: `/prompts/${slug}` },
  ]

  return (
    <div className="p-4 md:p-12 w-full">
      {prompt && (
        <>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'ImageObject',
                name: prompt.title,
                description: prompt.prompt,
                contentUrl: prompt.image_url,
                datePublished: prompt.created_at,
                creator: {
                  '@type': 'Person',
                  name: prompt.source_name || 'Mira Prompts User'
                }
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
                  item: `https://mira-prompts.vercel.app${item.href}`,
                })),
              })
            }}
          />
        </>
      )}
      <div className="mb-6">
        <Breadcrumb items={breadcrumbs} />
      </div>
      <PromptDetail slug={slug} />
    </div>
  )
}
