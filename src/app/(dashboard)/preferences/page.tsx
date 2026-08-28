import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PreferencesForm from '@/components/dashboard/PreferencesForm'

export default async function PreferencesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('preferences').eq('id', user.id).single()
  const preferences = profile?.preferences || {}

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Preferences</h1>
        <p className="text-sm text-gray-500 mt-1">Customize your experience and notifications</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-[24px] p-8 shadow-sm">
        <PreferencesForm initialPreferences={preferences} />
      </div>
    </div>
  )
}
