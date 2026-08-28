import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SubmitPromptForm from '@/components/prompt/SubmitPromptForm'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'Submit a Prompt',
  robots: { index: false, follow: false },
}

export default async function SubmitPromptPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name')
    .order('name')

  return (
    <main className="w-full min-h-screen flex flex-col">
      <div className="flex-1 max-w-6xl mx-auto w-full px-4 md:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-black">Submit a Prompt</h1>
          <p className="text-gray-500 text-sm mt-1">Share your best AI prompts with the community</p>
        </div>
        <SubmitPromptForm categories={categories || []} />
      </div>
      
    </main>
  )
}
