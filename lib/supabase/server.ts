import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.NEXT_PUBLIC_PUBLISHABLE_KEY! // ✅ FIXED!

  if (!url || !key) {
    console.error('❌ Missing Supabase environment variables:', { 
      hasUrl: !!url, 
      hasKey: !!key 
    })
    throw new Error('Missing Supabase environment variables')
  }

  console.log('✅ Creating Supabase server client')

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch (error) {
          // Server component - can't set cookies
          console.warn('⚠️ Unable to set cookies in server component, skipping...', error)
        }
      },
    },
  })
}