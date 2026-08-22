'use client'

import { deleteUser } from '@/lib/admin-actions'
import { Trash2 } from 'lucide-react'
import { useState } from 'react'

export function DeleteUserButton({ userId, email }: { userId: string, email: string }) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to permanently delete user:\n${email}\n\nThis cannot be undone.`)) {
      return
    }

    setIsDeleting(true)
    try {
      const res = await deleteUser(userId)
      if (!res.success) throw new Error('Delete failed')
    } catch (err: any) {
      alert(err.message || 'Failed to delete user')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 hover:text-red-700 transition-colors disabled:opacity-50"
      title="Delete User"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  )
}
