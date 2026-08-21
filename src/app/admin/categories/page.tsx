import { createClient } from '@/lib/supabase/server'
import { createCategory, deleteCategory } from '@/lib/admin-actions'
import { PlusCircle, Trash2 } from 'lucide-react'

export default async function AdminCategoriesPage() {
  const supabase = await createClient()
  const { data: categories } = await supabase.from('categories').select('*').order('sort_order')

  return (
    <div id="admin-categories" className="admin-categories p-8 max-w-4xl mx-auto">
      <div id="categories-header" className="categories-header mb-8">
        <h1 className="categories-title text-2xl font-bold text-black">Categories</h1>
        <p className="categories-subtitle text-gray-500 text-sm mt-1">Organize your prompts into logical groups.</p>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm mb-8">
        <form id="form-category-new" action={createCategory} className="form-category-new flex flex-col sm:flex-row gap-3">
          <input
            id="input-category-name"
            name="name"
            required
            placeholder="Category Name"
            className="flex-1 px-5 py-3.5 border border-gray-200 rounded-2xl bg-gray-50 focus:outline-none focus:border-black focus:bg-white transition-all text-sm"
          />
          <input
            id="input-category-desc"
            name="description"
            placeholder="Description (optional)"
            className="flex-2 px-5 py-3.5 border border-gray-200 rounded-2xl bg-gray-50 focus:outline-none focus:border-black focus:bg-white transition-all text-sm"
          />
          <button
            id="btn-category-add"
            type="submit"
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-black text-white rounded-2xl text-sm font-semibold hover:bg-gray-800 transition-colors whitespace-nowrap"
          >
            <PlusCircle className="w-4 h-4" />
            Add Category
          </button>
        </form>
      </div>

      <div id="categories-list" className="categories-list flex flex-col gap-3">
        {categories?.map(c => (
          <div key={c.id} id={`category-item-${c.id}`} className="category-item flex items-center justify-between p-5 bg-white border border-gray-100 rounded-2xl hover:shadow-md transition-shadow group">
            <div className="category-info">
              <h3 className="category-name text-base font-semibold text-black">{c.name}</h3>
              {c.description && <p className="category-desc text-sm text-gray-400 mt-0.5">{c.description}</p>}
            </div>
            <form action={deleteCategory.bind(null, c.id)}>
              <button
                type="submit"
                className="category-btn-delete w-10 h-10 flex items-center justify-center rounded-full text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                title="Delete Category"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </form>
          </div>
        ))}
        {(!categories || categories.length === 0) && (
          <div id="categories-empty" className="categories-empty p-10 text-center text-gray-400">
            No categories yet.
          </div>
        )}
      </div>
    </div>
  )
}
