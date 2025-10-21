import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  console.log('🔐 Auth callback received:', { code: code ? '✅' : '❌' });

  if (code) {
    const supabase = await createClient();
    
    // Exchange the code for a session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      console.log('✅ Email verified for:', data.user?.email);
      
      // ✅ Keep them logged in and redirect to chat
      return NextResponse.redirect(
        new URL('/chat', requestUrl.origin)
      );
    }
    
    console.error('❌ Code exchange failed:', error);
  }

  // If there's an error or no code, redirect to login
  return NextResponse.redirect(
    new URL('/login?error=verification_failed', requestUrl.origin)
  );
}