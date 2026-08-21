import { createClient } from '@/lib/supabase/server'
import PromptForm from '@/components/admin/prompt-form'

export default async function NewPromptPage() {
  const supabase = await createClient()
  const { data: categories } = await supabase.from('categories').select('id, name').order('sort_order')

  return (
    <div id="admin-new-prompt" className="admin-new-prompt p-8 max-w-4xl mx-auto">
      <div id="new-prompt-header" className="new-prompt-header mb-8">
        <h1 className="new-prompt-title text-2xl font-bold text-black">New Prompt</h1>
        <p className="new-prompt-subtitle text-gray-500 text-sm mt-1">Upload an image and detail the exact prompt used to generate it.</p>
      </div>
      <PromptForm categories={categories || []} />
    </div>
  )
}
