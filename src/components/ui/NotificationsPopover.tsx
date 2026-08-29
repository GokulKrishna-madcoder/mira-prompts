'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { markNotificationsRead } from '@/lib/user-actions'
import Link from 'next/link'
import Image from 'next/image'

export default function NotificationsPopover({ userLastRead }: { userLastRead: string | null }) {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const [hasUnread, setHasUnread] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchNotifications()
    const channel = supabase.channel('realtime_prompts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'prompts' }, (payload) => {
        const newPrompt = payload.new
        if (newPrompt.is_featured || newPrompt.is_premium) {
          setNotifications(prev => [newPrompt, ...prev].slice(0, 10))
          setHasUnread(true)
        }
      }).subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  async function fetchNotifications() {
    const { data } = await supabase.from('prompts')
      .select('id, title, slug, image_url, is_featured, is_premium, created_at')
      .or('is_featured.eq.true,is_premium.eq.true')
      .order('created_at', { ascending: false })
      .limit(10)
    
    if (data) {
      setNotifications(data)
      if (userLastRead) {
        const hasNew = data.some(n => new Date(n.created_at) > new Date(userLastRead))
        setHasUnread(hasNew)
      } else if (data.length > 0) {
        setHasUnread(true)
      }
    }
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) setIsOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleOpen = async () => {
    setIsOpen(!isOpen)
    if (!isOpen && hasUnread) {
      setHasUnread(false)
      await markNotificationsRead()
    }
  }

  return (
    <div className="relative" ref={popoverRef}>
      <button onClick={handleOpen} className="relative w-12 h-12 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600 transition-colors">
        <Bell className="w-6 h-6" strokeWidth={2.5} />
        {hasUnread && <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-14 w-80 bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden z-50">
          <div className="p-4 border-b border-gray-50 bg-gray-50/50">
            <h3 className="font-bold text-gray-900">Updates for you</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm font-medium">No new updates right now.</div>
            ) : (
              <div className="divide-y divide-gray-50">
                {notifications.map(n => (
                  <Link href={`/prompts/${n.slug}`} key={n.id} onClick={() => setIsOpen(false)} className="flex gap-4 p-4 hover:bg-gray-50 transition-colors">
                    {n.image_url ? (
                      <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 relative bg-gray-100">
                        <Image src={n.image_url} alt="" fill className="object-cover" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-gray-100 shrink-0" />
                    )}
                    <div>
                      <p className="text-sm font-semibold text-gray-900 mb-0.5 leading-snug">
                        New {n.is_premium ? 'Prime' : 'Featured'} prompt: {n.title}
                      </p>
                      <p className="text-xs text-gray-500">{new Date(n.created_at).toLocaleDateString()}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

