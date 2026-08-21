import { createClient } from '@/lib/supabase/server'
import { resolveTicket } from '@/lib/admin-actions'
import { CheckCircle, Clock } from 'lucide-react'

export default async function TicketsPage() {
  const supabase = await createClient()
  const { data: tickets } = await supabase
    .from('support_tickets')
    .select('*, profile:profiles(email, display_name)')
    .order('created_at', { ascending: false })

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-black mb-8">Support Tickets</h1>
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="py-4 px-6 text-sm font-semibold text-gray-500">User</th>
              <th className="py-4 px-6 text-sm font-semibold text-gray-500">Message</th>
              <th className="py-4 px-6 text-sm font-semibold text-gray-500">Status</th>
              <th className="py-4 px-6 text-sm font-semibold text-gray-500 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {tickets?.map(ticket => (
              <tr key={ticket.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="py-4 px-6 align-top">
                  <div className="font-medium text-black">{ticket.profile?.display_name || 'Anonymous'}</div>
                  <div className="text-sm text-gray-500">{ticket.profile?.email || 'N/A'}</div>
                </td>
                <td className="py-4 px-6 align-top text-gray-600 text-sm max-w-md">
                  {ticket.message}
                </td>
                <td className="py-4 px-6 align-top">
                  {ticket.status === 'resolved' ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                      <CheckCircle className="w-3.5 h-3.5" /> Resolved
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold">
                      <Clock className="w-3.5 h-3.5" /> Open
                    </span>
                  )}
                </td>
                <td className="py-4 px-6 align-top text-right">
                  {ticket.status === 'open' && (
                    <form action={async () => {
                      'use server'
                      await resolveTicket(ticket.id)
                    }}>
                      <button className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                        Mark Resolved
                      </button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
            {(!tickets || tickets.length === 0) && (
              <tr>
                <td colSpan={4} className="py-12 text-center text-gray-500">No support tickets found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
