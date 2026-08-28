import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SubmitPromptForm from '@/components/prompt/SubmitPromptForm'

export default async function EditPromptPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const resolvedParams = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [
    { data: prompt },
    { data: categories }
  ] = await Promise.all([
    supabase
      .from('prompts')
      .select('*, tags:prompt_tags(tag:tags(name))')
      .eq('id', resolvedParams.id)
      .single(),
    supabase
      .from('categories')
      .select('id, name')
      .order('name')
  ])

  if (!prompt || prompt.created_by !== user.id) redirect('/posts')

  const initialData = {
    id: prompt.id,
    title: prompt.title,
    prompt: prompt.prompt,
    image_url: prompt.image_url,
    category_id: prompt.category_id,
    model: prompt.model,
    aspect_ratio: prompt.aspect_ratio,
    style: prompt.style,
    ai_tool: prompt.source_name,
    variant_type: prompt.variant_type || 'standard',
    variants: prompt.variants || [],
    tags: prompt.tags?.map((t: any) => t.tag.name) || [],
    status: prompt.status
  }

  return (
    <main className="w-full min-h-screen flex flex-col">
      <div className="flex-1 max-w-6xl mx-auto w-full px-4 md:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-black">Edit Prompt</h1>
          <p className="text-gray-500 mt-2 font-medium">Update your prompt details and variations.</p>
        </div>
        <SubmitPromptForm categories={categories || []} initialData={initialData} />
      </div>
    </main>
  )
}
