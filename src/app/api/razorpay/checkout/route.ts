import { NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import { createClient } from '@/lib/supabase/server'

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
})

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { tier } = await req.json() // 'monthly', 'yearly', or 'lifetime'

    // NOTE: In a real production app, you would create these Plans in the Razorpay Dashboard 
    // and store their Plan IDs in your environment variables.
    // For this implementation, we assume you have:
    // RAZORPAY_PLAN_ID_MONTHLY="plan_XXXXX"
    // RAZORPAY_PLAN_ID_YEARLY="plan_YYYYY"

    if (tier === 'lifetime') {
      // LIFETIME -> One-time Order
      const amount = 2999 * 100 // ₹2999 in paise
      
      // Receipt max length is 40 chars. user.id is 36 chars, so we use a shorter hash.
      const shortId = user.id.slice(0, 8)
      
      const order = await razorpay.orders.create({
        amount,
        currency: 'INR',
        receipt: `rcpt_${shortId}_${Date.now()}`,
        notes: {
          userId: user.id,
          tier: 'lifetime'
        }
      })

      return NextResponse.json({ type: 'order', id: order.id, amount: order.amount })
    } 
    else if (tier === 'monthly' || tier === 'yearly') {
      // SUBSCRIPTION -> Recurring Plan
      const planId = tier === 'monthly' 
        ? process.env.RAZORPAY_PLAN_ID_MONTHLY 
        : process.env.RAZORPAY_PLAN_ID_YEARLY

      if (!planId) {
        return NextResponse.json({ error: 'Subscription plans not configured in env' }, { status: 500 })
      }

      const subscription = await razorpay.subscriptions.create({
        plan_id: planId,
        customer_notify: 1,
        total_count: tier === 'monthly' ? 120 : 10, // 10 years max
        notes: {
          userId: user.id,
          tier
        }
      })

      return NextResponse.json({ type: 'subscription', id: subscription.id })
    }

    return NextResponse.json({ error: 'Invalid tier' }, { status: 400 })

  } catch (error: any) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
