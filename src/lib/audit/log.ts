import { createClient } from '@supabase/supabase-js'
import { createHash } from 'crypto'

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export type AuditAction =
  | 'prompt.create'
  | 'prompt.update'
  | 'prompt.delete'
  | 'prompt.publish'
  | 'prompt.archive'
  | 'prompt.feature'
  | 'prompt.unfeature'
  | 'category.create'
  | 'category.delete'
  | 'tag.create'
  | 'tag.delete'
  | 'user.role_change'
  | 'user.ban'
  | 'user.unban'
  | 'ticket.resolve'
  | 'subscription.grant'
  | 'subscription.revoke'
  | 'plan.update'
  | 'refund.process'
  | 'payment_success'
  | 'payment_fail'
  | 'member.update_role'

export type AuditResourceType =
  | 'prompt'
  | 'category'
  | 'tag'
  | 'user'
  | 'profile'
  | 'ticket'
  | 'subscription'
  | 'plan'
  | 'refund'

export interface AuditLogParams {
  actorUserId?: string
  action: AuditAction
  resourceType: AuditResourceType
  resourceId?: string
  before?: Record<string, unknown>
  after?: Record<string, unknown>
  metadata?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
}

function hashIp(ip: string): string {
  return createHash('sha256').update(ip).digest('hex').slice(0, 16)
}

export async function logAuditEvent(params: AuditLogParams): Promise<void> {
  try {
    await admin.from('admin_audit_logs').insert({
      actor_user_id: params.actorUserId ?? null,
      action: params.action,
      resource_type: params.resourceType,
      resource_id: params.resourceId ?? null,
      before_data: params.before ?? null,
      after_data: params.after ?? null,
      metadata: params.metadata ?? {},
      ip_hash: params.ipAddress ? hashIp(params.ipAddress) : null,
      user_agent: params.userAgent ?? null,
    })
  } catch (err) {
    // Audit logging should never block the main operation
    console.error('[audit] Failed to log event:', err)
  }
}

export async function getAuditLogs(options: {
  resourceType?: AuditResourceType
  resourceId?: string
  actorUserId?: string
  limit?: number
  offset?: number
} = {}) {
  let query = admin
    .from('admin_audit_logs')
    .select('*, profiles!actor_user_id(display_name, avatar_url)')
    .order('created_at', { ascending: false })

  if (options.resourceType) {
    query = query.eq('resource_type', options.resourceType)
  }
  if (options.resourceId) {
    query = query.eq('resource_id', options.resourceId)
  }
  if (options.actorUserId) {
    query = query.eq('actor_user_id', options.actorUserId)
  }

  query = query.range(
    options.offset ?? 0,
    (options.offset ?? 0) + (options.limit ?? 50) - 1
  )

  const { data, error } = await query
  if (error) throw new Error(`Failed to fetch audit logs: ${error.message}`)
  return data
}
