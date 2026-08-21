'use client'

import { resetPassword } from '@/lib/auth-actions'
import Link from 'next/link'
import Image from 'next/image'
import { useActionState } from 'react'
import { Mail, ArrowLeft } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string; success?: boolean } | null, formData: FormData) => {
      return await resetPassword(formData) ?? null
    },
    null
  )

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-red-50/50 via-white to-gray-100/80 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-red-100/40 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-50/40 blur-[100px] pointer-events-none" />

      <Link href="/" className="absolute top-6 left-8 flex items-center hover:opacity-80 transition-opacity">
        <Image src="/brand/logo.png" alt="Mira Logo" width={44} height={44} className="object-contain w-auto h-auto" unoptimized />
      </Link>

      <div className="w-full max-w-[420px] bg-white/70 backdrop-blur-2xl border border-white/60 p-8 sm:p-10 rounded-[32px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] relative z-10">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 bg-white shadow-sm border border-gray-100 rounded-2xl flex items-center justify-center mb-6">
            <Mail className="w-6 h-6 text-gray-800" strokeWidth={2} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-2">Reset your password</h1>
          <p className="text-sm text-gray-500 font-medium leading-relaxed max-w-[280px]">
            Enter your email and we'll send you a link to reset your password.
          </p>
        </div>

        {state?.success ? (
          <div className="text-center space-y-4">
            <div className="p-4 bg-green-50/80 text-green-700 border border-green-100 rounded-2xl text-sm font-semibold">
              Check your email! We sent you a password reset link.
            </div>
            <Link href="/login" className="inline-flex items-center gap-2 text-sm font-bold text-black hover:underline">
              <ArrowLeft className="w-4 h-4" /> Back to sign in
            </Link>
          </div>
        ) : (
          <form action={action} className="space-y-4">
            <div className="relative group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-black transition-colors">
                <Mail className="w-4 h-4" />
              </div>
              <input name="email" type="email" placeholder="Email" required
                className="w-full pl-11 pr-4 py-3.5 border border-gray-200/80 rounded-2xl bg-gray-50/50 focus:bg-white focus:outline-none focus:border-black focus:ring-4 focus:ring-black/5 transition-all text-sm font-medium text-gray-900 placeholder:text-gray-400"
              />
            </div>
            {state?.error && (
              <div className="p-3 bg-red-50/80 text-red-600 border border-red-100 rounded-xl text-sm font-medium text-center">
                {state.error}
              </div>
            )}
            <button type="submit" disabled={pending}
              className="w-full py-4 bg-black text-white rounded-2xl text-sm font-bold shadow-lg shadow-black/10 hover:bg-gray-800 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50"
            >
              {pending ? 'Sending...' : 'Send Reset Link'}
            </button>
            <div className="text-center">
              <Link href="/login" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-black transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to sign in
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
