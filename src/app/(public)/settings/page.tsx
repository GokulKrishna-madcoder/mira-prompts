import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { signOut } from '@/lib/auth-actions'
import PasswordForm from '@/components/settings/PasswordForm'
import ProfileForm from '@/components/settings/ProfileForm'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-8">Settings</h1>

      {/* Profile Section */}
      <div className="mb-8">
        <ProfileForm initialProfile={profile} email={user.email || ''} />
      </div>

      {/* Password Section */}
      <section className="bg-white border border-gray-200 rounded-[32px] p-8 mb-8 shadow-sm">
        <h2 className="text-xl font-bold text-black mb-6">Change Password</h2>
        <div className="max-w-md">
          <PasswordForm />
        </div>
      </section>

      {/* Danger Zone */}
      <section className="bg-red-50/50 border border-red-100 rounded-[32px] p-8">
        <h2 className="text-xl font-bold text-red-600 mb-2">Danger Zone</h2>
        <p className="text-sm text-red-600/70 mb-6 font-medium">Signing out or deleting your account will revoke your session.</p>
        <form action={signOut}>
          <button type="submit" className="px-8 py-3 bg-white border border-red-200 text-red-600 font-bold rounded-full hover:bg-red-50 hover:border-red-300 transition-colors shadow-sm">
            Sign Out
          </button>
        </form>
      </section>
    </main>
  )
}
