import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/user/profile
 * Returns user's knowledge graph and profile data
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get knowledge graph
    const { data: knowledge, error: knowledgeError } = await supabase
      .from('user_knowledge_graph')
      .select('*')
      .eq('user_id', user.id)
      .order('questions_asked', { ascending: false })
      .limit(20);

    if (knowledgeError) throw knowledgeError;

    // Get total conversations
    const { count: totalConversations, error: convCountError } = await supabase
    .from('conversations')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);
    if (convCountError) throw convCountError;

    // Get conversation IDs
    const { data: userConversations, error: convError } = await supabase
    .from('conversations')
    .select('id')
    .eq('user_id', user.id);
    if (convError) throw convError;

    const conversationIds = userConversations?.map(c => c.id) || [];


// Get total messages
const { count: totalMessages, error: msgError } = await supabase
  .from('messages')
  .select('*', { count: 'exact', head: true })
  .in('conversation_id', conversationIds);
if (msgError) throw msgError;

    return NextResponse.json({
      userId: user.id,
      email: user.email,
      knownTopics: knowledge?.map(k => ({
        topic: k.topic,
        questionsAsked: k.questions_asked,
        understandingLevel: k.understanding_level,
        lastAskedAt: k.last_asked_at
      })) || [],
      totalConversations: totalConversations || 0,
      totalMessages: totalMessages || 0,
      createdAt: user.created_at
    });

  } catch (error) {
    console.error('Profile API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/user/profile
 * Update user preferences
 */
export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { preferredLevel } = body;

    // Update profile in profiles table
    const { error } = await supabase
      .from('profiles')
      .update({ 
        updated_at: new Date().toISOString(),
        // Add preferred_level column if it doesn't exist
      })
      .eq('id', user.id);

    if (error) throw error;

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Profile Update Error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}