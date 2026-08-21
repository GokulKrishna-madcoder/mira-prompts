import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'
import { trackEvent } from '@/lib/analytics/events'

// Webhooks MUST use the service role key to bypass RLS and update profiles reliably
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const rawBody = await req.text()
    const signature = req.headers.get('x-razorpay-signature')
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET

    if (!signature || !secret) {
      return NextResponse.json({ error: 'Invalid signature or secret missing' }, { status: 400 })
    }

    // Verify Signature
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex')

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const event = JSON.parse(rawBody)
    const { event: eventType, payload } = event

    // 1. Handle Lifetime (One-Time Order) Payment Success
    if (eventType === 'payment.captured') {
      const payment = payload.payment.entity
      const userId = payment.notes?.userId

      if (userId && payment.notes?.tier === 'lifetime') {
        // Prevent duplicate processing
        const { data: existing } = await supabase.from('payment_history').select('id').eq('razorpay_payment_id', payment.id).single()
        
        if (!existing) {
          // Log payment
          await supabase.from('payment_history').insert({
            user_id: userId,
            amount: payment.amount / 100,
            currency: payment.currency,
            razorpay_payment_id: payment.id,
            type: 'one-time',
            status: 'captured'
          })

          // Upgrade user to Lifetime
          await supabase.from('profiles').update({
            subscription_status: 'lifetime',
            subscription_tier: 'lifetime'
          }).eq('id', userId)

          trackEvent({ eventName: 'payment_success', userId, properties: { tier: 'lifetime', amount: payment.amount / 100 } }).catch(() => {})
          trackEvent({ eventName: 'subscription_start', userId, properties: { tier: 'lifetime' } }).catch(() => {})
        }
      }
    }

    // 2. Handle Subscription Success (Monthly/Yearly)
    if (eventType === 'subscription.charged') {
      const subscription = payload.subscription.entity
      const payment = payload.payment.entity
      const userId = subscription.notes?.userId
      const tier = subscription.notes?.tier

      if (userId) {
        const { data: existing } = await supabase.from('payment_history').select('id').eq('razorpay_payment_id', payment.id).single()
        
        if (!existing) {
          await supabase.from('payment_history').insert({
            user_id: userId,
            amount: payment.amount / 100,
            currency: payment.currency,
            razorpay_payment_id: payment.id,
            type: 'subscription',
            status: 'captured'
          })

          await supabase.from('profiles').update({
            subscription_status: 'active',
            subscription_tier: tier || 'monthly',
            razorpay_subscription_id: subscription.id,
            razorpay_customer_id: subscription.customer_id
          }).eq('id', userId)

          trackEvent({ eventName: 'payment_success', userId, properties: { tier, amount: payment.amount / 100 } }).catch(() => {})
          trackEvent({ eventName: 'subscription_start', userId, properties: { tier } }).catch(() => {})
        }
      }
    }

    // 3. Catch ALL Subscription Expirations & Failures
    const endEvents = ['subscription.halted', 'subscription.cancelled', 'subscription.completed', 'subscription.paused']
    if (endEvents.includes(eventType)) {
      const subscription = payload.subscription.entity
      const userId = subscription.notes?.userId

      if (userId) {
        // Set status to cancelled, instantly locking them out of premium prompts
        await supabase.from('profiles').update({
          subscription_status: 'cancelled'
        }).eq('id', userId)

        trackEvent({ eventName: 'subscription_cancel', userId, properties: { reason: eventType } }).catch(() => {})
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
