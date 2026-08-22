import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'

export const metadata = { title: 'Audit Logs - Admin' }

export default async function AdminAuditPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!profile || profile.role !== 'admin') redirect('/')

  // Admin Client
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: logs } = await supabaseAdmin
    .from('admin_audit_logs')
    .select('*, profiles(display_name, email)')
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-black">Audit Logs</h1>
        <p className="text-gray-500 text-sm mt-1">Immutable record of all privileged actions.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Actor</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Resource</th>
                <th className="px-6 py-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs?.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-xs text-gray-500 font-mono">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {(log.profiles as any)?.display_name || 'System / Unknown'}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-bold font-mono">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs font-bold uppercase text-gray-500">{log.resource_type}</p>
                    <p className="text-[10px] text-gray-400 font-mono mt-0.5">{log.resource_id}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-xs overflow-hidden text-[10px] bg-gray-50 p-2 rounded border border-gray-100">
                      {log.after_data && (
                        <div className="truncate">
                          <span className="font-bold text-gray-500 mr-1">AFTER:</span>
                          <span className="font-mono text-green-700">{JSON.stringify(log.after_data)}</span>
                        </div>
                      )}
                      {log.before_data && (
                        <div className="truncate mt-1">
                          <span className="font-bold text-gray-500 mr-1">BEFORE:</span>
                          <span className="font-mono text-red-700">{JSON.stringify(log.before_data)}</span>
                        </div>
                      )}
                      {!log.after_data && !log.before_data && <span className="text-gray-400">No diff</span>}
                    </div>
                  </td>
                </tr>
              ))}
              {(!logs || logs.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500 font-medium">No audit logs found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
