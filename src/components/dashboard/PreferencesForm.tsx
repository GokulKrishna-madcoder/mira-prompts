'use client'

import { useState } from 'react'
import { updatePreferences } from '@/lib/user-actions'

export default function PreferencesForm({ initialPreferences }: { initialPreferences: any }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [prefs, setPrefs] = useState({
    email_notifications: initialPreferences?.email_notifications ?? true,
    browser_notifications: initialPreferences?.browser_notifications ?? false,
    prompt_picks: initialPreferences?.prompt_picks ?? true,
    haptic_feedback: initialPreferences?.haptic_feedback ?? true,
    analytics: initialPreferences?.analytics ?? true,
  })

  const handleToggle = (key: keyof typeof prefs) => {
    setPrefs(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const formData = new FormData()
      formData.set('preferences', JSON.stringify(prefs))
      const res = await updatePreferences(formData)
      if (res.error) alert(res.error)
      else alert('Preferences saved!')
    } catch (err: any) {
      alert(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const items = [
    { key: 'email_notifications', label: 'Email Notifications', desc: 'Receive important updates and activity via email.' },
    { key: 'browser_notifications', label: 'Browser Notifications', desc: 'Get push notifications directly in your browser.' },
    { key: 'prompt_picks', label: 'Prompt Picks Email', desc: 'Weekly curated prompts sent to your inbox.' },
    { key: 'haptic_feedback', label: 'Haptic Feedback', desc: 'Enable subtle vibrations for interactions (on supported devices).' },
    { key: 'analytics', label: 'Analytics & Personalization', desc: 'Allow us to use your activity to improve recommendations.' },
  ] as const

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-6">
        {items.map(item => (
          <div key={item.key} className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-900">{item.label}</h3>
              <p className="text-sm text-gray-500 mt-0.5">{item.desc}</p>
            </div>
            <button
              type="button"
              onClick={() => handleToggle(item.key)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${prefs[item.key] ? 'bg-[#E11D48]' : 'bg-gray-200'}`}
            >
              <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${prefs[item.key] ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
        ))}
      </div>

      <div className="pt-6 border-t border-gray-100 flex justify-end">
        <button type="submit" disabled={isSubmitting} className="px-8 py-3 bg-black text-white font-bold rounded-full hover:bg-gray-800 disabled:opacity-50 transition-colors">
          {isSubmitting ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>
    </form>
  )
}
