import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      question,
      answer,
      simplicityLevel,
      conversationId,
      messageId,
      cardTheme = 'gradient',
    } = body;

    // Validate required fields
    if (!question || !answer || !simplicityLevel || !messageId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate simplicity level
    if (!['5yo', 'normal', 'advanced'].includes(simplicityLevel)) {
      return NextResponse.json(
        { error: 'Invalid simplicity level' },
        { status: 400 }
      );
    }

    // Check if this explanation is already saved
    const { data: existing } = await supabase
      .from('saved_explanations')
      .select('id')
      .eq('user_id', user.id)
      .eq('message_id', messageId)
      .single();

    if (existing) {
      // Already saved, return existing ID
      return NextResponse.json({ id: existing.id, alreadySaved: true });
    }

    // Save the explanation
    const { data, error } = await supabase
      .from('saved_explanations')
      .insert({
        user_id: user.id,
        conversation_id: conversationId || null,
        message_id: messageId,
        question,
        answer,
        simplicity_level: simplicityLevel,
        card_theme: cardTheme,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error saving explanation:', error);
      return NextResponse.json(
        { error: 'Failed to save explanation' },
        { status: 500 }
      );
    }

    return NextResponse.json({ id: data.id, alreadySaved: false });
  } catch (error) {
    console.error('Error in save explanation API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Fetch user's saved explanations
    const { data, error, count } = await supabase
      .from('saved_explanations')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching explanations:', error);
      return NextResponse.json(
        { error: 'Failed to fetch explanations' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      explanations: data,
      total: count,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error in fetch explanations API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}