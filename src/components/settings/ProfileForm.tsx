'use client'

import { updateProfile } from '@/lib/user-actions'
import { useActionState, useState } from 'react'
import { User, Mail, Sparkles, Loader2 } from 'lucide-react'

export default function ProfileForm({ initialProfile, email }: { initialProfile: any, email: string }) {
  const [displayName, setDisplayName] = useState(initialProfile?.display_name || '')
  const [bio, setBio] = useState(initialProfile?.bio || '')

  const [state, action, pending] = useActionState(
    async (_prev: any, formData: FormData) => {
      const res = await updateProfile(formData)
      return res ?? null
    },
    null
  )

  return (
    <div className="flex flex-col gap-10">
      {/* Visual Profile Preview Card */}
      <div id="visual-profile-card" className="visual-profile-card w-full mx-auto">
        <div className="bg-gradient-to-br from-gray-900 to-black rounded-[32px] p-6 text-white shadow-xl relative overflow-hidden transition-all hover:shadow-2xl hover:scale-[1.02] duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10" />
          
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-6 border border-white/10">
            <User className="w-8 h-8 text-white" />
          </div>
          
          <h3 className="font-bold text-xl mb-1 truncate">{displayName || 'Anonymous'}</h3>
          <div className="flex items-center gap-2 text-white/50 text-xs mb-4">
            <Mail className="w-3 h-3 shrink-0" />
            <span className="truncate">{email}</span>
          </div>
          
          <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
            <p className="text-sm text-white/80 leading-relaxed line-clamp-3">
              {bio || <span className="italic opacity-50">No bio provided yet...</span>}
            </p>
          </div>

          <div className="mt-6 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/40">
            <Sparkles className="w-3 h-3" />
            {initialProfile?.subscription_tier || 'Free'} Member
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <section className="bg-white border border-gray-200 rounded-[32px] p-8 shadow-sm w-full">
        <h2 className="text-xl font-bold text-black mb-8">Profile Details</h2>
        <form action={action} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Display Name</label>
            <input
              name="display_name"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
              className="w-full px-5 py-4 bg-gray-50 rounded-2xl border border-gray-200 focus:border-black focus:bg-white outline-none transition-all font-medium"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Bio</label>
            <textarea
              name="bio"
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself"
              className="w-full px-5 py-4 bg-gray-50 rounded-2xl border border-gray-200 focus:border-black focus:bg-white outline-none transition-all resize-none font-medium text-gray-600"
            />
          </div>
          
          <div className="flex items-center justify-between pt-2">
            <div>
              {state?.error && <p className="text-sm font-bold text-red-500">{state.error}</p>}
              {state?.success && <p className="text-sm font-bold text-green-500">Profile successfully updated!</p>}
            </div>
            
            <button
              type="submit"
              disabled={pending}
              className="px-8 py-4 bg-black text-white font-bold rounded-full hover:bg-gray-800 transition-all disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98] flex items-center gap-2"
            >
              {pending && <Loader2 className="w-4 h-4 animate-spin" />}
              {pending ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
