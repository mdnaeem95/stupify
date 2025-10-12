import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { messageId, rating, conversationId } = await req.json();

    if (!messageId || !rating || !conversationId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (rating !== 'up' && rating !== 'down') {
      return NextResponse.json(
        { error: 'Invalid rating' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    
    // Get user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Save rating
    const { data, error } = await supabase
      .from('analogy_ratings')
      .insert({
        user_id: user.id,
        conversation_id: conversationId,
        message_id: messageId,
        rating: rating,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });

  } catch (error) {
    console.error('Rating API Error:', error);
    return NextResponse.json(
      { error: 'Failed to save rating' },
      { status: 500 }
    );
  }
}