import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import MasonryGrid from '@/components/ui/MasonryGrid'
import type { PromptCard } from '@/types/prompt'

export const metadata: Metadata = {
  title: 'Saved Prompts',
  robots: { index: false, follow: false },
}

export default async function SavedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: saves } = await supabase
    .from('prompt_saves')
    .select('prompt_id, prompts(id, title, slug, image_url)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const savedPrompts = (saves?.map(s => s.prompts).filter(Boolean) ?? []).flat() as PromptCard[]
  const savedIds = saves?.map(s => s.prompt_id) || []

  return (
    <main className="w-full mx-auto pb-10">
      <div className="px-4 md:px-8 pt-6 pb-6">
        <h1 className="text-2xl font-bold text-black">Saved</h1>
      </div>
      <MasonryGrid prompts={savedPrompts} savedIds={savedIds} isLoggedIn={true} />
    </main>
  )
}
