import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export function createClient(authToken?: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_PUBLISHABLE_KEY!

  if (authToken) {
    // Create client with custom auth header
    return createSupabaseClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }
    })
  }

  // Regular client without custom auth
  return createSupabaseClient(supabaseUrl, supabaseAnonKey)
}