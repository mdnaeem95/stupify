import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { explanationId } = await request.json();

    if (!explanationId) {
      return NextResponse.json({ error: 'Missing explanation ID' }, { status: 400 });
    }

    const { error } = await supabase.rpc('increment_share_count', { expl_id: explanationId });

    if (error) {
      console.error('Error incrementing share count:', error);
      return NextResponse.json({ error: 'Failed to track share' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in share track API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
