import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Bell } from 'lucide-react'
import { markNotificationsRead } from '@/lib/user-actions'

export default async function NotificationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // In the future, you can query a real `notifications` table here.
  // For now, we'll show an empty state to match the new dashboard design.
  const notifications: any[] = []

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-sm text-gray-500 mt-1">Stay updated on your prompt activity</p>
        </div>
        {notifications.length > 0 && (
          <form action={async () => {
            'use server'
            await markNotificationsRead()
          }}>
            <button type="submit" className="text-sm font-bold text-[#E11D48] hover:underline">
              Mark all as read
            </button>
          </form>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-[24px] p-8 shadow-sm min-h-[400px] flex flex-col items-center justify-center text-center">
        {notifications.length > 0 ? (
          <div className="w-full space-y-4">
            {/* Map notifications here in the future */}
          </div>
        ) : (
          <>
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
              <Bell className="w-8 h-8 text-gray-300" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">You're all caught up!</h2>
            <p className="text-sm text-gray-500 max-w-sm">
              When people like, save, or copy your prompts, you'll see those notifications here.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
