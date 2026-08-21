import { createClient } from '@/lib/supabase/server'
import { createTag, deleteTag } from '@/lib/admin-actions'
import { PlusCircle, X } from 'lucide-react'

export default async function AdminTagsPage() {
  const supabase = await createClient()
  const { data: tags } = await supabase.from('tags').select('*').order('name')

  return (
    <div id="admin-tags" className="admin-tags p-8 max-w-4xl mx-auto">
      <div id="tags-header" className="tags-header mb-8">
        <h1 className="tags-title text-2xl font-bold text-black">Tags</h1>
        <p className="tags-subtitle text-gray-500 text-sm mt-1">Granular labels for faster search filtering.</p>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm mb-8">
        <form id="form-tag-new" action={createTag} className="form-tag-new flex gap-3">
          <input
            id="input-tag-name"
            name="name"
            required
            placeholder="e.g. cinematic, 4k, hyper-realistic"
            className="flex-1 px-5 py-3.5 border border-gray-200 rounded-2xl bg-gray-50 focus:outline-none focus:border-black focus:bg-white transition-all text-sm"
          />
          <button
            id="btn-tag-add"
            type="submit"
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-black text-white rounded-2xl text-sm font-semibold hover:bg-gray-800 transition-colors whitespace-nowrap"
          >
            <PlusCircle className="w-4 h-4" />
            Add Tag
          </button>
        </form>
      </div>

      <div id="tags-list" className="tags-list flex flex-wrap gap-2.5">
        {tags?.map(t => (
          <div key={t.id} id={`tag-item-${t.id}`} className="tag-item group flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 hover:border-gray-300 shadow-sm rounded-full transition-all">
            <span className="text-sm font-medium text-gray-700">{t.name}</span>
            <form action={deleteTag.bind(null, t.id)}>
              <button
                type="submit"
                className="tag-btn-delete w-5 h-5 flex items-center justify-center rounded-full text-gray-400 hover:text-white hover:bg-red-500 transition-colors"
                title="Delete Tag"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        ))}
        {(!tags || tags.length === 0) && (
          <div id="tags-empty" className="tags-empty w-full p-10 text-center text-gray-400">
            No tags yet.
          </div>
        )}
      </div>
    </div>
  )
}
