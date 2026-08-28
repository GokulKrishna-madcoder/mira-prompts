'use client'

import { useState } from 'react'
import { updatePassword } from '@/lib/user-actions'

export default function SecurityForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    const formData = new FormData(e.currentTarget)
    const newPass = formData.get('new_password') as string
    const confirmPass = formData.get('confirm_password') as string

    if (newPass !== confirmPass) {
      alert("New passwords do not match")
      setIsSubmitting(false)
      return
    }

    try {
      const res = await updatePassword(formData)
      if (res.error) {
        alert(res.error)
      } else {
        alert('Password updated successfully')
        ;(e.target as HTMLFormElement).reset()
      }
    } catch (err: any) {
      alert(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-700">Current Password</label>
        <input name="current_password" type="password" required className="w-full px-5 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-black text-sm" />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-700">New Password</label>
        <input name="new_password" type="password" required minLength={6} className="w-full px-5 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-black text-sm" />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-700">Confirm New Password</label>
        <input name="confirm_password" type="password" required minLength={6} className="w-full px-5 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-black text-sm" />
      </div>

      <button type="submit" disabled={isSubmitting} className="px-6 py-3 bg-black text-white font-bold rounded-full hover:bg-gray-800 disabled:opacity-50 transition-colors">
        {isSubmitting ? 'Updating...' : 'Update Password'}
      </button>
    </form>
  )
}
