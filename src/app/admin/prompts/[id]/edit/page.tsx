import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PromptForm from '@/components/admin/prompt-form'

export default async function EditPromptPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const supabase = await createClient()

  // Ensure user is an admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  
  // Await params to support Next.js 15+ async params
  const resolvedParams = await params

  // Parallel fetch prompt and categories
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
      .order('sort_order')
  ])

  if (!prompt) {
    redirect('/admin/prompts')
  }

  return (
    <div id="admin-edit-prompt" className="admin-edit-prompt p-8 max-w-4xl mx-auto">
      <div id="edit-prompt-header" className="edit-prompt-header mb-8">
        <h1 className="edit-prompt-title text-2xl font-bold text-black">Edit Prompt</h1>
        <p className="edit-prompt-subtitle text-gray-500 text-sm mt-1">Update the prompt details or replace its generated image.</p>
      </div>
      <PromptForm categories={categories || []} initialData={prompt} />
    </div>
  )
}
