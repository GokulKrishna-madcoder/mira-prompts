# Implementation Plan: Pinterest-Style Inline Signup Section

## Objective
To replace the generic "Final CTA" at the bottom of the Landing Page with a highly immersive, high-converting inline Signup Section inspired directly by Pinterest's unauthenticated wall.

## 1. Architectural Placement
- **Location:** `src/components/home/LandingPage.tsx`.
- **Replacement:** This section will completely replace the "FINAL CTA" (`bg-gray-50`) section right above the `<Footer />`.

## 2. Design System & Styling (Tasteskill)
- **Background Aesthetics:** 
  - The background of the section will feature a stunning, dense masonry grid of AI images to build desire.
  - Over the images, a heavy dark gradient (`bg-black/60` to `bg-black/80`) will be layered so the text and floating signup card pop dramatically.
- **Left Column (Typography):**
  - **Headline:** Massive, ultra-bold white typography (`text-[5xl] md:text-[7xl] font-black leading-tight drop-shadow-2xl`).
  - *Copy:* "Sign up to get your prompts" (matching the reference "Sign up to get your ideas").
- **Right Column (Floating Signup Card):**
  - **Backdrop:** Pure white (`bg-white`), heavily rounded corners (`rounded-3xl` or `rounded-[32px]`), subtle shadow (`shadow-2xl`).
  - **Form Header:** Mira Logo centered, followed by "Welcome to Mira Prompts" and "Join for free to discover curated AI prompts".
  - **Inputs:** Minimalist, sleek inputs (`border-gray-300 rounded-full px-4 py-3`). Fields: Name, Email, Password.
  - **CTA Button:** Vibrant red pill (`bg-[#E60023] rounded-full text-white font-bold`).
  - **Disclaimer & Login Link:** Small gray text at the bottom matching the Pinterest legal style.

## 3. Technical Implementation (Secure Signup Flow)
Because `LandingPage.tsx` is a Client Component, we can directly import and utilize the existing Next.js Server Action (`signUp` from `@/lib/auth-actions`) using React's new `useActionState`.

```tsx
import { useActionState } from 'react'
import { signUp } from '@/lib/auth-actions'
import { Loader2 } from 'lucide-react'

// Inside LandingPage component:
const [state, formAction, pending] = useActionState(
  async (_prev: any, formData: FormData) => await signUp(formData) ?? null,
  null
)

// Inside the JSX:
<div className="bg-white rounded-[32px] shadow-2xl p-8 md:p-10 w-full max-w-md mx-auto relative z-10">
  
  <div className="flex flex-col items-center text-center mb-6">
    <Image src="/brand/logo.png" alt="Mira" width={48} height={48} className="rounded-xl mb-4" />
    <h3 className="text-2xl font-black text-black">Welcome to Mira Prompts</h3>
    <p className="text-sm text-gray-500 mt-1">Join for free to discover curated AI prompts</p>
  </div>

  {state?.success ? (
    <div className="bg-green-50 text-green-700 p-4 rounded-xl text-center">
      Check your email to verify your account!
    </div>
  ) : (
    <form action={formAction} className="flex flex-col gap-3">
      {state?.error && <div className="text-red-500 text-sm text-center">{state.error}</div>}
      
      <input name="name" type="text" placeholder="Your name" required className="border rounded-xl px-4 py-3" />
      <input name="email" type="email" placeholder="Email address" required className="border rounded-xl px-4 py-3" />
      <input name="password" type="password" placeholder="Create a password" required className="border rounded-xl px-4 py-3" />
      
      <button type="submit" disabled={pending} className="bg-[#E60023] text-white rounded-full py-3 font-bold mt-2 hover:bg-red-600 transition-colors flex justify-center">
        {pending ? <Loader2 className="animate-spin w-5 h-5" /> : 'Continue'}
      </button>

      <div className="text-center mt-4">
        <p className="text-xs text-gray-500 mb-2">Already have an account? <Link href="/login" className="text-black font-bold">Log in</Link></p>
        <p className="text-[10px] text-gray-400">By continuing, you agree to Mira Prompts' Terms of Service...</p>
      </div>
    </form>
  )}
</div>
```

## 4. Execution Plan
1. Add `useActionState` and import `signUp` in `LandingPage.tsx`.
2. Delete the old "FINAL CTA" section.
3. Construct the immersive background grid with the dark overlay.
4. Drop in the massive typography and the secure, fully-functional signup card.
5. Verify the form correctly executes the Supabase signup flow.

If this Pinterest-style implementation plan looks perfect, I will execute it in "caveman ultra" mode immediately!
