import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * Create Supabase client with JWT from Authorization header
 * Used for API routes that receive tokens from extensions
 */
export function createClientWithToken(token: string) {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_PUBLISHABLE_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    }
  );
}