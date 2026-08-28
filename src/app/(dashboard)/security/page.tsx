import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { signOut } from '@/lib/auth-actions'
import SecurityForm from '@/components/dashboard/SecurityForm'

export default async function SecurityPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Security</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your password and account security</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-[24px] p-8 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-6">Change Password</h2>
        <SecurityForm />
      </div>

      <div className="bg-red-50/50 border border-red-100 rounded-[24px] p-8 shadow-sm">
        <h2 className="text-lg font-bold text-red-600 mb-2">Danger Zone</h2>
        <p className="text-sm text-red-600/70 mb-6">These actions are permanent and cannot be undone.</p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <form action={signOut}>
            <button type="submit" className="w-full sm:w-auto px-6 py-2.5 bg-white border border-red-200 text-red-600 font-bold rounded-full hover:bg-red-50 transition-colors">
              Sign Out Everywhere
            </button>
          </form>
          
          <button className="w-full sm:w-auto px-6 py-2.5 bg-red-600 text-white font-bold rounded-full hover:bg-red-700 transition-colors">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  )
}
