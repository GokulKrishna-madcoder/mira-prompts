import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'

export const metadata = { title: 'Webhooks - Admin' }

export default async function AdminWebhooksPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!profile || !['admin', 'editor'].includes(profile.role)) redirect('/')

  // Admin Client
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: events } = await supabaseAdmin
    .from('payment_webhook_events')
    .select('*')
    .order('received_at', { ascending: false })
    .limit(100)

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-black">Webhook Events</h1>
        <p className="text-gray-500 text-sm mt-1">Diagnostic page for tracking Razorpay webhook deliveries and failures.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Received</th>
                <th className="px-6 py-4">Event ID / Type</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Retries</th>
                <th className="px-6 py-4">Error Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {events?.map((ev) => (
                <tr key={ev.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-xs text-gray-500 font-mono">
                    {new Date(ev.received_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-black font-mono text-[11px]">{ev.event_id}</p>
                    <p className="text-xs text-indigo-600 font-bold mt-0.5">{ev.event_type}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      ev.processing_status === 'processed' ? 'bg-green-100 text-green-700' : 
                      ev.processing_status === 'failed' ? 'bg-red-100 text-red-700' : 
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {ev.processing_status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-gray-700">{ev.attempt_count}</span>
                  </td>
                  <td className="px-6 py-4">
                    {ev.error_message ? (
                      <p className="text-[11px] text-red-600 font-medium max-w-xs truncate" title={ev.error_message}>
                        {ev.error_message}
                      </p>
                    ) : (
                      <span className="text-[11px] text-gray-400">None</span>
                    )}
                  </td>
                </tr>
              ))}
              {(!events || events.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500 font-medium">No webhook events recorded.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
