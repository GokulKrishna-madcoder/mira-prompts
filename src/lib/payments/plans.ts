import { createClient } from '@supabase/supabase-js'

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export type Plan = {
  id: string
  key: string
  name: string
  billing_interval: string | null
  amount: number
  currency: string
  razorpay_plan_id: string | null
  active: boolean
}

let cachedPlans: Plan[] | null = null

export async function getPlans(): Promise<Plan[]> {
  if (cachedPlans) return cachedPlans

  const { data, error } = await admin
    .from('subscription_plans')
    .select('*')
    .eq('active', true)
    .order('amount', { ascending: true })

  if (error) throw new Error(`Failed to fetch plans: ${error.message}`)
  cachedPlans = data as Plan[]
  return cachedPlans
}

export async function getPlanByKey(key: string): Promise<Plan | null> {
  const plans = await getPlans()
  return plans.find(p => p.key === key) ?? null
}

export async function getPlanById(id: string): Promise<Plan | null> {
  const plans = await getPlans()
  return plans.find(p => p.id === id) ?? null
}

export function formatPrice(amount: number, currency = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount / 100)
}
