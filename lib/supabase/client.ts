import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.NEXT_PUBLIC_PUBLISHABLE_KEY! // ✅ FIXED!

  if (!url || !key) {
    console.error('❌ Missing Supabase environment variables:', { 
      hasUrl: !!url, 
      hasKey: !!key 
    })
    throw new Error('Missing Supabase environment variables')
  }

  console.log('✅ Creating Supabase browser client')
  
  return createBrowserClient(url, key)
}