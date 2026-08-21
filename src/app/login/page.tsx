'use client'

import { signIn } from '@/lib/auth-actions'
import Link from 'next/link'
import Image from 'next/image'
import { useActionState } from 'react'
import { Mail, Lock, LogIn } from 'lucide-react'

export default function LoginPage() {
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      return await signIn(formData) ?? null
    },
    null
  )

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-red-50/50 via-white to-gray-100/80 relative overflow-hidden">
      
      {/* Decorative blurred background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-red-100/40 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-50/40 blur-[100px] pointer-events-none" />

      {/* Brand logo */}
      <Link href="/" className="absolute top-6 left-8 flex items-center hover:opacity-80 transition-opacity">
        <Image src="/brand/logo.png" alt="Mira Logo" width={44} height={44} className="object-contain w-auto h-auto" unoptimized />
      </Link>

      <div className="w-full max-w-[420px] bg-white/70 backdrop-blur-2xl border border-white/60 p-8 sm:p-10 rounded-[32px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] relative z-10">
        
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 bg-white shadow-sm border border-gray-100 rounded-2xl flex items-center justify-center mb-6">
            <LogIn className="w-6 h-6 text-gray-800" strokeWidth={2} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-2">Welcome back</h1>
          <p className="text-sm text-gray-500 font-medium leading-relaxed max-w-[280px]">
            Sign in to Mira Prompts. Discover and save your favorites.
          </p>
        </div>

        <form action={action} className="space-y-4">
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-black transition-colors">
              <Mail className="w-4 h-4" />
            </div>
            <input
              name="email" type="email" placeholder="Email" required
              className="w-full pl-11 pr-4 py-3.5 border border-gray-200/80 rounded-2xl bg-gray-50/50 focus:bg-white focus:outline-none focus:border-black focus:ring-4 focus:ring-black/5 transition-all text-sm font-medium text-gray-900 placeholder:text-gray-400"
            />
          </div>
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-black transition-colors">
              <Lock className="w-4 h-4" />
            </div>
            <input
              name="password" type="password" placeholder="Password" required minLength={6}
              className="w-full pl-11 pr-4 py-3.5 border border-gray-200/80 rounded-2xl bg-gray-50/50 focus:bg-white focus:outline-none focus:border-black focus:ring-4 focus:ring-black/5 transition-all text-sm font-medium text-gray-900 placeholder:text-gray-400"
            />
          </div>
          <div className="flex justify-end pt-1 pb-2">
            <Link href="/forgot-password" className="text-xs font-semibold text-gray-500 hover:text-black transition-colors">
              Forgot password?
            </Link>
          </div>
          {state?.error && (
            <div className="p-3 bg-red-50/80 text-red-600 border border-red-100 rounded-xl text-sm font-medium text-center">
              {state.error}
            </div>
          )}
          <button type="submit" disabled={pending}
            className="w-full py-4 bg-black text-white rounded-2xl text-sm font-bold shadow-lg shadow-black/10 hover:bg-gray-800 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50"
          >
            {pending ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 mb-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200/60"></div>
          <span className="text-xs font-medium text-gray-400 px-2">or</span>
          <div className="h-px flex-1 bg-gray-200/60"></div>
        </div>

        <form action="/auth/google" method="POST">
          <button type="button" onClick={async () => {
            const { signInWithGoogle } = await import('@/lib/auth-actions')
            await signInWithGoogle()
          }}
            className="w-full flex items-center justify-center gap-3 py-3.5 bg-white border border-gray-200/80 rounded-2xl hover:bg-gray-50 transition-colors shadow-sm font-semibold text-sm text-gray-700"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
        </form>
      </div>
      
      <p className="absolute bottom-8 text-sm text-gray-500 font-medium">
        Don't have an account? <Link href="/signup" className="text-black font-bold hover:underline transition-all">Sign up</Link>
      </p>
    </div>
  )
}
