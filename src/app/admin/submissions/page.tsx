import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import { approveSubmission, rejectSubmission } from './actions'

export default async function AdminSubmissionsPage() {
  const supabase = await createClient()
  const { data: prompts } = await supabase
    .from('prompts')
    .select('id, title, slug, image_url, prompt, status, created_at, created_by, variant_type, profiles:created_by(display_name, username)')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-black">Submissions</h1>
          <p className="text-gray-500 text-sm mt-1">{prompts?.length || 0} pending review</p>
        </div>
      </div>

      {prompts && prompts.length > 0 ? (
        <div className="space-y-4">
          {prompts.map(p => {
            const profile = p.profiles as any
            return (
              <div key={p.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col md:flex-row gap-5 hover:shadow-md transition-shadow">
                {/* Image preview */}
                {p.image_url && (
                  <div className="relative w-full md:w-48 h-36 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                    <Image src={p.image_url} alt={p.title} fill className="object-cover" unoptimized />
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-black truncate">{p.title}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{p.prompt}</p>
                  <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                    <span>By: {profile?.display_name || profile?.username || 'Unknown'}</span>
                    <span>Type: {p.variant_type || 'standard'}</span>
                    <span>{new Date(p.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <form action={approveSubmission.bind(null, p.id)}>
                    <button type="submit" className="px-5 py-2.5 bg-green-500 text-white rounded-full text-sm font-bold hover:bg-green-600 transition-colors">
                      Approve
                    </button>
                  </form>
                  <form action={rejectSubmission.bind(null, p.id)}>
                    <button type="submit" className="px-5 py-2.5 bg-red-50 text-red-500 rounded-full text-sm font-bold hover:bg-red-100 transition-colors border border-red-200">
                      Reject
                    </button>
                  </form>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-5xl mb-4">&#128236;</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">No pending submissions</h2>
          <p className="text-gray-500 text-sm">All caught up! New user submissions will appear here.</p>
        </div>
      )}
    </div>
  )
}

