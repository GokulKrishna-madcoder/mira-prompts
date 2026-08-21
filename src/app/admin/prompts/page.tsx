import { createClient } from '@/lib/supabase/server'
import { deletePrompt } from '@/lib/admin-actions'
import Link from 'next/link'
import { PlusCircle, Pencil, Archive } from 'lucide-react'
import Image from 'next/image'

export default async function AdminPromptsPage() {
  const supabase = await createClient()
  const { data: prompts } = await supabase
    .from('prompts')
    .select('id, title, slug, image_url, status, is_featured, created_at, view_count, copy_count, category:categories(name)')
    .neq('status', 'archived')
    .order('created_at', { ascending: false })

  return (
    <div id="admin-prompts" className="admin-prompts p-8">
      <div id="prompts-header" className="prompts-header flex items-center justify-between mb-6">
        <div>
          <h1 className="prompts-title text-2xl font-bold text-black">Prompts</h1>
          <p className="prompts-subtitle text-gray-500 text-sm mt-1">{prompts?.length || 0} total</p>
        </div>
        <Link id="prompts-btn-new" href="/admin/prompts/new" className="prompts-btn-new flex items-center gap-2 px-5 py-3 bg-black text-white rounded-full text-sm font-semibold hover:bg-gray-800 transition-colors">
          <PlusCircle className="w-4 h-4" />
          New Prompt
        </Link>
      </div>

      <div id="prompts-grid" className="prompts-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {prompts?.map(p => (
          <div key={p.id} id={`admin-card-${p.id}`} className="admin-prompt-card bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
            {/* Image */}
            {p.image_url && (
              <div className="admin-prompt-card-img relative h-48 bg-gray-100 overflow-hidden">
                <Image src={p.image_url} alt={p.title} fill className="object-cover" unoptimized />
                <div className="admin-prompt-card-overlay absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Link href={`/admin/prompts/${p.id}/edit`} className="admin-prompt-btn-edit px-4 py-2 bg-white text-black text-xs font-semibold rounded-full hover:bg-gray-100 transition-colors flex items-center gap-1.5">
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </Link>
                </div>
              </div>
            )}

            {/* Info */}
            <div className="admin-prompt-card-body p-5">
              <div className="admin-prompt-card-meta flex items-center gap-2 mb-2">
                <span className={`admin-prompt-status text-[11px] px-2.5 py-1 rounded-full font-semibold ${
                  p.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {p.status}
                </span>
                {p.is_featured && (
                  <span className="admin-prompt-featured text-[11px] px-2.5 py-1 rounded-full font-semibold bg-amber-100 text-amber-700">
                    Featured
                  </span>
                )}
              </div>
              <h3 className="admin-prompt-card-title text-sm font-semibold text-black truncate">{p.title}</h3>
              <p className="admin-prompt-card-category text-xs text-gray-400 mt-1">
                {(p.category as any)?.name || 'Uncategorized'} · {p.view_count} views
              </p>

              <div className="admin-prompt-card-actions flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                <Link href={`/admin/prompts/${p.id}/edit`} className="admin-action-edit flex-1 text-center py-2 text-xs font-semibold text-gray-600 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  Edit
                </Link>
                <form action={deletePrompt.bind(null, p.id)} className="flex-1">
                  <button type="submit" className="admin-action-archive w-full py-2 text-xs font-semibold text-red-500 bg-red-50 rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center gap-1">
                    <Archive className="w-3.5 h-3.5" /> Archive
                  </button>
                </form>
              </div>
            </div>
          </div>
        ))}

        {(!prompts || prompts.length === 0) && (
          <div id="prompts-empty" className="prompts-empty col-span-full py-20 text-center">
            <p className="text-gray-400 mb-4">No prompts yet.</p>
            <Link href="/admin/prompts/new" className="px-5 py-3 bg-black text-white rounded-full text-sm font-semibold hover:bg-gray-800 transition-colors">
              Create your first one
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
