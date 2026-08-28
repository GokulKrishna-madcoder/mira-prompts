import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Bell } from 'lucide-react'
import { markNotificationsRead } from '@/lib/user-actions'

export default async function NotificationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: notificationsData } = await supabase
    .from('prompts')
    .select('id, title, slug, image_url, is_featured, is_premium, created_at')
    .or('is_featured.eq.true,is_premium.eq.true')
    .order('created_at', { ascending: false })
    .limit(20)

  const notifications = notificationsData || []

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-sm text-gray-500 mt-1">Stay updated on the latest featured and premium prompts</p>
        </div>
        {notifications.length > 0 && (
          <form action={async () => {
            'use server'
            await markNotificationsRead()
          }}>
            <button type="submit" className="text-sm font-bold text-[#E11D48] hover:underline bg-transparent border-none cursor-pointer">
              Mark all as read
            </button>
          </form>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-[24px] shadow-sm min-h-[400px] overflow-hidden">
        {notifications.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {notifications.map(n => (
              <Link href={`/prompts/${n.slug}`} key={n.id} className="flex gap-4 p-6 hover:bg-gray-50 transition-colors">
                {n.image_url ? (
                  <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 relative bg-gray-100 border border-gray-200 shadow-sm">
                    <Image src={n.image_url} alt={n.title} fill className="object-cover" unoptimized />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-gray-100 shrink-0 border border-gray-200 shadow-sm" />
                )}
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <p className="text-base font-bold text-gray-900 mb-1 leading-snug">
                      New {n.is_premium ? 'Prime' : 'Featured'} prompt: {n.title}
                    </p>
                    <span className="text-xs font-semibold text-gray-400 whitespace-nowrap ml-4">
                      {new Date(n.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-1">
                    Check out this new {n.is_premium ? 'premium' : 'featured'} prompt now available in the library!
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-12 h-[400px]">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
              <Bell className="w-8 h-8 text-gray-300" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">You're all caught up!</h2>
            <p className="text-sm text-gray-500 max-w-sm">
              When new featured or premium prompts are released, you'll see them here.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
