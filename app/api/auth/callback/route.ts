import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = await createClient();
    
    // Exchange the code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      // Sign the user out after email verification
      // They need to sign in with their password
      await supabase.auth.signOut();
      
      // Redirect to login page with success message
      return NextResponse.redirect(
        new URL(`/login?verified=true`, requestUrl.origin)
      );
    }
  }

  // If there's an error or no code, redirect to login
  return NextResponse.redirect(new URL('/login?error=verification_failed', requestUrl.origin));
}