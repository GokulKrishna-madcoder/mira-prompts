import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  // PONYTAIL FIX: Don't wake up the database for anonymous users.
  // If there's no Supabase auth cookie, they aren't logged in. Skip the network call.
  const hasAuthCookie = request.cookies.getAll().some(c => c.name.startsWith('sb-'));
  
  if (!hasAuthCookie) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // PONYTAIL FIX: Graceful network timeout.
  // If Supabase takes longer than 3 seconds to respond, fail gracefully instead of crashing Vercel.
  try {
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Supabase network timeout')), 3000)
    );
    await Promise.race([
      supabase.auth.getUser(),
      timeoutPromise
    ]);
  } catch (error) {
    console.warn('Middleware Supabase Warning:', error);
    // Continue loading the page even if Supabase is slow, avoiding the 504 error.
  }

  return supabaseResponse
}
