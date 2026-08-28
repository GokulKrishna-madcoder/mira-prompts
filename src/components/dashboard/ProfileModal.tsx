'use client'

import { useState, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { X, Upload, Camera } from 'lucide-react'
import { updateProfile } from '@/lib/user-actions'
import { getAvatarGradient } from '@/lib/avatar'

export default function ProfileModal({ profile, email }: { profile: any, email: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isOpen = searchParams.get('modal') === 'profile'
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState(profile?.avatar_url || null)
  const fileRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const closeModal = () => {
    router.back()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    try {
      const res = await updateProfile(formData)
      if (res.error) alert(res.error)
      else closeModal()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const userInitial = (profile?.display_name || email || 'U').charAt(0).toUpperCase()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[32px] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
        <div className="sticky top-0 bg-white/80 backdrop-blur px-8 py-5 border-b border-gray-100 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-gray-900">Edit Profile</h2>
          <button onClick={closeModal} className="p-2 bg-gray-100 text-gray-500 rounded-full hover:bg-gray-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative group cursor-pointer" onClick={() => fileRef.current?.click()}>
              <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden flex items-center justify-center">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className={`w-full h-full text-white flex items-center justify-center text-4xl font-bold ${getAvatarGradient(userInitial)}`}>
                    {userInitial}
                  </div>
                )}
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </div>
            <input ref={fileRef} type="file" name="avatar" accept="image/*" className="hidden" onChange={handleFileChange} />
            <span className="text-xs font-bold text-[#E11D48]">Change Photo</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Display Name</label>
              <input name="display_name" defaultValue={profile?.display_name || ''} required className="w-full px-5 py-3.5 border border-gray-200 rounded-2xl bg-gray-50 focus:outline-none focus:border-black focus:bg-white text-sm font-medium" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Username</label>
              <input name="username" defaultValue={profile?.username || ''} placeholder="@username" className="w-full px-5 py-3.5 border border-gray-200 rounded-2xl bg-gray-50 focus:outline-none focus:border-black focus:bg-white text-sm font-medium" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-gray-700">Email Address <span className="text-xs text-gray-400 font-normal">(Read-only)</span></label>
              <input value={email} readOnly className="w-full px-5 py-3.5 border border-gray-200 rounded-2xl bg-gray-100 text-gray-500 text-sm font-medium cursor-not-allowed" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-gray-700">Bio</label>
              <textarea name="bio" defaultValue={profile?.bio || ''} rows={3} placeholder="Tell us about yourself..." className="w-full px-5 py-3.5 border border-gray-200 rounded-2xl bg-gray-50 focus:outline-none focus:border-black focus:bg-white text-sm font-medium resize-y" />
            </div>
          </div>

          {/* Social Links */}
          <div className="space-y-4 pt-6 border-t border-gray-100">
            <h3 className="font-bold text-gray-900">Social Links</h3>
            {['Instagram', 'Youtube', 'Facebook', 'X', 'Pinterest'].map(social => (
              <div key={social} className="flex items-center gap-3">
                <span className="w-24 text-sm font-semibold text-gray-500">{social}</span>
                <input name={`social_${social.toLowerCase()}`} defaultValue={profile?.social_links?.[social.toLowerCase()] || ''} placeholder={`https://${social.toLowerCase()}.com/...`} className="flex-1 px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-black focus:bg-white text-sm font-medium" />
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
            <button type="button" onClick={closeModal} className="px-6 py-3 border border-gray-200 text-gray-700 rounded-full text-sm font-bold hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="px-8 py-3 bg-[#E11D48] text-white rounded-full text-sm font-bold hover:bg-red-700 disabled:opacity-50 transition-colors">
              {isSubmitting ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function UserIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}
