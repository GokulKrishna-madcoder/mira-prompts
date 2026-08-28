'use client'

import { useState, useTransition } from 'react'
import { MoreVertical, Edit, Trash2 } from 'lucide-react'
import { deletePrompt } from '@/lib/user-actions'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function PostActions({ promptId, slug }: { promptId: string, slug: string }) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!window.confirm('Are you sure you want to delete this prompt? This action cannot be undone.')) return
    
    startTransition(async () => {
      const res = await deletePrompt(promptId)
      if (res?.error) alert(res.error)
      else router.refresh()
    })
  }

  return (
    <div className="relative" onMouseLeave={() => setOpen(false)}>
      <button 
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(!open) }}
        className="w-8 h-8 rounded-full flex items-center justify-center bg-white/80 backdrop-blur border border-gray-200 text-gray-700 hover:bg-white hover:text-black transition-colors"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-32 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20 animate-in fade-in zoom-in-95">
          <Link 
            href={`/posts/${promptId}/edit`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors w-full text-left"
          >
            <Edit className="w-4 h-4" />
            Edit
          </Link>
          <button 
            onClick={handleDelete}
            disabled={isPending}
            className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      )}
    </div>
  )
}
