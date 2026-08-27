import { createClient } from '@/lib/supabase/server'
import PromptInteractiveViewer from '@/components/prompt/PromptInteractiveViewer'

export default async function PromptDetail({ slug }: { slug: string }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: prompt } = await supabase
    .from('prompts')
    .select('*, category:categories(name)')
    .eq('slug', slug)
    .single()

  if (!prompt) return <div className="p-8 text-center text-black">Prompt not found</div>

  let isSaved = false
  let isLiked = false

  if (user) {
    const [savedRes, likedRes] = await Promise.all([
      supabase.from('prompt_saves').select('id').eq('user_id', user.id).eq('prompt_id', prompt.id).single(),
      supabase.from('prompt_likes').select('id').eq('user_id', user.id).eq('prompt_id', prompt.id).single(),
    ])
    isSaved = !!savedRes.data
    isLiked = !!likedRes.data
  }

  return (
    <PromptInteractiveViewer prompt={prompt} isSaved={isSaved} isLiked={isLiked} />
  )
}
