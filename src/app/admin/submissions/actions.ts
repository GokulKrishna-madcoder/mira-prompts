'use server'

import { requireAdmin } from '@/lib/auth'
import { logAuditEvent } from '@/lib/audit/log'
import { revalidatePath } from 'next/cache'

export async function approveSubmission(id: string) {
  const { supabase, user } = await requireAdmin()

  const { error } = await supabase.from('prompts').update({
    status: 'published',
    published_at: new Date().toISOString(),
  }).eq('id', id)

  if (error) throw new Error(error.message)

  await logAuditEvent({
    actorUserId: user.id,
    action: 'prompt.publish',
    resourceType: 'prompt',
    resourceId: id,
    after: { status: 'published' },
  })

  revalidatePath('/admin/submissions')
  revalidatePath('/')
}

export async function rejectSubmission(id: string) {
  const { supabase, user } = await requireAdmin()

  const { error } = await supabase.from('prompts').update({
    status: 'draft',
  }).eq('id', id)

  if (error) throw new Error(error.message)

  await logAuditEvent({
    actorUserId: user.id,
    action: 'prompt.archive',
    resourceType: 'prompt',
    resourceId: id,
    after: { status: 'draft' },
  })

  revalidatePath('/admin/submissions')
}
