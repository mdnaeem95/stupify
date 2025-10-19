import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get conversations expiring in the next 2 days
    const twoDaysFromNow = new Date();
    twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);

    const { data: conversations, error } = await supabase
      .from('conversations')
      .select('id, title, delete_after')
      .eq('user_id', user.id)
      .not('delete_after', 'is', null)
      .lte('delete_after', twoDaysFromNow.toISOString());

    if (error) {
      console.error('Failed to fetch expiring conversations:', error);
      return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
    }

    return NextResponse.json({
      count: conversations?.length || 0,
      conversations: conversations || [],
    });

  } catch (error) {
    console.error('Expiring conversations error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}