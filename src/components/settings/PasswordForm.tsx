'use client'

import { updatePassword } from '@/lib/user-actions'
import { useActionState } from 'react'
import { Loader2 } from 'lucide-react'

export default function PasswordForm() {
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string; success?: boolean } | null, formData: FormData) => {
      return await updatePassword(formData) ?? null
    },
    null
  )

  return (
    <form action={action} className="space-y-6">
      <div>
        <label className="block text-sm font-bold text-gray-900 mb-2">New Password</label>
        <input
          name="new_password"
          type="password"
          required
          minLength={6}
          placeholder="Min 6 characters"
          className="w-full px-5 py-4 bg-gray-50 rounded-2xl border border-gray-200 focus:border-black focus:bg-white outline-none transition-all font-medium"
        />
      </div>
      
      <div className="flex items-center justify-between pt-2">
        <div>
          {state?.error && <p className="text-sm font-bold text-red-500">{state.error}</p>}
          {state?.success && <p className="text-sm font-bold text-green-500">Password successfully updated!</p>}
        </div>
        <button
          type="submit"
          disabled={pending}
          className="px-8 py-4 bg-black text-white font-bold rounded-full hover:bg-gray-800 transition-all disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98] flex items-center gap-2"
        >
          {pending && <Loader2 className="w-4 h-4 animate-spin" />}
          {pending ? 'Updating...' : 'Update Password'}
        </button>
      </div>
    </form>
  )
}
