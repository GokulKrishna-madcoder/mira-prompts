'use server'

import { requireUser } from '@/lib/auth'
import { verifyRazorpaySignature } from '@/lib/payments/razorpay-client'
import { logAuditEvent } from '@/lib/audit/log'
import { createClient } from '@supabase/supabase-js'

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function verifyPayment(
  type: 'order' | 'subscription',
  paymentId: string,
  entityId: string,
  signature: string,
  tier: string
) {
  const { user } = await requireUser()

  // 1. Verify signature
  const payload = type === 'subscription' 
    ? `${paymentId}|${entityId}`
    : `${entityId}|${paymentId}`

  if (!verifyRazorpaySignature(payload, signature)) {
    throw new Error('Invalid signature. Verification failed.')
  }

  // 2. Prevent duplicate processing
  const { data: existing } = await admin
    .from('payment_history')
    .select('id')
    .eq('razorpay_payment_id', paymentId)
    .single()

  if (!existing) {
    // 3. Log payment
    await admin.from('payment_history').insert({
      user_id: user.id,
      amount: type === 'order' ? 2999 : (tier === 'yearly' ? 999 : 99),
      currency: 'INR',
      razorpay_payment_id: paymentId,
      type: type === 'order' ? 'one-time' : 'subscription',
      status: 'captured'
    })

    // 4. Upgrade Profile
    await admin.from('profiles').update({
      subscription_status: type === 'order' ? 'lifetime' : 'active',
      subscription_tier: tier,
      ...(type === 'subscription' && { razorpay_subscription_id: entityId })
    }).eq('id', user.id)

    // 5. Audit log
    await logAuditEvent({
      actorUserId: user.id,
      action: 'payment_success',
      resourceType: 'subscription',
      after: { type, tier, paymentId },
    })
  }

  return { success: true }
}
