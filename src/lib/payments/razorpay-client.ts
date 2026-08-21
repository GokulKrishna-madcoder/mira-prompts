import crypto from 'crypto'

const keyId = process.env.RAZORPAY_KEY_ID!
const keySecret = process.env.RAZORPAY_KEY_SECRET!

export function verifyRazorpaySignature(
  payload: string,
  signature: string
): boolean {
  const expected = crypto
    .createHmac('sha256', keySecret)
    .update(payload)
    .digest('hex')
  return expected === signature
}

export function createRazorpayHeaders(): Record<string, string> {
  const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64')
  return { Authorization: `Basic ${auth}` }
}

export async function razorpayGet<T>(path: string): Promise<T> {
  const res = await fetch(`https://api.razorpay.com/v1${path}`, {
    headers: createRazorpayHeaders(),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Razorpay GET ${path} failed: ${err}`)
  }
  return res.json() as Promise<T>
}

export async function razorpayPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`https://api.razorpay.com/v1${path}`, {
    method: 'POST',
    headers: {
      ...createRazorpayHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Razorpay POST ${path} failed: ${err}`)
  }
  return res.json() as Promise<T>
}
