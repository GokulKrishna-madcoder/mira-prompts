import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { updateUserRole } from '@/lib/admin-actions'
import { DeleteUserButton } from '@/components/admin/DeleteUserButton'
import { CheckCircle2, AlertCircle } from 'lucide-react'

export const metadata = { title: 'Members - Admin' }

export default async function AdminMembersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!profile || profile.role !== 'admin') redirect('/')

  // Admin Client to fetch raw emails securely
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Fetch profiles with authoritative subscriptions and entitlements
  const { data: profiles } = await supabaseAdmin
    .from('profiles')
    .select(`
      *,
      subscriptions (
        status,
        subscription_plans (name)
      ),
      entitlements (feature_key, active)
    `)
    .order('created_at', { ascending: false })

  // Fetch raw auth users to get emails
  const { data: { users: authUsers } } = await supabaseAdmin.auth.admin.listUsers()
  
  // Map emails to profiles
  const members = profiles?.map(p => {
    const activeSub = (p.subscriptions as any[])?.find(s => s.status === 'active' || s.status === 'trialing')
    const subPlan = activeSub?.subscription_plans
    const planName = Array.isArray(subPlan) ? subPlan[0]?.name : subPlan?.name
    const activeEntitlements = (p.entitlements as any[])?.filter(e => e.active).map(e => e.feature_key) || []
    const authUser = authUsers.find(u => u.id === p.id)

    return {
      ...p,
      email: authUser?.email || 'No email',
      is_verified: !!authUser?.email_confirmed_at,
      authoritative_status: activeSub ? activeSub.status : 'None',
      plan_name: planName || 'Free',
      entitlements: activeEntitlements
    }
  })

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-black">Members</h1>
          <p className="text-gray-500 text-sm mt-1">Manage user access and authoritative subscriptions.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Plan</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Entitlements</th>
                <th className="px-6 py-4 text-right">Joined</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {members?.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-black">{p.display_name || 'Anonymous User'}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <p className="text-xs text-gray-500">{p.email}</p>
                      {p.is_verified ? (
                        <span title="Verified"><CheckCircle2 className="w-3.5 h-3.5 text-green-500" /></span>
                      ) : (
                        <span title="Unverified"><AlertCircle className="w-3.5 h-3.5 text-amber-500" /></span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <form action={updateUserRole} className="flex items-center gap-2">
                      <input type="hidden" name="userId" value={p.id} />
                      <select name="role" defaultValue={p.role} className="text-xs border border-gray-200 rounded p-1 bg-white">
                        <option value="user">User</option>
                        <option value="editor">Editor</option>
                        <option value="admin">Admin</option>
                      </select>
                      <button type="submit" className="text-[10px] bg-black text-white px-2 py-1 rounded hover:bg-gray-800 transition-colors">Save</button>
                    </form>
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-900">
                    {p.plan_name}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      p.authoritative_status === 'active' || p.authoritative_status === 'trialing' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {p.authoritative_status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {p.entitlements.length > 0 ? p.entitlements.map((e: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[10px] font-mono border border-indigo-100">
                          {e}
                        </span>
                      )) : <span className="text-xs text-gray-400">None</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right text-gray-500 font-medium">
                    {new Date(p.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <DeleteUserButton userId={p.id} email={p.email} />
                  </td>
                </tr>
              ))}
              {(!members || members.length === 0) && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500 font-medium">No members found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
